$(function () {
    var editor = window.editor;

    var Color = ui.Color;
    var E = window.Editor;
    
    function quickUi(id, cmd, cmdName) {

        var $btn = $('#' + id);
        $btn.on('click', function (e) {
            editor.execCommand(cmd);
        });

        E.ready(function () {
            editor = this;
            editor.on('stateChange', function () {
                if (editor.queryCommandState(cmd)) {
                    $btn.addClass('active');
                } else {
                    $btn.removeClass('active');
                }
            });
        });
    }

    

    quickUi('bold', 'bold');
    quickUi('italic', 'italic');
    quickUi('underline', 'underline');
    quickUi('strikethrough', 'strikethrough');
    quickUi('align-left', 'align-left');
    quickUi('align-right', 'align-right');
    quickUi('align-center', 'align-center');

    quickUi('undo', 'undo');
    quickUi('redo', 'redo');
    quickUi('unorderlist', 'unorderlist');
    quickUi('orderlist', 'orderlist');
    quickUi('subscript', 'subscript');
    quickUi('superscript', 'superscript');
    quickUi('link', 'link');
    quickUi('unlink', 'unlink');

    E.ready(function () {
        editor = this;
        editor.on('stateChange', function () {
            var color = editor.queryCommandState('forecolor');
            var hex = Color.rbg2Hex(color);
            $('#select-color').css('color', hex);

            var bgColor = editor.queryCommandState('bgcolor');
            if (bgColor === 'rgba(0, 0, 0, 0)') {
                $('#select-bgcolor').css('color', '#000');
            } else {
                var hex = Color.rbg2Hex(bgColor);
                $('#select-bgcolor').css('color', hex);
            }


            var fontSize = editor.queryCommandState('fontsize');
            console.log(fontSize);
            fontSize = fontSize.replace(/px/, '');
            $('#editor-font-size').val(fontSize);

            var fontFamily = editor.queryCommandState('fontfamily');
            $('#fontFamily').val(fontFamily);
        });
    });

    // 超链接
    E.ready(function () {
        editor = this;
        editor.on('stateChange', function () {
            var color = editor.queryCommandState('forecolor');
            var hex = Color.rbg2Hex(color);
            $('#select-color').css('color', hex);

            var bgColor = editor.queryCommandState('bgcolor');
            if (bgColor === 'rgba(0, 0, 0, 0)') {
                $('#select-bgcolor').css('color', '#000');
            } else {
                var hex = Color.rbg2Hex(bgColor);
                $('#select-bgcolor').css('color', hex);
            }


            var fontSize = editor.queryCommandState('fontsize').replace(/px/, '');
            $('#editor-font-size').val(fontSize);

            var fontFamily = editor.queryCommandState('fontfamily');
            $('#fontFamily').val(fontFamily);
        });
    });

    $('#link').on('click', function () {
        // 获取url
        var url = '';
        var rangeElem = editor.getRangeElem();
        rangeElem = editor.getSelfOrParentByName(rangeElem, 'a');
        if (rangeElem) {
            url = rangeElem.href || '';
        }

        // 获取 text
        var text = '';
        var isRangeEmpty = editor.isRangeEmpty();
        if (!isRangeEmpty) {
            // 选区不是空
            text = editor.getRangeText() || '';
        } else if (rangeElem) {
            // 如果选区空，并且在 a 标签之内
            text = rangeElem.textContent || rangeElem.innerHTML;
        }

        if (!url) {
            url = 'http://';
        }
        $('#link-dialog-text').val(text);
        $('#link-dialog-url').val(url);

        $('#link-dialog').dialog({
            btn: ['确定', '取消'], // TODO 回调不能用了
            yes: function (id) {
                var text = $('#link-dialog-text').val();
                var url = $('#link-dialog-url').val();
                if (!url) {
                    ui.msg('请输入链接');
                    return;
                }

                if (!text) {
                    text = url;
                }

                var $linkElem, linkHtml;
                var commandFn, callback;
                var $txt = editor.txt.$txt;
                var $oldLinks, $newLinks;
                var uniqId = 'link' + E.random();

                var rangeElem = editor.getRangeElem();
                var targetElem = editor.getSelfOrParentByName(rangeElem, 'a');
                var isRangeEmpty = editor.isRangeEmpty();
                if (!isRangeEmpty) {
                    // 选中区域有内容，则执行默认命令

                    // 获取目前 txt 内所有链接，并为当前链接做一个标记
                    $oldLinks = $txt.find('a');
                    $oldLinks.attr(uniqId, '1');

                    // 执行命令
                    editor.command(null, 'createLink', url);

                    // 去的没有标记的链接，即刚刚插入的链接
                    $newLinks = $txt.find('a').not('[' + uniqId + ']');
                    $newLinks.attr('target', '_blank'); // 增加 _blank

                    // 去掉之前做的标记
                    $oldLinks.removeAttr(uniqId);

                } else if (targetElem) {
                    // 无选中区域，在 a 标签之内，修改该 a 标签的内容和链接
                    $linkElem = $(targetElem);
                    commandFn = function () {
                        $linkElem.attr('href', url);
                        $linkElem.text(text);
                    };
                    callback = function () {
                        var editor = this;
                        editor.restoreSelectionByElem(targetElem);
                    };
                    // 执行命令
                    editor.customCommand(null, commandFn, callback);
                } else {
                    // 无选中区域，不在 a 标签之内，插入新的链接

                    linkHtml = '<a href="' + url + '" target="_blank">' + text + '</a>';
                    if (E.userAgent.indexOf('Firefox') > 0) {
                        linkHtml += '<span>&nbsp;</span>';
                    }
                    editor.command(null, 'insertHtml', linkHtml);
                }
                ui.close(id);
            }
        });
    });

    $('#select-color').on('click', function () {
        ui.color(function (color) {
            console.log(color);
            editor.execCommand('forecolor', color);
        });
    });

    $('#select-bgcolor').on('click', function () {
        ui.color(function (color) {
            editor.execCommand('bgcolor', color);
        });
    });

    // 字体
    $('#editor-font-family').on('change', function () {
        var fontFamily = $(this).children('option:selected').val();
        editor.execCommand('fontfamily', fontFamily);
    });

    // 字体大小
    $('#editor-font-size').on('input', function () {
        editor.execCommand('fontsize', $(this).val() + 'px');
        //$curElem.css('font-size', $(this).val() + 'px');
    });

    /*E.ready(function () {
        editor = this;
        this.on('stateChange', function () {
            if (editor.queryCommandState('bold')) {
            } else {
            }
        });
    });*/
    
});