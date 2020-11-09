#!/usr/bin/env node

var inquirer = require('inquirer');
var eeutils = require("./eeutils");
var path = require('path');
var fs = require('fs');
var shell=require('shelljs');

function setupTheme(config, theme) {
	config.theme = theme;
	eeutils.write('./config.json', JSON.stringify(config, null, "\t"));
	console.log('current theme:' + theme);
}

function theme(commander, config) {
	if (commander.theme == 'select') {
		var template = "./template/";
		var choices = ["default", "echo", "nav"];
		fs.readdirSync(template).forEach(function(file, index) {
			var curPath = path.resolve(template, file);
			if (fs.statSync(curPath).isDirectory()) {
				choices.push(file);
			}
		});
		inquirer.prompt([{
			"type": "list",
			"message": "theme",
			"name": "theme",
			"default": ["default"],
			"choices": choices
		}, ], function(answers) {
			setupTheme(config, answers.theme);
		});
	} else if (commander.theme == 'clone') {
		if (!shell.which('git')) {
			echo('Sorry, this script requires git');
			exit(1);
		}
		var themeGit = commander.args[0];
		if (themeGit == null) {
			console.log("please input a valid theme.");
			return;
		}
		var arr = themeGit.split("/");
		if (arr && arr.length > 1) {
			var themeName = arr[arr.length - 1].replace('.git', '');
			var themeOut = path.join('template', themeName);
			shell.exec('git clone ' + themeGit + ' ' + themeOut, {
				silent: false
			});
			if (eeutils.isDir(themeOut)) {
				setupTheme(config, themeName);
			}
		} else {
			console.log("please input a valid theme.");
		}
	}
}

module.exports = theme;
