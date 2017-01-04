var path = require('path');
var init = require('./lib/init');
var build = require('./lib/build');
var deploy = require('./lib/deploy');
var watch = require('watch');
var server = require('ssr');
var root = process.cwd();
var cmd_path = path.join(root, "command/");
var pub_path = path.join(root, "public/");

module.exports = function(commander) {
	if(commander.init) {
		init(commander);
	} else if(commander.build) {
		build(commander);
	} else if(commander.server) {
		process.chdir(pub_path);
		server({
			port: 1991
		});
		watcher(commander);
	}else if(commander.deploy){
		deploy(commander);
	} else if(commander.watch) {
		watcher(commander);
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