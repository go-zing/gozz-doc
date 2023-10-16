---
home: true
actionText: 快速上手 →
actionLink: ./guide/getting-started
features:
  - title: 简洁易用、无侵入
    details: 在代码添加注释注解就能使用，注解语法直观，命令行参数简约，无其他运行时侵入依赖库。
  - title: 内置强大插件
    details: 提供 自动化依赖注入、AOP接口代理、Interface -> Implement 生成同步、ORM结构体、API路由映射表 等内置插件。
  - title: 可定制高拓展性
    details: 代码生成模版可自定义，内核提供代码分析、编辑、生成等工具库，可通过 .so 扩展外部插件。
footer: Apache-2.0 license | Copyright © 2023-present Maple Wu
---

### 一个从 0 到 1 的简单业务场景示例 体现 `Gozz` 的强大

在我们进行业务开发时，会经常遇到业务领域的接口设计

``` 
~ % tree bookstore

bookstore
├── go.mod
└── types
    └── book.go
```

```go
// types/book.go
package types

import (
	"context"
	"time"
)

// 书籍服务接口
type BookService interface {
	// 获取书籍
	GetBook(ctx context.Context, param QueryBook) (book Book, err error)
	// 获取书籍列表
	ListBook(ctx context.Context, param QueryListBook) (books ListBook, err error)
	// 编辑书籍
	EditBook(ctx context.Context, form FormBook) (book Book, err error)
	// 新建书籍
	NewBook(ctx context.Context, form FormBook) (book Book, err error)
}

type (
	// 书籍查询参数
	QueryBook struct {
		// 查询指定ID
		Id int
	}

	// 书籍列表查询参数
	QueryListBook struct {
		// 查询关键字
		Keyword string
		// 查询页数
		PageNo int
		// 查询分页
		PageCount int
	}

	// 书籍列表
	ListBook struct {
		// 总数
		Total int
		// 列表
		List []Book
	}

	// 书籍新建或编辑表单
	FormBook struct {
		// ID
		Id int
		// 标题
		Title string
		// 作者
		Author string
		// 描述
		Description string
	}

	Book struct {
		// 从表单继承
		FormBook
		// 创建时间
		CreatedAt time.Time
		// 创建人
		CreatedBy string
		// 更新时间
		UpdatedAt time.Time
		// 更新人
		UpdatedBt string
	}
)

```

在接口设计完成后 为了使设计的接口能够提供服务 我们还需要进行以下主要工作：

1. 将 接口 进行实现，提供 `Implement` 对象
2. 将 接口 接口参数 接口调用 和 `API Controller` 进行耦合，以提供服务
3. 构造 接口实现 并作为 接口依赖 提供给 `API Controller`
4. 填充 结构体字段标签 以在 `API Controller` 实现接口 参数值和返回值 通过反射类库快速和网络层进行编解码映射
5. 将 接口 和 结构体 上的注释和说明 同步到对其他职能对接的 接口文档

而这些工作，实际上并不是只需要完成一次，就能够一劳永逸

随着生产业务需求的变更和迭代发展，接口也会不断地进行迭代和更新， 这些变更同时也会导致我们需要重新进行上述工作

---

#### 通过注释注解使用 `gozz`

注释注解的语法规则 借鉴了 `Python` 和 `K8s` 部分相关工具

`+zz:${plugin}:${args_1}:...:${args_n}:${key_a=value_1}:...:${key_n=value_n}`

固定以 `+zz:${plugin}` 开头 然后 以 `:` 间隔若干参数

插件会指定必填的 `args` 参数顺序数量  *如 `+zz:api:${filename}` 即固定第一个参数用作 `filename`*

达不到插件指定的 `args` 数量的注解会被视为无效注解  *如 `+zz:api`*

指定数量后的参数 会被判定为 `key-value` 参数  *如 `+zz:api:/:auth=required:public`*

具体的插件和参数说明可以执行 `gozz list` 查看

---

在上述的接口定义文件中 我们添加一些注解

```go
// types/book.go
package types

// 书籍服务接口
// +zz:impl:/impls:wire
// +zz:api:/apis:prefix=books
// +zz:doc
type BookService interface {
	// 获取指定书籍
	// +zz:api:get:{id}
	GetBook(ctx context.Context, param QueryBook) (book Book, err error)
	// 获取书籍列表
	// +zz:api:get
	ListBook(ctx context.Context, param QueryListBook) (books ListBook, err error)
	// 编辑书籍
	// +zz:api:put:{id}
	EditBook(ctx context.Context, form FormBook) (book Book, err error)
	// 新建书籍
	// +zz:api:post
	NewBook(ctx context.Context, form FormBook) (book Book, err error)
}

// +zz:doc
// +zz:tag:json:{{ snake .FieldName }}
type (
	// 书籍查询参数
	QueryBook struct {
		// 查询指定ID
		Id int
	}
...

```

##### 注: *为节约篇幅 部分代码会使用 `...` 省略 下同*

再使用 `gozz` 略施魔法

```shell
gozz run -p "impl" -p "doc" -p "tag" -p "api" ./
```

项目目录会生成一些文件

```
~ % tree bookstore

bookstore
├── apis
│   ├── zzgen.api.go
│   └── zzgen.api.go.tmpl
├── go.mod
├── impls
│   └── impl.go
└── types
    ├── book.go
    ├── zzgen.doc.go
    └── zzgen.doc.go.tmpl

```

---

#### 结构体字段标签

在原接口定义文件内 结构体字段的标签 已经按照注解 模版格式全部添加

```go
// types/book.go

package types

...

// +zz:tag:json:{{ snake .FieldName }}
type (
	// 书籍查询参数
	QueryBook struct {
		// 查询指定ID
		Id int `json:"id"`
	}

	// 书籍列表查询参数
	QueryListBook struct {
		// 查询关键字
		Keyword string `json:"keyword"`
		// 查询页数
		PageNo int `json:"page_no"`
		// 查询分页
		PageCount int `json:"page_count"`
	}
...

```

`gozz` 同时提供 `snake` `camel` `kebab` `upper` ... 等模版方法 进行其他格式的生成 也支持对部分 结构体 或 字段 进行额外定制化

例:

```go
package x

import (
	"time"
)

// +zz:tag:json:{{ camel .FieldName }}
type (
	T1 struct {
		CreatedBy string    `json:"createdBy"`
		CreatedAt time.Time `json:"createdAt"`
	}

	T2 struct {
		CreatedBy string `json:"createdBy"`
		// +zz:tag:json:{{ kebab .FieldName }}
		CreatedAt time.Time `json:"created-at"`
	}

	// +zz:tag:json:{{ snake .FieldName }}
	T3 struct {
		CreatedBy string `json:"created_by"`
		// +zz:tag:+json:,omitempty
		CreatedAt time.Time `json:"created_at,omitempty"`
	}
)

// +zz:tag:json,form:{{ .FieldName }}
type T4 struct {
	CreatedBy string    `json:"CreatedBy" form:"CreatedBy"`
	CreatedAt time.Time `json:"CreatedAt" form:"CreatedAt"`
}

```

---

#### Interface -> Implement 生成 及 签名同步

在 `impls/impl.go` 可以看到由 `+zz:impl:/impls:wire` 注解生成的 接口实现定义 和 接口方法

```go
// impls/impl.go

package impls

import (
	"context"

	"github.com/go-zing/gozz-doc-examples/bookstore/types"
)

var (
	_ types.BookService = (*BookServiceImpl)(nil)
)

// +zz:wire:bind=types.BookService
type BookServiceImpl struct{}
...

func (impl *BookServiceImpl) NewBook(ctx context.Context, form types.FormBook) (book types.Book, err error) {
	panic("not implemented")
}

...

```

假设我们在需求发生变更后，对接口的方法签名进行了一定修改，如:

1. 修改 `NewBook` 的参数为 `FormNewBook` 修改返回值 为 `id` 整数
2. 添加新方法 `DeleteBook`

```go
// types/book.go
package types

type BookService interface {
	// ...

	// 新建书籍
	// +zz:api:post:
	NewBook(ctx context.Context, form FormNewBook) (id int, err error)
	// 删除书籍
	// +zz:api:delete:{id}
	Delete(ctx context.Context, query QueryBook) (updated bool, err error)
}

```

再次运行 `gozz run -p "impl" ./`

可以看到 在 `impls/impl.go` 文件内 原 `BookServiceImpl.NewBook` 方法签名 被自动同步为最新的接口定义 且不对原函数人工补充内容产生影响

另外 缺少的 `BookServiceImpl.Delete` 方法 也会在文件下方补充生成实现

```go
// impls/impl.go 

package impls

...

func (impl *BookServiceImpl) NewBook(ctx context.Context, form types.FormNewBook) (id int, err error) {
	// 一些人工添加的实现逻辑 不应该被覆盖或删除
	...
}

func (impl *BookServiceImpl) Delete(ctx context.Context, query types.QueryBook) (updated bool, err error) {
	panic("not implemented")
}

```

---

#### API 路由表 及 API 调起接口方法绑定

在 `apis/zzgen.api.go` 文件 可以看到由 `+zz:api:/apis:prefix=books` 注解生成的 API 路由表 及 API 调起接口方法绑定

对 Golang 类型和类型 有一定深入了解的 Gopher 应该可以敏锐地发现

使用以下生成的内容 只需要提供一个 Web框架 和 `Apis.Range` 的适配层 可以快速地完成所有 API路由 和 服务实现层 绑定

```go
// apis/zzgen.api.go

// Code generated by gozz:api github.com/go-zing/gozz. DO NOT EDIT.

package apis

import (
	"context"

	"github.com/go-zing/gozz-doc-examples/bookstore/types"
)

var _ = context.Context(nil)

type Apis struct {
	Types_BookService types.BookService
}

func (s Apis) Range(fn func(interface{}, []map[string]interface{})) {
	for _, f := range []func() (interface{}, []map[string]interface{}){
		s._Types_BookService,
	} {
		fn(f())
	}
}

func (s Apis) _Types_BookService() (interface{}, []map[string]interface{}) {
	t := s.Types_BookService
	return &t, []map[string]interface{}{
		{
			"name":     "GetBook",
			"method":   "get",
			"resource": "{id}",
			"options": map[string]string{
				"prefix": "books",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in types.QueryBook
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.GetBook(ctx, in)
			},
		},

		...
	}
}

```

---

#### 类型 / 字段 / 变量 / 常量 注释表

在 `types/zzgen.doc.go` 可以看到由 `+zz:doc` 注解生成的 类型 及 类型字段 注释表

在代码中的 非注解注释 都被收集和整理 提供了一种在运行时通过类型和反射获取代码注释的能力

```go
// types/zzgen.doc.go

// Code generated by gozz:doc github.com/go-zing/gozz. DO NOT EDIT.

package types

var (
	_types_doc = map[interface{}]map[string]string{
		(*BookService)(nil): _doc_BookService,

		(*QueryBook)(nil):     _doc_QueryBook,
		(*QueryListBook)(nil): _doc_QueryListBook,
		(*ListBook)(nil):      _doc_ListBook,
		(*FormBook)(nil):      _doc_FormBook,
		(*Book)(nil):          _doc_Book,
	}

	_values_doc = map[string]map[interface{}]string{}
)

var _doc_BookService = map[string]string{
	"":         "书籍服务接口",
	"GetBook":  "获取指定书籍",
	"ListBook": "获取书籍列表",
	"EditBook": "编辑书籍",
	"NewBook":  "新建书籍",
}

var _doc_QueryBook = map[string]string{
	"":   "书籍查询参数",
	"Id": "查询指定ID",
}

func (QueryBook) FieldDoc(f string) string { return _doc_QueryBook[f] }

var _doc_QueryListBook = map[string]string{
	"":          "书籍列表查询参数",
	"Keyword":   "查询关键字",
	"PageNo":    "查询页数",
	"PageCount": "查询分页",
}

func (QueryListBook) FieldDoc(f string) string { return _doc_QueryListBook[f] }

...

```

---

#### 类型表 路由表 联动

相信敏锐的 Gopher 已经察觉到

`/apis/zzgen.api.go` 和 `/types/zzgen.doc.go` 两文件 已经包含了解释 项目内所有API接口 的基本要素

利用 `reflect` 和 `interface` 机制 只要添加部分全局规则 就可以自动化生成输出 `OpenAPI` 或 `Swagger` 接口文档。

并且通过此方式生成的代码 会达到和代码注释的深度绑定 实现 `一处收敛变更 多处同步生效`

#### 自定义模版

`gozz` 会上述代码文件同目录下 生成 `/apis/zzgen.api.go.tmpl` 和 `/types/zzgen.doc.go.tmpl` 两模版文件

若用户希望对生成的 `/apis/zzgen.api.go` 和 `/types/zzgen.doc.go` 添加额外的生成内容 或 修改生成代码的命名或可见性

都可以自定义修改模版文件，然后重新进行生成

##### 注: *`gozz` 在生成目标文件目录已有 `${filename}.tmpl` 文件时 会优先使用 模版文件进行生成*

--- 

#### 基于 [wire](https://github.com/google/wire) 的自动化依赖注入

最后需要将 `/apis/zzgen.api.go` 中的 `Apis` 和 `HTTP控制器` 以及 `HTTP服务器` 进行绑定以提供 HTTP服务

在项目根目录 创建 `app.go`

```go
// app.go

package main

import (
	"net/http"

	"github.com/go-zing/gozz-doc-examples/bookstore/apis"
)

// 根应用入口
type Application struct {
	ApisProvider
	HttpController
}

// 对 apis.Apis 的类型引用
type Apis = apis.Apis

// 作为 apis.Apis 的抽象 提供给 HttpController 进行 API路由服务绑定
type ApisProvider interface {
	Range(fn func(interface{}, []map[string]interface{}))
}

// 作为 HTTP控制器 的抽象 将 apis.Apis 解析提供为 http.Handler
type HttpController interface {
	Handle(ApisProvider) http.Handler
}

func ProvideHttpController() (controller HttpController) {
	// ... 此处省略实现
	return
}

// 组装并挂载 http.Handler 监听端口 提供服务
func (app *Application) Run() (err error) {
	handler := app.Handle(app.ApisProvider)
	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}
	return server.ListenAndServe()
}

func main() {
	// TODO: new Application and Run
}
```

需要做的剩余工作 是将之前生成的各种类型 通过依赖关系进行构造和接口实现绑定

最终得到一个 `Application` 根应用入口对象 在 `main` 里 `Run` 起来

在上述文件里加上一点点注解

```go
package main

import (
	"net/http"

	"github.com/go-zing/gozz-doc-examples/bookstore/apis"
)

// +zz:wire:inject=/
type Application struct {
	ApisProvider
	HttpController
}

// +zz:wire:bind=ApisProvider:struct
type Apis = apis.Apis

type ApisProvider interface {
	Range(fn func(interface{}, []map[string]interface{}))
}

// +zz:wire
type HttpController interface {
	Handle(ApisProvider) http.Handler
}

// impls.BookServiceImpl 接口实现类型 在生成时 自动被添加了 `+zz:wire:bind=types.BookService`
...
```

执行 `gozz run -p "wire" ./`

可以看到项目根目录下生成了 前缀 `wire_*` 的若干文件

```
├── apis
│   ├── zzgen.api.go
│   └── zzgen.api.go.tmpl
├── app.go
├── go.mod
├── go.sum
├── impls
│   └── impl.go
├── types
│   ├── book.go
│   ├── zzgen.doc.go
│   └── zzgen.doc.go.tmpl
├── wire_gen.go
├── wire_zinject.go
└── wire_zset.go
```

其中：

- `wire_zset.go` 包含了 使用 `wire` 进行依赖注入的对象 `Set`
- `wire_zinject.go` 包含了 使用 `wire` 进行目标对象构造 的 `Initialize` 定义
- `wire_gen.go` 包含了实例化 `Application` 最终的目标应用入口

```go
// wire_gen.go
package main

func Initialize_Application() (*Application, func(), error) {
	bookServiceImpl := &impls.BookServiceImpl{}
	apis := &Apis{
		Types_BookService: bookServiceImpl,
	}
	httpController := ProvideHttpController()
	application := &Application{
		ApisProvider:   apis,
		HttpController: httpController,
	}
	return application, func() {
	}, nil
}

```

#### `gozz:wire` 和原生 `wire` 的区别

使用原生 `wire` 进行依赖注入时 需要用户显式地在代码中维护 各种 `Set` 以及 类型提供声明

如 上述例子中 `wire_zset.go` 中的自动生成内容 实际在使用 原生 `wire` 时 是需要用户自己维护的

```go
// wire_zset.go

package main

var (
	_Set = wire.NewSet(
		// github.com/go-zing/gozz-doc-examples/bookstore.Apis
		wire.Bind(new(ApisProvider), new(*Apis)),
		wire.Struct(new(Apis), "*"),

		// github.com/go-zing/gozz-doc-examples/bookstore.Application
		wire.Struct(new(Application), "*"),

		// github.com/go-zing/gozz-doc-examples/bookstore.HttpController
		ProvideHttpController,

		// github.com/go-zing/gozz-doc-examples/bookstore/impls.BookServiceImpl
		wire.Bind(new(types.BookService), new(*impls.BookServiceImpl)),
		wire.Struct(new(impls.BookServiceImpl), "*"),
	)
)

```

而 `gozz:wire` 使用注解 让用户免于学习和维护这些声明 自动化地收集所有相关注解类型

根据类型定义 提供自动化代码生成的依赖注入 达到更快捷、更简约、更低心智成本的实践

--- 

#### 给接口加上AOP

在从 `types/book.go` 生成 `impls/impl.go` 接口文件时 由于使用 `wire` 选项

```go
// +zz:impl:/impls:wire
type BookService interface{
...
```

生成实现类型时 会自动添加 `wire` 模块的 接口实现绑定注解

```go
// +zz:wire:bind=types.BookService
type BookServiceImpl struct{
...
```

在实现类型的 `wire` 注解上添加 `aop` 选项 重新运行 `gozz run -p "wire" ./`

```go
// +zz:wire:bind=types.BookService:aop
type BookServiceImpl struct{
...
```

可见 生成的 `wire_gen.go` 对于 `bookServiceImpl` 的注入发生了变化 注意看代码块中添加的注释

```go
// wire_gen.go

package main

func Initialize_Application() (*Application, func(), error) {
	bookServiceImpl := &impls.BookServiceImpl{}

	// impls.BookServiceImpl 不会直接绑定到 types.BookService
	// 而是经过了一层 _impl_aop_types_BookService (在 wire_zzaop.go 中自动生成)
	// 
	// 即由 impls.BookServiceImpl -> types.BookService
	// 变为 impls.BookServiceImpl -> _impl_aop_types_BookService -> types.BookService
	main_impl_aop_types_BookService := &_impl_aop_types_BookService{
		_aop_types_BookService: bookServiceImpl,
	}

	apis := &Apis{
		Types_BookService: main_impl_aop_types_BookService,
	}
	httpController := ProvideHttpController()
	application := &Application{
		ApisProvider:   apis,
		HttpController: httpController,
	}
	return application, func() {
	}, nil
}

```

在项目目录下 可以看到 额外生成了 `wire_zzaop.go` 以及 它的模版文件 `wire_zzaop.go.tmpl`

```go
// wire_zzaop.go

package main

import (
	"context"

	"github.com/go-zing/gozz-doc-examples/bookstore/types"
)

type _aop_interceptor interface {
	Intercept(v interface{}, name string, params, results []interface{}) (func(), bool)
}

// types.BookService
type (
	_aop_types_BookService      types.BookService
	_impl_aop_types_BookService struct{ _aop_types_BookService }
)

func (i _impl_aop_types_BookService) GetBook(p0 context.Context, p1 types.QueryBook) (r0 types.Book, r1 error) {
	if t, x := i._aop_types_BookService.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_types_BookService, "GetBook",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_types_BookService.GetBook(p0, p1)
}

...

```

可以看到 `gozz:wire` 为 `types.BookService` 生成了 一个对象调用代理类型 并在 `gozz:wire` 过程中
进行 `自动化接口注入实现替换`

并支持用户通过实现 `_aop_interceptor`

对调用的 前置 / 后置 / 参数 / 返回值 等 进行切面化的处理 从而实现功能强大 `AOP` 编程

---

#### 小结

至此 这个简单业务场景核心代码设计 从 0 到 1 的系统化集成 已经展现了 `gozz` 最基本和常用的一些功能

而 `gozz` 在这个过程提供了强大的 标准化编程 和 快速累加集成 代码的能力

同时也会更有利于开发者去思考 如何去优化架构和分层的设计