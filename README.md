# js-watermark
JavaScript 图片文字水印生成工具，生成 base64 编码图片。支持直接传入 base64 图片，或通过 file 控件上传图片。

# 使用示意
① 引入 JS 
```JavaScript
<script src="js-watermark.js"></script>
```

② 调用（通过`base64`传入的用法）
```JavaScript
var watermark = new Watermark();
watermark.setImage(base64String);
watermark.addText('js-watermark 图片水印', {
    fontSize: '5vw',
    left: 10,
    top: 10
});
var dataURL = watermark.render('png');
```

# 参数
```JavaScript
new Watermark(option);
```

其中：
* `option`为可选参数，包括：
  * `fileControlId`文件控件的 id，选填，若希望监听 file 控件改变自动执行回调函数，则需要填写此参数。
  * `addPreviewListener`file 控件文件改变后调用的回调函数，此函数中`this`指向当前`Watermark`实例，传入两个参数：目标图片的`base64`字符串，图片大小信息。若采用监听控件的方式获取图片，则此参数必填。
  * `text`全局水印文字，在添加水印时若不指定水印文字，则会默认使用全局水印文字，默认值为`js-watermark`。
  * `fontSize`全局水印字体大小，单位`px`或`vw`，其中`px`为绝对值，`vw`为相对值，`100vw`等于当前图片宽度，默认值为`3vw`。
  * `fontFamily`全局字体类型，默认值为`Microsoft Yahei`。
  * `color`全局字体颜色，默认值为`rgba(255,255,255,0.7)`。

# 实例方法
## .setFile(fileId)
```
@param fileId {String} 控件ID
@return {Boolean} 是否载入成功 
```
通过 file 控件载入图片文件时使用，每次调用此方法时方对控件上的文件进行读取并更新到实例中，参数值为 file 控件`id`，载入成功时返回`true`，失败时返回`false`。

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

## .addText([text,]opts)
```
@param text {String} 水印文字，可选，不填写默认使用全局配置
@param opts {Object} 水印文字样式配置
```
添加水印文字，其中`opts`包含：
* `left`: 数字，图片左端距离文字左端的距离，必填。
* `top`: 数字，图片上端距离文字基线的距离，必填。
* `fontSize`: 字体大小，可选，不填写默认使用全局配置。
* `fontFamily`: 字体类型，可选，不填写默认使用全局配置。
* `color`:  字体颜色，可选，不填写默认使用全局配置。

## .render(type)
```
@param type {String} 图片类型，可传入`jpeg`（不支持透明）或`png`（支持透明），默认为`jpeg`。
@return {String} 原图添加水印后的 base64 编码的字符串
```
绘制结果图片，返回`base64`编码字符串。

## .clearMark()
清空水印信息，下一次调用`addText`方法时会在原图基础上进行绘制。

# 在线预览

方式1 - 监听文件改变，自动触发回调：[在线demo](https://gisonyeung.github.io/js-watermark/demo/example1.html)

方式2 - 传入file控件Id，通过主动调用实例方法生成水印图：[在线demo](https://gisonyeung.github.io/js-watermark/demo/example2.html)

方式3 - 传入 base64 编码的图片，通过主动调用实例方法生成水印图：[在线demo](https://gisonyeung.github.io/js-watermark/demo/example3.html)


