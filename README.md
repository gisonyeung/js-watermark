# js-watermark
JavaScript 图片文字水印、图片图片水印生成工具，生成 base64 编码图片，可以传入file对象或者base64图片。

# 使用示意
① 引入 JS 
```JavaScript
<script src="js-watermark.js"></script>
```

② 调用（通过`base64`传入的用法）
```JavaScript
var watermark = new Watermark();
watermark.setImage(base64String);
watermark.addText( {
    text: ['Call By waterMark.addText'],
    fontSize: '5vw',
    left: 10,
    top: 10,
    ...
});
var dataURL = watermark.render('png');
```

# 参数
```JavaScript
new Watermark();
```

其中：
* `option`为可选参数，addText和addImage的参数不同，这里解释下全部参数含义，使用的有哪些参数请看源码：
* `image`Image对象，传入为设置图片水印
* `text`全局水印文字，在添加水印时若不指定水印文字，则会默认使用全局水印文字，默认值为`Call By waterMark.addText`，可以有多个文字，随机设置到图片中。
* `fontSize`全局水印字体大小，单位`px`或`vw`，其中`px`为绝对值，`vw`为相对值，`100vw`等于当前图片宽度，默认值为`6vw`。
* `fontFamily`全局字体类型，默认值为`Microsoft Yahei`。
* `color`全局字体颜色，默认值为`#000000`。
* `textAlign`文字对齐方式, 参数有`left`|`center`|`right`，默认值`center`
* `globalAlpha` 透明度，取值范围 0.00 ~ 1.00，默认值`0.7`
* `rotateAngle` 旋转角度，取值范围 -360 ~ 360，默认值`50`
* `maxWidth` 文字最大宽度，超过宽度会换行，默认值`100`
* `xMoveDistance` 每个文字的左右间距，取值范围 不限，默认值`30`，最好是文字宽度+设置的距离
* `yMoveDistance` 每个文字的上下间距，取值范围 不限，默认值`30`，最好是文字高度+设置的距离
  
# 实例方法
## .setFile(file)
```
@param file {e.target.file} File对象的值
@return {Boolean} 是否载入成功 
```
通过 file 对象载入图片文件时使用。

## .setImage(src)
```
@param src {String} 带有 image 前缀的图片 base64 编码字符串
```
通过 base64 载入图片文件时使用，每次调用此方法时将图片更新到实例中，参数值为带有`image`前缀的图片 base64 编码字符串。

## .hasImage()
```
@return {Boolean} 当前实例中是否包含图片
```
判断当前实例是否包含图片（调用`setFile`或`setImage`成功后将会包含）。

## .getSize()
```
@return {Object} 当前图片尺寸 
```
用以获取当前图片尺寸，返回格式`{ width: 0, height: 0 }`。

## .getPreview()
```
@return {String} 当前实例原图 base64 编码的字符串
```
返回原图。

## .addText(opts)
```
@param opts {Object} 水印文字样式配置
```

## .addImage([imageArray,]opts)
```
@param imageArray {Array} 水印图片数组，里面是Image对象，必选，可以有多个图片
@param opts {Object} 水印文字样式配置
```

## .render(type)
```
@param type {String} 图片类型，可传入`jpeg`（不支持透明）或`png`（支持透明），默认为`jpeg`。
@return {String} 原图添加水印后的 base64 编码的字符串
```
绘制结果图片，返回`base64`编码字符串。

## .clearMark()
清空水印信息，下一次调用`addText`方法时会在原图基础上进行绘制。

# 在线预览

方式1 - 传入 file 对象，通过主动调用实例方法生成水印图：[在线demo](https://WhiteSevs.github.io/js-watermark/demo/example1.html)


