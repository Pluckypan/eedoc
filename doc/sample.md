eedoc
===
基于Node.js Markdown静态网站生成器;专注于创作

### 特点
- 轻量、简易、简洁、高颜值
- 专注于写作
- 支持`gitalk`、`畅言`评论
- 支持全文检索
- 支持分类、归档
- 可扩展：可以参考系统内置主题自行扩展

### 主题
目前内置三种主题: `default`、`echo`、`nav`,可以在 `config.json` 中配置 `theme` 字段

<div align="center">

![eedoc](http://img.1991th.com/tuchongeter/statics/eedoc@echo.home.png!1080jpg)

[博客主题@echo](http://www.1991th.com/blog/)

</div>

<div align="center">

![eedoc](http://img.1991th.com/tuchongeter/statics/eedoc@nav.png!1080jpg)

[导航主题@nav](http://www.1991th.com/nav/)

</div>

### 安装
```
npm install eedoc -g  #创建全局eedoc
sudo npm install eedoc -g  #mac下以root权限运行
```
### 开始使用
```
$ eedoc
$ mkdir sample
$ cd sample
$ eedoc init
```
### 使用方法
```
eedoc -V #查看版本
eedoc -i #初始化文档(init a documentation.)
eedoc -b #创建静态页(build static html page.)
eedoc -s #运行服务(run the page at http://127.0.0.1:1991.)
eedoc -d #发布至git版本库(publish static page to git repo.)
eedoc -f #发布至ftp服务器(publish static page to ftp server.)
eedoc -c #清除缓存及静态页(clean the public floder.)
eedoc -t #选择主题(select a theme.)
eedoc -n #新建文章(generate a new article.)
```

### gitalk 评论功能 `since 1.5.4`
目前支持 `畅言` `gitalk` 两种评论插件，在配置文件中添加相应的参数即可,其中 `gitalk` 基于 github issues,具体说明请自行参考  [gitalk](https://github.com/gitalk/gitalk/blob/master/readme-cn.md)
```
"comment": {
	"changyan": {
	  "appid": "",
	  "conf": ""
	},
	"gitalk":{
	  "clientID": "xxx",
	  "clientSecret": "xxx",
	  "repo": "xxx",
	  "owner": "xxx",
	  "admin": ["xxx"],
	  "distractionFreeMode": true
	}
}
```

### 注意事项: markdown格式如下
```
标题
===
描述

<!-- eedoc {
	"banner":false,
	"create_time":"2019-07-18 21:45",
	"update_time":"2019-10-07 20:01",
	"category":"旅拍",
	"cover":"../assets/single-01.jpg",
	"tags":["分镜","人物"]
} eedoc -->

### 以下都是内容
Hi,我是静静
```

### Markdown 格式参考
[点这里](doc/post.md),然后打开编辑器,参考文章该如何写作

### 自定义主题说明
[点这里](template/ReadMe.md),具体参数如何使用,可参考 `template/echo` 主题

### 完整配置(config.json)
```
{
	"title": "风之谷",
	"description": "念念不忘,必有回响",
	"home": "http://1991th.com",
	"version": "0.0.1",
	"licenses": "MIT",
	"doc": "doc",
	"out": "i",
	"pash": true,
	"excludeDash":true,
	"icp": "鲁ICP备 xxxxxx号",
	"user": {
		"name": "User",
		"desc": "I'm a boy.",
		"avatar": "http://img.1991th.com/tuchongeter/statics/default_avatar.jpg",
		"email": "user@echo.engineer",
		"social": [{
			"link": "mailto:plucky@echo.engineer",
			"name": "邮箱",
			"icon": "icon-email",
			"target": "_blank"
		}, {
			"link": "https://space.bilibili.com/362980071",
			"name": "B站",
			"icon": "icon-bilibili",
			"target": "_blank"
		}, {
			"link": "http://plucky.tuchong.com/",
			"name": "图虫",
			"icon": "icon-tuchong",
			"target": "_blank"
		}, {
			"link": "https://github.com/Pluckypan",
			"name": "Github",
			"icon": "icon-github",
			"target": "_blank"
		}]
	},
	"links": [{
		"link": "http://www.1991th.com/",
		"name": "风之谷",
		"desc": "Take it Easy & Make it Happen",
		"logo": "http://img.1991th.com/tuchongeter/statics/041122",
		"image": ""
	}, {
		"link": "http://www.echo.engineer/",
		"name": "回声嘹亮",
		"desc": "I'm an Engineer",
		"logo": "http://img.1991th.com/tuchongeter/statics/041122",
		"image": ""
	}],
	"statics": "assets",
	"deploys": [{
		"repo": "",
		"branch": "gh-pages",
		"message": "Compiler generation page "
	}],
	"ftp": {
		"host": "xxx",
		"port": 21,
		"user": "xxx",
		"pass": "xxx",
		"cwd": "xxx",
		"deleteRemote": false
	},
	"cname": "",
	"comment": {
		"changyan": {
			"appid": null,
			"conf": "***"
		},
		"gitalk": {
			"clientID": null,
			"clientSecret": "***",
			"repo": "***",
			"owner": "***",
			"admin": [
				"***"
			],
			"distractionFreeMode": true
		}
	},
	"iconfont": {
		"link": "https://at.alicdn.com/t/font_1427835_zgyohh6l1si.css",
		"family": "engineer"
	},
	"adv": {
		"link": "http://www.1991th.com/",
		"name": "天猫导流",
		"desc": "天猫2019双十一.火热进行中",
		"image": "assets/default-adv.png",
		"target": "blank"
	},
	"theme": "echo",
	"page": {
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
	},
	"nav": {
		"busuanzi": true,
		"topLinks": [{
			"link": "http://www.1991th.com/",
			"name": "首页",
			"target": "_self"
		}]
	},
	"echo": {
		"stars": {
			"name": "星球",
			"links": [{
				"link": "#",
				"name": "解忧杂货铺",
				"target": "_self"
			}, {
				"link": "#",
				"name": "影单",
				"target": "_self"
			}, {
				"link": "#",
				"name": "歌单",
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
	}
}
```