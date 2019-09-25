### 渲染配置说明
```
{
	_ejs:['index.ejs'], // 要渲染的页面 对应渲染到 public 目录下,同名 index.html
	_js:['js/index.js','js/scroll.js'], // 要压缩的js 对应渲染到 public 目录下,js/index.js
	_css:['css/index.styl'], // 要渲染的样式 对应渲染到 public 目录下,css/index.css
	_copy:['img/','favicon.icon'],//拷贝资源文字,可以是文件夹,也可以是文件,如果是文件夹,则默认不拷贝 _ejs,_js,_css中包含的文件
	postTpl:"detail.ejs"// 文章页需要单独渲染 所以需要单独设置渲染模板
}
```

### 页面取值说明
1. 模板最终是通过 ejs 渲染成 html的，具体语法请参考:[链接](https://ejs.bootcss.com/)
2. 在模板中可以取到 config 对象(来自工程目录下 config.json)
3. 理论上可以在 config.json 中定义任意你想定义的参数,这样在模板中就能取到
4. 可以在任意页面取到 `eedoc` 对象,主要存储一些统计参数,{"total":1}

### Markdown 说明
1. 所有被加粗的都会被搜索引擎列为关键字