/**
 * @js-watermark.js
 * @author gisonyeung
 * @Created: 17-04-05
 * @repository: https://github.com/gisonyeung/js-watermark..git 
 * @description JavaScript 图片文字水印生成工具，生成 base64 编码图片。
 */

(function (global, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(factory);
    } else {
        global.Watermark = factory();
    }
}(this, function () {
    'use strict';

    var Watermark = function(options) {

    	var self = this;

    	var defaults = {
    		fileControlId: '',
            text: 'js-watermark',
            fontSize: '3vw',
            fontFamily: 'Microsoft Yahei',
            color: 'rgba(255,255,255,0.7)',
            addPreviewListener: null,
        };

        options = options || {};
        for (var key in defaults) {
            if (typeof options[key] === 'undefined') {
                options[key] = defaults[key];
            }
        }

        self.options = options;

        // 采用上传按钮的方式获取图片
        if (options.fileControlId) {
            if (typeof options.addPreviewListener === 'function') {
                var $fileControl = document.getElementById(options.fileControlId);

                $fileControl.addEventListener('change', function(event) {
                    getFileBase64(event, function(src) {
                        self.setImage(src);
                        options.addPreviewListener.call(self, src, self.sizes);
                    });

                });
                
            } else {
                throw Error('js-watermark: 请绑定获取base64图片信息的回调函数 addPreviewListener')
            }
        }

        function getFileBase64(source, callback) {
            if(window.FileReader) {
                var oFileReader = new FileReader(),
                    oFile = source.target.files[0];
                // 过滤非图片文件
                if (/^image*/.test(oFile.type)) {
                    oFileReader.onloadend = function(e) {
                        callback(e.target.result);
                    };
                    // 将图片转为base64格式
                    oFileReader.readAsDataURL(oFile);
                } else {
                    alert('请上传图片文件');
                }
            } else {
                alert('您当前使用的浏览器不支持读取文件功能');
            }
        }
        
    } 

    // 通过 file 控件载入图片文件
    Watermark.prototype.setFile = function(fileId) {
        if(window.FileReader) {
            var self = this;
            var source = document.getElementById(fileId);
            var oFileReader = new FileReader();

            if (source.files.length === 0) {
                alert('文件为空')
                return false;
            }

            var oFile = source.files[0];
            // 过滤非图片文件
            if (/^image*/.test(oFile.type)) {
                oFileReader.onloadend = function(e) {
                    self.setImage(e.target.result);
                };
                // 将图片转为base64格式
                oFileReader.readAsDataURL(oFile);
                return true;
            } else {
                alert('请上传图片文件');
                return false;
            }
        } else {
            alert('您当前使用的浏览器不支持读取文件功能');
        }
    }

    // 通过 base64 载入图片文件
    Watermark.prototype.setImage = function(src) {
        var image = new Image();
        image.src = src;
        this.dataUrl = src;
        this.sizes = {
            width: image.width,
            height: image.height
        };

        var canvas = document.createElement('canvas');

        canvas.width = this.sizes.width;
        canvas.height = this.sizes.height;
        var ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0);
        image = null;

        this.canvas = canvas;
    }

    Watermark.prototype.hasImage = function() {
        return !!this.dataUrl;
    }

    // 获取当前图片尺寸
    Watermark.prototype.getSize = function() {
        return this.sizes;
    }

    // 清空水印
    Watermark.prototype.clearMark = function () {
        var ctx = this.canvas.getContext('2d');
        // 清空画布
        ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        // 重绘

        var image = new Image();
        image.src = this.dataUrl;
        ctx.drawImage(image, 0, 0);
        image = null;
    }

    // 增加文字水印
    Watermark.prototype.addText = function(text, opts) {
        /*
            opt: {
                fontSize: '20px',
                fontFamily: 'Microsoft Yahei',
                color: "rgba(255,255,255, 0.7)",
                left: 0,
                top: 0,
            }
        */
        if (typeof text === 'object') {
            opts = text;
            text = this.options.text;
        }

        if (opts.left == null) {
            alert('请设置文字水印水平距离');
            return false;
        }
        if (opts.top == null) {
            alert('请设置文字水印垂直距离');
            return false;
        }

        var ctx = this.canvas.getContext('2d');

        var _fontSize = opts.fontSize || this.options.fontSize;

        // 转换 vw
        if (~_fontSize.indexOf('vw')) {
            _fontSize = this.sizes.width / 100 * _fontSize.replace('vw', '');
             // 保留三位小数
            _fontSize = _fontSize.toFixed(3) + 'px';
        }

        // 绘制水印
        ctx.font= _fontSize + " " + (opts.fontFamily || this.options.fontFamily);
        ctx.fillStyle = opts.color || this.options.color;
        ctx.fillText(text, opts.left, opts.top);

    }

    Watermark.prototype.getPreview = function() {
        return this.dataUrl;
    }

    // 绘制图片
    Watermark.prototype.render = function(type) {
        type = type === 'png' ? 'png' : 'jpeg';
        return this.canvas.toDataURL("image/" + type);
    };

    return Watermark;
}));

