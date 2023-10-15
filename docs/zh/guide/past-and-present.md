# 前世今生

`Gozz` 的诞生没有借鉴任何已有 Golang 工具 或是 对某某轮子的复刻，而是笔者多年来对 Golang 开发经验和沉淀总结的系统方法论具象化。

## 对更合理架构的追求

该工具的相关需求诞生于 2018 年附近，当时笔者在某集团内部系统技术团队，手上有一个数十万行级的单体系统的重构工作。

当时的代码大量充斥着一种写法，也是那个年代的 Golang 项目较为主流的一种写法：

对于某个模块的初始化

```go
package pkg

var (
	something     *Something
	somethingInit sync.Once
)

func GetSomething() *Something {
	somethingInit.Do(func() {
		...
	})
	return something
}
```

对于该模块的引用

```go
package pkg2

func DoSomething() {
	pkg.GetSomething().DoXXX()
}
```

而项目从 `API路由` / `路由服务绑定` / `领域服务` / `数据存储` 各层 以及各种数据库、连接池、三方依赖组件、配置加载
全部都使用以上模式的代码

当然，设计没有好坏只有适合和不适合。但这种代码组织模式，更适合在代码量较小的项目里，快速验证业务。

## 非显式依赖全局实体或函数

非显式依赖体现于：一个模块对另一个模块的依赖，只会在代码逻辑块中通过全局变量或函数引用体现。

而在项目结构、模块稍微复杂点的项目，一旦开发人员增多，这些隐式初始化的全局变量，以及通过全局函数调用的隐含依赖关系，就会变成导致代码质量急剧下降的破窗。

主要的影响会体现在以下几点：

1. 隐含依赖关系的不确定性，会更容易导致循环依赖。
2. 没有清晰的接口和分层依赖关系，导致业务和代码可读性差，新人学习成本大。
3. 模块非接口化暴露，对模块功能没有具象化描述，模块间界限也极其模糊和脆弱。
4. 组件可全局引用，导致其他水平欠缺的开发人员容易不规范调用及混淆层级。
5. 全局变量引用的组件实例在进行功能测试时更难进行 Mock 或 埋点替换。
6. 对项目的技术性优化和建设，也会因为这些不确定的对象引用导致难以进行。

除此之外，组件和配置的不确定性和非显式前置初始化，也会对开发调试和生产运维带来更多隐患。

这些负面影响，导致项目质量随着功能需求、开发人员的迭代不断地下滑，严重影响项目开发的推进和增加变更不确定性，同时也影响了开发团队的积极性。

## 显式依赖接口 + 依赖注入

当时笔者对该系统重构落地的第一个优化，就是将模块服务进行实体类聚合，并抽象为接口，
最终通过显式接口依赖组装服务实体。同时调研依赖注入工具来维护这些实体和接口的构造和组合。

如将原来风格代码：

```go
// 应用入口
package main

var Engine *gin.Engine

func init() {
	Engine.GET("/user", api.GetUser)
}

// API路由层
package api

func GetUser(c *gin.Context) {
	// 初始化参数
	var param svcuser.QueryUser

	// 绑定校验参数
	if err := c.ShouldBind(c); err != nil {
		pkg.Response(c, nil, err, http.StatusBadRequest)
		return
	}

	// 调起服务
	ret, err := svcuser.GetUser(param)
	if err != nil {
		pkg.Response(c, nil, err, http.StatusInternalServerError)
		return
	}

	// 返回值
	pkg.Response(c, ret, nil, http.StatusOK)
}

// 服务层
package svcuser

func GetUser(query QueryUser) (User, error) {
	...
}

```

重构为

```go
// 应用入口
package main

type Application struct {
	*gin.Engine
}

// 组装接口 
func (app Application) RegisterUserController(ctl UserController) {
	ctl.RegisterRouter(app.Engine)
}

// 领域模型定义层
package service

// 定义各层接口和上下文类型
type (
	UserService interface {
		GetUser(QueryUser) (User, error)
	}

	UserController interface {
		RegisterRouter(router gin.IRouter)
	}

	Controller interface {
		Response(c *gin.Context, data interface{}, err error, status int)
	}
)

// API层
package api

// 实现接口
type UserControllerImpl struct {
	service.Controller
	service.UserService
}

func (impl *UserControllerImpl) RegisterRouter(router gin.IRouter) {
	router.GET("/user", impl.GetUser)
	...
}

func (impl *UserControllerImpl) GetUser(c *gin.Context) {
	// 初始化参数
	var param service.QueryUser

	// 绑定校验参数
	if err := c.ShouldBind(c); err != nil {
		impl.Response(c, nil, err, 400)
		return
	}

	// 调起服务
	ret, err := impl.UserService.GetUser(param)
	if err != nil {
		impl.Response(c, nil, err, 500)
		return
	}

	// 返回值
	impl.Response(c, ret, nil, 200)
}

// 服务实现
package svcimpls

// 实现 service.UserService
type UserServiceImpl struct {
	// 下层依赖
	db.SqlConn
	dao.UserDao
}

func (impl *UserControllerImpl) GetUser(query service.QueryUser) (service.User, error) {
	...
}

```

这种变更可以概括为：

通过独立 `Interface` 及 上下文实体类型定义，描述并约束每个模块的职责范围，同时约束不同层级交互所使用的上下文实体，
`Implement` 通过显式依赖下层接口，最终呈现树状化依赖图。

##### *这种代码架构组织的模式实例可以参考另一个优秀的项目 [drone](https://github.com/harness/gitness/tree/drone)*

## 接口设计和依赖注入工具化

通过这种组织模式让开发在设计代码前能够主动地去思考每个模块提供的服务和依赖，形成标准化服务意识，项目负责人也能够提前对各层接口进行Review，提前发现隐患和优化规范。

然而，引入新的规范，也会增加开发人员的学习成本和维护负担，如果不提供系统性的工具去统一规范，
在人员素质参差的团队中，一旦出现误用的破窗，随着迭代的累积，也只是会成为又一个遗留技术债务。

为了快速落地和推广基于 显式接口依赖 和 依赖注入 的模式，笔者曾为团队提供了两个小工具，也是 `Gozz` 项目的雏形：

1. 快速生成 `Interface` 实现模版到指定目录

2. 通过注解自动化收集被注解元素，生成 `wire`
   集合和实例化入口文件 ( 后开源为 [go-autowire](https://github.com/Just-maple/go-autowire) )

这两个工具最初是各自独立的小脚本，实现上粗浅地使用了正则和模版，
但已对当前的项目重构以及后续的迭代规范起到了非常关键的作用，解放了团队维护项目架构和后续开发的心智负担。

## 切面化 API Controller

随着代码架构设计规范落地，技术团队也迎来了快速迭代的周期，当时面临的另一个问题就是：API层的代码规范。

尽管我们提供了很多的工具类或函数去让开发们用更少的代码去完成API层的代码开发，但是依然会有各种各样的误用或者疏忽产生。

包括 `Context`传递，错误处理，参数绑定，参数验证，返回格式等等。

如下有一个很常见的 基于 `gin` 的 Controller 逻辑：

```go
package api

func (i Controller) GetUser(c *gin.Context) {
	// 实例化参数
	var query QueryUser
	// 绑定参数
	if err := i.ShouldBind(c, &query); err != nil {
		// 参数错误处理
		i.Response(c, nil, err)
		return
	}
	// 调起服务
	ret, err := i.UserService.GetUser(c.Request.Context(), query)
	if err != nil {
		// 服务错误处理
		i.Response(c, nil, err)
		return
	}
	// 返回值
	i.Response(c, ret, nil)
}

```

但很多技术团队在使用时经常也会因为很多细微的写法出现预料之外的情况

如将

```go
i.ShouldBind(c, &query)
```

写成了

```go
i.Bind(c, &query)
```

再比如

```go
ret, err := i.UserService.GetUser(c.Request.Context(), query)
```

写成了

```go
ret, err := i.UserService.GetUser(c, query)
```

再比如有的团队为了代码美观，也会使用以下的写法

```go
package api

func (i Controller) GetUser(c *gin.Context) {
	var query QueryUser
	var err error
	var ret interface{}

	defer func() { i.Response(c, ret, err) }()

	if err = i.ShouldBind(c, &query); err != nil {
		return
	}
	ret, err = i.UserService.GetUser(c.Request.Context(), query)
}
```

这几个错误案例的存在的问题都是相对隐秘，没有对框架有较深理解会难以排查，但事故后果都可能是非常严重的，但是它们却非常地常见于各个企业内的技术团队。

这些隐患本质也不是 `gin` 的问题，无论你的技术团队用的是什么Web框架。只要开发过程中每个开发者都有可能会接触到
`API Controller` 层的代码，且有人对框架不熟悉，你的团队都会面临类似的问题。

---

为了减轻开发和评审负担，省去额外质量维护的成本，笔者为团队提供了一个基于运行时的适配器组件，
用以转接所有 `API Controller` 到 `Service` 层的调用。

开发者在进行 `API Controller` 和 `Service` 绑定时，只需要

```go
package api

type HandlerWrapper func(fn interface{}) func(c *gin.Context)

func (impl *UserControllerImpl) RegisterRouter(wrap HandlerWrapper, router gin.IRouter) {
	router.GET("/user", wrap(impl.UserService.GetUser))
	...
}
```

`HandlerWrapper` 可以接受任意的 函数 作为参数，并转化为一个可以提供给 对应Web框架 进行API路由注册的 `Handler`。

要实例化一个转接适配器，需要确定两个事情：

1. Web框架 的上下文，将会被怎样绑定到给到的参数上
2. Web框架 处理要怎么处理 服务处理的返回值 以及 可能返回的错误

因此 只需要提供一个 `Controller` 类型， 我们就可以通过 `reflect` 去主动感知 `Service` 的方法参数类型，以及借助 `Interface`
特性，去自动化地提供一个对该 `Service.Method` 专用的 `API Controller`。

```go
package api

type Controller interface {
	// 处理参数绑定逻辑
	Params(c *gin.Context, params ...interface{}) (err error)
	// 处理错误或返回值逻辑
	Response(c *gin.Context, data interface{}, err error)
}

type HandlerWrapper func(fn interface{}) func(c *gin.Context)

func InitController(controller Controller) HandlerWrapper {
	...
}
```

最核心的 `InitController` 则由对框架比较熟悉的人进行设计，业务接入时，
只需要按照API风格确定 `Controller` 对参数返回值的处理逻辑，
其他开发日常过程中已经不再需要手动去开发类似之前的 `API Controller` 。

在[最初的实现中](https://github.com/Just-maple/svc2handler),
使用 `reflect` 去做 `service.Interface.Method` 的参数分配 和  `service.Interface.Method` 的调用，
因此会有一定的性能损耗。

但通过这种方式实现的 `API Controller` 的接口参数和返回值，
将会具备非常明显的 [DuckTyping](https://en.wikipedia.org/wiki/Duck_typing) 特质，
也很容易对某些需求进行统一化处理。

生产实践中对于同业务线下的项目，也希望API参数和返回值风格都得到统一，
同时，对Web框架的屏蔽，也有利于提升 `Service` 层的复用和独立性。这些特质也是大部分业务场景需要的。

因此我们在平衡性能和开发效率以及可长期迭代性之后，因 `reflect` 带来的一点损耗 其实也相对微不足道。
其实我们在使用一些 Web框架 进行参数解析绑定时，已经无可避免会引入 `reflect` 的损耗。

## 基于注解生成 API 路由表

对于如下形式的API层路由绑定代码

```go
package api

func (impl *UserControllerImpl) RegisterRouter(wrap HandlerWrapper, router gin.IRouter) {
	router.GET("/user", wrap(impl.UserService.GetUser))
	router.POST("/user", wrap(impl.UserService.NewUser))
	router.DELETE("/user", wrap(impl.UserService.DeleteUser))
	...
}

```

可见，已经明显是十分模板化的代码，因此笔者也给团队提供了对应的[代码生成工具](https://github.com/Just-maple/annotation-service)，
可以使用 `Service` 层的接口定义，进行自动化API路由服务表生成。

如以下例子，可以生成上述API层路由绑定代码

```go
package api

type (
	// @service(user)
	UserService interface {
		// @http(method=get,route="")
		GetUser(ctx context.Context, query QueryUser) (u User, err error)
		// @http(method=post,route="")
		NewUser(ctx context.Context, form FormUser) (u User, err error)
		// @http(method=delete,route="")
		DeleteUser(ctx context.Context, query QueryUser) (u User, err error)
	}
)

```

##### 此时的注解语法风格借鉴了 `JAVA Spring`。

这些工具和模式的落地效果，也在后续一些新立项的C端系统中得到了全面的验证，使用该模式进行的团队协作API开发效率远超以往的方式，
同时在项目架构设计以及代码质量上，也可以看到非常明显的人效提升。
除此之外，团队开发们在搭建一个新的服务或者接手其他的项目时，已经不需要额外花费架构和API风格上的理解或构思成本。

`gozz:api` 在生成API路由表时，相对于以前的雏形实现最大的不同在于，默认模版将会生成Web框架无关的API路由表，
开发可以使用这份路由表进行二次开发适配更多不同的Web框架，或独立地生成如 `Swagger` 或 `OpenAPI` 等API接口文档以及测试用例。
