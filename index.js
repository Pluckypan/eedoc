var path = require('path');
var fs = require('fs');
var init = require('./lib/init');
var build = require('./lib/build');
var deploy = require('./lib/deploy');
var ftp = require('./lib/ftp');
var exec = require('child_process').exec;
var watch = require('watch');
var color = require('colors-cli/safe');
var eeutils = require("./lib/eeutils");
var error = color.red.bold;
// serve
const handler = require('serve-handler');
const http = require('http');
const server = http.createServer((request, response) => {
	return handler(request, response);
})
server.on('error', function(e) {
	if (e.code == 'EADDRINUSE' && e.port) {
		console.log('current port ' + e.port + ' is in use. please change it and try again.');
	} else {
		console.log('serve error.');
	}
});
const opn = require('opn');

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
	const cmd = commander.rawArgs[2];
	if (commander.init) {
		init(commander);
	} else if (commander.deploy) {
		deploy(commander, config);
	} else if (commander.clean) {
		eeutils.deleteFolderRecursive(_cache);
		eeutils.deleteFolderRecursive(pub_path);
	} else if (commander.watch) {
		watcher(commander);
	} else if (commander.ftp) {
		ftp(commander, config);
	} else if ((cmd == 'build' || cmd == '-b') && commander.build) {
		build(commander, null, config);
	} else if ((cmd == 'server' || cmd == '-s') && commander.server) {
		if (eeutils.exists(pub_path)) {
			process.chdir(pub_path);
			server.listen(commander.server, () => {
				watcher(commander);
				const url = "http://localhost:" + commander.server;
				console.log('Running at ' + url);
				opn(url);
			});
		} else {
			console.log("floder 'public' not exist, please run 'eedoc -b' first!");
		}
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
			}, config);
		});
		//monitor.stop();
	})
}
