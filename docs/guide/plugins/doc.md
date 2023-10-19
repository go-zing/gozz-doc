# Doc

Generates comments mapping table for annotated object, as well as fields comments.

## Usage

### Annotation

`+zz:doc:[...options]`

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

```
/doc01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/doc01
└── types.go
```

```go
// doc01/types.go
package doc01

// +zz:doc
type (
	// uuid to define unique entity
	UUID string

	// abstract type of entity
	Entity interface {
		// get entity uuid
		Id() UUID
		// get entity name
		Name() string
	}

	// entity for users
	User struct {
		// user uuid
		Id UUID
		// user name
		Name string
		// user gender
		Gender string
	}

	// entity for books
	Book struct {
		// book uuid
		Id UUID
		// book name
		Name string
		// book type
		Type string
	}
)

// +zz:doc:label=gender_type
const (
	// female
	GenderFemale = "female"
	// male
	GenderMale = "male"
	// other
	GenderOther = "other"
)

// +zz:doc:label=book_type
const (
	// books for children
	BookTypeChildren = "children"
	// books for tech
	BookTypeTech = "tech"
	// books for cook
	BookTypeCook = "cook"
)
```

Add comments on object.

Execute `gozz run -p "doc" ./`, and it generates file `zzgen.doc.go` and template file.

```go
// doc01/types.go
package doc01

var (
	_types_doc = map[interface{}]map[string]string{
		(*UUID)(nil):   _doc_UUID,
		(*Entity)(nil): _doc_Entity,
		(*User)(nil):   _doc_User,
		(*Book)(nil):   _doc_Book,
	}

	_values_doc = map[string]map[interface{}]string{
		"gender_type": map[interface{}]string{
			GenderFemale: "female",
			GenderMale:   "male",
			GenderOther:  "other",
		},
		"book_type": map[interface{}]string{
			BookTypeChildren: "books for children",
			BookTypeTech:     "books for tech",
			BookTypeCook:     "books for cook",
		},
	}

	_doc_UUID = map[string]string{
		"": "uuid to define unique entity",
	}

	_doc_Entity = map[string]string{
		"":     "abstract type of entity",
		"Id":   "get entity uuid",
		"Name": "get entity name",
	}

	_doc_User = map[string]string{
		"":       "entity for users",
		"Id":     "user uuid",
		"Name":   "user name",
		"Gender": "user gender",
	}

	_doc_Book = map[string]string{
		"":     "entity for books",
		"Id":   "book uuid",
		"Name": "book name",
		"Type": "book type",
	}
)

func (UUID) FieldDoc(f string) string { return _doc_UUID[f] }

func (User) FieldDoc(f string) string { return _doc_User[f] }

func (Book) FieldDoc(f string) string { return _doc_Book[f] }
```

- Annotated object comments were collected in `_types_doc` and `_values_doc`,
  according to `TypeSpec` or `ValueSpec`.
- Type `interface` and `struct` also contain comments for field.
- For data type, common `FieldDoc` method were generated.
- Values were grouped in `_values_doc` with different label.

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/doc02)

```
/doc02/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/doc02
└── types.go
```

```go
// doc02/types.go
package doc02

/*
1
2
*/
// +zz:doc
// 3
// 4
type T struct {
	// 5

	/*
		6
		7
	*/
	// 8
	// 9
	Field string // 10
	// 11

	// 12

	// 13
	Field2 string // 14
	// 15

	// 16
} // 17
// 18
```

This example would show you how `Golang AST` were detect object comments.

Execute `gozz run -p "doc" ./`, and focus on `zzgen.doc.go` generated.

```go
// doc02/zzgen.doc.go
package doc02

var (
	_types_doc = map[interface{}]map[string]string{
		(*T)(nil): _doc_T,
	}

	_doc_T = map[string]string{
		"":       "1\n2\n\n3\n4\n17",
		"Field":  "6\n\t\t7\n\n8\n9\n10",
		"Field2": "13\n14",
	}
)

func (T) FieldDoc(f string) string { return _doc_T[f] }
```