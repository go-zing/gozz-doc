# Tag

用于快速模板化填充结构体字段标签

## 使用

### 注解

`+zz:tag:[tag]:[format]`

### 注解对象

所有 `TypeSpec` 对象 和 被注解类型内部的结构体 `Field`

### 必填参数

#### `tag`

生成标签的 Key，若有多 Key 重复 Value 可使用 `,` 分隔

示例： <span v-pre> `+zz:tag:json,form,bson,sql:{{ snake .FieldName }}` </span>

<br>

注解字段的 `tag` 可以使用 `+` 前缀，去对类型注解同个 `tag` 进行补充

示例:

```go
package x

// +zz:tag:json:{{ snake .FieldName }}
type T struct {
	// +zz:tag:+json:,omitempty
	ObjectId string `json:"object_id,omitempty"`
}

```

#### `format`

生成标签的 Value，模版数据包含 字段名 `FieldName` 和 字段文档 `Doc`，可以使用各种内置字符串处理模版函数。

示例： <span v-pre> `+zz:tag:json,form,bson,sql:{{ snake .FieldName }}` </span>

## 示例

### 示例一

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag01)

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

当前没有定义标签。使用注解指定：字段名 `snake_case` 格式的 `json` `bson` 标签。

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

`bson` `json` 标签被插入到代码中

新增标签的顺序会按 KEY 字典序排序

### 示例二

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag02)

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

当前已有定义 `json` 标签。使用注解指定：字段名 `camel` 格式的 `json` `bson` 标签。

执行 `gozz run -p "tag" ./`

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

`json` 标签值被更新为 `camelCase`，`bson` 标签被生成到代码中。

### 示例三

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag03)

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

当前没有定义标签。使用 `Decl` 注解为多个类型指定：字段名 `snake_case` 格式的 `json` `bson` 标签。

执行 `gozz run -p "tag" ./`

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

`bson` `json` 标签按格式插入到所有类型中

### 示例四

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag04)

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

对 [示例三](./tag.md#示例三) 中进行部分结构体和字段的定制化调整

执行 `gozz run -p "tag" ./`

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

被定制化的结构体和字段标签按格式更新

### 示例五

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag05)

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

该例子包含了大部分常见的复杂类型以及结构体内嵌场景

执行 `gozz run -p "tag" ./`

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

所有场景的结构体字段标签都可以被成功处理。