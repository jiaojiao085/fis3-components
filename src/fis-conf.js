// var name = 'fis3';

// fis.project.setProjectRoot('src');
// fis.processCWD = fis.project.getProjectPath()

fis.set('project.md5Connector', '-');
fis.hook('commonjs');

fis.match('**/_*.scss', {
        release: false
    })
    .match('**.md', {
        release: false
    })
    .match('package.json', {
        release: false
    })
    .match('MIT-LICENSE', {
        release: false
    })
    // .match('libs/**/*.html', {
    //     release: false
    // })
    .match('libs/**.min.js', {
        release: false
    })
    // .match('libs/**/*.js', {
    //     release: false
    // })
    
    .match(/\/(.+)\.tpl$/, {    // js 模版一律用 .tpl
        isMod: true,
        rExt: 'js',
        id: '$1.tpl',
        moduleId: '$1.tpl',
        release: '$0.tpl', // 发布的后的文件名，避免和同目录下的 js 冲突
        parser: fis.plugin('imweb-tpl')
    })

    // 简化 modules 引用
    // modules/index/tupu/index.js -> require('index/tupu/index');
    .match(/^\/modules\/(.+)\.js$/, {
        isMod: true,
        id: '$1'
    })
    // 简化 modules同名引用
    // modules/index/tupu/tupu.js -> require('index/tupu');
    .match(/^\/modules\/((?:[^\/]+\/)*)([^\/]+)\/\2\.(js)$/i, {
        id: '$1$2'
    })
    .match(/^\/libs\/.+\/(.+)\.js$/i, {
        isMod: true,
        id: '$1'
    })
    .match(/^\/widget\/(.+)\/.+\.js$/i, {
        isMod: true,
        id: '$1'
    })
    .match(/(mod|badjs|bj-report)\.js$/, { // 非模块
        isMod: false
    })
    .match('pages/**.js', {
        isMod: true
    })
    .match('widget/**.js', {
        isMod: true
    })
    // .match('*.{html,js}', { // 同名依赖
    //     useSameNameRequire: true
    // })
    .match('**{widget,inline}.js', { // inline | widget 结尾的不是模块
        isMod: false
    })
    .match('**.{scss,sass}', {
        parser: fis.plugin('node-sass', {
            include_paths: ['modules/common/sass']
        }),
        rExt: '.css'
    })
    .match(/\/(.+\.async)\.(scss|css)$/, {    // 异步 css 包裹
        isMod: true,
        rExt: 'js',
        isCssLike: true,
        id: '$1',
        release: '$1.css',  // @todo 这里 $1.$2 竟然有 bug ，应该和上面的 tpl 性质一样
        extras: {
            wrapcss: true
        }
    })
    .match(/\/(.+\.async)\.(scss|css)$/, {    // 异步 css 包裹
        isMod: true,
        rExt: 'js',
        isCssLike: true,
        id: '$1',
        release: '$1.css',  // @todo 这里 $1.$2 竟然有 bug ，应该和上面的 tpl 性质一样
        extras: {
            wrapcss: true
        }
    })
    .match('**.{js,tpl}', {
        // domain: 'http://7.url.cn/edu/activity/' + name
    })
    .match('**.{css,scss,sass}', {
        // domain: 'http://7.url.cn/efidu/activity/' + name
    })
    .match('::image', {
        // domain: 'http://7.url.cn/edu/activity/' + name
    })
    /*.match('::package', {     //smart 打包
        packager: [fis.plugin('smart', {
            autoPack: true
        })]
    })*/
    .match('::package', {
        prepackager: fis.plugin('csswrapper'),
        postpackager: fis.plugin('loader', {
            allInOne: {
                css: 'pkg/${filepath}.min.css',
                js: 'pkg/${filepath}.min.js'
            }
        })
    })
    /**
     * 添加同步打包配置,libs和modules默认打包二级目录的文件
     */
    .match(/(libs|modules)\/(js\/)?[A-Za-z0-9-]+\/(.+)\.js$/i, {
        packTo: '/libs/$3.js',
        isMod: false
    });

/**
 * 开发
 */
fis.media('dev')
    .match('*.html', {
        deploy: fis.plugin('local-deliver', {
            to: '../dev'
        })
    })
    // .match('/widget/**/*.html', {
    //     deploy: fis.plugin('local-deliver', {
    //         to: '../dev'
    //     })
    // })
    .match('{libs,pkg}/*.js', {
        deploy: fis.plugin('local-deliver', {
            to: '../dev'
        })
    })
    .match('widget/**/*.js', {
        deploy: fis.plugin('local-deliver', {
            to: '../dev'
        })
    })
    .match('**.{ttf, eot, tpl, png}', {
        deploy: fis.plugin('local-deliver', {
            to: '../dev'
        })
    })
    .match('::image', {
        deploy: fis.plugin('local-deliver', {
            to: '../dev'
        })
    })
    .match('**.{css,scss,sass}', {
        optimizer: fis.plugin('clean-css'),
        deploy: fis.plugin('local-deliver', {
            to: '../dev'
        })
    });

/**
 * 发布
 *  压缩、合并、文件指纹
 */
fis.media('dist')
    .match('{libs,pkg}/*.js', {
        useHash: true,
        optimizer: fis.plugin('uglify-js'),
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    })
    .match('widget/**/*.js', {
        useHash: true,
        optimizer: fis.plugin('uglify-js'),
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    })
    .match('**.tpl', {
        useHash: true,
        optimizer: fis.plugin('uglify-js'),
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    })
    .match('**.png', {
        useHash: true,
        optimizer: fis.plugin('png-compressor'),
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    })
    .match('**.{ttf, eot}', {
        useHash: true,
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    })
    .match('**.{css,scss,sass}', {
        optimizer: fis.plugin('clean-css'),
        useHash: true,
        useSprite: true,
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    })
    .match('**.html', {
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    })
    .match('::image', {
        useHash: true,
        deploy: fis.plugin('local-deliver', {
            to: '../dist'
        })
    });
