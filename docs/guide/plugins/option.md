# Option

Generates `Functional Options` style codes

## Usage

### Annotation

`+zz:option`

### Annotation Target

`struct` object

### Optional Arguments

#### `type`

Specify type name for option function

Example:`+zz:option:type=Option`

## Example

### Example-01

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/option01)

<<< @/gozz-doc-examples/option01/types.go

Execute `gozz run -p "option" ./`, and it generates file `zzgen.option.go` and template file.

<<< @/gozz-doc-examples/option01/zzgen.option.go

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/option02)

Add annotations on different struct with option `type`.

<<< @/gozz-doc-examples/option02/types.go

Execute `gozz run -p "option" ./`, and it generates file `zzgen.option.go` and template file.

<<< @/gozz-doc-examples/option02/zzgen.option.go