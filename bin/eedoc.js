#!/usr/bin/env node

var commander = require('commander');
var appInfo = require('../package');
var eedoc = require('..');

commander
	.usage('[options]')
	.description('a simple document generation tool with a local search engine(version: ' + appInfo.version + ')')
	.version(appInfo.version);

commander
	.option('-i, init', 'Init a documentation.')
	.option("-b, build", "build static html page.")
	.option("-s, server", "run the page at http://127.0.0.1:1991")
	.option("-d, deploy", "publish static page to git repo.")
	.option("-c, clean", "clean the public floder.")
	.option("-w, watch", "watch file state.");

commander.on('--help', function() {
	console.log("------------Sample-------------");
	console.log("      $ eedoc -i      ");
	console.log("      $ eedoc -b      ");
	console.log("      $ eedoc -s      ");
	console.log("      $ eedoc -d      ");
	console.log("      $ eedoc -c      ");
	console.log("more -> http://www.echo.engineer");
});

commander.parse(process.argv);

if(!process.argv[2]) {
	commander.help();
}

eedoc(commander);