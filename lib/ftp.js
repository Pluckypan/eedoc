var Client = require('ftp');
var c = new Client();

function ftp(commander) {
	var config = {};
	c.on('ready', function() {
		c.list(function(err, list) {
			console.log(err);
			console.dir(list);
			c.end();
		});
	});
	c.connect(config);
}

module.exports = ftp;