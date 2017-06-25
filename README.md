eedoc
===
基于Markdown、搜索引擎的文档管理系统

[预览界面](https://pluckypan.github.io)

### 截图
![主界面](https://raw.githubusercontent.com/Pluckypan/eedoc/master/screenshoot/main.jpg)
![搜索](https://raw.githubusercontent.com/Pluckypan/eedoc/master/screenshoot/search.jpg)
![文章详情页](https://raw.githubusercontent.com/Pluckypan/eedoc/master/screenshoot/article.jpg)

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
### 测试javascript
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