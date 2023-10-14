package types

import (
	"context"
	"time"
)

// 书籍服务接口
// +zz:impl:/impls:wire:aop
// +zz:api:/apis:prefix=books
// +zz:doc
type BookService interface {
	// 获取指定书籍
	// +zz:api:get:{id}
	GetBook(ctx context.Context, param QueryBook) (book Book, err error)
	// 获取书籍列表
	// +zz:api:get:
	ListBook(ctx context.Context, param QueryListBook) (books ListBook, err error)
	// 编辑书籍
	// +zz:api:put:{id}
	EditBook(ctx context.Context, form FormBook) (book Book, err error)
	// 新建书籍
	// +zz:api:post:
	NewBook(ctx context.Context, form FormBook) (id int, err error)
	// 删除书籍
	// +zz:api:delete:{id}
	Delete(ctx context.Context, query QueryBook) (updated bool, err error)
}

// +zz:doc
// +zz:tag:json:{{ snake .FieldName }}
type (
	// 书籍查询参数
	QueryBook struct {
		// 查询指定ID
		Id int `json:"id"`
	}

	// 书籍列表查询参数
	QueryListBook struct {
		// 查询关键字
		Keyword string `json:"keyword"`
		// 查询页数
		PageNo int `json:"page_no"`
		// 查询分页
		PageCount int `json:"page_count"`
	}

	// 书籍列表
	ListBook struct {
		// 总数
		Total int `json:"total"`
		// 列表
		List []Book `json:"list"`
	}

	// 书籍新建或编辑表单
	FormBook struct {
		// ID
		Id int `json:"id"`
		// 标题
		Title string `json:"title"`
		// 作者
		Author string `json:"author"`
		// 描述
		Description string `json:"description"`
	}

	Book struct {
		// 从表单继承
		FormBook
		// 创建时间
		CreatedAt time.Time `json:"created_at"`
		// 创建人
		CreatedBy string `json:"created_by"`
		// 更新时间
		UpdatedAt time.Time `json:"updated_at"`
		// 更新人
		UpdatedBt string `json:"updated_bt"`
	}
)
