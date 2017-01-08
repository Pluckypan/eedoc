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
		"message": "your github page",
		"name": "github",
		"validate": function(input) {
			var done = this.async();
			if(!input || !eeutils.isURL(input)) {
				console.log(color.red("-> Must be a valid github homepage!"));
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
			if(!semver.valid(input)) {
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
		answers.eedoc = {};
		answers.index = {
			"p": "/index.html",
			"n": answers.title,
			"d": answers.description
		};
		answers.list = {
			"p": "/list.html",
			"n": "搜索",
			"d": answers.description
		};
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
		//创建config
		eeutils.write("./config.json", JSON.stringify(answers));
		//拷贝默认markdown
		eeutils.mkdirsSync("./command/");
		var command_path = path.resolve(__dirname, "../command");
		eeutils.copy(path.join(command_path, "sample.md"), "./command/sample.md");
		//创建静态目录
		eeutils.mkdirsSync("./public/");

		console.log(success("-> init success,now you can run 'eedoc build' !"));
	});
}

module.exports = init;