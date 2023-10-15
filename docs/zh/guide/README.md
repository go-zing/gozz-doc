# 介绍

`Gozz` 由三部分组成：

1. `Gozz-core` 是 `Gozz` 运行的内核，包含了对于 Golang 文件语法解析以及从解析后的 AST 中提取 `+zz:${plugin}` 风格注解
   并解析为对应插件选项的工具，同时为各个插件提供包含 模版、生成、编辑、追加 文件的一系列封装库。

2. `Gozz` 是用户使用 `Gozz` 的客户终端，即 cli 工具运行的入口，包含了对用户命令的解析，插件的加载和实例化，以及对外部扩展的加载。

3. `Gozz` 中还提供了一系列强大的内置插件，囊括了作者在发起该项目时希望能够替自己解决以及将这些优秀设计快速落地到技术团队的一些核心功能需求，包括：
    - 如何快速构建API和输出API、业务领域文档，并减低持续迭代的多分发校对成本
    - 如何通过优化系统依赖架构提升项目可迭代性，同时优化多人大型项目协作效率
    - 如何灵活切面化注入技术性功能，提升可观测性同时尽可能降低开发者的埋点工作量

## 理念

编程 就是将 **重复、繁琐的事情** ，将成熟的方案 通过程序化实现高效、低成本、规范化的解决

而我们的设计和开发过程中本身有很多工作，本身也是 **重复、繁琐的事情**

在我们一遍又一遍地去浪费时间做这些 低效开发时 本身就违背了编程的初衷和思想

`Gozz` 希望 将成熟的技术方法论 和 优秀的系统架构方案 高效、低成本、规范化地 传播和落地

并希望大家由此能

> Less, But Better

而 `Gozz` 实现这点的理念就是

> 最好的代码，是不需要每个人都写的代码

### 交互设计理念

`Gozz` 遵循 [约定优于配置](https://zh.wikipedia.org/wiki/%E7%BA%A6%E5%AE%9A%E4%BC%98%E4%BA%8E%E9%85%8D%E7%BD%AE)

会尽可能使用 **简洁** 和 **符合人类直觉** 的 命令 / 注解 / 参数

## 适用场景

### 个人

`Gozz` 不会在 Feature 中强调对初阶 Gopher 的友好性，因为 **`注释注解`是非官方的特性** ，我们不希望引入额外认知成本 从而影响
Gopher 对 Golang 本身的学习曲线

一方面 `Gozz` 部分插件的生成结果的使用 需要开发者对 Golang 类型和 `interface` 系统 甚至 `reflect` 有一定深入认知

另一方面 对于 `Gozz 解决的到底是什么问题` 也需要对 系统架构 和 设计模式 有一定的认知前提

如果你有使用 `JAVA Spring` 的经验，那么恭喜，你可以有一定的认知优势

`Gozz` 解决需求的思路学习了 `JAVA Spring` 一些重要设计思想，**但绝不是拙劣地模仿**。

### 团队

`人月神话` 中有 `保有概念整体性` 的说法 这个系统设计理念也是笔者比较认同 即：

**系统的核心架构设计 需要由极少数人专制控制**

因此，使用 `Gozz` 的时候，团队需要由一个核心的架构师角色给出适合团队的 `Gozz` 配置 以及 维护生成模板和适配层

在团队内 即使是不同的业务项目 在 `Gozz` 的使用上 都不应该产生过多分歧

而其他成员 只需要遵循团队的规范 将运行 `Gozz` 的指令写到 项目 `Makefile` 或构建工具 在 代码变更 及 提交之前 去执行

##### *实际上，笔者在以往工作团队中推广 `Gozz` 的前世内部版本 也是以相同的模式进行*

但是 `Gozz` 鼓励所有团队角色去主动探索和学习 如何去优化业务和项目的架构设计 用更低的成本 办 更多更好的事

`Gozz` 也将会在项目示例中提供一些最佳实践 供开发者们参考

### 微服务 or 单体

`Gozz` 并不针对微服务场景，相反，越大型的项目和协作团队，会越容易从 `Gozz` 中受益更多

实际上 微服务 只代表 服务在企业业务依赖领域设计中 的 `Micro` 或 `Pluggable` ，从来不代表 项目代码架构层级和设计的简单

因此 如果你希望团队的微服务项目代码质量能够得到一定的提升 也欢迎使用 `Gozz` 去组织团队的开发

## 工作原理

`Gozz` 的核心工作简单概括，就是：将开发者在代码中符合条件的所有注解收集，并结合相关上下文提供给各个插件进行进一步的代码编辑或生成。

要理解注解的分析和上下文，需要对 `Golang AST` 的基本概念有一定的了解。

### Golang AST 简介

在 `Golang AST` 中，我们大部分的代码块，可以被理解为一种 `Decl` 即 `Declaration`，也是由关键字识别的第一级代码块。

而 `Decl` 中 主要又分为 `GenDecl` (generic) 和 `FuncDecl` (function)。

可以粗略地认为，除 `func` 开头的 都是 `GenDecl`

如

```go
package x

// GenDecl
import (
	_ "go/ast"
)

// GenDecl
var A = 1

// GenDecl
var (
	B  = 2
	B2 = 2
)

// GenDecl
type C int

// GenDecl
type (
	D  struct{}
	D2 struct{}
)

// GenDecl
const E = 3

// GenDecl
const (
	F  = 4
	F2 = 4
)

// FuncDecl
func G() {}

```

而除了 `FuncDecl` 外，`GenDecl` 下的第二级定义被称为 `Spec`, 主要分为 `TypeSpec / ValueSpec / ImportSpec`。

`Spec` 部分不会包含关键字，但是 `Spec` 的类型是由关键字判定的 (`const/var/import/type`)。

```go
package x

// GenDecl
import (
	// ImportSpec
	_ "go/ast"
)

// GenDecl
var A = 1 // ValueSpec

// GenDecl
var (
	// ValueSpec
	B = 2
	// ValueSpec
	B2 = 2
)

// GenDecl
type C int // TypeSpec

// GenDecl
type (
	// TypeSpec
	D struct{}
	// TypeSpec
	D2 struct{}
)

// GenDecl
const E = 3 // ValueSpec

// GenDecl
const (
	F  = 4 // ValueSpec
	F2 = 4 // ValueSpec
)

```

Golang 在处理注释时，如果注释紧贴对象，会被认为是该对象的注释，并分为两类 `Doc` 和 `Comment`。

`Doc` 即为紧贴对象上方的注释，`Comment` 即为在对象后方的注释。

`Decl` 类型对象只有 `Doc` 而 `Spec` 类型一般会有 `Doc` 和 `Comment`。

如下：

```go
package x

// GenDeclDoc
import (
	// ImportSpecDoc
	_ "go/ast" // ImportSpecComment
)

// GenDeclDoc
var A = 1 // ValueSpecComment

// GenDeclDoc
type (
	// TypeSpecDoc
	B struct {
	} // TypeSpecComment

	// TypeSpecDoc
	B2 struct {
	}
)

// FuncDeclDoc
func x() {}

```

### 注解分析过程

#### 语法解析

启动后会遍历分析指定目录及子目录内所有 Golang 文件 `FuncDecl` 和 其他各种 `Spec` 的注释（包括 `Doc` 和 `Comment`），
并分行匹配出注解。有注解的对象注释会被按行划分为 注解 和 文档。

预处理阶段会收集出所有被注解的 `注解对象 AnnotatedDecl` ( 实际上除了 `FuncDecl` 之外都是 `Spec` )，
并缓存相关的文件信息和 AST 解析信息在内存中。

#### 注解解析

在将注解对象正式分配给插件时，会将所有被注解对象的注解按行匹配出符合被调动插件的注解，
每个注解对象都会被匹配到 0 ~ N 次。

被匹配的**每条注解**会解析注解参数，并与运行命令的添加的额外参数进行合并，
和被注解对象组成一个新的对象 `注解实例 DeclEntity`，
每个插件的核心功能就是利用匹配到的若干个注解实例去进行不同的自定义代码分析处理。

#### 全局运行时

在一次命令运行中，可以指定多个插件按顺序执行，如

```shell
gozz run -p "api" -p "impl" -p "doc" -p "wire" ./
```

因为不同插件运行后可能会产生新的文件以及被注解对象，`Gozz` 在每个插件处理插件实例前都会重新对目标目录或文件进行遍历解析。

由于之前的解析已经缓存了文件内容和解析的结果，只要文件没有被前置运行的插件修改，这些缓存都能够被有效复用。
因此运行时指定多个插件，有效利用解析缓存，理论上会有更快的处理速度。