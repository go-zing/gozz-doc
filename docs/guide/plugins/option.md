# Option

Generates `Functional Options` style codes

## Usage

### Annotation

`+zz:option`

### Annotation Target

`struct` object

### Optional Arguments

#### `type`

Specify type name for option function

Example:`+zz:option:type=Option`

## Example

### Example-01

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/option01)

```
/option01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/option01
└── types.go
```

```go
// option01/types.go
package option01

// +zz:option
type Config struct {
	// connect host
	Host string
	// connect port
	Port string
	// database username
	Username string
	// database password
	Password string
}
```

Execute `gozz run -p "option" ./`, and it generates file `zzgen.option.go` and template file.

```go
// option01/zzgen.option.go
package option01

// apply functional options for *Config
func (o *Config) applyOptions(opts ...func(*Config)) {
	for _, opt := range opts {
		opt(o)
	}
}

// connect host
func WithHost(v string) func(*Config) { return func(o *Config) { o.Host = v } }

// connect port
func WithPort(v string) func(*Config) { return func(o *Config) { o.Port = v } }

// database username
func WithUsername(v string) func(*Config) { return func(o *Config) { o.Username = v } }

// database password
func WithPassword(v string) func(*Config) { return func(o *Config) { o.Password = v } }

```

### Example-02

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/option02)

Add annotations on different struct with option `type`.

```go
// option02/types.go
package option02

// +zz:option:type={{ .Name }}Option
type (
	Config struct {
		// connect host
		Host string
		// connect port
		Port string
		// database username
		Username string
		// database password
		Password string
	}

	Config2 struct {
		// config url
		Url string
	}
)
```

Execute `gozz run -p "option" ./`, and it generates file `zzgen.option.go` and template file.

```go
// option02/zzgen.option.go
package option02

// functional options type for Config
type ConfigOption func(*Config)

// apply functional options for Config
func (o *Config) applyOptions(opts ...ConfigOption) {
	for _, opt := range opts {
		opt(o)
	}
}

// connect host
func WithHost(v string) ConfigOption { return func(o *Config) { o.Host = v } }

// connect port
func WithPort(v string) ConfigOption { return func(o *Config) { o.Port = v } }

// database username
func WithUsername(v string) ConfigOption { return func(o *Config) { o.Username = v } }

// database password
func WithPassword(v string) ConfigOption { return func(o *Config) { o.Password = v } }

// functional options type for Config2
type Config2Option func(*Config2)

// apply functional options for Config2
func (o *Config2) applyOptions(opts ...Config2Option) {
	for _, opt := range opts {
		opt(o)
	}
}

// config url
func WithUrl(v string) Config2Option { return func(o *Config2) { o.Url = v } }
```