var Client = require('ftp');

var c = new Client();
var config = {
	host: "42.96.171.11",
	port: 21,
	user: "fh_app",
	password: "asdasd"
};
c.on('ready', function() {
	c.list(function(err, list) {
		if(err) throw err;
		console.dir(list);
		c.end();
	});
});
c.connect(config);