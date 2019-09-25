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
	"text": "→ pushing static page to git repo !!!",
	"color": "yellow",
	"interval": 100,
	"stream": process.stdout,
	"frames": ["◐","◓","◑","◒"]
});

function deploy(commander,config) {
	if(fs.existsSync(_deployPath)) {
		deployArr = config.deploys;
		if(deployArr && deployArr.length > 0) {
			publish();
		} else {
			console.log(color.yellow("please edit 'deploys' in config.json!"));
		}
	} else {
		console.log("error -> the path:" + _deployPath + " not exist!please run 'eedoc -b' first!")
	}
}
var deployArr;
var curIndex = 0;

function publish() {
	if(!deployArr || curIndex >= deployArr.length) {
		//不删除 这样能提高性能
		//eeutils.deleteFolderRecursive(_cache);
		return;
	}
	var _deploy = deployArr[curIndex];
	var _cloIdx = _deploy.repo.lastIndexOf("/");
	var _tmp = _deploy.repo.substring(_cloIdx);
	_tmp = _tmp + "@" + curIndex;
	var _clone = path.join(_cache, _tmp);
	load.start();
	ghpages.publish(_deployPath, {
		repo: _deploy.repo,
		clone: _clone,
		branch: _deploy.branch,
		dotfiles: true,
		message: _deploy.message + new Date().getTime(),
		logger: function(message) {
			load.text = curIndex + " → " + message;
			load.color = "yellow";
		}
	}, function(err) {
		load.stop();
		if(err) {
			console.log(color.red('  error -> ' + curIndex + ":" + err));
		} else {
			console.log(color.green("  complete -> " + curIndex + ":" + _deploy.repo));
		}
		curIndex++;
		//递归
		publish();
	});
}

module.exports = deploy;
