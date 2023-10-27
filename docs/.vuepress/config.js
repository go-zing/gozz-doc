const fs = require("fs");
const path = require("path");


function getPlugins(lang) {
    try {
        return fs
            .readdirSync(path.resolve(__dirname, `..${lang}guide/plugins/`))
            .filter(f => f !== 'README.md')
            .map(filename => 'plugins/' + filename.slice(0, -3))
            .sort()
    } catch (e) {
        return []
    }
}


function getNavSidebar(lang, home, guide, story, plugin) {
    return {
        nav: [
            {text: home, link: lang + "",},
            {text: guide, link: lang + "guide/",},
            // {text: story, link: lang + "story/",},
        ],
        sidebar: {
            [lang + 'guide/']: [
                {
                    title: guide,
                    collapsable: false,
                    sidebar: 'auto',
                    children: [
                        '',
                        'getting-started',
                        'how-it-works',
                        {
                            title: plugin,
                            path: lang + "guide/plugins/",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: getPlugins(lang),
                        },
                    ]
                }
            ],
        }
    }
}

module.exports = {
    head: [
        ['meta', {
            name: 'keywords',
            content: 'Golang,Golang Framework,Golang Tools,Golang Annotation,Golang DI,Dependency Inject,Codegen',
        }],
        ['meta', {
            name: 'google-site-verification',
            content: 'qq_r8b5FFi1KfleCEm_IBBZptYe13xE1vR3rspYRdRI',
        }],
        ['meta', {name: 'viewport', content: 'width=device-width, initial-scale=1'}],
        ['link', {rel: 'icon', href: '/favicon.ico'}],
    ],
    title: 'GOZZ',
    base: "/gozz/",
    locales: {
        '/': {
            lang: 'en-US',
            description: 'Golang Annotation Analyzer and Template-Programing Kits'
        },
        '/zh/': {
            lang: 'zh-CN',
            description: 'Golang 注解分析及模板化代码工具'
        }
    },
    plugins: [
        ['vuepress-plugin-smooth-scroll', true],
        ['@vuepress/plugin-back-to-top', true],
        ['sitemap', {hostname: 'https://go-zing.github.io'}]
    ],
    markdown: {
        lineNumbers: false
    },
    themeConfig: {
        logo: '/logo.png',
        repo: 'go-zing/gozz',
        docsRepo: 'go-zing/gozz-doc',
        docsDir: 'docs',
        docsBranch: 'main',
        editLinks: true,
        smoothScroll: true,
        locales: {
            '/': {
                lang: 'en-US',
                label: 'English',
                ...getNavSidebar('/', 'Home', 'Guide', 'Story', 'Builtin Plugins'),
            },
            '/zh/': {
                lang: 'zh-CN',
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