# Wire

Provide automatic DI and static AOP proxy generate.

The DI core implement was based on [wire](https://github.com/google/wire).

This plugin could make use of annotation context analysis,
provide more intelligent inject types and inject provide cases,
could be much more simply and easier.

## Usage

### Annotation

`+zz:wire:[...options]`

### Annotation Target

All objects.

### Optional Arguments

#### `bind`

Bind annotated type with specify interface.

Example:`+zz:wire:bind=io.ReadCloser`

#### `aop`

If `bind` was used, generate interface invoke proxy for bind interface and replace binding.

In this case, plugin would generate `wire_zzaop.go` besides of `wire_zset.go`.

Example:`+zz:wire:bind=io.ReadCloser:aop`

Checkout [Example-02](wire.md#example-02) for detail.

#### `field`

Use struct object fields as inject provide,
and do not construct this struct value from fields anymore.
This option is only use for struct.

Default: `*` to export all exported fields.

- Use `,` to join multi fields.

Example: `+zz:wire:field` `+zz:wire:field=User,Config`

#### `inject`

Specify this object as `injectors target`,
it would generate `injectors` constructor functions and wire info (`wire_zset.go`) in specify filepath.

if filepath does not have suffix `.go`, use `wire_zinject` as default `injectors` filename.

Example: `+zz:wire:inject=./`

Function `injectors` follows format: `func Initialize_T(...Params) (T, func(), error)`.

- This option only works for `type` object.
- If annotated type is `struct`, pointer type would return as : `func Initialize_T(...Params) (*T, func(), error)`.
- This option could be used in different objects and filepath,
  and files would generate in different filepath.

#### `param`

If object has used option `inject`, specify type in `param` to be used as constructor params.

Example: `+zz:wire:inject=./:param=context.Context`

It would get constructor: `func Initialize_T(context.Context) (T, func(), error)`.

#### `set`

If `set` was specified, object would be collected into independent `wire.NewSet` named `_${set}Set`,
or use default global set named `_Set`.

- You could use `!` prefix to do flexibly grouping, just like `go build -tags`。

Example:`+zz:wire:set=!mock` / `+zz:wire:set=mock,unittest`

### Other Convention

#### Install `wire`

To ensure the DI core would be executed successful, please install `wire`:

```shell
go install github.com/google/wire/cmd/wire@latest
```

#### Constructor

If annotated type object file exist function named
<span v-pre>`Provide{{ .Name }}`</span>,
and this function have the same type or type pointer as first return,
it would be used as inject provider.

Example:

```go
package x

// +zz:wire
type Implement struct{}

func ProvideImplement() *Implement {
	return &Implement{}
}
```

#### Referenced Type

If `interface` in `bind` option was came from other `package`,
to make sure it was imported in annotated file.
Otherwise, we could not know what exactly this package is.

The value specified in `param` is the same.

Example:

```go
package x

import (
	"bytes"
)

// +zz:wire:bind=io.Closer
var Buff = &bytes.Buffer{}
```

In this case, we could not know what exactly `io` is.

Correct Usage:

```go
package x

import (
	"bytes"
	"io"
)

var _ = (*io.Closer)(nil)

// +zz:wire:bind=io.Closer
var Buff = &bytes.Buffer{}
```

## Examples

### Example-01

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/wire01)

```
/wire01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/wire01
└── types.go
```

```go
// /wire01/types.go
package wire01

// +zz:wire
type StructA struct{}

// +zz:wire
type StructB struct {
	InterfaceC
}

// +zz:wire:bind=InterfaceC
type StructC struct {
	StructA
}

func (StructC) Foo() {}

type InterfaceC interface {
	Foo()
}

// +zz:wire:inject=./
type Target struct {
	StructA
	StructB
	InterfaceC
}
```

In this example, we want to construct `Target` from provided types,
and these types were dependent in some relation.

Execute `gozz run -p "wire" ./`.

It would generate files `wire_gen.go` `wire_zinject.go` `wire_zset.go`.

File `wire_zset.go` includes `wire` declarations that we should provide maintain in manually before.
Now they were generated automatically.

```go
// wire01/wire_zset.go
package wire01

import (
	wire "github.com/google/wire"
)

var (
	_Set = wire.NewSet(
		// github.com/go-zing/gozz-doc-examples/wire01.StructA
		wire.Struct(new(StructA), "*"),

		// github.com/go-zing/gozz-doc-examples/wire01.StructB
		wire.Struct(new(StructB), "*"),

		// github.com/go-zing/gozz-doc-examples/wire01.StructC
		wire.Bind(new(InterfaceC), new(*StructC)),
		wire.Struct(new(StructC), "*"),

		// github.com/go-zing/gozz-doc-examples/wire01.Target
		wire.Struct(new(Target), "*"),
	)
)
```

File `wire_zinject.go` includes constructor and what set it's specified to use,
that we should maintain in manually before. And they were generated automatically now.

```go
// wire01/wire_zinject.go
package wire01

import (
	wire "github.com/google/wire"
)

// github.com/go-zing/gozz-doc-examples/wire01.Target
func Initialize_Target() (*Target, func(), error) {
	panic(wire.Build(_Set))
}
```

At last, we got `wire_gen.go` from `wire`, the DI constructor to provide target we want.

```go
// wire01/wire_gen.go
package wire01

func Initialize_Target() (*Target, func(), error) {
	structA := StructA{}
	structC := &StructC{
		StructA: structA,
	}
	structB := StructB{
		InterfaceC: structC,
	}
	target := &Target{
		StructA:    structA,
		StructB:    structB,
		InterfaceC: structC,
	}
	return target, func() {
	}, nil
}
```

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/wire02)

```
/wire01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/wire02
└── types.go
```

```go
// wire02/types.go
package wire02

// +zz:wire:bind=InterfaceX
// +zz:wire:bind=InterfaceX2:aop
type Interface interface {
	Foo(ctx context.Context, param int) (result int, err error)
	Bar(ctx context.Context, param int) (result int, err error)
}

type InterfaceX Interface
type InterfaceX2 Interface

// +zz:wire:inject=/
type Target struct {
	Interface
	InterfaceX
	InterfaceX2
}

// +zz:wire:bind=Interface
type Implement struct{}

func (Implement) Foo(ctx context.Context, param int) (result int, err error) {
	return
}

func (Implement) Bar(ctx context.Context, param int) (result int, err error) {
	return
}
```

In this example

- We provided struct `Implement` to bind with `Interface`。
- And `Interface` was bind with `InterfaceX` and `InterfaceX2`, but `InterfaceX2` uses option `aop`。
- The inject target was `Target`, depends on `Interface`,`InterfaceX`,`InterfaceX2`.

Execute `gozz run -p "wire" ./`, and focus on `wire_gen.go`.

```go
// wire02/wire_gen.go
package wire02

func Initialize_Target() (*Target, func(), error) {
	implement := &Implement{}
	wire02_impl_aop_InterfaceX2 := &_impl_aop_InterfaceX2{
		_aop_InterfaceX2: implement,
	}
	target := &Target{
		Interface:   implement,
		InterfaceX:  implement,
		InterfaceX2: wire02_impl_aop_InterfaceX2,
	}
	return target, func() {
	}, nil
}
```

We could find out, while implement `Interface` and `InterfaceX`,
both of them use struct `Implement`,
but `InterfaceX2` with option `aop` added, was implement from `impl_aop_InterfaceX2`.

In `wire_zset.go` we could found different `wire` declaration of them.

```go{11-13}
// wire02/wire_zset.go
package wire02

var (
	_Set = wire.NewSet(
		// github.com/go-zing/gozz-doc-examples/wire02.Implement
		wire.Bind(new(Interface), new(*Implement)),
		wire.Struct(new(Implement), "*"),

		// github.com/go-zing/gozz-doc-examples/wire02.Interface
		wire.Bind(new(InterfaceX), new(Interface)),
		wire.Bind(new(_aop_InterfaceX2), new(Interface)),
		wire.Struct(new(_impl_aop_InterfaceX2), "*"),
		wire.Bind(new(InterfaceX2), new(*_impl_aop_InterfaceX2)),

		// github.com/go-zing/gozz-doc-examples/wire02.Target
		wire.Struct(new(Target), "*"),
	)
)
```

Focus on the highlight lines.

Different from `InterfaceX`,
`InterfaceX2` was bind to `_aop_InterfaceX2` than `Interface`.

And `impl_aop_InterfaceX2` take that place of and bind to `InterfaceX2`.

We could found declaration of  `aop_InterfaceX2` and `impl_aop_InterfaceX2` in `wire_zzaop.go`:

```go
// wire02/wire_zzaop.go
package wire02

type _aop_interceptor interface {
	Intercept(v interface{}, name string, params, results []interface{}) (func(), bool)
}

// InterfaceX2
type (
	_aop_InterfaceX2      InterfaceX2
	_impl_aop_InterfaceX2 struct{ _aop_InterfaceX2 }
)

func (i _impl_aop_InterfaceX2) Foo(p0 context.Context, p1 int) (r0 int, r1 error) {
	if t, x := i._aop_InterfaceX2.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_InterfaceX2, "Foo",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_InterfaceX2.Foo(p0, p1)
}

func (i _impl_aop_InterfaceX2) Bar(p0 context.Context, p1 int) (r0 int, r1 error) {
	if t, x := i._aop_InterfaceX2.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_InterfaceX2, "Bar",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_InterfaceX2.Bar(p0, p1)
}
```

Struct `_impl_aop_InterfaceX2` was made of  `Interface` and implement `_aop_InterfaceX2`.

So that all methods call of `Interface` would be proxy intercepted by `impl_aop_InterfaceX2`.

And developers could do these awesome things through `Intercept`:

- Inject some custom hooks before and after method execute.
- Get caller and method name in these hooks.
- Replace arguments and returns.
- Cancel or skip method call.

#### Some Useful Cases

- Check returns error and save caller stack, do some logging, alerting, tracing and metrics.
- Check auth status and permissions.
- Do automatic cache with arguments and returns
- Handle `context.Context` to check cancel or add timeout deadline.

### Example-03

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/wire03)

This Example show complex cases：

- Inject values as providers.
- Bind values as interfaces.
- Build referenced struct type.
- Inject provider function.
- Inject struct fields as providers.
- Group sets by option `set`.

```go
// wire03/types.go
package wire03

import (
	"bytes"
	"database/sql"
	"io"
)

// provide value and interface value
// +zz:wire:bind=io.Writer:aop
// +zz:wire
var Buffer = &bytes.Buffer{}

// provide referenced type
// +zz:wire
type NullString nullString

type nullString sql.NullString

// use provider function to provide referenced type alias
// +zz:wire
type String = string

func ProvideString() String {
	return ""
}

// provide value from implicit type
// +zz:wire
var Bool = false

// +zz:wire:inject=/
type Target struct {
	Buffer     *bytes.Buffer
	Writer     io.Writer
	NullString NullString
}

// mock set injector
// +zz:wire:inject=/:set=mock
type mockString sql.NullString

// mock set string
// provide type from function
// +zz:wire:set=mock
func MockString() String {
	return "mock"
}

// mock set struct type provide fields
// +zz:wire:set=mock:field=*
type MockConfig struct{ Bool bool }

// mock set value
// +zz:wire:set=mock
var mock = MockConfig{Bool: true}
```

Execute `gozz run -p "wire" ./`, and focus on `wire_zset.go`.

```go
// wire03/wire_zset.go
package wire03

var (
	_Set = wire.NewSet(
		// github.com/go-zing/gozz-doc-examples/wire03.Buffer
		wire.InterfaceValue(new(_aop_io_Writer), Buffer),
		wire.Struct(new(_impl_aop_io_Writer), "*"),
		wire.Bind(new(io.Writer), new(*_impl_aop_io_Writer)),
		wire.Value(Buffer),

		// github.com/go-zing/gozz-doc-examples/wire03.NullString
		wire.Struct(new(NullString), "*"),

		// github.com/go-zing/gozz-doc-examples/wire03.String
		ProvideString,

		// github.com/go-zing/gozz-doc-examples/wire03.Bool
		wire.Value(Bool),

		// github.com/go-zing/gozz-doc-examples/wire03.Target
		wire.Struct(new(Target), "*"),
	)

	_mockSet = wire.NewSet(
		// github.com/go-zing/gozz-doc-examples/wire03.mockString
		wire.Struct(new(mockString), "*"),

		// github.com/go-zing/gozz-doc-examples/wire03.MockString
		MockString,

		// github.com/go-zing/gozz-doc-examples/wire03.MockConfig
		wire.FieldsOf(new(MockConfig), "Bool"),

		// github.com/go-zing/gozz-doc-examples/wire03.mock
		wire.Value(mock),
	)
)
```

We could satisfy most of the needs using `+zz:wire` and options `bind` `inject` only.