# Impl

用于在指定路径文件夹下，生成 实现被注解 `interface` 的数据类型，以及同步需要实现的类方法。

已存在的同名类方法会被同步方法签名(包括变量命名)，缺失的类型和类方法会在目标文件下追加。

## Usage

### Annotation

`+zz:impl:[filename]:[...options]`

### Annotation Target

`interface` 类型对象

### Exact Arguments

#### `filename`

实现接口的目标文件夹或文件，若提供非 `.go` 后缀路径，则使用 `impl.go` 作为文件名

Example: `+zz:impl:./impls/type.go`

### Optional Arguments

#### `type`

指定目标类型名，若生成指针类方法，则需要加上 `*` 前缀，默认使用 `*${接口名}Impl`

Example: `+zz:impl:./impls:type=*Impl`

#### `wire`

为生成的类型加上 `wire` 插件接口注入的注解，即 `+zz:wire:bind=${接口名}`。

若目标类型已存在则不生效。

Example: `+zz:impl:./impls:wire`

#### `aop`

需要与 `wire` 同时使用，会在生成 `wire` 注解时加上 `aop` 选项。

若目标类型已存在或没有 `wire` 参数则不生效。

Example: `+zz:impl:./impls:wire:aop`

## Examples

### Example-01

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/impl01)

```
/impl01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl01
├── implements
│   └── impl.go
└── types.go
```

```go
// impl01/types.go
package impl01

// +zz:impl:./implements
type ReadCloser interface {
	Read(b []byte) (int, error)
	Close() error
}
```

在 `impl01/implements/impl.go` 中有 `ReadCloserImpl` 的定义，但只有 `Read` 方法

```go
// impl01/implements/impl.go
package implements

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read() {
	// 实现的逻辑代码
	...
}
```

在项目内执行

```shell
gozz run -p "impl" ./ 
```

会在 `impl01/implements` 文件夹内查找名为 `ReadCloserImpl` 的类型定义，和收集该类型提供的 `类方法`。

将已有 `类方法` 与被注解 `interface` 的方法一一对比后，会对同名方法进行函数签名同步，以及对不存在的进行补充。

如下：将 `Read` 的函数签名修改至和 `interface` 定义一致，以及补充缺失的 `Close` 方法

```go
// impl01/implements/impl.go
package implements

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read(b []byte) (int, error) {
	// 实现的逻辑代码
	...
}

func (impl *ReadCloserImpl) Close() error {
	panic("not implemented")
}
```

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/impl02)

```
/impl02/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl02
└── types.go
```

```go
// impl02/types.go
package impl02

// +zz:impl:./implements:type=Impl:wire
type ReadCloser interface {
	Read(b []byte) (int, error)
	Close() error
}
```

执行 `gozz run -p "impl" ./`

创建了 `implements` 文件夹，并在 `./implements/impl.go` 下生成了名为 `Impl` 的定义和类方法。

- 由于使用了 `wire` 选项，创建类型时会加上 `wire` 相关注解

- 由于指定 `type=Impl` 没有 `*` 前缀，创建的方法不会使用指针方法

```go
// impl02/implements/impl.go
package implements

import (
	"github.com/go-zing/gozz-doc-examples/impl02"
)

var _ impl02.ReadCloser = (*Impl)(nil)

// +zz:wire:bind=impl02.ReadCloser
type Impl struct{}

func (impl Impl) Read(b []byte) (int, error) {
	panic("not implemented")
}

func (impl Impl) Close() error {
	panic("not implemented")
}
```

### Example-03

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/impl03)

```
/impl03/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl03
├── implements
│   └── impl.go
└── types.go
```

```go
// impl03/types.go
package impl03

// +zz:impl:./implements:type=*Impl:wire:aop
type ReadCloser interface {
	Read(b []byte) (int, error)
	Close() error
}
```

`./implements/impl.go` 文件存在，且存在名为 `ReadCloserImpl` 的类型，有 `Read` 方法。

```go
// impl03/implements/impl.go
package implements

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read() {
	// 实现的逻辑代码
	...
}
```

但我们指定 `type=*Impl`，因此 `ReadCloserImpl` 不会受到任何影响。

执行 `gozz run -p "impl" ./`

在 `./implements/impl.go` 下创建名为 `Impl` 的 `struct` 和 类方法，
包含 `wire` 的注解和 `aop` 选项，并使用指针方法。

```go
// impl03/implements/impl.go
package implements

import (
	"github.com/go-zing/gozz-doc-examples/impl03"
)

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read() {
	// 实现的逻辑代码
	...
}

var _ impl03.ReadCloser = (*Impl)(nil)

// +zz:wire:bind=impl03.ReadCloser:aop
type Impl struct{}

func (impl Impl) Read(b []byte) (int, error) {
	panic("not implemented")
}

func (impl Impl) Close() error {
	panic("not implemented")
}
```

### Example-04

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/impl04)

```
/impl04/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl04
├── implements
│   └── read.go
└── types.go
```

```go
// impl04/types.go
package impl04

// +zz:impl:./implements:type=*Impl:wire:aop
type ReadCloser interface {
	Read(b []byte) (int, error)
	Close() error
}
```

`./implements/read.go` 文件存在，且存在名为 `Impl` 的类型，有 `Read` 方法。

```go
// impl04/implements/read.go
package implements

type Impl struct{}

func (impl *Impl) Read() {
	// 实现的逻辑代码
	...
}
```

执行 `gozz run -p "impl" ./`

`./implements/read.go` 的 `Read` 方法被同步。

```go
// impl04/implements/read.go
package implements

type Impl struct{}

func (impl *Impl) Read(b []byte) (int, error) {
	// 实现的逻辑代码
	...
}
```

`./implements/impl.go` 被创建，生成了缺失的 `Close` 方法

```go
// impl04/implements/impl.go
package implements

func (impl *Impl) Close() error {
	panic("not implemented")
}
```