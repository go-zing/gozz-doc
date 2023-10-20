# Tag

Manager struct field tag in templating mode.

## Usage

### Annotation

`+zz:tag:[tag]:[format]`

### Annotation Target

All `TypeSpec` object and struct fields in annotated type.

### Exact Arguments

#### `tag`

Specify tag key, if there are multi key with same value, use `,` to separate them.

Example: <span v-pre> `+zz:tag:json,form,bson,sql:{{ snake .FieldName }}` </span>

<br>

Use `tag` begins with `+`, to append same key value.

Example:

```go
package x

// +zz:tag:json:{{ snake .FieldName }}
type T struct {
	// +zz:tag:+json:,omitempty
	ObjectId string `json:"object_id,omitempty"`
}

```

#### `format`

Specify generate tag value, could use template data contains `FieldName` and field doc `Doc`.
Strings functions like `snake` / `camel`  are also provided.

Example: <span v-pre> `+zz:tag:json,form,bson,sql:{{ snake .FieldName }}` </span>

## Examples

### Example-01

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag01)

<<< @/gozz-doc-examples/tag01/.types.pre.go

Use annotation to specify `json` `bson` in snake case `FieldName`

执行 `gozz run -p "tag" ./`

<<< @/gozz-doc-examples/tag01/types.go

`bson` `json` tags were correctly generated.

New tags would follow letter order by key.

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag02)

<<< @/gozz-doc-examples/tag02/.types.pre.go

This struct has exist `json` tag, use annotation to specify camel case `json` `bson`.

Execute `gozz run -p "tag" ./`.

<<< @/gozz-doc-examples/tag02/types.go

All `json` tags were updated as `camelCase` and `bson` tags were generated.

### Example-03

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag03)

<<< @/gozz-doc-examples/tag03/.types.pre.go

These struct do not have any tags.
Use `Decl` scope annotation to specify snake case `json` `bson`.

Execute `gozz run -p "tag" ./`.

<<< @/gozz-doc-examples/tag03/types.go

Tags `bson` `json` were generated in desired format.

### Example-04

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag04)

<<< @/gozz-doc-examples/tag04/.types.pre.go

This example have a little different from [Example-03](tag.md#example-03) about some struct and field.

Execute `gozz run -p "tag" ./`.

<<< @/gozz-doc-examples/tag04/types.go

The specify struct and fields were updated as desired.

### Example-05

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag05)

<<< @/gozz-doc-examples/tag05/.types.pre.go

This example shows most common complex types and struct embed.

Execute `gozz run -p "tag" ./`

<<< @/gozz-doc-examples/tag05/types.go

All these cases were supported.