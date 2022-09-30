/**
 * @js-watermark.js
 * @author WhiteSev
 * @Created: 22-09-26
 * @repository: https://github.com/WhiteSevs/js-watermark
 * @forked by:https://github.com/gisonyeung/js-watermark
 * @description JavaScript 图片文字水印、图片图片水印生成工具，生成 base64 编码图片。
 */

(function (global, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(factory);
    } else {
        global.Watermark = factory();
    }
}(this, function () {
    'use strict';
    /**	
     * @author zhangxinxu(.com)	
     * @licence MIT	
     * @description http://www.zhangxinxu.com/wordpress/?p=7362	
     */
    /* api扩展-设置字符间距 */
    CanvasRenderingContext2D.prototype.letterSpacingText = function (text, x, y, letterSpacing) {
        var context = this;
        var canvas = context.canvas;

        if (!letterSpacing && canvas) {
            letterSpacing = parseFloat(window.getComputedStyle(canvas).letterSpacing);
        }
        if (!letterSpacing) {
            return this.fillText(text, x, y);
        }

        var arrText = text.split('');
        var align = context.textAlign || 'left';

        /* 这里仅考虑水平排列 */
        var originWidth = context.measureText(text).width;
        /* 应用letterSpacing占据宽度 */
        var actualWidth = originWidth + letterSpacing * (arrText.length - 1);
        /* 根据水平对齐方式确定第一个字符的坐标	 */
        if (align == 'center') {
            x = x - actualWidth / 2;
        } else if (align == 'right') {
            x = x - actualWidth;
        }

        /* 临时修改为文本左对齐	 */
        context.textAlign = 'left';
        /* 开始逐字绘制	 */
        arrText.forEach(function (letter) {
            var letterWidth = context.measureText(letter).width;
            context.fillText(letter, x, y);
            /* 确定下一个字符的横坐标	 */
            x = x + letterWidth + letterSpacing;
        });
        /* 对齐方式还原	 */
        context.textAlign = align;
    };

    /* api扩展-自动换行 */
    CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
        if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
            return;
        }

        var context = this;
        var canvas = context.canvas;

        if (typeof maxWidth == 'undefined') {
            maxWidth = (canvas && canvas.width) || 300;
        }
        if (typeof lineHeight == 'undefined') {
            lineHeight = (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) || parseInt(window.getComputedStyle(document.body).lineHeight);
        }

        /* 字符分隔为数组	 */
        var arrText = text.split('');
        var line = '';

        for (var n = 0; n < arrText.length; n++) {
            var testLine = line + arrText[n];
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = arrText[n];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    };

    /* api扩展-垂直排列 */
    CanvasRenderingContext2D.prototype.fillTextVertical = function (text, x, y) {
        var context = this;
        var canvas = context.canvas;

        var arrText = text.split('');
        var arrWidth = arrText.map(function (letter) {
            return context.measureText(letter).width;
        });

        var align = context.textAlign;
        var baseline = context.textBaseline;

        if (align == 'left') {
            x = x + Math.max.apply(null, arrWidth) / 2;
        } else if (align == 'right') {
            x = x - Math.max.apply(null, arrWidth) / 2;
        }
        if (baseline == 'bottom' || baseline == 'alphabetic' || baseline == 'ideographic') {
            y = y - arrWidth[0] / 2;
        } else if (baseline == 'top' || baseline == 'hanging') {
            y = y + arrWidth[0] / 2;
        }

        context.textAlign = 'center';
        context.textBaseline = 'middle';

        /* 开始逐字绘制 */
        arrText.forEach(function (letter, index) {
            /* 确定下一个字符的纵坐标位置 */
            var letterWidth = arrWidth[index];
            /* 是否需要旋转判断 */
            var code = letter.charCodeAt(0);
            if (code <= 256) {
                context.translate(x, y);
                /* 英文字符，旋转90° */
                context.rotate(90 * Math.PI / 180);
                context.translate(-x, -y);
            } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
                /* y修正 */
                y = y + arrWidth[index - 1] / 2;
            }
            context.fillText(letter, x, y);
            /* 旋转坐标系还原成初始态 */
            context.setTransform(1, 0, 0, 1, 0, 0);
            /* 确定下一个字符的纵坐标位置 */
            var letterWidth = arrWidth[index];
            y = y + letterWidth;
        });
        /* 水平垂直对齐方式还原 */
        context.textAlign = align;
        context.textBaseline = baseline;
    };

    /* 加载file对象 */
    function loadFile(file) {
        let fileReader = new FileReader();
        return new Promise(res => {
            fileReader.onloadend = async function (e) {
                res(e);
            };
            fileReader.readAsDataURL(file);
        })
    }
    /* 加载Image对象 */
    function loadImage(src) {
        let image = new Image();

        return new Promise(res => {
            image.onload = () => {
                res(image);
            };
            image.src = src;
        })
    }
    /* 检查坐标是否重复 */
    function checkInArrayByPos(arrayData,x,y){
        let flag = false;
        Array.from(arrayData).forEach( item=>{
            if(item["x"] == x && item["y"] == y){
                flag = true;
                return
            }
        });
        return flag;
    }
    /* 获取文字占据的宽度，高度 */
    function getCharSizeByCanvas(char, style = {}) {
        let textCanvas = document.createElement('canvas');
        textCanvas.style.positon = "ablsolute";
        let textCTX = textCanvas.getContext('2d');
        let {
            fontSize = 14,
                fontFamily = "Microsoft Yahei"
        } = style
        document.body.appendChild(textCanvas)
        textCTX.font = `${fontSize}px ${fontFamily}`
        document.body.removeChild(textCanvas)
        let text = textCTX.measureText(char) /* TextMetrics object */
        textCTX.fillText(char, 50, 50)
        let result = {
            height: parseInt(fontSize),
            width: parseInt(text.width)
        }
        return result
    }

    var Watermark = function () {};

    /* 通过 file 对象载入图片文件-异步 */
    Watermark.prototype.setFile = function (file) {
        let self = this;
        return new Promise( async res=>{
            var fileReader = await loadFile(file);
            await self.setImage(fileReader.target.result);
            res(true);
        })
    }

    /* 通过 base64 载入图片文件-异步 */
    Watermark.prototype.setImage = function (src) {
        this.dataUrl = src;
        let self = this;
        return new Promise( async res=>{
            var image = await loadImage(src);
            self.sizes = {
                width: image.width,
                height: image.height
            };

            var canvas = document.createElement('canvas');

            canvas.width = self.sizes.width;
            canvas.height = self.sizes.height;
            var ctx = canvas.getContext('2d');

            ctx.drawImage(image, 0, 0);
            image = null;
            self.canvas = canvas;
            res(true);
        })
    }

    /* 获取是否存在图片对象 */
    Watermark.prototype.hasImage = function () {
        return !!this.dataUrl;
    }

    /* 获取当前图片尺寸 */
    Watermark.prototype.getSize = function () {
        return this.sizes;
    }

    /* 清空水印 */
    Watermark.prototype.clearMark = function () {
        let self = this;
        if(typeof self.canvas==="undefined"){
            return
        }
        function _clearMark_() {
            var ctx = self.canvas.getContext('2d');
            /* 清空画布 */
            ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
            var w = self.canvas.width;
            var h = self.canvas.height;
            self.canvas.width = w;
            self.canvas.height = h;
            /* 清除path路径 */
            ctx.beginPath();
            /* 重绘 */
            var image = new Image();
            image.src = self.dataUrl;
            ctx.drawImage(image, 0, 0);
            image = null;

        }
        _clearMark_();
    }

    /* 增加文字水印(全屏) */
    Watermark.prototype.addText = function (opts) {
        var options = {
            text: ['Call By waterMark.addText'],
            fontSize: '6vw',
            fontFamily: 'Microsoft Yahei',
            color: "#000000",
            textAlign: "center",
            globalAlpha: 0.7,
            rotateAngle: 50, /* -360 ~ 360 */
            maxWidth: 100,
            xMoveDistance: 30,
            yMoveDistance: 30
        };
        for (let key in options) {
            if (typeof opts[key] !== "undefined") {
                options[key] = opts[key];
            }
        }
        var ctx = this.canvas.getContext('2d');

        var fontSize = options.fontSize;
        fontSize = fontSize.toString();
        /* 转换 vw */
        if (~fontSize.indexOf('vw')) {
            fontSize = (this.sizes.width / 100 * parseInt(fontSize)).toFixed(0);
        }
        fontSize = parseInt(fontSize);

        /* 绘制水印 */
        ctx.font = fontSize + "px " + options.fontFamily;
        ctx.fillStyle = options.color;
        ctx.textAlign = options.textAlign;
        ctx.globalAlpha = options.globalAlpha; /* 透明度 */


        let canvasWidth = this.sizes.width,
            /* 画布宽高 */
            canvasHeight = this.sizes.height;
        let rotateAngle = options.rotateAngle * Math.PI / 180;
        let xMoveDistance = options.xMoveDistance; /* 水平移动距离 */
        let yMoveDistance = options.yMoveDistance; /* 垂直移动距离 */
        let maxWidth = options.maxWidth; /* 文字最大宽度 */
        let lineHeight = fontSize; /* 文字占据高度 */
        let pos = [];
        for (var i= canvasWidth / 2 ; i < canvasWidth; i += xMoveDistance) {
            /* 右侧铺满 */
            for (var j= canvasHeight / 2 ; j < canvasHeight; j += yMoveDistance) {
                /* 右下 */
                if(!checkInArrayByPos(pos,i,j)){
                    pos = pos.concat({"x":i,"y":j});
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.translate(i, j);
                    ctx.rotate(rotateAngle);
                    ctx.wrapText(options.text[Math.floor(Math.random() * options.text.length)], 0, 0, maxWidth, lineHeight);
                }
                
            }
            for (var k= canvasHeight / 2; k > 0; k -= yMoveDistance) {
                /* 右上 */
                if(!checkInArrayByPos(pos,i,k)){
                    pos = pos.concat({"x":i,"y":k});
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.translate(i, k);
                    ctx.rotate(rotateAngle);
                    ctx.wrapText(options.text[Math.floor(Math.random() * options.text.length)], 0, 0, maxWidth, lineHeight);
                }
                
            }
        }
        
        for (var i = canvasWidth / 2; i > 0; i -= xMoveDistance) {
            /* 左侧铺满 */
            for (var j = canvasHeight / 2; j < canvasHeight; j += yMoveDistance) {
                /* 左下 */
                if(!checkInArrayByPos(pos,i,j)){
                    pos = pos.concat({"x":i,"y":j});
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.translate(i, j);
                    ctx.rotate(rotateAngle);
                    ctx.wrapText(options.text[Math.floor(Math.random() * options.text.length)], 0, 0, maxWidth, lineHeight);
                }
                
            }
            for (var k = canvasHeight / 2; k > 0; k -= yMoveDistance) {
                /* 左上 */
                if(!checkInArrayByPos(pos,i,k)){
                    pos = pos.concat({"x":i,"y":k});
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.translate(i, k);
                    ctx.rotate(rotateAngle);
                    ctx.wrapText(options.text[Math.floor(Math.random() * options.text.length)], 0, 0, maxWidth, lineHeight);
                }
            }
        }

    }

    /* 添加图片水印(全屏) */
    Watermark.prototype.addImage = function (opts) {
        if ( opts.imageArray == null ) {
            alert("参数缺少imageArray");
            return false;
        }
        if ( opts.imageArray.length  === 0 ) {
            alert("参数imageArray不能为空");
            return false;
        }
        let options = {
            imageArray:[], /* 里面为水印Image对象 */
            width: 50,
            height: 50,
            globalAlpha: 0.5,
            rotateAngle: 0,
            xMoveDistance: 70,
            yMoveDistance: 70,
            
        }
        for (let key in options) {
            if (typeof opts[key] !== "undefined") {
                options[key] = opts[key];
            }
        }

        let ctx = this.canvas.getContext('2d');

        let waterImageCanvasArray = [];
        let waterImageCanvasDiagonal = parseInt(Math.sqrt(options.width * options.width + options.height * options.height)); /* 水印对角线 */


        let canvasWidth = this.sizes.width,
            /* 画布宽高 */
            canvasHeight = this.sizes.height;
        let rotateAngle = options.rotateAngle * Math.PI / 180; /* 旋转角度 */
        let xMoveDistance = options.xMoveDistance; /* 水平移动距离 */
        let yMoveDistance = options.yMoveDistance; /* 垂直移动距离 */

        let centerDrawLeftPosX = canvasWidth / 2 - waterImageCanvasDiagonal / 2; /* 中心的绘制水印的左上角坐标x */
        let centerDrawLeftPosY = canvasHeight / 2 - waterImageCanvasDiagonal / 2; /* 绘制水印的左上角坐标y */
        let waterDrawPosX = (waterImageCanvasDiagonal - options.width) / 2; /* 水印里图片坐标x */
        let waterDrawPosY = (waterImageCanvasDiagonal - options.height) / 2; /* 水印里图片坐标y */

        Array.from(options.imageArray).forEach( item=>{/* 先把水印绘制好 */
            var waterImageCanvas = document.createElement("canvas");
            var waterctx = waterImageCanvas.getContext("2d");

            waterImageCanvas.width = waterImageCanvasDiagonal;
            waterImageCanvas.height = waterImageCanvasDiagonal;
            waterctx.globalAlpha = options.globalAlpha; /* 透明度 */
            waterctx.translate(waterImageCanvasDiagonal / 2, waterImageCanvasDiagonal / 2);
            waterctx.rotate(rotateAngle);
            waterctx.translate(-waterImageCanvasDiagonal / 2, -waterImageCanvasDiagonal / 2);
            waterctx.drawImage(item, waterDrawPosX, waterDrawPosY, options.width, options.height);

            waterImageCanvasArray = waterImageCanvasArray.concat(waterImageCanvas);
        })
        function randomArrayData(array_data){/* 随机项 */
            return array_data[Math.floor(Math.random() * array_data.length)];
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let pos = [];
        for (let i = centerDrawLeftPosX; i < canvasWidth; i += xMoveDistance) {
            /* 右侧铺满 */
            for (let j = centerDrawLeftPosY; j < canvasHeight; j += yMoveDistance) {
                /* 右下 */
                if(!checkInArrayByPos(pos,i,j)){
                    pos = pos.concat({"x":i,"y":j});
                    ctx.drawImage(randomArrayData(waterImageCanvasArray), i, j); /* 绘制水印 */
                }

            }
            for (let k = centerDrawLeftPosY; k > -Math.abs(waterImageCanvasDiagonal); k -= yMoveDistance) {
                /* 右上 */
                if(!checkInArrayByPos(pos,i,k)){
                    pos = pos.concat({"x":i,"y":k});
                    ctx.drawImage(randomArrayData(waterImageCanvasArray), i, k);
                }
            }
        }
        for (let i = centerDrawLeftPosX; i > -Math.abs(waterImageCanvasDiagonal); i -= xMoveDistance) {
            /* 左侧铺满 */
            for (let j = centerDrawLeftPosY; j < canvasHeight; j += yMoveDistance) {
                /* 左下 */
                if(!checkInArrayByPos(pos,i,j)){
                    pos = pos.concat({"x":i,"y":j});
                    ctx.drawImage(randomArrayData(waterImageCanvasArray), i, j);
                }
            }
            for (let k = centerDrawLeftPosY; k > -Math.abs(waterImageCanvasDiagonal); k -= yMoveDistance) {
                /* 左上 */
                if(!checkInArrayByPos(pos,i,k)){
                    pos = pos.concat({"x":i,"y":k});
                    ctx.drawImage(randomArrayData(waterImageCanvasArray), i, k);
                }
            }
        }


    }
    /* 获得原图 */
    Watermark.prototype.getPreview = function () {
        return this.dataUrl;
    }

    /* 绘制图片 */
    Watermark.prototype.render = function (type) {
        type = type === 'png' ? 'png' : 'jpeg';
        return this.canvas.toDataURL("image/" + type);
    };

    return Watermark;
}));
