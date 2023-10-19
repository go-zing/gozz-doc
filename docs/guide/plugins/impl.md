# Impl

Generates or sync `implement` of `interface` type,
and methods of `interface` to implements in specify filepath.

Exist methods signature would be synced, and missing methods would be appended in file.

## Usage

### Annotation

`+zz:impl:[filename]:[...options]`

### Annotation Target

Object `interface`

### Exact Arguments

#### `filename`

File or directory of implement type.

If filepath do not ends with `.go` provided, use `impl.go` as default filename.

Example: `+zz:impl:./impls/type.go`

### Optional Arguments

#### `type`

Specify implement type name.

Add `*` prefix if pointer receiver were desired. Default: `*${interface name}Impl`

Example: `+zz:impl:./impls:type=*Impl`

#### `wire`

Add `wire` plugin annotation when generating implement type: `+zz:wire:bind=${interface name}`.

It has no effect if implement type exist.

Example: `+zz:impl:./impls:wire`

#### `aop`

Add `aop` option on `wire` annotations, should be used with `wire`.

It has no effect if implement type exist or `wire` were not used.

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

We got `ReadCloserImpl` in `impl01/implements/impl.go`. But contains only `Read`.

```go
// impl01/implements/impl.go
package implements

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read() {
	...
}
```

Execute `gozz run -p "impl" ./ `.

Plugin would lookup implement type named `ReadCloserImpl` in `impl01/implements`.
And collect class methods of this implement type.

After comparing existing class methods and interface methods,
class method's signatures would be sync with same name interface method,
and those that do not exist would be supplemented.

Example: `Read` would be synced as `interface` defined. And `Close` that missing before were appended.

```go
// impl01/implements/impl.go
package implements

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read(b []byte) (int, error) {
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

Execute `gozz run -p "impl" ./`.

Directory `implements` were generated.
Also `Impl` type and methods were generated in `./implements/impl.go`.

- Annotation for `wire` plugin were added because option `wire`.
- Methods would not have pointer receiver because option `type=Impl` does not start with `*`.

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

File `./implements/impl.go` exists, and contains type `ReadCloserImpl` and method `Read`.

```go
// impl03/implements/impl.go
package implements

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read() {
	...
}
```

Because we had specified type name `type=*Impl`, it would not have any effects to type `ReadCloserImpl`.

Execute `gozz run -p "impl" ./`, and generate struct `Impl` and class methods in `./implements/impl.go`,
using pointer receiver and annotations with option `wire` `aop`.

```go
// impl03/implements/impl.go
package implements

import (
	"github.com/go-zing/gozz-doc-examples/impl03"
)

type ReadCloserImpl struct{}

func (impl *ReadCloserImpl) Read() {
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

File `./implements/read.go` exists, contains type `Impl` and its method `Read`.

```go
// impl04/implements/read.go
package implements

type Impl struct{}

func (impl *Impl) Read() {
	// 实现的逻辑代码
	...
}
```

Execute `gozz run -p "impl" ./`,

Method `Read` in `./implements/read.go` were synced.

```go
// impl04/implements/read.go
package implements

type Impl struct{}

func (impl *Impl) Read(b []byte) (int, error) {
	// 实现的逻辑代码
	...
}
```

File `./implements/impl.go` generated, with method `Close`.

```go
// impl04/implements/impl.go
package implements

func (impl *Impl) Close() error {
	panic("not implemented")
}
```