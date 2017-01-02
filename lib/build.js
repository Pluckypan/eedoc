#!/usr/bin/env node

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
var error = color.red.bold;
var warn = color.yellow;
var notice = color.blue;
var success = color.green;

renderer.heading = function(text, level) {
	if(/[\u4E00-\u9FA5]/i.test(text)) {
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
// 删除文件夹
//exec('rm -rf public');

function build(commander, callback) {
	config = JSON.parse(fs.readFileSync(path.join(path_root, "config.json")));

	CreateDatajs('public/js/dt.js', function(arr) {
		// 拷贝 favicon.ico
		mkdirsSync(path.join(path_root, "public/img/"));
		var frompath = path.join(template_path, 'img/favicon.ico');
		var topath = 'public/img/favicon.ico'
		copy(frompath, topath)

		CreateJS(path.join(template_path, 'js/index.js'), 'public/js/index.js')

		CreateStyl(path.join(template_path, 'styl/index.styl'), 'public/css/index.css')

		var indexConfig = config.index;
		indexConfig.command_length = arr.length;
		var listConfig = config.list;
		listConfig.command_length = arr.length;
		// 首页生成
		ReadTmpToHTML(path.join(template_path, 'index.ejs'), 'public/index.html', null, indexConfig);
		ReadTmpToHTML(path.join(template_path, 'list.ejs'), 'public/list.html', null, listConfig);
		// 文章批量生成
		arr.forEach(function(itm, idx) {
			var ejstpm = path.join(template_path, itm.p);
			var dep = path.join('public/c', itm.p);
			var md_path = path.join('command/', itm.p);
			ReadTmpToHTML(path.join(template_path, 'details.ejs'), dep + '.html', md_path + '.md', itm)
		});

		if(callback) {
			console.log(success("rebuild success! total article : " + arr.length + "."));
			callback(true);
		} else {
			console.log(success("build success! total article : " + arr.length + ",now you can run 'eedoc server'."));
		}

	})
}

function copy(src, dst) {
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

function ReadTmpToHTML(from_path, to_path, md_path, des_json) {
	if(!exists(from_path)) return console.log("\n  → error: 模板文件 " + from_path + " 不存在")
	var tmp_str = fs.readFileSync(from_path);
	tmp_str = tmp_str.toString();

	var relative_path = '';

	var current_path;
	if(md_path) {
		//CSS/JS 引用相对地址
		relative_path = path.relative(md_path.toString(), '/');
		relative_path = relative_path.replace(/\.\.$/, '');
		current_path = to_path.replace("public\\", '');
	} else {
		current_path = to_path.replace("public\/", '');
	}

	// 生成 HTML
	var html = ejs.render(tmp_str, {
		filename: from_path,
		relative_path: relative_path, // 当前文件相对于根目录的相对路径
		md_path: md_path ? md_path : '', // markdown 路径
		current_path: current_path, // 当前 html 路径
		describe: des_json ? des_json : {}, // 当前 md 的描述
		title: config.title,
		github: config.github
	});

	// 循环创建目录
	!exists(path.dirname(to_path)) && mkdirsSync(path.dirname(to_path));

	if(md_path) {
		var new_md_path = path.join(path_root, md_path);
		var README_str = fs.readFileSync(new_md_path);
		marked(README_str.toString(), function(err, md_html) {
			if(err) return console.log(error('→ ' + new_md_path + " 转换成HTML失败!"));

			html = html.replace('{{content}}', md_html);
			fs.writeFileSync(to_path, html);
			//console.log(success("  markdown → ") + to_path + '');
		})
	} else {
		html = html.toString();
		fs.writeFileSync(to_path, html.replace(/\n/g, ''));
		//console.log(success("  html → ") + to_path + '');
	}
}

function CreateStyl(styl_path, css_path) {
	var styl_str = fs.readFileSync(styl_path, 'utf8');
	stylus(styl_str.toString())
		.set('filename', styl_path)
		.set('compress', true)
		.render(function(err, css) {
			if(err) throw err;
			// 循环创建目录
			mkdirsSync(path.dirname(css_path));
			fs.writeFileSync(css_path, css);
			//console.log(success("  css → ") + styl_path + '');
		});
}

// 生成数据索引JS
function CreateDatajs(dt_path, callback) {
	console.log(success("start building ..."));
	var path_md = path.join(path_root, "command");
	// 获取 markdown 目录的集合
	var path_arr = readMDSync(path_md);
	path_arr = sortLength(path_arr);
	var indexes = [];

	path_arr.forEach(function(md_path, i) {
		var json = {}
		var con = fs.readFileSync(md_path);
		var str = con.toString();
		var str_arr = str.split("\n");
		var title = str_arr && str_arr.length > 0 ? str_arr[0] : "eedoc";
		var des = str_arr && str_arr.length > 2 ? str_arr[2] : "a simple document generation tool";
		// 命令名称
		json["n"] = title;
		// 命令路径
		json["p"] = md_path.replace(/\.md$/, '').replace(path_md, '');
		// 命令描述
		json["d"] = des;
		indexes.push(json)
	})

	//创建搜索引擎文件 dt.js
	mkdirsSync(path.dirname(dt_path));
	fs.writeFile(dt_path, 'var linux_commands=' + JSON.stringify(indexes), 'utf8', function(err) {
		if(callback)
			callback(indexes);
	});
}

// 按长度排序
function sortLength(arr) {
	var compare = function(x, y) { //比较函数
		x = path.basename(x, '.md');
		y = path.basename(y, '.md');
		if(x.length < y.length) {
			return -1;
		} else if(x.length > y.length) {
			return 1;
		} else {
			return 0;
		}
	}
	return arr.sort(compare)
}

// 同步循环创建所有目录 resolvePath
function mkdirsSync(dirpath, mode, callback) {
	if(fs.existsSync(dirpath)) {
		callback && callback(dirpath);
		return true;
	} else {
		if(mkdirsSync(path.dirname(dirpath), mode)) {
			fs.mkdirSync(dirpath, mode, callback);
			callback && callback(dirpath);
			return true;
		} else {
			callback && callback(dirpath);
		}
	}
}

function cp(src, dest, cb) {
	// yield support
	if('function' != typeof cb) return thunk;

	var complete = false;
	var read = fs.createReadStream(src);
	var write = fs.createWriteStream(dest);

	write.on('error', done);
	write.on('close', done);
	read.on('error', done);
	read.pipe(write);

	// done callback
	function done(err) {
		if(!complete) {
			complete = true;
			read.destroy();
			write.destroy();
			cb(err);
		}
	}

	// thunk-ified
	function thunk(done) {
		cp(src, dest, done);
	}
}

//返回 MD 所有路径的 Array
function readMDSync(filepath) {
	if(!exists(filepath)) return [];
	var str = '',
		files = fs.readdirSync(filepath);
	for(var i = 0; i < files.length; i++) {
		var path_c = path.join(filepath, files[i]);
		if(isDir(path_c)) {
			str += readMDSync(path_c) + ',';
		} else if(/\.(md)$/.test(files[i])) str += path_c + ',';
	};
	str = str.replace(/^\*|\,*$/g, '');
	return str.split(',');
}
//写文件 同步
function writeSync(filepath, content, callback) {
	mkdirsSync(path.dirname(filepath));
	return fs.writeFileSync(filepath, content, callback);
}

//写文件
function write(filepath, content) {
	return fs.writeFile(filepath, content);
}

//判断是不是目录
function isDir(_path) {
	return exists(_path) && fs.statSync(_path).isDirectory();
}

//检查指定路径的文件或者目录，是否存在
function exists(_path) {
	return fs.existsSync(_path);
}

module.exports = build;