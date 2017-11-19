/**
 * Created by cjh1 on 2016/11/18.
 */
//#current-color
;(function ($) {
    var UI = window.UI;



    var uiColor = '';
    var colorCall;

    $('#color-dialog-color').colorpicker({
        inline: true,
        format: 'rgb',
        container: '#color-dialog-color',
        sliders: {
            saturation: {
                maxLeft: 200,
                maxTop: 200,
                callLeft: 'setSaturation',
                callTop: 'setBrightness'
            },
            hue: {
                maxLeft: 0,
                maxTop: 200,
                callLeft: false,
                callTop: 'setHue'
            },
            alpha: {
                maxLeft: 0,
                maxTop: 200,
                callLeft: false,
                callTop: 'setAlpha'
            }
        },
        template: '<div class="colorpicker dropdown-menu">' +
        '<div class="colorpicker-saturation"><i><b></b></i></div>' +
        '<div class="colorpicker-hue"><i></i></div>' +
        '<div class="colorpicker-alpha"><i></i></div>' +
        '<div class="colorpicker-selectors"></div>' +
        '</div>',
        preview: '#color-preview'
    }).on('changeColor', function (e) {
        var color = e.color;
        var value = color.value;
        var rgb = color.toRGB();

        $('#hsl-h').val(Math.floor(value.h * 360));
        $('#hsl-s').val(Math.floor(value.s * 100));
        $('#hsl-b').val(Math.floor(value.b * 100));
        $('#hex').val(color.toHex().replace(/#/, ''));
        $('#rgb-r').val(rgb.r);
        $('#rgb-g').val(rgb.g);
        $('#rgb-b').val(rgb.b);

        uiColor = e.color;
        //colorCall(e.color.toHex());
        //selectColor(e.color.toHex());
    });
    $('#rgb-r').on('input', function () {
        $('#color-dialog-color').colorpicker('setColor', uiColor.setR($(this).val()));
    });
    $('#rgb-g').on('input', function () {
        $('#color-dialog-color').colorpicker('setColor', uiColor.setG($(this).val()));
    });
    $('#rgb-b').on('input', function () {
        $('#color-dialog-color').colorpicker('setColor', uiColor.setB($(this).val()));
    });
    $('#hsl-h').on('input', function () {
        $('#color-dialog-color').colorpicker('setColor', uiColor.setHue($(this).val() / 360));
    });
    $('#hsl-s').on('input', function () {
        $('#color-dialog-color').colorpicker('setColor', uiColor.setSaturation($(this).val() / 100));
    });
    $('#hsl-b').on('input', function () {
        $('#color-dialog-color').colorpicker('setColor', uiColor.setBrightness($(this).val() / 100));
    });
    $('#hex').on('change', function () {
        $('#color-dialog-color').colorpicker('setValue', '#' + $(this).val());
    });

    UI.color = function (option, call) {
        if (typeof option === 'function') {
            call = option;
            option = {};
        }

        $('#color-dialog-color').colorpicker('setValue', '#f00');

        $('#color-dialog').dialog({
            title: '颜色',
            btn: '确定',
            yes: function (id) {
                ui.close(id);
                call(uiColor.toHex());
            }
        });
        /*$('#color-list').dialog({
         title: '选择颜色',
         shadeClose: true
         });*/
        //
    }
})(jQuery);


if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/(^\s*)|(\s*$)/g, '');
    }
}
$.extend(ui.Dialog.DEFAULTS, {
    shadeClose: true,
    draggable: false // TODO 移动时头部加了z-index bug
})

;(function ($) {
    function Color(elem, option) {
        var that = this;

        var $elem = $(elem);
        $elem.on('click', function (e) {
            e.preventDefault();

            ui.color(function (color) {
                that.color = color;
                $elem.css('background-color', that.color);
                $elem.trigger('change');
                $elem.val(that.color);
                //ui.msg(color);
            });
        });
    }

    Color.prototype.val = function (val) {
        if (val) {
            this.color = val;
        } else {
            return this.color;
        }
    };

    $.fn.color = function (option) {
        return $(this).each(function () {
            new Color(this);
        });
    };

    //$('.ui-color').color();
})(jQuery);

// 多选插件
;(function ($) {

    function MultSelect(elem, option) {
        var that = this;

        that.opts = $.extend({}, MultSelect.DEFAULTS, option);

        that.down = false;
        var $select = $('#ui-mult-select');
        var startX;
        var startY;
        that.$elem = $(elem);
        that.disabled = false;
        var $items = $(elem).find(that.opts.item);

        if (!$select.length) {
            $select = $('<div id="ui-mult-select" style="position: absolute; display: none; border: 1px dashed #000;opacity: .3;"></div>');
            $(document.body).append($select)
        }

        /*var startEvent = 'touchstart';
         var moveEvent = 'touchmove';
         var endEvent = 'touchend';*/
        var startEvent = 'mousedown.ui.multSelect';
        var moveEvent = 'mousemove.ui.multSelect';
        var endEvent = 'mouseup.ui.multSelect';

        /*that.$elem.on(startEvent, function (e) {
            if (that.disabled) {
                return;
            }
            that.down = true;
            startX = e.pageX;
            startY = e.pageY;

            $(document).on(moveEvent, function (e) {
                if (!that.down) {
                    return;
                }

                var endX = e.pageX;
                var endY = e.pageY;

                var x = Math.min(startX, endX);
                var y = Math.min(startY, endY);
                var w = Math.abs(startX - endX);
                var h = Math.abs(startY - endY);

                var x2 = startX < endX ? endX : startX;
                $select.css({
                    width: w + 'px',
                    height: h + 'px',
                    left: x + 'px',
                    top: y + 'px'
                })
                $select.show();

                i = 0;
                $items.each(function () {
                    var $this = $(this);
                    var left = $this.offset().left;
                    var top = $this.offset().top;
                    var width = $this.outerWidth();
                    var height = $this.outerHeight();
                    var xx = Math.abs((x + w / 2) - (left + width / 2));
                    var yy = Math.abs((y + h / 2)  - (top + height / 2));
                    if (i == 0) {
                    }
                    if ((xx < (w / 2 + width / 2)) && (yy < (h / 2 + height / 2))) {
                        $this.addClass(that.opts.activeClass);
                        //$this.hide();
                    } else {
                        $this.removeClass(that.opts.activeClass);
                    }
                });
            });
        });

        $(document).on(endEvent, function () {
            if (that.down) {
                that.down = false;
                $select.hide();
                $(document).off(moveEvent);
            }
        });*/

    }

    MultSelect.DEFAULTS = {
        item: 'li',
        activeClass: 'active'
    };

    var fn = MultSelect.prototype;

    fn.enable = function () {
        var that = this;
        that.disabled = false;
    };

    fn.disable = function () {
        var that = this;
        that.disabled = true;
    };

    fn.destroy = function () {
        var that = this;
        that.$elem.removeData('ui.multSelect');
        that.$elem.off('.ui.multSelect');
        $(document).off('.ui.multSelect');
    };

    $.fn.multSelect = function (option) {
        return $(this).each(function () {
            var $this = $(this);
            var data = $this.data('ui.multSelect');
            if (!data) {
                data = new MultSelect(this, option);
                $this.data('ui.multSelect', data);
            }

            if (typeof option === 'string') {
                data[option]();
            }
        })
    }
})(jQuery);


// 上下文菜单插件
UI.$curContextElem = null;

;(function ($) {
    function Context(elem, option) {
        var that = this;
        that.opts = $.extend({}, Context.DEFAULTS, option);
        that.elem = elem;
        var $menu = $(that.opts.content);
        $menu.css('zIndex', 10000001);

        function pot($elem, x, y) {
            var width = $elem.outerWidth();
            var height = $elem.outerHeight();
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            var ptX = x;
            var ptY = y;

            if (ptY < winHeight - height) {

            } else if (ptY > height) {
                ptY = y - height;
            } else {
                ptY = winHeight - height;
            }

            if (ptX < winWidth - width) {

            } else if (ptX > width) {
                ptX = x - width;
            } else {
                ptX = winWidth - width;
            }

            $elem.css({
                'left': ptX,
                'top': ptY
            });
        }

        function handle(elem, e) {
            e.preventDefault();
            e.stopPropagation();

            if (UI.$curContextElem) {
                UI.$curContextElem.hide();
            }
            UI.$curContextElem = $menu;

            pot($menu, e.clientX, e.clientY);

            //$overlay.show();
            $menu.show();
            that.opts.show && that.opts.show(elem);

            $menu.addClass('context-active');

            UI.$curContextElem = $menu;

        }

        if (that.opts.item) {
            $(elem).on('contextmenu', that.opts.item, function (e) {
                handle(this, e);
                return true;
            });
        } else {
            $(elem).on('contextmenu', function (e) {
                handle(this, e);
                return true;
            });
        }


        $menu.on('contextmenu', function () {
            return false;
        });


    }

    Context.DEFAULTS = {
        //content
        show: function (ui) {},
        hide: function (ui) {}
    };

    $.fn.contextmenu = function (option) {
        return $(this).each(function (e) {
            new Context(this, option);
        });
    }
})(jQuery);

$(document).on('click', function (e) {
    if ($(e.target).parents(".context-active").length == 0
        || $(e.target).is('.dropdown-menu a')) {
        if (UI.$curContextElem) {
            UI.$curContextElem.hide();
            UI.$curContextElem.removeClass('context-active');
            UI.$curContextElem = null;
        }
    }
});

// 禁止选择插件
;(function ($) {
    $.fn.disableSelection = function (option) {
        return $(this).each(function () {
            $(this).on('selectstart', function () {
                return false;
            })
        });
    };
})(jQuery);

/*function context($elem, e) {
    var $overlay = $('#ui-context-overlay');
    if (!$overlay.length) {
        $overlay = $('<div id="ui-context-overlay" class=""></div>');
        $overlay.css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10000000,
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            opacity: .05,
        });
        $(document.body).append($overlay);
        $elem.on('contextmenu', function () {
            return false;
        });

        $overlay.on('contextmenu', function (e) {
            pot($elem, e);
            return false;
        })
    }
    $elem.css('zIndex', 10000001);

    function pot($elem, e) {
        var height = $elem.outerHeight();
        var winHeight = $(window).height();
        if (e.clientY < winHeight - height) {
            $elem.css({
                'left': e.clientX,
                'top': e.clientY
            });
        } else if (e.clientY > height) {
            $elem.css({
                'left': e.clientX,
                'top': e.clientY - height
            });
        } else {
            $elem.css({
                'left': e.clientX,
                'top': winHeight - height
            });
        }
    }

    pot($elem, e);

    $overlay.hide();
    //$overlay.show();
    $elem.show();
    $elem.addClass('context-active');

    UI.$curContextElem = $elem;

    $overlay.on('click', function () {
        $overlay.hide();
        $elem.hide();
    });
}

function contextHide($elem) {
    $elem.hide();
    //$('#ui-context-overlay').hide();
}*/

