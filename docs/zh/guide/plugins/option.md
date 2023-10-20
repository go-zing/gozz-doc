# Option

用于快速生成 `Functional Options` 风格代码

## 使用

### 注解

`+zz:option`

### 注解对象

`struct` 类型对象

### 可选参数

#### `type`

为生成的函数选项创建一个指定的类型名

示例：`+zz:option:type=Option`

## 示例

### 示例一

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/option01)

<<< @/gozz-doc-examples/option01/types.go

执行 `gozz run -p "option" ./`，生成了 `zzgen.option.go` 文件

<<< @/gozz-doc-examples/option01/zzgen.option.go

### 示例二

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/option02)

对两个不同的结构体添加注解，并使用 `type` 选项。

<<< @/gozz-doc-examples/option02/types.go

执行 `gozz run -p "option" ./`，生成了 `zzgen.option.go` 文件

<<< @/gozz-doc-examples/option02/zzgen.option.go