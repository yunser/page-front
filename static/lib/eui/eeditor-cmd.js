
// 命令
;(function () {
    var E = window.Editor;

    // 加粗
    E.addCommand({
        name: 'bold',
        handler: function () {
            var e = null;
            var isRangeEmpty = this.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                this.command(e, 'Bold');
            } else {
                // 如果选区没有内容
                this.commandForElem('b,strong,h1,h2,h3,h4,h5', e, 'Bold');
            }
        },
        systemCmd: 'Bold',
    });

    // 斜体
    E.addCommand({
        name: 'italic',
        handler: function () {
            var e = null;
            var isRangeEmpty = this.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                this.command(e, 'Italic');
            } else {
                // 如果选区没有内容
                this.commandForElem('i', e, 'Italic');
            }
        },
        systemCmd: 'Italic',

    });

    // 左对齐
    E.addCommand({
        name: 'align-left',
        handler: function () {
            var e = null;

            this.command(e, 'JustifyLeft');
        },
        systemCmd: 'JustifyLeft',
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5,li', function (elem) {
                var cssText;
                if (elem && elem.style && elem.style.cssText != null) {
                    cssText = elem.style.cssText;
                    if (cssText && /text-align:\s*left;/.test(cssText)) {
                        return true;
                    }
                }
                if ($(elem).attr('align') === 'left') {
                    // ff 中，设置align-left之后，会是 <p align="left">xxx</p>
                    return true;
                }
                return false;
            });
            if (rangeElem) {
                return true;
            }
            return false;
        }
    });

    // 右对齐
    E.addCommand({
        name: 'align-right',
        handler: function () {
            var e = null;

            this.command(e, 'JustifyRight');
        },
        systemCmd: 'JustifyRight',
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5,li', function (elem) {
                var cssText;
                if (elem && elem.style && elem.style.cssText != null) {
                    cssText = elem.style.cssText;
                    if (cssText && /text-align:\s*right;/.test(cssText)) {
                        return true;
                    }
                }
                if ($(elem).attr('align') === 'right') {
                    // ff 中，设置align-right之后，会是 <p align="right">xxx</p>
                    return true;
                }
                return false;
            });
            if (rangeElem) {
                return true;
            }
            return false;
        }
    });

    // 居中
    E.addCommand({
        name: 'align-center',
        handler: function () {
            var e = null;

            this.command(e, 'JustifyCenter');
        },
        systemCmd: 'JustifyCenter',
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5,li', function (elem) {
                var cssText;
                if (elem && elem.style && elem.style.cssText != null) {
                    cssText = elem.style.cssText;
                    if (cssText && /text-align:\s*center;/.test(cssText)) {
                        return true;
                    }
                }
                if ($(elem).attr('align') === 'center') {
                    // ff 中，设置align-center之后，会是 <p align="center">xxx</p>
                    return true;
                }
                return false;
            });
            if (rangeElem) {
                return true;
            }
            return false;
        }
    });

    // 下划线
    E.addCommand({
        name: 'underline',
        handler: function (editor) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'Underline');
            } else {
                // 如果选区没有内容
                editor.commandForElem('u,a', e, 'Underline');
            }
        },
        systemCmd: 'Underline',
    });

    // 删除线
    E.addCommand({
        name: 'strikethrough',
        handler: function (editor) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'StrikeThrough');
            } else {
                // 如果选区没有内容
                editor.commandForElem('strike', e, 'StrikeThrough');
            }
        },
        systemCmd: 'StrikeThrough',
    });

    // 撤销
    E.ready(function () {
        var editor = this;
        var $txt = editor.txt.$txt;
        var timeoutId;

        // 执行undo记录
        function undo() {
            editor.undoRecord();
        }

        $txt.on('keydown.ui.editor', function (e) {
            var keyCode = e.keyCode;

            // 撤销 ctrl + z
            if (e.ctrlKey && keyCode === 90) {
                editor.undo();
                return;
            }

            if (keyCode === 13) {
                // enter 做记录
                undo();
            } else {
                // keyup 之后 1s 之内不操作，则做一次记录
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(undo, 1000);
            }
        });

        // 初始化做记录
        editor.undoRecord();
    });

    // 撤销
    E.addCommand({
        name: 'undo',
        handler: function (editor) {
            editor.undo();
        },
    });

    // 重做
    E.addCommand({
        name: 'redo',
        handler: function (editor) {
            editor.redo();
        }
    });

    // 无序列表
    E.addCommand({
        name: 'unorderlist',
        handler: function (editor) {
            var e = null;
            this.command(e, 'InsertUnorderedList');
        },
        systemCmd: 'InsertUnorderedList',
    });

    // 有序列表
    E.addCommand({
        name: 'orderlist',
        handler: function (editor) {
            var e = null;
            this.command(e, 'InsertOrderedList');
        },
        systemCmd: 'InsertOrderedList',
    });

    // 上标
    E.addCommand({
        name: 'superscript',
        handler: function (editor) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'SuperScript');
            } else {
                // 如果选区没有内容
                editor.commandForElem('p,sup', e, 'SuperScript');
            }
        },
        systemCmd: 'SuperScript',
    });

    // 下标
    E.addCommand({
        name: 'subscript',
        handler: function (editor) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'SubScript');
            } else {
                // 如果选区没有内容
                editor.commandForElem('sub', e, 'SubScript');
            }
        },
        systemCmd: 'SubScript',
    });

    // 颜色
    E.addCommand({
        name: 'forecolor',
        handler: function (editor, value) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'forecolor', value);
            } else {
                // 如果选区没有内容
                editor.commandForElem('sub', e, 'SubScript'); // TODO
            }
        },
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            var color = $(rangeElem).css('color');
            return color;
        }
    });

    E.addCommand({
        name: 'fontfamily',
        handler: function (editor, value) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'fontName', value);
            } else {
                // 如果选区没有内容
                editor.commandForElem('sub', e, 'SubScript');
            }
        },
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            //rangeElem = editor.getSelfOrParentByName(rangeElem, 'font[face]');
            var fontFamily = $(rangeElem).css('font-family');
            return fontFamily;
        }
    });

    E.addCommand({
        name: 'fontsize',
        handler: function (editor, value) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.lock = true;
                editor.command(e, 'fontSize', value);
                var rangeElem = editor.getRangeElem();
                //$(rangeElem).hide();
                $(rangeElem).css('font-size', value);
                editor.lock = false;
                editor.triggerChange();
            } else {
                // 如果选区没有内容
                editor.commandForElem('sub', e, 'SubScript');
            }
        },
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            var fontSize = $(rangeElem).css('font-size');
            console.log('qs', fontSize)
            return fontSize;
        }
    });

    E.addCommand({
        name: 'link',
        handler: function (editor, value) {
            
        },
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            var aElem = editor.getSelfOrParentByName(rangeElem, 'a');
            return aElem ? true : false;
        },
        systemCmd: 'unLink',
    });


    E.addCommand({
        name: 'unlink',
        handler: function (editor, value) {
            var e = null;
            var rangeElem = editor.getRangeElem();
            var aElem = editor.getSelfOrParentByName(rangeElem, 'a');
            if (!aElem) {
                return;
            }

            // 在 a 之内
            var $a = $(aElem);
            var $span = $('<span>' + $a.text() + '</span>');
            function commandFn() {
                $a.after($span).remove();
            }
            function callback() {
                editor.restoreSelectionByElem($span.get(0));
            }
            editor.customCommand(e, commandFn, callback);
        },
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            var aElem = editor.getSelfOrParentByName(rangeElem, 'a');
            return aElem ? true : false;
        },
        systemCmd: 'unLink',
    });

    // 检查元素是否有 background-color: 内联样式
    function checkElemFn(elem) {
        var cssText;
        if (elem && elem.style && elem.style.cssText != null) {
            cssText = elem.style.cssText;
            if (cssText && cssText.indexOf('background-color:') >= 0) {
                return true;
            }
        }
        return false;
    }

    E.addCommand({
        name: 'bgcolor',
        handler: function (editor, value) {
            var e = null;
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                editor.commandForElem({
                    selector: 'span,font',
                    check: checkElemFn
                }, e, 'BackColor', value);
            } else {
                // 当前未处于选中状态，或者有选中内容。则执行默认命令
                editor.command(e, 'BackColor', value);
            }
        },
        queryState: function (editor) {
            var rangeElem = editor.getRangeElem();
            //rangeElem = editor.getSelfOrParentByName(rangeElem, 'font[face]');
            var fontFamily = $(rangeElem).css('background-color');
            return fontFamily;
        }
    });
}());
