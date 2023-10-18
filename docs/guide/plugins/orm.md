# Orm

通过 `dsn` 连接数据库 `driver` ，读取 `schema` 信息生成 `ORM` 结构体定义及相关辅助代码。

## Usage

### Annotation

`+zz:orm:[schema]:[...options]`

### Annotation Target

所有对象

### Exact Arguments

#### `schema`

要读取的数据库 `schema` 名，多个可用 `,` 分隔。

Example: `+zz:orm:my_database`

### Optional Arguments

#### `filename`

指定生成的文件路径，默认 `./zzgen.orm.go`

Example: `+zz:orm:schema:filename=./models/`

#### `driver`

指定使用生成 `schemadriver`，此 `driver` 不同于 `sql.Driver`，为本工具独立维护对不同数据库种类的不同类型的生成器。

外部生成器可通过 `.so` 插件形式加载。

默认 `mysql`。

Example: `+zz:orm:schema:driver=sqlite`

#### `type`

指定生成时的数据类型映射。 格式 `${数据库DATA_TYPE}=${Golang类型}`

Example: `+zz:orm:schema:type=varchar=MyString`

可以使用 `,` 连接多个指定类型。

Example: `+zz:orm:schema:type=varchar=MyString,varchar(255)=string,int unsign=uint`

数据库格式匹配的优先级由不同 `schemadriver` 自行控制。

若要指定 `Nullable` 类型，可使用 `*` 前缀。

Example: `+zz:orm:schema:type=*varchar=sql.NullString,*json=*json.RawMessage`

#### `table`

指定生成的数据表，默认 `*` 即选取全部数据表进行生成。

可以使用 `,` 连接多个表。

Example: `+zz:orm:schema:table=user,car,order`

#### `password`

通常开发者都是在本地开发环境进行 `orm` 的生成和基于生成内容进行开发。

因此 `driver` 会提供一个对应数据库类型默认安装本地连接的 `dsn` 模版。

如 `mysql` 通常为 `root:${pwd}@tcp(localhost:3306)/`

使用者可以只提供 `password`，就能通过默认安装地址和用户完成访问。

建议通过以以下方式使用，Example:

```shell
read -s pwd && gozz run -p "orm:password=${pwd}" ./
```

#### `dsn`

如果对数据库连接地址有额外需求，可通过提供完整 `dsn` 进行访问。

涉及 `:` 时要使用 `\` 进行[参数转义](../getting-started.md#参数转义)

Example:

```shell
read -s pwd && gozz run -p "orm:dsn=dev_user\:${pwd}@tcp(192.168.1.2\:3306)/" ./
```

## Examples

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/orm01) [示例SQL](https://github.com/datacharmer/test_db/blob/master/employees.sql)

```
/orm01/
├── go.mod -> module github.com/go-zing/gozz-doc-examples/orm01
└── types.go
```

```go
// orm01/types.go
package orm01

// +zz:orm:{{ .Name }}
type employees struct{}

```

执行 `gozz run -p "orm:password=***" ./` 生成 `zzgen.orm.go` 和模版文件。

```go
// orm01/zzgen.orm.go
package orm01

var tables = []interface{}{
	CurrentDeptEmp{},
	Departments{},
	DeptEmp{},
	DeptEmpLatestDate{},
	DeptManager{},
	Employees{},
	Salaries{},
	Titles{},
}

// employees.current_dept_emp
// VIEW
const TableCurrentDeptEmp = "current_dept_emp"

type CurrentDeptEmp struct {
	// emp_no : int
	EmpNo int
	// dept_no : char(4)
	DeptNo string
	// from_date : NULLABLE date
	FromDate interface{}
	// to_date : NULLABLE date
	ToDate interface{}
}

func (CurrentDeptEmp) TableName() string { return TableCurrentDeptEmp }

func (m *CurrentDeptEmp) FieldMapping() map[string]interface{} {
	return map[string]interface{}{
		"emp_no":    &m.EmpNo,
		"dept_no":   &m.DeptNo,
		"from_date": &m.FromDate,
		"to_date":   &m.ToDate,
	}
}

type SliceCurrentDeptEmp []CurrentDeptEmp

func (s *SliceCurrentDeptEmp) Range(f func(interface{}, bool) bool) {
	for i := 0; ; i++ {
		if c := i >= len(*s); !c {
			if !f(&(*s)[i], c) {
				return
			}
		} else if n := append(*s, CurrentDeptEmp{}); f(&n[i], c) {
			*s = n
		} else {
			*s = n[:i]
			return
		}
	}
}

...

```