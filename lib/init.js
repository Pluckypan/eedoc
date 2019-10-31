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
		"default": "http://www.1991th.com",
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
	}, {
		"type": "list",
		"message": "theme",
		"name": "theme",
		"default": ["default"],
		"choices": ["default", "echo", "nav"]
	}, {
		"message": "your name",
		"name": "userName",
		"default": "User"
	}, {
		"message": "email",
		"name": "userEmail",
		"default": "user@echo.engineer"
	}, {
		"message": "motto",
		"name": "userMotto",
		"default": "True man does what he will, not what he must."
	}, ], function(answers) {
		// 读取默认config
		var configPath = path.resolve(__dirname, '../config.json');
		var config = JSON.parse(eeutils.readString(configPath));
		// 获取用户选择
		config.title = answers.title;
		config.description = answers.description;
		config.home = answers.home;
		config.version = answers.version;
		config.licenses = answers.licenses;
		config.theme = answers.theme;
		config.user.name = answers.userName;
		config.user.desc = answers.userMotto;
		config.user.email = answers.userEmail;
		config.user.social[0].link = answers.userEmail;
		//创建config 格式化输出
		eeutils.write('./config.json', JSON.stringify(config, null, "\t"));

		// 拷贝markdown示例
		var docPath = path.resolve(__dirname, "../doc");
		eeutils.copyDir(docPath, './doc/')
		// 拷贝page示例
		var pagePath = path.resolve(__dirname, "../page");
		eeutils.copyDir(pagePath, './page/')
		// 拷贝assets静态资源示例
		const assetsPath = path.resolve(__dirname, "../assets");
		eeutils.copyDir(assetsPath, './assets/')

		//创建静态目录
		eeutils.mkdirsSync("./public/");

		console.log(success("-> init success,now you can run 'eedoc build' !"));
	});
}

module.exports = init;
