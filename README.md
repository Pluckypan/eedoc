eedoc
===
基于Node.js Markdown静态网站生成器 支持全站搜索 支持评论

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
```

### 注意事项: markdown格式如下
```
标题
===
描述

### 以下都是内容
```

### 代码块解析(javascript)
```
var url = 'ws://127.0.0.1:8000/';
socket = new WebSocket(url);
socket.onopen = function() {
    log('连接成功')
}
socket.onmessage = function(msg) {
    log('获得消息:' + msg.data);
    console.log(msg);
}
socket.onclose = function() {
    log('断开连接')
}
```

### 完整配置
```
{
	"title": "eedoc 网站标题",
	"description": "simple document generation tool with a local search engine 网站描述",
	"github": "http://www.a.c 网站链接",
	"deploys": [
		{
			"repo": "**** github或者其他git网站仓库地址",
			"branch": "master 分支",
			"message": "Compiler generation page"
		}
	],
	"ftp": {
		"host": "需要上传ftp服务器ip地址",
		"port": 21,
		"user": "",
		"pass": "",
		"cwd": ""
	},
	"changyan": {
		"appid": "",
		"conf": ""
	},
	"wumii": {
		"sitePrefix": ""
	},
	"cname": "www.echo.engineer cname用于设置自己的个性域名"
}
```

### 截图
![主界面](https://raw.githubusercontent.com/Pluckypan/eedoc/master/screenshoot/main_thumb.jpg)
![搜索](https://raw.githubusercontent.com/Pluckypan/eedoc/master/screenshoot/search_thumb.jpg)
![文章详情页](https://raw.githubusercontent.com/Pluckypan/eedoc/master/screenshoot/article_thumb.jpg)
