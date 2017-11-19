/**
 * EUI: editor.js v1.3.0
 *
 * 兼容IE9+
 */

(function (factory) {
    if (typeof window.define === 'function') {
        if (window.define.amd) {
            // AMD模式
            window.define('eEditor', ["jquery"], factory);
        } else if (window.define.cmd) {
            // CMD模式
            window.define(function (require, exports, module) {
                return factory;
            });
        } else {
            // 全局模式
            factory(window.jQuery);
        }
    } else if (typeof module === "object" && typeof module.exports === "object") {
        // commonjs

        // 引用 css —— webapck
        window.eEditorCssPath ? require(window.eEditorCssPath) : require('../dist/css/eEditor.css');
        module.exports = factory(
            // 传入 jquery ，支持使用 npm 方式或者自己定义jquery的路径
            window.eEditorJQueryPath ? require(window.eEditorJQueryPath) : require('jquery')
        );
    } else {
        // 全局模式
        factory(window.jQuery);
    }
})(function($){
    
    // 验证是否引用jquery
    if (!jQuery) {
        alert('在引用 editor.js 之前，先引用jQuery，否则无法使用 editor');
        return;
    }

    // 定义扩展函数
    var _e = function (fn) {
        var E = window.EDITOR;
        if (E) {
            // 执行传入的函数
            fn(E, $);
        }
    };
    // 定义构造函数
    (function (window, $) {
        if (window.EDITOR) {
            // 重复引用
            alert('一个页面不能重复引用 editor.js ！！！');
            return;
        }

        // 编辑器（整体）构造函数
        var E = function (elem, option) {
            // 支持 id 和 element 两种形式
            if (typeof elem === 'string') {
                elem = '#' + elem;
            }

            // ---------------获取基本节点------------------
            var $elem = $(elem);
            if ($elem.length !== 1) {
                return;
            }
            this.opts = $.extend({}, E.DEFAULTS, option);
            var nodeName = $elem[0].nodeName;
            if (nodeName !== 'TEXTAREA' && nodeName !== 'DIV') {
                // 只能是 textarea 和 div ，其他类型的元素不行
                return;
            }
            this.lock = false;
            this.valueNodeName = nodeName.toLowerCase();
            this.$valueContainer = $elem;

            // 记录 elem 的 prev 和 parent（最后渲染 editor 要用到）
            this.$prev = $elem.prev();
            this.$parent = $elem.parent();

            // ------------------初始化------------------
            this.init();
        };

        E.DEFAULTS = {
            simple: false
        };

        E.fn = E.prototype;

        E.$body = $('body');
        E.$document = $(document);
        E.$window = $(window);
        E.userAgent = navigator.userAgent;
        E.getComputedStyle = window.getComputedStyle;
        E.w3cRange = typeof document.createRange === 'function';
        E.hostname = location.hostname.toLowerCase();
        E.websiteHost = 'eeditor.github.io|www.eeditor.com|eeditor.coding.me';
        E.isOnWebsite = E.websiteHost.indexOf(E.hostname) >= 0;
        E.isOnWebsite = true;
        // 暴露给全局对象
        window.Editor = window.EDITOR = E;

        // 注册 plugin 事件，用于用户自定义插件
        // 用户在引用 editor.js 之后，还可以通过 E.plugin() 注入自定义函数，
        // 该函数将会在 editor.create() 方法的最后一步执行
        E.plugin = function (fn) {
            if (!E._plugins) {
                E._plugins = [];
            }

            if (typeof fn === 'function') {
                E._plugins.push(fn);
            }
        };

    })(window, $);
    // editor 绑定事件
    _e(function (E, $) {

        // 增加 container
        E.fn.addEditorContainer = function () {
            this.$editorContainer = $('<div class="eEditor-container"></div>');
        };

        // 增加编辑区域对象
        E.fn.addTxt = function () {
            var editor = this;
            var txt = new E.Txt(editor);

            editor.txt = txt;
        };

        // 初始化 editor 默认配置
        E.fn.initDefaultConfig0 = function () {
            var editor = this;
            editor.config = $.extend({}, E.config);
        };

        E.fn.init = function () {


            this.readyFns = [];

            this.initDefaultConfig0();
            this.initDefaultConfig && this.initDefaultConfig();

            // 增加container
            if (!this.opts.simple) {
                this.addEditorContainer && this.addEditorContainer();
            }

            // 增加编辑区域
            this.addTxt && this.addTxt();

            // 处理ready事件
            this.readyHeadler();
            E.readyHeadler.call(this);

            // 初始化commandHooks
            this.commandHooks();

            this.initUi && this.initUi();
        };

        E.fn.triggerChange = function () {
            if (!this.lock) {
                this.trigger('stateChange');
            }
        };
    });
    // editor api
    _e(function (E, $) {

        // 预定义 ready 事件
        E.fn.ready = function (fn) {

            if (!this.readyFns) {

            }

            this.readyFns.push(fn);
        };

        // 处理ready事件
        E.fn.readyHeadler = function () {
            var fns = this.readyFns;

            while (fns.length) {
                fns.shift().call(this);
            }
        };

        // 更新内容到 $valueContainer
        E.fn.updateValue = function () {
            var editor = this;
            var $txt = editor.txt.$txt;

            if (editor.$valueContainer === $txt) {
                // 传入生成编辑器的div，即是编辑区域
                return;
            }

            var value = $txt.html();
            editor.$valueContainer.val(value);
        };

        // 获取初始化的内容
        E.fn.getInitValue = function () {
            var editor = this;
            var currentValue = '';
            var nodeName = editor.valueNodeName;
            if (nodeName === 'div') {
                currentValue = editor.$valueContainer.html();
            } else if (nodeName === 'textarea') {
                currentValue = editor.$valueContainer.val();
            }

            return currentValue;
        };

    });
    // selection range API
    _e(function (E, $) {

        // 用到 w3c range 的函数，如果检测到浏览器不支持 w3c range，则赋值为空函数
        var ieRange = !E.w3cRange;
        function emptyFn() {}

        // 调试用的
        E.fn.test = function () {

        };

        // 设置或读取当前的range
        E.fn.currentRange = function (cr){
            if (cr) {
                this._rangeData = cr;
            } else {
                return this._rangeData;
            }
        };

        // 将当前选区折叠
        E.fn.collapseRange = function (range, opt) {
            // opt 参数说明：'start'-折叠到开始; 'end'-折叠到结束
            opt = opt || 'end';
            opt = opt === 'start' ? true : false;

            range = range || this.currentRange();

            if (range) {
                // 合并，保存
                range.collapse(opt);
                this.currentRange(range);
            }
        };

        // 获取选区的文字
        E.fn.getRangeText = ieRange ? emptyFn : function (range) {
            range = range || this.currentRange();
            if (!range) {
                return;
            }
            return range.toString();
        };

        // 获取选区对应的DOM对象
        E.fn.getRangeElem = ieRange ? emptyFn : function (range) {
            range = range || this.currentRange();
            var dom = range.commonAncestorContainer;

            if (dom.nodeType === 1) {
                return dom;
            } else {
                return dom.parentNode;
            }
        };

        // 选区内容是否为空？
        E.fn.isRangeEmpty = ieRange ? emptyFn : function (range) {
            range = range || this.currentRange();



            if (range && range.startContainer) {
                if (range.startContainer === range.endContainer) {
                    if (range.startOffset === range.endOffset) {
                        return true;
                    }
                }
            }

            return false;
        };

        // 保存选区数据
        E.fn.saveSelection = ieRange ? emptyFn : function (range) {
            var self = this,
                _parentElem,
                selection,
                txt = self.txt.$txt.get(0);

            if (range) {
                _parentElem = range.commonAncestorContainer;
            } else {
                selection = document.getSelection();
                if (selection.getRangeAt && selection.rangeCount) {
                    range = document.getSelection().getRangeAt(0);
                    _parentElem = range.commonAncestorContainer;
                }
            }
            // 确定父元素一定要包含在编辑器区域内
            if (_parentElem && ($.contains(txt, _parentElem) || txt === _parentElem) ) {
                // 保存选择区域
                self.currentRange(range);
            }
        };

        // 恢复选中区域
        E.fn.restoreSelection = ieRange ? emptyFn : function (range) {
            var selection;

            range = range || this.currentRange();

            if (!range) {
                return;
            }

            // 使用 try catch 来防止 IE 某些情况报错
            try {
                selection = document.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (ex) {
                E.error('执行 editor.restoreSelection 时，IE可能会有异常，不影响使用');
            }
        };

        // 根据elem恢复选区
        E.fn.restoreSelectionByElem = ieRange ? emptyFn : function (elem, opt) {
            // opt参数说明：'start'-折叠到开始，'end'-折叠到结束，'all'-全部选中
            if (!elem) {
                return;
            }
            opt = opt || 'end'; // 默认为折叠到结束

            // 根据elem获取选区
            this.setRangeByElem(elem);

            // 根据 opt 折叠选区
            if (opt === 'start') {
                this.collapseRange(this.currentRange(), 'start');
            }
            if (opt === 'end') {
                this.collapseRange(this.currentRange(), 'end');
            }

            // 恢复选区
            this.restoreSelection();
        };

        // 初始化选区
        E.fn.initSelection = ieRange ? emptyFn : function () {
            var editor = this;
            if( editor.currentRange() ){
                //如果currentRange有值，则不用再初始化
                return;
            }

            var range;
            var $txt = editor.txt.$txt;
            var $firstChild = $txt.children().first();

            if ($firstChild.length) {
                editor.restoreSelectionByElem($firstChild.get(0));
            }
        };

        // 根据元素创建选区
        E.fn.setRangeByElem = ieRange ? emptyFn : function (elem) {
            var editor = this;
            var txtElem = editor.txt.$txt.get(0);
            if (!elem || !$.contains(txtElem, elem)) {
                return;
            }

            // 找到elem的第一个 textNode 和 最后一个 textNode
            var firstTextNode = elem.firstChild;
            while (firstTextNode) {
                if (firstTextNode.nodeType === 3) {
                    break;
                }
                // 继续向下
                firstTextNode = firstTextNode.firstChild;
            }
            var lastTextNode = elem.lastChild;
            while (lastTextNode) {
                if (lastTextNode.nodeType === 3) {
                    break;
                }
                // 继续向下
                lastTextNode = lastTextNode.lastChild;
            }

            var range = document.createRange();
            if (firstTextNode && lastTextNode) {
                // 说明 elem 有内容，能取到子元素
                range.setStart(firstTextNode, 0);
                range.setEnd(lastTextNode, lastTextNode.textContent.length);
            } else {
                // 说明 elem 无内容
                range.setStart(elem, 0);
                range.setEnd(elem, 0);
            }

            // 保存选区
            editor.saveSelection(range);
        };

    });

    // editor command hooks
    _e(function (E, $) {

        E.fn.commandHooks = function () {
            var editor = this;
            var commandHooks = {};

            // insertHtml
            commandHooks.insertHtml = function (html) {
                var $elem = $(html);
                var rangeElem = editor.getRangeElem();
                var targetElem;

                targetElem = editor.getLegalTags(rangeElem);
                if (!targetElem) {
                    return;
                }

                $(targetElem).after($elem);
            };

            // 保存到对象
            editor.commandHooks = commandHooks;
        };

    });
    // editor command API
    _e(function (E, $) {

        // 基本命令
        E.fn.command = function (e, commandName, commandValue, callback) {
            var editor = this;
            var hooks;

            function commandFn() {
                if (!commandName) {
                    return;
                }
                if (editor.queryCommandSupported(commandName)) {
                    // 默认命令
                    document.execCommand(commandName, false, commandValue);
                } else {
                    // hooks 命令
                    hooks = editor.commandHooks;
                    if (commandName in hooks) {
                        hooks[commandName](commandValue);
                    }
                }
            }

            this.customCommand(e, commandFn, callback);
        };

        // 针对一个elem对象执行基础命令
        E.fn.commandForElem = function (elemOpt, e, commandName, commandValue, callback) {
            // 取得查询elem的查询条件和验证函数
            var selector;
            var check;
            if (typeof elemOpt === 'string') {
                selector = elemOpt;
            } else {
                selector = elemOpt.selector;
                check = elemOpt.check;
            }

            // 查询elem
            var rangeElem = this.getRangeElem();
            rangeElem = this.getSelfOrParentByName(rangeElem, selector, check);

            // 根据elem设置range
            if (rangeElem) {
                this.setRangeByElem(rangeElem);
            }

            // 然后执行基础命令
            this.command(e, commandName, commandValue, callback);
        };

        // 自定义命令
        E.fn.customCommand = function (e, commandFn, callback) {
            var editor = this;
            var range = editor.currentRange();

            if (!range) {
                // 目前没有选区，则无法执行命令
                e && e.preventDefault();
                return;
            }
            // 记录内容，以便撤销（执行命令之前就要记录）
            editor.undoRecord && editor.undoRecord();

            // 恢复选区（有 range 参数）
            this.restoreSelection(range);

            // 执行命令事件
            commandFn.call(editor);

            // 保存选区（无参数，要从浏览器直接获取range信息）
            this.saveSelection();
            // 重新恢复选区（无参数，要取得刚刚从浏览器得到的range信息）
            this.restoreSelection();

            // 执行 callback
            if (callback && typeof callback === 'function') {
                callback.call(editor);
            }

            // 最后插入空行
            editor.txt.insertEmptyP();

            // 包裹暴露的img和text
            editor.txt.wrapImgAndText();

            // 更新内容
            editor.updateValue();

            // 更新菜单样式
            editor.updateMenuStyle && editor.updateMenuStyle(); // TODO
            editor.triggerChange();

            if (e) {
                e.preventDefault();
            }
        };

        E.fn.queryCommandState = function (cmd) {
            if (E.cmds[cmd] && E.cmds[cmd].queryState) {
                var result = E.cmds[cmd].queryState(this);
                return result;
            }

            var cmdName = cmd;
            if (E.cmds[cmd] && E.cmds[cmd].systemCmd) {
                cmdName = E.cmds[cmd].systemCmd;
            }

            var result = false;
            try {
                result = document.queryCommandState(cmdName);
            } catch (ex) {

            }
            return result;
        };

        // 封装 document.queryCommandSupported 函数
        E.fn.queryCommandSupported = function (commandName) {
            var result = false;
            try {
                result = document.queryCommandSupported(commandName);
            } catch (ex) {

            }
            return result;
        };

    });
    // dom selector
    _e(function (E, $) {

        var matchesSelector;

        // matchesSelector hook
        function _matchesSelectorForIE(selector) {
            var elem = this;
            var $elems = $(selector);
            var result = false;

            // 用jquery查找 selector 所有对象，如果其中有一个和传入 elem 相同，则证明 elem 符合 selector
            $elems.each(function () {
                if (this === elem) {
                    result = true;
                    return false;
                }
            });

            return result;
        }

        // 从当前的elem，往上去查找合法标签 如 p head table blockquote ul ol 等
        E.fn.getLegalTags = function (elem) {
            var legalTags = this.config.legalTags;
            if (!legalTags) {
                E.error('配置项中缺少 legalTags 的配置');
                return;
            }
            return this.getSelfOrParentByName(elem, legalTags);
        };

        // 根据条件，查询自身或者父元素，符合即返回
        E.fn.getSelfOrParentByName = function (elem, selector, check) {

            if (!elem || !selector) {
                return;
            }

            if (!matchesSelector) {
                // 定义 matchesSelector 函数
                matchesSelector = elem.webkitMatchesSelector ||
                                  elem.mozMatchesSelector ||
                                  elem.oMatchesSelector ||
                                  elem.matchesSelector;
            }
            if (!matchesSelector) {
                // 如果浏览器本身不支持 matchesSelector 则使用自定义的hook
                matchesSelector = _matchesSelectorForIE;
            }

            var txt = this.txt.$txt.get(0);

            while (elem && txt !== elem && $.contains(txt, elem)) {
                if (matchesSelector.call(elem, selector)) {
                    // 符合 selector 查询条件

                    if (!check) {
                        // 没有 check 验证函数，直接返回即可
                        return elem;
                    }

                    if (check(elem)) {
                        // 如果有 check 验证函数，还需 check 函数的确认
                        return elem;
                    }
                }

                // 如果上一步没经过验证，则将跳转到父元素
                elem = elem.parentNode;
            }

            return;
        };

    });

    // 工具函数
    _e(function (E, $) {

        // console.log && console.warn && console.error
        var console = window.console;
        var emptyFn = function () {};
        $.each(['info', 'log', 'warn', 'error'], function (key, value) {
            if (console == null) {
                E[value] = emptyFn;
            } else {
                E[value] = function (info) {
                    // 通过配置来控制打印输出
                    if (E.config && E.config.printLog) {
                        console[value]('editor提示: ' + info);
                    }
                };
            }
        });

        // 获取随机数
        E.random = function () {
            return Math.random().toString().slice(2);
        };
    });
    // 语言包
    _e(function (E, $) {
        E.langs = {};

        // 中文
        E.langs['zh-cn'] = {
            bold: '粗体',
            underline: '下划线',
            italic: '斜体',
            forecolor: '文字颜色',
            bgcolor: '背景色',
            strikethrough: '删除线',
            eraser: '清空格式',
            source: '源码',
            quote: '引用',
            fontfamily: '字体',
            fontsize: '字号',
            head: '标题',
            orderlist: '有序列表',
            unorderlist: '无序列表',
            alignleft: '左对齐',
            aligncenter: '居中',
            alignright: '右对齐',
            link: '链接',
            text: '文本',
            submit: '提交',
            cancel: '取消',
            unlink: '取消链接',
            table: '表格',
            emotion: '表情',
            img: '图片',
            video: '视频',
            'width': '宽',
            'height': '高',
            location: '位置',
            loading: '加载中',
            searchlocation: '搜索位置',
            dynamicMap: '动态地图',
            clearLocation: '清除位置',
            langDynamicOneLocation: '动态地图只能显示一个位置',
            insertcode: '插入代码',
            undo: '撤销',
            redo: '重复',
            fullscreen: '全屏',
            openLink: '打开链接'
        };

        // 英文
        E.langs.en = {
            bold: 'Bold',
            underline: 'Underline',
            italic: 'Italic',
            forecolor: 'Color',
            bgcolor: 'Backcolor',
            strikethrough: 'Strikethrough',
            eraser: 'Eraser',
            source: 'Codeview',
            quote: 'Quote',
            fontfamily: 'Font family',
            fontsize: 'Font size',
            head: 'Head',
            orderlist: 'Ordered list',
            unorderlist: 'Unordered list',
            alignleft: 'Align left',
            aligncenter: 'Align center',
            alignright: 'Align right',
            link: 'Insert link',
            text: 'Text',
            submit: 'Submit',
            cancel: 'Cancel',
            unlink: 'Unlink',
            table: 'Table',
            emotion: 'Emotions',
            img: 'Image',
            video: 'Video',
            'width': 'width',
            'height': 'height',
            location: 'Location',
            loading: 'Loading',
            searchlocation: 'search',
            dynamicMap: 'Dynamic',
            clearLocation: 'Clear',
            langDynamicOneLocation: 'Only one location in dynamic map',
            insertcode: 'Insert Code',
            undo: 'Undo',
            redo: 'Redo',
            fullscreen: 'Full screnn',
            openLink: 'open link'
        };
    });
    // 全局配置
    _e(function (E, $) {

        E.config = {};

        // 全屏时的 z-index
        E.config.zindex = 10000;

        // 是否打印log
        E.config.printLog = true;

        // 编辑源码时，过滤 javascript
        E.config.jsFilter = true;

        // 编辑器允许的标签
        E.config.legalTags = 'p,h1,h2,h3,h4,h5,h6,blockquote,table,ul,ol,pre';

        // 语言包
        E.config.lang = E.langs['zh-cn'];






        // 是否过滤粘贴内容
        E.config.pasteFilter = true;

        // 是否粘贴纯文本，当 editor.config.pasteFilter === false 时候，此配置将失效
        E.config.pasteText = false;
    });

    // txt 构造函数
    _e(function (E, $) {

        // 定义构造函数
        var Txt = function (editor) {
            this.editor = editor;

            // 初始化
            this.init();
        };

        Txt.fn = Txt.prototype;

        E.Txt = Txt;
    });
    // Txt.fn bind fn
    _e(function (E, $) {

        var Txt = E.Txt;

        // 初始化
        Txt.fn.init = function () {
            var self = this;
            var editor = self.editor;
            var $valueContainer = editor.$valueContainer;
            var currentValue = editor.getInitValue();
            var $txt;

            if ($valueContainer.get(0).nodeName === 'DIV') {
                // 如果传入生成编辑器的元素就是div，则直接使用
                $txt = $valueContainer;
                $txt.addClass("eEditor-txt");
                $txt.attr('contentEditable', 'true');
                console.log('是');
            } else {
                console.log('不是');
                // 如果不是div（是textarea），则创建一个div
                $txt = $(
                    '<div class="eEditor-txt" contentEditable="true">' +
                    currentValue +
                    '</div>'
                );
            }

            // 试图最后插入一个空行，ready之后才行
            editor.ready(function () {
                self.insertEmptyP();
            });

            self.$txt = $txt;

            // 删除时，如果没有内容了，就添加一个 <p><br></p>
            self.contentEmptyHandle();

            // enter时，不能使用 div 换行
            self.bindEnterForDiv();

            // enter时，用 p 包裹 text
            self.bindEnterForText();

            // tab 插入4个空格
            self.bindTabEvent();

            // 处理粘贴内容
            self.bindPasteFilter();

            // $txt.formatText() 方法
            self.bindFormatText();

            // 定义 $txt.html() 方法
            self.bindHtml();
        };

        // 删除时，如果没有内容了，就添加一个 <p><br></p>
        Txt.fn.contentEmptyHandle = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;
            var $p;

            $txt.on('keydown.ui.editor', function (e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var txtHtml = $.trim($txt.html().toLowerCase());
                if (txtHtml === '<p><br></p>') {
                    // 如果最后还剩余一个空行，就不再继续删除了
                    e.preventDefault();
                    return;
                }
            });

            $txt.on('keyup.ui.editor', function (e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var txtHtml = $.trim($txt.html().toLowerCase());
                // ff时用 txtHtml === '<br>' 判断，其他用 !txtHtml 判断
                if (!txtHtml || txtHtml === '<br>') {
                    // 内容空了
                    $p = $('<p><br/></p>');
                    $txt.html(''); // 一定要先清空，否则在 ff 下有问题
                    $txt.append($p);
                    editor.restoreSelectionByElem($p.get(0));
                }
            });
        };

        // enter时，不能使用 div 换行
        Txt.fn.bindEnterForDiv = function () {
            var tags = E.config.legalTags; // 配置中编辑器要求的合法标签，如 p head table blockquote ul ol 等
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;

            var $keydownDivElem;
            function divHandler() {
                if (!$keydownDivElem) {
                    return;
                }

                var $pElem = $('<p>' + $keydownDivElem.html() + '</p>');
                $keydownDivElem.after($pElem);
                $keydownDivElem.remove();
            }

            $txt.on('keydown.ui.editor keyup.ui.editor', function (e) {
                if (e.keyCode !== 13) {
                    return;
                }
                // 查找合法标签
                var rangeElem = editor.getRangeElem();
                var targetElem = editor.getLegalTags(rangeElem);
                var $targetElem;
                var $pElem;

                if (!targetElem) {
                    // 没找到合法标签，就去查找 div
                    targetElem = editor.getSelfOrParentByName(rangeElem, 'div');
                    if (!targetElem) {
                        return;
                    }
                    $targetElem = $(targetElem);

                    if (e.type === 'keydown') {
                        // 异步执行（同步执行会出现问题）
                        $keydownDivElem = $targetElem;
                        setTimeout(divHandler, 0);
                    }

                    if (e.type === 'keyup') {
                        // 将 div 的内容移动到 p 里面，并移除 div
                        $pElem = $('<p>' + $targetElem.html() + '</p>');
                        $targetElem.after($pElem);
                        $targetElem.remove();

                        // 如果是回车结束，将选区定位到行首
                        editor.restoreSelectionByElem($pElem.get(0), 'start');
                    }
                }
            });
        };

        // enter时，用 p 包裹 text
        Txt.fn.bindEnterForText = function () {
            var self = this;
            var $txt = self.$txt;
            var handle;
            $txt.on('keyup.ui.editor', function (e) {
                if (e.keyCode !== 13) {
                    return;
                }
                if (!handle) {
                    handle = function() {
                        self.wrapImgAndText();
                    };
                }
                setTimeout(handle);
            });
        };

        // tab 时，插入4个空格
        Txt.fn.bindTabEvent = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;

            $txt.on('keydown.ui.editor', function (e) {
                if (e.keyCode !== 9) {
                    // 只监听 tab 按钮
                    return;
                }
                // 如果浏览器支持 insertHtml 则插入4个空格。如果不支持，就不管了
                if (editor.queryCommandSupported('insertHtml')) {
                    editor.command(e, 'insertHtml', '&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            });
        };

        // 处理粘贴内容
        Txt.fn.bindPasteFilter = function () {
            var self = this;
            var editor = self.editor;
            var resultHtml = '';  //存储最终的结果
            var $txt = self.$txt;
            var legalTags = editor.config.legalTags;
            var legalTagArr = legalTags.split(',');

            $txt.on('paste.ui.editor', function (e) {
                if (!editor.config.pasteFilter) {
                    // 配置中取消了粘贴过滤
                    return;
                }

                var currentNodeName = editor.getRangeElem().nodeName;
                if (currentNodeName === 'TD' || currentNodeName === 'TH') {
                    // 在表格的单元格中粘贴，忽略所有内容。否则会出现异常情况
                    return;
                }

                resultHtml = ''; // 先清空 resultHtml

                var pasteHtml, $paste;
                var data = e.clipboardData || e.originalEvent.clipboardData;
                var ieData = window.clipboardData;

                if (editor.config.pasteText) {
                    // 只粘贴纯文本

                    if (data && data.getData) {
                        // w3c
                        pasteHtml = data.getData('text/plain');
                    } else if (ieData && ieData.getData) {
                        // IE
                        pasteHtml = ieData.getData('text');
                    } else {
                        // 其他情况
                        return;
                    }

                    // 拼接为 <p> 标签
                    if (pasteHtml) {
                        resultHtml = '<p>' + pasteHtml + '</p>';
                    }

                } else {
                    // 粘贴过滤了样式的、只有标签的 html

                    if (data && data.getData) {
                        // w3c

                        // 获取粘贴过来的html
                        pasteHtml = data.getData('text/html');
                        if (pasteHtml) {
                            // 创建dom
                            $paste = $('<div>' + pasteHtml + '</div>');
                            // 处理，并将结果存储到 resultHtml 『全局』变量
                            handle($paste.get(0));
                        } else {
                            // 得不到html，试图获取text
                            pasteHtml = data.getData('text/plain');
                            if (pasteHtml) {
                                // 替换特殊字符
                                pasteHtml = pasteHtml.replace(/[ ]/g, '&nbsp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/\n/g, '</p><p>');
                                // 拼接
                                resultHtml = '<p>' + pasteHtml + '</p>';

                                // 查询链接
                                resultHtml = resultHtml.replace(/<p>(https?:\/\/.*?)<\/p>/ig, function (match, link) {
                                    return '<p><a href="' + link + '" target="_blank">' + link + '</p>';
                                });
                            }
                        }

                    } else if (ieData && ieData.getData) {
                        // IE 直接从剪切板中取出纯文本格式
                        resultHtml = ieData.getData('text');
                        if (!resultHtml) {
                            return;
                        }
                        // 拼接为 <p> 标签
                        resultHtml = '<p>' + resultHtml + '</p>';
                        resultHtml = resultHtml.replace(new RegExp('\n', 'g'), '</p><p>');
                    } else {
                        // 其他情况
                        return;
                    }
                }

                // 执行命令
                if (resultHtml) {
                    editor.command(e, 'insertHtml', resultHtml);

                    // 删除内容为空的 p 和嵌套的 p
                    self.clearEmptyOrNestP();
                }
            });

            // 处理粘贴的内容
            function handle(elem) {
                if (!elem || !elem.nodeType || !elem.nodeName) {
                    return;
                }
                var $elem;
                var nodeName = elem.nodeName.toLowerCase();
                var nodeType = elem.nodeType;

                // 只处理文本和普通node标签
                if (nodeType !== 3 && nodeType !== 1) {
                    return;
                }

                $elem = $(elem);

                // 如果是容器，则继续深度遍历
                if (nodeName === 'div') {
                    $.each(elem.childNodes, function () {
                        // elem.childNodes 可获取TEXT节点，而 $elem.children() 就获取不到
                        handle(this);
                    });
                    return;
                }

                if (legalTagArr.indexOf(nodeName) >= 0) {
                    // 如果是合法标签之内的，则根据元素类型，获取值
                    resultHtml += getResult(elem);
                } else if (nodeType === 3) {
                    // 如果是文本，则直接插入 p 标签
                    resultHtml += '<p>' + elem.textContent + '</p>';
                } else if (nodeName === 'br') {
                    // <br>保留
                    resultHtml += '<br/>';
                }
                else {
                    // 忽略的标签
                    if (['meta', 'style', 'script', 'object', 'form', 'iframe', 'hr'].indexOf(nodeName) >= 0) {
                        return;
                    }
                    // 其他标签，移除属性，插入 p 标签
                    $elem = $(removeAttrs(elem));
                    // 注意，这里的 clone() 是必须的，否则会出错
                    resultHtml += $('<div>').append($elem.clone()).html();
                }
            }

            // 获取元素的结果
            function getResult(elem) {
                var nodeName = elem.nodeName.toLowerCase();
                var $elem;
                var htmlForP = '';
                var htmlForLi = '';

                if (['blockquote'].indexOf(nodeName) >= 0) {

                    // 直接取出元素text即可
                    $elem = $(elem);
                    return '<' + nodeName + '>' + $elem.text() + '</' + nodeName + '>';

                } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5'].indexOf(nodeName) >= 0) {

                    //p head 取出 text 和链接
                    elem = removeAttrs(elem);
                    $elem = $(elem);
                    htmlForP = $elem.html();

                    // 剔除 a img 之外的元素
                    htmlForP = htmlForP.replace(/<.*?>/ig, function (tag) {
                        if (tag === '</a>' || tag.indexOf('<a ') === 0 || tag.indexOf('<img ') === 0) {
                            return tag;
                        } else {
                            return '';
                        }
                    });

                    return '<' + nodeName + '>' + htmlForP + '</' + nodeName + '>';

                } else if (['ul', 'ol'].indexOf(nodeName) >= 0) {

                    // ul ol元素，获取子元素（li元素）的text link img，再拼接
                    $elem = $(elem);
                    $elem.children().each(function () {
                        var $li = $(removeAttrs(this));
                        var html = $li.html();

                        html = html.replace(/<.*?>/ig, function (tag) {
                            if (tag === '</a>' || tag.indexOf('<a ') === 0 || tag.indexOf('<img ') === 0) {
                                return tag;
                            } else {
                                return '';
                            }
                        });

                        htmlForLi += '<li>' + html + '</li>';
                    });
                    return '<' + nodeName + '>' + htmlForLi + '</' + nodeName + '>';

                } else {

                    // 其他元素，移除元素属性
                    $elem = $(removeAttrs(elem));
                    return $('<div>').append($elem).html();
                }
            }

            // 移除一个元素（子元素）的attr
            function removeAttrs(elem) {
                var attrs = elem.attributes || [];
                var attrNames = [];
                var exception = ['href', 'target', 'src', 'alt', 'rowspan', 'colspan']; //例外情况

                // 先存储下elem中所有 attr 的名称
                $.each(attrs, function (key, attr) {
                    if (attr && attr.nodeType === 2) {
                        attrNames.push(attr.nodeName);
                    }
                });
                // 再根据名称删除所有attr
                $.each(attrNames, function (key, attr) {
                    if (exception.indexOf(attr) < 0) {
                        // 除了 exception 规定的例外情况，删除其他属性
                        elem.removeAttribute(attr);
                    }
                });


                // 递归子节点
                var children = elem.childNodes;
                if (children.length) {
                    $.each(children, function (key, value) {
                        removeAttrs(value);
                    });
                }

                return elem;
            }
        };

        // 绑定 $txt.formatText() 方法
        Txt.fn.bindFormatText = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;
            var legalTags = E.config.legalTags;
            var legalTagArr = legalTags.split(',');
            var length = legalTagArr.length;
            var regArr = [];

            // 将 E.config.legalTags 配置的有效字符，生成正则表达式
            $.each(legalTagArr, function (k, tag) {
                var reg = '\>\\s*\<(' + tag + ')\>';
                regArr.push(new RegExp(reg, 'ig'));
            });

            // 增加 li
            regArr.push(new RegExp('\>\\s*\<(li)\>', 'ig'));

            // 增加 tr
            regArr.push(new RegExp('\>\\s*\<(tr)\>', 'ig'));

            // 增加 code
            regArr.push(new RegExp('\>\\s*\<(code)\>', 'ig'));

            // 生成 formatText 方法
            $txt.formatText = function () {
                var $temp = $('<div>');
                var html = $txt.html();

                // 去除空格
                html = html.replace(/\s*</ig, '<');

                // 段落、表格之间换行
                $.each(regArr, function (k, reg) {
                    if (!reg.test(html)) {
                        return;
                    }
                    html = html.replace(reg, function (matchStr, tag) {
                        return '>\n<' + tag + '>';
                    });
                });

                $temp.html(html);
                return $temp.text();
            };
        };

        // 定制 $txt.html 方法
        Txt.fn.bindHtml = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;
            var $valueContainer = editor.$valueContainer;
            var valueNodeName = editor.valueNodeName;

            $txt.html = function (html) {
                var result;

                if (valueNodeName === 'div') {
                    // div 生成的编辑器，取值、赋值，都直接触发jquery的html方法
                    result = $.fn.html.call($txt, html);
                }

                // textarea 生成的编辑器，则需要考虑赋值时，也给textarea赋值

                if (html === undefined) {
                    // 取值，直接触发jquery原生html方法
                    result = $.fn.html.call($txt);

                    // 替换 html 中，src和href属性中的 & 字符。
                    // 因为 .html() 或者 .innerHTML 会把所有的 & 字符都改成 &amp; 但是 src 和 href 中的要保持 &
                    result = result.replace(/(href|src)\=\"(.*)\"/igm, function (a, b, c) {
                        return b + '="' + c.replace('&amp;', '&') + '"';
                    });
                } else {
                    // 赋值，需要同时给 textarea 赋值
                    result = $.fn.html.call($txt, html);
                    $valueContainer.val(html);
                }

                if (html === undefined) {
                    return result;
                } else {
                    // 手动触发 change 事件，因为 $txt 监控了 change 事件来判断是否需要执行 editor.onchange
                    $txt.change();
                }
            };
        };
    });
    // Txt.fn api
    _e(function (E, $) {

        var Txt = E.Txt;

        var txtChangeEventNames = 'propertychange change click keyup input paste';

        // 计算高度
        Txt.fn.initHeight = function () {
            var editor = this.editor;
            var $txt = this.$txt;
            var valueContainerHeight = editor.$valueContainer.height();
            var menuHeight = editor.menuContainer.height();
            var txtHeight = valueContainerHeight - menuHeight;

            // 限制最小为 50px
            txtHeight = txtHeight < 50 ? 50 : txtHeight;

            $txt.height(txtHeight);

            // 记录原始高度
            editor.valueContainerHeight = valueContainerHeight;

            // 设置 max-height
            this.initMaxHeight(txtHeight, menuHeight);
        };

        // 计算最大高度
        Txt.fn.initMaxHeight = function (txtHeight, menuHeight) {
            var editor = this.editor;
            var $menuContainer = editor.menuContainer.$menuContainer;
            var $txt = this.$txt;
            var $wrap = $('<div>');

            // 需要浏览器支持 max-height，否则不管
            if (window.getComputedStyle && 'max-height'in window.getComputedStyle($txt.get(0))) {
                // 获取 max-height 并判断是否有值
                var maxHeight = parseInt(editor.$valueContainer.css('max-height'));
                if (isNaN(maxHeight)) {
                    return;
                }

                // max-height 和『全屏』暂时有冲突
                if (editor.menus.fullscreen) {
                    E.warn('max-height和『全屏』菜单一起使用时，会有一些问题尚未解决，请暂时不要两个同时使用');
                    return;
                }

                // 标记
                editor.useMaxHeight = true;

                // 设置maxheight
                $wrap.css({
                    'max-height': (maxHeight - menuHeight) + 'px',
                    'overflow-y': 'auto'
                });
                $txt.css({
                    'height': 'auto',
                    'overflow-y': 'visible',
                    'min-height': txtHeight + 'px'
                });

                // 滚动式，菜单阴影
                $wrap.on('scroll', function () {
                    if ($txt.parent().scrollTop() > 10) {
                        $menuContainer.addClass('eEditor-menu-shadow');
                    } else {
                        $menuContainer.removeClass('eEditor-menu-shadow');
                    }
                });

                if (!this.opts.simple) {
                    // 需在编辑器区域外面再包裹一层
                    $txt.wrap($wrap);
                }

            }
        };

        // 保存选区
        Txt.fn.saveSelectionEvent = function () {
            var $txt = this.$txt;
            var editor = this.editor;
            var timeoutId;
            var dt = Date.now();

            function save() {
                editor.saveSelection();
            }

            // 同步保存选区
            function saveSync() {
                // 100ms之内，不重复保存
                if (Date.now() - dt < 100) {
                    return;
                }

                dt = Date.now();
                save();
            }

            // 异步保存选区
            function saveAync() {
                // 节流，防止高频率重复操作
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(save, 300);
            }

            // txt change 、focus、blur 时随时保存选区
            $txt.on(txtChangeEventNames + ' focus blur', function (e) {
                // 先同步保存选区，为了让接下来就马上要执行 editor.getRangeElem() 的程序
                // 能够获取到正确的 rangeElem
                saveSync();

                // 再异步保存选区，为了确定更加准确的选区，为后续的操作做准备
                saveAync();
            });

            // 鼠标拖拽选择时，可能会拖拽到编辑器区域外面再松手，此时 $txt 就监听不到 click事件了
            $txt.on('mousedown.ui.editor', function () {
                $txt.on('mouseleave.saveSelection', function (e) {
                    // 先同步后异步，如上述注释
                    saveSync();
                    saveAync();

                    // 顺道吧菜单状态也更新了
                    editor.updateMenuStyle && editor.updateMenuStyle();
                    editor.triggerChange();
                });
            }).on('mouseup.ui.editor', function () {
                $txt.off('mouseleave.saveSelection');
            });

        };

        // 随时更新 value
        Txt.fn.updateValueEvent = function () {
            var $txt = this.$txt;
            var editor = this.editor;
            var timeoutId, oldValue;

            // 触发 onchange 事件
            function doOnchange() {
                var val = $txt.html();
                if (oldValue === val) {
                    // 无变化
                    return;
                }

                // 触发 onchange 事件
                if (editor.onchange && typeof editor.onchange === 'function') {
                    editor.onchange.call(editor);
                }

                // 更新内容
                editor.updateValue();

                // 记录最新内容
                oldValue = val;
            }

            // txt change 时随时更新内容
            $txt.on(txtChangeEventNames, function (e) {
                // 初始化
                if (oldValue == null) {
                    oldValue = $txt.html();
                }

                // 监控内容变化（停止操作 100ms 之后立即执行）
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(doOnchange, 100);
            });
        };

        // 随时更新 menustyle
        Txt.fn.updateMenuStyleEvent = function () {
            var $txt = this.$txt;
            var editor = this.editor;

            // txt change 时随时更新内容
            $txt.on(txtChangeEventNames, function (e) {
                editor.updateMenuStyle && editor.updateMenuStyle (); // TODO
                editor.triggerChange();
            });
        };

        // 最后插入试图插入 <p><br><p>
        Txt.fn.insertEmptyP = function () {
            var $txt = this.$txt;
            var $children = $txt.children();

            if ($children.length === 0) {
                $txt.append($('<p><br></p>'));
                return;
            }

            if ($.trim($children.last().html()).toLowerCase() !== '<br>') {
                $txt.append($('<p><br></p>'));
            }
        };

        // 将编辑器暴露出来的文字和图片，都用 p 来包裹
        Txt.fn.wrapImgAndText = function () {
            var $txt = this.$txt;
            var $imgs = $txt.children('img');
            var txt = $txt[0];
            var childNodes = txt.childNodes;
            var childrenLength = childNodes.length;
            var i, childNode, p;

            // 处理图片
            $imgs.length && $imgs.each(function () {
                $(this).wrap('<p>');
            });

            // 处理文字
            for (i = 0; i < childrenLength; i++) {
                childNode = childNodes[i];
                if (childNode.nodeType === 3 && childNode.textContent && $.trim(childNode.textContent)) {
                    $(childNode).wrap('<p>');
                }
            }
        };

        // 清空内容为空的<p>，以及重复包裹的<p>（在windows下的chrome粘贴文字之后，会出现上述情况）
        Txt.fn.clearEmptyOrNestP = function () {
            var $txt = this.$txt;
            var $pList = $txt.find('p');

            $pList.each(function () {
                var $p = $(this);
                var $children = $p.children();
                var childrenLength = $children.length;
                var $firstChild;
                var content = $.trim($p.html());

                // 内容为空的p
                if (!content) {
                    $p.remove();
                    return;
                }

                // 嵌套的p
                if (childrenLength === 1) {
                    $firstChild = $children.first();
                    if ($firstChild.get(0) && $firstChild.get(0).nodeName === 'P') {
                        $p.html( $firstChild.html() );
                    }
                }
            });
        };

        // 获取 scrollTop
        Txt.fn.scrollTop = function (val) {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;

            if (editor.useMaxHeight) {
                return $txt.parent().scrollTop(val);
            } else {
                return $txt.scrollTop(val);
            }
        };

        // 鼠标hover时候，显示p、head的高度
        Txt.fn.showHeightOnHover = function () {
            var editor = this.editor;
            var $editorContainer = editor.$editorContainer;
            var menuContainer = editor.menuContainer;
            var $txt = this.$txt;
            var $tip = $('<i class="height-tip"><i>');
            var isTipInTxt = false;

            function addAndShowTip($target) {
                if (!isTipInTxt) {
                    $editorContainer.append($tip);
                    isTipInTxt = true;
                }

                var txtTop = $txt.position().top;
                var txtHeight = $txt.outerHeight();

                var height = $target.height();
                var top = $target.position().top;
                var marginTop = parseInt($target.css('margin-top'), 10);
                var paddingTop = parseInt($target.css('padding-top'), 10);
                var marginBottom = parseInt($target.css('margin-bottom'), 10);
                var paddingBottom = parseInt($target.css('padding-bottom'), 10);

                // 计算初步的结果
                var resultHeight = height + paddingTop + marginTop + paddingBottom + marginBottom;
                var resultTop = top + menuContainer.height();

                // var spaceValue;

                // // 判断是否超出下边界
                // spaceValue = (resultTop + resultHeight) - (txtTop + txtHeight);
                // if (spaceValue > 0) {
                //     resultHeight = resultHeight - spaceValue;
                // }

                // // 判断是否超出了下边界
                // spaceValue = txtTop > resultTop;
                // if (spaceValue) {
                //     resultHeight = resultHeight - spaceValue;
                //     top = top + spaceValue;
                // }

                // 按照最终结果渲染
                $tip.css({
                    height: height + paddingTop + marginTop + paddingBottom + marginBottom,
                    top: top + menuContainer.height()
                });
            }
            function removeTip() {
                if (!isTipInTxt) {
                    return;
                }
                $tip.remove();
                isTipInTxt = false;
            }

            $txt.on('mouseenter.ui.editor', 'ul,ol,blockquote,p,h1,h2,h3,h4,h5,table,pre', function (e) {
                addAndShowTip($(e.currentTarget));
            }).on('mouseleave.ui.editor', function () {
                removeTip();
            });
        };

    });

    // 暴露给用户的 API
    _e(function (E, $) {

        // 创建编辑器
        E.fn.create = function () {
            var editor = this;

            // 检查 E.$body 是否有值
            // 如果在 body 之前引用了 js 文件，body 尚未加载，可能没有值
            if (!E.$body || E.$body.length === 0) {
                E.$body = $('body');
                E.$document = $(document);
                E.$window = $(window);
            }




            editor.createMenu && editor.createMenu();
            editor.eventTxt();
            editor.renderTxt();
            editor.renderEditorContainer();

            // 初始化选区
            editor.initSelection();

            // $txt 快捷方式
            editor.$txt = editor.txt.$txt;

            // 执行用户自定义事件，通过 E.ready() 添加
            var _plugins = E._plugins;
            if (_plugins && _plugins.length) {
                $.each(_plugins, function (k, val) {
                    val.call(editor);
                });
            }

            this.trigger('ready');
        };

        // 禁用编辑器
        E.fn.disable = function () {
            this.txt.$txt.removeAttr('contenteditable');
            this.disableMenusExcept();

            // 先禁用，再记录状态
            this._disabled = true;
        };
        // 启用编辑器
        E.fn.enable = function () {
            // 先解除状态记录，再启用
            this._disabled = false;
            this.txt.$txt.attr('contenteditable', 'true');
            this.enableMenusExcept();
        };

        // 销毁编辑器
        E.fn.destroy = function () {
            var $valueContainer = this.$valueContainer;
            var $editorContainer = this.$editorContainer;
            var valueNodeName = this.valueNodeName;

            if (this.opts.simple) {
                $valueContainer.removeAttr('contenteditable');
            } else {
                if (valueNodeName === 'div') {
                    // div 生成的编辑器
                    $valueContainer.removeAttr('contenteditable');
                    $editorContainer.after($valueContainer);
                    $editorContainer.hide();
                } else {
                    // textarea 生成的编辑器
                    $valueContainer.show();
                    $editorContainer.hide();
                }
            }

            var $txt = this.txt.$txt;
            $txt.children().last().remove(); // 删除末尾空行
            $txt.removeClass('eEditor-txt');
            $txt.off('.ui.editor');
        };

        // 清空内容的快捷方式
        E.fn.clear = function () {
            var editor = this;
            var $txt = editor.txt.$txt;
            $txt.html('<p><br></p>');
            editor.restoreSelectionByElem($txt.find('p').get(0));
        };

        // 渲染 txt
        E.fn.renderTxt = function () {

            var txt = this.txt;

            if (!this.opts.simple) {
                var $editorContainer = this.$editorContainer;
                $editorContainer.append(this.$txt);
            }

            // ready 时候，计算txt的高度
            this.ready(function () {
                txt.initHeight();
            });
        };

        // 编辑区域事件
        E.fn.eventTxt = function () {

            var txt = this.txt;

            // txt内容变化时，保存选区
            txt.saveSelectionEvent();

            // txt内容变化时，随时更新 value
            txt.updateValueEvent();

            // txt内容变化时，随时更新 menu style
            txt.updateMenuStyleEvent();

            // // 鼠标hover时，显示 p head 高度（暂时关闭这个功能）
            // if (!/ie/i.test(E.userAgent)) {
            //     // 暂时不支持IE
            //     txt.showHeightOnHover();
            // }
        };

        // 渲染 container
        E.fn.renderEditorContainer = function () {

            var editor = this;
            var $valueContainer = editor.$valueContainer;
            var $editorContainer = editor.$editorContainer;
            var $txt = editor.txt.$txt;
            var $prev, $parent;

            // 将编辑器渲染到页面中
            if ($valueContainer === $txt) {
                $prev = editor.$prev;
                $parent = editor.$parent;

                if ($prev && $prev.length) {
                    // 有前置节点，就插入到前置节点的后面
                    $prev.after($editorContainer);
                } else {
                    // 没有前置节点，就直接插入到父元素
                    $parent.prepend($editorContainer);
                }

            } else {
                $valueContainer.after($editorContainer);
                $valueContainer.hide();
            }

            // 设置宽度（这样设置宽度有问题）
            // $editorContainer.css('width', $valueContainer.css('width'));
        };
    });

    return window.EDITOR;
});

/**
 * 插入地图
 */
;(function () {
    var E = window.EDITOR;

    E.cmds = {}; // 所有命令

    E.addCommand = function (cmd) {
        E.cmds[cmd.name] = {
            name: cmd.name,
            value: null,
            handler: cmd.handler,
            queryState: cmd.queryState
        };
    };

    E.fn.execCommand = function (cmd, value) {
        if (E.cmds[cmd]) {
            E.cmds[cmd].handler.call(this, this, value);
        }
    };

    E.fn.queryCommandValue = function (cmd) {
        var cmdName = cmd;
        if (E.cmds[cmd] && E.cmds[cmd].systemCmd) {
            cmdName = E.cmds[cmd].systemCmd;
        }

        var result = '';
        try {
            result = document.queryCommandValue(cmdName);
        } catch (ex) {

        }
        return result;
    };
}());

// 事件及自定义事件的支持
;(function () {
    var E = window.EDITOR;


    E.fn.on = function (eventName, hanlder) {
        if (!this.eventHandlers) {
            this.eventHandlers = {};
        }
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(hanlder);
    };

    E.fn.trigger = function (eventName) {
        if (this.eventHandlers && this.eventHandlers[eventName]) {
            var hadnlers = this.eventHandlers[eventName];
            for (var i = 0; i < hadnlers.length; i++) {
                hadnlers[i]();
            }
        }
    };

    // 预定义 ready 事件
    E.ready = function (fn) {

        if (!E.readyFns) {
            E.readyFns = [];
        }

        E.readyFns.push(fn);
    };

    // 处理ready事件
    E.readyHeadler = function () {
        var fns = E.readyFns;

        if (fns) {
            for (var i = 0; i < fns.length; i++) {
                fns[i].call(this);
            }
            /* while (fns.length) {
             fns.shift().call(this);
             }*/
        }

    };
}());

