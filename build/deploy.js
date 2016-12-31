var exec = require('child_process').exec;
var ghpages = require('gh-pages');
var loading = require('loading-cli');
var path = require('path');
var fs = require('fs');
var color = require('colors-cli/safe');
var error = color.red.bold;
var warn = color.yellow;
var notice = color.blue;
var success = color.green;

// 根目录
var path_root = process.cwd();
var config=JSON.parse(fs.readFileSync(path.join(path_root, "config.json")));

var deploy_path = path.join(process.cwd(), 'public');

if(fs.existsSync(deploy_path)) {
	var load = loading(' → Pushing code!!')
	load.start();
	ghpages.publish(deploy_path, {
		repo: config.deploy.repo,
		branch: config.deploy.branch,
		message: config.deploy.message + new Date()
	}, function(err) {
		if(err) return console.log(error('\n → ' + "" + err));
		load.stop()
		console.log(success('\n → ' + "Push success!!"));
		// 删除文件夹
		exec('rm -rf public');
	});
}