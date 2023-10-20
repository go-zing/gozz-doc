# Tag

模版化管理结构体字段标签

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

<<< @/gozz-doc-examples/tag01/.types.pre.go

当前没有定义标签。使用注解指定：字段名 `snake_case` 格式的 `json` `bson` 标签。

执行 `gozz run -p "tag" ./`

<<< @/gozz-doc-examples/tag01/types.go

`bson` `json` 标签被插入到代码中

新增标签的顺序会按 KEY 字典序排序

### 示例二

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag02)

<<< @/gozz-doc-examples/tag02/.types.pre.go

当前已有定义 `json` 标签。使用注解指定：字段名 `camel` 格式的 `json` `bson` 标签。

执行 `gozz run -p "tag" ./`

<<< @/gozz-doc-examples/tag02/types.go

`json` 标签值被更新为 `camelCase`，`bson` 标签被生成到代码中。

### 示例三

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag03)

<<< @/gozz-doc-examples/tag03/.types.pre.go

当前没有定义标签。使用 `Decl` 注解为多个类型指定：字段名 `snake_case` 格式的 `json` `bson` 标签。

执行 `gozz run -p "tag" ./`

<<< @/gozz-doc-examples/tag03/types.go

`bson` `json` 标签按格式插入到所有类型中

### 示例四

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag04)

<<< @/gozz-doc-examples/tag04/.types.pre.go

对 [示例三](./tag.md#示例三) 中进行部分结构体和字段的定制化调整

执行 `gozz run -p "tag" ./`

<<< @/gozz-doc-examples/tag04/types.go

被定制化的结构体和字段标签按格式更新

### 示例五

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/tag05)

<<< @/gozz-doc-examples/tag05/.types.pre.go

该例子包含了大部分常见的复杂类型以及结构体内嵌场景

执行 `gozz run -p "tag" ./`

<<< @/gozz-doc-examples/tag05/types.go

所有场景的结构体字段标签都可以被成功处理。