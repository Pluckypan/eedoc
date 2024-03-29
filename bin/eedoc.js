#!/usr/bin/env node

var commander = require('commander');
var appInfo = require('../package');
var eedoc = require('..');

commander
	.usage('[options]')
	.description('a simple document generation tool with a local search engine(version: ' + appInfo.version + ')')
	.version(appInfo.version);

commander
	.option('-i, init', 'init a documentation.')
	.option("-b, build [type]", "build static html page.", 'release')
	.option("-s, server [type]", "run the page at http://127.0.0.1:1991", 1991)
	.option("-d, deploy", "publish static page to git repo.")
	.option("-f, ftp", "publish static page to ftp server.")
	.option("-c, clean", "clean the public floder.")
	.option("-t, theme [type]", "[select,clone] a theme.", 'select')
	.option("-n, new", "generate a new article.")
	.option("-l, lang", "select website language.")
	.option("-w, watch", "watch file state.");

commander.on('--help', () => {
	console.log("------------Sample-------------");
	console.log(" $ eedoc -i      ");
	console.log(" $ eedoc -b      ");
	console.log(" $ eedoc -s      ");
	console.log(" $ eedoc -d      ");
	console.log(" $ eedoc -f      ");
	console.log(" $ eedoc -c      ");
	console.log(" $ eedoc -t      ");
	console.log(" $ eedoc -n      ");
	console.log(" $ eedoc -l      ");
	console.log(" $ eedoc -w      ");
	console.log(" more -> http://www.echo.engineer");
});

commander.parse(process.argv);

if (!process.argv[2]) {
	commander.help();
}

eedoc(commander);
