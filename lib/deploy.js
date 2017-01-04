var ghpages = require('gh-pages');
var loading = require('loading-cli');
var color = require('colors-cli/safe');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

// 根目录
var _root = process.cwd();
var _deployPath = path.join(_root, 'public/');
var _cache = path.join(_root, '.cache/');
var config = JSON.parse(fs.readFileSync(path.join(_root, "config.json")));

function deploy(commander) {
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
			if(err) {
				console.log("\n" + color.red('error -> ' + err));
			} else {
				console.log("\n" + color.green('push complete！'));
			}
			setTimeout(function() {
				load.stop();
				exec('rm -rf ' + _cache);
			}, 3000);
		});
	} else {
		console.log("error -> the path:" + _deployPath + " not exist!")
	}
}

module.exports = deploy;