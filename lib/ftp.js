var FtpDeploy = require("ftp-deploy");
var ftpDeploy = new FtpDeploy();
var path = require('path');
var fs = require('fs');
var eeutils = require("./eeutils");
var globby = require('globby');
var loading = require('loading-cli');
var load = loading({
	"text": "pushing...",
	"color": "green",
	"interval": 100,
	"stream": process.stdout,
	"frames": ["◐", "◓", "◑", "◒"]
});

// 根目录
var _root = process.cwd();
var _deployPath = path.join(_root, 'public/');
var _ftpPath;
var files;

function ftp(commander, config) {
	if (!fs.existsSync(_deployPath)) {
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

	if (!files || files.length == 0) {
		console.log(color.red("error -> the path:" + _deployPath + " is empty!please run 'eedoc -b' first!"));
		return;
	}
	var ftpCfg = _config.ftp;
	if (!ftpCfg || !ftpCfg.host) {
		console.log(color.red("error -> please edit 'ftp' in 'config.json'!"));
		return;
	}
	_ftpPath = ftpCfg.cwd;
	var config = {
		user: ftpCfg.user,
		password: ftpCfg.pass,
		host: ftpCfg.host,
		port: ftpCfg.port,
		include: ['*', '**/*'],
		localRoot: _deployPath,
		remoteRoot: _ftpPath,
		deleteRemote: ftpCfg.deleteRemote,
		forcePasv: true
	};

	// use with promises
	load.start();
	ftpDeploy
		.deploy(config)
		.then(res => {
			var all = 0;
			res.forEach(function(it) {
				all += it.length;
			})
			console.log("finished:" + all + " total:" + files.length)
			load.stop()
		})
		.catch(err => {
			console.log(color.red("error -> upload failed!"))
			load.stop()
		});

	ftpDeploy.on("uploading", function(data) {
		load.text = (data.transferredFileCount * 100 / data.totalFilesCount).toFixed(2) + "% : " + data.filename;
	});
}
module.exports = ftp;
