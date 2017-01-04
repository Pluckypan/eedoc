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

function deploy(commander) {
	var _configFile = path.join(_root, "config.json");
	if(!eeutils.isFile(_configFile)) {
		console.log(error("config.json not exist,please run eedoc -i first!"));
		return;
	}
	config = JSON.parse(fs.readFileSync(_configFile));

	if(fs.existsSync(_deployPath)) {
		var load = loading({
			"text": "→ pushing code to git repo !!!",
			"color": "yellow",
			"interval": 100,
			"stream": process.stdout,
			"frames": ["◐", "◓", "◑", "◒"]
		})
		load.start();
		ghpages.publish(_deployPath, {
			repo: config.deploy.repo,
			clone: _cache,
			branch: config.deploy.branch,
			message: config.deploy.message + new Date().getTime(),
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
				console.log("\n" + color.green('push complete！'));
			}
		});
	} else {
		console.log("error -> the path:" + _deployPath + " not exist!")
	}
}

module.exports = deploy;