function getNavSidebar(lang, home, guide, story, plugin) {
    return {
        nav: [
            {
                text: home, link: lang + "",
            },
            {
                text: guide, link: lang + "guide/",
            },
            {
                text: story, link: lang + "story/",
            },
        ],
        sidebar: {
            [lang + 'guide/']: [
                {
                    title: guide,
                    children: [
                        '',
                        'getting-started',
                        'how-it-works',
                        {
                            title: plugin,
                            path: lang + "guide/plugins/",
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
}

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
    plugins: [
        ['vuepress-plugin-smooth-scroll', true],
        ['@vuepress/back-to-top', true],
    ],
    markdown: {
        lineNumbers: false
    },
    themeConfig: {
        repo: 'go-zing/gozz',
        docsRepo: 'go-zing/gozz-doc',
        docsDir: 'docs',
        docsBranch: 'main',
        editLinks: true,
        smoothScroll: true,
        locales: {
            '/': {
                label: 'English',
                ...getNavSidebar('/', 'Home', 'Guide', 'Story', 'Internal Plugins'),
            },
            '/zh/': {
                label: '简体中文',
                selectText: '选择语言',
                ariaLabel: '选择语言',
                editLinkText: '在 GitHub 上编辑此页',
                lastUpdated: '上次更新',
                ...getNavSidebar('/zh/', '首页', '指南', '前世今生', '内置插件'),
            }
        },
        displayAllHeaders: true,
    }
}