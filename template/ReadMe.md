### 渲染配置说明
```
{
	_ejs:['index.ejs'], // 要渲染的页面 对应渲染到 public 目录下,同名 index.html
	_js:['js/index.js','js/scroll.js'], // 要压缩的js 对应渲染到 public 目录下,js/index.js
	_css:['css/index.styl'], // 要渲染的样式 对应渲染到 public 目录下,css/index.css
	_copy:['img/','favicon.icon'],//拷贝资源文字,可以是文件夹,也可以是文件,如果是文件夹,则默认不拷贝 _ejs,_js,_css中包含的文件
	postTpl:"detail.ejs",// 文章页需要单独渲染 所以需要单独设置渲染模板	
	renderIntro:false // 是否渲染 postTpl 文档的前三行(一般用作标题,简述)
	iframeTpl:"_iframe.ejs",  // markdown 中通过 [iframe](xxx) 即可渲染 iframe 标签
	galleryTpl:"_gallery.ejs" // markdown 中通过 ![gallery](xxx1) ![gallery](xxx2) ![gallery](xxx3) 即可渲染Banner
}
```

### 页面取值说明
```
relative_path // 当前文件相对于根目录的相对路径
current_path // 当前 html 路径
describe // 当前 md 的描述
config // 传入所有配置,各个主体可以自行取值 配置中可以有自己的配置字段
eedoc // eedoc
```
1. 模板最终是通过 ejs 渲染成 html的，具体语法请参考:[链接](https://ejs.bootcss.com/)
2. 在模板中可以取到 config 对象(来自工程目录下 config.json)
3. 理论上可以在 config.json 中定义任意你想定义的参数,这样在模板中就能取到
4. 可以在任意页面取到 `eedoc` 对象,主要存储一些统计参数,{"total":1}
5. `<%=relative_path%>` 可以获取当前页面相对于根目录的路径,一般文章详情页会需要用到(因为路径问题)
6. `{{content}}` 可以获取当前 markdown 渲染 html 结果

### 不同模板关于 page 标准字段的定义
一般情况下 页面(非post),渲染方式分为3种
1. 最简单的静态页面,只取一些基本信息,如 title,description,icp,links,此时 render 可不填
2. 如果想在单页面配置不同的数据,可配置当前页面数据为 xxx.json
3. 如果想在单页面填充markdown数据,可配置为 xxx.md
4. 不管是 xxx.json 或 xxx.md 最终都会渲染为 _render 字段。供各个页面渲染时使用。
5. 在模板引擎中直接使用 <%=describe._render%>
```
{
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
	}
}
```

### 各主题自定义配置说明
一般情况下,主题的自定义配置,在工程目录下 config.json 中按照主题名称添加字段.如主题 `nav`,配置如下

```
{
	"nav": {
		"busuanzi": true,
		"topLinks": [{
			"link": "http://www.1991th.com/",
			"name": "首页",
			"target": "_self"
		}]
	}
}
```

### Markdown 说明
1. 所有被加粗的都会被搜索引擎列为关键字

### iconfont 属性说明
为了让用户选择自己的图标库(目前支持iconfont),link&family直接从 iconfont 后台拷贝即可
```
{
"iconfont": {
	"link": "https://at.alicdn.com/t/font_1427835_zgyohh6l1si.css",
	"family": "engineer"
}
}
```
### 链接一般格式
这里所说的链接包括但不限：友情链接、导航链接等 格式如下；
- `visibleTag` 作用为特定情况下才显示该链接
- `image` 属性一般用作大图时显示
- `icon` 一般使用矢量小图标 直接使用 iconfont 的 symbol class

```
{
	"link": "https://www.sigoo.com/",
	"name": "极像素",
	"desc": "超高像素看世界",
	"logo": "http://www.sigoo.com/favicon.png",
	"image": "",
	"visibleTag":"hub",
	"icon":"icon-email",
	"target":"_self"
}
```

### 参考
- eedoc 参考主题 [flex-blog](http://infinitythemes.ge/flex-blog/)