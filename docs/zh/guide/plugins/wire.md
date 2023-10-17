# Wire

提供自动化的依赖注入以及AOP切面代理生成。

依赖注入管理基于 [wire](https://github.com/google/wire) 实现。

通过该插件可以更自动化，更规范，更简洁易用地维护依赖注入对象。

## 使用

### 注解

`+zz:wire:[...options]`

### 注解对象

所有对象

### 可选参数

#### `bind`

将提供的对象绑定指定接口类型进行注入。

即使用 `wire.Bind(new(InterfaceType), new(T))`

示例：`+zz:wire:bind=io.ReadCloser`

#### `aop`

当对象已经使用了 `bind` 时，为绑定的接口创建接口调用代理，并替换绑定。

此时在生成 `wire_zset.go` 以外，还会生成 `wire_zzaop.go`。

示例：`+zz:wire:bind=io.ReadCloser:aop`

#### `struct`

仅对引用类型生效，即 `type T = T2` / `type T pkg.T3`，使用该选项使类型当作结构体类型注入。

即使用 `wire.Struct(new(T), "*")`

示例：`+zz:wire:struct`

其他类型不需要使用该选项。

#### `field`

将结构体对象的字段作为值提供注入。

可使用 `*` 提供所有暴露字段

即使用 `wire.FieldsOf(new(T), "Field", "Field2", ...)`

示例：`+zz:wire:field=*`

#### `inject`

指定对象为 `构建目标`，在参数指定路径创建 `构建函数` 和生成注入相关的声明( `wire_zset.go` )。

当提供路径没有 `.go` 后缀时，默认使用 `wire_zinject.go` 为文件名

示例：`+zz:wire:inject=./`

`构建函数` 为 `func Initialize_T() (T, func(), error)`

#### `param`

当对象使用 `inject` 被指定为 `构建目标` 时。`param` 中的类型会作为 `构建函数` 的参数。

示例：`+zz:wire:inject=./:param=context.Context`

`构建函数` 为 `func Initialize_T(context.Context) (T, func(), error)`

#### `set`

指定 `set` 的对象，会被收集到独立的 `wire.NewSet` 组，无指定 `set` 会使用全局默认组。

可以使用 `!` 前缀，此情况会将对象放置入所有非前缀的组，规则类似 `go build -tag`。

示例：`+zz:wire:set=!mock` / `+zz:wire:set=mock,unittest`

## 示例

### 示例一

项目目录结构

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
