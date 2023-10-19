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

```
/tag01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/tag01
└── types.go
```

```go
// tag01/types.go
package tag01

// +zz:tag:json,bson:{{ snake .FieldName }}
type User struct {
	Id        string
	Name      string
	Address   string
	CreatedAt time.Time
	UpdatedAt time.Time
}
```

Use annotation to specify `json` `bson` in snake case `FieldName`

执行 `gozz run -p "tag" ./`

```go
// tag01/types.go
package tag01

// +zz:tag:json,bson:{{ snake .FieldName }}
type User struct {
	Id        string    `bson:"id" json:"id"`
	Name      string    `bson:"name" json:"name"`
	Address   string    `bson:"address" json:"address"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}
```

`bson` `json` tags were correctly generated.

New tags would follow letter order by key.

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag02)

```
/tag02/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/tag02
└── types.go
```

```go
// tag02/types.go
package tag02

// +zz:tag:json,bson:{{ camel .FieldName }}
type User struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
```

This struct has exist `json` tag, use annotation to specify camel case `json` `bson`.

Execute `gozz run -p "tag" ./`.

```go
// tag02/types.go
package tag02

// +zz:tag:json,bson:{{ camel .FieldName }}
type User struct {
	Id        string    `json:"id" bson:"id"`
	Name      string    `json:"name" bson:"name"`
	Address   string    `json:"address" bson:"address"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}
```

All `json` tags were updated as `camelCase` and `bson` tags were generated.

### Example-03

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag03)

```
/tag03/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/tag03
└── types.go
```

```go
// tag03/types.go

package tag03

// +zz:tag:json,bson:{{ snake .FieldName }}
type (
	User struct {
		Id        string
		Name      string
		Address   string
		CreatedAt time.Time
		UpdatedAt time.Time
	}

	Book struct {
		Id        string
		Title     string
		CreatedAt time.Time
		UpdatedAt time.Time
	}

	Order struct {
		Id        string
		UserId    string
		BookId    string
		CreatedAt time.Time
		UpdatedAt time.Time
	}
)
```

These struct do not have any tags.
Use `Decl` scope annotation to specify snake case `json` `bson`.

Execute `gozz run -p "tag" ./`.

```go
// tag03/types.go

package tag03

// +zz:tag:json,bson:{{ snake .FieldName }}
type (
	User struct {
		Id        string    `bson:"id" json:"id"`
		Name      string    `bson:"name" json:"name"`
		Address   string    `bson:"address" json:"address"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}

	Book struct {
		Id        string    `bson:"id" json:"id"`
		Title     string    `bson:"title" json:"title"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}

	Order struct {
		Id        string    `bson:"id" json:"id"`
		UserId    string    `bson:"user_id" json:"user_id"`
		BookId    string    `bson:"book_id" json:"book_id"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}
)
```

Tags `bson` `json` were generated in desired format.

### Example-04

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag04)

```go
// tag04/types.go

package tag04

// +zz:tag:json,bson:{{ snake .FieldName }}
type (
	User struct {
		Id        string    `bson:"id" json:"id"`
		Name      string    `bson:"name" json:"name"`
		Address   string    `bson:"address" json:"address"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}

	// +zz:tag:json,bson:{{ camel .FieldName }}
	Book struct {
		Id        string    `bson:"id" json:"id"`
		Title     string    `bson:"title" json:"title"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}

	Order struct {
		Id     string `bson:"id" json:"id"`
		UserId string `bson:"user_id" json:"user_id"`
		BookId string `bson:"book_id" json:"book_id"`
		// +zz:tag:json,bson:{{ upper .FieldName | upper }}
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		// +zz:tag:+json:,omitempty
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}
)
```

This example have a bit difference with [Example-03](./tag.md#example-03) about some struct and field.

Execute `gozz run -p "tag" ./`.

```go
// tag04/types.go

package tag04

// +zz:tag:json,bson:{{ snake .FieldName }}
type (
	User struct {
		Id        string    `bson:"id" json:"id"`
		Name      string    `bson:"name" json:"name"`
		Address   string    `bson:"address" json:"address"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}

	// +zz:tag:json,bson:{{ camel .FieldName }}
	Book struct {
		Id        string    `bson:"id" json:"id"`
		Title     string    `bson:"title" json:"title"`
		CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
		UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
	}

	Order struct {
		Id     string `bson:"id" json:"id"`
		UserId string `bson:"user_id" json:"user_id"`
		BookId string `bson:"book_id" json:"book_id"`
		// +zz:tag:json,bson:{{ snake .FieldName | upper }}
		CreatedAt time.Time `bson:"CREATED_AT" json:"CREATED_AT"`
		// +zz:tag:+json:,omitempty
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at,omitempty"`
	}
)
```

The specify struct and fields were updated as desired.

### Example-05

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/tag05)

```
/tag05/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/tag05
└── types.go
```

```go
// tag05/types.go
package tag05

// +zz:tag:json,bson:{{ snake .FieldName }}
type (
	UserStruct struct {
		Id        string
		Name      string
		Address   string
		CreatedAt time.Time
		UpdatedAt time.Time
		Friends   []struct {
			Id        string
			Name      string
			Address   string
			CreatedAt time.Time
			UpdatedAt time.Time
		}
	}

	UserMap map[string]struct {
		Id        string
		Name      string
		Address   string
		CreatedAt time.Time
		UpdatedAt time.Time
	}

	UserSlice []struct {
		Id        string
		Name      string
		Address   string
		CreatedAt time.Time
		UpdatedAt time.Time
	}

	UserInterface interface {
		User() struct {
			Id        string
			Name      string
			Address   string
			CreatedAt time.Time
			UpdatedAt time.Time
		}
	}

	UserFunc func(struct {
		Id        string
		Name      string
		Address   string
		CreatedAt time.Time
		UpdatedAt time.Time
	})
)
```

This example shows most common complex types and struct embed.

Execute `gozz run -p "tag" ./`

```go
// tag05/types.go
package tag05

// +zz:tag:json,bson:{{ snake .FieldName }}
type (
	UserStruct struct {
		Id        string    `bson:"id" json:"id"`
		Name      string    `bson:"name" json:"name"`
		Address   string    `bson:"address" json:"address"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
		Friends   []struct {
			Id        string    `bson:"id" json:"id"`
			Name      string    `bson:"name" json:"name"`
			Address   string    `bson:"address" json:"address"`
			CreatedAt time.Time `bson:"created_at" json:"created_at"`
			UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
		} `bson:"friends" json:"friends"`
	}

	UserMap map[string]struct {
		Id        string    `bson:"id" json:"id"`
		Name      string    `bson:"name" json:"name"`
		Address   string    `bson:"address" json:"address"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}

	UserSlice []struct {
		Id        string    `bson:"id" json:"id"`
		Name      string    `bson:"name" json:"name"`
		Address   string    `bson:"address" json:"address"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	}

	UserInterface interface {
		User() struct {
			Id        string    `bson:"id" json:"id"`
			Name      string    `bson:"name" json:"name"`
			Address   string    `bson:"address" json:"address"`
			CreatedAt time.Time `bson:"created_at" json:"created_at"`
			UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
		}
	}

	UserFunc func(struct {
		Id        string    `bson:"id" json:"id"`
		Name      string    `bson:"name" json:"name"`
		Address   string    `bson:"address" json:"address"`
		CreatedAt time.Time `bson:"created_at" json:"created_at"`
		UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	})
)
```

All these cases were supported.