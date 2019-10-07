eedoc
===
基于Node.js Markdown静态网站生成器 支持全站搜索 支持评论

<!-- eedoc {
	"banner":true
} eedoc -->

![cover](http://img.1991th.com/tuchongeter/statics/single-gallery-03.jpg)

### 功能
- 支持全站搜索
- 支持代码高亮
- 支持评论

[预览界面](https://pluckypan.github.io)

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

### 新指令说明 `since 1.5.5`
1. `1.5.5`版本新增归档列表 会按年月日归档文章
2. 由于老版本未统计时间戳,则需要对老的文章进行时间戳补全。方式有几种:
   - 使用 `eedoc -t` 指令,如果文章在 `git`版本库中 则取当前文件第一次提交时间 取不到则取当前时间
   - 手动添加,在文章最顶部添加如下代码，其中数字部分为文章时间戳 `[date]:1477757698`
3. 建议今后使用 `eedoc -n` 创建文章，会默认补全参数，用户可以将精力放在书写文章上

### gitalk 评论功能 `since 1.5.4`
目前支持 `畅言` `gitalk` 两种评论插件，在配置文件中添加相应的参数即可,其中 `gitalk` 基于 github issues,具体说明请自行参考  [gitalk](https://github.com/gitalk/gitalk/blob/master/readme-cn.md)
```
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
```

### 注意事项: markdown格式如下
```
标题
===
描述

### 以下都是内容
```

### 完整配置
```
{
	"title": "风之谷",
	"description": "念念不忘,必有回响",
	"home": "http://1991th.com",
	"version": "0.0.1",
	"licenses": "MIT",
	"doc": "doc",
	"out": "i",
	"icp": "鲁ICP备 xxxxxx号",
	"user": {
		"name": "User",
		"desc": "I'm a boy.",
		"avatar": "http://img.1991th.com/tuchongeter/statics/logo.png",
		"email": "user@echo.engineer",
		"social": [{
			"link": "http://www.1991th.com/",
			"name": "风之谷",
			"desc": "Take it Easy & Make it Happen",
			"logo": "http://img.1991th.com/tuchongeter/statics/logo.png",
			"image": ""
		}]
	},
	"links": [{
		"link": "http://www.1991th.com/",
		"name": "风之谷",
		"desc": "Take it Easy & Make it Happen",
		"logo": "http://img.1991th.com/tuchongeter/statics/logo.png",
		"image": ""
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
	"theme": "nav",
	"page": {
		"index.ejs": {
			"name": "首页",
			"path": "index.html",
			"render": "index.json"
		},
		"list.ejs": {
			"name": "搜索",
			"render": "index.md"
		}
	},
	"nav": {
		"busuanzi": true
	}
}
```