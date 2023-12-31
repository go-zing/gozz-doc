# Orm

通过 `dsn` 连接数据库 `driver` ，读取 `schema` 信息生成 `ORM` 结构体定义及相关辅助代码。

## 使用

### 注解

`+zz:orm:[schema][:options...]`

### 注解对象

所有对象

### 必填参数

#### `schema`

要读取的数据库 `schema` 名，多个可用 `,` 分隔。

示例： `+zz:orm:my_database`

### 可选参数

#### `filename`

指定生成的文件路径，默认 `./zzgen.orm.go`

示例： `+zz:orm:schema:filename=./models/`

#### `driver`

指定使用生成 `schemadriver`，此 `driver` 不同于 `sql.Driver`，为本工具独立维护对不同数据库种类的不同类型的生成器。

外部生成器可通过 `.so` 插件形式加载。

默认 `mysql`。

示例： `+zz:orm:schema:driver=sqlite`

#### `type`

指定生成时的数据类型映射。 格式 `${数据库DATA_TYPE}=${Golang类型}`

示例： `+zz:orm:schema:type=varchar=MyString`

可以使用 `,` 连接多个指定类型。

示例： `+zz:orm:schema:type=varchar=MyString,varchar(255)=string,int unsign=uint`

数据库格式匹配的优先级由不同 `schemadriver` 自行控制。

若要指定 `Nullable` 类型，可使用 `*` 前缀。

示例： `+zz:orm:schema:type=*varchar=sql.NullString,*json=*json.RawMessage`

#### `table`

指定生成的数据表，默认 `*` 即选取全部数据表进行生成。

可以使用 `,` 连接多个表。

示例： `+zz:orm:schema:table=user,car,order`

#### `password`

通常开发者都是在本地开发环境进行 `orm` 的生成和基于生成内容进行开发。

因此 `driver` 会提供一个对应数据库类型默认安装本地连接的 `dsn` 模版。

如 `mysql` 通常为 `root:${pwd}@tcp(localhost:3306)/`

使用者可以只提供 `password`，就能通过默认安装地址和用户完成访问。

建议通过以以下方式使用，示例：

```shell
read -s pwd && gozz run -p "orm:password=${pwd}" ./
```

#### `dsn`

如果对数据库连接地址有额外需求，可通过提供完整 `dsn` 进行访问。

涉及 `:` 时要使用 `\` 进行[参数转义](../getting-started.md#参数转义)

示例：

```shell
read -s pwd && gozz run -p "orm:dsn=dev_user\:${pwd}@tcp(192.168.1.2\:3306)/" ./
```

## 示例

[示例项目](https://github.com/go-zing/gozz-doc-examples/tree/main/orm01) [示例SQL](https://github.com/datacharmer/test_db/blob/master/employees.sql)

<<< @/gozz-doc-examples/orm01/types.go

执行 `gozz run -p "orm:password=***" ./` 生成 `zzgen.orm.go` 和模版文件。

<<< @/gozz-doc-examples/orm01/zzgen.orm.go