/**
 * Bootstrap Colorpicker v2.3.3
 * http://mjolnic.github.io/bootstrap-colorpicker/
 *
 */
;(function () {
    "use strict";
    
    /**
     * Color manipulation helper class
     *
     * @param {Object|String} val
     * @constructor
     */
    var Color = function (val) {
        this.value = {
            h: 0,
            s: 0,
            b: 0,
            a: 1
        };
        this.origFormat = null; // original string format
        if (val) {
            if (val.toLowerCase !== undefined) {
                // cast to string
                val = val + '';
                this.setColor(val);
            } else if (val.h !== undefined) {
                this.value = val;
            }
        }
    };

    Color.prototype = {
        constructor: Color,
        colors: {
            "aliceblue": "#f0f8ff",
            "yellowgreen": "#9acd32",
            "transparent": "transparent"
        },
        _sanitizeNumber: function (val) {
            if (typeof val === 'number') {
                return val;
            }
            if (isNaN(val) || (val === null) || (val === '') || (val === undefined)) {
                return 1;
            }
            if (val === '') {
                return 0;
            }
            if (val.toLowerCase !== undefined) {
                if (val.match(/^\./)) {
                    val = "0" + val;
                }
                return Math.ceil(parseFloat(val) * 100) / 100;
            }
            return 1;
        },

        //parse a string to HSB
        setColor: function (strVal) {
            strVal = strVal.toLowerCase().trim();
            if (strVal) {
                if (Color.isTransparent(strVal)) {
                    this.value = {
                        h: 0,
                        s: 0,
                        b: 0,
                        a: 0
                    };
                } else {
                    this.value = this.stringToHSB(strVal) || {
                            h: 0,
                            s: 0,
                            b: 0,
                            a: 1
                        }; // if parser fails, defaults to black
                }
            }
        },
        stringToHSB: function (strVal) {
            strVal = strVal.toLowerCase();
            var that = this,
                result = false;
            $.each(this.stringParsers, function (i, parser) {
                var match = parser.re.exec(strVal),
                    values = match && parser.parse.apply(that, [match]),
                    format = parser.format || 'rgba';
                if (values) {
                    if (format.match(/hsla?/)) {
                        result = that.RGBtoHSB.apply(that, that.HSLtoRGB.apply(that, values));
                    } else {
                        result = that.RGBtoHSB.apply(that, values);
                    }
                    that.origFormat = format;
                    return false;
                }
                return true;
            });
            return result;
        },
        setR: function (r) {
            var rgb = this.toRGB();
            rgb.r = r;
            this.value = this.RGBtoHSB(rgb.r, rgb.g, rgb.b, rgb.a);
            return this;
        },
        setG: function (g) {
            var rgb = this.toRGB();
            rgb.g = g;
            this.value = this.RGBtoHSB(rgb.r, rgb.g, rgb.b, rgb.a);
            return this;
        },
        setB: function (b) {
            var rgb = this.toRGB();
            rgb.b = b;
            this.value = this.RGBtoHSB(rgb.r, rgb.g, rgb.b, rgb.a);
            return this;
        },
        setHue: function (h) {
            this.value.h = h;
            return this;
        },
        setSaturation: function (s) {
            this.value.s = s;
            return this;
        },
        setBrightness: function (b) {
            this.value.b = b;
            return this;
        },
        setAlpha: function (a) {
            this.value.a = Math.round((parseInt((a) * 100, 10) / 100) * 100) / 100;
        },
        toRGB: function (h, s, b, a) {
            if (!h) {
                h = this.value.h;
                s = this.value.s;
                b = this.value.b;
            }
            h *= 360;
            var R, G, B, X, C;
            h = (h % 360) / 60;
            C = b * s;
            X = C * (1 - Math.abs(h % 2 - 1));
            R = G = B = b - C;

            h = ~~h;
            R += [C, X, 0, 0, X, C][h];
            G += [X, C, C, X, 0, 0][h];
            B += [0, 0, X, C, C, X][h];
            return {
                r: Math.round(R * 255),
                g: Math.round(G * 255),
                b: Math.round(B * 255),
                a: a || this.value.a
            };
        },
        toHex: function (h, s, b, a) {
            var rgb = this.toRGB(h, s, b, a);
            if (Color.rgbaIsTransparent(rgb)) {
                return 'transparent';
            }
            return '#' + ((1 << 24) | (parseInt(rgb.r) << 16) | (parseInt(rgb.g) << 8) | parseInt(rgb.b)).toString(16).substr(1);
        },
        toHSL: function (h, s, b, a) {
            h = h || this.value.h;
            s = s || this.value.s;
            b = b || this.value.b;
            a = a || this.value.a;

            var H = h,
                L = (2 - s) * b,
                S = s * b;
            if (L > 0 && L <= 1) {
                S /= L;
            } else {
                S /= 2 - L;
            }
            L /= 2;
            if (S > 1) {
                S = 1;
            }
            return {
                h: isNaN(H) ? 0 : H,
                s: isNaN(S) ? 0 : S,
                l: isNaN(L) ? 0 : L,
                a: isNaN(a) ? 0 : a
            };
        },
        RGBtoHSB: function (r, g, b, a) {
            r /= 255;
            g /= 255;
            b /= 255;

            var H, S, V, C;
            V = Math.max(r, g, b);
            C = V - Math.min(r, g, b);
            H = (C === 0 ? null :
                    V === r ? (g - b) / C :
                        V === g ? (b - r) / C + 2 :
                        (r - g) / C + 4
            );
            H = ((H + 360) % 6) * 60 / 360;
            S = C === 0 ? 0 : C / V;
            return {
                h: this._sanitizeNumber(H),
                s: S,
                b: V,
                a: this._sanitizeNumber(a)
            };
        },
        HueToRGB: function (p, q, h) {
            if (h < 0) {
                h += 1;
            } else if (h > 1) {
                h -= 1;
            }
            if ((h * 6) < 1) {
                return p + (q - p) * h * 6;
            } else if ((h * 2) < 1) {
                return q;
            } else if ((h * 3) < 2) {
                return p + (q - p) * ((2 / 3) - h) * 6;
            } else {
                return p;
            }
        },
        HSLtoRGB: function (h, s, l, a) {
            if (s < 0) {
                s = 0;
            }
            var q;
            if (l <= 0.5) {
                q = l * (1 + s);
            } else {
                q = l + s - (l * s);
            }

            var p = 2 * l - q;

            var tr = h + (1 / 3);
            var tg = h;
            var tb = h - (1 / 3);

            var r = Math.round(this.HueToRGB(p, q, tr) * 255);
            var g = Math.round(this.HueToRGB(p, q, tg) * 255);
            var b = Math.round(this.HueToRGB(p, q, tb) * 255);
            return [r, g, b, this._sanitizeNumber(a)];
        },
        toString: function (format) {
            format = format || 'rgba';
            var c = false;
            switch (format) {
                case 'rgb':
                    c = this.toRGB();
                    if (Color.rgbaIsTransparent(c)) {
                        return 'transparent';
                    }
                    return 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
                case 'rgba':
                    c = this.toRGB();
                    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
                case 'hsl':
                    c = this.toHSL();
                    return 'hsl(' + Math.round(c.h * 360) + ',' + Math.round(c.s * 100) + '%,' + Math.round(c.l * 100) + '%)';
                case 'hsla':
                    c = this.toHSL();
                    return 'hsla(' + Math.round(c.h * 360) + ',' + Math.round(c.s * 100) + '%,' + Math.round(c.l * 100) + '%,' + c.a + ')';
                case 'hex':
                    return this.toHex();
                default:
                    return c;
            }
        },
        // a set of RE's that can match strings and generate color tuples.
        // from John Resig color plugin
        // https://github.com/jquery/jquery-color/
        stringParsers: [{
            re: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*?\)/,
            format: 'rgb',
            parse: function (execResult) {
                return [
                    execResult[1],
                    execResult[2],
                    execResult[3],
                    1
                ];
            }
        }, {
            re: /rgb\(\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*?\)/,
            format: 'rgb',
            parse: function (execResult) {
                return [
                    2.55 * execResult[1],
                    2.55 * execResult[2],
                    2.55 * execResult[3],
                    1
                ];
            }
        }, {
            re: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*(?:\.\d+)?)\s*)?\)/,
            format: 'rgba',
            parse: function (execResult) {
                return [
                    execResult[1],
                    execResult[2],
                    execResult[3],
                    execResult[4]
                ];
            }
        }, {
            re: /rgba\(\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*(?:,\s*(\d*(?:\.\d+)?)\s*)?\)/,
            format: 'rgba',
            parse: function (execResult) {
                return [
                    2.55 * execResult[1],
                    2.55 * execResult[2],
                    2.55 * execResult[3],
                    execResult[4]
                ];
            }
        }, {
            re: /hsl\(\s*(\d*(?:\.\d+)?)\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*?\)/,
            format: 'hsl',
            parse: function (execResult) {
                return [
                    execResult[1] / 360,
                    execResult[2] / 100,
                    execResult[3] / 100,
                    execResult[4]
                ];
            }
        }, {
            re: /hsla\(\s*(\d*(?:\.\d+)?)\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*(?:,\s*(\d*(?:\.\d+)?)\s*)?\)/,
            format: 'hsla',
            parse: function (execResult) {
                return [
                    execResult[1] / 360,
                    execResult[2] / 100,
                    execResult[3] / 100,
                    execResult[4]
                ];
            }
        }, {
            re: /#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
            format: 'hex',
            parse: function (execResult) {
                return [
                    parseInt(execResult[1], 16),
                    parseInt(execResult[2], 16),
                    parseInt(execResult[3], 16),
                    1
                ];
            }
        }, {
            re: /#?([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
            format: 'hex',
            parse: function (execResult) {
                return [
                    parseInt(execResult[1] + execResult[1], 16),
                    parseInt(execResult[2] + execResult[2], 16),
                    parseInt(execResult[3] + execResult[3], 16),
                    1
                ];
            }
        }],
    };

    Color.rgbaIsTransparent = function (rgba) {
        return ((rgba.r === 0) && (rgba.g === 0) && (rgba.b === 0) && (rgba.a === 0));
    };

    Color.isTransparent = function (strVal) {
        if (!strVal) {
            return false;
        }
        strVal = strVal.toLowerCase().trim();
        return (strVal === 'transparent') || (strVal.match(/#?00000000/))
            || (strVal.match(/(rgba|hsla)\(0,0,0,0?\.?0\)/))
            || (strVal.match(/(rgba|hsla)\(0, 0, 0, 0?\.?0\)/))
            || strVal.match(/hsl\(0,0%,0%\)/);
    };

    /**
     * HSL颜色值转换为RGB.
     * 换算公式改编自 http://en.wikipedia.org/wiki/HSL_color_space.
     * h, s, 和 l 设定在 [0, 1] 之间
     * 返回的 r, g, 和 b 在 [0, 255]之间
     *
     * @param   Number  h       色相
     * @param   Number  s       饱和度
     * @param   Number  l       亮度
     * @return  Array           RGB色值数值
     */
    Color.hslToRgb = function (h, s, l) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * RGB 颜色值转换为 HSL.
     * 转换公式参考自 http://en.wikipedia.org/wiki/HSL_color_space.
     * r, g, 和 b 需要在 [0, 255] 范围内
     * 返回的 h, s, 和 l 在 [0, 1] 之间
     *
     * @param   Number  r       红色色值
     * @param   Number  g       绿色色值
     * @param   Number  b       蓝色色值
     * @return  Array           HSL各值数组
     */
    Color.rbgToHsl = function (r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    Color.rbg2Hex = function (str) {
        var that = str;
        if (isArray(str)) {
            var aColor = str;
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = that;
            }
            return strHex;
        } else if (/^(rgb|RGB)/.test(that)) {
            var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = that;
            }
            return strHex;
        } else if (reg.test(that)) {
            var aNum = that.replace(/#/, "").split("");
            if (aNum.length === 6) {
                return that;
            } else if (aNum.length === 3) {
                var numHex = "#";
                for (var i = 0; i < aNum.length; i += 1) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return that;
        }
    };

    Color.hex2Rbg = function (str) {
        var sColor = str.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return sColorChange;
            //return "RGB(" + sColorChange.join(",") + ")";
        } else {
            return sColor;
        }
    };

    Color.dark = function (color) {
        var rgb = colorRgb(color);
        var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        var rgb2 = hslToRgb(hsl[0], hsl[1], hsl[2] * (0.8));
        var ret = colorHex(rgb2);
        return ret;
    };
    
    UI.Color = Color;
})();

(function (factory) {
    "use strict";
    if (typeof exports === 'object') {
        module.exports = factory(window.jQuery);
    } else if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (window.jQuery && !window.jQuery.fn.colorpicker) {
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    var Color = UI.Color;
    

    var Colorpicker = function (element, options) {
        this.element = $(element).addClass('colorpicker-element');
        this.opts = $.extend({}, Colorpicker.DEFAULTS, this.element.data(), options);

        this.container = (this.opts.container === true) ? this.element : this.opts.container;
        this.container = (this.container !== false) ? $(this.container) : false;

        // Is the element an input? Should we search inside for any input?
        this.input = this.element.is('input') ? this.element : (this.opts.input ?
            this.element.find(this.opts.input) : false);
        if (this.input && (this.input.length === 0)) {
            this.input = false;
        }
        // Set HSB color
        this.color = new Color(this.opts.color !== false ? this.opts.color : this.getValue());
        this.format = this.opts.format !== false ? this.opts.format : this.color.origFormat;

        if (this.input) {
            //this.input[0].readonly = true;
            this.input.css('width', '33px');
            this.value = this.input.val();
            this.input.val('');
            this.input.hide();
        }


        this.block = $('<div class="ui-color"></div>')
        this.element.after(this.block);

        if (this.opts.color !== false) {
            this.updateInput(this.color);
            this.updateData(this.color);
        }

        // Setup picker
        this.picker = $(this.opts.template);
        if (this.opts.customClass) {
            this.picker.addClass(this.opts.customClass);
        }
        if (this.opts.inline) {
            this.picker.addClass('colorpicker-inline colorpicker-visible');
        } else {
            this.picker.addClass('colorpicker-hidden');
        }
        if (this.opts.horizontal) {
            this.picker.addClass('colorpicker-horizontal');
        }
        if (this.format === 'rgba' || this.format === 'hsla' || this.opts.format === false) {
            this.picker.addClass('colorpicker-with-alpha');
        }
        if (this.opts.align === 'right') {
            this.picker.addClass('colorpicker-right');
        }
        if (this.opts.inline === true) {
            this.picker.addClass('colorpicker-no-arrow');
        }
        if (this.opts.colorSelectors) {
            var colorpicker = this;
            $.each(this.opts.colorSelectors, function (name, color) {
                var $btn = $('<i />').css('background-color', color).data('class', name);
                $btn.click(function () {
                    colorpicker.setValue($(this).css('background-color'), true);
                });
                colorpicker.picker.find('.colorpicker-selectors').append($btn);
            });
            this.picker.find('.colorpicker-selectors').show();
        }
        this.picker.on('mousedown.colorpicker touchstart.colorpicker', $.proxy(this.mousedown, this));
        this.picker.on('click', function (e) {
            e.stopPropagation();
        });
        this.picker.appendTo(this.container ? this.container : $('body'));


        // Bind events
        if (this.input !== false) {
            this.input.on({
                'keyup.colorpicker': $.proxy(this.keyup, this)
            });
            this.input.on({
                'change.colorpicker': $.proxy(this.change, this)
            });
            this.block.on({
                'click.colorpicker': $.proxy(this.show, this)
            });
            /*if (this.opts.inline === false) {
                this.block.on({
                    'focusout.colorpicker': $.proxy(this.hide, this)
                });
            }*/



        }



        this.update();

        $($.proxy(function () {
            this.element.trigger('create');
        }, this));
    };

    Colorpicker.DEFAULTS = {
        horizontal: false, // horizontal mode layout ?
        inline: false, //forces to show the colorpicker as an inline element
        color: false, //forces a color
        format: 'hsl', // format: hex, rgb, rgba, hsl, hsla false
        input: 'input', // children input selector
        container: false, // container selector
        sliders: {
            saturation: {
                maxLeft: 100,
                maxTop: 100,
                callLeft: 'setSaturation',
                callTop: 'setBrightness'
            },
            hue: {
                maxLeft: 0,
                maxTop: 100,
                callLeft: false,
                callTop: 'setHue'
            },
            alpha: {
                maxLeft: 0,
                maxTop: 100,
                callLeft: false,
                callTop: 'setAlpha'
            }
        },
        slidersHorz: {
            saturation: {
                maxLeft: 100,
                maxTop: 100,
                callLeft: 'setSaturation',
                callTop: 'setBrightness'
            },
            hue: {
                maxLeft: 100,
                maxTop: 0,
                callLeft: 'setHue',
                callTop: false
            },
            alpha: {
                maxLeft: 100,
                maxTop: 0,
                callLeft: 'setAlpha',
                callTop: false
            }
        },
        template: '<div class="colorpicker dropdown-menu">' +
        '<div class="colorpicker-saturation"><i><b></b></i></div>' +
        '<div class="colorpicker-hue"><i></i></div>' +
        '<div class="colorpicker-alpha"><i></i></div>' +
        '<div class="colorpicker-color"><div /></div>' +
        '<div class="colorpicker-selectors"></div>' +
        '</div>',
        align: 'right',
        customClass: null,
        colorSelectors: null
    };

    Colorpicker.Color = Color;

    Colorpicker.prototype = {
        constructor: Colorpicker,
        destroy: function () {
            this.picker.remove();
            this.element.removeData('colorpicker', 'color').off('.colorpicker');
            if (this.input !== false) {
                this.input.off('.colorpicker');
            }
            this.element.removeClass('colorpicker-element');
            this.element.trigger({
                type: 'destroy'
            });
        },
        reposition: function () {
            if (this.opts.inline !== false || this.opts.container) {
                return false;
            }
            var type = this.container && this.container[0] !== document.body ? 'position' : 'offset';
            var element = this.block;
            var offset = element[type]();
            if (this.opts.align === 'right') {
                offset.left -= this.picker.outerWidth() - element.outerWidth();
            }
            /*this.picker.css({
                top: offset.top + element.outerHeight(),
                left: offset.left,
                zIndex: 10000
            });*/
            //this.picker.overlay();
            this.picker.pot({
                relativeTo: this.block,
                y: 'bottom',
                x: 'rightEdge',
                /*top: offset.top + element.outerHeight(),
                left: offset.left,*/
                zIndex: 10000
            });
        },
        show: function (e) {
            if (this.isDisabled()) {
                return false;
            }
            this.isShow = true;
            this.picker.addClass('colorpicker-visible').removeClass('colorpicker-hidden');
            this.reposition();
            $(window).on('resize.colorpicker', $.proxy(this.reposition, this));
            if (e && (!this.hasInput() || this.input.attr('type') === 'color')) {
                if (e.stopPropagation && e.preventDefault) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
            /*if (!this.input && (this.opts.inline === false)) {
                $(window.document).on({
                    'mousedown.colorpicker': $.proxy(this.hide, this)
                });
            }*/
            this.element.trigger({
                type: 'showPicker',
                color: this.color
            });

            var that = this;
            // TODO
            setTimeout(function () {
                $(document).one('click.ui.color', function (e) {
                    if (that.isShow) {
                        that.hide();
                    }
                });
            }, 100);
            /**/
        },
        hide: function () {
            this.isShow = false;
            this.picker.addClass('colorpicker-hidden').removeClass('colorpicker-visible');
            $(window).off('resize.colorpicker', this.reposition);
            $(document).off({
                'mousedown.colorpicker': this.hide
            });
            this.update();
            this.element.trigger({
                type: 'hidePicker',
                color: this.color
            });
            $(document).off('click.ui.color');
        },
        updateData: function (val) {
            val = val || this.color.toString(this.format);
            this.element.data('color', val);
            return val;
        },
        updateInput: function (val) {
            val = val || this.color.toString(this.format);
            if (this.input !== false) {
                if (this.opts.colorSelectors) {
                    var color = new Color(val);
                }
                //this.input.prop('value', val);
            }

            if (Color.isTransparent(val)) {
                this.block.css('background-color', 'transparent');
                this.block.addClass('colorpicker-transparent');
            } else {
                this.block.removeClass('colorpicker-transparent');
                this.block.css('background-color', val);
            }
            return val;
        },
        updatePicker: function (val) {
            if (val !== undefined) {
                this.color = new Color(val);
            }
            var sl = (this.opts.horizontal === false) ? this.opts.sliders : this.opts.slidersHorz;
            var icns = this.picker.find('i');
            if (icns.length === 0) {
                return;
            }
            if (this.opts.horizontal === false) {
                sl = this.opts.sliders;
                icns.eq(1).css('top', sl.hue.maxTop * (1 - this.color.value.h)).end()
                    .eq(2).css('top', sl.alpha.maxTop * (1 - this.color.value.a));
            } else {
                sl = this.opts.slidersHorz;
                icns.eq(1).css('left', sl.hue.maxLeft * (1 - this.color.value.h)).end()
                    .eq(2).css('left', sl.alpha.maxLeft * (1 - this.color.value.a));
            }
            icns.eq(0).css({
                'top': sl.saturation.maxTop - this.color.value.b * sl.saturation.maxTop,
                'left': this.color.value.s * sl.saturation.maxLeft
            });
            this.picker.find('.colorpicker-saturation').css('backgroundColor', this.color.toHex(this.color.value.h, 1, 1, 1));
            this.picker.find('.colorpicker-alpha').css('backgroundColor', this.color.toHex());
            if (this.opts.preview) {
                $(this.opts.preview).css('backgroundColor', this.color.toString(this.format));
            } else {
                this.picker.find('.colorpicker-color, .colorpicker-color div').css('backgroundColor', this.color.toString(this.format));
            }
            return val;
        },
        updateComponent: function (val) {
            val = val || this.color.toString(this.format);
            return val;
        },
        update: function (force) {
            var val;
            if ((this.getValue(false) !== false) || (force === true)) {
                // Update input/data only if the current value is not empty
                val = this.updateComponent();
                this.updateInput(val);
                this.updateData(val);
                this.updatePicker(); // only update picker if value is not empty
            }
            return val;

        },
        setColor: function (color) {
            this.color = color;
            this.update(true);
            this.element.trigger({
                type: 'changeColor',
                color: this.color,
            });
        },
        setValue: function (val, isTrigger) { // set color manually
            this.color = new Color(val);
            this.update(true);
            if (isTrigger) {
                this.element.trigger({
                    type: 'changeColor',
                    color: this.color,
                });
            }
        },
        getValue: function (defaultValue) {
            defaultValue = (defaultValue === undefined) ? '#000000' : defaultValue;
            var val;
            if (this.hasInput()) {
                val = this.value;
            } else {
                val = this.element.data('color');
            }
            if ((val === undefined) || (val === '') || (val === null)) {
                // if not defined or empty, return default
                val = defaultValue;
            }
            return val;
        },
        hasInput: function () {
            return (this.input !== false);
        },
        isDisabled: function () {
            if (this.hasInput()) {
                return (this.input.prop('disabled') === true);
            }
            return false;
        },
        disable: function () {
            if (this.hasInput()) {
                this.input.prop('disabled', true);
                this.element.trigger({
                    type: 'disable',
                    color: this.color,
                    value: this.getValue()
                });
                return true;
            }
            return false;
        },
        enable: function () {
            if (this.hasInput()) {
                this.input.prop('disabled', false);
                this.element.trigger({
                    type: 'enable',
                    color: this.color,
                    value: this.getValue()
                });
                return true;
            }
            return false;
        },
        currentSlider: null,
        mousePointer: {
            left: 0,
            top: 0
        },
        mousedown: function (e) {
            if (!e.pageX && !e.pageY && e.originalEvent && e.originalEvent.touches) {
                e.pageX = e.originalEvent.touches[0].pageX;
                e.pageY = e.originalEvent.touches[0].pageY;
            }
            e.stopPropagation();
            e.preventDefault();

            var target = $(e.target);

            //detect the slider and set the limits and callbacks
            var zone = target.closest('div');
            var sl = this.opts.horizontal ? this.opts.slidersHorz : this.opts.sliders;
            if (!zone.is('.colorpicker')) {
                if (zone.is('.colorpicker-saturation')) {
                    this.currentSlider = $.extend({}, sl.saturation);
                } else if (zone.is('.colorpicker-hue')) {
                    this.currentSlider = $.extend({}, sl.hue);
                } else if (zone.is('.colorpicker-alpha')) {
                    this.currentSlider = $.extend({}, sl.alpha);
                } else {
                    return false;
                }
                var offset = zone.offset();
                //reference to guide's style
                this.currentSlider.guide = zone.find('i')[0].style;
                this.currentSlider.left = e.pageX - offset.left;
                this.currentSlider.top = e.pageY - offset.top;
                this.mousePointer = {
                    left: e.pageX,
                    top: e.pageY
                };
                //trigger mousemove to move the guide to the current position
                $(document).on({
                    'mousemove.colorpicker': $.proxy(this.mousemove, this),
                    'touchmove.colorpicker': $.proxy(this.mousemove, this),
                    'mouseup.colorpicker': $.proxy(this.mouseup, this),
                    'touchend.colorpicker': $.proxy(this.mouseup, this)
                }).trigger('mousemove');
            }
            return false;
        },
        mousemove: function (e) {
            if (!e.pageX && !e.pageY && e.originalEvent && e.originalEvent.touches) {
                e.pageX = e.originalEvent.touches[0].pageX;
                e.pageY = e.originalEvent.touches[0].pageY;
            }
            e.stopPropagation();
            e.preventDefault();
            var left = Math.max(
                0,
                Math.min(
                    this.currentSlider.maxLeft,
                    this.currentSlider.left + ((e.pageX || this.mousePointer.left) - this.mousePointer.left)
                )
            );
            var top = Math.max(
                0,
                Math.min(
                    this.currentSlider.maxTop,
                    this.currentSlider.top + ((e.pageY || this.mousePointer.top) - this.mousePointer.top)
                )
            );
            this.currentSlider.guide.left = left + 'px';
            this.currentSlider.guide.top = top + 'px';
            if (this.currentSlider.callLeft) {
                this.color[this.currentSlider.callLeft].call(this.color, left / this.currentSlider.maxLeft);
            }
            if (this.currentSlider.callTop) {
                this.color[this.currentSlider.callTop].call(this.color, 1 - top / this.currentSlider.maxTop);
            }
            // Change format dynamically
            // Only occurs if user choose the dynamic format by
            // setting option format to false
            if (this.currentSlider.callTop === 'setAlpha' && this.opts.format === false) {

                // Converting from hex / rgb to rgba
                if (this.color.value.a !== 1) {
                    this.format = 'rgba';
                    this.color.origFormat = 'rgba';
                }

                // Converting from rgba to hex
                else {
                    this.format = 'hex';
                    this.color.origFormat = 'hex';
                }
            }
            this.update(true);

            this.element.trigger({
                type: 'changeColor',
                color: this.color
            });
            return false;
        },
        mouseup: function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(document).off({
                'mousemove.colorpicker': this.mousemove,
                'touchmove.colorpicker': this.mousemove,
                'mouseup.colorpicker': this.mouseup,
                'touchend.colorpicker': this.mouseup
            });
            return false;
        },
        change: function (e) {
            this.block.css('background-color', this.color.toHex());
            this.keyup(e);
        },
        keyup: function (e) {
            if ((e.keyCode === 38)) {
                if (this.color.value.a < 1) {
                    this.color.value.a = Math.round((this.color.value.a + 0.01) * 100) / 100;
                }
                this.update(true);
            } else if ((e.keyCode === 40)) {
                if (this.color.value.a > 0) {
                    this.color.value.a = Math.round((this.color.value.a - 0.01) * 100) / 100;
                }
                this.update(true);
            } else {
                this.color = new Color(this.value);
                // Change format dynamically
                // Only occurs if user choose the dynamic format by
                // setting option format to false
                if (this.color.origFormat && this.opts.format === false) {
                    this.format = this.color.origFormat;
                }
                if (this.getValue(false) !== false) {
                    this.updateData();
                    this.updateComponent();
                    this.updatePicker();
                }
            }
            this.element.trigger({
                type: 'changeColor',
                color: this.color,
            });
        }
    };

    $.colorpicker = Colorpicker;

    $.fn.colorpicker = function (option, val) {
        var pickerArgs = arguments,
            rv = null;

        var $returnValue = this.each(function () {
            var $this = $(this);
            var data = $this.data('colorpicker');
            if (!data) {
                var options = ((typeof option === 'object') ? option : {});
                data = new Colorpicker(this, options);
                $this.data('colorpicker', data);
            }

            if (typeof option === 'string') {
                var param = Array.prototype.slice.call(pickerArgs, 1);
                //data[option](val);
                rv = data[option].apply(data, param);
            }

        });
        if (option === 'getValue') {
            return rv;
        }
        return $returnValue;
    };

    $.fn.colorpicker.constructor = Colorpicker;

}));
