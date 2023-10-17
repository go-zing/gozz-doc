# Api

用于从 `interface` 快速生成 `API路由表` 以及无外部框架依赖，类型安全的静态调用层代码。

### invoke 生成

对满足条件的部分接口方法可以自动生成类型安全的 `invoke` 静态调用函数：

- 方法最多有 两个入参 及 两个返回值

- 两个入参时，第一个入参类型必须为 `context.Context`，且第二个入参为不同类型

- 两个返回值，第二个返回值类型必须为 `error`，且第一个返回值为不同类型

## 使用

### 注解

需要在 `interface` 对象 及 方法 都添加注解

```go
package x

// +zz:api:[filename]:[...options]
type T interface {
	// +zz:api:[method]:[resource]:[...options]
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
	// +zz:api:get:{id}
	GetBook(id int) (book Book, err error)
}
```

### 注解对象

`interface` 对象 及 `interface` 方法

### 必填参数

#### 用于 `interface` 对象

#### `filename`

指定生成文件路径

示例： `+zz:api:./`

#### 用于 `interface` 方法

#### `method`

会作为 `API路由表` 中的一级属性

#### `resource`

会作为 `API路由表` 中的一级属性

示例： `+zz:api:get:detail`

### 可选参数

该插件可选参数可使用任意 `Key-Value`，所有可选参数会作为 `map[string]string` 类型，收集到 `API路由表` 的 `options` 字段。

`interface` 对象的可选参数 会尝试覆盖到 接口方法上。例：

```go
package x

// +zz:api:./:prefix=book:role=read
type BookService interface {
	// +zz:api:get:
	ListBook() (book []Book, err error)
	// +zz:api:get:{id}
	GetBook(id int) (book Book, err error)
	// +zz:api:post:{id}:role=write
	NewBook(book Book) (id int, err error)
	// +zz:api:put:{id}:role=write
	UpdateBook(book Book) (err error)
}
```

等价于

```go
package x

// +zz:api:./
type BookService interface {
	// +zz:api:get::prefix=book:role=read
	ListBook() (book []Book, err error)
	// +zz:api:get:{id}:prefix=book:role=read
	GetBook(id int) (book Book, err error)
	// +zz:api:post:{id}:prefix=book:role=write
	NewBook(book Book) (id int, err error)
	// +zz:api:put:{id}:prefix=book:role=write
	UpdateBook(book Book) (err error)
}
```

## 示例

### 示例一

项目目录结构

```
/api01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/api01
└── types.go
```

```go
// api01/types.go
package api01

// +zz:api:./:prefix={{ snake .Name }}:id={{ .Name }}.{{ .FieldName }}
type (
	BookService interface {
		// +zz:api:get:
		List(ctx context.Context, query QueryBook) (ret ListBook, err error)
		// +zz:api:get:{id}
		Get(ctx context.Context, query QueryBook) (data DataBook, err error)
		// +zz:api:post:
		Create(ctx context.Context, form FormBook) (data DataBook, err error)
		// +zz:api:put:{id}
		Edit(ctx context.Context, form FormBook) (data DataBook, err error)
	}

	UserService interface {
		// +zz:api:get:
		List(ctx context.Context, query QueryUser) (ret ListUser, err error)
		// +zz:api:get:{id}
		Get(ctx context.Context, query QueryUser) (data DataBook, err error)
		// +zz:api:post:
		Create(ctx context.Context, query FormUser) (data DataBook, err error)
		// +zz:api:put:{id}
		Edit(ctx context.Context, form FormUser) (data DataBook, err error)
	}
)
```

例子中有两个接口，提供了对 `User` 和 `Book` 两实体基本的增删查改

`gozz` 执行后，生成了 `zzgen.api.go` 和默认模版文件。

```go
// api01/zzgen.api.go
package api01

import (
	"context"
)

var _ = context.Context(nil)

type Apis struct {
	BookService BookService
	UserService UserService
}

func (s Apis) Range(fn func(interface{}, []map[string]interface{})) {
	for _, f := range []func() (interface{}, []map[string]interface{}){
		s._BookService,
		s._UserService,
	} {
		fn(f())
	}
}

func (s Apis) _BookService() (interface{}, []map[string]interface{}) {
	t := s.BookService
	return &t, []map[string]interface{}{
		{
			"name":     "List",
			"method":   "get",
			"resource": "",
			"options": map[string]string{
				"id":     "BookService.List",
				"prefix": "book_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in QueryBook
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.List(ctx, in)
			},
		},
		{
			"name":     "Get",
			"method":   "get",
			"resource": "{id}",
			"options": map[string]string{
				"id":     "BookService.Get",
				"prefix": "book_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in QueryBook
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.Get(ctx, in)
			},
		},
		{
			"name":     "Create",
			"method":   "post",
			"resource": "",
			"options": map[string]string{
				"id":     "BookService.Create",
				"prefix": "book_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in FormBook
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.Create(ctx, in)
			},
		},
		{
			"name":     "Edit",
			"method":   "put",
			"resource": "{id}",
			"options": map[string]string{
				"id":     "BookService.Edit",
				"prefix": "book_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in FormBook
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.Edit(ctx, in)
			},
		},
	}
}

func (s Apis) _UserService() (interface{}, []map[string]interface{}) {
	t := s.UserService
	return &t, []map[string]interface{}{
		{
			"name":     "List",
			"method":   "get",
			"resource": "",
			"options": map[string]string{
				"id":     "UserService.List",
				"prefix": "user_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in QueryUser
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.List(ctx, in)
			},
		},
		{
			"name":     "Get",
			"method":   "get",
			"resource": "{id}",
			"options": map[string]string{
				"id":     "UserService.Get",
				"prefix": "user_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in QueryUser
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.Get(ctx, in)
			},
		},
		{
			"name":     "Create",
			"method":   "post",
			"resource": "",
			"options": map[string]string{
				"id":     "UserService.Create",
				"prefix": "user_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in FormUser
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.Create(ctx, in)
			},
		},
		{
			"name":     "Edit",
			"method":   "put",
			"resource": "{id}",
			"options": map[string]string{
				"id":     "UserService.Edit",
				"prefix": "user_service",
			},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in FormUser
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.Edit(ctx, in)
			},
		},
	}
}
```

通过自动生成的 `invoke` 函数，可以快速地对接各种协议自动化参数绑定，并类型安全地调起接口实现获取返回值。

结合 [wire](./wire.md) 插件的依赖自动注入，可以将接口和接口实现自动化对接到各种Web框架提供API服务。

结合 [doc](./doc.md) 插件的类型字段注释映射表，可以在 `interface` 和类型设计时快速同步输出API接口文档。

通过自定义的 `options` 可以快速地组合和编排接口中间件及中间件参数，实现权限管理，服务自描述等常用功能。

### 示例二

以下示例展示了 `invoke` 静态调用自动化生成的广泛支持范围。

```go
// api02/types.go
package api02

// +zz:api:./
type (
	T interface {
		// +zz:api:get:
		Empty()
		// +zz:api:get:
		Ret() (ret int)
		// +zz:api:get:
		Error() (err error)
		// +zz:api:get:
		RetError() (ret int, err error)
		// +zz:api:get:
		Context(ctx context.Context)
		// +zz:api:get:
		ContextRet(ctx context.Context) (ret int)
		// +zz:api:get:
		ContextError(ctx context.Context) (err error)
		// +zz:api:get:
		ContextRetError(ctx context.Context) (ret int, err error)
		// +zz:api:get:
		Param(param int)
		// +zz:api:get:
		ParamRet(param int) (ret error)
		// +zz:api:get:
		ParamError(param int) (err error)
		// +zz:api:get:
		ParamRetError(param int) (ret int, err error)
		// +zz:api:get:
		ContextParam(ctx context.Context, param int)
		// +zz:api:get:
		ContextParamRet(ctx context.Context, param int) (ret int)
		// +zz:api:get:
		ContextParamError(ctx context.Context, param int) (err error)
		// +zz:api:get:
		ContextParamRetError(ctx context.Context, param int) (ret int, err error)
		// +zz:api:get:
		ComplexParam(param map[context.Context][]struct {
			Field []func(context.Context) interface {
				context.Context
			}
		})
		// +zz:api:get:
		PtrParam(*int)
	}
)
```

`gozz` 执行后，生成 `zzgen.api.go`。

```go
// api02/zzgen.api.go
package api02

type Apis struct {
	T T
}

func (s Apis) Range(fn func(interface{}, []map[string]interface{})) {
	for _, f := range []func() (interface{}, []map[string]interface{}){
		s._T,
	} {
		fn(f())
	}
}

func (s Apis) _T() (interface{}, []map[string]interface{}) {
	t := s.T
	return &t, []map[string]interface{}{
		{
			"name":     "Empty",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				t.Empty()
				return nil, nil
			},
		},
		{
			"name":     "Ret",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke":   func(ctx context.Context, dec func(interface{}) error) (interface{}, error) { return t.Ret(), nil },
		},
		{
			"name":     "Error",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke":   func(ctx context.Context, dec func(interface{}) error) (interface{}, error) { return nil, t.Error() },
		},
		{
			"name":     "RetError",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke":   func(ctx context.Context, dec func(interface{}) error) (interface{}, error) { return t.RetError() },
		},
		{
			"name":     "Context",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				t.Context(ctx)
				return nil, nil
			},
		},
		{
			"name":     "ContextRet",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				return t.ContextRet(ctx), nil
			},
		},
		{
			"name":     "ContextError",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				return nil, t.ContextError(ctx)
			},
		},
		{
			"name":     "ContextRetError",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				return t.ContextRetError(ctx)
			},
		},
		{
			"name":     "Param",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				t.Param(in)
				return nil, nil
			},
		},
		{
			"name":     "ParamRet",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				return nil, t.ParamRet(in)
			},
		},
		{
			"name":     "ParamError",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				return nil, t.ParamError(in)
			},
		},
		{
			"name":     "ParamRetError",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.ParamRetError(in)
			},
		},
		{
			"name":     "ContextParam",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				t.ContextParam(ctx, in)
				return nil, nil
			},
		},
		{
			"name":     "ContextParamRet",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.ContextParamRet(ctx, in), nil
			},
		},
		{
			"name":     "ContextParamError",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				return nil, t.ContextParamError(ctx, in)
			},
		},
		{
			"name":     "ContextParamRetError",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				return t.ContextParamRetError(ctx, in)
			},
		},
		{
			"name":     "ComplexParam",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in map[context.Context][]struct {
					Field []func(context.Context) interface {
						context.Context
					}
				}
				if err := dec(&in); err != nil {
					return nil, err
				}
				t.ComplexParam(in)
				return nil, nil
			},
		},
		{
			"name":     "PtrParam",
			"method":   "get",
			"resource": "",
			"options":  map[string]string{},
			"invoke": func(ctx context.Context, dec func(interface{}) error) (interface{}, error) {
				var in int
				if err := dec(&in); err != nil {
					return nil, err
				}
				t.PtrParam(&in)
				return nil, nil
			},
		},
	}
}
```