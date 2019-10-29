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
	}], function(answers) {
		answers.doc = "doc";
		answers.out = "i";
		// icp 备案号
		answers.icp = null;
		answers.user = {
			"name": "User",
			"desc": "I'm a boy.",
			"avatar": "http://img.1991th.com/tuchongeter/statics/041122",
			"email": "user@echo.engineer",
			"social": [{
				"link": "http://www.1991th.com/",
				"name": "风之谷",
				"desc": "Take it Easy & Make it Happen",
				"logo": "http://img.1991th.com/tuchongeter/statics/041122",
				"icon": "icon-github",
				"image": ""
			}]
		};
		// 友链
		answers.links = [{
			"link": "http://www.1991th.com/",
			"name": "风之谷",
			"desc": "Take it Easy & Make it Happen",
			"logo": "http://img.1991th.com/tuchongeter/statics/logo.png",
			"image": ""
		}];
		answers.statics = "assets";
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
		answers.iconfont={
			"link": "https://at.alicdn.com/t/font_1427835_zgyohh6l1si.css",
			"family": "engineer"
		};
		answers.adv= {
			"link": "http://www.1991th.com/",
			"name": "天猫导流",
			"desc": "天猫2019双十一.火热进行中",
			"image": "assets/default-adv.png",
			"target": "blank"
		},
		answers.cname = "";
		answers.pash = true;
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
		answers.theme = "default";
		// 针对不同页面的配置
		answers.page = {
			"index.ejs": {
				"name": "首页",
				"path": "index.html",
				"render": "index.json"
			},
			"list.ejs": {
				"name": "搜索"
			},
			"about.ejs": {
				"name": "关于我",
				"render": "about.md"
			},
			"message.ejs": {
				"name": "留言板",
				"render": "message.json"
			}
		}
		// nav 主题推荐配置
		answers.nav = {
			"busuanzi": true,
			"topLinks": [{
				"link": "http://www.1991th.com/",
				"name": "首页",
				"target": "_self"
			}]
		};
		// echo 主题推荐配置
		answers.echo={
			"stars": {
				"name": "星球",
				"links": [{
					"link": "#",
					"name": "解忧杂货铺",
					"target": "_self"
				}]
			},
			"photograph": {
				"name": "photograph",
				"links": [{
					"link": "http://www.1991th.com/photos/index.html",
					"name": "香山红叶落满天",
					"target": "_blank",
					"image": "http://infinitythemes.ge/images/instagram/5.jpg"
				}]
			},
			"galleryAbout": ["./assets/single-01.jpg", "./assets/single-02.jpg"]
		};
		//创建config 格式化输出
		eeutils.write("./config.json", JSON.stringify(answers, null, "\t"));
		// 拷贝markdown示例
		var docPath = path.resolve(__dirname, "../doc");
		eeutils.copyDir(docPath,'./doc/')
		// 拷贝page示例
		var pagePath = path.resolve(__dirname, "../page");
		eeutils.copyDir(pagePath,'./page/')
		// 拷贝assets静态资源示例
		const assetsPath = path.resolve(__dirname, "../assets");
		eeutils.copyDir(assetsPath,'./assets/')

		//创建静态目录
		eeutils.mkdirsSync("./public/");

		console.log(success("-> init success,now you can run 'eedoc build' !"));
	});
}

module.exports = init;
