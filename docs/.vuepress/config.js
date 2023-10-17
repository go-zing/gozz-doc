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
            description: '基于编译时的 Golang 注解分析及代码生成器，提供开箱即用的架构强化和插件化扩展能力，协助落地企业级最佳实践、提速业务开发。'
        }
    },
    markdown: {
        lineNumbers: false
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
                nav: [
                    {
                        text: "指南", link: "/zh/guide/",
                    },
                    {
                        text: "前世今生", link: "/zh/past-and-present/",
                    },
                ],
                sidebar: {
                    '/zh/guide/': [
                        {
                            title: "指南",
                            collapsable: false,
                            children: [
                                '',
                                'getting-started',
                                'how-it-works',
                                {
                                    title: "内置插件",
                                    path: "/zh/guide/plugins/",
                                    collapsable: false,
                                    children: [
                                        'plugins/wire',
                                        'plugins/api',
                                        'plugins/impl',
                                        'plugins/doc',
                                        'plugins/tag',
                                        'plugins/orm',
                                        'plugins/option',
                                    ]
                                },
                            ]
                        },
                    ],
                }
            }
        },
        displayAllHeaders: true,
    }
}