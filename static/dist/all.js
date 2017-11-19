/*! eUI - v1.0.0 */(function (factory) {
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

;
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
;;(function ($) {

    var E = window.EDITOR;

    // 定义扩展函数
    var _e = function (fn) {
        var E = window.EDITOR;
        if (E) {
            // 执行传入的函数
            fn(E, $);
        }
    };

    // undo redo
    _e(function (E, $) {

        var length = 20;  // 缓存的最大长度
        function _getRedoList(editor) {
            if (editor._redoList == null) {
                editor._redoList = [];
            }
            return editor._redoList;
        }
        function _getUndoList(editor) {
            if (editor._undoList == null) {
                editor._undoList = [];
            }
            return editor._undoList;
        }

        // 数据处理
        function _handle(editor, data, type) {
            // var range = data.range;
            // var range2 = range.cloneRange && range.cloneRange();
            var val = data.val;
            var html = editor.txt.$txt.html();

            if(val == null) {
                return;
            }

            if (val === html) {
                if (type === 'redo') {
                    editor.redo();
                    return;
                } else if (type === 'undo') {
                    editor.undo();
                    return;
                } else {
                    return;
                }
            }

            // 保存数据
            editor.txt.$txt.html(val);
            // 更新数据到textarea（有必要的话）
            editor.updateValue();

            // onchange 事件
            if (editor.onchange && typeof editor.onchange === 'function') {
                editor.onchange.call(editor);
            }

            // ?????
            // 注释：$txt 被重新赋值之后，range会被重置，cloneRange() 也不好使
            // // 重置选区
            // if (range2) {
            //     editor.restoreSelection(range2);
            // }
        }

        // 记录
        E.fn.undoRecord = function () {
            var editor = this;
            var $txt = editor.txt.$txt;
            var val = $txt.html();
            var undoList = _getUndoList(editor);
            var redoList = _getRedoList(editor);
            var currentVal = undoList.length ? undoList[0] : '';

            if (val === currentVal.val) {
                return;
            }

            // 清空 redolist
            if (redoList.length) {
                redoList = [];
            }

            // 添加数据到 undoList
            undoList.unshift({
                range: editor.currentRange(),  // 将当前的range也记录下
                val: val
            });

            // 限制 undoList 长度
            if (undoList.length > length) {
                undoList.pop();
            }
        };

        // undo 操作
        E.fn.undo = function () {
            var editor = this;
            var undoList = _getUndoList(editor);
            var redoList = _getRedoList(editor);

            if (!undoList.length) {
                return;
            }

            // 取出 undolist 第一个值，加入 redolist
            var data = undoList.shift();
            redoList.unshift(data);

            // 并修改编辑器的内容
            _handle(this, data, 'undo');
        };

        // redo 操作
        E.fn.redo = function () {
            var editor = this;
            var undoList = _getUndoList(editor);
            var redoList = _getRedoList(editor);
            if (!redoList.length) {
                return;
            }

            // 取出 redolist 第一个值，加入 undolist
            var data = redoList.shift();
            undoList.unshift(data);

            // 并修改编辑器的内容
            _handle(this, data, 'redo');
        };
    });

}(jQuery));;/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright 2015 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});;;(function () {
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
;/*! svg.js v2.3.4 MIT*/;!function(t,e){"function"==typeof define&&define.amd?define(function(){return e(t,t.document)}):"object"==typeof exports?module.exports=t.document?e(t,t.document):function(t){return e(t,t.document)}:t.SVG=e(t,t.document)}("undefined"!=typeof window?window:this,function(t,e){function i(t,e){return t instanceof e}function n(t,e){return(t.matches||t.matchesSelector||t.msMatchesSelector||t.mozMatchesSelector||t.webkitMatchesSelector||t.oMatchesSelector).call(t,e)}function r(t){return t.toLowerCase().replace(/-(.)/g,function(t,e){return e.toUpperCase()})}function s(t){return t.charAt(0).toUpperCase()+t.slice(1)}function a(t){return 4==t.length?["#",t.substring(1,2),t.substring(1,2),t.substring(2,3),t.substring(2,3),t.substring(3,4),t.substring(3,4)].join(""):t}function o(t){var e=t.toString(16);return 1==e.length?"0"+e:e}function h(t,e,i){if(null==e||null==i){var n=t.bbox();null==e?e=n.width/n.height*i:null==i&&(i=n.height/n.width*e)}return{width:e,height:i}}function u(t,e,i){return{x:e*t.a+i*t.c+0,y:e*t.b+i*t.d+0}}function l(t){return{a:t[0],b:t[1],c:t[2],d:t[3],e:t[4],f:t[5]}}function c(t){return t instanceof v.Matrix||(t=new v.Matrix(t)),t}function f(t,e){t.cx=null==t.cx?e.bbox().cx:t.cx,t.cy=null==t.cy?e.bbox().cy:t.cy}function d(t){return t=t.replace(v.regex.whitespace,"").replace(v.regex.matrix,"").split(v.regex.matrixElements),l(v.utils.map(t,function(t){return parseFloat(t)}))}function p(t){for(var e=0,i=t.length,n="";i>e;e++)n+=t[e][0],null!=t[e][1]&&(n+=t[e][1],null!=t[e][2]&&(n+=" ",n+=t[e][2],null!=t[e][3]&&(n+=" ",n+=t[e][3],n+=" ",n+=t[e][4],null!=t[e][5]&&(n+=" ",n+=t[e][5],n+=" ",n+=t[e][6],null!=t[e][7]&&(n+=" ",n+=t[e][7])))));return n+" "}function m(t){for(var e=t.childNodes.length-1;e>=0;e--)t.childNodes[e]instanceof SVGElement&&m(t.childNodes[e]);return v.adopt(t).id(v.eid(t.nodeName))}function x(t){return null==t.x&&(t.x=0,t.y=0,t.width=0,t.height=0),t.w=t.width,t.h=t.height,t.x2=t.x+t.width,t.y2=t.y+t.height,t.cx=t.x+t.width/2,t.cy=t.y+t.height/2,t}function g(t){var e=t.toString().match(v.regex.reference);return e?e[1]:void 0}var v=this.SVG=function(t){return v.supported?(t=new v.Doc(t),v.parser.draw||v.prepare(),t):void 0};if(v.ns="http://www.w3.org/2000/svg",v.xmlns="http://www.w3.org/2000/xmlns/",v.xlink="http://www.w3.org/1999/xlink",v.svgjs="http://svgjs.com/svgjs",v.supported=function(){return!!e.createElementNS&&!!e.createElementNS(v.ns,"svg").createSVGRect}(),!v.supported)return!1;v.did=1e3,v.eid=function(t){return"Svgjs"+s(t)+v.did++},v.create=function(t){var i=e.createElementNS(this.ns,t);return i.setAttribute("id",this.eid(t)),i},v.extend=function(){var t,e,i,n;for(t=[].slice.call(arguments),e=t.pop(),n=t.length-1;n>=0;n--)if(t[n])for(i in e)t[n].prototype[i]=e[i];v.Set&&v.Set.inherit&&v.Set.inherit()},v.invent=function(t){var e="function"==typeof t.create?t.create:function(){this.constructor.call(this,v.create(t.create))};return t.inherit&&(e.prototype=new t.inherit),t.extend&&v.extend(e,t.extend),t.construct&&v.extend(t.parent||v.Container,t.construct),e},v.adopt=function(t){if(!t)return null;if(t.instance)return t.instance;var e;return e="svg"==t.nodeName?t.parentNode instanceof SVGElement?new v.Nested:new v.Doc:"linearGradient"==t.nodeName?new v.Gradient("linear"):"radialGradient"==t.nodeName?new v.Gradient("radial"):v[s(t.nodeName)]?new(v[s(t.nodeName)]):new v.Element(t),e.type=t.nodeName,e.node=t,t.instance=e,e instanceof v.Doc&&e.namespace().defs(),e.setData(JSON.parse(t.getAttribute("svgjs:data"))||{}),e},v.prepare=function(){var t=e.getElementsByTagName("body")[0],i=(t?new v.Doc(t):new v.Doc(e.documentElement).nested()).size(2,0);v.parser={body:t||e.documentElement,draw:i.style("opacity:0;position:fixed;left:100%;top:100%;overflow:hidden"),poly:i.polyline().node,path:i.path().node,"native":v.create("svg")}},v.parser={"native":v.create("svg")},e.addEventListener("DOMContentLoaded",function(){v.parser.draw||v.prepare()},!1),v.regex={numberAndUnit:/^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i,hex:/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,rgb:/rgb\((\d+),(\d+),(\d+)\)/,reference:/#([a-z0-9\-_]+)/i,matrix:/matrix\(|\)/g,matrixElements:/,*\s+|,/,whitespace:/\s/g,isHex:/^#[a-f0-9]{3,6}$/i,isRgb:/^rgb\(/,isCss:/[^:]+:[^;]+;?/,isBlank:/^(\s+)?$/,isNumber:/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,isPercent:/^-?[\d\.]+%$/,isImage:/\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i,negExp:/e\-/gi,comma:/,/g,hyphen:/\-/g,pathLetters:/[MLHVCSQTAZ]/gi,isPathLetter:/[MLHVCSQTAZ]/i,whitespaces:/\s+/,X:/X/g},v.utils={map:function(t,e){var i,n=t.length,r=[];for(i=0;n>i;i++)r.push(e(t[i]));return r},filter:function(t,e){var i,n=t.length,r=[];for(i=0;n>i;i++)e(t[i])&&r.push(t[i]);return r},radians:function(t){return t%360*Math.PI/180},degrees:function(t){return 180*t/Math.PI%360},filterSVGElements:function(t){return this.filter(t,function(t){return t instanceof SVGElement})}},v.defaults={attrs:{"fill-opacity":1,"stroke-opacity":1,"stroke-width":0,"stroke-linejoin":"miter","stroke-linecap":"butt",fill:"#000000",stroke:"#000000",opacity:1,x:0,y:0,cx:0,cy:0,width:0,height:0,r:0,rx:0,ry:0,offset:0,"stop-opacity":1,"stop-color":"#000000","font-size":16,"font-family":"Helvetica, Arial, sans-serif","text-anchor":"start"}},v.Color=function(t){var e;this.r=0,this.g=0,this.b=0,t&&("string"==typeof t?v.regex.isRgb.test(t)?(e=v.regex.rgb.exec(t.replace(/\s/g,"")),this.r=parseInt(e[1]),this.g=parseInt(e[2]),this.b=parseInt(e[3])):v.regex.isHex.test(t)&&(e=v.regex.hex.exec(a(t)),this.r=parseInt(e[1],16),this.g=parseInt(e[2],16),this.b=parseInt(e[3],16)):"object"==typeof t&&(this.r=t.r,this.g=t.g,this.b=t.b))},v.extend(v.Color,{toString:function(){return this.toHex()},toHex:function(){return"#"+o(this.r)+o(this.g)+o(this.b)},toRgb:function(){return"rgb("+[this.r,this.g,this.b].join()+")"},brightness:function(){return this.r/255*.3+this.g/255*.59+this.b/255*.11},morph:function(t){return this.destination=new v.Color(t),this},at:function(t){return this.destination?(t=0>t?0:t>1?1:t,new v.Color({r:~~(this.r+(this.destination.r-this.r)*t),g:~~(this.g+(this.destination.g-this.g)*t),b:~~(this.b+(this.destination.b-this.b)*t)})):this}}),v.Color.test=function(t){return t+="",v.regex.isHex.test(t)||v.regex.isRgb.test(t)},v.Color.isRgb=function(t){return t&&"number"==typeof t.r&&"number"==typeof t.g&&"number"==typeof t.b},v.Color.isColor=function(t){return v.Color.isRgb(t)||v.Color.test(t)},v.Array=function(t,e){t=(t||[]).valueOf(),0==t.length&&e&&(t=e.valueOf()),this.value=this.parse(t)},v.extend(v.Array,{morph:function(t){if(this.destination=this.parse(t),this.value.length!=this.destination.length){for(var e=this.value[this.value.length-1],i=this.destination[this.destination.length-1];this.value.length>this.destination.length;)this.destination.push(i);for(;this.value.length<this.destination.length;)this.value.push(e)}return this},settle:function(){for(var t=0,e=this.value.length,i=[];e>t;t++)-1==i.indexOf(this.value[t])&&i.push(this.value[t]);return this.value=i},at:function(t){if(!this.destination)return this;for(var e=0,i=this.value.length,n=[];i>e;e++)n.push(this.value[e]+(this.destination[e]-this.value[e])*t);return new v.Array(n)},toString:function(){return this.value.join(" ")},valueOf:function(){return this.value},parse:function(t){return t=t.valueOf(),Array.isArray(t)?t:this.split(t)},split:function(t){return t.trim().split(/\s+/)},reverse:function(){return this.value.reverse(),this}}),v.PointArray=function(t,e){this.constructor.call(this,t,e||[[0,0]])},v.PointArray.prototype=new v.Array,v.extend(v.PointArray,{toString:function(){for(var t=0,e=this.value.length,i=[];e>t;t++)i.push(this.value[t].join(","));return i.join(" ")},toLine:function(){return{x1:this.value[0][0],y1:this.value[0][1],x2:this.value[1][0],y2:this.value[1][1]}},at:function(t){if(!this.destination)return this;for(var e=0,i=this.value.length,n=[];i>e;e++)n.push([this.value[e][0]+(this.destination[e][0]-this.value[e][0])*t,this.value[e][1]+(this.destination[e][1]-this.value[e][1])*t]);return new v.PointArray(n)},parse:function(t){if(t=t.valueOf(),Array.isArray(t))return t;t=this.split(t);for(var e,i=0,n=t.length,r=[];n>i;i++)e=t[i].split(","),r.push([parseFloat(e[0]),parseFloat(e[1])]);return r},move:function(t,e){var i=this.bbox();if(t-=i.x,e-=i.y,!isNaN(t)&&!isNaN(e))for(var n=this.value.length-1;n>=0;n--)this.value[n]=[this.value[n][0]+t,this.value[n][1]+e];return this},size:function(t,e){var i,n=this.bbox();for(i=this.value.length-1;i>=0;i--)this.value[i][0]=(this.value[i][0]-n.x)*t/n.width+n.x,this.value[i][1]=(this.value[i][1]-n.y)*e/n.height+n.y;return this},bbox:function(){return v.parser.poly.setAttribute("points",this.toString()),v.parser.poly.getBBox()}}),v.PathArray=function(t,e){this.constructor.call(this,t,e||[["M",0,0]])},v.PathArray.prototype=new v.Array,v.extend(v.PathArray,{toString:function(){return p(this.value)},move:function(t,e){var i=this.bbox();if(t-=i.x,e-=i.y,!isNaN(t)&&!isNaN(e))for(var n,r=this.value.length-1;r>=0;r--)n=this.value[r][0],"M"==n||"L"==n||"T"==n?(this.value[r][1]+=t,this.value[r][2]+=e):"H"==n?this.value[r][1]+=t:"V"==n?this.value[r][1]+=e:"C"==n||"S"==n||"Q"==n?(this.value[r][1]+=t,this.value[r][2]+=e,this.value[r][3]+=t,this.value[r][4]+=e,"C"==n&&(this.value[r][5]+=t,this.value[r][6]+=e)):"A"==n&&(this.value[r][6]+=t,this.value[r][7]+=e);return this},size:function(t,e){var i,n,r=this.bbox();for(i=this.value.length-1;i>=0;i--)n=this.value[i][0],"M"==n||"L"==n||"T"==n?(this.value[i][1]=(this.value[i][1]-r.x)*t/r.width+r.x,this.value[i][2]=(this.value[i][2]-r.y)*e/r.height+r.y):"H"==n?this.value[i][1]=(this.value[i][1]-r.x)*t/r.width+r.x:"V"==n?this.value[i][1]=(this.value[i][1]-r.y)*e/r.height+r.y:"C"==n||"S"==n||"Q"==n?(this.value[i][1]=(this.value[i][1]-r.x)*t/r.width+r.x,this.value[i][2]=(this.value[i][2]-r.y)*e/r.height+r.y,this.value[i][3]=(this.value[i][3]-r.x)*t/r.width+r.x,this.value[i][4]=(this.value[i][4]-r.y)*e/r.height+r.y,"C"==n&&(this.value[i][5]=(this.value[i][5]-r.x)*t/r.width+r.x,this.value[i][6]=(this.value[i][6]-r.y)*e/r.height+r.y)):"A"==n&&(this.value[i][1]=this.value[i][1]*t/r.width,this.value[i][2]=this.value[i][2]*e/r.height,this.value[i][6]=(this.value[i][6]-r.x)*t/r.width+r.x,this.value[i][7]=(this.value[i][7]-r.y)*e/r.height+r.y);return this},parse:function(t){if(t instanceof v.PathArray)return t.valueOf();var e,i,n,r,s,a,o=0,h=0,u={M:2,L:2,H:1,V:1,C:6,S:4,Q:4,T:2,A:7};if("string"==typeof t){for(t=t.replace(v.regex.negExp,"X").replace(v.regex.pathLetters," $& ").replace(v.regex.hyphen," -").replace(v.regex.comma," ").replace(v.regex.X,"e-").trim().split(v.regex.whitespaces),e=t.length;--e;)if(t[e].indexOf(".")!=t[e].lastIndexOf(".")){var l=t[e].split("."),c=[l.shift(),l.shift()].join(".");t.splice.apply(t,[e,1].concat(c,l.map(function(t){return"."+t})))}}else t=t.reduce(function(t,e){return[].concat.apply(t,e)},[]);var a=[];do{for(v.regex.isPathLetter.test(t[0])?(r=t[0],t.shift()):"M"==r?r="L":"m"==r&&(r="l"),s=[r.toUpperCase()],e=0;e<u[s[0]];++e)s.push(parseFloat(t.shift()));r==s[0]?"M"==r||"L"==r||"C"==r||"Q"==r||"S"==r||"T"==r?(o=s[u[s[0]]-1],h=s[u[s[0]]]):"V"==r?h=s[1]:"H"==r?o=s[1]:"A"==r&&(o=s[6],h=s[7]):"m"==r||"l"==r||"c"==r||"s"==r||"q"==r||"t"==r?(s[1]+=o,s[2]+=h,null!=s[3]&&(s[3]+=o,s[4]+=h),null!=s[5]&&(s[5]+=o,s[6]+=h),o=s[u[s[0]]-1],h=s[u[s[0]]]):"v"==r?(s[1]+=h,h=s[1]):"h"==r?(s[1]+=o,o=s[1]):"a"==r&&(s[6]+=o,s[7]+=h,o=s[6],h=s[7]),"M"==s[0]&&(i=o,n=h),"Z"==s[0]&&(o=i,h=n),a.push(s)}while(t.length);return a},bbox:function(){return v.parser.path.setAttribute("d",this.toString()),v.parser.path.getBBox()}}),v.Number=v.invent({create:function(t,e){this.value=0,this.unit=e||"","number"==typeof t?this.value=isNaN(t)?0:isFinite(t)?t:0>t?-3.4e38:3.4e38:"string"==typeof t?(e=t.match(v.regex.numberAndUnit),e&&(this.value=parseFloat(e[1]),"%"==e[5]?this.value/=100:"s"==e[5]&&(this.value*=1e3),this.unit=e[5])):t instanceof v.Number&&(this.value=t.valueOf(),this.unit=t.unit)},extend:{toString:function(){return("%"==this.unit?~~(1e8*this.value)/1e6:"s"==this.unit?this.value/1e3:this.value)+this.unit},toJSON:function(){return this.toString()},valueOf:function(){return this.value},plus:function(t){return new v.Number(this+new v.Number(t),this.unit)},minus:function(t){return this.plus(-new v.Number(t))},times:function(t){return new v.Number(this*new v.Number(t),this.unit)},divide:function(t){return new v.Number(this/new v.Number(t),this.unit)},to:function(t){var e=new v.Number(this);return"string"==typeof t&&(e.unit=t),e},morph:function(t){return this.destination=new v.Number(t),this},at:function(t){return this.destination?new v.Number(this.destination).minus(this).times(t).plus(this):this}}}),v.Element=v.invent({create:function(t){this._stroke=v.defaults.attrs.stroke,this.dom={},(this.node=t)&&(this.type=t.nodeName,this.node.instance=this,this._stroke=t.getAttribute("stroke")||this._stroke)},extend:{x:function(t){return this.attr("x",t)},y:function(t){return this.attr("y",t)},cx:function(t){return null==t?this.x()+this.width()/2:this.x(t-this.width()/2)},cy:function(t){return null==t?this.y()+this.height()/2:this.y(t-this.height()/2)},move:function(t,e){return this.x(t).y(e)},center:function(t,e){return this.cx(t).cy(e)},width:function(t){return this.attr("width",t)},height:function(t){return this.attr("height",t)},size:function(t,e){var i=h(this,t,e);return this.width(new v.Number(i.width)).height(new v.Number(i.height))},clone:function(t){var e=m(this.node.cloneNode(!0));return t?t.add(e):this.after(e),e},remove:function(){return this.parent()&&this.parent().removeElement(this),this},replace:function(t){return this.after(t).remove(),t},addTo:function(t){return t.put(this)},putIn:function(t){return t.add(this)},id:function(t){return this.attr("id",t)},inside:function(t,e){var i=this.bbox();return t>i.x&&e>i.y&&t<i.x+i.width&&e<i.y+i.height},show:function(){return this.style("display","")},hide:function(){return this.style("display","none")},visible:function(){return"none"!=this.style("display")},toString:function(){return this.attr("id")},classes:function(){var t=this.attr("class");return null==t?[]:t.trim().split(/\s+/)},hasClass:function(t){return-1!=this.classes().indexOf(t)},addClass:function(t){if(!this.hasClass(t)){var e=this.classes();e.push(t),this.attr("class",e.join(" "))}return this},removeClass:function(t){return this.hasClass(t)&&this.attr("class",this.classes().filter(function(e){return e!=t}).join(" ")),this},toggleClass:function(t){return this.hasClass(t)?this.removeClass(t):this.addClass(t)},reference:function(t){return v.get(this.attr(t))},parent:function(t){var e=this;if(!e.node.parentNode)return null;if(e=v.adopt(e.node.parentNode),!t)return e;for(;e&&e.node instanceof SVGElement;){if("string"==typeof t?e.matches(t):e instanceof t)return e;e=v.adopt(e.node.parentNode)}},doc:function(){return this instanceof v.Doc?this:this.parent(v.Doc)},parents:function(t){var e=[],i=this;do{if(i=i.parent(t),!i||!i.node)break;e.push(i)}while(i.parent);return e},matches:function(t){return n(this.node,t)},"native":function(){return this.node},svg:function(t){var i=e.createElement("svg");if(!(t&&this instanceof v.Parent))return i.appendChild(t=e.createElement("svg")),this.writeDataToDom(),t.appendChild(this.node.cloneNode(!0)),i.innerHTML.replace(/^<svg>/,"").replace(/<\/svg>$/,"");i.innerHTML="<svg>"+t.replace(/\n/,"").replace(/<(\w+)([^<]+?)\/>/g,"<$1$2></$1>")+"</svg>";for(var n=0,r=i.firstChild.childNodes.length;r>n;n++)this.node.appendChild(i.firstChild.firstChild);return this},writeDataToDom:function(){if(this.each||this.lines){var t=this.each?this:this.lines();t.each(function(){this.writeDataToDom()})}return this.node.removeAttribute("svgjs:data"),Object.keys(this.dom).length&&this.node.setAttribute("svgjs:data",JSON.stringify(this.dom)),this},setData:function(t){return this.dom=t,this},is:function(t){return i(this,t)}}}),v.easing={"-":function(t){return t},"<>":function(t){return-Math.cos(t*Math.PI)/2+.5},">":function(t){return Math.sin(t*Math.PI/2)},"<":function(t){return-Math.cos(t*Math.PI/2)+1}},v.morph=function(t){return function(e,i){return new v.MorphObj(e,i).at(t)}},v.Situation=v.invent({create:function(t){this.init=!1,this.reversed=!1,this.reversing=!1,this.duration=new v.Number(t.duration).valueOf(),this.delay=new v.Number(t.delay).valueOf(),this.start=+new Date+this.delay,this.finish=this.start+this.duration,this.ease=t.ease,this.loop=!1,this.loops=!1,this.animations={},this.attrs={},this.styles={},this.transforms=[],this.once={}}}),v.Delay=function(t){this.delay=new v.Number(t).valueOf()},v.FX=v.invent({create:function(t){this._target=t,this.situations=[],this.active=!1,this.situation=null,this.paused=!1,this.lastPos=0,this.pos=0},extend:{animate:function(t,e,i){"object"==typeof t&&(e=t.ease,i=t.delay,t=t.duration);var n=new v.Situation({duration:t||1e3,delay:i||0,ease:v.easing[e||"-"]||e});return this.queue(n),this},delay:function(t){var t=new v.Delay(t);return this.queue(t)},target:function(t){return t&&t instanceof v.Element?(this._target=t,this):this._target},timeToPos:function(t){return(t-this.situation.start)/this.situation.duration},posToTime:function(t){return this.situation.duration*t+this.situation.start},startAnimFrame:function(){this.stopAnimFrame(),this.animationFrame=requestAnimationFrame(function(){this.step()}.bind(this))},stopAnimFrame:function(){cancelAnimationFrame(this.animationFrame)},start:function(){return!this.active&&this.situation&&(this.situation.start=+new Date+this.situation.delay,this.situation.finish=this.situation.start+this.situation.duration,this.initAnimations(),this.active=!0,this.startAnimFrame()),this},queue:function(t){return("function"==typeof t||t instanceof v.Situation||t instanceof v.Delay)&&this.situations.push(t),this.situation||(this.situation=this.situations.shift()),this},dequeue:function(){if(this.situation&&this.situation.stop&&this.situation.stop(),this.situation=this.situations.shift(),this.situation){var t=function(){this.situation instanceof v.Situation?this.initAnimations().at(0):this.situation instanceof v.Delay?this.dequeue():this.situation.call(this)}.bind(this);this.situation.delay?setTimeout(function(){t()},this.situation.delay):t()}return this},initAnimations:function(){var t,e=this.situation;if(e.init)return this;for(t in e.animations)"viewbox"==t?e.animations[t]=this.target().viewbox().morph(e.animations[t]):(e.animations[t].value="plot"==t?this.target().array().value:this.target()[t](),e.animations[t].value.value&&(e.animations[t].value=e.animations[t].value.value),e.animations[t].relative&&(e.animations[t].destination.value=e.animations[t].destination.value+e.animations[t].value));for(t in e.attrs)if(e.attrs[t]instanceof v.Color){var i=new v.Color(this.target().attr(t));e.attrs[t].r=i.r,e.attrs[t].g=i.g,e.attrs[t].b=i.b}else e.attrs[t].value=this.target().attr(t);for(t in e.styles)e.styles[t].value=this.target().style(t);return e.initialTransformation=this.target().matrixify(),e.init=!0,this},clearQueue:function(){return this.situations=[],this},clearCurrent:function(){return this.situation=null,this},stop:function(t,e){return this.active||this.start(),e&&this.clearQueue(),this.active=!1,t&&this.situation&&(this.situation.loop=!1,this.situation.loops%2==0&&this.situation.reversing&&(this.situation.reversed=!0),this.at(1)),this.stopAnimFrame(),clearTimeout(this.timeout),this.clearCurrent()},reset:function(){if(this.situation){var t=this.situation;this.stop(),this.situation=t,this.at(0)}return this},finish:function(){for(this.stop(!0,!1);this.dequeue().situation&&this.stop(!0,!1););return this.clearQueue().clearCurrent(),this},at:function(t){return this.pos=t,this.situation.start=+new Date-t*this.situation.duration,this.situation.finish=this.situation.start+this.situation.duration,this.step(!0)},speed:function(t){return this.situation.duration=this.situation.duration*this.pos+(1-this.pos)*this.situation.duration/t,this.situation.finish=this.situation.start+this.situation.duration,this.at(this.pos)},loop:function(t,e){return this.situation.loop=this.situation.loops=t||!0,e&&(this.last().reversing=!0),this},pause:function(){return this.paused=!0,this.stopAnimFrame(),clearTimeout(this.timeout),this},play:function(){return this.paused?(this.paused=!1,this.at(this.pos)):this},reverse:function(t){var e=this.last();return e.reversed="undefined"==typeof t?!e.reversed:t,this},progress:function(t){return t?this.situation.ease(this.pos):this.pos},after:function(t){var e=this.last(),i=function n(i){i.detail.situation==e&&(t.call(this,e),this.off("finished.fx",n))};return this.target().on("finished.fx",i),this},during:function(t){var e=this.last(),i=function(i){i.detail.situation==e&&t.call(this,i.detail.pos,v.morph(i.detail.pos),i.detail.eased,e)};return this.target().off("during.fx",i).on("during.fx",i),this.after(function(){this.off("during.fx",i)})},afterAll:function(t){var e=function i(){t.call(this),this.off("allfinished.fx",i)};return this.target().off("allfinished.fx",e).on("allfinished.fx",e),this},duringAll:function(t){var e=function(e){t.call(this,e.detail.pos,v.morph(e.detail.pos),e.detail.eased,e.detail.situation)};return this.target().off("during.fx",e).on("during.fx",e),this.afterAll(function(){this.off("during.fx",e)})},last:function(){return this.situations.length?this.situations[this.situations.length-1]:this.situation},add:function(t,e,i){return this.last()[i||"animations"][t]=e,setTimeout(function(){this.start()}.bind(this),0),this},step:function(t){if(t||(this.pos=this.timeToPos(+new Date)),this.pos>=1&&(this.situation.loop===!0||"number"==typeof this.situation.loop&&--this.situation.loop))return this.situation.reversing&&(this.situation.reversed=!this.situation.reversed),this.at(this.pos-1);this.situation.reversed&&(this.pos=1-this.pos),this.pos>1&&(this.pos=1),this.pos<0&&(this.pos=0);var e=this.situation.ease(this.pos);for(var i in this.situation.once)i>this.lastPos&&e>=i&&(this.situation.once[i].call(this.target(),this.pos,e),delete this.situation.once[i]);return this.active&&this.target().fire("during",{pos:this.pos,eased:e,fx:this,situation:this.situation}),this.situation?(this.eachAt(),1==this.pos&&!this.situation.reversed||this.situation.reversed&&0==this.pos?(this.stopAnimFrame(),this.target().fire("finished",{fx:this,situation:this.situation}),this.situations.length||(this.target().fire("allfinished"),this.target().off(".fx"),this.active=!1),this.active?this.dequeue():this.clearCurrent()):!this.paused&&this.active&&this.startAnimFrame(),this.lastPos=e,this):this},eachAt:function(){var t,e,i=this,n=this.target(),r=this.situation;for(t in r.animations)e=[].concat(r.animations[t]).map(function(t){return t.at?t.at(r.ease(i.pos),i.pos):t}),n[t].apply(n,e);for(t in r.attrs)e=[t].concat(r.attrs[t]).map(function(t){return t.at?t.at(r.ease(i.pos),i.pos):t}),n.attr.apply(n,e);for(t in r.styles)e=[t].concat(r.styles[t]).map(function(t){return t.at?t.at(r.ease(i.pos),i.pos):t}),n.style.apply(n,e);if(r.transforms.length){e=r.initialTransformation;for(t in r.transforms){var s=r.transforms[t];s instanceof v.Matrix?e=s.relative?e.multiply(s.at(r.ease(this.pos))):e.morph(s).at(r.ease(this.pos)):(s.relative||s.undo(e.extract()),e=e.multiply(s.at(r.ease(this.pos))))}n.matrix(e)}return this},once:function(t,e,i){return i||(t=this.situation.ease(t)),this.situation.once[t]=e,this}},parent:v.Element,construct:{animate:function(t,e,i){return(this.fx||(this.fx=new v.FX(this))).animate(t,e,i)},delay:function(t){return(this.fx||(this.fx=new v.FX(this))).delay(t)},stop:function(t,e){return this.fx&&this.fx.stop(t,e),this},finish:function(){return this.fx&&this.fx.finish(),this},pause:function(){return this.fx&&this.fx.pause(),this},play:function(){return this.fx&&this.fx.play(),this}}}),v.MorphObj=v.invent({create:function(t,e){return v.Color.isColor(e)?new v.Color(t).morph(e):v.regex.numberAndUnit.test(e)?new v.Number(t).morph(e):(this.value=0,this.destination=e,void 0)},extend:{at:function(t,e){return 1>e?this.value:this.destination},valueOf:function(){return this.value}}}),v.extend(v.FX,{attr:function(t,e){if("object"==typeof t)for(var i in t)this.attr(i,t[i]);else this.add(t,new v.MorphObj(null,e),"attrs");return this},style:function(t,e){if("object"==typeof t)for(var i in t)this.style(i,t[i]);else this.add(t,new v.MorphObj(null,e),"styles");return this},x:function(t,e){if(this.target()instanceof v.G)return this.transform({x:t},e),this;var i=(new v.Number).morph(t);return i.relative=e,this.add("x",i)},y:function(t,e){if(this.target()instanceof v.G)return this.transform({y:t},e),this;var i=(new v.Number).morph(t);return i.relative=e,this.add("y",i)},cx:function(t){return this.add("cx",(new v.Number).morph(t))},cy:function(t){return this.add("cy",(new v.Number).morph(t))},move:function(t,e){return this.x(t).y(e)},center:function(t,e){return this.cx(t).cy(e)},size:function(t,e){if(this.target()instanceof v.Text)this.attr("font-size",t);else{var i;t&&e||(i=this.target().bbox()),t||(t=i.width/i.height*e),e||(e=i.height/i.width*t),this.add("width",(new v.Number).morph(t)).add("height",(new v.Number).morph(e))}return this},plot:function(t){return this.add("plot",this.target().array().morph(t))},leading:function(t){return this.target().leading?this.add("leading",(new v.Number).morph(t)):this},viewbox:function(t,e,i,n){return this.target()instanceof v.Container&&this.add("viewbox",new v.ViewBox(t,e,i,n)),this},update:function(t){if(this.target()instanceof v.Stop){if("number"==typeof t||t instanceof v.Number)return this.update({offset:arguments[0],color:arguments[1],opacity:arguments[2]});null!=t.opacity&&this.attr("stop-opacity",t.opacity),null!=t.color&&this.attr("stop-color",t.color),null!=t.offset&&this.attr("offset",t.offset)}return this}}),v.BBox=v.invent({create:function(t){if(t){var i;try{if(!e.documentElement.contains(t.node))throw new Exception("Element not in the dom");i=t.node.getBBox()}catch(n){if(t instanceof v.Shape){var r=t.clone(v.parser.draw).show();i=r.bbox(),r.remove()}else i={x:t.node.clientLeft,y:t.node.clientTop,width:t.node.clientWidth,height:t.node.clientHeight}}this.x=i.x,this.y=i.y,this.width=i.width,this.height=i.height}x(this)},parent:v.Element,construct:{bbox:function(){return new v.BBox(this)}}}),v.TBox=v.invent({create:function(t){if(t){var e=t.ctm().extract(),i=t.bbox();this.width=i.width*e.scaleX,this.height=i.height*e.scaleY,this.x=i.x+e.x,this.y=i.y+e.y}x(this)},parent:v.Element,construct:{tbox:function(){return new v.TBox(this)}}}),v.RBox=v.invent({create:function(e){if(e){var i=e.doc().parent(),n=e.node.getBoundingClientRect(),r=1;for(this.x=n.left,this.y=n.top,this.x-=i.offsetLeft,this.y-=i.offsetTop;i=i.offsetParent;)this.x-=i.offsetLeft,this.y-=i.offsetTop;for(i=e;i.parent&&(i=i.parent());)i.viewbox&&(r*=i.viewbox().zoom,this.x-=i.x()||0,this.y-=i.y()||0);this.width=n.width/=r,this.height=n.height/=r}x(this),this.x+=t.pageXOffset,this.y+=t.pageYOffset},parent:v.Element,construct:{rbox:function(){return new v.RBox(this)}}}),[v.BBox,v.TBox,v.RBox].forEach(function(t){v.extend(t,{merge:function(e){var i=new t;return i.x=Math.min(this.x,e.x),i.y=Math.min(this.y,e.y),i.width=Math.max(this.x+this.width,e.x+e.width)-i.x,i.height=Math.max(this.y+this.height,e.y+e.height)-i.y,x(i)}})}),v.Matrix=v.invent({create:function(t){var e,i=l([1,0,0,1,0,0]);for(t=t instanceof v.Element?t.matrixify():"string"==typeof t?d(t):6==arguments.length?l([].slice.call(arguments)):"object"==typeof t?t:i,e=w.length-1;e>=0;--e)this[w[e]]=t&&"number"==typeof t[w[e]]?t[w[e]]:i[w[e]]},extend:{extract:function(){var t=u(this,0,1),e=u(this,1,0),i=180/Math.PI*Math.atan2(t.y,t.x)-90;return{x:this.e,y:this.f,transformedX:(this.e*Math.cos(i*Math.PI/180)+this.f*Math.sin(i*Math.PI/180))/Math.sqrt(this.a*this.a+this.b*this.b),transformedY:(this.f*Math.cos(i*Math.PI/180)+this.e*Math.sin(-i*Math.PI/180))/Math.sqrt(this.c*this.c+this.d*this.d),skewX:-i,skewY:180/Math.PI*Math.atan2(e.y,e.x),scaleX:Math.sqrt(this.a*this.a+this.b*this.b),scaleY:Math.sqrt(this.c*this.c+this.d*this.d),rotation:i,a:this.a,b:this.b,c:this.c,d:this.d,e:this.e,f:this.f,matrix:new v.Matrix(this)}},clone:function(){return new v.Matrix(this)},morph:function(t){return this.destination=new v.Matrix(t),this},at:function(t){if(!this.destination)return this;var e=new v.Matrix({a:this.a+(this.destination.a-this.a)*t,b:this.b+(this.destination.b-this.b)*t,c:this.c+(this.destination.c-this.c)*t,d:this.d+(this.destination.d-this.d)*t,e:this.e+(this.destination.e-this.e)*t,f:this.f+(this.destination.f-this.f)*t});if(this.param&&this.param.to){var i={rotation:this.param.from.rotation+(this.param.to.rotation-this.param.from.rotation)*t,cx:this.param.from.cx,cy:this.param.from.cy};e=e.rotate((this.param.to.rotation-2*this.param.from.rotation)*t,i.cx,i.cy),e.param=i}return e},multiply:function(t){return new v.Matrix(this.native().multiply(c(t).native()))},inverse:function(){return new v.Matrix(this.native().inverse())},translate:function(t,e){return new v.Matrix(this.native().translate(t||0,e||0))},scale:function(t,e,i,n){return(1==arguments.length||3==arguments.length)&&(e=t),3==arguments.length&&(n=i,i=e),this.around(i,n,new v.Matrix(t,0,0,e,0,0))},rotate:function(t,e,i){return t=v.utils.radians(t),this.around(e,i,new v.Matrix(Math.cos(t),Math.sin(t),-Math.sin(t),Math.cos(t),0,0))},flip:function(t,e){return"x"==t?this.scale(-1,1,e,0):this.scale(1,-1,0,e)},skew:function(t,e,i,n){return this.around(i,n,this.native().skewX(t||0).skewY(e||0))},skewX:function(t,e,i){return this.around(e,i,this.native().skewX(t||0))},skewY:function(t,e,i){return this.around(e,i,this.native().skewY(t||0))},around:function(t,e,i){return this.multiply(new v.Matrix(1,0,0,1,t||0,e||0)).multiply(i).multiply(new v.Matrix(1,0,0,1,-t||0,-e||0))},"native":function(){for(var t=v.parser.native.createSVGMatrix(),e=w.length-1;e>=0;e--)t[w[e]]=this[w[e]];return t},toString:function(){return"matrix("+this.a+","+this.b+","+this.c+","+this.d+","+this.e+","+this.f+")"}},parent:v.Element,construct:{ctm:function(){return new v.Matrix(this.node.getCTM())},screenCTM:function(){return new v.Matrix(this.node.getScreenCTM())}}}),v.Point=v.invent({create:function(t,e){var i,n={x:0,y:0};i=Array.isArray(t)?{x:t[0],y:t[1]}:"object"==typeof t?{x:t.x,y:t.y}:null!=e?{x:t,y:e}:n,this.x=i.x,this.y=i.y},extend:{clone:function(){return new v.Point(this)},morph:function(t){return this.destination=new v.Point(t),this},at:function(t){if(!this.destination)return this;var e=new v.Point({x:this.x+(this.destination.x-this.x)*t,y:this.y+(this.destination.y-this.y)*t});return e},"native":function(){var t=v.parser.native.createSVGPoint();return t.x=this.x,t.y=this.y,t},transform:function(t){return new v.Point(this.native().matrixTransform(t.native()))}}}),v.extend(v.Element,{point:function(t,e){return new v.Point(t,e).transform(this.screenCTM().inverse())}}),v.extend(v.Element,{attr:function(t,e,i){if(null==t){for(t={},e=this.node.attributes,i=e.length-1;i>=0;i--)t[e[i].nodeName]=v.regex.isNumber.test(e[i].nodeValue)?parseFloat(e[i].nodeValue):e[i].nodeValue;return t}if("object"==typeof t)for(e in t)this.attr(e,t[e]);else if(null===e)this.node.removeAttribute(t);else{if(null==e)return e=this.node.getAttribute(t),null==e?v.defaults.attrs[t]:v.regex.isNumber.test(e)?parseFloat(e):e;"stroke-width"==t?this.attr("stroke",parseFloat(e)>0?this._stroke:null):"stroke"==t&&(this._stroke=e),("fill"==t||"stroke"==t)&&(v.regex.isImage.test(e)&&(e=this.doc().defs().image(e,0,0)),e instanceof v.Image&&(e=this.doc().defs().pattern(0,0,function(){this.add(e)}))),"number"==typeof e?e=new v.Number(e):v.Color.isColor(e)?e=new v.Color(e):Array.isArray(e)?e=new v.Array(e):e instanceof v.Matrix&&e.param&&(this.param=e.param),"leading"==t?this.leading&&this.leading(e):"string"==typeof i?this.node.setAttributeNS(i,t,e.toString()):this.node.setAttribute(t,e.toString()),!this.rebuild||"font-size"!=t&&"x"!=t||this.rebuild(t,e)}return this}}),v.extend(v.Element,{transform:function(t,e){var i,n=this;if("object"!=typeof t)return i=new v.Matrix(n).extract(),"string"==typeof t?i[t]:i;
if(i=new v.Matrix(n),e=!!e||!!t.relative,null!=t.a)i=e?i.multiply(new v.Matrix(t)):new v.Matrix(t);else if(null!=t.rotation)f(t,n),i=e?i.rotate(t.rotation,t.cx,t.cy):i.rotate(t.rotation-i.extract().rotation,t.cx,t.cy);else if(null!=t.scale||null!=t.scaleX||null!=t.scaleY){if(f(t,n),t.scaleX=null!=t.scale?t.scale:null!=t.scaleX?t.scaleX:1,t.scaleY=null!=t.scale?t.scale:null!=t.scaleY?t.scaleY:1,!e){var r=i.extract();t.scaleX=1*t.scaleX/r.scaleX,t.scaleY=1*t.scaleY/r.scaleY}i=i.scale(t.scaleX,t.scaleY,t.cx,t.cy)}else if(null!=t.skewX||null!=t.skewY){if(f(t,n),t.skewX=null!=t.skewX?t.skewX:0,t.skewY=null!=t.skewY?t.skewY:0,!e){var r=i.extract();i=i.multiply((new v.Matrix).skew(r.skewX,r.skewY,t.cx,t.cy).inverse())}i=i.skew(t.skewX,t.skewY,t.cx,t.cy)}else t.flip?i=i.flip(t.flip,null==t.offset?n.bbox()["c"+t.flip]:t.offset):(null!=t.x||null!=t.y)&&(e?i=i.translate(t.x,t.y):(null!=t.x&&(i.e=t.x),null!=t.y&&(i.f=t.y)));return this.attr("transform",i)}}),v.extend(v.FX,{transform:function(t,e){var i,n=this.target();return"object"!=typeof t?(i=new v.Matrix(n).extract(),"string"==typeof t?i[t]:i):(e=!!e||!!t.relative,null!=t.a?i=new v.Matrix(t):null!=t.rotation?(f(t,n),i=new v.Rotate(t.rotation,t.cx,t.cy)):null!=t.scale||null!=t.scaleX||null!=t.scaleY?(f(t,n),t.scaleX=null!=t.scale?t.scale:null!=t.scaleX?t.scaleX:1,t.scaleY=null!=t.scale?t.scale:null!=t.scaleY?t.scaleY:1,i=new v.Scale(t.scaleX,t.scaleY,t.cx,t.cy)):null!=t.skewX||null!=t.skewY?(f(t,n),t.skewX=null!=t.skewX?t.skewX:0,t.skewY=null!=t.skewY?t.skewY:0,i=new v.Skew(t.skewX,t.skewY,t.cx,t.cy)):t.flip?i=(new v.Matrix).morph((new v.Matrix).flip(t.flip,null==t.offset?n.bbox()["c"+t.flip]:t.offset)):(null!=t.x||null!=t.y)&&(i=new v.Translate(t.x,t.y)),i?(i.relative=e,this.last().transforms.push(i),setTimeout(function(){this.start()}.bind(this),0),this):this)}}),v.extend(v.Element,{untransform:function(){return this.attr("transform",null)},matrixify:function(){var t=(this.attr("transform")||"").split(/\)\s*/).slice(0,-1).map(function(t){var e=t.trim().split("(");return[e[0],e[1].split(v.regex.matrixElements).map(function(t){return parseFloat(t)})]}).reduce(function(t,e){return"matrix"==e[0]?t.multiply(l(e[1])):t[e[0]].apply(t,e[1])},new v.Matrix);return t},toParent:function(t){if(this==t)return this;var e=this.screenCTM(),i=t.rect(1,1),n=i.screenCTM().inverse();return i.remove(),this.addTo(t).untransform().transform(n.multiply(e)),this},toDoc:function(){return this.toParent(this.doc())}}),v.Transformation=v.invent({create:function(t,e){if(arguments.length>1&&"boolean"!=typeof e)return this.create([].slice.call(arguments));if("object"==typeof t)for(var i=0,n=this.arguments.length;n>i;++i)this[this.arguments[i]]=t[this.arguments[i]];if(Array.isArray(t))for(var i=0,n=this.arguments.length;n>i;++i)this[this.arguments[i]]=t[i];this.inversed=!1,e===!0&&(this.inversed=!0)},extend:{at:function(t){for(var e=[],i=0,n=this.arguments.length;n>i;++i)e.push(this[this.arguments[i]]);var r=this._undo||new v.Matrix;return r=(new v.Matrix).morph(v.Matrix.prototype[this.method].apply(r,e)).at(t),this.inversed?r.inverse():r},undo:function(t){for(var e=0,i=this.arguments.length;i>e;++e)t[this.arguments[e]]="undefined"==typeof this[this.arguments[e]]?0:t[this.arguments[e]];return this._undo=new(v[s(this.method)])(t,!0).at(1),this}}}),v.Translate=v.invent({parent:v.Matrix,inherit:v.Transformation,create:function(t,e){"object"==typeof t?this.constructor.call(this,t,e):this.constructor.call(this,[].slice.call(arguments))},extend:{arguments:["transformedX","transformedY"],method:"translate"}}),v.Rotate=v.invent({parent:v.Matrix,inherit:v.Transformation,create:function(t,e){"object"==typeof t?this.constructor.call(this,t,e):this.constructor.call(this,[].slice.call(arguments))},extend:{arguments:["rotation","cx","cy"],method:"rotate",at:function(t){var e=(new v.Matrix).rotate((new v.Number).morph(this.rotation-(this._undo?this._undo.rotation:0)).at(t),this.cx,this.cy);return this.inversed?e.inverse():e},undo:function(t){this._undo=t}}}),v.Scale=v.invent({parent:v.Matrix,inherit:v.Transformation,create:function(t,e){"object"==typeof t?this.constructor.call(this,t,e):this.constructor.call(this,[].slice.call(arguments))},extend:{arguments:["scaleX","scaleY","cx","cy"],method:"scale"}}),v.Skew=v.invent({parent:v.Matrix,inherit:v.Transformation,create:function(t,e){"object"==typeof t?this.constructor.call(this,t,e):this.constructor.call(this,[].slice.call(arguments))},extend:{arguments:["skewX","skewY","cx","cy"],method:"skew"}}),v.extend(v.Element,{style:function(t,e){if(0==arguments.length)return this.node.style.cssText||"";if(arguments.length<2)if("object"==typeof t)for(e in t)this.style(e,t[e]);else{if(!v.regex.isCss.test(t))return this.node.style[r(t)];t=t.split(";");for(var i=0;i<t.length;i++)e=t[i].split(":"),this.style(e[0].replace(/\s+/g,""),e[1])}else this.node.style[r(t)]=null===e||v.regex.isBlank.test(e)?"":e;return this}}),v.Parent=v.invent({create:function(t){this.constructor.call(this,t)},inherit:v.Element,extend:{children:function(){return v.utils.map(v.utils.filterSVGElements(this.node.childNodes),function(t){return v.adopt(t)})},add:function(t,e){return null==e?this.node.appendChild(t.node):t.node!=this.node.childNodes[e]&&this.node.insertBefore(t.node,this.node.childNodes[e]),this},put:function(t,e){return this.add(t,e),t},has:function(t){return this.index(t)>=0},index:function(t){return[].slice.call(this.node.childNodes).indexOf(t.node)},get:function(t){return v.adopt(this.node.childNodes[t])},first:function(){return this.get(0)},last:function(){return this.get(this.node.childNodes.length-1)},each:function(t,e){var i,n,r=this.children();for(i=0,n=r.length;n>i;i++)r[i]instanceof v.Element&&t.apply(r[i],[i,r]),e&&r[i]instanceof v.Container&&r[i].each(t,e);return this},removeElement:function(t){return this.node.removeChild(t.node),this},clear:function(){for(;this.node.hasChildNodes();)this.node.removeChild(this.node.lastChild);return delete this._defs,this},defs:function(){return this.doc().defs()}}}),v.extend(v.Parent,{ungroup:function(t,e){return 0===e||this instanceof v.Defs?this:(t=t||(this instanceof v.Doc?this:this.parent(v.Parent)),e=e||1/0,this.each(function(){return this instanceof v.Defs?this:this instanceof v.Parent?this.ungroup(t,e-1):this.toParent(t)}),this.node.firstChild||this.remove(),this)},flatten:function(t,e){return this.ungroup(t,e)}}),v.Container=v.invent({create:function(t){this.constructor.call(this,t)},inherit:v.Parent}),v.ViewBox=v.invent({create:function(t){var e,i,n,r,s,a,o,h,u=[0,0,0,0],l=1,c=1,f=/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/gi;if(t instanceof v.Element){for(o=t,h=t,a=(t.attr("viewBox")||"").match(f),s=t.bbox,n=new v.Number(t.width()),r=new v.Number(t.height());"%"==n.unit;)l*=n.value,n=new v.Number(o instanceof v.Doc?o.parent().offsetWidth:o.parent().width()),o=o.parent();for(;"%"==r.unit;)c*=r.value,r=new v.Number(h instanceof v.Doc?h.parent().offsetHeight:h.parent().height()),h=h.parent();this.x=0,this.y=0,this.width=n*l,this.height=r*c,this.zoom=1,a&&(e=parseFloat(a[0]),i=parseFloat(a[1]),n=parseFloat(a[2]),r=parseFloat(a[3]),this.zoom=this.width/this.height>n/r?this.height/r:this.width/n,this.x=e,this.y=i,this.width=n,this.height=r)}else t="string"==typeof t?t.match(f).map(function(t){return parseFloat(t)}):Array.isArray(t)?t:"object"==typeof t?[t.x,t.y,t.width,t.height]:4==arguments.length?[].slice.call(arguments):u,this.x=t[0],this.y=t[1],this.width=t[2],this.height=t[3]},extend:{toString:function(){return this.x+" "+this.y+" "+this.width+" "+this.height},morph:function(t){var t=1==arguments.length?[t.x,t.y,t.width,t.height]:[].slice.call(arguments);return this.destination=new v.ViewBox(t),this},at:function(t){return this.destination?new v.ViewBox([this.x+(this.destination.x-this.x)*t,this.y+(this.destination.y-this.y)*t,this.width+(this.destination.width-this.width)*t,this.height+(this.destination.height-this.height)*t]):this}},parent:v.Container,construct:{viewbox:function(t){return 0==arguments.length?new v.ViewBox(this):(t=1==arguments.length?[t.x,t.y,t.width,t.height]:[].slice.call(arguments),this.attr("viewBox",t))}}}),["click","dblclick","mousedown","mouseup","mouseover","mouseout","mousemove","touchstart","touchmove","touchleave","touchend","touchcancel"].forEach(function(t){v.Element.prototype[t]=function(e){var i=this;return this.node["on"+t]="function"==typeof e?function(){return e.apply(i,arguments)}:null,this}}),v.listeners=[],v.handlerMap=[],v.listenerId=0,v.on=function(t,e,i,n){var r=i.bind(n||t.instance||t),s=(v.handlerMap.indexOf(t)+1||v.handlerMap.push(t))-1,a=e.split(".")[0],o=e.split(".")[1]||"*";v.listeners[s]=v.listeners[s]||{},v.listeners[s][a]=v.listeners[s][a]||{},v.listeners[s][a][o]=v.listeners[s][a][o]||{},i._svgjsListenerId||(i._svgjsListenerId=++v.listenerId),v.listeners[s][a][o][i._svgjsListenerId]=r,t.addEventListener(a,r,!1)},v.off=function(t,e,i){var n=v.handlerMap.indexOf(t),r=e&&e.split(".")[0],s=e&&e.split(".")[1];if(-1!=n)if(i){if("function"==typeof i&&(i=i._svgjsListenerId),!i)return;v.listeners[n][r]&&v.listeners[n][r][s||"*"]&&(t.removeEventListener(r,v.listeners[n][r][s||"*"][i],!1),delete v.listeners[n][r][s||"*"][i])}else if(s&&r){if(v.listeners[n][r]&&v.listeners[n][r][s]){for(i in v.listeners[n][r][s])v.off(t,[r,s].join("."),i);delete v.listeners[n][r][s]}}else if(s)for(e in v.listeners[n])for(namespace in v.listeners[n][e])s===namespace&&v.off(t,[e,s].join("."));else if(r){if(v.listeners[n][r]){for(namespace in v.listeners[n][r])v.off(t,[r,namespace].join("."));delete v.listeners[n][r]}}else{for(e in v.listeners[n])v.off(t,e);delete v.listeners[n]}},v.extend(v.Element,{on:function(t,e,i){return v.on(this.node,t,e,i),this},off:function(t,e){return v.off(this.node,t,e),this},fire:function(t,e){return t instanceof Event?this.node.dispatchEvent(t):this.node.dispatchEvent(new b(t,{detail:e})),this}}),v.Defs=v.invent({create:"defs",inherit:v.Container}),v.G=v.invent({create:"g",inherit:v.Container,extend:{x:function(t){return null==t?this.transform("x"):this.transform({x:t-this.x()},!0)},y:function(t){return null==t?this.transform("y"):this.transform({y:t-this.y()},!0)},cx:function(t){return null==t?this.gbox().cx:this.x(t-this.gbox().width/2)},cy:function(t){return null==t?this.gbox().cy:this.y(t-this.gbox().height/2)},gbox:function(){var t=this.bbox(),e=this.transform();return t.x+=e.x,t.x2+=e.x,t.cx+=e.x,t.y+=e.y,t.y2+=e.y,t.cy+=e.y,t}},construct:{group:function(){return this.put(new v.G)}}}),v.extend(v.Element,{siblings:function(){return this.parent().children()},position:function(){return this.parent().index(this)},next:function(){return this.siblings()[this.position()+1]},previous:function(){return this.siblings()[this.position()-1]},forward:function(){var t=this.position()+1,e=this.parent();return e.removeElement(this).add(this,t),e instanceof v.Doc&&e.node.appendChild(e.defs().node),this},backward:function(){var t=this.position();return t>0&&this.parent().removeElement(this).add(this,t-1),this},front:function(){var t=this.parent();return t.node.appendChild(this.node),t instanceof v.Doc&&t.node.appendChild(t.defs().node),this},back:function(){return this.position()>0&&this.parent().removeElement(this).add(this,0),this},before:function(t){t.remove();var e=this.position();return this.parent().add(t,e),this},after:function(t){t.remove();var e=this.position();return this.parent().add(t,e+1),this}}),v.Mask=v.invent({create:function(){this.constructor.call(this,v.create("mask")),this.targets=[]},inherit:v.Container,extend:{remove:function(){for(var t=this.targets.length-1;t>=0;t--)this.targets[t]&&this.targets[t].unmask();return this.targets=[],this.parent().removeElement(this),this}},construct:{mask:function(){return this.defs().put(new v.Mask)}}}),v.extend(v.Element,{maskWith:function(t){return this.masker=t instanceof v.Mask?t:this.parent().mask().add(t),this.masker.targets.push(this),this.attr("mask",'url("#'+this.masker.attr("id")+'")')},unmask:function(){return delete this.masker,this.attr("mask",null)}}),v.ClipPath=v.invent({create:function(){this.constructor.call(this,v.create("clipPath")),this.targets=[]},inherit:v.Container,extend:{remove:function(){for(var t=this.targets.length-1;t>=0;t--)this.targets[t]&&this.targets[t].unclip();return this.targets=[],this.parent().removeElement(this),this}},construct:{clip:function(){return this.defs().put(new v.ClipPath)}}}),v.extend(v.Element,{clipWith:function(t){return this.clipper=t instanceof v.ClipPath?t:this.parent().clip().add(t),this.clipper.targets.push(this),this.attr("clip-path",'url("#'+this.clipper.attr("id")+'")')},unclip:function(){return delete this.clipper,this.attr("clip-path",null)}}),v.Gradient=v.invent({create:function(t){this.constructor.call(this,v.create(t+"Gradient")),this.type=t},inherit:v.Container,extend:{at:function(t,e,i){return this.put(new v.Stop).update(t,e,i)},update:function(t){return this.clear(),"function"==typeof t&&t.call(this,this),this},fill:function(){return"url(#"+this.id()+")"},toString:function(){return this.fill()},attr:function(t,e,i){return"transform"==t&&(t="gradientTransform"),v.Container.prototype.attr.call(this,t,e,i)}},construct:{gradient:function(t,e){return this.defs().gradient(t,e)}}}),v.extend(v.Gradient,v.FX,{from:function(t,e){return"radial"==(this._target||this).type?this.attr({fx:new v.Number(t),fy:new v.Number(e)}):this.attr({x1:new v.Number(t),y1:new v.Number(e)})},to:function(t,e){return"radial"==(this._target||this).type?this.attr({cx:new v.Number(t),cy:new v.Number(e)}):this.attr({x2:new v.Number(t),y2:new v.Number(e)})}}),v.extend(v.Defs,{gradient:function(t,e){return this.put(new v.Gradient(t)).update(e)}}),v.Stop=v.invent({create:"stop",inherit:v.Element,extend:{update:function(t){return("number"==typeof t||t instanceof v.Number)&&(t={offset:arguments[0],color:arguments[1],opacity:arguments[2]}),null!=t.opacity&&this.attr("stop-opacity",t.opacity),null!=t.color&&this.attr("stop-color",t.color),null!=t.offset&&this.attr("offset",new v.Number(t.offset)),this}}}),v.Pattern=v.invent({create:"pattern",inherit:v.Container,extend:{fill:function(){return"url(#"+this.id()+")"},update:function(t){return this.clear(),"function"==typeof t&&t.call(this,this),this},toString:function(){return this.fill()},attr:function(t,e,i){return"transform"==t&&(t="patternTransform"),v.Container.prototype.attr.call(this,t,e,i)}},construct:{pattern:function(t,e,i){return this.defs().pattern(t,e,i)}}}),v.extend(v.Defs,{pattern:function(t,e,i){return this.put(new v.Pattern).update(i).attr({x:0,y:0,width:t,height:e,patternUnits:"userSpaceOnUse"})}}),v.Doc=v.invent({create:function(t){t&&(t="string"==typeof t?e.getElementById(t):t,"svg"==t.nodeName?this.constructor.call(this,t):(this.constructor.call(this,v.create("svg")),t.appendChild(this.node),this.size("100%","100%")),this.namespace().defs())},inherit:v.Container,extend:{namespace:function(){return this.attr({xmlns:v.ns,version:"1.1"}).attr("xmlns:xlink",v.xlink,v.xmlns).attr("xmlns:svgjs",v.svgjs,v.xmlns)},defs:function(){if(!this._defs){var t;this._defs=(t=this.node.getElementsByTagName("defs")[0])?v.adopt(t):new v.Defs,this.node.appendChild(this._defs.node)}return this._defs},parent:function(){return"#document"==this.node.parentNode.nodeName?null:this.node.parentNode},spof:function(){var t=this.node.getScreenCTM();return t&&this.style("left",-t.e%1+"px").style("top",-t.f%1+"px"),this},remove:function(){return this.parent()&&this.parent().removeChild(this.node),this}}}),v.Shape=v.invent({create:function(t){this.constructor.call(this,t)},inherit:v.Element}),v.Bare=v.invent({create:function(t,e){if(this.constructor.call(this,v.create(t)),e)for(var i in e.prototype)"function"==typeof e.prototype[i]&&(this[i]=e.prototype[i])},inherit:v.Element,extend:{words:function(t){for(;this.node.hasChildNodes();)this.node.removeChild(this.node.lastChild);return this.node.appendChild(e.createTextNode(t)),this}}}),v.extend(v.Parent,{element:function(t,e){return this.put(new v.Bare(t,e))},symbol:function(){return this.defs().element("symbol",v.Container)}}),v.Use=v.invent({create:"use",inherit:v.Shape,extend:{element:function(t,e){return this.attr("href",(e||"")+"#"+t,v.xlink)}},construct:{use:function(t,e){return this.put(new v.Use).element(t,e)}}}),v.Rect=v.invent({create:"rect",inherit:v.Shape,construct:{rect:function(t,e){return this.put(new v.Rect).size(t,e)}}}),v.Circle=v.invent({create:"circle",inherit:v.Shape,construct:{circle:function(t){return this.put(new v.Circle).rx(new v.Number(t).divide(2)).move(0,0)}}}),v.extend(v.Circle,v.FX,{rx:function(t){return this.attr("r",t)},ry:function(t){return this.rx(t)}}),v.Ellipse=v.invent({create:"ellipse",inherit:v.Shape,construct:{ellipse:function(t,e){return this.put(new v.Ellipse).size(t,e).move(0,0)}}}),v.extend(v.Ellipse,v.Rect,v.FX,{rx:function(t){return this.attr("rx",t)},ry:function(t){return this.attr("ry",t)}}),v.extend(v.Circle,v.Ellipse,{x:function(t){return null==t?this.cx()-this.rx():this.cx(t+this.rx())},y:function(t){return null==t?this.cy()-this.ry():this.cy(t+this.ry())},cx:function(t){return null==t?this.attr("cx"):this.attr("cx",t)},cy:function(t){return null==t?this.attr("cy"):this.attr("cy",t)},width:function(t){return null==t?2*this.rx():this.rx(new v.Number(t).divide(2))},height:function(t){return null==t?2*this.ry():this.ry(new v.Number(t).divide(2))},size:function(t,e){var i=h(this,t,e);return this.rx(new v.Number(i.width).divide(2)).ry(new v.Number(i.height).divide(2))}}),v.Line=v.invent({create:"line",inherit:v.Shape,extend:{array:function(){return new v.PointArray([[this.attr("x1"),this.attr("y1")],[this.attr("x2"),this.attr("y2")]])},plot:function(t,e,i,n){return t="undefined"!=typeof e?{x1:t,y1:e,x2:i,y2:n}:new v.PointArray(t).toLine(),this.attr(t)},move:function(t,e){return this.attr(this.array().move(t,e).toLine())},size:function(t,e){var i=h(this,t,e);return this.attr(this.array().size(i.width,i.height).toLine())}},construct:{line:function(t,e,i,n){return this.put(new v.Line).plot(t,e,i,n)}}}),v.Polyline=v.invent({create:"polyline",inherit:v.Shape,construct:{polyline:function(t){return this.put(new v.Polyline).plot(t)}}}),v.Polygon=v.invent({create:"polygon",inherit:v.Shape,construct:{polygon:function(t){return this.put(new v.Polygon).plot(t)}}}),v.extend(v.Polyline,v.Polygon,{array:function(){return this._array||(this._array=new v.PointArray(this.attr("points")))},plot:function(t){return this.attr("points",this._array=new v.PointArray(t))},move:function(t,e){return this.attr("points",this.array().move(t,e))},size:function(t,e){var i=h(this,t,e);return this.attr("points",this.array().size(i.width,i.height))}}),v.extend(v.Line,v.Polyline,v.Polygon,{morphArray:v.PointArray,x:function(t){return null==t?this.bbox().x:this.move(t,this.bbox().y)},y:function(t){return null==t?this.bbox().y:this.move(this.bbox().x,t)},width:function(t){var e=this.bbox();return null==t?e.width:this.size(t,e.height)},height:function(t){var e=this.bbox();return null==t?e.height:this.size(e.width,t)}}),v.Path=v.invent({create:"path",inherit:v.Shape,extend:{morphArray:v.PathArray,array:function(){return this._array||(this._array=new v.PathArray(this.attr("d")))},plot:function(t){return this.attr("d",this._array=new v.PathArray(t))},move:function(t,e){return this.attr("d",this.array().move(t,e))},x:function(t){return null==t?this.bbox().x:this.move(t,this.bbox().y)},y:function(t){return null==t?this.bbox().y:this.move(this.bbox().x,t)},size:function(t,e){var i=h(this,t,e);return this.attr("d",this.array().size(i.width,i.height))},width:function(t){return null==t?this.bbox().width:this.size(t,this.bbox().height)},height:function(t){return null==t?this.bbox().height:this.size(this.bbox().width,t)}},construct:{path:function(t){return this.put(new v.Path).plot(t)}}}),v.Image=v.invent({create:"image",inherit:v.Shape,extend:{load:function(t){if(!t)return this;var i=this,n=e.createElement("img");return n.onload=function(){var e=i.parent(v.Pattern);null!==e&&(0==i.width()&&0==i.height()&&i.size(n.width,n.height),e&&0==e.width()&&0==e.height()&&e.size(i.width(),i.height()),"function"==typeof i._loaded&&i._loaded.call(i,{width:n.width,height:n.height,ratio:n.width/n.height,url:t}))},n.onerror=function(t){"function"==typeof i._error&&i._error.call(i,t)},this.attr("href",n.src=this.src=t,v.xlink)},loaded:function(t){return this._loaded=t,this},error:function(t){return this._error=t,this}},construct:{image:function(t,e,i){return this.put(new v.Image).load(t).size(e||0,i||e||0)}}}),v.Text=v.invent({create:function(){this.constructor.call(this,v.create("text")),this.dom.leading=new v.Number(1.3),this._rebuild=!0,this._build=!1,this.attr("font-family",v.defaults.attrs["font-family"])},inherit:v.Shape,extend:{x:function(t){return null==t?this.attr("x"):(this.textPath||this.lines().each(function(){this.dom.newLined&&this.x(t)}),this.attr("x",t))},y:function(t){var e=this.attr("y"),i="number"==typeof e?e-this.bbox().y:0;return null==t?"number"==typeof e?e-i:e:this.attr("y","number"==typeof t?t+i:t)},cx:function(t){return null==t?this.bbox().cx:this.x(t-this.bbox().width/2)},cy:function(t){return null==t?this.bbox().cy:this.y(t-this.bbox().height/2)},text:function(t){if("undefined"==typeof t){for(var t="",e=this.node.childNodes,i=0,n=e.length;n>i;++i)0!=i&&3!=e[i].nodeType&&1==v.adopt(e[i]).dom.newLined&&(t+="\n"),t+=e[i].textContent;return t}if(this.clear().build(!0),"function"==typeof t)t.call(this,this);else{t=t.split("\n");for(var i=0,r=t.length;r>i;i++)this.tspan(t[i]).newLine()}return this.build(!1).rebuild()},size:function(t){return this.attr("font-size",t).rebuild()},leading:function(t){return null==t?this.dom.leading:(this.dom.leading=new v.Number(t),this.rebuild())},lines:function(){var t=(this.textPath&&this.textPath()||this).node,e=v.utils.map(v.utils.filterSVGElements(t.childNodes),function(t){return v.adopt(t)});return new v.Set(e)},rebuild:function(t){if("boolean"==typeof t&&(this._rebuild=t),this._rebuild){var e=this,i=0,n=this.dom.leading*new v.Number(this.attr("font-size"));this.lines().each(function(){this.dom.newLined&&(this.textPath||this.attr("x",e.attr("x")),"\n"==this.text()?i+=n:(this.attr("dy",n+i),i=0))}),this.fire("rebuild")}return this},build:function(t){return this._build=!!t,this},setData:function(t){return this.dom=t,this.dom.leading=new v.Number(t.leading||1.3),this}},construct:{text:function(t){return this.put(new v.Text).text(t)},plain:function(t){return this.put(new v.Text).plain(t)}}}),v.Tspan=v.invent({create:"tspan",inherit:v.Shape,extend:{text:function(t){return null==t?this.node.textContent+(this.dom.newLined?"\n":""):("function"==typeof t?t.call(this,this):this.plain(t),this)},dx:function(t){return this.attr("dx",t)},dy:function(t){return this.attr("dy",t)},newLine:function(){var t=this.parent(v.Text);return this.dom.newLined=!0,this.dy(t.dom.leading*t.attr("font-size")).attr("x",t.x())}}}),v.extend(v.Text,v.Tspan,{plain:function(t){return this._build===!1&&this.clear(),this.node.appendChild(e.createTextNode(t)),this},tspan:function(t){var e=(this.textPath&&this.textPath()||this).node,i=new v.Tspan;return this._build===!1&&this.clear(),e.appendChild(i.node),i.text(t)},clear:function(){for(var t=(this.textPath&&this.textPath()||this).node;t.hasChildNodes();)t.removeChild(t.lastChild);return this},length:function(){return this.node.getComputedTextLength()}}),v.TextPath=v.invent({create:"textPath",inherit:v.Parent,parent:v.Text,construct:{path:function(t){for(var e=new v.TextPath,i=this.doc().defs().path(t);this.node.hasChildNodes();)e.node.appendChild(this.node.firstChild);return this.node.appendChild(e.node),e.attr("href","#"+i,v.xlink),this},plot:function(t){var e=this.track();return e&&e.plot(t),this},track:function(){var t=this.textPath();return t?t.reference("href"):void 0},textPath:function(){return this.node.firstChild&&"textPath"==this.node.firstChild.nodeName?v.adopt(this.node.firstChild):void 0}}}),v.Nested=v.invent({create:function(){this.constructor.call(this,v.create("svg")),this.style("overflow","visible")},inherit:v.Container,construct:{nested:function(){return this.put(new v.Nested)}}}),v.A=v.invent({create:"a",inherit:v.Container,extend:{to:function(t){return this.attr("href",t,v.xlink)},show:function(t){return this.attr("show",t,v.xlink)},target:function(t){return this.attr("target",t)}},construct:{link:function(t){return this.put(new v.A).to(t)}}}),v.extend(v.Element,{linkTo:function(t){var e=new v.A;return"function"==typeof t?t.call(e,e):e.to(t),this.parent().put(e).put(this)}}),v.Marker=v.invent({create:"marker",inherit:v.Container,extend:{width:function(t){return this.attr("markerWidth",t)},height:function(t){return this.attr("markerHeight",t)},ref:function(t,e){return this.attr("refX",t).attr("refY",e)},update:function(t){return this.clear(),"function"==typeof t&&t.call(this,this),this},toString:function(){return"url(#"+this.id()+")"}},construct:{marker:function(t,e,i){return this.defs().marker(t,e,i)}}}),v.extend(v.Defs,{marker:function(t,e,i){return this.put(new v.Marker).size(t,e).ref(t/2,e/2).viewbox(0,0,t,e).attr("orient","auto").update(i)}}),v.extend(v.Line,v.Polyline,v.Polygon,v.Path,{marker:function(t,e,i,n){var r=["marker"];return"all"!=t&&r.push(t),r=r.join("-"),t=arguments[1]instanceof v.Marker?arguments[1]:this.doc().marker(e,i,n),this.attr(r,t)}});var y={stroke:["color","width","opacity","linecap","linejoin","miterlimit","dasharray","dashoffset"],fill:["color","opacity","rule"],prefix:function(t,e){return"color"==e?t:t+"-"+e}};["fill","stroke"].forEach(function(t){var e,i={};i[t]=function(i){if("string"==typeof i||v.Color.isRgb(i)||i&&"function"==typeof i.fill)this.attr(t,i);else for(e=y[t].length-1;e>=0;e--)null!=i[y[t][e]]&&this.attr(y.prefix(t,y[t][e]),i[y[t][e]]);return this},v.extend(v.Element,v.FX,i)}),v.extend(v.Element,v.FX,{rotate:function(t,e,i){return this.transform({rotation:t,cx:e,cy:i})},skew:function(t,e,i,n){return this.transform({skewX:t,skewY:e,cx:i,cy:n})},scale:function(t,e,i,n){return 1==arguments.length||3==arguments.length?this.transform({scale:t,cx:e,cy:i}):this.transform({scaleX:t,scaleY:e,cx:i,cy:n})},translate:function(t,e){return this.transform({x:t,y:e})},flip:function(t,e){return this.transform({flip:t,offset:e})},matrix:function(t){return this.attr("transform",new v.Matrix(t))},opacity:function(t){return this.attr("opacity",t)},dx:function(t){return this.x((this instanceof v.FX?0:this.x())+t,!0)},dy:function(t){return this.y((this instanceof v.FX?0:this.y())+t,!0)},dmove:function(t,e){return this.dx(t).dy(e)}}),v.extend(v.Rect,v.Ellipse,v.Circle,v.Gradient,v.FX,{radius:function(t,e){var i=(this._target||this).type;return"radial"==i||"circle"==i?this.attr("r",new v.Number(t)):this.rx(t).ry(null==e?t:e)}}),v.extend(v.Path,{length:function(){return this.node.getTotalLength()},pointAt:function(t){return this.node.getPointAtLength(t)}}),v.extend(v.Parent,v.Text,v.FX,{font:function(t){for(var e in t)"leading"==e?this.leading(t[e]):"anchor"==e?this.attr("text-anchor",t[e]):"size"==e||"family"==e||"weight"==e||"stretch"==e||"variant"==e||"style"==e?this.attr("font-"+e,t[e]):this.attr(e,t[e]);return this}}),v.Set=v.invent({create:function(t){Array.isArray(t)?this.members=t:this.clear()},extend:{add:function(){var t,e,i=[].slice.call(arguments);for(t=0,e=i.length;e>t;t++)this.members.push(i[t]);return this},remove:function(t){var e=this.index(t);return e>-1&&this.members.splice(e,1),this},each:function(t){for(var e=0,i=this.members.length;i>e;e++)t.apply(this.members[e],[e,this.members]);return this},clear:function(){return this.members=[],this},length:function(){return this.members.length},has:function(t){return this.index(t)>=0},index:function(t){return this.members.indexOf(t)},get:function(t){return this.members[t]},first:function(){return this.get(0)},last:function(){return this.get(this.members.length-1)},valueOf:function(){return this.members},bbox:function(){var t=new v.BBox;if(0==this.members.length)return t;var e=this.members[0].rbox();return t.x=e.x,t.y=e.y,t.width=e.width,t.height=e.height,this.each(function(){t=t.merge(this.rbox())}),t}},construct:{set:function(t){return new v.Set(t)}}}),v.FX.Set=v.invent({create:function(t){this.set=t}}),v.Set.inherit=function(){var t,e=[];for(var t in v.Shape.prototype)"function"==typeof v.Shape.prototype[t]&&"function"!=typeof v.Set.prototype[t]&&e.push(t);e.forEach(function(t){v.Set.prototype[t]=function(){for(var e=0,i=this.members.length;i>e;e++)this.members[e]&&"function"==typeof this.members[e][t]&&this.members[e][t].apply(this.members[e],arguments);return"animate"==t?this.fx||(this.fx=new v.FX.Set(this)):this}}),e=[];for(var t in v.FX.prototype)"function"==typeof v.FX.prototype[t]&&"function"!=typeof v.FX.Set.prototype[t]&&e.push(t);e.forEach(function(t){v.FX.Set.prototype[t]=function(){for(var e=0,i=this.set.members.length;i>e;e++)this.set.members[e].fx[t].apply(this.set.members[e].fx,arguments);return this}})},v.extend(v.Element,{data:function(t,e,i){if("object"==typeof t)for(e in t)this.data(e,t[e]);else if(arguments.length<2)try{return JSON.parse(this.attr("data-"+t))}catch(n){return this.attr("data-"+t)}else this.attr("data-"+t,null===e?null:i===!0||"string"==typeof e||"number"==typeof e?e:JSON.stringify(e));return this}}),v.extend(v.Element,{remember:function(t,e){if("object"==typeof arguments[0])for(var e in t)this.remember(e,t[e]);else{if(1==arguments.length)return this.memory()[t];this.memory()[t]=e}return this},forget:function(){if(0==arguments.length)this._memory={};else for(var t=arguments.length-1;t>=0;t--)delete this.memory()[arguments[t]];return this},memory:function(){return this._memory||(this._memory={})}}),v.get=function(t){var i=e.getElementById(g(t)||t);return v.adopt(i)},v.select=function(t,i){return new v.Set(v.utils.map((i||e).querySelectorAll(t),function(t){return v.adopt(t)}))},v.extend(v.Parent,{select:function(t){return v.select(t,this.node)}});var w="abcdef".split("");if("function"!=typeof b){var b=function(t,i){i=i||{bubbles:!1,cancelable:!1,detail:void 0};var n=e.createEvent("CustomEvent");return n.initCustomEvent(t,i.bubbles,i.cancelable,i.detail),n};b.prototype=t.Event.prototype,t.CustomEvent=b}return function(e){for(var i=0,n=["moz","webkit"],r=0;r<n.length&&!t.requestAnimationFrame;++r)e.requestAnimationFrame=e[n[r]+"RequestAnimationFrame"],e.cancelAnimationFrame=e[n[r]+"CancelAnimationFrame"]||e[n[r]+"CancelRequestAnimationFrame"];e.requestAnimationFrame=e.requestAnimationFrame||function(t){var n=(new Date).getTime(),r=Math.max(0,16-(n-i)),s=e.setTimeout(function(){t(n+r)},r);return i=n+r,s},e.cancelAnimationFrame=e.cancelAnimationFrame||e.clearTimeout}(t),v});;$(function () {
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
    
});;;(function ($) {
    'use strict';

    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/(^\s*)|(\s*$)/g, '');
        }
    }

    function Rotateable(elem, option) {

        var that = this;
        that.opts = $.extend({}, Rotateable.DEFAULTS, option);
        that.elem = elem;
        that.$elem = $(elem);
        that.rotating = false;
        that.down = false;

        that.init();
    }

    Rotateable.DEFAULTS = {
        handle: false, // 拖动按钮。document: 整个文档
        centerX: 0, // 圆心点x 默认 对象中心x
        centerY: 0, // 圆心点y 默认 对象中心y,
        start: function(event, ui) {}, // 开始旋转
        rotate: function(event, ui) {}, // 旋转中
        end: function(event, ui) {}, // 旋转结束
    };


    Rotateable.getDeg = function ($elem) {

        /*
         * 解析matrix矩阵，0°-360°，返回旋转角度
         * 当a=b||-a=b,0<=deg<=180
         * 当-a+b=180,180<=deg<=270
         * 当a+b=180,270<=deg<=360
         *
         * 当0<=deg<=180,deg=d;
         * 当180<deg<=270,deg=180+c;
         * 当270<deg<=360,deg=360-(c||d);
         * */
        function getmatrix(a, b, c, d, e, f) {
            var aa = Math.round(180 * Math.asin(a) / Math.PI);
            var bb = Math.round(180 * Math.acos(b) / Math.PI);
            var cc = Math.round(180 * Math.asin(c) / Math.PI);
            var dd = Math.round(180 * Math.acos(d) / Math.PI);
            var deg = 0;
            if (aa == bb || -aa == bb) {
                deg = dd;
            } else if (-aa + bb == 180) {
                deg = 180 + cc;
            } else if (aa + bb == 180) {
                deg = 360 - cc || 360 - dd;
            }
            return deg >= 360 ? 0 : deg;
        }

        var matrix = $elem.css('transform');
        var deg = 0;
        var reg = /matrix\(([\d\D]*)\)/;
        if (matrix !== 'none') {
            var arr = reg.exec(matrix)[1].split(',');
            deg = getmatrix(parseFloat(arr[0].trim()), parseFloat(arr[1].trim()), parseFloat(arr[2].trim()),
                parseFloat(arr[3].trim()), parseFloat(arr[4].trim()), parseFloat(arr[5].trim()))
        }
        return deg;
    };

    var fn = Rotateable.prototype;

    fn.init = function () {
        var that = this;
        var opts = that.opts;

        // 鼠标移动时处理事件
        function movehandle(e) {
            e.stopPropagation();

            var deg = angle(opts.centerX, opts.centerY, e.clientX, e.clientY - that.startDeg);
            rotate(deg);

            if (!that.rotating) {
                that.rotating = true;
                that.opts.start(e, that.elem);
            } else {
                e.deg = deg;
                that.opts.rotate(e, that.elem);
            }
        }

        // 计算两点的线在页面中的角度
        function angle(centerx, centery, endx, endy) {
            var diff_x = endx - centerx,
                diff_y = endy - centery;
            var c = 360 * Math.atan2(diff_y, diff_x) / (2 * Math.PI);
            c = c <= -90 ? (360 + c) : c;
            return c + 90;
        }



        // 设置角度
        function rotate(angle, step) {
            that.$elem.css('transform', 'rotateZ(' + (that.startRotate + angle) + 'deg)');
        }

        //初始化圆心点
        if (opts.centerX == 0 && opts.centerY == 0) {
            opts.centerX = that.$elem.offset().left + that.$elem.outerWidth() / 2;
            opts.centerY = that.$elem.offset().top + that.$elem.outerHeight() / 2
        }

        if (!opts.handle) {
            that.$handle = $('<div class="ui-rotate-handle"></div>');
            that.$elem.append(that.$handle);
            //that.$handle = that.$elem.find('.resizable-handle');
        } else {
            that.$handle = $(opts.handle);
        }


        that.$handle.on('mousedown.ui.rotateable', function (e) {
            that.down = true;
            e.stopPropagation();

            that.startDeg = angle(opts.centerX, opts.centerY, event.clientX, event.clientY);
            that.startRotate = Rotateable.getDeg(that.$elem);

            $(document).on('mousemove.ui.rotateable', movehandle);
        });

        $(document).on('mouseup', function (e) {
            that.down = false;
            $(document).off('mousemove.ui.rotateable');

            if (that.rotating) {
                that.rotating = false;
                that.opts.end(e, that.elem);
            }
        });
    };

    fn.enable = function () {

    };

    fn.disable = function () {

    };

    fn.destroy = function () {
        var that = this;
        that.$handle.off('.ui.rotateable');
        if (!that.opts.handle) {
            that.$elem.find('.ui-rotate-handle').remove();
        }
        that.$elem.removeData('ui.rotateable');
    };

    UI.Rotateable = Rotateable;

    function Plugin(option) {
        return $(this).each(function () {
            var $this = $(this);
            var data = $this.data('ui.rotateable');
            if (!data) {
                data = new Rotateable(this, option);
                $this.data('ui.rotateable', data);
            }

            if (typeof option === 'string') {
                data[option]();
            }

        });
    }

    $.fn.rotateable = Plugin;
})(jQuery);
;$(document).ready(function(){
    //Self-Executing Anonymous Func: Part 2 (Public & Private)
    (function( bootstro, $, undefined ) {
        var $elements; //jquery elements to be highlighted
        var count;
        var popovers = []; //contains array of the popovers data
        var activeIndex = null; //index of active item
        var bootstrapVersion = 3;

        var defaults = {
            nextButtonText : 'Next &raquo;', //will be wrapped with button as below
            //nextButton : '<button class="btn btn-primary btn-xs bootstro-next-btn">Next &raquo;</button>',
            prevButtonText : '&laquo; Prev',
            //prevButton : '<button class="btn btn-primary btn-xs bootstro-prev-btn">&laquo; Prev</button>',
            finishButtonText : '<i class="icon-ok"></i> Ok I got it, get back to the site',
            //finishButton : '<button class="btn btn-xs btn-success bootstro-finish-btn"><i class="icon-ok"></i> Ok I got it, get back to the site</button>',
            stopOnBackdropClick : true,
            stopOnEsc : true,
            
            //onComplete : function(params){} //params = {idx : activeIndex}
            //onExit : function(params){} //params = {idx : activeIndex}
            //onStep : function(params){} //params = {idx : activeIndex, direction : [next|prev]}
            //url : String // ajaxed url to get show data from
            
            margin : 100, //if the currently shown element's margin is less than this value
            // the element should be scrolled so that i can be viewed properly. This is useful 
            // for sites which have fixed top/bottom nav bar
        };
        var settings;
        
        
        //===================PRIVATE METHODS======================
        //http://stackoverflow.com/questions/487073/check-if-element-is-visible-after-scrolling
        function is_entirely_visible($elem)
        {
            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
              && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
        }
        
        //add the nav buttons to the popover content;
        
        function add_nav_btn(content, i)
        {
            var $el = get_element(i);
            var nextButton, prevButton, finishButton, defaultBtnClass;
            if (bootstrapVersion == 2)
                defaultBtnClass = "btn btn-primary btn-mini";
            else 
                defaultBtnClass = "btn btn-primary btn-xs"; //default bootstrap version 3
            content = content + "<div class='bootstro-nav-wrapper'>";
            if ($el.attr('data-bootstro-nextButton'))
            {
                nextButton = $el.attr('data-bootstro-nextButton');
            }
            else if ( $el.attr('data-bootstro-nextButtonText') )
            {
                nextButton = '<button class="' + defaultBtnClass + ' bootstro-next-btn">' + $el.attr('data-bootstro-nextButtonText') +  '</button>';
            }
            else 
            {
                if (typeof settings.nextButton != 'undefined' /*&& settings.nextButton != ''*/)
                    nextButton = settings.nextButton;
                else
                    nextButton = '<button class="' + defaultBtnClass + ' bootstro-next-btn">' + settings.nextButtonText + '</button>';
            }
            
            if ($el.attr('data-bootstro-prevButton'))
            {
                prevButton = $el.attr('data-bootstro-prevButton');
            }
            else if ( $el.attr('data-bootstro-prevButtonText') )
            {
                prevButton = '<button class="' + defaultBtnClass + ' bootstro-prev-btn">' + $el.attr('data-bootstro-prevButtonText') +  '</button>';
            }
            else 
            {
                if (typeof settings.prevButton != 'undefined' /*&& settings.prevButton != ''*/)
                    prevButton = settings.prevButton;
                else
                    prevButton = '<button class="' + defaultBtnClass + ' bootstro-prev-btn">' + settings.prevButtonText + '</button>';
            }
            
            if ($el.attr('data-bootstro-finishButton'))
            {
                finishButton = $el.attr('data-bootstro-finishButton');
            }
            else if ( $el.attr('data-bootstro-finishButtonText') )
            {
                finishButton = '<button class="' + defaultBtnClass +' bootstro-finish-btn">' + $el.attr('data-bootstro-finishButtonText') +  '</button>';
            }
            else 
            {
                if (typeof settings.finishButton != 'undefined' /*&& settings.finishButton != ''*/)
                    finishButton = settings.finishButton;
                else
                    finishButton = '<button class="' + defaultBtnClass +' bootstro-finish-btn">' + settings.finishButtonText + '</button>';
            }

        
            if (count != 1)
            {
                if (i == 0)
                    content = content + nextButton;
                else if (i == count -1 )
                    content = content + prevButton;
                else 
                    content = content + nextButton + prevButton
            }
            content = content + '</div>';
              
            content = content +'<div class="bootstro-finish-btn-wrapper">' + finishButton + '</div>';
            return content;
        }
        
        //prep objects from json and return selector
        process_items = function(popover) 
        {
            var selectorArr = [];
            $.each(popover, function(t,e){
                //only deal with the visible element
                //build the selector
                $.each(e, function(j, attr){
                    $(e.selector).attr('data-bootstro-' + j, attr);
                });
                if ($(e.selector).is(":visible"))
                    selectorArr.push(e.selector);
            });
            return selectorArr.join(",");
        }

        //get the element to intro at stack i 
        get_element = function(i)
        {
            //get the element with data-bootstro-step=i 
            //or otherwise the the natural order of the set
            if ($elements.filter("[data-bootstro-step=" + i +"]").size() > 0)
                return $elements.filter("[data-bootstro-step=" + i +"]");
            else 
            {
                return $elements.eq(i);
                /*
                nrOfElementsWithStep = 0;
                $elements.filter("[data-bootstro-step!='']").each(function(j,e){
                    nrOfElementsWithStep ++;
                    if (j > i)
                        return $elements.filter(":not([data-bootstro-step])").eq(i - nrOfElementsWithStep);
                })
                */
            }
        }
        
        get_popup = function(i)
        {
            var p = {};
            var $el = get_element(i);
            //p.selector = selector;
            var t = '';
            if (count > 1)
            {
                t = "<span class='label label-success'>" + (i +1)  + "/" + count + "</span>";
            }
            p.title = $el.attr('data-bootstro-title') || '';
            if (p.title != '' && t != '')
                p.title = t + ' - ' + p.title;
            else if (p.title == '') 
                p.title = t;

            p.content = $el.attr('data-bootstro-content') || '';
            p.content = add_nav_btn(p.content, i);
            p.placement = $el.attr('data-bootstro-placement') || 'top';
            var style = ''; 
            if ($el.attr('data-bootstro-width'))
            {
                p.width = $el.attr('data-bootstro-width'); 
                style = style + 'width:' + $el.attr('data-bootstro-width') + ';'
            }
            if ($el.attr('data-bootstro-height'))
            {
                p.height = $el.attr('data-bootstro-height');
                style = style + 'height:' + $el.attr('data-bootstro-height') + ';'
            }
            p.trigger = 'manual'; //always set to manual.
           
            p.html = $el.attr('data-bootstro-html') || 'top';
            if ($el.attr('data-bootstro-container')) {
                p.container = $el.attr('data-bootstro-container');
            }
            
            //resize popover if it's explicitly specified
            //note: this is ugly. Could have been best if popover supports width & height
            p.template = '<div class="popover" style="' + style + '"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div>' +
             '</div>';
            
            return p;
            
        }

        //===================PUBLIC METHODS======================
        //destroy popover at stack index i
        bootstro.destroy_popover = function(i)
        {
            var i = i || 0;
            if (i != 'all')
            {
                var $el = get_element(i);//$elements.eq(i); 
                $el.popover('destroy').removeClass('bootstro-highlight');
            }
            /*
            else //destroy all
            {
                $elements.each(function(e){
                    
                    $(e).popover('destroy').removeClass('bootstro-highlight');
                });
            }
            */
        };
        
        //destroy active popover and remove backdrop
        bootstro.stop = function()
        {
            bootstro.destroy_popover(activeIndex);
            bootstro.unbind();
            $("div.bootstro-backdrop").remove();
            if (typeof settings.onExit == 'function')
                settings.onExit.call(this,{idx : activeIndex});
        };

        //go to the popover number idx starting from 0
        bootstro.go_to = function(idx) 
        {
            //destroy current popover if any
            bootstro.destroy_popover(activeIndex);
            if (count != 0)
            {
                var p = get_popup(idx);
                var $el = get_element(idx);
                
                $el.popover(p).popover('show');
                  
                //scroll if neccessary
                var docviewTop = $(window).scrollTop();
                var top = Math.min($(".popover.in").offset().top, $el.offset().top);
                
                //distance between docviewTop & min.
                var topDistance = top - docviewTop;
                
                if (topDistance < settings.margin) //the element too up above
                    $('html,body').animate({
                        scrollTop: top - settings.margin},
                    'slow');
                else if(!is_entirely_visible($(".popover.in")) || !is_entirely_visible($el))
                    //the element is too down below
                    $('html,body').animate({
                        scrollTop: top - settings.margin},
                    'slow');
                // html 
                  
                $el.addClass('bootstro-highlight');
                activeIndex = idx;
            }
        };
        
        bootstro.next = function()
        {
            if (activeIndex + 1 == count)
            {
                if (typeof settings.onComplete == 'function')
                    settings.onComplete.call(this, {idx : activeIndex});//
            }
            else 
            {
                bootstro.go_to(activeIndex + 1);
                if (typeof settings.onStep == 'function')
                    settings.onStep.call(this, {idx : activeIndex, direction : 'next'});//
            }
        };
        
        bootstro.prev = function()
        {
            if (activeIndex == 0)
            {
                /*
                if (typeof settings.onRewind == 'function')
                    settings.onRewind.call(this, {idx : activeIndex, direction : 'prev'});//
                */
            }
            else
            {
                bootstro.go_to(activeIndex -1);
                if (typeof settings.onStep == 'function')
                    settings.onStep.call(this, {idx : activeIndex, direction : 'prev'});//
            }
        };
        
        bootstro._start = function(selector)
        {
            selector = selector || '.bootstro';

            $elements = $(selector);
            count  = $elements.size();
            if (count > 0 && $('div.bootstro-backdrop').length === 0)
            {
                // Prevents multiple copies
                $('<div class="bootstro-backdrop"></div>').appendTo('body');
                bootstro.bind();
                bootstro.go_to(0);
            }
        };
        
        bootstro.start = function(selector, options)
        {
            settings = $.extend(true, {}, defaults); //deep copy
            $.extend(settings, options || {});
            //if options specifies a URL, get the intro configuration from URL via ajax
            if (typeof settings.url != 'undefined')
            {
                //get config from ajax
                $.ajax({
                    url : settings.url,
                    success : function(data){
                        if (data.success)
                        {
                            //result is an array of {selector:'','title':'','width', ...}
                            var popover = data.result;
                            //console.log(popover);
                            selector = process_items(popover);
                            bootstro._start(selector);
                        }
                    }
                });
            }
            //if options specifies an items object use it to load the intro configuration
            //settings.items is an array of {selector:'','title':'','width', ...}
            else if (typeof settings.items != 'undefined')
            {
                bootstro._start(process_items(settings.items))
            }
            else 
            {
                bootstro._start(selector);
            }
        };
        
        bootstro.set_bootstrap_version = function(ver)
        {
            bootstrapVersion = ver;
        }
          
        //bind the nav buttons click event
        bootstro.bind = function()
        {
            bootstro.unbind();
            
            $("html").on('click.bootstro', ".bootstro-next-btn", function(e){
                bootstro.next();
                e.preventDefault();
                return false;
            });
            
            $("html").on('click.bootstro', ".bootstro-prev-btn", function(e){
                bootstro.prev();
                e.preventDefault();
                return false;
            });
      
            //end of show
            $("html").on('click.bootstro', ".bootstro-finish-btn", function(e){
                e.preventDefault();
                bootstro.stop();
            });        
            
            if (settings.stopOnBackdropClick)
            {
                $("html").on('click.bootstro', 'div.bootstro-backdrop', function(e){
                    if ($(e.target).hasClass('bootstro-backdrop'))
                        bootstro.stop();
                });
            }
                
            //bind the key event
            $(document).on('keydown.bootstro', function(e){
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 39 || code == 40)
                    bootstro.next();
                else if (code == 37 || code == 38)
                    bootstro.prev();
                else if(code == 27 && settings.stopOnEsc)
                    bootstro.stop();
            })
        };
        
        bootstro.unbind = function()
        {
            $("html").unbind('click.bootstro');
            $(document).unbind('keydown.bootstro');
        }
           
     }( window.bootstro = window.bootstro || {}, jQuery ));
});
;;(function ($) {
    var fx = {
        "move": {
            "X": { "next": "move-to-left-from-right",
                "prev": "move-to-right-from-left" },
            "Y": { "next": "move-to-top-from-bottom",
                "prev": "move-to-bottom-from-top" }},
        "move-fade": {
            "X": { "next": "fade-from-right",
                "prev": "fade-from-left" },
            "Y": { "next": "fade-from-bottom",
                "prev": "fade-from-top" }},
        "move-both-fade": {
            "X": { "next": "fade-left-fade-right",
                "prev": "fade-right-fade-left" },
            "Y": { "next": "fade-top-fade-bottom",
                "prev": "fade-bottom-fade-top" }},
        "move-different-easing": {
            "X": { "next": "different-easing-from-right",
                "prev": "different-easing-from-left" },
            "Y": { "next": "different-easing-from-bottom",
                "prev": "different-easing-from-top" }},
        "scale-down-out-move-in": {
            "X": { "next": "scale-down-from-right",
                "prev": "move-to-right-scale-up" },
            "Y": { "next": "scale-down-from-bottom",
                "prev": "move-to-bottom-scale-up" }},
        "move-out-scale-up": {
            "X": { "next": "move-to-left-scale-up",
                "prev": "scale-down-from-left" },
            "Y": { "next": "move-to-top-scale-up",
                "prev": "scale-down-from-top" }},
        "scale-up-up": {
            "X": { "next": "scale-up-scale-up",
                "prev": "scale-down-scale-down" },
            "Y": { "next": "scale-up-scale-up",
                "prev": "scale-down-scale-down" }},
        "scale-down-up": {
            "X": { "next": "scale-down-scale-up",
                "prev": "scale-down-scale-up" },
            "Y": { "next": "scale-down-scale-up",
                "prev": "scale-down-scale-up" }},
        "glue": {
            "X": { "next": "glue-left-from-right",
                "prev": "glue-right-from-left" },
            "Y": { "next": "glue-top-from-bottom",
                "prev": "glue-bottom-from-top" }},
        "flip": {
            "X": { "next": "flip-left",
                "prev": "flip-right" },
            "Y": { "next": "flip-top",
                "prev": "flip-bottom" }},
        "fall": {
            "X": { "next": "fall",
                "prev": "fall" },
            "Y": { "next": "fall",
                "prev": "fall" }},
        "newspaper": {
            "X": { "next": "newspaper",
                "prev": "newspaper" },
            "Y": { "next": "newspaper",
                "prev": "newspaper" }},
        "push": {
            "X": { "next": "push-left-from-right",
                "prev": "push-right-from-left" },
            "Y": { "next": "push-top-from-bottom",
                "prev": "push-bottom-from-top" }},
        "pull": {
            "X": { "next": "push-left-pull-right",
                "prev": "push-right-pull-left" },
            "Y": { "next": "push-bottom-pull-top",
                "prev": "push-top-pull-bottom" }},
        "fold": {
            "X": { "next": "fold-left-from-right",
                "prev": "move-to-right-unfold-left" },
            "Y": { "next": "fold-bottom-from-top",
                "prev": "move-to-top-unfold-bottom" }},
        "unfold": {
            "X": { "next": "move-to-left-unfold-right",
                "prev": "fold-right-from-left" },
            "Y": { "next": "move-to-bottom-unfold-top",
                "prev": "fold-top-from-bottom" }},
        "room": {
            "X": { "next": "room-to-left",
                "prev": "room-to-right" },
            "Y": { "next": "room-to-bottom",
                "prev": "room-to-top" }},
        "cube": {
            "X": { "next": "cube-to-left",
                "prev": "cube-to-right" },
            "Y": { "next": "cube-to-bottom",
                "prev": "cube-to-top" }},
        "carousel": {
            "X": { "next": "carousel-to-left",
                "prev": "carousel-to-right" },
            "Y": { "next": "carousel-to-bottom",
                "prev": "carousel-to-top" }},
        "sides": {
            "X": { "next": "sides",
                "prev": "sides" },
            "Y": { "next": "sides",
                "prev": "sides" }},
        "slide": {
            "X": { "next": "slide",
                "prev": "slide" },
            "Y": { "next": "slide",
                "prev": "slide" }
        }
    };

    // Map transition animation names to in and out classnames
    var animations = {
        // Move
        "move-to-left-from-right": {
            id: 1,
                group: "move",
                label: "Move to left / from right",
                outClass: 'fx-slide-moveToLeft',
                inClass: 'fx-slide-moveFromRight',
                reverse: "move-to-right-from-left"
        },
        "move-to-right-from-left": {
            id: 2,
                group: "move",
                label: "Move to right / from left",
                outClass: 'fx-slide-moveToRight',
                inClass: 'fx-slide-moveFromLeft',
                reverse: "move-to-left-from-right"
        },
        "move-to-top-from-bottom": {
            id: 3,
                group: "move",
                label: "Move to top / from bottom",
                outClass: 'fx-slide-moveToTop',
                inClass: 'fx-slide-moveFromBottom',
                reverse: "move-to-bottom-from-top"
        },
        "move-to-bottom-from-top": {
            id: 4,
                group: "move",
                label: "Move to bottom / from top",
                outClass: 'fx-slide-moveToBottom',
                inClass: 'fx-slide-moveFromTop',
                reverse: "move-to-top-from-bottom"
        },

        // Fade
        "fade-from-right": {
            id: 5,
                group: "fade",
                label: "Fade / from right",
                outClass: 'fx-slide-fade',
                inClass: 'fx-slide-moveFromRight fx-slide-ontop',
                reverse: "fade-from-left"
        },
        "fade-from-left": {
            id: 6,
                group: "fade",
                label: "Fade / from left",
                outClass: 'fx-slide-fade',
                inClass: 'fx-slide-moveFromLeft fx-slide-ontop',
                reverse: "fade-from-right"
        },
        "fade-from-bottom": {
            id: 7,
                group: "fade",
                label: "Fade / from bottom",
                outClass: 'fx-slide-fade',
                inClass: 'fx-slide-moveFromBottom fx-slide-ontop',
                reverse: "fade-from-top"
        },
        "fade-from-top": {
            id: 8,
                group: "fade",
                label: "Fade / from top",
                outClass: 'fx-slide-fade',
                inClass: 'fx-slide-moveFromTop fx-slide-ontop',
                reverse: "fade-from-bottom"
        },
        "fade-left-fade-right": {
            id: 9,
                group: "fade",
                label: "Fade left / Fade right",
                outClass: 'fx-slide-moveToLeftFade',
                inClass: 'fx-slide-moveFromRightFade',
                reverse: "fade-right-fade-left"
        },
        "fade-right-fade-left": {
            id: 10,
                group: "fade",
                label: "Fade right / Fade left",
                outClass: 'fx-slide-moveToRightFade',
                inClass: 'fx-slide-moveFromLeftFade',
                reverse: "fade-left-fade-right"
        },
        "fade-top-fade-bottom": {
            id: 11,
                group: "fade",
                label: "Fade top / Fade bottom",
                outClass: 'fx-slide-moveToTopFade',
                inClass: 'fx-slide-moveFromBottomFade',
                reverse: "fade-bottom-fade-top"
        },
        "fade-bottom-fade-top": {
            id: 12,
                group: "fade",
                label: "Fade bottom / Fade top",
                outClass: 'fx-slide-moveToBottomFade',
                inClass: 'fx-slide-moveFromTopFade',
                reverse: "fade-top-fade-bottom"
        },

        // Different easing
        "different-easing-from-right": {
            id: 13,
                group: "different-easing",
                label: "Different easing / from right",
                outClass: 'fx-slide-moveToLeftEasing fx-slide-ontop',
                inClass: 'fx-slide-moveFromRight',
                reverse: "different-easing-from-left"
        },
        "different-easing-from-left": {
            id: 14,
                group: "different-easing",
                label: "Different easing / from left",
                outClass: 'fx-slide-moveToRightEasing fx-slide-ontop',
                inClass: 'fx-slide-moveFromLeft',
                reverse: "different-easing-from-right"
        },
        "different-easing-from-bottom": {
            id: 15,
                group: "different-easing",
                label: "Different easing / from bottom",
                outClass: 'fx-slide-moveToTopEasing fx-slide-ontop',
                inClass: 'fx-slide-moveFromBottom',
                reverse: "different-easing-from-top"
        },
        "different-easing-from-top": {
            id: 16,
                group: "different-easing",
                label: "Different easing / from top",
                outClass: 'fx-slide-moveToBottomEasing fx-slide-ontop',
                inClass: 'fx-slide-moveFromTop',
                reverse: "different-easing-from-bottom"
        },

        // Scale
        "scale-down-from-right": {
            id: 17,
                group: "scale",
                label: "Scale down / from right",
                outClass: 'fx-slide-scaleDown',
                inClass: 'fx-slide-moveFromRight fx-slide-ontop',
                reverse: "move-to-right-scale-up"
        },
        "scale-down-from-left": {
            id: 18,
                group: "scale",
                label: "Scale down / from left",
                outClass: 'fx-slide-scaleDown',
                inClass: 'fx-slide-moveFromLeft fx-slide-ontop',
                reverse: "move-to-left-scale-up"
        },
        "scale-down-from-bottom": {
            id: 19,
                group: "scale",
                label: "Scale down / from bottom",
                outClass: 'fx-slide-scaleDown',
                inClass: 'fx-slide-moveFromBottom fx-slide-ontop',
                reverse: "move-to-bottom-scale-up"
        },
        "scale-down-from-top": {
            id: 20,
                group: "scale",
                label: "Scale down / from top",
                outClass: 'fx-slide-scaleDown',
                inClass: 'fx-slide-moveFromTop fx-slide-ontop',
                reverse: "move-to-top-scale-up"
        },
        "scale-down-scale-down": {
            id: 21,
                group: "scale",
                label: "Scale down / scale down",
                outClass: 'fx-slide-scaleDown',
                inClass: 'fx-slide-scaleUpDown fx-slide-delay300',
                reverse: "scale-up-scale-up"
        },
        "scale-up-scale-up": {
            id: 22,
                group: "scale",
                label: "Scale up / scale up",
                outClass: 'fx-slide-scaleDownUp',
                inClass: 'fx-slide-scaleUp fx-slide-delay300',
                reverse: "scale-down-scale-down"
        },
        "move-to-left-scale-up": {
            id: 23,
                group: "scale",
                label: "Move to left / scale up",
                outClass: 'fx-slide-moveToLeft fx-slide-ontop',
                inClass: 'fx-slide-scaleUp',
                reverse: "scale-down-from-left"
        },
        "move-to-right-scale-up": {
            id: 24,
                group: "scale",
                label: "Move to right / scale up",
                outClass: 'fx-slide-moveToRight fx-slide-ontop',
                inClass: 'fx-slide-scaleUp',
                reverse: "scale-down-from-right"
        },
        "move-to-top-scale-up": {
            id: 25,
                group: "scale",
                label: "Move to top / scale up",
                outClass: 'fx-slide-moveToTop fx-slide-ontop',
                inClass: 'fx-slide-scaleUp',
                reverse: "scale-down-from-top"
        },
        "move-to-bottom-scale-up": {
            id: 26,
                group: "scale",
                label: "Move to bottom / scale up",
                outClass: 'fx-slide-moveToBottom fx-slide-ontop',
                inClass: 'fx-slide-scaleUp',
                reverse: "scale-down-from-bottom"
        },
        "scale-down-scale-up": {
            id: 27,
                group: "scale",
                label: "Scale down / scale up",
                outClass: 'fx-slide-scaleDownCenter',
                inClass: 'fx-slide-scaleUpCenter fx-slide-delay400',
                reverse: "scale-down-scale-up"
        },

        // Rotate: Glue
        "glue-left-from-right": {
            id: 28,
                group: "rotate:glue",
                label: "Glue left / from right",
                outClass: 'fx-slide-rotateRightSideFirst',
                inClass: 'fx-slide-moveFromRight fx-slide-delay200 fx-slide-ontop',
                reverse: "glue-right-from-left"
        },
        "glue-right-from-left": {
            id: 29,
                group: "rotate:glue",
                label: "Glue right / from left",
                outClass: 'fx-slide-rotateLeftSideFirst',
                inClass: 'fx-slide-moveFromLeft fx-slide-delay200 fx-slide-ontop',
                reverse: "glue-left-from-right"
        },
        "glue-bottom-from-top": {
            id: 30,
                group: "rotate:glue",
                label: "Glue bottom / from top",
                outClass: 'fx-slide-rotateTopSideFirst',
                inClass: 'fx-slide-moveFromTop fx-slide-delay200 fx-slide-ontop',
                reverse: "glue-top-from-bottom"
        },
        "glue-top-from-bottom": {
            id: 31,
                group: "rotate:glue",
                label: "Glue top / from bottom",
                outClass: 'fx-slide-rotateBottomSideFirst',
                inClass: 'fx-slide-moveFromBottom fx-slide-delay200 fx-slide-ontop',
                reverse: "glue-bottom-from-top"
        },

        // Rotate: Flip
        "flip-right": {
            id: 32,
                group: "rotate:flip",
                label: "Flip right",
                outClass: 'fx-slide-flipOutRight',
                inClass: 'fx-slide-flipInLeft fx-slide-delay500',
                reverse: "flip-left"
        },
        "flip-left": {
            id: 33,
                group: "rotate:flip",
                label: "Flip left",
                outClass: 'fx-slide-flipOutLeft',
                inClass: 'fx-slide-flipInRight fx-slide-delay500',
                reverse: "flip-right"
        },
        "flip-top": {
            id: 34,
                group: "rotate:flip",
                label: "Flip top",
                outClass: 'fx-slide-flipOutTop',
                inClass: 'fx-slide-flipInBottom fx-slide-delay500',
                reverse: "flip-bottom"
        },
        "flip-bottom": {
            id: 35,
                group: "rotate:flip",
                label: "Flip bottom",
                outClass: 'fx-slide-flipOutBottom',
                inClass: 'fx-slide-flipInTop fx-slide-delay500',
                reverse: "flip-top"
        },
        "fall": {
            id: 36,
                group: "rotate",
                label: "Fall",
                outClass: 'fx-slide-rotateFall fx-slide-ontop',
                inClass: 'fx-slide-scaleUp',
                reverse: "fall"
        },
        "newspaper": {
            id: 37,
                group: "rotate",
                label: "Newspaper",
                outClass: 'fx-slide-rotateOutNewspaper',
                inClass: 'fx-slide-rotateInNewspaper fx-slide-delay500',
                reverse: "newspaper"
        },

        // Push / Pull
        "push-left-from-right": {
            id: 38,
                group: "rotate:push-pull",
                label: "Push left / from right",
                outClass: 'fx-slide-rotatePushLeft',
                inClass: 'fx-slide-moveFromRight',
                reverse: "push-right-from-left"
        },
        "push-right-from-left": {
            id: 39,
                group: "rotate:push-pull",
                label: "Push right / from left",
                outClass: 'fx-slide-rotatePushRight',
                inClass: 'fx-slide-moveFromLeft',
                reverse: "push-left-from-right"
        },
        "push-top-from-bottom": {
            id: 40,
                group: "rotate:push-pull",
                label: "Push top / from bottom",
                outClass: 'fx-slide-rotatePushTop',
                inClass: 'fx-slide-moveFromBottom',
                reverse: "push-bottom-from-top"
        },
        "push-bottom-from-top": {
            id: 41,
                group: "rotate:push-pull",
                label: "Push bottom / from top",
                outClass: 'fx-slide-rotatePushBottom',
                inClass: 'fx-slide-moveFromTop',
                reverse: "push-top-from-bottom"
        },
        "push-left-pull-right": {
            id: 42,
                group: "rotate:push-pull",
                label: "Push left / pull right",
                outClass: 'fx-slide-rotatePushLeft',
                inClass: 'fx-slide-rotatePullRight fx-slide-delay180',
                reverse: "push-right-pull-left"
        },
        "push-right-pull-left": {
            id: 43,
                group: "rotate:push-pull",
                label: "Push right / pull left",
                outClass: 'fx-slide-rotatePushRight',
                inClass: 'fx-slide-rotatePullLeft fx-slide-delay180',
                reverse: "push-left-pull-right"
        },
        "push-top-pull-bottom": {
            id: 44,
                group: "rotate:push-pull",
                label: "Push top / pull bottom",
                outClass: 'fx-slide-rotatePushTop',
                inClass: 'fx-slide-rotatePullBottom fx-slide-delay180',
                reverse: "push-bottom-pull-top"
        },
        "push-bottom-pull-top": {
            id: 45,
                group: "rotate:push-pull",
                label: "Push bottom / pull top",
                outClass: 'fx-slide-rotatePushBottom',
                inClass: 'fx-slide-rotatePullTop fx-slide-delay180',
                reverse: "push-top-pull-bottom"
        },

        // Fold / Unfold
        "fold-left-from-right": {
            id: 46,
                group: "rotate:fold-unfold",
                label: "Fold left / from right",
                outClass: 'fx-slide-rotateFoldLeft',
                inClass: 'fx-slide-moveFromRightFade',
                reverse: "move-to-right-unfold-left"
        },
        "fold-right-from-left": {
            id: 47,
                group: "rotate:fold-unfold",
                label: "Fold right / from left",
                outClass: 'fx-slide-rotateFoldRight',
                inClass: 'fx-slide-moveFromLeftFade',
                reverse: "move-to-left-unfold-right"
        },
        "fold-top-from-bottom": {
            id: 48,
                group: "rotate:fold-unfold",
                label: "Fold top / from bottom",
                outClass: 'fx-slide-rotateFoldTop',
                inClass: 'fx-slide-moveFromBottomFade',
                reverse: "move-to-bottom-unfold-top"
        },
        "fold-bottom-from-top": {
            id: 49,
                group: "rotate:fold-unfold",
                label: "Fold bottom / from top",
                outClass: 'fx-slide-rotateFoldBottom',
                inClass: 'fx-slide-moveFromTopFade',
                reverse: "move-to-top-unfold-bottom"
        },
        "move-to-right-unfold-left": {
            id: 50,
                group: "rotate:fold-unfold",
                label: "Move to right / unfold left",
                outClass: 'fx-slide-moveToRightFade',
                inClass: 'fx-slide-rotateUnfoldLeft',
                reverse: "fold-left-from-right"
        },
        "move-to-left-unfold-right": {
            id: 51,
                group: "rotate:fold-unfold",
                label: "Move to left / unfold right",
                outClass: 'fx-slide-moveToLeftFade',
                inClass: 'fx-slide-rotateUnfoldRight',
                reverse: "fold-right-from-left"
        },
        "move-to-bottom-unfold-top": {
            id: 52,
                group: "rotate:fold-unfold",
                label: "Move to bottom / unfold top",
                outClass: 'fx-slide-moveToBottomFade',
                inClass: 'fx-slide-rotateUnfoldTop',
                reverse: "fold-top-from-bottom"
        },
        "move-to-top-unfold-bottom": {
            id: 53,
                group: "rotate:fold-unfold",
                label: "Move to top / unfold bottom",
                outClass: 'fx-slide-moveToTopFade',
                inClass: 'fx-slide-rotateUnfoldBottom',
                reverse: "fold-bottom-from-top"
        },

        // Room
        "room-to-left": {
            id: 54,
                group: "rotate:room",
                label: "Room to left",
                outClass: 'fx-slide-rotateRoomLeftOut fx-slide-ontop',
                inClass: 'fx-slide-rotateRoomLeftIn',
                reverse: "room-to-right"
        },
        "room-to-right": {
            id: 55,
                group: "rotate:room",
                label: "Room to right",
                outClass: 'fx-slide-rotateRoomRightOut fx-slide-ontop',
                inClass: 'fx-slide-rotateRoomRightIn',
                reverse: "room-to-left"
        },
        "room-to-top": {
            id: 56,
                group: "rotate:room",
                label: "Room to top",
                outClass: 'fx-slide-rotateRoomTopOut fx-slide-ontop',
                inClass: 'fx-slide-rotateRoomTopIn',
                reverse: "room-to-bottom"
        },
        "room-to-bottom": {
            id: 57,
                group: "rotate:room",
                label: "Room to bottom",
                outClass: 'fx-slide-rotateRoomBottomOut fx-slide-ontop',
                inClass: 'fx-slide-rotateRoomBottomIn',
                reverse: "room-to-top"
        },

        // Cube
        "cube-to-left": {
            id: 58,
                label: "Cube to left",
                outClass: 'fx-slide-rotateCubeLeftOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCubeLeftIn',
                reverse: "cube-to-right"
        },
        "cube-to-right": {
            id: 59,
                label: "Cube to right",
                outClass: 'fx-slide-rotateCubeRightOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCubeRightIn',
                reverse: "cube-to-left"
        },
        "cube-to-top": {
            id: 60,
                label: "Cube to top",
                outClass: 'fx-slide-rotateCubeTopOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCubeTopIn',
                reverse: "cube-to-bottom"
        },
        "cube-to-bottom": {
            id: 61,
                label: "Cube to bottom",
                outClass: 'fx-slide-rotateCubeBottomOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCubeBottomIn',
                reverse: "cube-to-top"
        },

        // Carousel
        "carousel-to-left": {
            id: 62,
                group: "rotate:carousel",
                label: "Carousel to left",
                outClass: 'fx-slide-rotateCarouselLeftOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCarouselLeftIn',
                reverse: "carousel-to-right"
        },
        "carousel-to-right": {
            id: 63,
                group: "rotate:carousel",
                label: "Carousel to right",
                outClass: 'fx-slide-rotateCarouselRightOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCarouselRightIn',
                reverse: "carousel-to-left"
        },
        "carousel-to-top": {
            id: 64,
                group: "rotate:carousel",
                label: "Carousel to top",
                outClass: 'fx-slide-rotateCarouselTopOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCarouselTopIn',
                reverse: "carousel-to-bottom"
        },
        "carousel-to-bottom": {
            id: 65,
                group: "rotate:carousel",
                label: "Carousel to bottom",
                outClass: 'fx-slide-rotateCarouselBottomOut fx-slide-ontop',
                inClass: 'fx-slide-rotateCarouselBottomIn',
                reverse: "carousel-to-top"
        },
        "sides": {
            id: 66,
                group: "rotate",
                label: "Sides",
                outClass: 'fx-slide-rotateSidesOut',
                inClass: 'fx-slide-rotateSidesIn fx-slide-delay200',
                reverse: "sides"
        },
        "slide": {
            id: 67,
                label: "Slide",
                outClass: 'fx-slide-rotateSlideOut',
                inClass: 'fx-slide-rotateSlideIn',
                reverse: "slide"
        }
    };

    function PptSlider() {
    }

    PptSlider.prototype.getAnim = function (name, direct) {
        var n = fx[name]['X'][direct];
        if (direct === 'prev') {
            return animations[n];
            //return animations[animations[n].reverse];
        } else {
            return animations[n];
        }
    };

    window.PptSlider = PptSlider;
})(jQuery);;//#current-color
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

;;(function ($) {
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
            if (that.editing) {
                return true;
            }

            if (e.keyCode === 46/* || e.keyCode === 8*/) { // 删除键
                if (that.$curElem) {
                    var $removeElem = that.$curElem;
                    that.disableActiveElem();
                    $removeElem.remove();
                }
                e.preventDefault();
                return false
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
            that.$copyElem = that.$curElem;
            that.disableActiveElem();
            that.$copyElem = that.$copyElem.detach();
        });
        // 复制元素
        $('#elem-menu-copy').on('click', function (e) {
            e.preventDefault();
            that.$copyElem = that.$curElem;
        });
        // 粘贴元素
        $('#elem-menu-paste,#editor-menu-paste').on('click', function (e) {
            e.preventDefault();
            if (that.$copyElem) {
                that.disableActiveElem();
                var $elem = $(that.$copyElem[0].outerHTML);
                $elem.css('top', (that.$copyElem.position().top + 10) + 'px');
                $elem.css('left', (that.$copyElem.position().left + 10) + 'px');
                $elem.removeClass('active');
                that.$editor.append($elem);
            } else {
            }
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

                $('#editor-shadow-x-offset').val(0);
                $('#editor-shadow-y-offset').val(0);
                $('#editor-shadow-blur').val(3);
                that.$curElem.attr('data-shadow-blur', 3);
                $('#editor-shadow-color').colorpicker('setValue', '#000');
                that.$curElem.css('text-shadow', '0 0 3px #000');
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
})(jQuery);

$(document).ready(function () {
    'use strict';



    var editor = new SliderEditor('#demo', {
        
    });







    function help() {
        ui.frame('help.html', {
            title: '快捷键',
            size: '300px'
        });
    }
    $('#key').on('click', function (e) {
        e.preventDefault();
        help();
    });
    $('#about').on('click', function (e) {
        e.preventDefault();
        ui.alert('Slides v17.4.0');
    });

    // 预览菜单
    $('#display').contextmenu({
        content: '#display-menu'
    });
    
    $('#help').on('click', function (e) {
        e.preventDefault();
        bootstro.start('.bootstro', {
            nextButtonText: '继续 >>',
            prevButtonText: '<< 返回',
            finishButtonText: '关闭'
        });
    });

    // 全屏
    var isFullScreen = false;

    function fullElem(docElm) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
    }

    $("#fullscreen").click(function () {
        //var docElm = document.documentElement;
        var docElm = document.getElementById('editor');

        if (!isFullScreen) {
            $(this).text('取消全屏');
            isFullScreen = true;
            // 全屏播放
            fullElem(document.documentElement);
        } else {
            $(this).text('全屏');
            isFullScreen = false;
            // 取消全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {

                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    });

    document.addEventListener("fullscreenchange, webkitfullscreenchange", function () {
        alert(1);
        var isFullscreen = document.fullscreenEnabled ||

            window.fullScreen ||

            document.webkitIsFullScreen ||

            document.msFullscreenEnabled;

//注意：要在用户授权全屏后才能准确获取当前的状态
    });
    
    //document.fullscreenElement document.msFullscreenElement

    //$('#tab-index').tab('show');
// 
// document.mozFullScreen document.webkitIsFullScreen

    //ui.color();
    $("[data-toggle='tooltip']").tooltip(); // TODO
});