# Api

Generates `API Routing Map` and type-safe static invoker function from `interface`,
without external framework dependencies.

## Usage

### Annotation

Add annotations on `interface` and method fields

```go
package x

// +zz:api:[filename]:[...options]
type T interface {
	// +zz:api:[method]:[resource]:[...options]
	Method(param Param) (result Result, err error)

	// method without annotations would be ignored
	InternalMethod(param Param) (result Result, err error)

	// anonymous field would be ignored
	AnonymousT
}

```

Example:

```go
package x

// +zz:api:./:prefix=book:public
type BookService interface {
	// +zz:api:get:{id}
	GetBook(id int) (book Book, err error)
}
```

### Exact Arguments For `interface`

#### `filename`

Specify generate filename.

Example: `+zz:api:./`

### Exact Arguments For `interface` method

#### `method`

would be main property in `API Routing Map`

#### `resource`

would be main property in `API Routing Map`

Example: `+zz:api:get:detail`

### Optional Arguments

You can use any `Key-Value` pairs options in this plugin.
They would be collect into `API Routing Map`'s field `options` as a `map[string]string`.

options on `interface` would try override `field` options：

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

is equal to:

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

### Convention

#### Invoke Function Generation

Type-safe `invoke` static calling functions can be automatically generated for methods that meet the conditions:

- Methods have at most two params and two returns
- If there are two params, the first param type must be `context.Context`, and the second must be different
- If there are two returns, the second return type must be `error`, and the first must be different

## Examples

### Example-01

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/api01)

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

This Example has two `interface`, provide entity basic `CRUD` for `User` and `Book`.

Execute `gozz run -p "api" ./`, and it generates file `zzgen.api.go` and template file.

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

- We could use generated `invoke` function to connect with types of protocol library and do request binding,
  then invoke the interface method call and get return values in these type-safe static codes.
- With help of DI of plugin [wire](wire.md), we could do automatic interface and api binding to provide API
  services.
- With help of comments mapping table generated by plugin [doc](doc.md),
  we could also generate API docs when `interface` and types were designed.
- Use optional arguments `options` to do flexibly middlewares and middlewares params management,
  to do more functions like permission control, or OpenAPI.

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/api02)

This example would show wide scope supporting of `invoke` static function generating.

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

Execute `gozz run -p "api" ./`, and it generates file `zzgen.api.go` and template file.

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