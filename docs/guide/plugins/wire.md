# Wire

提供 `自动化依赖注入` 以及 `静态AOP代理` 生成。

依赖注入内核基于 [wire](https://github.com/google/wire) 实现。

该插件通过注解分析，可以提供更智能的注入场景和注入类型推断，更为简洁易用。

## Usage

### Annotation

`+zz:wire:[...options]`

### Annotation Target

所有对象

### Optional Arguments

#### `bind`

将提供的对象绑定指定接口类型进行注入，对函数对象无效。

Example:`+zz:wire:bind=io.ReadCloser`

若对象为类型，即使用 `wire.Bind(new(InterfaceType), new(T))`

若对象为值，即使用 `wire.InterfaceValue(new(InterfaceType), Value)`

#### `aop`

当对象已经使用了 `bind` 时，为绑定的接口创建接口调用代理，并替换绑定。

此时在生成 `wire_zset.go` 以外，还会生成 `wire_zzaop.go`。

Example:`+zz:wire:bind=io.ReadCloser:aop`

详情可见[示例二](wire.md#示例二)

#### `field`

将结构体对象的字段作为值提供注入，并不再使用字段组装此类型对象实例，仅对结构体类型生效。

可使用 `*` 提供所有暴露字段

即使用 `wire.FieldsOf(new(T), "Field", "Field2", ...)`

Example:`+zz:wire:field=*`

#### `inject`

指定对象为 `构建目标`，在参数指定路径创建 `构建函数` 和生成注入相关的声明( `wire_zset.go` )。

当提供路径没有 `.go` 后缀时，默认使用 `wire_zinject.go` 为文件名。

Example:`+zz:wire:inject=./`

`构建函数` 为 `func Initialize_T() (T, func(), error)`

仅对类型对象生效。

当类型为结构体类型时，将会初始化为对象指针，即 `func Initialize_T() (*T, func(), error)`。

可以同时拥有多个 `构建目标`，当这些指定路径目录不一致时，相关文件会被多次生成。

#### `param`

当类型对象使用 `inject` 被指定为 `构建目标` 时。`param` 中的类型会作为 `构建函数` 的参数。

Example:`+zz:wire:inject=./:param=context.Context`

`构建函数` 为 `func Initialize_T(context.Context) (T, func(), error)`

#### `set`

指定 `set` 的对象，会被收集到独立的 `wire.NewSet` 组，无指定 `set` 会使用全局默认组。

可以使用 `!` 前缀，此情况会将对象放置入所有非前缀的组，规则类似 `go build -tags`。

Example:`+zz:wire:set=!mock` / `+zz:wire:set=mock,unittest`

### 其他约定规则

#### 安装 `wire`

为确保最后的依赖注入生成能够成功，使用前请安装 `wire`。

```shell
go install github.com/google/wire/cmd/wire@latest
```

#### 构造函数

当类型对象代码文件内存在名为 <span v-pre>`Provide{{ .Name }}`</span> 的函数，且第一个返回值为该 类型 或 类型指针时，
会使用该函数注入。

例：

```go
package x

// +zz:wire
type Implement struct{}

func ProvideImplement() *Implement {
	return &Implement{}
}
```

#### 外部引用类型

在 `bind` 中指定的 `interface` 如果来源于其他 `package` ，需要确保有 `import` 到注解当前文件，否则会无法识别。

在 `param` 中指定的参数类型同理。

例：

```go
package x

import (
	"bytes"
)

// +zz:wire:bind=io.Closer
var Buff = &bytes.Buffer{}
```

上述情况下会无法识别 `io` 来源。

正确用法：

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

以上例子中，我们需要从提供的各种类型中构建出 `Target`，而这些类型又以一定的关系相互依赖。

在添加注解后，执行 `gozz run -p "wire" ./`

生成了 `wire_gen.go` `wire_zinject.go` `wire_zset.go` 三个文件

`wire_zset.go` 中包含了 使用 `wire` 时原来要人工描述的注入对象及 `对象组` 声明。

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

`wire_zinject.go` 中包含了 使用 `wire` 时原来要人工描述的 `构造函数` 以及要使用的 `对象组`。

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

`wire_gen.go` 是生成成功后，自动调用 `wire` 生成的文件，提供了生成的依赖注入构造函数实现。

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

以上示例中：

- 通过 `Implement` 可以实现 `Interface`。

- `Interface` 绑定了两个别名类型 `InterfaceX` 和 `InterfaceX2`，其中对 `InterfaceX2` 的绑定添加了 `aop` 选项。

- 最终的构造目标为 `Target`，依赖 `Interface`、`InterfaceX`、`InterfaceX2`。

执行 `gozz run -p "wire" ./`，并观察生成的 `wire_gen.go`。

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

可见 在实现 `Interface` 和 `InterfaceX` 时，都是直接使用了 `Implement`，而添加 `aop` 选项的 `InterfaceX2`
使用了 `_impl_aop_InterfaceX2` 的类型。

在 `wire_zset.go` 中，可以看到两种类型不同的依赖声明。

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

注意被高亮的代码：

不同于 `InterfaceX` 的接口绑定，本应绑定到 `InterfaceX2` 的 `Interface`
被绑定到一个名为 `_aop_InterfaceX2` 的接口。

而真正被代替绑定到 `InterfaceX2` 的是名为 `impl_aop_InterfaceX2` 的结构体。

在 `wire_zzaop.go` 中，我们可以看到 `aop_InterfaceX2` 和 `impl_aop_InterfaceX2` 的定义：

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

原 `Interface` 会用作 `_aop_InterfaceX2` 构造 `_impl_aop_InterfaceX2`。

对原 `Interface` 的所有方法调用都会经过 `impl_aop_InterfaceX2` 的代理。

通过代理方法的实现可以看到，通过开发者通过 `Intercept` 可以实现：

- 在函数调用进行自定义前置和后置逻辑
- 获取实际调用方及调用方法名
- 对函数参数及返回值进行替换
- 不经过实际调用方，直接终止调用

#### 一些实用场景

- 检查返回值错误，自动打印错误堆栈及调用信息，自动注入日志、链路追踪、埋点上报等。
- 检查授权状态及访问权限。
- 对调用参数和返回值进行自动缓存。
- 检查或替换 `context.Context`，添加超时或检查中断。

### Example-03

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/wire03)

这个示例混合地展示了几种场景：

- 注入值对象
- 使用值对象绑定接口
- 引用类型作为结构体
- 使用指定函数提供注入类型
- 使用结构体字段值进行注入
- 使用 `set` 对注入进行分组

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

执行 `gozz run -p "wire" ./`，注意观察生成的 `wire_zset.go`。

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

可见使用 `gozz:wire` 后，掌握注解 `+zz:wire` 和 `bind` `inject` 两个选项就能满足大部分需求。