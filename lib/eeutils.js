var fs = require('fs')
var path = require('path');

module.exports = {
	exists: exists,
	isFile: isFile,
	isDir: isDir,
	mkdirsSync: mkdirsSync,
	isURL: isURL,
	copy: copy,
	sleep: sleep,
	deleteFolderRecursive: deleteFolderRecursive,
	write: write,
	copyDir: copyDir,
	getQueryString: getQueryString
}

/** 文件操作相关  ----start---- **/
//检查指定路径的文件或者目录是否存在
function exists(_path) {
	return fs.existsSync(_path);
}

//判断是不是文件
function isFile(_path) {
	return exists(_path) && fs.statSync(_path).isFile();
}

//判断是不是目录
function isDir(_path) {
	return exists(_path) && fs.statSync(_path).isDirectory();
}

// 同步循环创建所有目录
function mkdirsSync(dirpath, mode) {
	if (fs.existsSync(dirpath)) {
		return true;
	} else {
		if (mkdirsSync(path.dirname(dirpath), mode)) {
			fs.mkdirSync(dirpath, mode);
			return true;
		}
	}
}

//写文件
function write(filepath, content) {
	mkdirsSync(path.dirname(filepath));
	return fs.writeFileSync(filepath, content);
};
//拷贝文件
function copy(src, dst) {
	fs.createReadStream(src).pipe(fs.createWriteStream(dst));
}

// 使用递归删除文件
function deleteFolderRecursive(path) {
	var files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist) {
	var b = fs.existsSync(dist)
	if (!b) {
		//创建目录
		mkdirsSync(dist);
	}
	var paths = fs.readdirSync(src)
	paths.forEach(function(p) {
		var _src = src + '/' + p;
		var _dist = dist + '/' + p;
		var stat = fs.statSync(_src)
		if (stat.isFile()) {
			// 判断是文件还是目录
			fs.writeFileSync(_dist, fs.readFileSync(_src));
		} else if (stat.isDirectory()) {
			// 当是目录是，递归复制
			copyDir(_src, _dist)
		}
	})
}

/** 文件操作相关  ----end---- **/

function isURL(str) {
	var reg = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
	return reg.test(str);
}

function sleep(milliSeconds) {
	var startTime = new Date().getTime();
	while (new Date().getTime() < startTime + milliSeconds);
}

function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return unescape(r[2]);
	}
	return null;
}
