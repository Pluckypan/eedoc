var ghpages = require('gh-pages');
var loading = require('loading-cli');
var color = require('colors-cli/safe');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

// 根目录
var _root = process.cwd();
var _deployPath = path.join(_root, 'public');
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
			branch: config.deploy.branch,
			message: config.deploy.message + new Date()
		}, function(err) {
			if(err) {
				console.log(color.red('error -> ' + err));
			} else {
				console.log(color.green('push complete！'));
			}
			setTimeout(function() {
				load.stop();
				exec('rm -rf public');
			}, 3000);
		});
	} else {
		console.log("error -> the path:" + _deployPath + " not exist!")
	}
}

module.exports = deploy;