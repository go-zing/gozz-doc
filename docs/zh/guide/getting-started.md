# 快速上手

## 使用

### 安装

```shell
go install github.com/go-zing/gozz@latest
```

### 命令行

`Gozz` CLI 基于 [cobra](https://github.com/spf13/cobra) 构建，命令行交互语法遵循格式：

```shell
gozz [--GLOBAL-FLAGS] [COMMAND] [--COMMAND-FLAGS] [ARGS]
```

### 环境

`Gozz` 在启动时会自动加载用户目录 `~/.gozz/plugins/` 下的 `.so` 插件，期间发生的异常会被忽略。

使用者可以通过指定环境变量 `GOZZ_PLUGINS_DIR` 来变更默认的插件安装目录。

:::tip 项目环境
请确保使用的项目运作在 [go modules](https://go.dev/blog/using-go-modules) 模式
:::

## 指令

`Gozz` 支持以下指令：

### `gozz list`

该指令会列出已经被正确注册到内核和可使用的插件，并且输出插件和参数相关的介绍到控制台，使用者也可以通过该指令来检查插件是否被正确加载。

### `gozz run`

用法：

```shell
gozz run [--plugin/-p] [filename] 
```

该指令会启动对 `filename` 文件或目录注解的分析，
并将分析的结构化注解及上下文，提交至指定的若干插件进行下一步工作。这将会是使用者最常用的指令。

#### 参数 `filename`

当 `filename` 为文件时，解析器只会解析当前单个文件内容

当 `filename` 为目录时，解析器会遍历该目录以及嵌套子目录

#### 可选参数 `--plugin / -p "name:options..."`

使用 `gozz run` 必须指定 1 ~ N 个插件运行

```shell
# 指定单个插件
gozz run --plugin "foo" ./
# 简写参数
gozz run -p "foo" ./
# 指定多个插件
gozz run -p "foo" -p "bar" ./
```

单次运行指定多个插件时，插件们会按参数顺序串行执行，尽管每个插件运行前都会重新进行文件解析，
但基于文件元信息的版本解析缓存将会在进程内复用，因此同时指定多个插件会有更好体验。

#### 追加插件默认参数

在指定插件名后方使用 `:` 间隔，可以通过该参数追加插件默认参数：

```shell
# 使用foo插件 并为所有匹配的注解 添加两个默认选项 [ key:value key2:value2 ]
gozz run -p "foo:key=value:key2=value2" ./ 
```

注解 `+zz:foo:key=value3` 添加默认选项 `key=value:key2=value2` 后 等价于：

`+zz:foo:key=value3(已有值未被覆盖):key2=value2(缺省值使用默认)`

### `gozz install`

用法

```shell
gozz install [--output/-o] [--filepath/-f] [repository] 
```

运行该指令会尝试将提供的 `repository` 代码编译为 `.so` 插件文件，并安装至用户目录 `~/.gozz/plugins`
( 或 `GOZZ_PLUGINS_DIR` 指定目录 ) 下。

#### 参数 `repository`

当 `repository` 带有网络协议前缀时，如 `ssh://、git://、http://、https://` ，会使用 `git` 进行仓库远程下载，
否则会视为本地文件路径。

#### 可选参数 `--output / -o`

指定该参数时，编译结果会输出为指定文件名，不再自动安装到用户目录。

#### 可选参数 `--filename / -f`

指定该参数时，编译会使用该参数作为相对路径进行编译。

例：

```shell
gozz install https://github.com/go-zing/gozz-plugins -f ./ormdrivers/mysql -o orm-mysql.so
```

则会下载远程项目，在项目内进行插件编译

```
go build --buildmode=plugin -o orm-mysql.so ./ormdrivers/mysql
```

#### 使用该指令成功安装外部插件需要满足以下前提：

- 编译当前 `gozz` 使用的 Golang 版本和当前执行环境 Golang 版本一致。
- 指定 `repository` 依赖兼容当前 `gozz` 版本使用的 `gozz-core`。
- 其他影响 Golang 插件机制的环境因素：
  [一文搞懂Go语言的plugin](https://tonybai.com/2021/07/19/understand-go-plugin/)。

### 全局参数

#### `-x / --extension [filename]`

例：

```shell
# 运行 list
gozz -x plugin.so list
# 运行 run
gozz -x plugin.so run -p "plugin" ./
```

使用该参数可以在工具启动时 额外加载指定文件路径的 `.so` 插件，通过此方式加载的插件如果发生异常，会输出异常信息并立即退出进程。

## 注解语法

注解遵循以下语法：

以**注释**形式紧贴**代码声明对象**

```go
// +zz:[PLUGIN][:ARGS][:OPTIONS]
type T interface{}
```

### PLUGIN - 插件名

不同插件在注册到内核时会有唯一的插件名标识，这个标识也会用来为各个插件匹配注解，忽略大小写。

如：插件 `Foo` 会使用 `+zz:foo` 匹配注解

### ARGS - 必填参数

不同插件会指定固定数量的必填参数，参数会以 `:` 间隔按插件指定顺序追加在注解后，
如果该注解的固定参数数量不足，将会被忽略。

如：

插件 `foo` 指定的参数数量为 2，符合要求注解为 `+zz:foo:arg1:arg2`

而 `+zz:foo:arg1` 或 `+zz:foo` 会被忽略

#### 为什么要忽略

如果一个缺省参数是可以被推断默认值的，按[设计理念](./README.md#设计理念)，此参数不应被列为必填参数。

### OPTIONS - 可填参数

超出插件指定必填参数后的内容，会被按 `Key = Value` 组解析为可选参数提供给插件

如：

插件 `foo` 指定的参数数量为 2

`+zz:foo:arg1:arg2:arg3=value:arg4`

将会被解析出 可选参数 `{"arg3":"value","arg4":""}`

#### 重复参数

在可选参数 Value 中，如果存在数组类值，一般都会使用 `,` 进行分隔，如：

```go
// +zz:foo:set=a,b,c,d
type T interface{}
```

解析器会将，相同 Key 的 Value 以这方式进行聚合 (包括空值)

```go
// +zz:foo:set=a:set=:set=b:set=c,d
type T interface{}
```

等价于

```go
// +zz:foo:set=a,,b,c,d
type T interface{}
```

#### Boolean Option

部分可选参数，插件判断以某个Key是否存在，来判断特性是否开启。

此类参数如果 Value 不为空，会额外判断 Value 是否为 `0 / false / null` 等否定含义。

即:

- `+zz:bar:arg3=value:arg4` -> `{"arg3":"value","arg4":""}`
- `+zz:bar:arg3=value:arg4=true` -> `{"arg3":"value","arg4":"true"}`
- `+zz:bar:arg3=value:arg4=false` -> `{"arg3":"value"}`
- `+zz:bar:arg3=value:arg4=0` -> `{"arg3":"value"}`

#### 参数转义

部分插件参数值可能会出现 `:` 字符串的情况，可以使用 `\` 对 `:` 进行转义，对命令行参数及注解内参数均生效。

即：

`+zz:plugin:addr=localhost:8080` -> `+zz:plugin:addr=localhost\:8080`

:::warning 转义原理
解析器在分隔注解参数时会先将 `\:` 替换为 `\u003A`，
在分隔后再将子串转义替换成 `:`。
:::

### 声明对象

注解可以添加在 `Decl` 代码块，也可以添加给指定的 `Spec` 对象。

不理解 `Decl` 和 `Spec` 定义的可以先看下 [原理](./how-it-works) 部分。

```go
package t

// +zz:foo
type (
	T0 interface{}
	T1 interface{}

	// +zz:bar
	T2 interface{}
)

// +zz:foo
type T3 interface{}
```

在 `Decl` 范围声明的注解，会被复制给 `Decl` 内定义的所有 `Spec` 对象内，即上例等价于：

```go
package t

type (
	// +zz:foo
	T0 interface{}
	// +zz:foo
	T1 interface{}

	// +zz:foo
	// +zz:bar
	T2 interface{}
)

// +zz:foo
type T3 interface{}
```

### 多行注解

#### 注解判定

只要是和声明对象关联的注释，在每行行首 (忽略空白字符串) 存在注解前缀 `+zz:` 都会被认为是注解行。

```go
/*
+zz:foo  <- 注解行
  +zz:foo  <- 注解行
 x +zoo:foo <- 非注解行
//   +zoo:foo  <- 非注解行
*/
type T1 interface{}

// +zz:foo  <- 注解行
//   +zoo:  <- 注解行
//   +zoo-  <- 非注解行
// x +zoo:foo <- 非注解行
type T2 interface{}
```

#### 重复注解

一个代码声明对象上可能会有多个注解，且可能会是相同插件的重复注解，这些注解不会被认为是异常，而是会被重复提供给插件。

具体对于同对象重复注解的处理方式和结果，会基于不同插件实现逻辑而不同。

```go
// +zz:foo
// +zz:bar
// +zz:bar:filename=./bar
type T interface{}
```

## 其他约定

### 生成文件路径

一部分的内置插件会有生成目标文件的必填或可选参数，如：

```go
// +zz:api:./
// +zz:impl:./impl.go
// +zz:wire:inject=/
type API interface{}
```

这些目录文件目标路径会遵循以下规则：

假设项目根路径在 `/go/src/project/`

``` 
/go/src/project/
├── go.mod
└── types
    └── api.go
```

#### 1. 如果包含 `.go` 后缀，则以该文件名为生成目标文件名

```go
// /go/src/project/types/api.go

// +zz:api:./api.go
type API interface{}
```

以上例子生成的文件名为 `api.go` 具体目录路径会在后续规则说明

#### 2. 不包含 `.go` 后缀，则会使用插件提供的默认文件名

插件使用的默认文件名大部分是  `zzgen.${plugin}.go`

```go
// /go/src/project/types/api.go

// +zz:api:./
type API interface{}
```

以上例子生成的文件名为 `zzgen.api.go`

#### 3. 路径参数支持 Golang 模版语法

支持的模版对象字段有 `Name` `Package`

同时支持一系列字符串函数 `snake / camel ...` [详情见此](https://github.com/go-zing/gozz-core/blob/main/generate.go#L32)

```go
// /go/src/project/types/api.go

// +zz:api:./{{ lower .Name }}.go
type Foo interface{}
```

以上例子生成的文件名为 `foo.go`

#### 4. 如果文件名是相对路径，那么起点是 注解当前的文件所在目录

```go
// /go/src/project/types/api.go

// +zz:api:./apix.go
type API interface{}
```

以上指定 `.go` 文件名例子生成的文件完整路径为  `/go/src/project/types/apix.go`

<br>

```go
// /go/src/project/types/api.go

// +zz:api:./apix
type API interface{}
```

以上不指定 `.go` 文件名例子生成的文件完整路径为  `/go/src/project/types/apix/zzgen.api.go`

#### 5. 如果文件名是绝对路径，那么起点是 注解文件所在 `module` 项目根目录 ( `go.mod` 所在目录 )

该目录通过在注解文件所在目录执行 `go env GOMOD` 获取

```go
// /go/src/project/types/api.go

// +zz:api:/apix.go
type API interface{}
```

以上指定 `.go` 文件名例子生成的文件完整路径为  `/go/src/project/apix.go`

<br>

```go
// /go/src/project/types/api.go

// +zz:api:/apix
type API interface{}
```

以上不指定 `.go` 文件名例子生成的文件完整路径为  `/go/src/project/apix/zzgen.api.go`

<br>

假设在 `types` 目录内存在子 `module`

```
/go/src/project/
├── go.mod
└── types
    ├── api.go
    └── go.mod
```

```go
// /go/src/project/types/api.go

// +zz:api:/
type API interface{}
```

以上例子生成的文件完整路径会变为  `/go/src/project/types/zzgen.api.go`

### 生成模版

对于覆盖式模版生成代码，生成代码文件前会检查该目录是否存在已有的 `${filename}.tmpl` 文件。

若有，则会直接读取该模版文件作为生成模版。

否则，将会使用插件内建的默认模版文本，并输出为 `${filename}.tmpl` 模版文件在生成代码同目录。

:::tip
若要重置模版文件，请删除已存在的 `.tmpl` 模版文件，再重新进行生成默认模版。
:::