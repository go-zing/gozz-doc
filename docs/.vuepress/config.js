module.exports = {
    title: 'Gozz',
    description: 'Gozz official documents page and user guides',
    base: "/gozz/",
    locales: {
        '/': {
            lang: 'en-US',
            description: 'A golang compile time ast generator and template-programing toolkits'
        },
        '/zh/': {
            lang: 'zh-CN',
            description: '一个基于编译时的 Golang 注解分析 及 插件化代码生成器工具链，快速落地工业级规范代码及提速业务开发。'
        }
    },
    themeConfig: {
        repo: 'https://github.com/go-zing/gozz',
        docsRepo: 'https://github.com/go-zing/gozz-doc',
        docsDir: 'docs',
        docsBranch: 'master',
        editLinks: true,
        smoothScroll: true,
        locales: {
            '/': {
                label: 'English',
                selectText: 'Languages',
                ariaLabel: 'Select language',
                editLinkText: 'Edit this page on GitHub',
                lastUpdated: 'Last Updated',
                nav: [],
                sidebar: []
            },
            '/zh/': {
                label: '简体中文',
                selectText: '选择语言',
                ariaLabel: '选择语言',
                editLinkText: '在 GitHub 上编辑此页',
                lastUpdated: '上次更新',
                nav: [],
                sidebar: []
            }
        },
        displayAllHeaders: true,
    }

}