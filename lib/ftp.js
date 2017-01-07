var Client = require('ftp');
var c = new Client();
var path = require('path');
var fs = require('fs');
var color = require('colors-cli/safe');
var eeutils = require("./eeutils");
var globby = require('globby');

// 根目录
var _root = process.cwd();
var _deployPath = path.join(_root, 'public/');

function ftp(commander) {
	var _configFile = path.join(_root, "config.json");
	if(!eeutils.isFile(_configFile)) {
		console.log(color.red("config.json not exist,please run 'eedoc -i' first!"));
		return;
	}
	if(!fs.existsSync(_deployPath)) {
		console.log(color.red("error -> the path:" + _deployPath + " not exist!please run 'eedoc -b' first!"));
		return;
	}
	var _config = JSON.parse(fs.readFileSync(_configFile));

	c.on('ready', function() {
		//var files=globby.sync(patterns, [options]);
		var files = globby.sync("**/*", {
			cwd: _deployPath,
			dot: true
		}).filter(function(file) {
			return !fs.statSync(path.join(_deployPath, file)).isDirectory();
		});

		if(!files || files.length == 0) {
			console.log(color.red("error -> the path:" + _deployPath + " is empty!please run 'eedoc -b' first!"));
			return;
		}

		_files = files;
		upload(_config.ftp.pub_path);
	});
	c.connect(_config.ftp);
}

//挨个循环
var _files;
var index = 0;

function upload(_path) {
	if(!_files || index >= _files.length) {
		c.end();
		return;
	}
	var filename = _files[index];
	var src = path.join(_deployPath, filename);
	var dest = path.join(_path, filename);
	c.put(src, dest, function(err) {
		if(err) {
			console.log(color.red("ftp error -> " + err));
		}
		index++;
		upload(path);
	});
}

module.exports = ftp;