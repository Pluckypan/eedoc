jQuery插件
===
强大的jQuery插件

### 图片处理
#### 一、qrcode.js二维码
``` javascript
<script src="http://cdn.bootcss.com/jquery/2.2.2/jquery.min.js"></script>
<script src="http://jqweui.com/assets/js/qrcode.js"></script>
var qrcode=document.getElementById("qrcode");
var coder = new QRCode(qrcode, {width: 200,height: 200,});
coder.makeCode("hello");
```
#### 二、holder.js占位图
> html5中，input标-签可以根据placeholder来设定默认占位文字，但是img标签并没有该属性。由于img图片的渲染是一个耗时操作，在网络状态较差的情况下，可能长时间显示不出图片来。使用holder.js给图片添加
占位图能提高用户体验。

``` javascript
<script src="holder.js"></script>
<img data-src="example.com/100x100?theme=simple" id="new">
Holder.run({
  domain: "example.com",
  themes: {
    "simple": {
      bg: "#eee",
      fg: "#000",
      size: 17
    }
  },
  images: "#new"
});
```