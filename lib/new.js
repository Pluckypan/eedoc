#!/usr/bin/env node

var inquirer = require('inquirer');
var eeutils = require("./eeutils");
var path = require('path');
var fs = require('fs');
const moment = require('moment');
var pathRoot = process.cwd();
var docPath = path.resolve(pathRoot, "./doc");

function newArticle(commander, config) {
	if (!eeutils.isDir(docPath)) {
		console.log("doc dir is not exists.");
		return;
	}
	inquirer.prompt([{
		"message": "please input file name:",
		"name": "name",
		"default": "untitled"
	}, {
		"message": "please input post title:",
		"name": "title",
		"default": "untitled"
	}, {
		"message": "please input post descrition:",
		"name": "descrition",
		"default": "music is my daily life..."
	}, {
		"message": "please input post category:",
		"name": "category",
		"default": "default"
	}, {
		"message": "please input post tags:",
		"name": "tags",
		"default": "music,daily"
	}, {
		"type": "list",
		"message": "pin",
		"name": "pin",
		"choices": ["false", "true"]
	}, ], function(answers) {
		writePost(answers);
	});
}

function writePost(answers) {
	var result = answers.title + "\n";
	result += "===\n";
	result += answers.descrition + "\n\n";
	result += genAttribute(answers) + "\n";
	result += "<!-- write below -->\n";
	result += "> Love is a lie & Lover is liar. <cite>Jone•Snow</cite>";
	var res = eeutils.write(path.resolve(docPath, answers.name + ".md"), result);
	console.log("success");
}

function genAttribute(answers) {
	var arr = answers.tags.split(',');
	var time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
	var result = "<!-- eedoc {\n";
	result += '"banner":' + answers.pin + ',\n';
	result += '"create_time":"' + time + '",\n';
	result += '"update_time":"' + time + '",\n';
	result += '"category":"' + answers.category + '",\n';
	result += '"tags":' + JSON.stringify(arr) + '\n';
	result += '} eedoc -->\n';
	return result;
}

module.exports = newArticle;
