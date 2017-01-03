eedoc
===
基于Markdown、搜索引擎的文档管理系统

### 安装
```
npm install eedoc -g  #创建全局eedoc
sudo npm install eedoc -g  #mac下以root权限运行
```
### 使用方法
```
eedoc -V #查看版本
eedoc -i #初始化文档
eedoc -b #创建静态
eedoc -s #运行服务
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