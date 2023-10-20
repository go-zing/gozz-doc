# Impl

用于在指定路径文件夹下，生成 实现被注解 `interface` 的数据类型，以及同步需要实现的类方法。

已存在的同名类方法会被同步方法签名(包括变量命名)，缺失的类型和类方法会在目标文件下追加。

## 使用

### 注解

`+zz:impl:[filename]:[...options]`

### 注解对象

`interface` 类型对象

### 必填参数

#### `filename`

实现接口的目标文件夹或文件，若提供非 `.go` 后缀路径，则使用 `impl.go` 作为文件名

示例： `+zz:impl:./impls/type.go`

### 可选参数

#### `type`

指定目标类型名，若生成指针类方法，则需要加上 `*` 前缀，默认使用 `*${接口名}Impl`

示例： `+zz:impl:./impls:type=*Impl`

#### `wire`

为生成的类型加上 `wire` 插件接口注入的注解，即 `+zz:wire:bind=${接口名}`。

若目标类型已存在则不生效。

示例： `+zz:impl:./impls:wire`

#### `aop`

需要与 `wire` 同时使用，会在生成 `wire` 注解时加上 `aop` 选项。

若目标类型已存在或没有 `wire` 参数则不生效。

示例： `+zz:impl:./impls:wire:aop`

## 示例

### 示例一

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/impl01)

```
/impl01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl01
├── implements
│   └── impl.go
└── types.go
```

<<< @/gozz-doc-examples/impl01/types.go

在 `impl01/implements/impl.go` 中有 `ReadCloserImpl` 的定义，但只有 `Read` 方法

<<< @/gozz-doc-examples/impl01/implements/impl.pre.go

在项目内执行

```shell
gozz run -p "impl" ./ 
```

会在 `impl01/implements` 文件夹内查找名为 `ReadCloserImpl` 的类型定义，和收集该类型提供的 `类方法`。

将已有 `类方法` 与被注解 `interface` 的方法一一对比后，会对同名方法进行函数签名同步，以及对不存在的进行补充。

如下：将 `Read` 的函数签名修改至和 `interface` 定义一致，以及补充缺失的 `Close` 方法

<<< @/gozz-doc-examples/impl01/implements/impl.go

### 示例二

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/impl02)

```
/impl02/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl02
└── types.go
```

<<< @/gozz-doc-examples/impl02/types.go

执行 `gozz run -p "impl" ./`

创建了 `implements` 文件夹，并在 `./implements/impl.go` 下生成了名为 `Impl` 的定义和类方法。

- 由于使用了 `wire` 选项，创建类型时会加上 `wire` 相关注解

- 由于指定 `type=Impl` 没有 `*` 前缀，创建的方法不会使用指针方法

<<< @/gozz-doc-examples/impl02/implements/impl.go

### 示例三

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/impl03)

```
/impl03/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl03
├── implements
│   └── impl.go
└── types.go
```

<<< @/gozz-doc-examples/impl03/types.go

`./implements/impl.go` 文件存在，且存在名为 `ReadCloserImpl` 的类型，有 `Read` 方法。

<<< @/gozz-doc-examples/impl03/implements/impl.pre.go

但我们指定 `type=*Impl`，因此 `ReadCloserImpl` 不会受到任何影响。

执行 `gozz run -p "impl" ./`

在 `./implements/impl.go` 下创建名为 `Impl` 的 `struct` 和 类方法，
包含 `wire` 的注解和 `aop` 选项，并使用指针方法。

<<< @/gozz-doc-examples/impl03/implements/impl.go

### 示例四

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/impl04)

```
/impl04/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/impl04
├── implements
│   └── read.go
└── types.go
```

<<< @/gozz-doc-examples/impl04/types.go

`./implements/read.go` 文件存在，且存在名为 `Impl` 的类型，有 `Read` 方法。

<<< @/gozz-doc-examples/impl04/implements/read.pre.go

执行 `gozz run -p "impl" ./`

`./implements/read.go` 的 `Read` 方法被同步。

<<< @/gozz-doc-examples/impl04/implements/read.go

`./implements/impl.go` 被创建，生成了缺失的 `Close` 方法

<<< @/gozz-doc-examples/impl04/implements/impl.go