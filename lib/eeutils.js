var fs = require('fs')
var path = require('path');

module.exports = {
	exists: exists,
	isFile: isFile,
	isDir: isDir,
	mkdirsSync: mkdirsSync,
	isURL: isURL,
	write: write
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
	if(fs.existsSync(dirpath)) {
		return true;
	} else {
		if(mkdirsSync(path.dirname(dirpath), mode)) {
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

/** 文件操作相关  ----end---- **/

function isURL(str) {
	var reg = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
	return reg.test(str);
}

function sleep(milliSeconds) {
	var startTime = new Date().getTime();
	while(new Date().getTime() < startTime + milliSeconds);
}