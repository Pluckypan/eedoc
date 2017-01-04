var ghpages = require('gh-pages');
var loading = require('loading-cli');
var color = require('colors-cli/safe');
var path = require('path');
var fs = require('fs');
var eeutils = require("./eeutils");

// 根目录
var _root = process.cwd();
var _deployPath = path.join(_root, 'public/');
var _cache = path.join(_root, '.cache/');
var load = loading({
	"text": "→ pushing code to git repo !!!",
	"color": "yellow",
	"interval": 100,
	"stream": process.stdout,
	"frames": ["◐", "◓", "◑", "◒"]
});

function deploy(commander) {
	var _configFile = path.join(_root, "config.json");
	if(!eeutils.isFile(_configFile)) {
		console.log(color.red("config.json not exist,please run eedoc -i first!"));
		return;
	}
	config = JSON.parse(fs.readFileSync(_configFile));
	if(fs.existsSync(_deployPath)) {
		deployArr = config.deploys;
		if(deployArr && deployArr.length > 0) {
			publish();
		} else {
			console.log(color.yellow("please edit 'deploys' in config.json !"));
		}
	} else {
		console.log("error -> the path:" + _deployPath + " not exist!")
	}
}
var deployArr;
var curIndex = 0;

function publish() {
	if(deployArr || curIndex >= deployArr.length) {
		return;
	}
	load.start();
	var deploy = deployArr[curIndex];
	ghpages.publish(_deployPath, {
		repo: deploy.repo,
		clone: _cache,
		branch: deploy.branch,
		message: deploy.message + new Date().getTime(),
		logger: function(message) {
			load.text = "→ " + message;
			load.color = "yellow";
		}
	}, function(err) {
		load.stop();
		eeutils.deleteFolderRecursive(_cache);
		if(err) {
			console.log("\n" + color.red('error -> ' + err));
		} else {
			console.log("\n" + color.green("complete -> " + deploy.repo));
		}
		curIndex++;
		//递归
		publish();
	});
}

module.exports = deploy;