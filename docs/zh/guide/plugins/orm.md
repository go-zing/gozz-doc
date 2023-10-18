# Orm

通过数据库

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