#!/usr/bin/env node

var inquirer = require('inquirer');
var eeutils = require("./eeutils");
var path = require('path');

function theme(commander,config) {
	if (commander.theme == 'select') {
		inquirer.prompt([{
			"type": "list",
			"message": "theme",
			"name": "theme",
			"default": ["default"],
			"choices": ["default", "echo", "nav"]
		}, ], function(answers) {
			config.theme = answers.theme;
			eeutils.write('./config.json', JSON.stringify(config, null, "\t"));
			console.log('current theme:' + answers.theme);
		});
	} else {
		console.log('coming soon.' + commander.theme);
	}
}

module.exports = theme;
