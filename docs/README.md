---
home: true
heroText: Gozz
heroImage: /logo.png
actionText: Get Started →
actionLink: ./guide/getting-started
features:
  - title: Fast and Simple
    details: Intuitive annotation syntax, clean and fast command line tools, runtime-dependencies-free generated codes.
  - title: Awesome Plugins
    details: Autowire DI, AOP interface proxy, auto-sync implement from interface, ORM, API router mapping and so on.
  - title: High Extensibility
    details: Customize generating templates, core-library for code analysis, edit and generate. external .so plugins supported.
---


::: slot footer
[Apache-2.0 Licensed](https://github.com/go-zing/gozz/blob/main/LICENSE) | Copyright © 2023-present Maple Wu
:::

## Overview

### Example-01

There is a common service interface and entity definition file.
[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/overview01)

<<<@/gozz-doc-examples/overview01/.types.raw.go

Add some annotations in code's comments, the syntax be like `+zz:plugin_name:plugin_args`。

<<<@/gozz-doc-examples/overview01/.types.pre.go{10-12,16,19,22,25,28,32,33,36,42}

Execute `gozz run -p "doc" -p "api:prefix=book" -p "impl" -p "tag" ./`,

meaning that to analysis these plugin's name annotations and allow them to do something.

File would be updated as follows:

<<<@/gozz-doc-examples/overview01/types.go

There is also a `zzgen.api.go` file generated to provide API router mapping and invoke.

<<<@/gozz-doc-examples/overview01/zzgen.api.go

Another generated file `zzgen.doc.go` could be used for getting comments in runtime.

<<<@/gozz-doc-examples/overview01/zzgen.doc.go

:::tip
There are also templates generated in directory, modify them to do any customized.

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

## Example-02

This example display a common web project construct,
different type of layers, configs and interfaces definition.

[Example project](https://github.com/go-zing/gozz-doc-examples/tree/main/overview02)

<<<@/gozz-doc-examples/overview02/.types.raw.go

Add some annotations to describe whats to wired and how they should be bind.

<<<@/gozz-doc-examples/overview02/.types.pre.go{14,39,58,64,76,91,97}

The complete injector constructor `wire_gen.go` were generated.

<<<@/gozz-doc-examples/overview02/wire_gen.go{29-31,34}

And `wire_zzaop.go` generates static type-safe AOP proxy for interface `ServiceHandler`.

<<<@/gozz-doc-examples/overview02/wire_zzaop.go{15,16}


### [Just Click Me to Start Explore →](guide)
