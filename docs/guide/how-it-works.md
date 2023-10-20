# How It Works

The main workflow of `Gozz` in short：

Collects all rule match comments as annotations and setup context meta-info.
Plugins would use these entities to do extra analysis and do stuffs.

To understand how these annotated objects were analyzed.
We should have knowledge about `Golang AST`.

## What is `AST`

**Abstract Syntax Tree**, it was a kind of structured presentation of codes.
Most of the programing languages would parse codes into `AST` object before execute or compile.
It is also a middle-state between Golang codes and executable binary.

After parsed codes as `AST`, we could treat codes like a structured object, to walk nodes,
visit and detect node expression and do programing modify or analysis.
It would provide more flexibility than treat codes as text.

Golang provide official syntax parser `go/ast` library,
so we can get `AST` as same as compiler,
also Golang provide `go/format` to convert `AST` into formatted text,
that bring great convenience for Golang toolkit ecosystem.

Common tools used by gopher such as `gofmt` / `golangci-lint` was mainly based on `go/ast`.

## Golang AST in short

In `Golang AST`, we can consider most of the codes blocks below `package` as `Decl` (declaration).

`Decl` has two types: `GenDecl` (generic declaration) and `FuncDecl` (function declaration).

We could simply consider most of the declarations except `func` were `GenDecl`.

Example:

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

Except of `FuncDecl`, codes object in `GenDecl` blocks would be called `Spec`,
with types `TypeSpec / ValueSpec / ImportSpec`.

`Spec` does not contains keywords token,
but type of `Spec` is decided by keywords ahead (`const/var/import/type`).

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

Golang would relate comments to neighboring object, and according to their position,
comments could be divided into `Doc` or `Comment`.

`Doc` is comments on object, and `Comment` is comments behind object.

`Decl` objects only got `Doc`, while `Spec` objects have both `Doc` and `Comment`.

You can check out the detect principle in [Doc Example 2](plugins/doc.md#example-02)

Example:

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

## Annotations Analysis

### Syntax Analysis

Before plugin execute, CLI core would parse files object comments and match comments from `AST`.
Comments would be split in lines and seperated into annotations or documents.

All object with annotations would be collected as `AnnotationDecl`
( mainly `Spec` object except from `FuncDecl`).
And all these opened file info and parsed `AST` would be cached in memory.

### Annotations Parse

Before `AnnotationDecl` pass into plugin execution,
core would parse `AnnotationDecl`'s annotations with plugin name in lines.
`AnnotationDecl` may have several plugin-match annotations.

Every matched annotations would be parsed into exact and optional arguments,
and merged with CLI command extend options.
At last combined with `AnnotationDecl` as `DeclEntity` object.

The core method of every plugin is how to make use of these matched `DeclEntity`.

### Process Runtime

We could specify multi plugins in order in a command. Example:

```shell
gozz run -p "api" -p "impl" -p "doc" -p "wire" ./
```

`Gozz` would do analysis before every plugin execute,
because previous plugin may modify or generate files.

But previous analysis would cache files and parsed results.
These caches may be reused only if file not modified.
Therefore, use multi plugins could get maximum reuse of parser cache,
and get better performance than split plugins in single run.
