eedoc
===
基于Node.js Markdown静态网站生成器;专注于创作

### 功能
- 支持全站搜索
- 支持代码高亮
- 支持评论

[预览界面](http://www.1991th.com/blog/)

### 安装
```
npm install eedoc -g  #创建全局eedoc
sudo npm install eedoc -g  #mac下以root权限运行
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
eedoc -t #为指定文章生成时间戳(generate timestamp for special article.)
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
	"banner":true,
	"create_time":"2019-07-18 21:45",
	"update_time":"2019-10-07 20:01",
	"category":"旅拍",
	"cover":"../assets/single-01.jpg",
	"tags":["分镜","人物"]
} eedoc -->

### 以下都是内容
```

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
		"logo": "http://img.1991th.com/tuchongeter/statics/logo.png",
		"image": ""
	}, {
		"link": "http://www.echo.engineer/",
		"name": "回声嘹亮",
		"desc": "I'm an Engineer",
		"logo": "http://img.1991th.com/tuchongeter/statics/logo.png",
		"image": "",
		"visibleTag": "echo"
	}],
	"statics": "assets",
	"deploys": [{
		"repo": "",
		"branch": "gh-pages",
		"message": "Compiler generation page "
	}],
	"ftp": {
		"host": "",
		"port": 21,
		"user": "",
		"pass": "",
		"cwd": ""
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
	"theme": "default",
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
		"galleryAbout": ["./assets/single-01.jpg", "./assets/single-02.jpg"]
	}
}
```