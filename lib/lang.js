#!/usr/bin/env node

var inquirer = require('inquirer');
var eeutils = require("./eeutils");
var path = require('path');
var fs = require('fs');

function lang(commander, config) {
	inquirer.prompt([{
		"type": "list",
		"message": "language",
		"name": "theme",
		"default": ["default"],
		"choices": ["A", "B"]
	}, ], function(answers) {

	});
}

module.exports = lang;
