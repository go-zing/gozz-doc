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

示例： `+zz:doc:label=book_type`