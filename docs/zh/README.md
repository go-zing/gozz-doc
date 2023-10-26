---
home: true
heroText: Gozz
heroImage: /logo.png
actionText: 快速上手 →
actionLink: ./guide/getting-started
features:
  - title: 简洁易用无侵入
    details: 直观明了的注解语法，干净利落的命令行工具，以及无需添加运行时依赖就能使用的生成代码。
  - title: 内置强大插件
    details: 自动化依赖注入、AOP接口代理、Interface -> Implement 同步、ORM、API路由表等。
  - title: 高拓展性
    details: 可自定义生成模版，提供代码分析、编辑、生成等内核库，基于 .so 快速开发和扩展外部插件。
---

::: slot footer
[Apache-2.0 Licensed](https://github.com/go-zing/gozz/blob/main/LICENSE) | Copyright © 2023-present Maple Wu
:::

## 功能快览

### 示例一

这里有一个非常常见的服务接口和结构体定义文件 [示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/overview01)

<<<@/gozz-doc-examples/overview01/.types.raw.go

给它添加上一些注解，大致语法是 `+zz:插件名:插件参数`。

<<<@/gozz-doc-examples/overview01/.types.pre.go{10-12,16,19,22,25,28,32,33,36,42}

运行指令 `gozz run -p "doc" -p "api:prefix=book" -p "impl" -p "tag" ./`

意思是使用这些插件进行分析并处理

文件被更新为：

<<<@/gozz-doc-examples/overview01/types.go

目录下生成了可用于快速注册API接口的文件 `zzgen.api.go`

<<<@/gozz-doc-examples/overview01/zzgen.api.go

还有基于代码注释可用于运行时自描述服务的文件 `zzgen.doc.go`

<<<@/gozz-doc-examples/overview01/zzgen.doc.go

:::tip
生成代码文件同时会在同目录生成代码模版，可对模版修改进行自定义生成

```
.
├── go.mod
├── types.go
├── zzgen.api.go
├── zzgen.api.go.tmpl
├── zzgen.doc.go
└── zzgen.doc.go.tmpl
```

:::

在进行Web框架路由绑定之前，我们就可以使用 `zzgen.api.go` 和 `zzgen.doc.go` 的信息去直接生成 `OpenApi` 文档。

可以参考以下的例子:

<swagger src="https://raw.githubusercontent.com/go-zing/gozz-doc-examples/main/overview01/swagger.json">
</swagger>

## 示例二

这个示例展示了一个Web项目的基本组成层级、各层的接口依赖以及依赖配置 [示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/overview02)

<<<@/gozz-doc-examples/overview02/.types.raw.go

给它添加上一些注解，大概说明用作构造依赖和或依赖关系：

<<<@/gozz-doc-examples/overview02/types.go{19,44,63,69,77,97,112,118}

完整的依赖构造代码 `wire_gen.go` 被自动化生成

<<<@/gozz-doc-examples/overview02/wire_gen.go{31-33,36}

并且在 `wire_zzaop.go` 中生成了为 `ServiceHandler` 接口提供类型安全静态AOP调用代理

<<<@/gozz-doc-examples/overview02/wire_zzaop.go{15,16}

使用 [gozz-kit](https://github.com/go-zing/gozz-kit) 中 `ztree` 对实例化结构体进行运行时分析，可以生成如下的对象结构图：


<svgx src="https://raw.githubusercontent.com/go-zing/gozz-doc-examples/main/overview02/structure.svg">
</svgx>

### [点击这里开始探索更多 →](guide)