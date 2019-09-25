#!/usr/bin/env node

var color = require('colors-cli');
var inquirer = require('inquirer');
var success = color.green;
var semver = require('semver');
var eeutils = require("./eeutils");
var path = require('path');

function init(commander) {
	inquirer.prompt([{
		"message": "title",
		"name": "title",
		"default": "eedoc"
	}, {
		"message": "description",
		"name": "description",
		"default": "simple document generation tool with a local search engine"
	}, {
		"message": "your home page",
		"name": "home",
		"validate": function(input) {
			var done = this.async();
			if (!input || !eeutils.isURL(input)) {
				console.log(color.red("-> Must be a valid url!"));
				return;
			}
			done(true);
		}
	}, {
		"message": "version",
		"name": "version",
		"default": "0.0.1",
		"validate": function(input) {
			var done = this.async();
			//分析版本是否正确或者null
			if (!semver.valid(input)) {
				console.warn(color.red('-> Must be a valid semantic version (semver.org).'));
				return;
			}
			done(true);
		}
	}, {
		"type": "list",
		"message": "licenses",
		"name": "licenses",
		"default": ["MIT"],
		"choices": ["MIT", "Apache", "GPL", "Artistic", "BSD", "Affero", "LGPL", "EPL", "LGPL", "MPL"]
	}], function(answers) {
		answers.doc = "doc";
		answers.out = "i";
		answers.deploys = [{
			"repo": "",
			"branch": "gh-pages",
			"message": "Compiler generation page "
		}];
		answers.ftp = {
			"host": "",
			"port": 21,
			"user": "",
			"pass": "",
			"cwd": ""
		};
		answers.cname = "";
		answers.comment = {
			"changyan": {
				"appid": null,
				"conf": "***"
			},
			"gitalk": {
				"clientID": null,
				"clientSecret": "***",
				"repo": "***",
				"owner": "***",
				"admin": ["***"],
				"distractionFreeMode": true
			}
		}
		// 针对不同页面的配置
		answers.page = {
			'index.ejs': {}
		}
		//创建config 格式化输出
		eeutils.write("./config.json", JSON.stringify(answers, null, "\t"));
		//拷贝默认markdown
		eeutils.mkdirsSync("./doc/");
		var docPath = path.resolve(__dirname, "../doc");
		eeutils.copy(path.join(docPath, "sample.md"), "./doc/sample.md");
		//创建静态目录
		eeutils.mkdirsSync("./public/");

		console.log(success("-> init success,now you can run 'eedoc build' !"));
	});
}

module.exports = init;
