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