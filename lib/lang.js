#!/usr/bin/env node

var inquirer = require('inquirer');
var eeutils = require("./eeutils");
var path = require('path');
var fs = require('fs');

function lang(commander, config) {
	var configPath = path.resolve(process.cwd(), "config.json");
	if (!eeutils.exists(configPath)) {
		console.log("config.json is not exists.");
		return;
	}

	inquirer.prompt([{
		"type": "list",
		"message": "select theme language",
		"name": "language",
		"choices": ["en", "zh-CN", "zh-TW", "ja", "ko", "fr", "es", "de", "ar", "ru", "th"]
	}, ], function(answers) {
		config.language = answers.language;
		eeutils.write(configPath, JSON.stringify(config, null, "\t"));
		console.log('current language:' + answers.language);
	});
}

module.exports = lang;
