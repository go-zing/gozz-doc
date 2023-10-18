# Get Started

`Gozz` CLI is built with [cobra](https://github.com/spf13/cobra), command syntax as follows:

```shell
gozz [--GLOBAL-FLAGS] [COMMAND] [--COMMAND-FLAGS] [ARGS]
```

## Environment

`Gozz` would lookup `.so` plugins in user's home directory `~/.gozz/plugins/` when starts up,
exception raised during these default plugins loading would be ignored.

Use env `GOZZ_PLUGINS_DIR` to specify the default plugins install directory.

## Command

`Gozz` supports commands as follows:

### `gozz list`

This command would list all plugins registered in core and ready to use,
and their arguments and description would print into your console.
You can check whether plugins is correctly loads by core.

Usage：

```shell
gozz list
```

### `gozz run`

Usage：

```shell
gozz run [--plugin/-p] [filename] 
```

This command would start analysis to provided `filename`,
and collect annotations context entities to specified ordered plugins for different jobs.
It would be the most used command.

#### Argument `filename`

If `filename` is a file. Parser would parse this file only.

If `filename` is a directory. Parser would parse walk around and parse all files, including sub-dir.

#### Flag `--plugin / -p "name:options..."`

`gozz run` should specify with one or more plugins

```shell
# with single
gozz run --plugin "foo" ./
# in short hand
gozz run -p "foo" ./
# with multi
gozz run -p "foo" -p "bar" ./
```

When run with multi plugins, they would execute in specified order.
Even if parser may do analysis before every plugin execute,
`Gozz` provide a file-meta based version cache for analysis results,
So that it may got better performance when running with multi plugins than one.

#### Append Plugin Options

you could append default options after plugin name and seperated with `:`.

```shell
# append default option [ key:value key2:value2 ] for plugin foo.
gozz run -p "foo:key=value:key2=value2" ./ 
```

If annotation `+zz:foo:key=value3` got default option `key=value:key2=value2`, treat as follows:

`+zz:foo:key=value3(key exist,ignore):key2=value2(override from default)`

### [WIP] `gozz install`

Usage:

```shell
gozz install [--output/-o] [--filename/-f] [repository] 
```

This command would try complies `repository` into `.so` plugin,
then saves in user's plugins path `~/.gozz/plugins` ( or environment `GOZZ_PLUGINS_DIR`).

#### Argument `repository`

if `repository` starts with network protocol, such as `ssh:// git:// http:// https://`,
it try downloads these url with `git`, otherwise use url as local filepath.

#### Flag `--output / -o "filename"`

If it was specified, build results would output as provided filename, and do not install into plugins dir.

#### Flag `--filename / -f "filename"`

If it was specified, build plugins with this relative filename from repository root.

Example:

```bash
gozz install https://github.com/go-zing/gozz-plugins -f ./contrib/sqlite -o sqlite.so
```

`Gozz` would download this remote repo and build it with command:

```
go build --buildmode=plugin -o sqlite.so ./contrib/sqlite
```

#### Precondition for install plugins

- Version must be match between `gozz` built from and environment.
- Plugin Repo `gozz-core` must be adapted with gozz CLI.
- Others factors effect compatibility of `go/plugin`.
  checkout: [Understand Go Plugin](https://tonybai.com/2021/07/19/understand-go-plugin/)。

## Global Flags

### `-x / --extension [filename]`

Example:

```shell
# execute list command 
gozz -x plugin.so list
# execute run command
gozz -x plugin.so run -p "plugin" ./
```

Use this flag to load external `.so` plugin with filepath.
Exception raised during these plugins load would print error and exit process.

## Annotation Syntax

Annotations are comments that stick with object, and match syntax as follows:

```go
// +zz:[PLUGIN]:[ARGS]:[OPTIONS]
type T interface{}
```

### `PLUGIN` - plugin name

Plugin has unique name when registered. This name would also uses for matching annotation. Case-insensitive.

Example: plugin `Foo` match annotations with prefix `+zz:foo`.

### `ARGS` - Exact Arguments

Plugins would specify exact arguments count.
These arguments should append after annotation prefix and seperated with `:`.
If an annotation match plugin prefix but does not have enough arguments. It would be ignored.

Example:

plugin `foo` accepts two exact arguments, `+zz:foo:arg1:arg2` would be accepted.

but rejects `+zz:foo:arg1` and `+zz:foo`.

#### Why Ignore

If an argument could have default value, it should not be a exact argument.

Checkout [Design Concept](./README.md#design-concept).

### `OPTIONS` - Optional Arguments

Values after exact arguments would be parsed as `Key-Value` pairs option, and passed to plugin.

Example:

Plugin `foo` Has 2 exact arguments. When parsing annotation as follows:

`+zz:foo:arg1:arg2:arg3=value:arg4`

Options `{"arg3":"value","arg4":""}` would present.

#### Repeatable Optional Arguments

Sometimes optional arguments accept slice value, they were often seperated with `,`. Example:

```go
// +zz:foo:set=a,b,c,d
type T interface{}
```

When these options were seperated in different key-value pairs.
Parser would merge them. Example:

```go
// +zz:foo:set=a:set=:set=b:set=c,d
type T interface{}
```

is equal to

```go
// +zz:foo:set=a,,b,c,d
type T interface{}
```

#### Boolean Option

Sometimes, plugin would check whether a key exists in options.
These were called `Boolean Option`.

If a `Boolean Option` key's value is not empty. In additionally,
Parser would also check this value whether is implicit negative,
like `0 / false / null`.

Example:

- `+zz:bar:arg3=value:arg4` => `{"arg3":"value","arg4":""}`
- `+zz:bar:arg3=value:arg4=true` => `{"arg3":"value","arg4":"true"}`
- `+zz:bar:arg3=value:arg4=false` => `{"arg3":"value"}`
- `+zz:bar:arg3=value:arg4=0` => `{"arg3":"value"}`

#### Argument Escape

Some arguments may contain `:`, use `\` to escape,
this solution works for command line external arguments and annotations arguments.

Example:

`+zz:plugin:addr=localhost:8080` -> `+zz:plugin:addr=localhost\:8080`

While parsing annotations,
Parses replace `\:` with `\u003A` before annotation split, and replace `\u003A` with `:` as last.

### Declaration Object

Annotation could be added on `Decl` blocks, and also `Spec` Object.

You can check out [Principle](./how-it-works.md#Principle) to know about what is `Decl` and `Spec`.

```go
package t

// +zz:foo
type (
	T0 interface{}
	T1 interface{}

	// +zz:bar
	T2 interface{}
)

// +zz:foo
type T3 interface{}
```

Annotations added on `Decl`, would be copied for all `Spec` objects in `Decl` blocks as follows:

```go
package t

type (
	// +zz:foo
	T0 interface{}
	// +zz:foo
	T1 interface{}

	// +zz:foo
	// +zz:bar
	T2 interface{}
)

// +zz:foo
type T3 interface{}
```

### Multiline Annotation

#### Annotation Detect

Lines starts with `+zz:` (ignore whitespace) would be detected as annotations.

```go
/*
+zz:foo  <- annotation
  +zz:foo  <- annotation
 x +zoo:foo <- not
//   +zoo:foo  <- not
*/
type T1 interface{}

// +zz:foo  <- annotation
//   +zoo:  <- annotation
//   +zoo-  <- not
// x +zoo:foo <- not
type T2 interface{}
```

#### Repeat Annotations

Object could have multi annotations added, and these annotations may contains repeat plugins.
It would not be considered as any exception.

```go
// +zz:foo
// +zz:bar
// +zz:bar:filename=./bar
type T interface{}
```

How to handle repeat annotations is based on plugin implement and usage.

## Some Conventions Over Configuration

### about filepath and filename

plugins may have arguments for filename as follows:

```go
// +zz:api:./
// +zz:impl:./impl.go
// +zz:wire:inject=/
type API interface{}
```

These filepath should follow these rules:

Example based on directory tree below:

``` 
/go/src/project/
├── go.mod
└── types
    └── api.go
```

#### 1. If ends with `.go`, use it to generate go file.

```go
// /go/src/project/types/api.go

// +zz:api:./api.go
type API interface{}
```

This example would get filename `api.go`.

#### 2. If not ends with `.go`, plugin would provide a default filename

Most of the plugin default filename formatted as  `zzgen.${plugin}.go`.

```go
// /go/src/project/types/api.go

// +zz:api:./
type API interface{}
```

This example would get filename `zzgen.api.go`

#### 3. Most of the filename arguments support templating

You could use meta info from annotated object like `Name` `Package` to do templating.

[String functions provided](https://github.com/go-zing/gozz-core/blob/main/generate.go#L32) in core
like `snake / camel ...`

```go
// /go/src/project/types/api.go

// +zz:api:./{{ lower .Name }}.go
type Foo interface{}
```

This example would get filename `foo.go`

#### 4. If filename is relative path. Related to annotated file.

```go
// /go/src/project/types/api.go

// +zz:api:./apix.go
type API interface{}
```

This example would get full filepath `/go/src/project/types/apix.go`

<br>

```go
// /go/src/project/types/api.go

// +zz:api:./apix
type API interface{}
```

This example would get filename `zzgen.api.go` because it does not have `.go` suffix.

And got full filepath  `/go/src/project/types/apix/zzgen.api.go`

#### 5. If filepath is absolute. Related to annotated file `module` root.

`module` root is detected by command `go env GOMOD`

```go
// /go/src/project/types/api.go

// +zz:api:/apix.go
type API interface{}
```

This example would get filepath `/go/src/project/apix.go`.

<br>

```go
// /go/src/project/types/api.go

// +zz:api:/apix
type API interface{}
```

This example would get filepath  `/go/src/project/apix/zzgen.api.go`

<br>

If directory `types` contains a sub `module`:

```
/go/src/project/
├── go.mod
└── types
    ├── api.go
    └── go.mod
```

```go
// /go/src/project/types/api.go

// +zz:api:/
type API interface{}
```

This example would get filepath `/go/src/project/types/zzgen.api.go`

### Custom Template

For most of the code generation, we would check whether exist file named `${filename}.impl` in directory.

If it exists, it would be used as generate template. Else, a builtin template with this name would be generated.

### Specified Template

[WIP] Plugins may support optional arguments `template=${filename}` for specified template filepath:

```go
// +zz:api:/:template=/.gozz/api.tmpl
type API interface{}
```



