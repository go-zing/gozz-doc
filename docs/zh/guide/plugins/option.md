# Option

用于快速生成 `Functional Options` 风格代码

## 使用

### 注解

`+zz:option`

### 注解对象

`struct` 类型对象

## 示例

### 示例一

项目目录结构

```
/option01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/option01
└── types.go
```

```go
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

`gozz` 执行后，生成 `./zzgen.option.go` 文件 

```go
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