# 原理

`Gozz` 的核心工作简单概括，就是：

将开发者在代码中符合条件的所有注释收集为注解，并结合注解所在的代码定义相关上下文，
提供给各个插件进行进一步的分析，进行代码编辑或生成。

要理解注解对象和上下文分析是如何怎样进行的，需要对 `Golang AST` 的基本概念有一定的了解。

## AST 是什么

`AST` 即 **Abstract Syntax Tree 抽象语法树** ，它是各种编程语言代码文件的一种结构化解析结果，
大部分的编程语言都会在编译或执行前将代码事先分析为 `AST` 对象，再进行下一步的处理，
`AST` 也是各位的 Golang 代码从文本变为可执行二进制的中间态之一。

将代码从文本文件转换为 `AST` 之后，我们就可以像操作程序结构化对象一样，去访问、分析、修改代码块里的任何内容，
从而提升我们在进行代码生成以及代码自动化编辑的稳定性和灵活性。

Golang 对开发者暴露了编译器使用的语法解析库 `go/ast` ，使得开发者可以直接享受与编译器一致的语法解析体验。
同时 Golang 还支持我们将 `AST` 重新格式化成文本，对语言的工具链生态提供极大的便利和可拓展性。

我们在用的很多工具，包括 `gofmt` / `golangci-lint` 等， `go/ast` 都发挥了极其核心的作用。

## Golang AST 简介

在 `Golang AST` 中，我们 `package` 下的大部分的代码块，可以被理解为一种 `Decl` (declaration) 声明对象，也是由关键字识别的第一级代码块。

而 `Decl` 分为 `GenDecl` (generic declaration) 和 `FuncDecl` (function declaration)。

可以粗略地认为，除 `func` 之外的声明对象都是 `GenDecl`。

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

`Spec` 部分不包含关键字，但是 `Spec` 的类型是由关键字判定的 (`const/var/import/type`)。

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

Golang 在处理注释时，和对象相邻的注释会被关联到该对象，并分为两类 `Doc` 和 `Comment`。

`Doc` 即为紧贴对象上方的注释，`Comment` 即为在对象后方的注释。

`Decl` 类型对象注释只有 `Doc` ，而 `Spec` 类型对象注释包含 `Doc` 和 `Comment`。

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

## 注解分析

### 语法解析

启动后会遍历分析指定目录及子目录内所有 Golang 文件 `FuncDecl` 和 其他各种 `Spec` 的注释（包括 `Doc` 和 `Comment`），
并分行匹配出注解。有注解的对象注释会被按行划分为 注解 和 文档。

预处理阶段会收集出所有被注解的 `注解对象 AnnotatedDecl` ( 除了 `FuncDecl` 之外基本是 `Spec` )，
并缓存相关的文件信息和 AST 解析信息在内存中。

### 注解解析

在将注解对象正式分配给插件时，会将所有被注解对象的注解按行匹配出符合被调动插件的注解，
每个注解对象都会被匹配到 0 ~ N 次。

被匹配的**每条注解**会解析注解参数，并与运行命令的添加的额外参数进行合并，
和被注解对象组成一个新的对象 `注解实例 DeclEntity`，
每个插件的核心功能就是利用匹配到的若干个注解实例去进行不同的自定义代码分析处理。

### 全局运行时

在一次命令运行中，可以指定多个插件按顺序执行，如

```shell
gozz run -p "api" -p "impl" -p "doc" -p "wire" ./
```

因为不同插件运行后可能会产生新的文件以及被注解对象，`Gozz` 在每个插件处理插件实例前都会重新对目标目录或文件进行遍历解析。

由于之前的解析已经缓存了文件内容和解析的结果，只要文件没有被前置运行的插件修改，这些缓存都能够被有效复用。
因此运行时指定多个插件，有效利用解析缓存，理论上会有更快的处理速度。