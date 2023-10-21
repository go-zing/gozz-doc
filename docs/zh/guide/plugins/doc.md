# Doc

用于生成被注解对象的注释映射表，以及部分包含字段类型的字段注释映射。

## 使用

### 注解

`+zz:doc[:options...]`

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

<<< @/gozz-doc-examples/doc01/types.go

为代码中的对象添加注释

执行 `gozz run -p "doc" ./`

生成了 `doc01/zzgen.doc.go` 和默认模版 `doc01/zzgen.doc.go.tmpl`

<<< @/gozz-doc-examples/doc01/zzgen.doc.go

所有注解对象的注释根据  `TypeSpec` 或 `ValueSpec` 收集到了 `_types_doc` 和 `_values_doc`。

`interface` 和 `struct` 类型提供了字段注释的索引，对数据类型提供了 `FieldDoc` 的类方法。

`_values_doc` 下再通过注解指定的 `label` 对不同的值进行分组。

### 示例二

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/doc02)

<<< @/gozz-doc-examples/doc02/types.go

这个示例会展示 `Golang AST` 对对象注释关联的有效判定范围

执行 `gozz run -p "doc" ./`，注意观察 生成的 `zzgen.doc.go`

<<< @/gozz-doc-examples/doc02/zzgen.doc.go