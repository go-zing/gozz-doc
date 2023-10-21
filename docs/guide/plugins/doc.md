# Doc

Generates comments mapping table for annotated object, as well as fields comments.

In common development we maintain docs and codes comments, but in some cases,
they should be same, it causes another problem is that what we had worked in code comments,
we should have it done once again in docs. This is a repetitive and boring job indeed.

So this is why this plugin were designed,
it could parse our comments in structure and could be used in Golang runtime.
So we could develop toolkits to do some secondary generate from them.

## Usage

### Annotation

`+zz:doc[:options...]`

### Annotation Target

All object except of `FuncDecl`.

### Optional Arguments

#### `label`

This option only works for `ValueSpec` object, such as `const` and `var` .

Use `label` to group values, to implement enum values or value set.

Example: `+zz:doc:label=enum_type`

## Examples

### Example-01

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/doc01)

<<< @/gozz-doc-examples/doc01/types.go

Add comments on object.

Execute `gozz run -p "doc" ./`, and it generates file `zzgen.doc.go` and template file.

<<< @/gozz-doc-examples/doc01/zzgen.doc.go

- Annotated object comments were collected in `_types_doc` and `_values_doc`,
  according to `TypeSpec` or `ValueSpec`.
- Type `interface` and `struct` also contain comments for field.
- For data type, common `FieldDoc` method were generated.
- Values were grouped in `_values_doc` with different label.

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/doc02)

<<< @/gozz-doc-examples/doc02/types.go

This example would show you how `Golang AST` were detect object comments.

Execute `gozz run -p "doc" ./`, and focus on `zzgen.doc.go` generated.

<<< @/gozz-doc-examples/doc02/zzgen.doc.go