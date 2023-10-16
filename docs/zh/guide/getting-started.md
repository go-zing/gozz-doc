# 快速上手

`Gozz` 命令行工具基于 [cobra](https://github.com/spf13/cobra) 构建，命令行交互语法遵循格式：

```shell
gozz [--GLOBAL-FLAG] [COMMAND] [--COMMAND-FLAG] [ARG]
```

## 环境

`Gozz` 在启动时会自动加载用户目录 `~/.gozz/plugins/` 下的 `.so` 插件，期间发生的异常会被忽略。

## 指令

`Gozz` 支持以下指令：

### `gozz list`

该指令会列出已经被正确注册的插件，并且输出插件和参数相关的介绍到控制台，使用者也可以通过该指令来检查插件是否被正确加载。

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

---

在指定插件名后方使用 `:` 间隔，可以通过该参数追加插件默认选项：

```shell
# 使用foo插件 并为所有匹配的注解 添加两个默认选项 [ key:value key2:value2 ]
gozz run -p "foo:key=value:key2=value2" ./ 
```

注解 `+zz:foo:key=value3` 添加默认选项 `key=value:key2=value2` 后 等价于：

`+zz:foo:key=value3(已有值未被覆盖):key2=value2(缺省值使用默认)`

### [WIP] `gozz install`

用法

```shell
gozz install [--output/-o] [--filename/-f] [repository] 
```

运行该指令会尝试将提供的 `repository` 代码编译为 `.so` 插件文件，并安装至用户目录 `~/.gozz/plugins` 下。

#### 参数 `repository`

当 `repository` 带有网络协议前缀时，如 `ssh://、git://、http://、https://` ，会使用 `git` 进行仓库远程下载，
否则会视为本地文件路径。

#### 可选参数 `--output / -o "filename"`

指定该参数时，编译结果会输出为指定文件名，不再自动安装到用户目录。

#### 可选参数 `--filename / -f "filename"`

指定该参数时，编译会使用该参数作为相对路径进行编译。

---

使用该指令成功安装外部插件需要满足以下前提：

- 编译当前 `gozz` 使用的 Golang 版本和当前执行环境 Golang 版本一致。
- 指定 `repository` 依赖兼容当前 `gozz` 版本使用的 `gozz-core`。
- 其他影响 Golang 插件机制的环境因素：
  [一文搞懂Go语言的plugin](https://tonybai.com/2021/07/19/understand-go-plugin/)。

## 全局参数

### `-x / --extension [filename]`

例：

```shell
# 运行 list
gozz -x plugin.so list
# 运行 run
gozz -x plugin.so run -p "plugin" ./
```

使用该参数可以在工具启动时 额外加载指定文件路径的 `.so` 插件，通过此方式加载的插件如果发生异常，会输出异常信息并立即退出进程。

## 大于配置的约定