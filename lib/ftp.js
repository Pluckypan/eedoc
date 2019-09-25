var JSFtp = require("jsftp");
var path = require('path');
var fs = require('fs');
var color = require('colors-cli/safe');
var eeutils = require("./eeutils");
var globby = require('globby');
var loading = require('loading-cli');
var load = loading({
	"text": "pushing static page to ftp server !!!",
	"color": "yellow",
	"interval": 100,
	"stream": process.stdout,
	"frames": ["◐","◓","◑","◒"]
});

// 根目录
var _root = process.cwd();
var _deployPath = path.join(_root, 'public/');
var Ftp;
var files;
var index = 0;

function ftp(commander,config) {
	if(!fs.existsSync(_deployPath)) {
		console.log(color.red("error -> the path:" + _deployPath + " not exist!please run 'eedoc -b' first!"));
		return;
	}
	var _config = config;

	files = globby.sync("**/*", {
		cwd: _deployPath,
		dot: true
	}).filter(function(file) {
		return !fs.statSync(path.join(_deployPath, file)).isDirectory();
	});

	if(!files || files.length == 0) {
		console.log(color.red("error -> the path:" + _deployPath + " is empty!please run 'eedoc -b' first!"));
		return;
	}
	var ftpCfg = _config.ftp;
	if(!ftpCfg || !ftpCfg.host) {
		console.log(color.red("error -> please edit 'ftp' in 'config.json'!"));
		return;
	}
	Ftp = new JSFtp(ftpCfg);
	Ftp.raw("cwd "+ftpCfg.cwd, function(err, data) {
		var mkdirs = "mkd c\nmkd css\nmkd img\nmkd js";
		Ftp.raw(mkdirs, function(err, data) {
			load.start();
			upload();
		});
	});
}

function upload() {
	if(!Ftp||!files || index >= files.length) {
		load.stop();
		Ftp.destroy();
		console.log(color.green("ftp send success!"));
		return;
	}
	var dest = files[index];
	var src = path.join(_deployPath, dest);
	load.text = "sending " + " → " + src;
	load.color = "green";
	Ftp.put(src, dest, function(err) {
		if(err) {
			load.text = "error " + " → " + JSON.stringify(err);
			load.color = "red";
		}
		index++;
		upload();
	});
}

module.exports = ftp;
