var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var marked = require('marked');
var stylus = require('stylus')
var highlight = require('highlight.js')
var UglifyJS = require("uglify-js");
var renderer = new marked.Renderer();
var color = require('colors-cli/safe');
var eeutils = require("./eeutils");
var error = color.red.bold;
var warn = color.yellow;
var success = color.green;
let plugins = [];
const moment = require('moment');
const cheerio = require('cheerio');

String.prototype.format = function () {
    var values = arguments;
    return this.replace(/\{(\d+)\}/g, function (match, index) {
        if (values.length > index) {
            return values[index];
        } else {
            return "";
        }
    });
};

String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
};



function pushToc(level, _id, txt) {
    if (renderType == 1) {
        return;
    }
    tocArray.push({
        id: _id,
        level: level,
        txt: txt,
        type: renderType
    });
}
renderer.heading = function (text, level) {
    const _id = `#${level}_${text}`.hashCode();
    if (/[\u4E00-\u9FA5]/i.test(text)) {
        pushToc(level, _id, text);
        return '<h' + level + ' id="' + _id + '">' + text + '</h' + level + '>';
    } else {
        pushToc(level, _id, text);
        return '<h' + level + ' id="' + _id + '">' + text + '</h' + level + '>';
    }
}

renderer.listitem = function (text) {
    if (/^\s*\[[x ]\]\s*/.test(text)) {
        text = text.replace(/^\s*\[ \]\s*/, '<input class="eedoc_todo" type="checkbox" disabled=""> ').replace(/^\s*\[x\]\s*/, '<input class="eedoc_todo" type="checkbox" disabled="" checked=""> ');
        return '<li style="list-style: none">' + text + '</li>';
    } else {
        return '<li>' + text + '</li>';
    }
};

function renderPlugin(p, data) {
    let dir = path.join(themePath, p);
    if (eeutils.isFile(dir)) {
        let tpl = fs.readFileSync(dir).toString();
        return ejs.render(tpl, {
            data: data,
            config: config,
            relative_path: relative_path,
            language: language
        });
    } else {
        return null;
    }
}

function formatPlugin(code, lang) {
    let json = null;
    try {
        // 如果指定了 eplugin ，且语言是 json 则解析
        json = lang == "json" && code.indexOf(`"eplugin":`) > 0 ? JSON.parse(code) : null;
    } catch (error) {
        json = null;
    }
    let ep = json?.eplugin;
    let _plugins = _renderConfig?.plugins;
    let plug = _plugins && ep && ep.length > 0 ? _plugins[ep] : null;
    let str = plug && plug.length > 0 ? renderPlugin(plug, json) : null;
    if (str && str.length > 0) {
        plugins.push({
            pash: currentDescribe.pash,
            cid: currentDescribe.category_id,
            cname: currentDescribe.category,
            type: ep,
            data: json,
            html: str
        });
    }
    return str;
}

function hilight(code, lang, callback) {
    lang = lang ? lang : "js";
    if (_renderConfig.markedRender && _renderConfig.markedRender.highlight) {
        highlight.configure(_renderConfig.markedRender.highlight)
    }
    let str = highlight.highlight(lang, code).value;
    callback && callback(0, str);
}

marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: hilight
});
// 根目录
var path_root = process.cwd();
var template_path = path.resolve(__dirname, "../template");
var thirdTmpPath = path.resolve(path_root, "./template");
var config;
// 文章所在目录 默认为 command
var docPath = "command";
var pagePath = "page";
var outPath = "c";
var eedoc = {};
// 静态资源目录 相对于根目录
var staticsDir;
var _renderConfig;
var themePath;
var relative_path = '';

// 遍历文件夹 返回文件列表
function fileArr(dir, arr) {
    const files = fs.readdirSync(dir);
    files.forEach(function (filename) {
        //获取当前文件的绝对路径
        var filedir = path.join(dir, filename);
        if (eeutils.isDir(filedir)) {
            fileArr(filedir, arr);
        } else if (eeutils.isFile(filedir)) {
            arr.push(filedir);
        }
    });
}

/**
 * 获取要拷贝的资源
 */
function getCopyArr(config, _path) {
    var arr = [];
    config.copy.forEach(function (f, i) {
        var absPath = path.join(_path, f);
        if (eeutils.isDir(absPath)) {
            fileArr(absPath, arr)
        } else if (eeutils.isFile(absPath)) {
            arr.push(f)
        }
    })
    return arr;
}

/**
 * 获取当前页面 page 对应的配置,在 config.json 中 配置
 {
    "page":{
        "index.ejs":{"name":"首页"},
        "list.ejs":{"name":"搜索列表"},
        "about.ejs":{"name":"关于我","render":"about.md"},
        "message.ejs":{"name":"留言板","render":"message.json"}
    }
 }
 * json 驱动，如默认主题 nav，postTpl = null ,只需要 json 即可渲染页面
 * mardkdown 驱动，如默认主题 echo 中，关于 页面，通过 markdown 驱动；
 * 优点：每个主题，每个页面都可以通过 config.json 自己配置每个页面的内容
 * TODO 可结合 <page> 优化
 */
async function getPageConfig(page) {
    var res = null;
    if (config.page) {
        res = config.page['' + page + ''];
    }
    if (res && res.render) {
        const renderFile = path.join(pagePath, res.render);
        if (eeutils.isFile(renderFile)) {
            if (renderFile.endsWith(".json")) {
                // 页面由json驱动
                res._render = JSON.parse(fs.readFileSync(renderFile));
            } else if (renderFile.endsWith(".md")) {
                // 页面由markdown驱动
                let txt = fs.readFileSync(renderFile).toString();
                let h = await renderMarkdown(txt, { pash: page.replace(".ejs", ""), category_id: 'other', category: '其他' }, 1);
                // console.log(h);
                res._render = h;
            }
        }
    }
    return res ? res : {}
}
var allPost = [];
var bannerPost = [];
var archivePost = [];
var categoryPost = [];
var tocArray = [];
var language = {};
// 默认不构建 _ 开头的 MarkDown ,比如 `_post.md` 为了一些只想在本地预览 不想上传网站的
var excludeDash = true;

function isOfficalTheme(t) {
    return t == "default" || t == "echo" || t == "nav";
}
var showTimeFormat = "YYYY-MM-DD HH:mm:ss";
let currentDescribe = {};
// 0:post,1:page
let renderType = 0;

let renderMarkdown = async (mdstr, describe, page) => {
    currentDescribe = describe;
    renderType = page;
    return await marked(mdstr);
}

async function build(commander, callback, _config) {
    if (_config == null) {
        console.log(error("config.json is not exist,please run `eedoc -i` first!"));
        return;
    }
    config = _config;
    showTimeFormat = config.showTimeFormat ? config.showTimeFormat : "YYYY-MM-DD HH:mm:ss";
    var theme = "default";
    if (config.theme) {
        theme = config.theme;
    }

    console.log("build mode:" + (commander.build == 'release' ? 'release' : 'debug'));
    // 如果用户强制关闭则关闭 或者 debug 模式下均不去除 _post.md
    if (config.excludeDash && config.excludeDash == false || commander.build != 'release') {
        excludeDash = false;
    }

    // 可配置默认文章目录
    if (config.doc) {
        docPath = config.doc
    }
    // 配置输出目录
    if (config.out) {
        outPath = config.out;
    }
    // 静态资源目录 一般用于存放图片
    if (config.statics) {
        staticsDir = path.join(path_root, config.statics)
    }

    themePath = path.resolve(isOfficalTheme(theme) ? template_path : thirdTmpPath, theme);
    // 多语言
    var langPath = path.join(path.resolve(themePath, "languages"), config.language + ".json")
    if (eeutils.isFile(langPath)) {
        language = JSON.parse(fs.readFileSync(langPath));
    }
    // 主题渲染配置
    const _renderConfigFile = path.join(themePath, 'render.config');
    if (!eeutils.isFile(_renderConfigFile)) {
        console.log(error("render.config not exist,please check!"));
        return;
    }
    plugins = [];
    _renderConfig = JSON.parse(fs.readFileSync(_renderConfigFile));
    if (_renderConfig.markedRender) {
        if (_renderConfig.markedRender.heading) {
            renderer.heading = function (text, level) {
                return _renderConfig.markedRender.heading.format(text, level);
            }
        }
        if (_renderConfig.markedRender.table) {
            renderer.table = function (theader, tbody) {
                return _renderConfig.markedRender.table.format(theader, tbody);
            }
        }
        if (_renderConfig.markedRender.link) {
            renderer.link = function (href, title, text) {
                const _tar = eeutils.parseUrl(href, 'target');
                let t = eeutils.parseUrl(href, 'title');
                const _title = title && title.length > 0 ? title : (t && t.length > 0 ? t : "");
                var _target = _tar ? _tar : '_blank';
                const _linkHtml = _renderConfig.markedRender.link.format(href, _title, text, _target);
                return _linkHtml;
            }
        }
        let renderCode = _renderConfig.markedRender.code;
        if (renderCode) {
            renderer.code = function (code, language, escaped) {
                let str = null;
                if (language == "json") {
                    str = formatPlugin(code, language);
                }
                let pluginRendered = str && str.length > 0;
                let result = pluginRendered ? str : _renderConfig.markedRender.code.format(highlight.highlight(language, code).value, language, escaped);
                return result;
            }
        }
        if (_renderConfig.markedRender.image) {
            renderer.image = function (href, title, text) {
                var _align = eeutils.parseUrl(href, 'align');
                var _width = eeutils.parseUrl(href, 'width');
                var _height = eeutils.parseUrl(href, 'height');
                _width = _width ? _width : 'auto';
                _height = _height ? _height : 'auto';
                _align = _align ? _align : 'left';
                return _renderConfig.markedRender.image.format(href, (title ? title : ''), (text ? text : ''), _align, _width,
                    _height);
            }
        }
    }

    // 所有文章
    allPost = createDatajs('public/js/dt.js');
    // 置顶文章
    bannerPost = allPost.filter(function (postItem) {
        return postItem.banner && postItem.banner == true;
    });
    // 归档文章
    archivePost = eeutils.groupBy(allPost, function (itm) {
        return itm.year;
    }).sort(function (a, b) {
        return parseInt(b.group) - parseInt(a.group);
    });
    archivePost.forEach((i) => {
        i.items = i.items.sort((a, b) => {
            let dif = moment(b.create_time).diff(moment(a.create_time));
            return dif;
        });
    });
    //console.log(archivePost);

    await renderingPage();
    if (allPost.length > 0) {
        eedoc.total = allPost.length;
        let ptags = [];
        let pageConfig = await getPageConfig('post.ejs');
        // console.log(pageConfig);
        // 渲染文章
        for (let index = 0; index < allPost.length; index++) {
            const itm = allPost[index];
            // 支持设定 post.ejs 页面配置
            itm._render = pageConfig._render;
            var dep = path.join(path.join('public', outPath), (config.pash && config.pash == true) ? itm.pash : itm.path);
            var md_path = path.join(docPath, itm.path);
            let rps = await readPost(path.join(themePath, _renderConfig.postTpl), dep + '.html', md_path + '.md', itm);
            if (rps != null && rps.length > 0) {
                ptags = ptags.concat(rps);
            }
        }
        let tpath = "public/js/ctags.json";
        mkdirsSync(path.dirname(tpath));
        eeutils.write(tpath, JSON.stringify(ptags));
    } else {
        console.log(warn("no post."));
    }
    let ppath = "public/js/plugins.json";
    mkdirsSync(path.dirname(ppath));
    eeutils.write(ppath, JSON.stringify(plugins ?? []));

    if (callback) {
        console.log(success("rebuild success! total article : " + allPost.length + "."));
        callback(true);
    } else {
        console.log(success("build success! total article : " + allPost.length + ",now you can run 'eedoc -s'."));
    }
}

// 渲染单页面
async function renderingPage() {
    const ejsList = _renderConfig.ejs.map(x => {
        return path.join(themePath, x);
    });
    const jsList = _renderConfig.js.map(x => {
        return path.join(themePath, x);
    });
    const cssList = _renderConfig.css.map(x => {
        return path.join(themePath, x);
    });
    getCopyArr(_renderConfig, themePath).forEach(function (f, i) {
        var f = f.replace(themePath, '')
        var frompath = path.join(themePath, f);
        // 渲染队列的文件不拷贝
        if (ejsList.indexOf(frompath) == -1 &&
            jsList.indexOf(frompath) == -1 &&
            cssList.indexOf(frompath) == -1) {
            var topath = path.join('public', f);
            copy(frompath, topath)
        }
    })

    jsList.forEach(function (f, i) {
        var name = f.replace(themePath, '')
        var topath = path.join('public', name);
        createJS(f, topath)
    });
    cssList.forEach(function (f, i) {
        var name = f.replace(themePath, '').replace('.styl', '.css')
        var topath = path.join('public', name);
        createStyl(f, topath)
    });

    //生成CNAME
    if (config.cname && config.cname.length > 0) {
        eeutils.write(path.join(path_root, "public/CNAME"), config.cname);
    }

    //渲染页面
    _renderConfig.ejs.forEach(async function (f, i) {
        const frompath = path.join(themePath, f);
        var name = f.replace('.ejs', '.html')
        var topath = path.join('public', name);
        readPageToHTML(frompath, topath, await getPageConfig(f))
    });

    // 拷贝MarkDown图片
    if (eeutils.isDir(staticsDir)) {
        const dsti = path.join('public', config.statics);
        eeutils.copyDir(staticsDir, dsti)
    }
}

function copy(src, dst) {
    // console.log(`src=${src} dst=${dst}`);
    mkdirsSync(path.dirname(dst));
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
}

function createJS(from_path, to_path) {
    // 生成js到指定目录并压缩js
    mkdirsSync(path.dirname(to_path));
    var js_code = UglifyJS.minify(from_path, {
        mangle: {
            toplevel: true
        }
    });
    fs.writeFileSync(to_path, js_code.code);
}

/**
 * 解析标签 config
 */
function customRenderTag(str, tag) {
    const start = str.indexOf(`<!-- ${tag} {`);
    let tagEnd = `} ${tag} -->`;
    const end = str.indexOf(tagEnd);
    let config = null;
    let tmp;
    if (end > start && start > 0) {
        try {
            tmp = str.substring(start + 6 + tag.length, end + 1);
            config = JSON.parse(tmp);
        } catch (e) {
            console.log(`invalid json ${tmp}`);
            console.log(e);
            config = null;
        }
    }
    // console.log(`custom render tag ${tag} success -> ${config != null}`);
    return {
        start: start,
        end: end + tagEnd.length,
        config: config
    };
}

/**
 * 渲染自定义标签
 * 场景：http://git.1991.wiki/plucky/FilmHub，可结合 cheerio <page> 优化
 */
function renderingCustomTag(tag, str, data, page, relative_path) {
    let p = _renderConfig.customRender[`${tag}`];
    if (p && p.length > 0) {
        let dir = path.join(themePath, p);
        if (eeutils.isFile(dir)) {
            let tpl = fs.readFileSync(dir).toString();
            return ejs.render(tpl, {
                data: data,
                page: page,
                config: config,
                relative_path: relative_path,
                language: language
            });
        }
    }
    return str;
}


const flattenArray = arr => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flattenArray(val) : val), []);
// 来源于 chatgpt
const countElements = arr => {
    const flatArr = flattenArray(arr);
    const count = {};
    for (const item of flatArr) {
        count[item] = count[item] ? count[item] + 1 : 1;
    }
    let result = Object.keys(count).map((i) => {
        return {
            "tag": i,
            "count": count[i]
        }
    }).sort((a, b) => b.count - a.count);
    return result;
};

async function readPost(from_path, to_path, md_path, des_json) {
    if (!eeutils.exists(from_path)) {
        console.log("\n  → error: template " + from_path + " not exist")
        return [];
    }
    var tmp_str = fs.readFileSync(from_path);
    tmp_str = tmp_str.toString();

    relative_path = '';

    var current_path;
    //CSS/JS 引用相对地址
    relative_path = path.relative(md_path, path_root);
    relative_path = relative_path.replace(/\.\.$/, '');
    if (to_path.indexOf("public/") >= 0) {
        current_path = to_path.replace("public/", '');
    } else {
        current_path = to_path.replace("public\\", '');
    }
    // 在md5路径模式下 只有一级
    if (config.pash && config.pash == true) {
        relative_path = '../'
    }

    // 循环创建目录
    !eeutils.exists(path.dirname(to_path)) && mkdirsSync(path.dirname(to_path));

    var new_md_path = path.join(path_root, md_path);
    var markdownStr = fs.readFileSync(new_md_path).toString();

    let customTags = [];

    // 渲染自定义标签
    let ctags = _renderConfig.customRender;
    if (ctags) {
        let markStr = markdownStr;
        // console.log(des_json);
        Object.keys(ctags).forEach((key) => {
            let conf = null;
            do {
                let wrap = customRenderTag(markStr, key);
                conf = wrap.config;
                if (conf != null) {
                    let str = renderingCustomTag(key, markStr, conf, des_json, relative_path);
                    let start = wrap.start;
                    let end = wrap.end;
                    let len = markStr.length;
                    markStr = markStr.substring(0, start) + str + markStr.substring(end, len);
                    wrap.tag = key;
                    wrap.pash = des_json.pash;
                    wrap.category_id = des_json.category_id;
                    customTags.push(wrap);
                }
                // console.log(`key ${key} rendering conf ${conf != null}`);
            } while (conf != null);
        });
        markdownStr = markStr;
    }

    // 逐行扫描
    var mdArr = markdownStr.split("\n");
    // 去除 heading #
    let heading = mdArr[0].replace("# ", "");
    mdArr[0] = heading;

    // 如果当前主题不需要渲染 MarkDown 前三行描述
    if (_renderConfig && _renderConfig.renderIntro != null && _renderConfig.renderIntro == false) {
        if (mdArr && mdArr.length > 3) {
            // 去除前三行
            mdArr.splice(0, 3);
        }
    }
    // iframe命中规则
    const iframeTplPath = _renderConfig && _renderConfig.iframeTpl ? path.join(themePath, _renderConfig.iframeTpl) : null;
    var iframeTpl = null;
    if (eeutils.isFile(iframeTplPath)) {
        iframeTpl = fs.readFileSync(iframeTplPath).toString();
    }
    // video 命中规则
    const videoTplPath = _renderConfig && _renderConfig.videoTpl ? path.join(themePath, _renderConfig.videoTpl) : null;
    var videoTpl = null;
    if (eeutils.isFile(videoTplPath)) {
        videoTpl = fs.readFileSync(videoTplPath).toString();
    }

    // gallery命中规则
    const galleryTplPath = _renderConfig && _renderConfig.galleryTpl ? path.join(themePath, _renderConfig.galleryTpl) :
        null;
    var galleryTpl = null;
    if (eeutils.isFile(galleryTplPath)) {
        galleryTpl = fs.readFileSync(galleryTplPath).toString();
    }
    var _galleryData = [];
    var arrLen = mdArr.length;
    mdArr = mdArr.map(function (item, i) {
        if (iframeTpl && iframeTpl.length > 0 &&
            item.indexOf('[iframe]') == 0) {
            const _iframeData = item.replace('[iframe]', '').replace('(', '').replace(')', '');
            return ejs.render(iframeTpl, {
                filename: iframeTplPath,
                iframeData: _iframeData,
                language: language
            });
        } else if (videoTpl && videoTpl.length > 0 &&
            item.indexOf('[video]') == 0) {
            const _videoData = item.replace('[video]', '').replace('(', '').replace(')', '');
            const _videoHtml = ejs.render(videoTpl, {
                filename: videoTplPath,
                videoData: _videoData,
                relative_path: relative_path,
                language: language
            });
            return _videoHtml;
        } else if (galleryTpl && galleryTpl.length > 0 &&
            item.indexOf('![gallery]') == 0) {
            const _image = item.replace('![gallery]', '').replace('(', '').replace(')', '');
            _galleryData.push(_image);
            var nextEle = null;
            if (i + 1 < arrLen) {
                var ele = mdArr[i + 1];
                if (ele.indexOf('![gallery]') == 0) {
                    nextEle = ele;
                } else {
                    // 下个元素已经不是 gallery 则需要开启渲染
                    nextEle = null;
                }
            } else {
                // 没有更多的元素 此时需要渲染
                nextEle = null;
            }
            if (nextEle == null) {
                const tmp = renderGallery(_galleryData, galleryTplPath, galleryTpl);
                _galleryData = [];
                return tmp;
            } else {
                return '';
            }
        } else if (item.indexOf("![cover](") >= 0 && item.indexOf(")") > 0) {
            return '';
        } else {
            return item;
        }
    });
    // 当前 md 的描述
    let describe = des_json ? des_json : {};
    // 注意 ejs 中，如果格式化出错(比如出现额外的空格、空白字符串) 会被 marked 转换为 <pre> <code>
    // 另外 vscode 安装两个格式化插件会导致，格式化、保存时各格式化一次
    markdownStr = mdArr.join('\n');
    let md_html = await renderMarkdown(markdownStr, describe, 0);
    if (!md_html) {
        console.log(error('→ ' + new_md_path + " failed!"));
        return [];
    }
    // 生成 HTML
    var html = ejs.render(tmp_str, {
        filename: from_path,
        relative_path: relative_path, // 当前文件相对于根目录的相对路径
        current_path: current_path, // 当前 html 路径
        describe: describe,
        config: config, // 传入所有配置,各个主体可以自行取值 配置中可以有自己的配置字段
        eedoc: eedoc,
        bannerPost: bannerPost,
        allPost: allPost,
        archivePost: archivePost,
        categoryPost: categoryPost,
        tocArray: tocArray,
        language: language,
        fn: {
            flattenArray: flattenArray,
            countElements: countElements,
            stringToHash: function (str) {
                return str.hashCode();
            }
        }
    });
    tocArray = [];
    html = html.replace('{{content}}', md_html);
    fs.writeFileSync(to_path, html);
    // console.log(success("  markdown → ") + to_path + '');
    return customTags;
}

function readPageToHTML(from_path, to_path, des_json) {
    if (!eeutils.exists(from_path)) return console.log("\n  → error: template " + from_path + " not exist")
    var tmp_str = fs.readFileSync(from_path);
    tmp_str = tmp_str.toString();

    var relative_path = '';

    var current_path = to_path.replace("public\/", '');
    // console.log(allPost);
    let tags = allPost.map((i) => i.tags ? i.tags : []);
    // 拍平标签数组并统计标签个数
    tags = countElements(tags);
    // console.log(tags);

    // 生成 HTML
    var html = ejs.render(tmp_str, {
        filename: from_path,
        relative_path: relative_path, // 当前文件相对于根目录的相对路径
        current_path: current_path, // 当前 html 路径
        describe: des_json ? des_json : {}, // 当前 md 的描述
        config: config, // 传入所有配置,各个主体可以自行取值 配置中可以有自己的配置字段
        eedoc: eedoc,
        bannerPost: bannerPost,
        allPost: allPost,
        archivePost: archivePost,
        categoryPost: categoryPost,
        tags: tags,
        language: language,
        fn: {
            flattenArray: flattenArray,
            countElements: countElements,
            stringToHash: function (str) {
                return str.hashCode();
            }
        }
    });

    // 循环创建目录
    !eeutils.exists(path.dirname(to_path)) && mkdirsSync(path.dirname(to_path));
    html = html.toString();
    fs.writeFileSync(to_path, html);
}

function renderGallery(arr, path, tpl) {
    return ejs.render(tpl, {
        filename: path,
        galleryData: arr,
        language: language
    });
}

function createStyl(styl_path, css_path) {
    var styl_str = fs.readFileSync(styl_path, 'utf8');
    stylus(styl_str.toString())
        .set('filename', styl_path)
        .set('compress', true)
        .render(function (err, css) {
            if (err) throw err;
            // 循环创建目录
            mkdirsSync(path.dirname(css_path));
            fs.writeFileSync(css_path, css);
            //console.log(success("  css → ") + styl_path + '');
        });
}

// 生成数据索引JS
function createDatajs(dt_path) {
    console.log(success("start building ..."));

    const postTpl = _renderConfig.postTpl;
    var indexes = [];
    if (postTpl) {
        // 如果不渲染doc下面的文章
        var path_md = path.join(path_root, docPath);
        // 获取 markdown 目录的集合
        var path_arr = readMDSync(path_md).filter(function (p) {
            if (excludeDash) {
                // 排除 `_post.md`
                return p && p.length > 0 && !path.basename(p).startsWith('_');
            } else {
                return p && p.length > 0;
            }
        });
        // pageTpl
        const pageTplPath = _renderConfig && _renderConfig.pageTpl ? path.join(themePath, _renderConfig.pageTpl) :
            null;
        var pageTpl = null;
        if (eeutils.isFile(pageTplPath)) {
            pageTpl = fs.readFileSync(pageTplPath).toString();
        }
        path_arr = sortLength(path_arr);
        path_arr.forEach(function (md_path, i) {
            // 解析文件原信息
            var stat = fs.statSync(md_path);
            // 读取 markdown 文本
            var con = fs.readFileSync(md_path, 'utf8');
            var str = con.toString();
            var str_arr = str.split("\n");
            // 解析 eedoc 标签
            let wrap = customRenderTag(str, 'eedoc');
            let json = wrap.config;
            if (json == null) {
                // console.log("invalid eedoc.");
                json = {};
            }

            // 通过 cheerio 解析 html
            const $ = cheerio.load(str, {
                decodeEntities: false
            });

            function findViewByEle(ele, outer, mark) {
                var txt = ele.html();
                if (txt && txt.length > 0) {
                    if (mark) {
                        txt = marked(txt, {
                            breaks: true,
                            highlight: hilight
                        }).replace(/\n/g, '');
                    }
                    if (outer) {
                        txt = $.html(ele.empty().append(txt));
                    }
                }
                return txt;
            }

            function findViewById(id, outer, mark) {
                return findViewByEle($(id), outer, mark);
            }

            // 文章名称
            var name = findViewById('name', false, false);
            var title = str_arr && str_arr.length > 0 ? str_arr[0].replace("# ", "") : "eedoc";
            if (name && name.length > 0) {
                title = name;
            }
            if (!json.name && title && title.length > 0) {
                json["name"] = title;
            }

            // 子标题
            var subtitle = findViewById('subtitle', false, false);
            if (!json.subtitle && subtitle && subtitle.length > 0) {
                json["subtitle"] = subtitle;
            }

            // 文章描述信息
            var des = str_arr && str_arr.length > 2 ? str_arr[2] : "a simple document generation tool";
            var d = findViewById('desc', false, true);
            if (d && d.length > 0) {
                des = d;
            }
            if (!json.desc && des && des.length > 0) {
                json["desc"] = des;
            }

            /**
             * cheerio 解析 <page/> 信息，场景 https://github.com/Pluckypan/sipho
             * TODO 目前仅用于生成 dt.js .page 的索引，有点浪费
             */
            let page = $('page').map(function (i, el) {
                var ele = $(this);
                if (pageTpl && pageTpl.length > 0) {
                    const $1 = cheerio.load('<div/>', {
                        decodeEntities: false
                    });
                    const $2 = $1(pageTpl);
                    var cls = ele.attr('class');
                    var sty = ele.attr('style');
                    if (cls) {
                        $2.addClass(cls);
                    }
                    if (sty) {
                        $2.attr('style', sty);
                    }
                    var txt1 = findViewByEle(ele, false, true);
                    var pstr = $1.html($2).format(txt1);
                    return pstr;
                } else {
                    return findViewByEle($(this), true, true);
                }
            }).get();
            if (!json.page && page && page.length > 0) {
                json["page"] = page;
            }

            var aPath = md_path.replace(/\.md$/, '').replace(path_md, '');
            // 文章路径
            json["path"] = aPath;
            // 路径的MD5值
            json["pash"] = eeutils.md5(aPath);
            // post相对路径
            if (config.pash && config.pash == true) {
                json["rPath"] = "../";
            } else {
                json["rPath"] = path.join(path.relative(md_path, docPath), '/');
            }
            if (config.pash && config.pash == true) {
                json["url"] = path.join('i', json.pash + '.html');
            } else {
                json["url"] = path.join('i', json.path + '.html');
            }

            // 封面图片
            if (!json.cover) {
                var cover = str_arr.find(function (tmp) {
                    return tmp.indexOf("![cover](") >= 0 && tmp.indexOf(")") > 0;
                });
                if (cover && cover.length > 0) {
                    cover = cover.replace("![cover](", "").replace(")", "")
                }
                json["cover"] = cover;
            }

            // 创建时间
            let ctime = json.create_time ? json.create_time : stat.birthtime;
            json["create_time"] = moment(ctime).format("YYYY-MM-DD HH:mm:ss");
            // 更新时间
            let utime = json.update_time ? json.update_time : stat.mtime;
            json["update_time"] = moment(utime).format("YYYY-MM-DD HH:mm:ss");

            var _cdir = path.dirname(aPath);
            //console.log(_cdir);
            if (json.category) {
                json["category_id"] = eeutils.md5(`${_cdir}${json.category}`);
            } else {
                var _cname = path.basename(_cdir);
                let cate = _cname && _cname.length > 0 ? _cname : "default";
                json["category"] = cate;
                json["category_id"] = eeutils.md5(_cdir);
            }

            const _date = new Date(json["create_time"]);
            json["year"] = _date.getFullYear();
            json["day"] = moment(_date).format("MM.DD");
            json["showTime"] = moment(_date).format(showTimeFormat);
            json["timestamp"] = moment(_date).format('x');
            indexes.push(json)
        })
    }
    indexes = indexes.sort(eeutils.sortRule(['sort', 'create_time'], false));
    //创建搜索引擎文件 dt.js
    mkdirsSync(path.dirname(dt_path));
    var jstr = 'var indexDB=' + JSON.stringify(indexes) + ';\n';
    // 出于安全考虑不能全部抛出config(深拷贝)
    const _config = JSON.parse(JSON.stringify(config));
    _config.deploys = [];
    _config.ftp = [];
    _config.cname = '';
    _config.comment = {};
    _config.page = {};
    jstr += "var config=" + JSON.stringify(_config) + ';\n';

    // 按分类分组文章 需要写入js
    categoryPost = eeutils.groupBy(indexes, function (itm) {
        return itm.category_id;
    });
    categoryPost.forEach((i) => {
        i.items = i.items.sort((a, b) => {
            let dif = moment(b.create_time).diff(moment(a.create_time));
            return dif;
        });
    });
    // 是否需要网 dt.js 中存入 category 索引
    if (_renderConfig.category2Db) {
        let kpJson = JSON.stringify(categoryPost);
        // console.log(kpJson);
        jstr += "var categoryPost=" + kpJson + ';\n';
    }

    eeutils.write(dt_path, jstr);
    return indexes;
}

// 按长度排序
function sortLength(arr) {
    var compare = function (x, y) { //比较函数
        x = path.basename(x, '.md');
        y = path.basename(y, '.md');
        if (x.length < y.length) {
            return -1;
        } else if (x.length > y.length) {
            return 1;
        } else {
            return 0;
        }
    }
    return arr.sort(compare)
}

// 同步循环创建所有目录 resolvePath
function mkdirsSync(dirpath, mode, callback) {
    if (fs.existsSync(dirpath)) {
        callback && callback(dirpath);
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirpath), mode)) {
            fs.mkdirSync(dirpath, mode, callback);
            callback && callback(dirpath);
            return true;
        } else {
            callback && callback(dirpath);
        }
    }
}

//返回 MD 所有路径的 Array
function readMDSync(filepath) {
    if (!eeutils.exists(filepath)) return [];
    var str = '',
        files = fs.readdirSync(filepath);
    for (var i = 0; i < files.length; i++) {
        var path_c = path.join(filepath, files[i]);
        if (eeutils.isDir(path_c)) {
            // 如果staticsDir放在了 markdown 目录则不解析
            if (!staticsDir || staticsDir != path_c) {
                str += readMDSync(path_c) + ',';
            }
        } else if (/\.(md)$/.test(files[i])) str += path_c + ',';
    };
    str = str.replace(/^\*|\,*$/g, '');
    return str.split(',');
}

module.exports = build;