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

<<< @/gozz-doc-examples/impl01/types.go

We got `ReadCloserImpl` in `impl01/implements/impl.go`. But contains only `Read`.

<<< @/gozz-doc-examples/impl01/implements/.impl.pre.go

Execute `gozz run -p "impl" ./ `.

Plugin would lookup implement type named `ReadCloserImpl` in `impl01/implements`.
And collect class methods of this implement type.

After comparing existing class methods and interface methods,
class method's signatures would be sync with same name interface method,
and those that do not exist would be supplemented.

Example: `Read` would be synced as `interface` defined. And `Close` that missing before were appended.

<<< @/gozz-doc-examples/impl01/implements/impl.go

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/impl02)

```
/impl02/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl02
└── types.go
```

<<< @/gozz-doc-examples/impl02/types.go

Execute `gozz run -p "impl" ./`.

Directory `implements` were generated.
Also `Impl` type and methods were generated in `./implements/impl.go`.

- Annotation for `wire` plugin were added because option `wire`.
- Methods would not have pointer receiver because option `type=Impl` does not start with `*`.

<<< @/gozz-doc-examples/impl02/implements/impl.go

### Example-03

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/impl03)

```
/impl03/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl03
├── implements
│   └── impl.go
└── types.go
```

<<< @/gozz-doc-examples/impl03/types.go

File `./implements/impl.go` exists, and contains type `ReadCloserImpl` and method `Read`.

<<< @/gozz-doc-examples/impl03/implements/.impl.pre.go

Because we had specified type name `type=*Impl`, it would not have any effects to type `ReadCloserImpl`.

Execute `gozz run -p "impl" ./`, and generate struct `Impl` and class methods in `./implements/impl.go`,
using pointer receiver and annotations with option `wire` `aop`.

<<< @/gozz-doc-examples/impl03/implements/impl.go

### Example-04

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/impl04)

```
/impl04/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl04
├── implements
│   └── read.go
└── types.go
```

<<< @/gozz-doc-examples/impl04/types.go

File `./implements/read.go` exists, contains type `Impl` and its method `Read`.

<<< @/gozz-doc-examples/impl04/implements/.read.pre.go

Execute `gozz run -p "impl" ./`,

Method `Read` in `./implements/read.go` were synced.

<<< @/gozz-doc-examples/impl04/implements/read.go

File `./implements/impl.go` generated, with method `Close`.

<<< @/gozz-doc-examples/impl04/implements/impl.go