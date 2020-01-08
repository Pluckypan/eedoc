#!/usr/bin/env node

var inquirer = require('inquirer');
var eeutils = require("./eeutils");
var path = require('path');
var fs = require('fs');
require('shelljs/global');

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
			config.theme = answers.theme;
			eeutils.write('./config.json', JSON.stringify(config, null, "\t"));
			console.log('current theme:' + answers.theme);
		});
	} else if (commander.theme == 'clone') {
		if (!which('git')) {
			echo('Sorry, this script requires git');
			exit(1);
		}
		var themeGit = commander.args[0];
		var arr = themeGit.split("/");
		if (arr && arr.length > 1) {
			var themeOut = path.join('template', arr[arr.length-1].replace('.git',''));
			exec('git clone ' + themeGit + ' ' + themeOut, {
				silent: false
			});
		} else {
			console.log("please input a valid theme.");
		}
	}
}

module.exports = theme;
