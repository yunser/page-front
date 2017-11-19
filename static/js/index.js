/**
 * H5页面在线制作工具 v1.2.0
 */
;(function ($) {
    'use strict';

    function SliderEditor(elem, option) {
        this.opts = $.extend({}, SliderEditor.DEFAULTS, option);
        this.init();
    }

    window.SliderEditor = SliderEditor;

    SliderEditor.DEFAULTS = {
    };

    var fn = SliderEditor.prototype;

    // 初始化
    fn.init = function () {
        var that = this;

        that.ppt = {
            title: '新建 PowerPoint 演示文档',
            //background: 'asset/img/tpl/bg0.jpg',
            background: 'none',
            bgColor: '#fff',
            slides: [
            ]
        };

        // 对象变量
        that.$curElem = null;
        that.$editor = $('#editor');
        that.$curPreviewItem = null;
        that.$previewList = $('#preview-list');
        
        that.editing = false;

        that.textEditor = null;

        $('#editor-text-edit').hide();

        that.sizeType = 0 // 0: 宽屏16:9 1:标准4:3
        that.switchAnim = 'glue';

        that.initEditArea();
        that.initPreviewList();
        that.initDisplay();
        that.initToolArea();
        that.initTopBar();
        that.initIndex();

        $(document).on('selectstart', function () {
            return that.editing;
        });

        // 保存
        $('#save').on('click', function (e) {
            e.preventDefault();
            that.saveModify();
            ui.msg('功能暂未实现');
        });

        that.dealBgImage();

        function moveRight() {
            var left = that.$curElem.position().left + 1;
            that.$curElem.css('left', left + 'px');
            $('#editor-left').val(left);
        }
        function moveLeft() {
            var left = that.$curElem.position().left - 1;
            that.$curElem.css('left', left + 'px');
            $('#editor-left').val(left);
        }
        function moveDown() {
            var top = that.$curElem.position().top + 1;
            that.$curElem.css('top', top + 'px');
            $('#editor-top').val(top);
        }
        function moveUp() {
            var top = that.$curElem.position().top - 1;
            that.$curElem.css('top', top + 'px');
            $('#editor-top').val(top);
        }

        // 快捷
        $(document).on('keydown', function (e) {
            e.preventDefault();
            if (that.editing) {
                return true;
            }
            switch (e.keyCode) {
                //case 8: // 返回键
                case 46: // 删除键
                    that.removeCurElem();
                    return false;
                case 67: // c
                    if (e.ctrlKey) {
                        that.copyCurElem();
                    }
                    break;
                case 68: // d
                    if (e.ctrlKey) {
                        that.removeCurElem();
                    }
                    break;
                case 86: // v
                    if (e.ctrlKey) {
                        that.pasteElem();
                    }
                    break;
                case 88: // x
                    if (e.ctrlKey) {
                        that.cutCurElem();
                    }
                    break;
                case 90: // z
                    break;
            }

            return true;
        });

        $(document).on('keydown', function (e) {
            if (!that.displaying) {
                if (that.$curElem) {
                    if (document.activeElement.nodeName !== 'BODY') {
                        return;
                    }
                    switch (e.keyCode) {
                        case 37: // left
                            e.preventDefault();
                            moveLeft();
                            break;
                        case 38: // up
                            e.preventDefault();
                            moveUp();
                            break;
                        case 39: // right
                            e.preventDefault();
                            moveRight();
                            break;
                        case 40: // down
                            e.preventDefault();
                            moveDown();
                            break;
                    }
                }
            }

            return true;
        });




        /* 窗口关闭、刷新时提示保存文件 */
        function ConfirmClose() {
            window.event.returnValue = "还有内容尚未保存";
        }
        function ShowConfirmClose(blnValue) {
            if (blnValue) {
                document.body.onbeforeunload = ConfirmClose;
            } else {
                document.body.onbeforeunload = null;
            }
        }

        $('#music').on('click', function (e) {
            e.preventDefault();
            ui.msg('暂未实现');
        });
        
    };

    fn.quitEditorMode = function () {
        var that = this;
        if (that.editing) {
            that.textEditor.destroy();
            that.editing = false;
            that.$editor.multSelect('enable');

        }
        $('#editor-text-edit').hide();
    };

    fn.disableActiveElem = function() {
        if (this.$curElem) {
            //var $prevElem = $('.elem.active');
            var $prevElem = this.$curElem;
            if ($prevElem.length) {
                $prevElem.draggable('destroy');
                $prevElem.resizable('destroy');
                $prevElem.rotateable('destroy');
                $prevElem.removeClass('active');
            }
            this.$curElem = null;
        }
    };

    // 初始化编辑区
    fn.initEditArea = function () {
        var that = this;

        that.$editor.multSelect({
            item: '.elem',
            activeClass: 'mul-active'
        });

        // 编辑区域
        that.$editor.on('click', '.elem', function (e) {
            if (that.displaying || that.editing) {
                console.log('bug')
                return true;
            }
            that.selectElem($(this));
        });

        that.$editor.on('dblclick', '.elem', function (e) {
            e.stopPropagation();
            if (that.displaying) {
                return false;
            }

            that.disableActiveElem();

            if ($(this).hasClass('elem-text')) {
                if (!that.editing) {
                    that.editing = true;

                    var text = $(this).find('.elem-content')[0];
                    that.textEditor = new Editor(text, {
                        simple: true
                    });
                    that.textEditor.create();
                    that.$editor.multSelect('disable');

                    var $editTool = $('#edit-tool');
                    $editTool.find('.editor-box').hide();
                    $editTool.find('.editor-text-ediotr-box').show();

                    $('#tab-style').tab('show');
                }
            }
        });

        // 置于顶层
        $('#elem-menu-move-front').on('click', function () {
            var $siblings = that.$curElem.siblings();
            var zIndex = parseInt(that.$curElem.css('z-index'));
            that.$curElem.css('z-index', $siblings.length);
            $siblings.each(function () {
                var z = parseInt($(this).css('z-index'));
                if (z >= zIndex) {
                    $(this).css('z-index', z - 1);
                }
            });
            that.updateIndex();
        });

        // 上移一层
        $('#elem-menu-move-up').on('click', function () {
            var zIndex = parseInt(that.$curElem.css('z-index'));
            var $siblings = that.$curElem.siblings();
            if (zIndex >= $siblings.length) {
                return;
            }
            that.$curElem.css('z-index', zIndex + 1);
            $siblings.each(function () {
                var z = $(this).css('z-index');
                if (parseInt(z) === parseInt(zIndex) + 1) {
                    $(this).css('z-index', zIndex);
                }
            });
            that.updateIndex();
        });

        // 置于底层
        $('#elem-menu-move-behind').on('click', function () {
            var zIndex = parseInt(that.$curElem.css('z-index'));
            that.$curElem.css('z-index', 0);
            that.$curElem.siblings().each(function () {
                var z = parseInt($(this).css('z-index'));
                if (z <= zIndex) {
                    $(this).css('z-index', z + 1);
                }
            });
            that.updateIndex();
        });

        // 下移一层
        $('#elem-menu-move-down').on('click', function () {
            var zIndex = parseInt(that.$curElem.css('z-index'));
            if (zIndex === 0) {
                return;
            }
            that.$curElem.css('z-index', zIndex - 1);
            that.$curElem.siblings().each(function () {
                var z = $(this).css('z-index');
                if (parseInt(z) === parseInt(zIndex) - 1) {
                    $(this).css('z-index', zIndex);
                }
            });
            that.updateIndex();
        });

        // 删除元素
        $('#elem-menu-delete').on('click', function (e) {
            e.preventDefault();
            that.$curElem.remove();
        });

        // 剪切元素
        $('#elem-menu-cut').on('click', function (e) {
            e.preventDefault();
            that.cutCurElem();
        });
        // 复制元素
        $('#elem-menu-copy').on('click', function (e) {
            e.preventDefault();
            that.copyCurElem();
        });
        // 粘贴元素
        $('#elem-menu-paste,#editor-menu-paste').on('click', function (e) {
            e.preventDefault();
            that.pasteElem();
        });

        // 点击工作台空白位置
        that.$editor.on('click', function (e) {
            if (e.target.id === 'editor') {
                that.disableActiveElem();

                that.quitEditorMode();

                // 隐藏多余的功能
                that.hideBaseEditor();

            }
        });

        that.$editor.on('mousemove', function (e) {
            var offset = $(this).offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;

            $('#position').text('(' + x + ', ' + y + ')');
        });

        that.$editor.on('mouseout', function () {
            $('#position').text('(0, 0)');
        });

        // 编辑编辑区的超链接点击跳转
        that.$editor.on('click', 'a', function (e) {
            e.preventDefault();
        });

        // 编辑元素右键菜单
        that.$editor.contextmenu({
            item: '.elem',
            content: '#elem-menu',
            show: function (ui) {
                if (that.$copyElem) {
                    $('#elem-menu-paste').parent().removeClass('disabled');
                } else {
                    $('#elem-menu-paste').parent().addClass('disabled');
                }

                that.selectElem($(ui));
            }
        });

        that.$editor.contextmenu({
            content: '#editor-menu',
            show: function () {
                if (that.$copyElem) {
                    $('#editor-menu-paste').parent().removeClass('disabled');
                } else {
                    $('#editor-menu-paste').parent().addClass('disabled');
                }
            }
        });

        function dealElem(type) {
            dealCommonElem(that.$curElem);
            var $editTool = $('#edit-tool');
            $editTool.find('.editor-box').hide();
            $editTool.find('.editor-common-box').show();
            $('#editor-shadow-box').hide();

            $('#editor-text-box').show();
            if (type === 'text') {
                $editTool.find('.editor-text-box').show();
                dealTextElem(that.$curElem);
            } else if (type === 'image') {
                $editTool.find('.editor-image-box').show();
                dealImageElem(that.$curElem);
            } else if (type === 'shape') {
                $editTool.find('.editor-shape-box').show();
                dealShapeElem();
            } else {
                $editTool.find('.editor-chart-box').show();
                dealChartElem();
            }
        }
        function dealCommonElem($content) {
            dealSize();
            dealPosition();

            // 旋转角度
            var deg = ui.Rotateable.getDeg(that.$curElem);
            $('#editor-rotate').val(deg);

            // 边框样式
            var borderStyle = $content.css('border-style');
            $('#editor-border-style').val(borderStyle);
            if (borderStyle === 'none') {
                $('#border-width-and-color').hide();
            } else {
                $('#border-width-and-color').show();

                // 边框大小
                var borderWidth = $content.css('border-width').replace('px', '');
                $('#editor-border-width').val(borderWidth);

                // 边框颜色
                var borderColor = $content.css('border-color');
                $('#editor-border-color').colorpicker('setValue', borderColor);
            }

            // 边框半径
            var borderRadius = $content.css('border-radius').replace('px', '');
            $('#editor-border-radius').val(borderRadius);

            // 透明度
            var opacity = $content.css('opacity');
            $('#editor-opacity').val(opacity * 100);

            // 动画
            var anim = that.$curElem.attr('data-anim');
            if (!anim) {
                $('#editor-anim-name').val('');
                $('#editor-anim-box').hide();
            } else {
                $('#editor-anim-name').val(anim);
                $('#editor-anim-box').show();

                // 动画开始时间
                var delay = that.$curElem.css('animation-delay');
                delay = parseInt(delay.replace('s'), '') * 1000;
                $('#editor-anim-delay').val(delay);

                // 动画持续时间
                var duration = that.$curElem.css('animation-duration');
                duration = parseInt(duration.replace('s'), '') * 1000;
                $('#editor-anim-duration').val(duration);

                // 动画执行次数
                var count = that.$curElem.css('animation-iteration-count');
                $('#editor-anim-count').val(count);
                //duration = parseInt(duration.replace('s'), '') * 1000;
                //$('#editor-anim-duration').val(duration);
            }
        }

        function dealImageElem($content) {
        }
        function dealShapeElem() {
            // 填充色
            var svg = SVG(that.$curElem[0].getElementsByTagName('svg')[0]);
            $('#editor-fill-color').colorpicker('setValue', svg.attr('fill'));
        }
        function updateBarChart(svg, data, width, height) {
            var max = 0;
            var min;
            for (var i = 0; i < data.length; i++) {
                if (data[i] > max) {
                    max = data[i];
                }
            }
            var unit = height / max;
            var offset = width / data.length;
            svg.clear();
            var colors = ['#19bcc6', '#a9e810', '#f5a932', '#ee6969', '#8d4ccf'];
            for (var i = 0; i < data.length; i++) {
                var value = data[i];
                var x = 17 + (offset * i);
                svg.line(x, height - (unit * value), x, height).back()
                    .stroke({color: colors[i % 5], width: offset - 10});
            }
        }
        function updateLineChart(svg, data, width, height) {
            var max = 0;
            var min;
            for (var i = 0; i < data.length; i++) {
                if (data[i] > max) {
                    max = data[i];
                }
            }
            var unit = height / max;
            var offset = width / data.length;
            svg.clear();
            var polyline = [];
            for (var i = 0; i < data.length; i++) {
                var value = data[i];
                var x = 17 + (offset * i);
                var y = height - (unit * value) + 4; // TODO +4
                polyline.push([x, y]);
                svg.circle(8).attr('cx', x).attr('cy', y).fill('#19bcc6');
            }

            svg.polyline(polyline).fill('none').back()
                .stroke({color: '#19bcc6', width: 2 });
        }
        function sector(cx, cy, r, startAngle, endAngle, params) {
            var rad = Math.PI / 180;
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);
            var m = (endAngle - startAngle > 180) ? 1 : 0;
            return "M "+ cx + ' ' + cy + " L " + x1 + ' ' + y1 + " A " + r + ' ' + r + ' 0 '
                + m + ' 0 ' + x2+ ' ' + y2 + " z";
        }
        function updatePieChart(svg, data, width, height) {
            var r = (width > height ? height : width) / 2; // 半径
            var x = r;
            var y = r;
            var total = 0;
            for (var i = 0; i < data.length; i++) {
                total += data[i];
            }
            svg.clear();
            var colors = ['#19bcc6', '#a9e810', '#f5a932', '#ee6969', '#8d4ccf'];

            var lastEndDeg = 0;
            svg.circle(r * 2).attr('cx', x).attr('cy', y).fill(colors[(data.length - 1) % 5]); // TODO
            var arrs = [];
            for (var i = 0; i < data.length - 1; i++) {
                var value = data[i];
                lastEndDeg += data[i] / total * 360;
                var path = sector(x, y, r, 0, lastEndDeg);
                arrs.unshift(path);
            }
            for (var i = 0; i < arrs.length; i++) {
                svg.path(arrs[i]).fill(colors[i % 5]);
            }
        }
        // 插入饼状图
        $('#insert-chart1').on('click', function (e) {
            e.preventDefault();
            var id = 'svg-' + new Date().getTime();
            var zIndex = that.$editor.children().length;
            var html = '<div class="elem elem-shape" data-type="chart" data-chart="pie" data-data="1,2,3,4" style="position: absolute; top: 25px; left: 26.5px; z-index: 2; width: 196px; height: 179px; cursor: auto;">'
                + '<div class="elem-content">'
                + '<svg id="' + id + '" width="196" height="179" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" xmlns:svgjs="http://svgjs.com/svgjs"> </svg>'
                + '</div>'
            '</div>';
            that.$editor.append($(html));
            that.updateIndex();

            var svg = SVG(id);
            $('#editor-fill-color').colorpicker('setValue', svg.attr('fill'));
            var data = [1,2,3,4];
            updatePieChart(svg, data, 196, 179);
        });
        // 插入条形图
        $('#insert-chart2').on('click', function (e) {
            e.preventDefault();
            var id = 'svg-' + new Date().getTime();
            var zIndex = that.$editor.children().length;
            var html = '<div class="elem elem-shape" data-type="chart" data-chart="bar" data-data="1,2,3,4,5" style="position: absolute; top: 25px; left: 26.5px; z-index: 2; width: 196px; height: 179px; cursor: auto;">'
                + '<div class="elem-content">'
                + '<svg id="' + id + '" width="196" height="179" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" xmlns:svgjs="http://svgjs.com/svgjs"> </svg>'
                + '</div>'
            '</div>';
            that.$editor.append($(html));
            that.updateIndex();

            var svg = SVG(id);
            $('#editor-fill-color').colorpicker('setValue', svg.attr('fill'));
            var data = [1,2,3,4,5];
            updateBarChart(svg, data, 196, 179);
        });
        // 插入折线图
        $('#insert-chart3').on('click', function (e) {
            e.preventDefault();
            var id = 'svg-' + new Date().getTime();
            var zIndex = that.$editor.children().length;
            var html = '<div class="elem elem-shape" data-type="chart" data-chart="line" data-data="1,3,4,5,2" style="position: absolute; top: 25px; left: 26.5px; z-index: 2; width: 196px; height: 179px; cursor: auto;">'
                + '<div class="elem-content">'
                + '<svg id="' + id + '" width="196" height="179" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" xmlns:svgjs="http://svgjs.com/svgjs"> </svg>'
                + '</div>'
            '</div>';
            that.$editor.append($(html));
            that.updateIndex();

            var svg = SVG(id);
            $('#editor-fill-color').colorpicker('setValue', svg.attr('fill'));
            var data = [1,3,4,5,2];
            updateLineChart(svg, data, 196, 179);
        });
        function dealChartElem() {
            var svg = SVG(that.$curElem[0].getElementsByTagName('svg')[0]);
            $('#editor-data').val(that.$curElem.attr('data-data'));
            var type = that.$curElem.attr('data-chart');
            if (type === 'line') {
                $('#editor-chart-type').val('line');
            } else if (type === 'bar') {
                $('#editor-chart-type').val('bar');
            } else {
                $('#editor-chart-type').val('pie');
            }
        }
        $('#editor-chart-type').on('change', function () {
            var type = $(this).val();
            var data = $('#editor-data').val().split(',');
            for (var i = 0; i < data.length; i++) {
                data[i] = parseInt(data[i]);
            }
            var svg = SVG(that.$curElem[0].getElementsByTagName('svg')[0]);
            var width = that.$curElem.outerWidth();
            var height = that.$curElem.outerHeight();
            if (type === 'pie') {
                updatePieChart(svg, data, width, height);
                that.$curElem.attr('data-chart', 'pie');
            } else if (type === 'bar') {
                updateBarChart(svg, data, width, height);
                that.$curElem.attr('data-chart', 'bar');
            } else {
                updateLineChart(svg, data, width, height);
                that.$curElem.attr('data-chart', 'line');
            }
        });
        $('#chart-update').on('click', function (e) {
            e.preventDefault();
            var svg = SVG(that.$curElem[0].getElementsByTagName('svg')[0]);
            var data = $('#editor-data').val().split(',');
            for (var i = 0; i < data.length; i++) {
                data[i] = parseInt(data[i]);
            }

            var chartType = that.$curElem.attr('data-chart');
            that.$curElem.attr('data-data', $('#editor-data').val());
            var width = that.$curElem.outerWidth();
            var height = that.$curElem.outerHeight();
            if (chartType === 'bar') {
                updateBarChart(svg, data, width, height);
            } else if (chartType === 'line') {
                updateLineChart(svg, data, width, height);
            } else {
                updatePieChart(svg, data, width, height);
            }
        });
        function dealTextElem($content) {
            $('#editor-text-edit2').show();

            // 颜色
            var color = $content.css('color');
            var hex = ui.Color.rbg2Hex(color);
            $('#select-color2').colorpicker('setValue', hex);

            // 背景颜色
            var bgColor = $content.css('background-color');
            $('#editor-bg-color').colorpicker('setValue', bgColor);
            // 字体
            var fontFamily = $content.css('font-family');
            $('#editor-font-family').find('option').each(function () {
                if ($(this).text() === fontFamily) {
                    $(this).prop('selected', true);
                }
            });
            if (fontFamily.length > 10) {
                fontFamily = '微软雅黑';
            }
            $('#editor-font-family2').find('option').each(function () {
                if ($(this).text() === fontFamily) {
                    $(this).prop('selected', true);
                }
            });
            // 字体大小
            var fontSize = $content.css('font-size').replace('px', '');
            $('#editor-font-size').val(fontSize);
            $('#editor-font-size2').val(fontSize);
            // 行高
            var lienheight = $content.css('line-height').replace('px', '');
            lienheight = (parseInt(lienheight) / parseInt(fontSize)).toFixed(1);
            $('#editor-lineheight').val(lienheight);
            // 字符间距
            var letterSpacing = $content.css('letter-spacing');
            if (letterSpacing !== 0) {
                letterSpacing = letterSpacing.replace('px', '');
            }
            $('#editor-letter-spacing').val(letterSpacing);
            // 阴影
            var shadow = that.$curElem.data('shadow');
            if (shadow === 'use') {
                $('#editor-shadow-box').show();
                $('#editor-shadow').val('use')

                var xOffset = that.$curElem.data('shadow-x');
                if (!xOffset) {
                    xOffset = 0;
                }
                $('#editor-shadow-x-offset').val(xOffset);
                var yOffset = that.$curElem.data('shadow-y');
                if (!yOffset) {
                    yOffset = 0;
                }
                $('#editor-shadow-y-offset').val(yOffset);
                var blur = that.$curElem.data('shadow-blur');
                if (!blur) {
                    blur = 0;
                }
                $('#editor-shadow-blur').val(blur);
                var color = that.$curElem.data('shadow-color');
                if (!color) {
                    color = '#000';
                }
                $('#editor-shadow-color').colorpicker('setValue', color);
            } else {
                $('#editor-shadow-box').hide();
                $('#editor-shadow').val('none')
            }

        }

        $(document).on('elemchnage', function () {
            var type = that.$curElem.data('type');
            dealElem(type);
        });
        $(document).on('elemPositionChange', function () {
            dealPosition();
        });
        $(document).on('elemSizeChange', function () {
            dealSize();
            var type = that.$curElem.attr('data-type')
            if (type === 'chart') {
                var chartType = that.$curElem.attr('data-chart');

                var svg = SVG(that.$curElem[0].getElementsByTagName('svg')[0]);
                var data =that.$curElem.attr('data-data').split(',');
                for (var i = 0; i < data.length; i++) {
                    data[i] = parseInt(data[i]);
                }
                var width = that.$curElem.outerWidth();
                var height = that.$curElem.outerHeight();
                svg.attr('width', width);
                svg.attr('height', height);
                if (chartType === 'bar') {
                    updateBarChart(svg, data, width, height);
                } else if (chartType === 'pie') {
                    updatePieChart(svg, data, width, height);
                } else {
                    updateLineChart(svg, data, width, height);
                }
            } else if (type === 'video') {
                that.$curElem.find('iframe').width(that.$curElem.outerWidth()).height(that.$curElem.outerHeight());
            }
        });
        function dealSize() {
            // 宽度
            var width = that.$curElem.outerWidth();
            $('#editor-width').val(width);
            // 高度
            var height = that.$curElem.outerHeight();
            $('#editor-height').val(height);
        }

        function dealPosition() {
            // x
            var left = parseInt(that.$curElem.offset().left - that.$editor.offset().left);
            $('#editor-left').val(left);
            // y
            var top = parseInt(that.$curElem.offset().top - that.$editor.offset().top); // TODO 2
            $('#editor-top').val(top);
        }

        //
        if (that.ppt.background !== 'none') {
            $('#template').css('background-image', 'url(' + that.ppt.background + ')');
        }
        $('#template').css('background-color', that.ppt.bgColor);
    };

    fn.selectElem = function ($this) {
        var that = this;
        that.disableActiveElem();

        that.$curElem = $this;
        $this.addClass('active');

        var MIN_DISTANCE = 10; // minimum distance to "snap" to a guide
        var guides = []; // no guides available ...
        var innerOffsetX, innerOffsetY; // we'll use those during drag ...

        function computeGuidesForElement(elem, offset, w, h ){
            if( elem != null ){
                var $t = $(elem);
                offset = $t.offset();
                w = $t.outerWidth() - 1;
                h = $t.outerHeight() - 1;
            }

            // 这里的话不同顺序的有区别的，
            return [
                { type: 'h', left: null, top: offset.top },
                { type: 'h', left: null, top: offset.top + h },

                { type: 'v', left: offset.left, top: null },
                { type: 'v', left: offset.left + w, top: null },

                { type: 'h', left: null, top: offset.top + h/2 },
                { type: 'v', left: offset.left + w/2, top: null }
                // you can add _any_ other guides here as well (e.g. a guide 10 pixels to the left of an element)
            ];
        }

        var $guideH = $('#guide-h');
        var $guideV = $('#guide-v');

        // 显示辅助线
        function showSizeLine(event, ui) {
            // iterate all guides, remember the closest h and v guides
            var guideV, guideH, distV = MIN_DISTANCE+1, distH = MIN_DISTANCE+1, offsetV, offsetH;
            var chosenGuides = { top: { dist: MIN_DISTANCE+1 }, left: { dist: MIN_DISTANCE+1 } };
            var $t = $(ui);
            var pos = { top: event.originalEvent.pageY - innerOffsetY, left: event.originalEvent.pageX - innerOffsetX };
            var w = $t.outerWidth() - 1;
            var h = $t.outerHeight() - 1;
            var elemGuides = computeGuidesForElement(null, pos, w, h);
            $.each(guides, function(i, guide) {
                $.each(elemGuides, function(i, elemGuide) {
                    if (guide.type === elemGuide.type) {
                        var prop = guide.type === 'h' ? 'top' : 'left';
                        var d = Math.abs(elemGuide[prop] - guide[prop]);
                        if (d < chosenGuides[prop].dist) {
                            chosenGuides[prop].dist = d;
                            chosenGuides[prop].offset = elemGuide[prop] - pos[prop];
                            chosenGuides[prop].guide = guide;
                        }
                    }
                } );
            } );

            if (chosenGuides.top.dist <= MIN_DISTANCE) {
                $guideH.css('top', chosenGuides.top.guide.top).show();
                //ui.style.top = (chosenGuides.top.guide.top - chosenGuides.top.offset - 63) + 'px';
            } else {
                $guideH.hide();
            }

            if (chosenGuides.left.dist <= MIN_DISTANCE ){
                $guideV.css( 'left', chosenGuides.left.guide.left ).show();
                //ui.style.left = (chosenGuides.left.guide.left - chosenGuides.left.offset - 200) + 'px';
            } else {
                $guideV.hide();
            }
        }

        function lineStart(event, ui) {
            guides = $.map( $('#editor .elem' ).not('.active'), computeGuidesForElement );
            var pOffset = that.$editor.offset();
            var pWidth = that.$editor.outerWidth();
            var pHeight = that.$editor.outerHeight();
            guides.push({ type: 'h', left: null, top: pOffset.top });
            guides.push({ type: 'h', left: null, top: pOffset.top + pHeight });
            guides.push({ type: 'h', left: null, top: pOffset.top + pHeight / 2 });
            guides.push({ type: 'v', left: pOffset.left, top: null });
            guides.push({ type: 'v', left: pOffset.left + pWidth, top: null });
            guides.push({ type: 'v', left: pOffset.left + pWidth / 2, top: null });
            innerOffsetX = event.originalEvent.offsetX;
            innerOffsetY = event.originalEvent.offsetY;
        }

        $this.draggable({
            cursor: 'move',
            scroll: false,
            opacity: 0.5,
            //containment: '.device-body',
            distance: 5,
            zIndex: 10000,
            start: function(event, ui) {
                lineStart(event, ui);
            },
            drag: function( event, ui ){
                // iterate all guides, remember the closest h and v guides
                var guideV, guideH, distV = MIN_DISTANCE+1, distH = MIN_DISTANCE+1, offsetV, offsetH;
                var chosenGuides = { top: { dist: MIN_DISTANCE+1 }, left: { dist: MIN_DISTANCE+1 } };
                var $t = $(ui);
                var pos = { top: event.originalEvent.pageY - innerOffsetY, left: event.originalEvent.pageX - innerOffsetX };
                var w = $t.outerWidth() - 1;
                var h = $t.outerHeight() - 1;
                var elemGuides = computeGuidesForElement(null, pos, w, h);

                $.each(guides, function(i, guide) {
                    $.each(elemGuides, function(i, elemGuide) {
                        if (guide.type === elemGuide.type) {
                            var prop = guide.type === 'h' ? 'top' : 'left';
                            var d = Math.abs(elemGuide[prop] - guide[prop]);
                            if (d < chosenGuides[prop].dist) {
                                chosenGuides[prop].dist = d;
                                chosenGuides[prop].offset = elemGuide[prop] - pos[prop];
                                chosenGuides[prop].guide = guide;
                            }
                        }
                    });
                });

                if (chosenGuides.top.dist <= MIN_DISTANCE) {
                    $guideH.css('top', chosenGuides.top.guide.top).show();
                    ui.style.top = (chosenGuides.top.guide.top - chosenGuides.top.offset - that.$editor.offset().top) + 'px';
                } else{
                    $guideH.hide();
                }

                if (chosenGuides.left.dist <= MIN_DISTANCE) {
                    $guideV.css('left', chosenGuides.left.guide.left ).show();
                    ui.style.left = (chosenGuides.left.guide.left - chosenGuides.left.offset - that.$editor.offset().left) + 'px';
                } else {
                    $guideV.hide();
                }

                $(document).trigger('elemPositionChange');
            },
            end: function(event, ui) {
                $guideH.hide();
                $guideV.hide();
            }
        });

        $this.resizable({
            handles: 'n, e, s, w, ne, se, sw, nw',
            start: function(event, ui) {
                lineStart(event, ui);
            },
            resize: function(event, ui) {
                showSizeLine(event, ui);
                $(document).trigger('elemSizeChange');
            },
            end: function(event, ui) {
                $guideH.hide();
                $guideV.hide();
                $('#guide-v, #guide-h').hide();
            }
        });

        $this.rotateable({
            rotate: function(event, ui) {
                $('#editor-rotate').val(parseInt(event.deg));
            }
        });
        $this.draggable('enable');
        $this.resizable('enable');
        $this.rotateable('enable');

        $(document).trigger('elemchnage');

        that.updateIndexActive();
    };

    // 初始化左侧预览列表
    fn.initPreviewList = function () {
        var that = this;

        that.curPageIndex = 0;
        that.totalPage = that.$previewList.children().length;
        selectPage(0);

        $(document).on('keydown', function (e) {
            switch (e.keyCode) {
                case 33: // page up
                    prevPage();
                    break;
                case 34: // page down
                    nextPage();
                    break;
            }

            return true;
        });

        that.$previewList.contextmenu({
            content: '#preview-menu',
            show: function (ui) {
                if (that.$copyPage) {
                    $('#preview-paste').parent().removeClass('disabled');
                } else {
                    $('#preview-paste').parent().addClass('disabled');
                }
            }
        });

        // 左侧预览右键菜单
        that.$previewList.contextmenu({
            item: '.preview-item',
            content: '#preview-item-menu',
            show: function (ui) {
                if (that.$copyPage) {
                    $('#preview-menu-paste').parent().removeClass('disabled');
                } else {
                    $('#preview-menu-paste').parent().addClass('disabled');
                }

                selectItem($(ui).index());
            }
        });
        /*that.$previewList.selectable({
            item: '.preview-item',
            selected: function (e, item) {
                console.log($(item).index())
                selectItem($(item).index());
            }
        });*/
        // 点击左侧预览，保存并更新编辑区
        that.$previewList.on('click', '.preview-item', function () {
            selectItem($(this).index());
        });

        // 粘贴页面
        function pastePage($item) {
            if (that.$copyPage) {
                that.totalPage += 1;
                if ($item) {
                    that.$curPreviewItem.after($(that.$copyPage[0].outerHTML));
                    selectPage(that.$curPreviewItem.index() + 1);
                } else {
                    that.$previewList.append($(that.$copyPage[0].outerHTML));
                    selectPage(that.totalPage - 1);
                }
            }
        }
        $('#preview-menu-paste').on('click', function (e) {
            e.preventDefault();
            pastePage(that.$curPreviewItem);
        });
        $('#preview-paste').on('click', function (e) {
            e.preventDefault();
            pastePage();
        });

        // 删除页面
        $('#preview-menu-delete').on('click', function (e) {
            e.preventDefault();

            if (that.totalPage === 1) {
                that.$editor.empty();
                that.$editor.css('background-image', 'none'); // TODO 最后一张时有bug
                that.saveModify();
            } else {
                // 选择新页面
                var $removeItem = that.$curPreviewItem;
                var $items = that.$previewList.children();
                var newIndex;
                if ($removeItem.index() === 0) {
                    newIndex = 1;
                } else if ($removeItem.index() === $items.length - 1) {
                    newIndex = $items.length - 2;
                } else {
                    newIndex = $removeItem.index() + 1;
                }
                selectPage(newIndex);

                // 删除页面
                $removeItem.remove();
                that.totalPage--;
                updatePage();
            }
            that.dealBgImage();
        });

        // 剪切页面
        $('#preview-menu-cut').on('click', function (e) {
            e.preventDefault();

            that.$copyPage = that.$curPreviewItem;
            that.$copyPage.removeClass('active');

            that.$curPreviewItem.remove();
            that.totalPage--;
            updatePage();
        });

        // 复制页面
        $('#preview-menu-copy').on('click', function (e) {
            e.preventDefault();

            that.$copyPage = that.$curPreviewItem;
            that.$copyPage.removeClass('active');
        });

        // 添加页面
        $('#preview-menu-add').on('click', function (e) {
            e.preventDefault();
            newPage(that.$curPreviewItem);
        });
        // 新建
        $('#new').on('click', function (e) {
            e.preventDefault();
            ui.confirm('所有内容将被清空？ ', function (id) {
                ui.close(id);
                that.$previewList.empty();
                that.totalPage = 0;
                that.ppt.background = 'none';
                $('#template').css({
                    'background-image': 'none',
                    'background-color': '#fff'
                });
                that.ppt.bgColor = '#fff';
                newPage();
                that.dealBgImage();
                that.updateIndex();
            });
        });
        // 添加新页面
        $('#new-page,#preview-add').on('click', function (e) {
            e.preventDefault();
            newPage();
        });

        // 添加新幻灯片页面
        function newPage($curItem) {
            var style = that.ppt.background === 'none' ? ('background-color: ' + that.ppt.bgColor) :
                ('background-image: url(' + that.ppt.background + ')');
            var html = '<li class="preview-item">'
                + '<span class="page"></span>'
                + '<div class="viewport-box">'
                + '  <div class="viewport" data-bg="default" style="' + style + '"></div>'
                + '<div class="viewport-mask"></div>'
                + '</div></li>';
            var $item = $(html);

            if ($curItem) {
                $curItem.after($item);
            } else {
                that.$previewList.append($item);
                that.$previewList.scrollTop(that.$previewList[0].scrollHeight);
            }

            selectPreviewitem($item);
            that.curPageIndex = $item.index();
            that.totalPage++;
            updatePage();
        }

        function selectItem(index) {
            that.quitEditorMode();
            that.disableActiveElem();
            that.saveModify();
            selectPage(index);
            that.hideBaseEditor();
        }

        function selectPage(index) {
            that.curPageIndex = index;
            var $item = that.$previewList.children().eq(index);
            selectPreviewitem($item);
            updatePage();
            that.updateIndex();
        }

        function updatePage() {
            $('#page').text('第 ' + (that.curPageIndex + 1) + ' 张，共 ' + that.totalPage + ' 张');
            that.$previewList.children().each(function (index) {
                $(this).find('.page').text(index + 1);
            })
        }

        function nextPage() {
            if (that.curPageIndex < that.totalPage - 1) {
                selectPage(that.curPageIndex + 1);
            }
        }

        function prevPage() {
            if (that.curPageIndex > 0) {
                selectPage(that.curPageIndex - 1);
            }
        }

        function selectPreviewitem($item) {
            that.$curPreviewItem = $item;

            $item.siblings().removeClass('active').end().addClass('active');

            var $newViewport = $item.find('.viewport');
            that.$editor.html($newViewport.html());

            if ($newViewport.attr('data-bg') === 'default') {
                that.$editor.css('background-image', 'none');
                that.$editor.css('background-color', 'transparent');
            } else {
                var bgImage = $newViewport.css('background-image');
                that.$editor.css('background-image', bgImage);
                that.$editor.css('background-color', $newViewport.css('background-color'));
            }
            $('.elem.active').removeClass('active');

            // 处理背景颜色和背景图片
            var bgColor = that.$editor.css('background-color');
            var hex = ui.Color.rbg2Hex(bgColor);
            $('#editor-template-bg-color').colorpicker('setValue', hex);
        }

        that.$previewList.sortable({
            end: function () {
                that.curPageIndex = that.$previewList.find('.active').index();
                updatePage();
            }
        });
    };

    fn.dealBgImage = function () {
        var that = this;

        var bgImage = that.$editor.css('background-image');
        if (bgImage === 'none') {
            $('#edidtor-bg-display').css('background-image', 'url("asset/img/tpl/none.jpg")');
        } else {
            $('#edidtor-bg-display').css('background-image', bgImage);
        }

        $('#editor-base-bg-color').colorpicker('setValue', that.$editor.css('background-color'));
        if (that.ppt.background === 'none') {
            $('#edidtor-bg-display2').css('background-image', 'url("asset/img/tpl/none.jpg")');
        } else {
            $('#edidtor-bg-display2').css('background-image', 'url(' + that.ppt.background + ')');
        }
        $('#editor-template-bg-color').colorpicker('setValue', that.ppt.bgColor);
    };

    fn.hideBaseEditor = function () {
        var that = this;

        var $editTool = $('#edit-tool');
        $editTool.find('.editor-box').hide();
        $editTool.find('.editor-base-box').show();

        that.dealBgImage();
    };

    // 保存当前修改（编辑区的改动同步到左侧预览列表）
    fn.saveModify = function () {
        var that = this;

        var $viewport = $('.preview-item.active .viewport');
        $viewport.html(that.$editor.html());
        $viewport.css('background-color', that.$editor.css('background-color'));
        var bgImage = that.$editor.css('background-image');
        var bgColor = that.$editor.css('background-color');
        if (bgImage === 'none') {
            if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === that.ppt.bgColor) { // TODO
                // 默认
                $viewport.css('background-color', that.ppt.bgColor);
                if (that.ppt.background !== 'none') {
                    $viewport.css('background-image', 'url(' + that.ppt.background + ')');
                }
            } else {
                // 自定义背景色
                $viewport.attr('data-bg', 'custom');
                $viewport.css('background-image', 'none');
                $viewport.css('background-color', bgColor);
            }
        } else {
            // 自定义背景图
            $viewport.attr('data-bg', 'custom');
            $viewport.css('background-image', bgImage);
        }
    };

    fn.initIndex = function () {
        var that = this;
        var $list = $('#index-list');
        $list.sortable();
        $list.selectable({
            item: '.list-item',
            selected: function (e, item) {
                var index = $(item).data('index');
                that.$editor.children().each(function () {
                    if ($(this).css('z-index') == index) {
                        that.selectElem($(this));
                    }
                })
            }
        });
    };

    fn.updateIndex = function () {
        var that = this;
        that.$editor.children();
        var $list = $('#index-list');
        $list.empty();
        var html = '';
        var items = [];
        that.$editor.children().each(function () {
            var type;
            var content;
            var index;
            if ($(this).hasClass('elem-text')) {
                type = 'text';
                content = $(this).find('.elem-content').text().substring(0, 20);
                index = $(this).css('z-index');
                if (index === 'auto') {
                    index = 0;
                }
            } else if ($(this).hasClass('elem-image')) {
                type = 'image';
                content = $(this).find('.elem-content').attr('src');
                index = $(this).css('z-index');
            } else {
                type = 'shape';
                content = '';
                index = $(this).css('z-index');
            }

            items.push({
                type: type,
                content: content,
                index: index
            });
        });
        items.sort(function (a, b) {
            return a.index < b.index;
        });

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var li = '';
            li += '<li class="list-item" data-index="' + item.index + '">';
            if (item.type === 'text') {
                li += '<span class="type">文字</span>'
                    + '<div class="content">'
                    + '<span>' + item.content + '</span>'
                    + '</div>';
            } else if (item.type === 'image') {
                li += '<span class="type" data-index="' + item.index + '">图片</span>'
                    + '<div class="content">'
                    + '<img src="' + item.content + '">'
                    + '</div>';
            } else {
                li += '<span class="type" data-index="' + item.index + '">形状</span>'
                    + '<div class="content">'
                    + '<span>' + item.content + '</span>'
                    + '</div>';
            }
            li += '</li>';
            html += li;
        }
        $list[0].innerHTML = html;
        that.updateIndexActive();
    };

    fn.updateIndexActive = function () {
        var that = this;

        if (that.$curElem) {
            var index = that.$editor.children().length - parseInt(that.$curElem.css('z-index')) - 1;
            var $indexList = $('#index-list');
            $indexList.find('.active').removeClass('active');
            $indexList.children().eq(index).addClass('active');
        }
    };

    // 初始化幻灯片放映
    fn.initDisplay = function () {
        var that = this;

        that.displaying = false;
        that.displayIndex = 0;

        $(document).on('keydown', function (e) {
            if (that.displaying) {
                switch (e.keyCode) {
                    case 8: // backspace
                    case 33: // page up
                    case 37: // left
                    case 38: // up
                        prevDisplay();
                        break;
                    case 32: // space
                    case 34: // page down
                    case 39: // right
                    case 40: // down
                        nextDisplay();
                        break;
                    case 27:
                        closeDisplay();
                        break;
                }
            }

            return true;
        });

        // 关闭演示
        function closeDisplay() {
            that.displaying = false;
            $('#display').hide();
            that.$editor.show();
        }

        $(document).on('mousewheel', function(e, delta) {
            // 防止网页缩放
            if (e.ctrlKey) {
                return false;
            }
            if (that.displaying) {
                if (delta > 0) {
                    prevDisplay();
                } else {
                    nextDisplay();
                }

                return false;
            }
            return true;
        });

        /* 展示 */
        function startAnim() {
            var $list = $('.display-list');
            var $items = $list.find('.display-item');
            var $cur = $items.eq(that.displayIndex);

            $('[data-anim]', $items).each(function () {
                var $this = $(this);
                //$this.hide();

                // 添加新动画
                var anim = $this.attr('data-anim');
                $this.addClass('animated');
                $this.addClass(anim);
            });
            //$cur.data('anim').split(';');
        }

        $('#display-show').on('click', function () {
            that.disableActiveElem();
            that.saveModify();
            initDisplay();
            that.hideBaseEditor();
            that.displaying = true; // TODO 上到上面？
            that.displayIndex = 0;

            that.$editor.hide();
            $('#display').show();

            /*bespoke.horizontal.from('#display-list', {
             fx: true
             });*/

            startAnim();

            //fullElem(document.getElementById('display'));
        });

        function showProgress(index) {
            $('#display-progress-bar').css('width', (((index + 1) / that.totalPage * 100) + '%'));
        }

        function initDisplay() {
            $('.preview-item.active .viewport').html(that.$editor.html());

            var $previewItems = that.$previewList.find('.preview-item');
            that.totalPage = $previewItems.length;
            var $list = $('.display-list');
            $list.empty();
            var html = '';
            var i = 0;
            $previewItems.each(function () {
                i++;
                var $viewport = $(this).find('.viewport');
                var bgImage = $viewport.css('background-image');
                bgImage = bgImage.replace(/\"/g, "'");
                //bgImage = "url('asset/img/demo/visit-bg.jpg')";

                html += '<li class="display-item" asd' + i
                    + " style=\";background-image: " + bgImage
                    + ";background-color: " + $viewport.css('background-color') + ';">'
                    + $viewport.html() + '</li>'
            });
            $list.html(html);
            $('.display-list').find('.display-item').eq(0).show();

            // 全屏播放
            var width = that.sizeType === 0 ? 755 : 600;
            var scaleX = $(window).width() / width;
            var scaleY = $(window).height() / 506;
            /* $('#display-device').pot({
             x: 'center',
             y: 'center'
             });*/
            $('#display-device').css('transform', 'scale(' + scaleX + ', ' + scaleY + ')');

            showProgress(that.displayIndex);
        }

        var ps = new PptSlider();

        function prevDisplay() {
            if (that.displayIndex > 0) {
                if (that.displayScrolling) {
                    return;
                }
                that.displayIndex--;
                var $list = $('.display-list');
                var $items = $list.find('.display-item');
                var $curItem = $items.eq(that.displayIndex + 1);

                var $prevItem = $items.eq(that.displayIndex);


                if (that.switchAnim === 'none') {
                    $curItem.hide();
                    $prevItem.show();
                } else if (that.switchAnim === 'fade') {
                    $curItem.fadeOut();
                    $prevItem.fadeIn();
                } else {
                    $prevItem.show();
                    var anim = ps.getAnim(that.switchAnim, 'prev');
                    $curItem.addClass(anim.outClass);
                    /*this.animEndEventName = this.animEndEventNames[ Modernizr.prefixed( 'animation' ) ];*/
                    $curItem.one('animationend ', function(e) {
                        $curItem.removeClass(anim.outClass);
                        $curItem.hide();
                    });
                    that.displayScrolling = true;

                    //$prevItem.css('left', '-100%');
                    /*$prevItem.animate({
                     left: '0%'
                     }, 500, function () {
                     startAnim();
                     });*/
                    $prevItem.addClass(anim.inClass);
                    $prevItem.one('animationend ', function() {
                        $prevItem.removeClass(anim.inClass);
                        startAnim();
                        that.displayScrolling = false;
                    });
                }

                showProgress(that.displayIndex);
            } else {
                ui.msg('没有上一页了');
            }
        }

        function nextDisplay() {
            if (that.displayIndex < that.totalPage - 1) {
                if (that.displayScrolling) {
                    return;
                }
                that.displayIndex++;
                var $list = $('.display-list');
                var $items = $list.find('.display-item');
                //$items.eq(that.displayIndex - 1).hide();
                var $nextItem = $items.eq(that.displayIndex);
                var $curItem = $items.eq(that.displayIndex - 1);

                if (that.switchAnim === 'none') {
                    $nextItem.show();
                    $curItem.hide();
                } else if (that.switchAnim === 'fade') {
                    $nextItem.fadeIn();
                    $curItem.fadeOut();
                } else {
                    $nextItem.show();

                    var anim = ps.getAnim(that.switchAnim, 'next');

                    that.displayScrolling = true;

                    $curItem.addClass(anim.outClass);
                    $curItem.one('animationend ', function() {
                        that.displayScrolling = false;
                        $curItem.removeClass(anim.outClass);
                        $curItem.hide();
                    });

                    $nextItem.addClass(anim.inClass);
                    $nextItem.one('animationend ', function() {
                        $nextItem.removeClass(anim.inClass);
                        startAnim();
                    });
                }


                showProgress(that.displayIndex);
            } else {
                ui.msg('没有下一页了');
            }
        }

        // 上一页
        $('#display-prev').on('click', function () {
            prevDisplay();
        });
        // 下一页
        $('#display-list').on('click', function (e) {
            nextDisplay();
        });
        $('#display-list').on('click', 'a', function (e) {
            e.stopPropagation();
        });
        $('#display-list').on('click', '.elem-video', function (e) {
            e.stopPropagation();
            $(this).find('.elem-icon').hide();
            $(this).find('iframe').show();
        });
        $('#display-next').on('click', function () {
            nextDisplay();
        });
        // 关闭演示
        $('#display-close').on('click', function () {
            closeDisplay();
        });

        // 查看所有幻灯片
        $('#display-menu-all').on('click', function (e) {
            e.preventDefault();
            closeDisplay();
        });
        $('#display-menu-close').on('click', function (e) {
            e.preventDefault();
            closeDisplay();
        });

    };

    // 初始化右侧工具区
    fn.initToolArea = function () {
        var that = this;

        var $editTool = $('#edit-tool');
        $editTool.find('.editor-box').hide();
        $editTool.find('.editor-base-box').show();

        // 动画方式
        $('#editor-anim-name').on('change', function () {
            var anim = $(this).val();
            selectAnim(anim);
            if (anim) {
                $('#editor-anim-box').show();
            } else {
                $('#editor-anim-box').hide();
            }
        });

        $('#editor-font-family2').on('change', function () {
            var fontFamily = $(this).val();
            that.$curElem.css('font-family', $(this).val());
        });
        $('#editor-lineheight').on('input', function () {
            that.$curElem.css('line-height', $(this).val());
        });
        $('#editor-letter-spacing').on('input', function () {
            that.$curElem.css('letter-spacing', $(this).val() + 'px');
        });

        $('#editor-font-size2').on('input', function () {
            var fontFamily = $(this).val();
            that.$curElem.css('font-size', $(this).val() + 'px');
        });


        // 边框大小
        $('#editor-border-width').on('input', function () {
            that.$curElem.css('border-width', $(this).val() + 'px');
        });
        // 边框样式
        $('#editor-border-style').on('change', function () {
            var borderStyle = $(this).children('option:selected').val();
            var borderWidth;
            if (that.$curElem.css('border-style') === 'none') {
                borderWidth = 1; // 默认1px
            } else {
                borderWidth = that.$curElem.css('border-width').replace('px', '');
            }
            that.$curElem.css('border-style', borderStyle);

            if (borderStyle === 'none') {
                $('#border-width-and-color').hide();
            } else {
                $('#border-width-and-color').show();

                // 边框大小
                $('#editor-border-width').val(borderWidth);
                that.$curElem.css('border-width', borderWidth + 'px');
                // 边框颜色
                var borderColor = that.$curElem.css('border-color');
                $('#editor-border-color').colorpicker('setValue', borderColor);
            }
        });
        // 切换方式
        $('#editor-switch').on('change', function () {
            var switchAnim = $(this).val();
            that.switchAnim = switchAnim;
            if (switchAnim === 'none') {
            } else {
            }
        });
        // 阴影
        $('#editor-shadow').on('change', function () {
            var use = $(this).val();
            if (use === 'none') {
                $('#editor-shadow-box').hide();
                that.$curElem.attr('data-shadow', 'none');
                that.$curElem.css('text-shadow', 'none');
            } else {
                $('#editor-shadow-box').show();
                that.$curElem.attr('data-shadow', 'yes');

                $('#editor-shadow-x-offset').val(1);
                $('#editor-shadow-y-offset').val(1);
                $('#editor-shadow-blur').val(0);
                that.$curElem.attr('data-shadow-blur', 0);
                $('#editor-shadow-color').colorpicker('setValue', '#000');
                that.$curElem.css('text-shadow', '1px 1px 0 #000');
            }
        });
        $('#editor-shadow-x-offset').on('input', function () {
            var xOffset = $(this).val();
            that.$curElem.attr('data-shadow-x', xOffset);
            var yOffset = that.$curElem.data('shadow-y');
            if (!yOffset) {
                yOffset = 0;
            }
            var blur = that.$curElem.data('shadow-blur');
            if (!blur) {
                blur = 0;
            }
            var color = that.$curElem.data('shadow-color');
            if (!color) {
                color = '#000';
            }
            var textShadow = xOffset + 'px ' + yOffset + 'px ' + blur + 'px ' + color;
            that.$curElem.css('text-shadow', textShadow);
        });
        $('#editor-shadow-y-offset').on('input', function () {
            var xOffset = that.$curElem.data('shadow-x');
            if (!xOffset) {
                xOffset = 0;
            }
            var yOffset = $(this).val();
            that.$curElem.attr('data-shadow-y', yOffset);
            var blur = that.$curElem.data('shadow-blur');
            if (!blur) {
                blur = 0;
            }
            var color = that.$curElem.data('shadow-color');
            if (!color) {
                color = '#000';
            }
            var textShadow = xOffset + 'px ' + yOffset + 'px ' + blur + 'px ' + color;
            that.$curElem.css('text-shadow', textShadow);
        });
        $('#editor-shadow-blur').on('input', function () {
            var xOffset = that.$curElem.data('shadow-x');
            if (!xOffset) {
                xOffset = 0;
            }
            var yOffset = that.$curElem.data('shadow-y');
            if (!yOffset) {
                yOffset = 0;
            }
            var blur = $(this).val();
            that.$curElem.attr('data-shadow-blur', blur);
            var color = that.$curElem.data('shadow-color');
            if (!color) {
                color = '#000';
            }
            var textShadow = xOffset + 'px ' + yOffset + 'px ' + blur + 'px ' + color;
            that.$curElem.css('text-shadow', textShadow);
        });
        // 阴影颜色
        $('#editor-shadow-color').colorpicker({
            format: 'rgba'
        }).on('changeColor', function (e) {
            var xOffset = that.$curElem.data('shadow-x');
            if (!xOffset) {
                xOffset = 0;
            }
            var yOffset = that.$curElem.data('shadow-y');
            if (!yOffset) {
                yOffset = 0;
            }
            var blur = that.$curElem.data('shadow-blur');
            if (!blur) {
                blur = 0;
            }
            var color = e.color.toString('rgba');
            that.$curElem.attr('data-shadow-color', color);
            var textShadow = xOffset + 'px ' + yOffset + 'px ' + blur + 'px ' + color;
            that.$curElem.css('text-shadow', textShadow);
        });
        // 边框半径
        $('#editor-border-radius').on('input', function () {
            that.$curElem.css('border-radius', $(this).val() + 'px');
            that.$curElem.find('.elem-content').css('border-radius', $(this).val() + 'px');
        });
        // 宽度
        $('#editor-width').on('input', function () {
            that.$curElem.css('width', $(this).val() + 'px');
        });
        // 高度
        $('#editor-height').on('input', function () {
            that.$curElem.css('height', $(this).val() + 'px');
        });
        // x
        $('#editor-left').on('input', function () {
            that.$curElem.css('left', ($(this).val() ) + 'px');
        });
        // y
        $('#editor-top').on('input', function () {
            that.$curElem.css('top', ($(this).val() ) + 'px');
        });
        // 透明度
        $('#editor-opacity').on('input', function () {
            that.$curElem.css('opacity', $(this).val() / 100.0);
        });
        // 旋转
        $('#editor-rotate').on('input', function () {
            that.$curElem.css('transform', 'rotateZ(' + $(this).val() + 'deg)');
        });
        // 动画持续时间
        $('#editor-anim-duration').on('change', function () {
            var duration = ($(this).val() / 1000) + 's';
            that.$curElem.css('animation-duration', duration);
        });
        // 动画开始时间
        $('#editor-anim-delay').on('change', function () {
            var delay = ($(this).val() / 1000) + 's';
            that.$curElem.css('animation-delay', delay);
        });
        // 动画执行次数
        $('#editor-anim-count').on('change', function () {
            that.$curElem.css('animation-iteration-count', $(this).val());
        });

        $('#select-color2').colorpicker({}).on('changeColor', function (e) {
            that.$curElem.css('color', e.color.toHex());
        });

        $('#editor-base-bg-color').colorpicker({}).on('changeColor', function (e) {
            that.$editor.css('background-image', 'none');
            that.$editor.css('background-color', e.color.toHex());
            that.saveModify();
            that.dealBgImage();
        });

        // 取消背景图片
        $('#editor-base-bg-img-cancel').on('click', function () {
            that.$editor.css('background-image', 'none');
            that.$editor.css('background-color', 'transparent');
            that.saveModify();
            that.dealBgImage();
        });
        // 替换背景图片
        $('#editor-base-bg-img').on('click', function (e) {
            e.preventDefault();
            ui.selectImage('替换背景图片', function (src) {
                that.$editor.css('background-image', 'url(' + src + ')');
                that.saveModify();
                that.dealBgImage();
            });
        });
        // 替换母版背景图
        $('#editor-base-bg-img2').on('click', function (e) {
            e.preventDefault();
            ui.selectImage('选择图片', function (src) {
                $('#template').css('background-image', 'url(' + src + ')');
                that.$previewList.children().each(function () {
                    var $viewport = $(this).find('.viewport');
                    var bgImage = $viewport.css('background-image');
                    bgImage = bgImage.replace(/\"/g, "'");
                    if (bgImage.indexOf(that.ppt.background) !== -1) {
                        $viewport.css('background-image', 'url(' + src + ')');
                    }
                });
                that.ppt.background = src;
                that.dealBgImage();
            });
        });
        // 幻灯片母版背景颜色
        $('#editor-template-bg-color').colorpicker({}).on('changeColor', function (e) {
            that.$editor.css('background-color', e.color.toHex());
            that.ppt.bgColor = e.color.toHex();
            $('#template').css('background-image', 'none');
            $('#template').css('background-color', that.ppt.bgColor);
            that.$previewList.children().each(function () {
                var $viewport = $(this).find('.viewport');
                if ($viewport.attr('data-bg') == 'default') {
                    $viewport.css('background-image', 'none');
                    $viewport.css('background-color', that.ppt.bgColor);
                }
            });
            that.ppt.background = 'none';
            that.dealBgImage();
        });

        var template = '<div class="colorpicker dropdown-menu">' +
            '<div class="colorpicker-saturation"><i><b></b></i></div>' +
            '<div class="colorpicker-hue"><i></i></div>' +
            '<div class="colorpicker-alpha"><i></i></div>' +
            '<div class="colorpicker-color"><div /></div>' +
            '<div class="colorpicker-selectors"></div>' + +'<div><a href="#">X</a></div>'
        '</div>';

        $('#editor-bg-color').colorpicker({
            format: 'rgb' // TODO rgba 透明度有bug
        }).on('changeColor', function (e) {
            that.$curElem.css('background-color', e.color.toString('rgb'));
        });
        // 填充色
        $('#editor-fill-color').colorpicker({
            format: 'rgba'
        }).on('changeColor', function (e) {
            that.$curElem.find('svg').attr('fill', e.color.toString('rgba'));
            //svg.fill('#f00');
            //that.$curElem.css('background-color', e.color.toString('rgba'));
        });

        // 边框颜色
        $('#editor-border-color').colorpicker({}).on('changeColor', function (e) {
            that.$curElem.css('border-color', e.color.toHex());
        });
        /*$('#editor-border-color').color().on('change', function () {
         //ui.msg('改变了');
         that.$curElem.css('border-color', $(this).val());
         });*/


        $('#editor-add-anim').on('click', function (e) {
            e.preventDefault();

        });
        function selectAnim(anim) {
            // 移去旧动画
            var animation = that.$curElem.attr("data-anim");
            that.$curElem.removeClass(animation);
            //that.$curElem.removeClass('animated');

            // 添加新动画
            that.$curElem.addClass('animated');
            that.$curElem.attr('data-anim', anim); // TODO
            that.$curElem.addClass(anim);

            var duration = that.$curElem.css('animation-duration').replace('s', '');
            duration = parseInt(duration) * 1000;

            setTimeout(function () {
                var animation2 = that.$curElem.attr("data-anim");
                that.$curElem.removeClass(animation2);
                //that.$curElem.removeClass('slideInLeft');
                that.$curElem.removeClass('animated');

            }, duration);

        }

        $('#editor-play-anim').on('click', function (e) {
            e.preventDefault();
            var anim = that.$curElem.attr('data-anim');
            selectAnim(anim);
        });

        that.imageSelectCall = null;
        
        ui.selectImage = function (option, call) {
            $('#image-selector').dialog({
                title: option.title,
                shadeClose: true
            });
            that.imageSelectCall = call;
        };

        // 替换图片
        $('#editor-relace-img').on('click', function (e) {
            e.preventDefault();
            ui.selectImage('选择图片', function (src) {
                that.$curElem.find('.elem-content').attr('src', src);
            });
        });

        // 图片选择
        $('.select-img-list').on('click', '.select-img-item', function (e) {
            e.preventDefault();
            var src = $(this).find('img').attr('src');
            that.imageSelectCall && that.imageSelectCall(src);
            ui.closeAll(); // TODO ?
        });
    };

    // 初始化顶部工具类
    fn.initTopBar = function () {
        var that = this;

        // 插入形状
        $("#shape-box svg").click(function(e) {
            e.preventDefault();
            // TODO
            // 获得元素自身的html代码
            //alert(            $("<p>").append($(this).clone()).html()       )   ;

            var zIndex = that.$editor.children().length;
            var html = '<div class="elem elem-shape" data-type="shape" style="position: absolute; top: 200px; left: 110px; '
                + 'z-index:' + zIndex + ';width: 100px;height:100px;">'
                + '<div class="elem-content">'
                + this.outerHTML
                + '</div>'
                + '</div>';
            that.$editor.append($(html));

            ui.closeAll();

        });

        // 插入文字
        $('#insert-text').on('click', function (e) {
            e.preventDefault();
            var zIndex = that.$editor.children().length;
            var html = '<div class="elem elem-text" data-type="text" style="position: absolute; top: 200px; left: 110px; '
                + 'z-index:' + zIndex + ';width: 400px;">'
                + '<div class="elem-content"><p>点击编辑文字</p></div>'
                + '</div>';
            that.$editor.append($(html));
            that.updateIndex();
        });
        $('#insert-video').on('click', function (e) {
            e.preventDefault();
            ui.prompt({title: '输入「视频」的 iframe', formType: 2}, function (text, id) {
                if (!text) {
                    ui.msg('输入「视频」的 iframe');
                    return;
                }
                if (text.indexOf('iframe') === -1) {
                    ui.msg('请输入正确的 iframe');
                    return;
                }
                ui.close(id);

                var zIndex = that.$editor.children().length;
                var html = '<div class="elem elem-video" data-type="video" style="position: absolute; top: 200px; left: 110px; '
                    + 'z-index:' + zIndex + ';width: 400px; height: 300px">'
                    + text
                    + '<div class="elem-icon"><i class="icon icon-play"></i> </div>'
                    + '<div class="elem-content"><p>点击编辑文字</p></div>'
                    + '</div>';
                var $html = $(html);
                that.$editor.append($html);
                $html.find('iframe').hide().width(400).height(300);
                that.updateIndex();
            });
        });
        // 插入图片
        $('#insert-img').on('click', function (e) {
            e.preventDefault();
            ui.selectImage('替换背景图片', function (src) {
                that.insertImage(src);
            });
        });

        // 插入形状
        $('#insert-shape').on('click', function (e) {
            e.preventDefault();
            $('#shape-box').dialog({
                title: '插入形状'
            });
        });

        // 插入表格
        $('#insert-table').on('click', function (e) {
            e.preventDefault();
            $('#table-dialog').dialog({
                title: '插入表格'
            });
        });

        var $table = $('#choose-table');
        var $row = $('#row');
        var $col = $('#col');

        // 定义table事件
        $table.on('mouseenter', 'td', function (e) {
            var $currentTd = $(e.currentTarget);
            var currentTdIndex = $currentTd.attr('index');
            var $currentTr = $currentTd.parent();
            var currentTrIndex = $currentTr.attr('index');

            // 显示
            $row.text(currentTrIndex);
            $col.text(currentTdIndex);

            // 遍历设置背景颜色
            $table.find('tr').each(function () {
                var $tr = $(this);
                var trIndex = $tr.attr('index');
                if (parseInt(trIndex, 10) <= parseInt(currentTrIndex, 10)) {
                    // 该行需要可能需要设置背景色
                    $tr.find('td').each(function () {
                        var $td = $(this);
                        var tdIndex = $td.attr('index');
                        if (parseInt(tdIndex, 10) <= parseInt(currentTdIndex, 10)) {
                            // 需要设置背景色
                            $td.addClass('active');
                        } else {
                            // 需要移除背景色
                            $td.removeClass('active');
                        }
                    });
                } else {
                    // 改行不需要设置背景色
                    $tr.find('td').removeClass('active');
                }
            });
        }).on('mouseleave', function (e) {
            // mouseleave 删除背景色
            $table.find('td').removeClass('active');

            $row.text(0);
            $col.text(0);
        });

        // 插入表格
        $table.on('click', 'td', function (e) {
            var $currentTd = $(e.currentTarget);
            var currentTdIndex = $currentTd.attr('index');
            var $currentTr = $currentTd.parent();
            var currentTrIndex = $currentTr.attr('index');

            var rownum = parseInt(currentTrIndex, 10);
            var colnum = parseInt(currentTdIndex, 10);

            // -------- 拼接tabel html --------

            var i, j;
            var tableHtml = '<table>';
            for (i = 0; i < rownum; i++) {
                tableHtml += '<tr>';

                for (j = 0; j < colnum; j++) {
                    tableHtml += '<td><span>&nbsp;</span></td>';
                }
                tableHtml += '</tr>';
            }
            tableHtml += '</table>';

            var zIndex = that.$editor.children().length; // TODO
            var html = '<div class="elem elem-text" data-type="text" style="position: absolute; top: 50px; left: 50px; '
                + 'z-index: ' + zIndex + ';width: 300px; height: 150px;">'
                + '<div class="elem-content">'
                + tableHtml
                + '</div>'
                //+ '<img class="elem-content" src="' + src + '">'
                + '</div>';
            that.$editor.append($(html));

            ui.closeAll();
        });

        $('#upload').on('click', function () {
            var $fileInput = $('<input type="file">');
            $(document.body).append($fileInput);
            $fileInput.on('change', function () {
                if ($(this).val()) {
                    var file = this.files[0];　　//获取拖拽文件
                    var URL = window.URL || window.webkitURL;
                    // 通过 file 生成目标 url
                    var imgURL = URL.createObjectURL(file);
                    /*// 用这个 URL 产生一个 <img> 将其显示出来
                     $('body').append($('<img/>').attr('src', imgURL));
                     // 使用下面这句可以在内存中释放对此 url 的伺服，跑了之后那个 URL 就无效了
                     // URL.revokeObjectURL(imgURL);
                     db.loadImageFile(fileList[0]);
                     $('#open-dialog').dialog('hide');*/

                    $('#image-selector').dialog('hide');

                    that.imageSelectCall && that.imageSelectCall(imgURL);
                }
            });
            $fileInput.hide();
            $fileInput.trigger('click');
        });

        var demo = document.getElementById('editor');
        var area = document.getElementById('drop-area');
        //dropDemo(demo);

        dropArea(area);

        function dropDemo(demo) {
            demo.addEventListener("dragenter", function(e){
                e.stopPropagation();
                e.preventDefault();
            }, false);
            demo.addEventListener('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
            }, false);

            demo.addEventListener('drop', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var file = e.dataTransfer.files[0];　　//获取拖拽文件
                if (!file) {
                    return;
                }

                var URL = window.URL || window.webkitURL;
                // 通过 file 生成目标 url
                var imgURL = URL.createObjectURL(file);

                $('#image-selector').dialog('hide');
                that.insertImage(imgURL);
            }, false);
        }

        function dropArea(demo) {
            demo.addEventListener("dragenter", function(e){
                e.stopPropagation();
                e.preventDefault();
            }, false);
            demo.addEventListener('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
            }, false);

            demo.addEventListener('drop', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var file = e.dataTransfer.files[0];　　//获取拖拽文件

                var URL = window.URL || window.webkitURL;
                // 通过 file 生成目标 url
                var imgURL = URL.createObjectURL(file);

                that.imageSelectCall && that.imageSelectCall(imgURL);

                $('#image-selector').dialog('hide');
            }, false);
        }

        $('#image-selector-insert').on('click', function (e) {
            e.preventDefault();
            var url = $('#image-selector-url').val();
            if (!url) {
                ui.msg('请输入网络图片地址');
                return;
            }

            $('#image-selector').dialog('hide');

            that.insertImage(url);
        });
        // 版式
        $('#design-list').on('click', '.design-item', function (e) {
            e.preventDefault();

            var $newViewport = $(this).find('.viewport');
            that.$editor.html($newViewport.html());
            //that.$editor.css('background-color', $newViewport.css('background-color'));
            var bgImage = $newViewport.css('background-image').trim();

            if (bgImage.indexOf(that.ppt.background) === -1) {
                that.$editor.css('background-image', bgImage);
            } else {
                that.$editor.css('background-image', 'none');
            }
            that.saveModify();
        });

        // 切换大小
        $('#style').on('click', function (e) {
            e.preventDefault();
            if (that.sizeType === 0) {
                that.sizeType = 1;
                ui.msg('已切换至标准大小（4:3）');
                $('#device').css('width', '600px');
            } else {
                that.sizeType = 0;
                ui.msg('已切换至宽屏大小（16:9）');
                $('#device').css('width', '750px');
            }
        });
    };

    fn.insertImage = function (src) {
        var that = this;

        var img = new Image();
        img.src = src;
        img.onload = function () {
            var width = img.width;
            var height = img.height;
            // 如果图片太大，等比例缩小
            if (width > 750 || height > 750) {
                var max = width > height ? width : height;
                width = width * 750 / max;
                height = height * 750 / max;
            }
            var zIndex = that.$editor.children().length;
            var html = '<div class="elem elem-image" data-type="image" style="position: absolute; top: 225px; left: 100px; '
                + 'z-index: ' + zIndex + ';width: ' + width + 'px; height: ' + height + 'px;">'
                + '<img class="elem-content" src="' + src + '">'
                + '</div>';
            that.$editor.append($(html));
            that.updateIndex();
        };
    };

    fn.removeCurElem = function () {
        var that = this;
        if (that.$curElem) {
            var $removeElem = that.$curElem;
            that.disableActiveElem();
            $removeElem.remove();
        }
    };

    fn.copyCurElem = function () {
        var that = this;
        that.$copyElem = that.$curElem;
    };

    fn.pasteElem = function () {
        var that = this;
        if (that.$copyElem) {
            that.disableActiveElem();
            var $elem = $(that.$copyElem[0].outerHTML);
            $elem.css('top', (that.$copyElem.position().top + 10) + 'px');
            $elem.css('left', (that.$copyElem.position().left + 10) + 'px');
            $elem.removeClass('active');
            that.$editor.append($elem);
        }
    };

    fn.cutCurElem = function () {
        var that = this;
        that.$copyElem = that.$curElem;
        that.disableActiveElem();
        that.$copyElem = that.$copyElem.detach();
    };

})(jQuery)