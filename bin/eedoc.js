var commander = require('commander');
var appInfo = require('../package');
var eedoc = require('..');

commander
	.usage('[options]')
	.description('Simple document generation tool with a local search engine(version: ' + appInfo.version + ')')
	.version(appInfo.version);

commander
	.option("-b, build", "build static html page.")
	.option("-s, server", "run the page at http://127.0.0.1:1991")
	.option("-w, watch", "watch file state.")
	.option('-i, init', 'Init a documentation.');

commander.on('--help', function() {

});

commander.parse(process.argv);

if(!process.argv[2]) {
	commander.help();
}

eedoc(commander);