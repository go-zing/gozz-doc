package main

import (
	"net/http"

	"github.com/go-zing/gozz-doc-examples/bookstore/apis"
)

// 根应用入口
// +zz:wire:inject=/
type Application struct {
	ApisProvider
	HttpController
}

// +zz:wire:bind=ApisProvider:struct
type Apis = apis.Apis

// 作为 apis.Apis 的抽象 提供给 HttpController 进行 API路由服务绑定
type ApisProvider interface {
	Range(fn func(interface{}, []map[string]interface{}))
}

// 作为 HTTP控制器 的抽象 将 apis.Apis 解析提供为 http.Handler
// +zz:wire
type HttpController interface {
	Handle(ApisProvider) http.Handler
}

func ProvideHttpController() (controller HttpController) {
	// ... 此处省略实现
	return
}

// 挂载 http.Handler 并 监听端口 提供服务
func (app *Application) Run() (err error) {
	handler := app.Handle(app.ApisProvider)
	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}
	return server.ListenAndServe()
}
