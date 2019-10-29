var exec = require('child_process').exec;
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var marked = require('marked');
var watch = require('watch');
var stylus = require('stylus')
var highlight = require('highlight.js')
var UglifyJS = require("uglify-js");
var renderer = new marked.Renderer();
var color = require('colors-cli/safe');
var eeutils = require("./eeutils");
var error = color.red.bold;
var warn = color.yellow;
var notice = color.blue;
var success = color.green;
const moment = require('moment');

String.prototype.format = function() {
	var values = arguments;
	return this.replace(/\{(\d+)\}/g, function(match, index) {
		if (values.length > index) {
			return values[index];
		} else {
			return "";
		}
	});
};

renderer.heading = function(text, level) {
	if (/[\u4E00-\u9FA5]/i.test(text)) {
		return '<h' + level + ' id="' + text.toLowerCase() + '">' + text + '</h' + level + '>';
	} else {
		var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
		return '<h' + level + ' id="' + escapedText + '">' + text + '</h' + level + '>';
	}
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
	highlight: function(code, lang, callback) {
		lang = lang ? lang : "bash";
		return callback('', highlight.highlight(lang, code).value);
	}
});
var template_path = path.resolve(__dirname, "../template");
// 根目录
var path_root = process.cwd();
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

// 遍历文件夹 返回文件列表
function fileArr(dir, arr) {
	const files = fs.readdirSync(dir);
	files.forEach(function(filename) {
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
	config.copy.forEach(function(f, i) {
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
		"list.ejs":{"name":"搜索列表"}
	}
 }
 */
function getPageConfig(page) {
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
				marked(fs.readFileSync(renderFile).toString(), function(err, md_html) {
					res._render = md_html;
				});
			}
		}
	}
	return res ? res : {}
}
var allPost = [];
var bannerPost = [];
var archivePost = [];
var categoryPost = [];

function build(commander, callback, _config) {
	if(_config==null){
		console.log(error("config.json is not exist,please run `eedoc -i` first!"));
		return;
	}
	config = _config;
	var theme = "default";
	if (config.theme) {
		theme = config.theme;
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

	themePath = path.resolve(template_path, theme);
	const _renderConfigFile = path.join(themePath, 'render.config');
	if (!eeutils.isFile(_renderConfigFile)) {
		console.log(error("render.config not exist,please check!"));
		return;
	}
	_renderConfig = JSON.parse(fs.readFileSync(_renderConfigFile));
	if (_renderConfig.markedRender) {
		if (_renderConfig.markedRender.heading) {
			renderer.heading = function(text, level) {
				return _renderConfig.markedRender.heading.format(text, level);
			}
		}
		if (_renderConfig.markedRender.table) {
			renderer.table = function(theader, tbody) {
				return _renderConfig.markedRender.table.format(theader, tbody);
			}
		}
		if (_renderConfig.markedRender.link) {
			renderer.link = function(href, title, text) {
				const _tar = eeutils.parseUrl(href, 'target');
				var _target = _tar ? _tar : '_self';
				const _linkHtml = _renderConfig.markedRender.link.format(href, title, text, _target);
				return _linkHtml;
			}
		}
	}

	// 所有文章
	allPost = CreateDatajs('public/js/dt.js');
	// 置顶文章
	bannerPost = allPost.filter(function(postItem) {
		return postItem.banner && postItem.banner == true;
	});
	// 归档文章
	archivePost = eeutils.groupBy(allPost, function(itm) {
		return itm.year;
	}).sort(function(a, b) {
		return parseInt(b.group) - parseInt(a.group);
	});
	// console.log(categoryPost);

	renderingPage();
	if (allPost.length > 0) {
		eedoc.total = allPost.length;
		// 渲染文章
		allPost.forEach(function(itm, idx) {
			var dep = path.join(path.join('public', outPath), (config.pash && config.pash == true) ? itm.pash : itm.path);
			var md_path = path.join(docPath, itm.path);
			ReadPost(path.join(themePath, _renderConfig.postTpl), dep + '.html', md_path + '.md', itm)
		});
	} else {
		console.log(warn("no post."));
	}

	if (callback) {
		console.log(success("rebuild success! total article : " + allPost.length + "."));
		callback(true);
	} else {
		console.log(success("build success! total article : " + allPost.length + ",now you can run 'eedoc -s'."));
	}
}

// 渲染单页面
function renderingPage() {
	const ejsList = _renderConfig.ejs.map(x => {
		return path.join(themePath, x);
	});
	const jsList = _renderConfig.js.map(x => {
		return path.join(themePath, x);
	});
	const cssList = _renderConfig.css.map(x => {
		return path.join(themePath, x);
	});
	getCopyArr(_renderConfig, themePath).forEach(function(f, i) {
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

	jsList.forEach(function(f, i) {
		var name = f.replace(themePath, '')
		var topath = path.join('public', name);
		CreateJS(f, topath)
	});
	cssList.forEach(function(f, i) {
		var name = f.replace(themePath, '').replace('.styl', '.css')
		var topath = path.join('public', name);
		CreateStyl(f, topath)
	});

	//生成CNAME
	if (config.cname && config.cname.length > 0) {
		eeutils.write(path.join(path_root, "public/CNAME"), config.cname);
	}

	//渲染页面
	_renderConfig.ejs.forEach(function(f, i) {
		const frompath = path.join(themePath, f);
		var name = f.replace('.ejs', '.html')
		var topath = path.join('public', name);
		ReadPageToHTML(frompath, topath, getPageConfig(f))
	});

	// 拷贝MarkDown图片
	if (eeutils.isDir(staticsDir)) {
		const dsti = path.join('public', config.statics);
		eeutils.copyDir(staticsDir, dsti)
	}
}

function copy(src, dst) {
	mkdirsSync(path.dirname(dst));
	fs.createReadStream(src).pipe(fs.createWriteStream(dst));
}

function CreateJS(from_path, to_path) {
	// 生成js到指定目录并压缩js
	mkdirsSync(path.dirname(to_path));
	var js_code = UglifyJS.minify(from_path, {
		mangle: {
			toplevel: true
		}
	});
	fs.writeFileSync(to_path, js_code.code);
}

function ReadPost(from_path, to_path, md_path, des_json) {
	if (!eeutils.exists(from_path)) return console.log("\n  → error: 模板文件 " + from_path + " 不存在")
	var tmp_str = fs.readFileSync(from_path);
	tmp_str = tmp_str.toString();

	var relative_path = '';

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

	// console.log(des_json);
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
		categoryPost: categoryPost
	});

	// 循环创建目录
	!eeutils.exists(path.dirname(to_path)) && mkdirsSync(path.dirname(to_path));

	var new_md_path = path.join(path_root, md_path);
	var markdownStr = fs.readFileSync(new_md_path).toString();
	// 逐行扫描
	var mdArr = markdownStr.split("\n");
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
	mdArr = mdArr.map(function(item, i) {
		if (iframeTpl && iframeTpl.length > 0 &&
			item.indexOf('[iframe]') == 0) {
			const _iframeData = item.replace('[iframe]', '').replace('(', '').replace(')', '');
			return ejs.render(iframeTpl, {
				filename: iframeTplPath,
				iframeData: _iframeData
			});
		} else if (videoTpl && videoTpl.length > 0 &&
			item.indexOf('[video]') == 0) {
			const _videoData = item.replace('[video]', '').replace('(', '').replace(')', '');
			const _videoHtml=ejs.render(videoTpl, {
				filename: videoTplPath,
				videoData: _videoData
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
	markdownStr = mdArr.join('\n');
	marked(markdownStr, function(err, md_html) {
		if (err) return console.log(error('→ ' + new_md_path + " 转换成HTML失败!"));

		html = html.replace('{{content}}', md_html);
		fs.writeFileSync(to_path, html);
		//console.log(success("  markdown → ") + to_path + '');
	})
}

function ReadPageToHTML(from_path, to_path, des_json) {
	if (!eeutils.exists(from_path)) return console.log("\n  → error: 模板文件 " + from_path + " 不存在")
	var tmp_str = fs.readFileSync(from_path);
	tmp_str = tmp_str.toString();

	var relative_path = '';

	var current_path = to_path.replace("public\/", '');
	// console.log(allPost);
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
		categoryPost: categoryPost
	});

	// 循环创建目录
	!eeutils.exists(path.dirname(to_path)) && mkdirsSync(path.dirname(to_path));
	html = html.toString();
	fs.writeFileSync(to_path, html.replace(/\n/g, ''));
}

function renderGallery(arr, path, tpl) {
	return ejs.render(tpl, {
		filename: path,
		galleryData: arr
	});
}

function CreateStyl(styl_path, css_path) {
	var styl_str = fs.readFileSync(styl_path, 'utf8');
	stylus(styl_str.toString())
		.set('filename', styl_path)
		.set('compress', true)
		.render(function(err, css) {
			if (err) throw err;
			// 循环创建目录
			mkdirsSync(path.dirname(css_path));
			fs.writeFileSync(css_path, css);
			//console.log(success("  css → ") + styl_path + '');
		});
}

// 生成数据索引JS
function CreateDatajs(dt_path) {
	console.log(success("start building ..."));
	const postTpl = _renderConfig.postTpl;
	var indexes = [];
	if (postTpl) {
		// 如果不渲染doc下面的文章
		var path_md = path.join(path_root, docPath);
		// 获取 markdown 目录的集合
		var path_arr = readMDSync(path_md).filter(function(p) {
			return p && p.length > 0;
		});
		path_arr = sortLength(path_arr);
		path_arr.forEach(function(md_path, i) {
			var json = {}
			var con = fs.readFileSync(md_path);
			var stat = fs.statSync(md_path);
			var str = con.toString();
			var str_arr = str.split("\n");
			var title = str_arr && str_arr.length > 0 ? str_arr[0] : "eedoc";
			var des = str_arr && str_arr.length > 2 ? str_arr[2] : "a simple document generation tool";
			const eStart = str.indexOf("<!-- eedoc {");
			const eEnd = str.indexOf("} eedoc -->");
			var postCfg = null;
			if (eEnd > eStart && eStart > 0) {
				try {
					postCfg = JSON.parse(str.substring(eStart + 11, eEnd + 1));
				} catch (e) {
					postCfg = null;
				}
			}
			// 文章名称
			json["name"] = title;
			var aPath = md_path.replace(/\.md$/, '').replace(path_md, '');
			// 文章路径
			json["path"] = aPath;
			// 路径的MD5值
			json["pash"] = eeutils.md5(aPath);
			// 文章描述
			json["desc"] = des;
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
			if (postCfg && postCfg.cover) {
				json["cover"] = postCfg.cover;
			} else {
				var cover = str_arr.find(function(tmp) {
					return tmp.indexOf("![cover](") >= 0 && tmp.indexOf(")") > 0;
				});
				if (cover && cover.length > 0) {
					cover = cover.replace("![cover](", "").replace(")", "")
				}
				json["cover"] = cover;
			}
			// 是否置顶热门或Banner
			json["banner"] = postCfg && postCfg.banner ? postCfg.banner == true : false;
			// 支持手动排序
			json["sort"] = postCfg && postCfg.sort ? postCfg.sort : 0;
			// 创建时间
			json["create_time"] = postCfg && postCfg.create_time ? postCfg.create_time : moment(stat.birthtime).format(
				"YYYY-MM-DD HH:mm:ss");
			// 更新时间
			json["update_time"] = postCfg && postCfg.update_time ? postCfg.update_time : moment(stat.mtime).format(
				"YYYY-MM-DD HH:mm:ss");
			if (postCfg && postCfg.category) {
				json["category"] = postCfg.category;
				json["category_id"] = eeutils.md5(postCfg.category);
			} else {
				var _catDir = path.dirname(aPath);
				var _catName = path.basename(_catDir);
				json["category"] = _catName && _catName.length > 0 ? _catName : "默认";
				json["category_id"] = eeutils.md5(_catDir);
			}
			json["tags"] = postCfg && postCfg.tags ? postCfg.tags : [];
			const _date = new Date(json["create_time"]);
			json["year"] = _date.getFullYear();
			json["day"] = moment(_date).format("MM.DD");
			indexes.push(json)
		})
	}
	indexes = indexes.sort(eeutils.sortRule(['sort','create_time'],false));
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
	categoryPost = eeutils.groupBy(indexes, function(itm) {
		return itm.category_id;
	});
	jstr += "var categoryPost=" + JSON.stringify(categoryPost) + ';\n';

	eeutils.write(dt_path, jstr);
	return indexes;
}

// 按长度排序
function sortLength(arr) {
	var compare = function(x, y) { //比较函数
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
