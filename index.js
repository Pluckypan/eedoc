var path = require('path');
var fs = require('fs');
var init = require('./lib/init');
var build = require('./lib/build');
var deploy = require('./lib/deploy');
var ftp = require('./lib/ftp');
var exec = require('child_process').exec;
var watch = require('watch');
var server = require('ssr');
var color = require('colors-cli/safe');
var eeutils = require("./lib/eeutils");
var error = color.red.bold;

var root = process.cwd();
var config = parseConfig();
var docPath = "command";
if (config && config.doc) {
	docPath = config.doc;
}
var cmd_path = path.join(root, docPath);
var pub_path = path.join(root, "public");
var _cache = path.join(root, '.cache');

module.exports = function(commander) {
	if (commander.init) {
		init(commander);
	} else if (commander.build) {
		build(commander, null, config);
	} else if (commander.server) {
		if (eeutils.exists(pub_path)) {
			process.chdir(pub_path);
			server({
				port: 1991
			});
			watcher(commander);
		} else {
			console.log("floder 'public' not exist, please run 'eedoc -b' first!");
		}
	} else if (commander.deploy) {
		deploy(commander, config);
	} else if (commander.clean) {
		eeutils.deleteFolderRecursive(_cache);
		eeutils.deleteFolderRecursive(pub_path);
	} else if (commander.watch) {
		watcher(commander);
	} else if (commander.ftp) {
		ftp(commander, config);
	} else {
		console.log('coming soon.')
	}
}

function parseConfig() {
	var _configFile = path.join(root, "config.json");
	if (eeutils.isFile(_configFile)) {
		try {
			return JSON.parse(fs.readFileSync(_configFile));
		} catch (e) {
			return null;
		}
	}
	return null;
}

function watcher(commander) {
	watch.createMonitor(cmd_path, function(monitor) {
		monitor.on("created", function(f, stat) {
			console.log("created ->" + f);
			process.chdir(root);
			build(commander, function(isOK) {
				process.chdir(pub_path);
			}, config);
		});
		monitor.on("changed", function(f, curr, prev) {
			console.log("changed ->" + f);
			process.chdir(root);
			build(commander, function(isOK) {
				process.chdir(pub_path);
			}, config);
		});
		monitor.on("removed", function(f, stat) {
			console.log("removed ->" + f);
			process.chdir(root);
			build(commander, function(isOK) {
				process.chdir(pub_path);
			}), config;
		});
		//monitor.stop();
	})
}
