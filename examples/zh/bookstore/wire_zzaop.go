// Code generated by gozz:wire github.com/go-zing/gozz. DO NOT EDIT.

package main

import (
	"context"
	types "github.com/go-zing/gozz-doc-examples/bookstore/types"
)

type _aop_interceptor interface {
	Intercept(v interface{}, name string, params, results []interface{}) (func(), bool)
}

// types.BookService
type (
	_aop_types_BookService      types.BookService
	_impl_aop_types_BookService struct{ _aop_types_BookService }
)

func (i _impl_aop_types_BookService) GetBook(p0 context.Context, p1 types.QueryBook) (r0 types.Book, r1 error) {
	if t, x := i._aop_types_BookService.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_types_BookService, "GetBook",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_types_BookService.GetBook(p0, p1)
}

func (i _impl_aop_types_BookService) ListBook(p0 context.Context, p1 types.QueryListBook) (r0 types.ListBook, r1 error) {
	if t, x := i._aop_types_BookService.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_types_BookService, "ListBook",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_types_BookService.ListBook(p0, p1)
}

func (i _impl_aop_types_BookService) EditBook(p0 context.Context, p1 types.FormBook) (r0 types.Book, r1 error) {
	if t, x := i._aop_types_BookService.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_types_BookService, "EditBook",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_types_BookService.EditBook(p0, p1)
}

func (i _impl_aop_types_BookService) NewBook(p0 context.Context, p1 types.FormBook) (r0 int, r1 error) {
	if t, x := i._aop_types_BookService.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_types_BookService, "NewBook",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_types_BookService.NewBook(p0, p1)
}

func (i _impl_aop_types_BookService) Delete(p0 context.Context, p1 types.QueryBook) (r0 bool, r1 error) {
	if t, x := i._aop_types_BookService.(_aop_interceptor); x {
		if up, ok := t.Intercept(i._aop_types_BookService, "Delete",
			[]interface{}{&p0, &p1},
			[]interface{}{&r0, &r1},
		); up != nil {
			defer up()
		} else if !ok {
			return
		}
	}
	return i._aop_types_BookService.Delete(p0, p1)
}