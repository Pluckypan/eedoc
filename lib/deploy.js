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
	"frames": ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"]
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
var lastMsg;

function publish() {
	if(!deployArr || curIndex >= deployArr.length) {
		return;
	}
	load.start();
	var _deploy = deployArr[curIndex];
	ghpages.publish(_deployPath, {
		repo: _deploy.repo,
		clone: _cache,
		branch: _deploy.branch,
		message: _deploy.message + new Date().getTime(),
		logger: function(message) {
			//确保输出不同信息
			if(!equals(lastMsg, message)) {
				load.text = curIndex + " → " + message;
				load.color = "yellow";
				lastMsg = message;
			}
		}
	}, function(err) {
		load.stop();
		eeutils.deleteFolderRecursive(_cache);
		if(err) {
			console.log(color.red('error -> ' + curIndex + ":" + err));
		} else {
			console.log(color.green("complete -> " + curIndex + ":" + _deploy.repo));
		}
		curIndex++;
		//递归
		publish();
	});
}

function equals(str1, str2) {
	if(str1 == str2) {
		return true;
	}
	return false;
}

module.exports = deploy;