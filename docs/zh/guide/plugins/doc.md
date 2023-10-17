# Doc

用于生成被注解对象的注释映射表，以及部分包含字段类型的字段注释映射。

## 使用

### 注解

`+zz:doc:[...options]`

### 注解对象

除 `FuncDecl` 外支持的所有对象

### 可选参数

#### `label`

仅对 `ValueSpec` 类型对象生效，即全局常量和变量

可使用 `label` 对常量或变量进行分组，实现枚举或注册表的自动化管理。

示例： `+zz:doc:label=enum_type`

## 示例

### 示例一

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/doc01)

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

为代码中的对象添加注释

执行 `gozz run -p "doc" ./`

生成了 `doc01/zzgen.doc.go` 和默认模版 `doc01/zzgen.doc.go.tmpl`

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

所有注解对象的注释根据  `TypeSpec` 或 `ValueSpec` 收集到了 `_types_doc` 和 `_values_doc`。

`interface` 和 `struct` 类型提供了字段注释的索引，对数据类型提供了 `FieldDoc` 的类方法。

`_values_doc` 下再通过注解指定的 `label` 对不同的值进行分组。

### 示例二

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/doc02)

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

这个示例会展示 `Golang AST` 对对象注释关联的有效判定范围


执行 `gozz run -p "doc" ./`，注意观察 生成的 `zzgen.doc.go` 

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