# Wire

Provide autowire DI and static AOP proxy generate.

The DI core implement was based on [wire](https://github.com/google/wire).

This plugin could make use of annotation context analysis,
provide more intelligent inject types and inject provide cases,
could be much more simply and easier.

## Usage

### Annotation

`+zz:wire[:options...]`

### Annotation Target

All objects.

### Optional Arguments

#### `bind`

Bind annotated type with specify interface, if used on function type, bind with first return type.

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

- You could use `!` prefix to do flexibly grouping, just like `go build -tags`.

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

<<< @/gozz-doc-examples/wire01/types.go

In this example, we want to construct `Target` from provided types,
and these types were dependent in some relation.

Execute `gozz run -p "wire" ./`.

It would generate files `wire_gen.go` `wire_zinject.go` `wire_zset.go`.

File `wire_zset.go` includes `wire` declarations that we should provide maintain in manually before.
Now they were generated automatically.

<<< @/gozz-doc-examples/wire01/wire_zset.go

File `wire_zinject.go` includes constructor and what set it's specified to use,
that we should maintain in manually before. And they were generated automatically now.

<<< @/gozz-doc-examples/wire01/wire_zinject.go

At last, we got `wire_gen.go` from `wire`, the DI constructor to provide target we want.

<<< @/gozz-doc-examples/wire01/wire_gen.go

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/wire02)

<<< @/gozz-doc-examples/wire02/types.go

In this example

- We provided struct `Implement` to bind with `Interface`.
- And `Interface` was bind with `InterfaceX` and `InterfaceX2`, but `InterfaceX2` uses option `aop`.
- The inject target was `Target`, depends on `Interface`,`InterfaceX`,`InterfaceX2`.

Execute `gozz run -p "wire" ./`, and focus on `wire_gen.go`.

<<< @/gozz-doc-examples/wire02/wire_gen.go{13-20}

We could find out, while implement `Interface` and `InterfaceX`,
both of them use struct `Implement`,
but `InterfaceX2` with option `aop` added, was implement from `impl_aop_InterfaceX2`.

In `wire_zset.go` we could found different `wire` declaration of them.

<<< @/gozz-doc-examples/wire02/wire_zset.go{19-22}

Focus on the highlight lines.

Different from `InterfaceX`,
`InterfaceX2` was bind to `_aop_InterfaceX2` than `Interface`.

And `impl_aop_InterfaceX2` take that place of and bind to `InterfaceX2`.

We could found declaration of  `aop_InterfaceX2` and `impl_aop_InterfaceX2` in `wire_zzaop.go`:

<<< @/gozz-doc-examples/wire02/wire_zzaop.go{15-16}

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
- Additional set from `wire.NewSet`

<<< @/gozz-doc-examples/wire03/types.go

Execute `gozz run -p "wire" ./`, and focus on `wire_zset.go`.

<<< @/gozz-doc-examples/wire03/wire_zset.go

We could satisfy most of the needs using `+zz:wire` and options `bind` `inject` only.