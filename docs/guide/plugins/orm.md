# Orm

Connects `schemadriver` with `dsn`,
loads `schema` info for generating `ORM` struct and codes.

## Usage

### Annotation

`+zz:orm:[schema]:[...options]`

### Exact Arguments

#### `schema`

Specify database `schema` to loads.

- Use `,` to separate multi value.

Example: `+zz:orm:my_database,my_database2`

### Optional Arguments

#### `filename`

Generate target filepath, default: `./zzgen.orm.go`.

Example: `+zz:orm:schema:filename=./models/`

#### `driver`

Specify `schemadriver`.

This `driver` is not `sql.Driver`,
but it is the interface for plugin loading different kind of database schema.
External extension interface could be loaded from `.so`.

default: `mysql`。

Example: `+zz:orm:schema:driver=sqlite`

#### `type`

Specify type mapping from database type to golang type,
format as: `${database DATA_TYPE}=${Golang type}`

Example: `+zz:orm:schema:type=varchar=MyString`

- Use `,` to join multi types.

Example: `+zz:orm:schema:type=varchar=MyString,varchar(255)=string,int unsign=uint`

The priority of type matching would be controlled by `schemadriver` implement.

- Use `*` to specify `Nullable` type.

Example: `+zz:orm:schema:type=*varchar=sql.NullString,*json=*json.RawMessage`

#### `table`

Specify database tables to generates from, default: `*` for all tables.

- Use `,` to join multi tables.

Example: `+zz:orm:schema:table=user,car,order`

#### `password`

Generally, developer would use `orm` to generate code in local develop environment,
And database in this case mostly were installed and exported as default connection.

So `schemadriver` should provide a default `dsn` template for default database connection.

For example: `mysql` use `root:${pwd}@tcp(localhost:3306)/`.

Users could provide `password` only and
complete all configuration to access the schema source database.

We suggest to use this plugin as example:

```shell
read -s pwd && gozz run -p "orm:password=${pwd}" ./
```

#### `dsn`

You could also provide full `dsn` url to access.

If you have letter `:` in argument,
you should use `\` to [argument escape](../getting-started.md#argument-escape).

Example:

```shell
read -s pwd && gozz run -p "orm:dsn=dev_user\:${pwd}@tcp(192.168.1.2\:3306)/" ./
```

## Examples

[Example Project](https://github.com/go-zing/gozz-doc-examples/tree/main/orm01) [Example SQL](https://github.com/datacharmer/test_db/blob/master/employees.sql)

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

Execute `gozz run -p "orm:password=***" ./`, and it generates file `zzgen.orm.go` and template file.

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