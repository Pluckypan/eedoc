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
eedoc -i,init    #初始化文档
eedoc -b,build   #创建静态
eedoc -s,server  #运行服务
```
### 注意事项: markdown格式如下
```
标题
===
描述

### 以下都是内容
```

### todo
```
1 eedoc -d,deploy   # 提交至git版本库 （coding.net、github.com、oschina.net）
2 eedoc -f,ftp      # 通过ftp提交至服务器
```