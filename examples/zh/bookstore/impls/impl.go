package impls

import (
	"context"

	"github.com/go-zing/gozz-doc-examples/bookstore/types"
)

var (
	_ types.BookService = (*BookServiceImpl)(nil)
)

// +zz:wire:bind=types.BookService:aop
type BookServiceImpl struct{}

func (impl *BookServiceImpl) GetBook(ctx context.Context, param types.QueryBook) (book types.Book, err error) {
	panic("not implemented")
}

func (impl *BookServiceImpl) ListBook(ctx context.Context, param types.QueryListBook) (books types.ListBook, err error) {
	panic("not implemented")
}

func (impl *BookServiceImpl) EditBook(ctx context.Context, form types.FormBook) (book types.Book, err error) {
	panic("not implemented")
}

func (impl *BookServiceImpl) NewBook(ctx context.Context, form types.FormBook) (id int, err error) {
	panic("not implemented")
}

func (impl *BookServiceImpl) Delete(ctx context.Context, query types.QueryBook) (updated bool, err error) {
	panic("not implemented")
}
