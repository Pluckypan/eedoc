var path = require('path');
var init = require('./lib/init');
var build = require('./lib/build');
var deploy = require('./lib/deploy');
var ftp = require('./lib/ftp');
var exec = require('child_process').exec;
var watch = require('watch');
var server = require('ssr');
var eeutils = require("./lib/eeutils");

var root = process.cwd();
var cmd_path = path.join(root, "command/");
var pub_path = path.join(root, "public/");
var _cache = path.join(root, '.cache/');

module.exports = function(commander) {
	if(commander.init) {
		init(commander);
	} else if(commander.build) {
		build(commander);
	} else if(commander.server) {
		if(eeutils.exists(pub_path)) {
			process.chdir(pub_path);
			server({
				port: 1991
			});
			watcher(commander);
		} else {
			console.log("floder 'public' not exist, please run 'eedoc -b' first!");
		}
	} else if(commander.deploy) {
		deploy(commander);
	} else if(commander.clean) {
		eeutils.deleteFolderRecursive(_cache);
		eeutils.deleteFolderRecursive(pub_path);
	} else if(commander.watch) {
		watcher(commander);
	}else if(commander.ftp) {
		ftp(commander);
	}
}

function watcher(commander) {
	watch.createMonitor(cmd_path, function(monitor) {
		monitor.on("created", function(f, stat) {
			console.log("created ->" + f);
			process.chdir(root);
			build(commander, function(isOK) {
				process.chdir(pub_path);
			});
		});
		monitor.on("changed", function(f, curr, prev) {
			console.log("changed ->" + f);
			process.chdir(root);
			build(commander, function(isOK) {
				process.chdir(pub_path);
			});
		});
		monitor.on("removed", function(f, stat) {
			console.log("removed ->" + f);
			process.chdir(root);
			build(commander, function(isOK) {
				process.chdir(pub_path);
			});
		});
		//monitor.stop();
	})
}