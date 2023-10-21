# Api

用于从 `interface` 快速生成 `API路由表` 以及无外部框架依赖，类型安全的静态调用层代码。

## 使用

### 注解

需要在 `interface` 对象 及 方法 都添加注解

```go
package x

// +zz:api:[filename][:options...]
type T interface {
	// +zz:api:[resource][:options...]
	Method(param Param) (result Result, err error)

	// 没有注解的方法会被忽略
	InternalMethod(param Param) (result Result, err error)

	// 继承的接口会被忽略
	AnonymousT
}

```

示例：

```go
package x

// +zz:api:./:prefix=book:public
type BookService interface {
	// +zz:api:get|{id}
	GetBook(id int) (book Book, err error)
}
```

### 注解对象

`interface` 对象 及 `interface` 方法

### 用于 `interface` 对象的 必填参数

#### `filename`

指定生成文件路径

示例：

```go{3}
package x

// +zz:api:./
type T interface{}
```

### 用于 `interface` 方法 的 必填参数

#### `resource`

会作为 `API路由表` 中的一级属性

示例：

```go{5}
package x

// +zz:api:./
type T interface {
	// +zz:api:get|detail
	Method()
}
```

### 可选参数

该插件可选参数可使用任意 `Key-Value`，所有可选参数会作为 `map[string]string` 类型，收集到 `API路由表` 的 `options` 字段。

`interface` 对象的可选参数 会尝试覆盖到 接口方法上。例：

```go{3}
package x

// +zz:api:./:prefix=book:role=read
type BookService interface {
	// +zz:api:get
	ListBook() (book []Book, err error)
	// +zz:api:get|{id}
	GetBook(id int) (book Book, err error)
	// +zz:api:post|{id}:role=write
	NewBook(book Book) (id int, err error)
	// +zz:api:put|{id}:role=write
	UpdateBook(book Book) (err error)
}
```

等价于

```go{5,7,9,11}
package x

// +zz:api:./
type BookService interface {
	// +zz:api:get:prefix=book:role=read
	ListBook() (book []Book, err error)
	// +zz:api:get|{id}:prefix=book:role=read
	GetBook(id int) (book Book, err error)
	// +zz:api:post|{id}:prefix=book:role=write
	NewBook(book Book) (id int, err error)
	// +zz:api:put|{id}:prefix=book:role=write
	UpdateBook(book Book) (err error)
}
```

### 其他约定规则

#### invoke 调用函数 生成

对满足条件的部分接口方法可以自动生成类型安全的 `invoke` 静态调用函数：

- 方法最多有 两个入参 及 两个返回值
- 两个入参时，第一个入参类型必须为 `context.Context`，且第二个入参为不同类型
- 两个返回值，第二个返回值类型必须为 `error`，且第一个返回值为不同类型

## 示例

### 示例一

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/api01)

<<< @/gozz-doc-examples/api01/types.go

例子中有两个接口，提供了对 `User` 和 `Book` 两实体基本的增删查改

执行 `gozz run -p "api" ./`，生成了 `zzgen.api.go` 和默认模版文件。

<<< @/gozz-doc-examples/api01/zzgen.api.go

通过自动生成的 `invoke` 函数，可以快速地对接各种协议自动化参数绑定，并类型安全地调起接口实现获取返回值。

结合 [wire](./wire.md) 插件的依赖自动注入，可以将接口和接口实现自动化对接到各种Web框架提供API服务。

结合 [doc](./doc.md) 插件的类型字段注释映射表，可以在 `interface` 和类型设计时快速同步输出API接口文档。

通过自定义的 `options` 可以快速地组合和编排接口中间件及中间件参数，实现权限管理，服务自描述等常用功能。

### 示例二

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/api02)

以下示例展示了 `invoke` 静态调用自动化生成的广泛支持范围。

<<< @/gozz-doc-examples/api02/types.go

执行 `gozz run -p "api" ./`，生成了 `zzgen.api.go`。

<<< @/gozz-doc-examples/api02/zzgen.api.go