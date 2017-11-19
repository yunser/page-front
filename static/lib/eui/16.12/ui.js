/*! eUI - v1.0.0 */;(function ($) {
    'use strict';

    var UI = {
        version: '1.3.0'
    };

    var bodyIsOverflowing;
    var scrollbarWidth;
    var originalBodyPad;

    var $body = $(document.body);

    // 检查是否有滚动条,并计算滚动条宽度
    UI._checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth;
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect();
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
        }
        bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
        scrollbarWidth = UI._measureScrollbar();
    };

    // 计算滚动条宽度的一种方法
    UI._measureScrollbar = function () { // thx walsh
        var scrollDiv = document.createElement('div');
        scrollDiv.className = 'modal-scrollbar-measure';
        $body.append(scrollDiv);
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        $body[0].removeChild(scrollDiv);
        return scrollbarWidth;
    };

    // 设置又内边距(估计和滚动条有关)
    UI.setScrollbar = function () {
        var bodyPad = parseInt(($body.css('padding-right') || 0), 10);
        originalBodyPad = document.body.style.paddingRight || '';
        if (bodyIsOverflowing) {
            $body.css({'padding-right': bodyPad + scrollbarWidth, 'overflow': 'hidden'});
        }
    };

    // 禁用窗口滚动条
    UI.disableScrollbar = function () {
        UI._checkScrollbar();
        UI.setScrollbar();
    };

    // 使用窗口滚动条
    UI.enableScrollbar = function () {
        $body.css({'padding-right': originalBodyPad});
        if ($body[0].style.removeProperty) {
            $body[0].style.removeProperty('overflow');
        } else {
            $body[0].style.removeAttribute('overflow');
        }

    };

    // 背景遮罩层
    UI.overlay = function (option) {
        if (option === 'hide') {
            var $overlay = $('#ui-overlay');
            $overlay.hide();
        } else {
            var opts = $.extend({}, UI.overlay.DEFAULT, option);
            var $overlay = $('#ui-overlay');
            if ($overlay.length) {
                $overlay.show();
            } else {
                $overlay = $('<div id="ui-overlay" class="ui-overlay"></div>');
                $overlay.css({
                    backgroundColor: opts.bgColor,
                    opacity: opts.opacity
                });
                $overlay.on('click', function () {

                });
                $(document.body).append($overlay);
            }
        }
    };

    UI.overlay.DEFAULT = {
        bgColor: '#000',
        opacity: 0.3,
        zIndex: 10000,
        onClick: function () {},
        clickHide: false
    };

    $.fn.fullscreen = function (option) {
        return $(this).each(function () {
            if (option === 'cancel') {
                $(this).removeClass('ui-fullscreen');
            } else if (option === 'toggle') {
                $(this).toggleClass('ui-fullscreen');
            } else {
                $(this).addClass('ui-fullscreen');
            }
        });
    };

    window.UI = window.ui = UI;

})(jQuery);
;(function ($) {
    'use strict';

    function Selectable(elem, option) {
        var $elem = $(elem);
        var opts = $.extend({}, Selectable.DEFAULTS, option);
        $elem.on('click', opts.item, function (e) {
            e.preventDefault();

            $elem.find(opts.item + '.' + opts.activeClass).removeClass(opts.activeClass);
            $(this).addClass(opts.activeClass);

            opts.selected(e, this);
        })
    }

    Selectable.DEFAULTS = {
        item: '.item',
        activeClass: 'active',
        selected: function(event, item) {},
        unselected: function(event, item) {},
    };

    $.fn.selectable = function (option) {
        return $(this).each(function () {
            new Selectable(this, option);
        });
    };

    // TODO destory、disable、enable、
})(jQuery);
;;(function ($) {
    'use strict';

    function Draggable(elem, option) {
        var that = this;
        that.init(elem, option);
    }

    Draggable.DEFAULTS = {
        axis: 'both',
        hander: false,
        containment: false,
        //containment可选值：'parent', 'document', 'window', [x1, y1, x2, y2].
        drag: function(event, ui) {},
        start: function(event, ui) {},
        end: function(event, ui) {},
    };

    var fn = Draggable.prototype;

    fn.init = function (elem, option) {
        var that = this;

        that.disabled = false;
        that.dragging = false;
        var $emem = $(elem);
        that.$elem = $emem;
        that.elem = $emem[0];

        var xPage;
        var yPage;
        var X;//
        var Y;//
        var xRand = 0;//
        var yRand = 0;//
        var father = $emem.parent();

        var opts = $.extend({}, Draggable.DEFAULTS, option);
        that.opts = opts;
        var movePosition = opts.axis;

        that.hander = opts.hander ? $emem.find(opts.hander) : $emem;

        //---初始化
        //father.css({'position': 'relative', 'overflow': 'hidden'}); // TODO 不能随便添加relative
        $emem.css({'position': 'absolute'});

        that.hander.data('pre-cursor', that.hander.css('cursor'));
        that.hander.css({'cursor': 'move'});

        var faWidth = father.width();
        var faHeight = father.height();
        var thisWidth = $emem.width() + parseInt($emem.css('padding-left')) + parseInt($emem.css('padding-right'));
        var thisHeight = $emem.height() + parseInt($emem.css('padding-top')) + parseInt($emem.css('padding-bottom'));

        var mDown = false;//
        var positionX;
        var positionY;
        var moveX;
        var moveY;

        var minX = -1;
        var maxX = -1;//faWidth - thisWidth
        var minY = -1;
        var maxY = -1;//faHeight - thisHeight

        if (opts.containment) {
            var $containment = $(opts.containment);
            maxX = $containment.width() - $emem.width();
            maxY = $containment.height() - $emem.height();
            if (opts.containment === window || opts.containment === document) {
                minX = minY = 0;
            } else {
                minX = $containment.offset().left
                minY = $containment.offset().top
            }
        }

        that.hander.on('mousedown.ui.draggable', function (e) {
            //father.children().css({'zIndex': '0'});
            //$emem.css({'zIndex': '1'});
            mDown = true;
            X = e.pageX;
            Y = e.pageY;
            positionX = $emem.position().left;
            positionY = $emem.position().top;
            return false;
        });

        $(document).on('mouseup.ui.draggable', function (e) {
            mDown = false;

            if (that.dragging) {
                that.dragging = false;
                that.opts.end(e, that.elem);
            }
        });

        $(document).on('mousemove.ui.draggable', function (e) {
            if (!mDown || that.disabled) {
                return;
            }

            xPage = e.pageX;//--
            moveX = positionX + xPage - X;

            yPage = e.pageY;//--
            moveY = positionY + yPage - Y;



            function thisXMove() { //x轴移动
                var ptX = moveX;
                var ptY = moveY;

                $emem.css({'left': ptX});

                if (minX !== -1 && moveX < minX) {
                    ptX = minX;
                }
                if (maxX !== -1 && moveX > maxX) {
                    ptX = maxX;
                }
                $emem.css({'left': ptX});
                return moveX;
            }

            function thisYMove() { //y轴移动
                if (mDown == true) {
                    $emem.css({'top': moveY});
                } else {
                    return;
                }
                if (minY !== -1 && moveY < minY) {
                    $emem.css({'top': minY});
                }
                if (maxY !== -1 && moveY > maxY) {
                    $emem.css({'top': maxY});
                }
                return moveY;
            }

            function thisAllMove() { //全部移动
                if (mDown == true) {
                    $emem.css({'left': moveX, 'top': moveY});
                } else {
                    return;
                }
                if (minX !== -1 && moveX < minX) {
                    $emem.css({'left': minX});
                }
                if (maxX !== -1 && moveX > maxX) {
                    $emem.css({'left': maxX});
                }
                if (minY !== -1 && moveY < minY) {
                    $emem.css({'top': minY});
                }
                if (maxY !== -1 && moveY > maxY) {
                    $emem.css({'top': maxY});
                }
            }

            if (movePosition.toLowerCase() == 'x') {
                thisXMove();
            } else if (movePosition.toLowerCase() == 'y') {
                thisYMove();
            } else if (movePosition.toLowerCase() == 'both') {
                thisAllMove();
            }

            if (!that.dragging) {
                that.dragging = true;
                that.opts.start(e, that.elem);
            } else {
                that.opts.drag(e, that.elem);
            }
        });
    };

    fn.enable = function () {
        var that = this;

        that.hander.css({'cursor': 'move'});
        that.disabled = false;
    };

    fn.disable = function () {
        var that = this;

        if (!that.disabled) {
            that.hander.css('cursor', that.hander.data('pre-cursor'));
            that.disabled = true;
        }
    };

    fn.destroy = function () {
        var that = this;

        that.hander.css('cursor', that.hander.data('pre-cursor'));
        that.$elem.removeData('ui.draggable');
        that.hander.off('.ui.draggable');
        $(document).off('.ui.draggable');
    };

    $.fn.draggable = function (option) {
        return $(this).each(function () {
            var $this = $(this);
            var data = $this.data('ui.draggable');
            if (!data) {
                data = new Draggable(this, option);
                $this.data('ui.draggable', data);
            }

            if (typeof option === 'string') {
                data[option]();
            }
        });
    };
})(jQuery);
;;(function ($) {
    'use strict';

    function Sortable(elem, option) {
        var that = this;

        that.opts = $.extend({}, Sortable.DEFAULTS, option);
        that.elem = elem;
        that.$elem = $(elem);

        var $dragging, placeholders = $();

        var isHandle, index;
        var items = that.$elem.children(that.opts.item);
        that.newItems = that.$elem.children(that.opts.item);
        var placeholder = $('<' + (/^(ul|ol)$/i.test(elem.tagName) ? 'li' : 'div') + ' class="sortable-placeholder">');
        that.$elem.on('mousedown', that.opts.handle, function () {
            isHandle = true;
        }).mouseup(function () {
            isHandle = false;
        });
        that.$elem.data('items', that.opts.item);
        placeholders = placeholders.add(placeholder);
        if (that.opts.connectWith) {
            $(that.opts.connectWith).add(elem).data('connectWith', that.opts.connectWith);
        }
        that.$elem.on('mousedown.ui.sortable', that.opts.item, function (e) {
            $(this).attr('draggable', 'true');
        });
        that.$elem.on('dragstart.ui.sortable', that.opts.item, function (e) {
            if (that.opts.handle && !isHandle) {
                return false;
            }
            isHandle = false;
            var dt = e.originalEvent.dataTransfer;
            dt.effectAllowed = 'move';
            dt.setData('Text', 'dummy');
            index = ($dragging = $(this)).addClass('sortable-dragging').index();

            that.newItems = that.$elem.children(that.opts.item);

            typeof that.opts.start === 'function' && that.opts.start(e, that.elem);
        });
        that.$elem.on('dragend.ui.sortable', that.opts.item, function (e) {
            if (!$dragging) {
                return;
            }
            $dragging.removeClass('sortable-dragging').show();
            placeholders.detach();
            if (index != $dragging.index()) {
                $dragging.parent().trigger('sortupdate', {item: $dragging});
            }
            $dragging = null;

            typeof that.opts.end === 'function' && that.opts.end(e, that.elem);
        });
        items.not('a[href], img').on('selectstart.ui.sortable', function () {
            this.dragDrop && this.dragDrop();
            return false;
        });
        items.add([elem, placeholder]);

        that.$elem.on('dragover.ui.sortable dragenter.ui.sortable drop.ui.sortable', that.opts.item, function (e) {
            if (!that.newItems.is($dragging) && that.opts.connectWith !== $($dragging).parent().data('connectWith')) {
                return true;
            }
            if (e.type == 'drop') {
                e.stopPropagation();
                placeholders.filter(':visible').after($dragging);
                $dragging.trigger('dragend.ui.sortable');
                return false;
            }
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'move';
            if (that.newItems.is(this)) {
                if (that.opts.forcePlaceholderSize) {
                    placeholder.height($dragging.outerHeight());
                }
                $dragging.hide();
                $(this)[placeholder.index() < $(this).index() ? 'after' : 'before'](placeholder);
                placeholders.not(placeholder).detach();
            } else if (!placeholders.is(this) && !$(this).children(that.opts.item).length) {
                placeholders.detach();
                $(this).append(placeholder);
            }

            typeof that.opts.sort === 'function' && that.opts.sort(e, that.elem);

            return false;
        });
    }

    Sortable.DEFAULTS = {
        item: 'li',
        connectWith: false,
        forcePlaceholderSize: true,
        //handle
        start: function(event, ui) {}, // 开始排序
        sort: function(event, ui) {}, // 排序中
        end: function(event, ui) {}, // 排序结束
    };

    var fn = Sortable.prototype;

    fn.enable = function () {
        var that = this;
        that.$elem.children(that.$elem.data('items')).attr('draggable', true);

        return that;
    };

    fn.disable = function () {
        var that = this;
        that.$elem.children(that.$elem.data('items')).attr('draggable', false);
        return that
    };

    fn.destroy = function () {
        var that = this;
        var items = that.$elem.children(that.$elem.data('items')).attr('draggable', false);

        items.add(elem).removeData('connectWith items')
            .off('.ui.sortable');
        that.$elem.removeData('ui.sortable');
        return that
    };

    fn.option = function () {

    };

    $.fn.sortable = function (option) {

        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.sortable');
            if (!data) {
                data = new Sortable(this, option);
                $this.data('ui.sortable', data);
            }

            if (typeof option === 'string') {
                data[option]();
            }
        });
    };
})(jQuery);
;;(function ($) {
    'use strict';

    var doc = document,
        win = window,
        root = doc.documentElement;

    function Resizable(el, options) {
        var that = this;

        that.element = el;
        that.$elem = $(el);

        that.opts = $.extend({}, Resizable.DEFAULTS, options);
        that.resizing = false;
        that.maxHeight = that.opts.maxHeight;
        that.maxWidth = that.opts.maxWidth;
        that.minWidth = that.opts.minWidth;
        that.minHeight = that.opts.minHeight;

        that.draggable = that.opts.draggable;
        that.within = that.opts.within;
        that.threshold = that.opts.threshold;
        that.handles = that.opts.handles;

        that.createHandles();
    }

    Resizable.DEFAULTS = {
        maxWidth: false,
        maxHeight: false,
        minWidth: 0,
        minHeight: 0,
        resize: function(event, ui) {},
        start: function(event, ui) {},
        end: function(event, ui) {}
    };

    var fn = Resizable.prototype;

    fn.threshold = 10; // Threshold size

    /** Make itself draggable to the row */
    fn.draggable = false;

    /** Create handles according to options */
    fn.createHandles = function () {
        var that = this;

        //init handles
        var handles;

        //parse value
        if ($.isArray(that.handles)) {
            handles = {};
            for (var i = that.handles.length; i--;){
                handles[that.handles[i]] = null;
            }
        } else if (typeof that.handles === 'string') {
            handles = {};
            var arr = that.handles.match(/([swne]+)/g);
            for (var i = arr.length; i--;){
                handles[arr[i]] = null;
            }
        } else if (typeof that.handles === 'object') {
            handles = that.handles;
        }
        //default set of handles depends on position.
        else {
            var position = getComputedStyle(that.element).position;
            var display = getComputedStyle(that.element).display;
            //if display is inline-like - provide only three handles
            //it is position: static or display: inline
            if (/inline/.test(display) || /static/.test(position)){
                handles = {
                    s: null,
                    se: null,
                    e: null
                };

                //ensure position is not static
                that.$elem.css('position', 'relative');
            }
            //else - all handles
            else {
                handles = {
                    s: null,
                    se: null,
                    e: null,
                    ne: null,
                    n: null,
                    nw: null,
                    w: null,
                    sw: null
                };
            }
        }


        //create proper number of handles
        var handle;
        for (var direction in handles) {
            handles[direction] = that.createHandle(handles[direction], direction);
        }

        //save handles elements
        that.handles = handles;
    }


    /** Create handle for the direction */
    fn.createHandle = function(handle, direction){
        var that = this;

        var el = that.element;

        //make handle element
        if (!handle) {
            handle = document.createElement('div');
            handle.classList.add('resizable-handle');
        }

        //insert handle to the element
        that.element.appendChild(handle);
        //save direction
        handle.direction = direction;

        //detect self.within
        var within = that.within === 'parent' ? that.element.parentNode : that.within;
        var position = that.$elem.parent().css('position');
        var parentTop;
        var parentLeft;
        if (position === 'absolute' || position === 'relative') {
            parentTop = that.$elem.parent().offset().top;
            parentLeft = that.$elem.parent().offset().left;
        } else {
            parentTop = 0;
            parentLeft = 0;
        }

        var $handle = $(handle);
        $handle.on('mousedown', function (e) {
            e.stopPropagation();

            that.down = true;
            that.curHander = this;
            that.bottomY = that.$elem.offset().top + that.$elem.outerHeight();
            that.rightX = that.$elem.offset().left + that.$elem.outerWidth();
        });

        $(document).on('mousemove', function (e) {
            if (!that.down) {
                return true;
            }
            //e.stopPropagation();

            var pageX = e.pageX;
            var pageY = e.pageY;

            var direct = that.curHander.direction;




            if (direct === 'e' || direct === 'se' || direct === 'ne') {
                var width = pageX - that.$elem.offset().left;
                if (that.maxWidth && width > that.maxWidth) {
                    width = that.maxWidth;
                }
                if (that.minWidth && width < that.minWidth) {
                    width = that.minWidth;
                }
                that.$elem.width(width)
            }
            if (direct === 's' || direct === 'se' || direct === 'sw') {
                var height = pageY - that.$elem.offset().top;
                if (that.maxHeight && height > that.maxHeight) {
                    height = that.maxHeight;
                }
                if (that.minHeight && height < that.minHeight) {
                    height = that.minHeight;
                }
                that.$elem.height(height);
            }
            if (direct === 'w' || direct === 'sw' || direct === 'nw') {


                var width = that.rightX - pageX;
                var left = pageX - parentLeft;
                if (that.maxWidth && width > that.maxWidth) {
                    left = left + (width - that.maxWidth);
                    width = that.maxWidth;
                }
                if (that.minWidth && width < that.minWidth) {
                    left = left - (that.minWidth - width);
                    width = that.minWidth;
                }

                that.$elem.width(width);

                that.$elem.css('left', left + 'px');
            }
            if (direct === 'n' || direct === 'ne' || direct === 'nw') {
                var height = that.bottomY - pageY;
                var top = pageY - parentTop;
                if (that.maxHeight && height > that.maxHeight) {
                    top = top + (height - that.maxHeight);
                    height = that.maxHeight;
                }
                if (that.minHeight && height < that.minHeight) {
                    top = top - (that.minHeight - height);
                    height = that.minHeight;
                }

                that.$elem.height(height);
                that.$elem.css('top', top + 'px');
            }

            if (!that.resizing) {
                that.resizing = true;
                that.opts.start(e, that.elem);
            } else {
                that.opts.resize(e, that.elem);
            }
        });

        $(document).on('mouseup', function(e) {
            //e.stopPropagation();

            that.down = false;
            if (that.resizing) {
                that.resizing = false;
                that.opts.end(e, that.elem);
            }
            //clear cursor & pointer-events
            /*css(root, {
                'cursor': null
            });

            //get back cursors
            for (var h in self.handles){
                css(self.handles[h], 'cursor', self.handles[h].direction + '-resize');
            }*/
        });

        $(handle).css('cursor', direction + '-resize');

        //append proper class
        handle.classList.add('resizable-handle-' + direction);
        handle.classList.add('ui-scale');
        handle.classList.add('ui-scale-' + direction);

        return handle;
    };

    fn.enable = function () {
        //remove all handles
        for (var hName in this.handles){
            $(this.handles[hName]).show();
        }
    };

    fn.disable = function () {
        //remove all handles
        for (var hName in this.handles){
            $(this.handles[hName]).hide();
        }
    };

    fn.destroy = function () {
        //remove all handles
        for (var hName in this.handles){
            $(this.handles[hName]).remove();
        }

        this.$elem.removeData('ui.resizable');
        this.element = null;
    };

    function Plugin(option) {
        return $(this).each(function () {
            var $this = $(this);
            var data = $this.data('ui.resizable');
            if (!data) {
                data = new Resizable(this, option);
                $this.data('ui.resizable', data);
            }

            if (typeof option === 'string') {
                data[option]();
            }
        });
    }

    $.fn.resizable = Plugin;
})(jQuery);
;;(function($) {
    'use strict';

	var elems = new Array();

	// observe window resize
	$(window).on('resize', function(e) {

		// reset position for all
		$.each(elems, function(i, elem) {
			$(elem).css({
				'position': 'absolute',
				left: 0,
				top: 0
			});
		});

		// cycle through all visible handlers and use their position to update position
		$.each(elems, function(i) {
			var elem = $(this),
                elemData = elem.data('placeOptions');

			// update element (by calling init)
			pub.init.apply(elem, [elemData]);
		});

	});

	var pvt = {
		/* Calculates the specified elements' boundary and dimensions.
		 *
		 * @param		includeMargin	If true, element's margins are included in calculation.
		 * @param		addScroll		If true, scroll position is added to the viewport height/width calculation.
		 *
		 * @return		object			Boundary and dimensions of the selected HTML element.
		 */
		calcBounds: function(includeMargin, addScroll) {
			var elem = this, elemOffset = $(elem).offset();

			includeMargin = (null == includeMargin) ? false : includeMargin;
			addScroll = (null == addScroll) ? false : addScroll;

			// visible (viewport) document area
			var viewport = {
				width: $(window).width(),
				height: $(window).height()
			};

			// visible+unscolled document area
			var htmlDoc = {
				width: $(document).width(),
				height: $(document).height()
			};

			var innerWidth = (elem === window) ? viewport.width : ((elem === document) ? htmlDoc.width : $(elem).width());
			var innerHeight = (elem === window) ? viewport.height : ((elem === document) ? htmlDoc.height : $(elem).height());

			var outerWidth = (elem === window) ? viewport.width : ((elem === document) ? htmlDoc.width : $(elem).outerWidth(includeMargin));
			var outerHeight = (elem === window) ? viewport.height : ((elem === document) ? htmlDoc.height : $(elem).outerHeight(includeMargin));

			return {
				width: innerWidth,
				height: innerHeight,

				outerWidth: outerWidth,
				outerHeight: outerHeight,

				// addScroll; to position the element according to the current scrolled (or visible) viewport area
				topEdge: (elem === window) ? ((addScroll) ? $(window).scrollTop() : 0) : ((elem === document) ? 0 : elemOffset.top),
				leftEdge: (elem === window) ? ((addScroll) ? $(window).scrollLeft() : 0) : ((elem === document) ? 0 : elemOffset.left)
			};
		},


		/* Determine whether the specified value is inside or outside the bounding box.
		 *
		 * @param		thisValue		Value to check.
		 * @param		boundingBox		Boundary box; bounds of which the "value" shouldn't exceed.
		 * @param		plane			Horizontal or vertical plane.
		 *
		 * @return		number			Amount the selected HTML element goes off the bounding box or -1 if it doesn't.
		 */
		inBound: function(thisValue, boundingBox, plane) {
			var selected = $(this), selectedData = selected.data('placeOptions');

			// validate
			if(!selectedData) {
				throw new Error('The element you\'ve selected does not have the required data set on it!');
			}

			// calculate bounds
			boundingBox = pvt.calcBounds.apply(boundingBox, [false, ((selectedData.relativeTo === window && selectedData.position === 'absolute') ? true : false)]);
			var selectedBox = pvt.calcBounds.apply(selected, [selectedData.includeMargin, ((selectedData.relativeTo === window && selectedData.position === 'absolute') ? true : false)]);

			// prevent x-plane clipping
			if(plane === 'x') {
				// leftValue goes beyond left edge
				if(thisValue < boundingBox.leftEdge) {
					return boundingBox.leftEdge;
				}
				// thisValue goes beyond right edge
				else if((thisValue+selectedBox.outerWidth) >= (boundingBox.leftEdge+boundingBox.outerWidth)) {
					return ((boundingBox.leftEdge+boundingBox.outerWidth)-selectedBox.outerWidth);
				}

				return -1;
			}
			// prevent y-plane clipping
			else if(plane === 'y') {
				// topValue goes beyond top edge
				if(thisValue < boundingBox.topEdge) {
					return boundingBox.topEdge;
				}
				// thisValue goes beyond bottom edge
				else if((thisValue+selectedBox.outerHeight) >= (boundingBox.topEdge+boundingBox.outerHeight)) {
					return ((boundingBox.topEdge+boundingBox.outerHeight)-selectedBox.outerHeight);
				}

				return -1;
			}
		},


		/* Applies a value to a single property.
		 *
		 * @param		property		Property to apply value to.
		 * @param		value			Value to set for the specified property.
		 *
		 * @return		mixed			The value of the specified property.
		 */
		apply: function(property, value) {
			var selected = $(this), selectedData = selected.data('placeOptions');

			// get
			if(value === undefined) {
				// validate
				if(!selectedData) {
					throw new Error('The element you\'ve selected does not have the required data set on it!');
				}

				// return property
				return selectedData[property];
			}

			// if data not set...
			if(!selectedData) {
				// set property
				selectedData = {};
				selectedData[property] = value;

				// set default data
				pub.init.apply(selected, [selectedData]);

				// retrieve newly set data...
				selectedData = selected.data('placeOptions');
			}

			// adjust width according to specified offsets...
			if(property === 'offsetX' && selectedData.inBoundX === true) {
				if(selectedData.x === 'right' && value < 0) {
					// subtract width from calculation
					value -= selected.outerWidth();
				}
				else if(selectedData.x === 'left' && value > 0) {
					// add width to calculation
					value += selected.outerWidth();
				}
			}
			// adjust height according to specified offsets...
			if(property === 'offsetY' && selectedData.inBoundY === true) {
				if(selectedData.y === 'bottom' && value < 0) {
					// subtract height from calculation
					value -= selected.outerHeight();
				}
				else if(selectedData.y === 'top' && value > 0) {
					// add height to calculation
					value += selected.outerHeight();
				}
			}

			// overwrite existing value for property
			selectedData[property] = value;
			// save it
			selected.data('placeOptions', selectedData);

			// apply
			pub.init.apply(selected);
		}
	};

	var pub = {
		/*
		 * Initializes the selected HTML element.
		 *
		 * @param		options			(object, optional) Popup options.
		 */
		init: function(options) {
			// take element out of the normal flow of document
			$(this).css('position', 'absolute');

			return this.each(function() {
				var selected = $(this),
                    selectedData = selected.data('placeOptions');

				// if no options specified
				if(null == options) {
					// default
					options = {};
				}

                // 默认
                var DEFAULTS = {
                    position: 'absolute',
                    relativeTo: window,
                    x: 'left',
                    y: 'top',
                    z: false, // 默认不设置
                    offsetX: 0,
                    offsetY: 0,
                    inBoundX: true,
                    inBoundY: true,
                    boundingBox: window,
                    includeMargin: false
                };

				// if data has been set
				if (selectedData) {
					// retrieve options from stored data and merge specified options with it
					options = $.extend({}, DEFAULTS, selectedData, options);
				} else {
                    options = $.extend({}, DEFAULTS, options);
                }

				// set defaults
				var relativeTo = options.relativeTo;

				var position = options.position;

				var x = options.x;
				var y = options.y;

				var offsetX = options.offsetX;
				var offsetY = options.offsetY;

				var inBoundX = options.inBoundX;
				var inBoundY = options.inBoundY;
				var boundingBox = options.boundingBox;

				var includeMargin = options.includeMargin;

				if(null == relativeTo || $.type(relativeTo) !== 'object') {
					throw new Error('The object to position an element relative to must either be an HTML element, window or document!');
				}
				if(!/\b(?:absolute|fixed)\b/.test(position)) {
					throw new Error('"' + position + '" is not a valid CSS position property value!');
				}
				if(null == boundingBox || $.type(boundingBox) !== 'object') {
					throw new Error('The bounding box should either be an HTML element, window or document!');
				}

				// data not set; means position is called for the first time on element
				if(!selectedData) {
					// add to elements array
					elems.push(selected);
				}

				// backup position for repositioning
				selected.data('placeOptions', {
					relativeTo: relativeTo,
					position: position,
					x: x,
					y: y,
					z: options.z,
					offsetX: offsetX,
					offsetY: offsetY,
					inBoundX: inBoundX,
					inBoundY: inBoundY,
					boundingBox: boundingBox,
					includeMargin: includeMargin
				});

				// set CSS position property
				if(selected.css('position') != position) {
					selected.css('position', position);
				}

				var documentBox = pvt.calcBounds.apply(document);

				// reset coordinates
				selected.css({
					'width': '',
					'height': '',
					// relativeTo window? make scrollbars appear by going off the document edges
					// otherwise scrollbar width/height won't be calculated
					'left': (relativeTo === window && x === 'right' && !inBoundX) ? documentBox.outerWidth : '',
					'top': (relativeTo === window && y === 'bottom' && !inBoundY) ? documentBox.outerHeight : ''
				});


				var selectedBox = pvt.calcBounds.apply(selected, [false, ((relativeTo === window && position === 'absolute') ? true : false)]);
				var relativeBox = pvt.calcBounds.apply(relativeTo, [includeMargin, ((relativeTo === window && position === 'absolute') ? true : false)]);

				var widthValue = selectedBox.outerWidth,
                    heightValue = selectedBox.outerHeight;
				var leftValue = 0,
                    topValue = 0;

				// x-plane position (from left)
				switch(x) {
					case 'left':
						leftValue = relativeBox.leftEdge-selectedBox.outerWidth;
					break;
					case 'leftEdge':
						leftValue = relativeBox.leftEdge;
					break;
					case 'right':
						leftValue = relativeBox.leftEdge+relativeBox.outerWidth;
					break;
					case 'rightEdge':
						leftValue = (relativeBox.leftEdge+relativeBox.outerWidth)-selectedBox.outerWidth;
					break;
					case 'center':
						leftValue = relativeBox.leftEdge-(selectedBox.outerWidth/2)+(relativeBox.outerWidth/2);
					break;
					case 'overlay':
						leftValue = relativeBox.leftEdge;
						widthValue = relativeBox.outerWidth;
					break;
				}

				// y-plane position (from top)
				switch(y) {
					case 'top':
						topValue = relativeBox.topEdge-selectedBox.outerHeight;
					break;
					case 'topEdge':
						topValue = relativeBox.topEdge;
					break;
					case 'bottom':
						topValue = relativeBox.topEdge+relativeBox.outerHeight;
					break;
					case 'bottomEdge':
						topValue = (relativeBox.topEdge+relativeBox.outerHeight)-selectedBox.outerHeight;
					break;
					case 'center':
						topValue = relativeBox.topEdge-(selectedBox.outerHeight/2)+(relativeBox.outerHeight/2);
					break;
					case 'overlay':
						topValue = relativeBox.topEdge;
						heightValue = relativeBox.outerHeight;
					break;
				}

				// add x-plane offset; only case not to add it would be when overlaying window/doc whilst remaining inbound!
				if(null != leftValue && !((relativeTo === window || relativeTo === document) && x === 'overlay' && inBoundX)) {
					leftValue += offsetX;
				}

				// prevent x-plane clipping
				if(inBoundX) {
					var val = pvt.inBound.apply(selected, [leftValue, boundingBox, 'x']);

					leftValue = ((val !== -1) ? val : leftValue);
				}

				// add y-plane offset; only case not to add it would be when overlaying window/doc whilst remaining inbound!
				if(null != topValue && !((relativeTo === window || relativeTo === document) && y === 'overlay' && inBoundY)) {
					topValue += offsetY;
				}

				// prevent y-plane clipping
				if(inBoundY) {
					var val = pvt.inBound.apply(selected, [topValue, boundingBox, 'y']);

					topValue = ((val !== -1) ? val : topValue);
				}

				// IE Fix: in IE Ready event seems to fire early at times rendering width and height values < 0
				// which results in a logical error!
				if(widthValue < 0) {
					widthValue = 'auto';
				}
				if(heightValue < 0) {
					heightValue = 'auto';
				}

				// apply
				selected.css({
					//width: widthValue,
					//height: heightValue,
					left: leftValue,
					top: topValue,
				});

                options.z && selected.css('zIndex', options.z);

                if (x === 'overlay') {
                    selected.css('width', widthValue);
                }
                if (y === 'overlay') {
                    selected.css('height', heightValue);
                }


			});

		},

		/* Resets any previously set element place data. */
		reset: function() {
			return this.each(function() {
				var selected = $(this), selectedData = selected.data('placeOptions');

				if(selectedData) {
					selected.removeData('placeOptions');
				}
			});
		}
	};

	/*
	 * Positions selected HTML element(s).
	 *
	 * @param		method			(string) Name of the method to call on the selected popup element.
	 * @param		options			(mixed) Argument(s) for the specified method.
	 *
	 * @return		mixed			The value of the specified property.
	 */
	$.fn.pot = function(method) {
		// Method calling logic
		if(/\b(?:relativeTo|position|x|y|z|offsetX|offsetY|inBoundX|inBoundY|boundingBox|includeMargin)\b/.test(method)) {
			return pvt['apply'].apply(this, arguments);
		} else if(pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method === 'object' || !method) {
			return pub.init.apply(this, arguments);
		} else {
			throw new Error('Method ' +  method + ' does not exist on jQuery.place');
		}
	};

})(jQuery);
;;(function ($) {
    'use strict';

    var dismiss = '[data-dismiss="alert"]';
    var SELECTOR_ALERT = '.alert';
    var EVEMT_CLOSE = 'close.ui.alert';
    var EVEMT_CLOSED = 'closed.ui.alert';

    // ALERT CLASS DEFINITION
    var Alert = function (el) {
        $(el).on('click', dismiss, this.close);
    };

    Alert.VERSION = '1.3.0';

    Alert.TRANSITION_DURATION = 150;

    Alert.prototype.close = function (e) {
        var $this = $(this);
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = $(selector);

        if (e) {
            e.preventDefault();
        }

        if (!$parent.length) {
            $parent = $this.closest(SELECTOR_ALERT);
        }

        $parent.trigger(e = $.Event(EVEMT_CLOSE));

        if (e.isDefaultPrevented()) {
            return;
        }

        $parent.removeClass('in');

        function removeElement() {
            // detach from parent, fire event then clean up data
            $parent.detach().trigger(EVEMT_CLOSED).remove();
        }

        $.support.transition && $parent.hasClass('fade') ?
            $parent
                .one('uiTransitionEnd', removeElement)
                .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
            removeElement();
    };


    // ALERT PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.alert');

            if (!data) {
                data = new Alert(this);
                $this.data('ui.alert', data);
            }
            if (typeof option == 'string') {
                data[option].call($this)
            }
        })
    }

    var old = $.fn.alert;

    $.fn.alert = Plugin;
    $.fn.alert.Constructor = Alert;


    // ALERT NO CONFLICT
    // =================

    $.fn.alert.noConflict = function () {
        $.fn.alert = old;
        return this;
    };


    // ALERT DATA-API
    // ==============

    $(document).on('click.ui.alert.data-api', dismiss, Alert.prototype.close);

})(jQuery);
;;(function ($) {
    'use strict';

    // 按钮类定义
    var Button = function (element, options) {
        this.$element = $(element);
        this.opts = $.extend({}, Button.DEFAULTS, options);
        this.isLoading = false;
    };

    Button.VERSION = '1.3.0';

    Button.DEFAULTS = {
        loadingText: '加载中...'
    };

    var fn = Button.prototype;

    fn.setState = function (state) {
        var d = 'disabled';
        var $el = this.$element;
        var val = $el.is('input') ? 'val' : 'html';
        var data = $el.data();

        state += 'Text';

        if (data.resetText == null) {
            $el.data('resetText', $el[val]());
        }

        // push to event loop to allow forms to submit
        setTimeout($.proxy(function () {
            $el[val](data[state] == null ? this.opts[state] : data[state]);
            if (state == 'loadingText') {
                this.isLoading = true;
                $el.addClass(d).attr(d, d);
            } else if (this.isLoading) {
                this.isLoading = false;
                $el.removeClass(d).removeAttr(d);
            }
        }, this), 0);
    };

    fn.toggle = function () {
        var changed = true;
        var $parent = this.$element.closest('[data-toggle="buttons"]');

        if ($parent.length) {
            var $input = this.$element.find('input');
            if ($input.prop('type') == 'radio') {
                if ($input.prop('checked')) changed = false;
                $parent.find('.active').removeClass('active');
                this.$element.addClass('active');
            } else if ($input.prop('type') == 'checkbox') {
                if (($input.prop('checked')) !== this.$element.hasClass('active')) {
                    changed = false;
                }
                this.$element.toggleClass('active');
            }
            $input.prop('checked', this.$element.hasClass('active'));
            if (changed) {
                $input.trigger('change');
            }
        } else {
            this.$element.attr('aria-pressed', !this.$element.hasClass('active'));
            this.$element.toggleClass('active');
        }
    };

    // 按钮插件定义
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.button');
            var options = typeof option == 'object' && option;

            if (!data) {
                $this.data('ui.button', (data = new Button(this, options)));
            }

            if (option == 'toggle') {
                data.toggle();
            } else if (option) {
                data.setState(option);
            }
        })
    }

    var old = $.fn.button;

    $.fn.button = Plugin;
    $.fn.button.Constructor = Button;

    $.fn.button.noConflict = function () {
        $.fn.button = old;
        return this;
    };

    $(document)
        .on('click.ui.button.data-api', '[data-toggle^="button"]', function (e) {
            var $btn = $(e.target).closest('.btn');
            Plugin.call($btn, 'toggle');
            if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) {
                // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
                e.preventDefault();
                // The target component still receive the focus
                if ($btn.is('input,button')) {
                    $btn.trigger('focus');
                } else {
                    $btn.find('input:visible,button:visible').first().trigger('focus');
                }
            }
        })
        .on('focus.ui.button.data-api blur.ui.button.data-api', '[data-toggle^="button"]', function (e) {
            $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type));
        });

})(jQuery);
;;(function ($) {
    'use strict';

    var SELETOR_INDICATORS = '.slider-indicators';
    var SELECTOR_ITEM = '.item';
    var CLASS_SLIDER = 'slider';
    var EVENT_SLID = 'slid.ui.slider';
    var EVENT_SLIDER = 'slide.ui.slider';

    // 轮播图类
    var Slider = function (element, options) {
        var that = this;

        that.$element = $(element);
        that.$indicators = that.$element.find(SELETOR_INDICATORS);
        that.opts = options;
        that.paused = null; // 是否已经停止滑动
        that.sliding = null; // 是否正在滑动
        that.interval = null;
        that.$active = null;
        that.$items = null;

        that.curIndex = 0;
        that.$list = that.$element.find('.slider-inner');
        that.$items = that.$list.children();
        var count = that.$items.length;
        that.count = count;
        // 复制item
        // 复制后面
        that.pad = that.opts.column - 1;
        if (that.pad < 1) {
            that.pad = 1;
        }
        for (var i = 0; i < that.pad; i++) {
            var $copy = that.$items.eq(i).clone(true);
            $copy.addClass('copy');
            $copy.removeClass('active');
            that.$list.append($copy);
        }
        // 复制前面
        for (var i = 0; i < that.pad; i++) {
            var $copy = that.$items.eq(count - (i + 1)).clone(true);
            $copy.addClass('copy');
            $copy.removeClass('active');
            that.$list.prepend($copy);
        }

        function resize() {
            that.itemWidth = that.$element.width() / that.opts.column;
            var width = that.itemWidth * (count + 2 * (that.pad));
            //that.$list.hide();
            that.$list.width(width);
            that.$list.children().width(that.itemWidth);
        };

        resize();



        var offset = that.pad * that.itemWidth * -1; // TODO


        that.disableTransition();
        that.offset(offset, false);

        that.$element.resize(function () {
            resize();
        });

        that.opts.keyboard && that.$element.on('keydown.ui.slider', $.proxy(that.keydown, that));

        that.opts.pause == 'hover' && !('ontouchstart' in document.documentElement) && that.$element
            .on('mouseenter.ui.slider', $.proxy(that.pause, that))
            .on('mouseleave.ui.slider', $.proxy(that.cycle, that));


    };

    Slider.VERSION = '1.3.0';
    Slider.v = 2.00;

    Slider.TRANSITION_DURATION = 600;

    Slider.DEFAULTS = {
        interval: 5000, // 自动循环每个项目之间延迟的时间量。如果为 false，轮播将不会自动循环
        pause: 'hover',
        loop: true, // 轮播是否循环播放
        keyboard: true,
        column: 1,
    };

    var fn = Slider.prototype;

    fn.offset = function (offset, anim) {
        var that = this;

        if (anim) {
            that.$list.animate({
                'margin-left': offset + 'px'
            }, 500)
        } else {
            that.$list.css('margin-left', offset + 'px');
        }

        //that.$list.css('transform', 'translate3d(' + offset + 'px, 0px, 0px)');
    };

    fn.disableTransition = function () {
        var that = this;

        //that.$list.css('transition', 'inherit');
    };

    fn.enableTransition = function () {
        var that = this;

        //that.$list.css('transition', 'transform .6s ease-in-out');
        //that.$list.css('transition', 'all .6s ease-in-out');
    };

    fn.keydown = function (e) {
        var that = this;

        if (/input|textarea/i.test(e.target.tagName)) {
            return;
        }
        switch (e.which) {
            case 37:
                that.prev();
                break;
            case 39:
                that.next();
                break;
            default:
                return;
        }

        e.preventDefault()
    };

    fn.cycle = function (e) {
        var that = this;

        e || (that.paused = false);

        that.interval && clearInterval(that.interval);

        that.opts.interval
        && !that.paused
        && (that.interval = setInterval($.proxy(that.next, that), that.opts.interval));

        return that;
    };

    fn.getIndex = function () {
        var that = this;

        return that.curIndex
    };

    fn.getItemIndex = function (item) {
        var that = this;

        that.$items = item.parent().children(SELECTOR_ITEM);
        return that.$items.index(item || that.$active);
    };

    /**
     * 获取下一个要显示的item
     * @param {string} direction 'prev' or 'next'
     * @param active
     * @returns {*}
     */
    fn.getItemForDirection = function (direction, active) {
        var that = this;

        var activeIndex = that.getItemIndex(active);
        /*var willWrap = (direction == 'prev' && activeIndex === 0)
            || (direction == 'next' && activeIndex == (that.count - 1));
        if (willWrap && !that.opts.wrap) {
            return active;
        }*/

        var delta = direction == 'prev' ? -1 : 1;
        var itemIndex = (activeIndex + delta);
        if (itemIndex > that.count + that.pad - 1) {
            itemIndex = that.pad;
        }
        if (itemIndex < that.pad -  1) { // TODO
            itemIndex = that.count + that.pad - 1;
        }
        return that.$items.eq(itemIndex)
    };

    // 滑动到某个轮播项
    fn.to = function (pos) {
        var that = this;

        var activeIndex = that.getItemIndex(that.$active = that.$element.find(SELECTOR_ITEM + '.active'));

        if (pos < 0 || pos > that.count - 1) {
            return;
        }

        if (that.sliding) {
            return that.$element.one(EVENT_SLID, function () {
                that.to(pos)
            });
        }// yes, "slid"

        if (that.curIndex == pos) {
            return that.pause().cycle();
        }

        var preIndex = that.curIndex;
        that.curIndex = pos;

        return that.slide(pos > preIndex ? 'next' : 'prev', that.$items.eq(pos));
    };

    fn.pause = function (e) {
        var that = this;

        e || (that.paused = true);

        if (that.$element.find('.next, .prev').length && $.support.transition) {
            that.$element.trigger($.support.transition.end);
            that.cycle(true);
        }

        that.interval = clearInterval(that.interval);

        return that;
    };

    fn.next = function () {
        var that = this;

        if (that.curIndex === (that.count - 1) && !that.opts.loop) {
            return;
        }

        that.curIndex++;
        if (that.curIndex > that.count - 1) {
            that.curIndex = 0;
        }

        if (that.sliding) {
            return;
        }
        that.$active = that.$element.find(SELECTOR_ITEM + '.active')
        var activeIndex = that.$active.index();
        if (activeIndex === that.count + that.pad - 1) {
            var offset = that.itemWidth * (that.pad - 1) * -1;
            that.offset(offset, false);
        }
        return that.slide('next');
    };

    fn.prev = function () {
        var that = this;

        if (that.curIndex === 0 && !that.opts.loop) {
            return;
        }

        that.curIndex--;
        if (that.curIndex < 0) {
            that.curIndex = that.count - 1;
        }

        if (that.sliding) {
            return;
        }
        that.$active = that.$element.find(SELECTOR_ITEM + '.active')
        var activeIndex = that.$active.index();
        if (activeIndex === that.pad - 1) {
            var offset = that.itemWidth * (that.count + that.pad - 1) * -1;
            that.offset(offset, false);
            that.$active.removeClass('active');
            that.$list.find(SELECTOR_ITEM).eq(that.count + that.pad - 1).addClass('active');
        }
        return that.slide('prev');
    };

    /**
     * 切换
     * @param type 'next' or 'prev'
     * @param next 跳转到的item
     * @returns {*}
     */
    fn.slide = function (type, next) {
        var that = this;
        that.enableTransition();

        var $active = that.$element.find(SELECTOR_ITEM + '.active');
        var $next = next || that.getItemForDirection(type, $active);
        var isCycling = that.interval;
        var direction = type == 'next' ? 'left' : 'right';
        var that = that;

        if ($next.hasClass('active')) {
            return (that.sliding = false);
        }

        var relatedTarget = $next[0];
        var slideEvent = $.Event(EVENT_SLIDER, {
            relatedTarget: relatedTarget,
            direction: direction
        });
        that.$element.trigger(slideEvent);
        if (slideEvent.isDefaultPrevented()) {
            return;
        }

        that.sliding = true;

        isCycling && that.pause();

        if (that.$indicators.length) {
            that.$indicators.find('.active').removeClass('active');
            var $nextIndicator = $(that.$indicators.children()[that.getIndex()]);
            $nextIndicator && $nextIndicator.addClass('active')
        }

        var slidEvent = $.Event(EVENT_SLID, {relatedTarget: relatedTarget, direction: direction}); // yes, "slid"
        //if (false) {
        if ($.support.transition && that.$element.hasClass('slide')) {

            var offset = $next.index() * -1 * that.itemWidth; // TODO
            that.offset(offset, true);

            $active.removeClass('active');
            $next.addClass('active');
            that.sliding = false;
            that.$element.trigger(slidEvent);

            $active
                .one('uiTransitionEnd', function () {
                    that.disableTransition();
                    //that.$list.css('transform', 'translate3d(' + offset + 'px, 0px, 0px)');
                    //$next.removeClass([type, direction].join(' ')).addClass('active');
                    //$active.removeClass(['active', direction].join(' '));
                    /*that.sliding = false;
                    setTimeout(function () {
                        that.$element.trigger(slidEvent)
                    }, 0);*/
                })
                .emulateTransitionEnd(Slider.TRANSITION_DURATION);
        } else {
            var offset = $next.index() * -1 * that.itemWidth; // TODO
            that.offset(offset, true);
            $active.removeClass('active');
            $next.addClass('active');
            that.sliding = false;
            that.$element.trigger(slidEvent);
        }

        isCycling && that.cycle();

        return that;
    };

    fn.slideTo = function (pos) {
        pos = parseInt(pos);

        var that = this;
        if (that.curIndex === pos) {
            return false;
        }

        var isCycling = that.interval;

        var slideEvent = $.Event(EVENT_SLIDER, {
            //relatedTarget: relatedTarget, TODO
            //direction: direction
        });
        that.$element.trigger(slideEvent);
        if (slideEvent.isDefaultPrevented()) {
            return;
        }

        that.sliding = true;

        isCycling && that.pause();

        if (that.$indicators.length) {
            that.$indicators.find('.active').removeClass('active');
            var $nextIndicator = $(that.$indicators.children()[pos]);
            $nextIndicator && $nextIndicator.addClass('active')
        }

        //var slidEvent = $.Event(EVENT_SLID, {relatedTarget: relatedTarget, direction: direction}); // yes, "slid"

        if ($.support.transition && that.$element.hasClass('slide')) {

            var offset = (pos + that.pad) * -1 * that.itemWidth; // TODO
            that.offset(offset, true);

            that.$items.eq(that.curIndex).removeClass('active');
            that.$items.eq(pos).addClass('active');

            that.sliding = false;
            //that.$element.trigger(slidEvent);

        } else {
            var offset = $next.index() * -1 * that.itemWidth; // TODO
            that.offset(offset, true);
            $active.removeClass('active');
            $next.addClass('active');
            that.sliding = false;
            that.$element.trigger(slidEvent);
        }

        isCycling && that.cycle();

        that.curIndex = pos;

        return that;
    };

    // 轮播插件定义
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui-slider');
            var options = $.extend({}, Slider.DEFAULTS, $this.data(), typeof option == 'object' && option);
            var action = typeof option == 'string' ? option : options.slide;

            if (!data) {
                data = new Slider(this, options);
                $this.data('ui-slider', data);
            }
            if (typeof option == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    }

    var old = $.fn.slider;

    $.fn.slider = Plugin;
    $.fn.slider.Constructor = Slider;

    $.fn.slider.noConflict = function () {
        $.fn.slider = old;
        return this;
    };

    var clickHandler = function (e) {
        var href;
        var $this = $(this);
        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7
        if (!$target.hasClass(CLASS_SLIDER)) {
            return;
        }

        var options = $.extend({}, $target.data(), $this.data());
        var slideIndex = $this.attr('data-slide-to');
        if (slideIndex) {
            options.interval = false;
        }

        Plugin.call($target, options);

        if (slideIndex) {
            $target.data('ui-slider').slideTo(slideIndex);
        }

        e.preventDefault();
    };

    $(document)
        .on('click.ui.slider.data-api', '[data-slide]', clickHandler)
        .on('click.ui.slider.data-api', '[data-slide-to]', clickHandler);

    $(window).on('load', function () {
        $('[data-ride="slider"]').each(function () {
            var $slider = $(this);
            Plugin.call($slider, $slider.data());
        });
    });
})(jQuery);
;;(function ($) {
    'use strict';

    // COLLAPSE PUBLIC CLASS DEFINITION
    // ================================

    var Collapse = function (element, options) {
        this.$element = $(element);
        this.opts = $.extend({}, Collapse.DEFAULTS, options);
        this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
            '[data-toggle="collapse"][data-target="#' + element.id + '"]');
        this.transitioning = null;

        if (this.opts.parent) {
            this.$parent = this.getParent()
        } else {
            this.addAriaAndCollapsedClass(this.$element, this.$trigger)
        }

        if (this.opts.toggle) this.toggle()
    };

    Collapse.VERSION = '1.3.0';

    Collapse.TRANSITION_DURATION = 350;

    Collapse.DEFAULTS = {
        toggle: true
    };

    var fn = Collapse.prototype;

    fn.dimension = function () {
        var hasWidth = this.$element.hasClass('width');
        return hasWidth ? 'width' : 'height';
    };

    fn.show = function () {
        if (this.transitioning || this.$element.hasClass('in')) return;

        var activesData;
        var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');

        if (actives && actives.length) {
            activesData = actives.data('ui.collapse');
            if (activesData && activesData.transitioning) return;
        }

        var startEvent = $.Event('show.ui.collapse');
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) return;

        if (actives && actives.length) {
            Plugin.call(actives, 'hide');
            activesData || actives.data('ui.collapse', null)
        }

        var dimension = this.dimension();

        this.$element
            .removeClass('collapse')
            .addClass('collapsing')[dimension](0)
            .attr('aria-expanded', true);

        this.$trigger
            .removeClass('collapsed')
            .attr('aria-expanded', true);

        this.transitioning = 1;

        var complete = function () {
            this.$element
                .removeClass('collapsing')
                .addClass('collapse in')[dimension]('');
            this.transitioning = 0;
            this.$element
                .trigger('shown.ui.collapse');
        };

        if (!$.support.transition) return complete.call(this);

        var scrollSize = $.camelCase(['scroll', dimension].join('-'));

        this.$element
            .one('uiTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
    };

    fn.hide = function () {
        if (this.transitioning || !this.$element.hasClass('in')) return;

        var startEvent = $.Event('hide.ui.collapse');
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) {
            return;
        }

        var dimension = this.dimension();

        this.$element[dimension](this.$element[dimension]())[0].offsetHeight

        this.$element
            .addClass('collapsing')
            .removeClass('collapse in')
            .attr('aria-expanded', false);

        this.$trigger
            .addClass('collapsed')
            .attr('aria-expanded', false);

        this.transitioning = 1;

        var complete = function () {
            this.transitioning = 0;
            this.$element
                .removeClass('collapsing')
                .addClass('collapse')
                .trigger('hidden.ui.collapse')
        }

        if (!$.support.transition) return complete.call(this);

        this.$element
            [dimension](0)
            .one('uiTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
    };

    fn.toggle = function () {
        this[this.$element.hasClass('in') ? 'hide' : 'show']()
    };

    fn.getParent = function () {
        return $(this.opts.parent)
            .find('[data-toggle="collapse"][data-parent="' + this.opts.parent + '"]')
            .each($.proxy(function (i, element) {
                var $element = $(element);
                this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
            }, this))
            .end()
    };

    fn.addAriaAndCollapsedClass = function ($element, $trigger) {
        var isOpen = $element.hasClass('in');

        $element.attr('aria-expanded', isOpen);
        $trigger
            .toggleClass('collapsed', !isOpen)
            .attr('aria-expanded', isOpen);
    };

    function getTargetFromTrigger($trigger) {
        var href;
        var target = $trigger.attr('data-target')
            || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''); // strip for ie7

        return $(target);
    }


    // COLLAPSE PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.collapse');
            var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false;
            if (!data) $this.data('ui.collapse', (data = new Collapse(this, options)));
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.collapse

    $.fn.collapse = Plugin
    $.fn.collapse.Constructor = Collapse


    // COLLAPSE NO CONFLICT
    // ====================

    $.fn.collapse.noConflict = function () {
        $.fn.collapse = old;
        return this;
    };


    // COLLAPSE DATA-API
    // =================

    $(document).on('click.ui.collapse.data-api', '[data-toggle="collapse"]', function (e) {
        var $this = $(this);

        if (!$this.attr('data-target')) e.preventDefault();

        var $target = getTargetFromTrigger($this);
        var data = $target.data('ui.collapse');
        var option = data ? 'toggle' : $this.data();

        Plugin.call($target, option);
    })

})(jQuery);
;;(function ($) {
    "use strict";

    var UI = window.UI;
    var $win = $(window);
    var $html = $('html');
    var $body = $(document.body);

    // 对话框类
    var Dialog = function (option) {
        this.index = ++Dialog.index;
        this.opts = $.extend({}, Dialog.DEFAULTS, option);
        this.init();
    };

    Dialog.VERSION = '1.3.0';

    Dialog.TYPE_ALERT = 0;
    Dialog.TYPE_DIALOG = 1;
    Dialog.TYPE_FRAME = 2;
    Dialog.TYPE_LOADING = 3;
    Dialog.TYPE_TIP = 4;

    // 默认配置
    Dialog.DEFAULTS = {
        btn: false,
        type: 0, // 0（信息框，默认）1（页面层）2（iframe层）3（加载层）4（tips层）
        shade: 0.3,
        title: '信息', // 标题
        offset: 'auto',
        size: 'auto',
        closeBtn: 'icon icon-close',
        time: 0, // 0表示不自动关闭
        zIndex: 1000000,
        maxWidth: 1000,
        anim: 'anim-dialog', // 动画
        icon: false,
        scrollbar: false, // 是否允许浏览器滚动条
        tips: 2,
        fix: true, // 是否固定位置
        draggable: {
            hander: '.dialog-header',
            containment: document
        },
        position: {
            x: 'center',
            y: 'center'
        }
    };

    // 五种原始层模式
    Dialog._type = ['common', 'page', 'iframe', '', 'tips'];

    Dialog._end = {};

    Dialog.index = 0;

    Dialog._record = function ($dialog) {
        var size = [
            $dialog.outerWidth(),
            $dialog.outerHeight(),
            $dialog.position().top,
            $dialog.position().left + parseFloat($dialog.css('margin-left'))
        ];
        $dialog.find('.dialog-max').addClass('dialog-maxmin');
        $dialog.attr({size: size});
    };

    Dialog._rescollbar = function (index) {
        if ($html.attr('ui-full') == index) {
            UI.enableScrollbar();
            $html.removeAttr('ui-full');
        }
    };

    // 屏蔽Enter触发弹层
    Dialog._enter = function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    };

    var fn = Dialog.prototype;

    // 容器
    fn.vessel = function (conType, callback) {
        var that = this,
            times = that.index,
            opts = that.opts;
        var zIndex = opts.zIndex + times;
        var titype = false;
        var ismax = opts.maxmin && (opts.type === 1 || opts.type === 2);
        var titleHTML = '';
        if (opts.title) {
            titleHTML = '<header class="dialog-header"><div class="dialog-title">'
                + opts.title + '</div></header>';
        }

        opts.zIndex = zIndex;

        // 遮罩
        var shadeHtml = opts.shade ? ('<div class="dialog-shade" id="dialog-shade' + times + '" times="' + times
        + '" style="' + ('z-index:' + (zIndex - 1)
        + '; background-color:' + (opts.shade[1] || '#000')
        + '; opacity:' + (opts.shade[0] || opts.shade) + ';')
        + '"></div>') : '';

        // 主体
        var dialogHtml =

            '<section class="dialog ' + opts.anim + (' dialog-' + Dialog._type[opts.type])
            + (((opts.type == 0 || opts.type == 2) && !opts.shade) ? ' dialog-border' : '')
            + ' ' + (opts.skin || '') + '" id="dialog' + times + '" type="' + Dialog._type[opts.type] + '" times="' + times + '" conType="' + (conType ? 'object' : 'string')
            + '" style="z-index: ' + zIndex + '; width:' + opts.size[0] + ';height:' + opts.size[1] + (opts.fix ? '' : ';position:absolute;') + '">'
            + (conType && opts.type != 2 ? '' : titleHTML)
            // body
            + '<div id="' + (opts.id || '') + '" class="dialog-body'
            + ((opts.type == 0 && opts.icon) ? ' dialog-padding' : '')
            + (opts.type == 3 ? ' dialog-loading' + opts.icon : '') + '">'

            + (opts.type == 0 && opts.icon ? '<i class="dialog-icon ' + opts.icon + '"></i>' : '')
            + (conType ? '' : (opts.content || ''))
            + '</div>'
            // setwin
            + '<span class="dialog-setwin">'
            + function () {
                var closebtn = ismax ? '<a class="dialog-min" href="#"><i class="icon icon-minus"></i></a><a class="dialog-ico dialog-max" href="#"><i class="icon icon-max"></i> </a>' : '';
                opts.closeBtn && (closebtn += '<a class="dialog-close ' + (opts.title ? opts.closeBtn : (opts.type == 4 ? 'icon icon-close' : 'dialog-ico dialog-close2')) + '" href="javascript:;"></a>');
                return closebtn;
            }()
            + '</span>'
            // footer
            + (function () {
                if (!opts.btn) {
                    return '';
                }

                var button = '';
                typeof opts.btn === 'string' && (opts.btn = [opts.btn]);
                for (var i = 0, len = opts.btn.length; i < len; i++) {
                    button += '<a class="btn dialog-btn' + i + '">' + opts.btn[i] + '</a>'
                }
                return '<footer class="dialog-footer">' + button + '</footer>'
            })()
            + '</section>';

        callback(shadeHtml, dialogHtml, titleHTML);
        return that;
    };

    // 初始化
    fn.init = function () {
        var that = this,
            opts = that.opts,
            times = that.index,
            nodeIndex;
        var content = opts.content,
            conType = typeof content === 'object';

        if ($('#' + opts.id)[0]) {
            return;
        }

        if (typeof opts.size === 'string') {
            opts.size = opts.size === 'auto' ? ['', ''] : [opts.size, ''];
        }

        switch (opts.type) {
            case 0:
                opts.btn = ('btn' in opts) ? opts.btn : '确定';
                UI.closeAll('dialog');
                break;
            case 2:
                var content = opts.content = conType ? opts.content : [opts.content || 'https://www.baidu.com/', 'auto'];
                opts.content = '<iframe scrolling="' + (opts.content[1] || 'auto') + '" allowtransparency="true" id="dialog-iframe' + times + '" name="dialog-iframe' + times + '" onload="this.className=\'\';" class="dialog-load" frameborder="0" src="' + opts.content[0] + '"></iframe>';
                break;
            case 3:
                opts.title = false;
                opts.closeBtn = false;
                UI.closeAll('loading');
                break;
            case 4:
                conType || (opts.content = [opts.content, 'body']);
                opts.follow = opts.content[1];
                opts.content = opts.content[0] + '<i class="dialog-TipsG"></i>';
                opts.title = false;
                opts.fix = false;
                opts.tips = typeof opts.tips === 'object' ? opts.tips : [opts.tips, true];
                opts.tipsMore || UI.closeAll('tips');
                break;
        }


        // 建立容器
        that.vessel(conType, function (shadeHtml, dialogHtml, titleHTML) {
            $body.append(shadeHtml);
            conType ? function () {
                (opts.type == 2 || opts.type == 4) ? function () {
                    $body.append(dialogHtml);
                }() : function () {
                    if (!content.parents('.dialog')[0]) {
                        content.show().addClass('dialog-wrap');
                        if (typeof content.wrap == 'function') { // TODO 加个判断，解决一个特殊的bug
                            content.wrap(dialogHtml);
                        } else {
                            content.loop(dialogHtml);
                        }

                        $('#dialog' + times).find('.dialog-body').before(titleHTML);
                    }
                }();
            }() : $body.append(dialogHtml);
            that.$dialog = $('#dialog' + times);

            $html.attr('ui-full', times);
            opts.scrollbar || UI.disableScrollbar();
        })._auto(times);

        $(document).off('keydown', Dialog._enter).on('keydown', Dialog._enter);
        that.$dialog.on('keydown', function (e) {
            $(document).off('keydown', Dialog._enter);
        });

        // 坐标自适应浏览器窗口尺寸
        opts.type == 4 ? that.tips() : that.offset();
        if (opts.fix) {
            $win.on('resize', function () {
                that.offset();
                (/^\d+%$/.test(opts.size[0]) || /^\d+%$/.test(opts.size[1])) && that._auto(times);
                opts.type == 4 && that.tips();
            });
        }

        opts.time && setTimeout(function () {
            UI.close(that.index)
        }, opts.time);
        opts.draggable && that.draggable();
        that.callback();
    };

    // 自适应
    fn._auto = function (index) {
        var opts = this.opts;
        var $dialog = $('#dialog' + index);
        if (opts.size[0] === '' && opts.maxWidth > 0) {
            $dialog.outerWidth() > opts.maxWidth && $dialog.width(opts.maxWidth);
        }
        var size = [$dialog.innerWidth(), $dialog.innerHeight()];
        var titHeight = $dialog.find('.dialog-header').outerHeight() || 0;
        var btnHeight = $dialog.find('.dialog-footer').outerHeight() || 0;

        function setHeight(elem) {
            elem = $dialog.find(elem);
            elem.height(size[1] - titHeight - btnHeight - 2 * (parseFloat(elem.css('padding')) | 0));
        }

        switch (opts.type) {
            case 2:
                setHeight('iframe');
                break;
            default:
                if (opts.size[1] === '') {
                    if (opts.fix && size[1] >= $win.height()) {
                        size[1] = $win.height();
                        setHeight('.dialog-body');
                    }
                } else {
                    setHeight('.dialog-body');
                }
                break;
        }
        return this;
    };

    // 计算坐标
    fn.offset = function () {
        var that = this;
        if (that.opts.position) {
            that.$dialog.pot(that.opts.position);
        }
    };

    // Tips
    fn.tips = function () {
        var that = this,
            opts = that.opts,
            $dialog = that.$dialog;
        var size = [$dialog.outerWidth(), $dialog.outerHeight()], follow = $(opts.follow);
        if (!follow[0]) follow = $body;
        var goal = {
            width: follow.outerWidth(),
            height: follow.outerHeight(),
            top: follow.offset().top,
            left: follow.offset().left
        }, tipsG = $dialog.find('.dialog-TipsG');

        var guide = opts.tips[0];
        opts.tips[1] || tipsG.remove();

        goal.autoLeft = function () {
            if (goal.left + size[0] - $win.width() > 0) {
                goal.tipLeft = goal.left + goal.width - size[0];
                tipsG.css({right: 12, left: 'auto'});
            } else {
                goal.tipLeft = goal.left;
            }
            ;
        };

        //辨别tips的方位
        goal.where = [function () { //上
            goal.autoLeft();
            goal.tipTop = goal.top - size[1] - 10;
            tipsG.removeClass('dialog-TipsB').addClass('dialog-TipsT').css('border-right-color', opts.tips[1]);
        }, function () { //右
            goal.tipLeft = goal.left + goal.width + 10;
            goal.tipTop = goal.top;
            tipsG.removeClass('dialog-TipsL').addClass('dialog-TipsR').css('border-bottom-color', opts.tips[1]);
        }, function () { //下
            goal.autoLeft();
            goal.tipTop = goal.top + goal.height + 10;
            tipsG.removeClass('dialog-TipsT').addClass('dialog-TipsB').css('border-right-color', opts.tips[1]);
        }, function () { //左
            goal.tipLeft = goal.left - size[0] - 10;
            goal.tipTop = goal.top;
            tipsG.removeClass('dialog-TipsR').addClass('dialog-TipsL').css('border-bottom-color', opts.tips[1]);
        }];
        goal.where[guide - 1]();

        /* 8*2为小三角形占据的空间 */
        if (guide === 1) {
            goal.top - ($win.scrollTop() + size[1] + 8 * 2) < 0 && goal.where[2]();
        } else if (guide === 2) {
            $win.width() - (goal.left + goal.width + size[0] + 8 * 2) > 0 || goal.where[3]()
        } else if (guide === 3) {
            (goal.top - $win.scrollTop() + goal.height + size[1] + 8 * 2) - $win.height() > 0 && goal.where[0]();
        } else if (guide === 4) {
            size[0] + 8 * 2 - goal.left > 0 && goal.where[1]()
        }

        $dialog.find('.dialog-body').css({
            'background-color': opts.tips[1],
            'padding-right': (opts.closeBtn ? '30px' : '')
        });
        $dialog.css({left: goal.tipLeft, top: goal.tipTop});
    }

    // 拖拽层
    fn.draggable = function () {
        var that = this;
        that.$dialog.draggable({
            hander: '.dialog-header',
            containment: document
        });
        return that;
    };

    fn.callback = function () {
        var that = this,
            $dialog = that.$dialog,
            opts = that.opts;
        that.openLayer();
        if (opts.success) {
            if (opts.type == 2) {
                $dialog.find('iframe').on('load', function () {
                    opts.success($dialog, that.index);
                });
            } else {
                opts.success($dialog, that.index);
            }
        }

        //按钮
        $dialog.find('.dialog-footer').children('a').on('click', function () {
            var index = $(this).index();
            if (index === 0) {
                if (opts.yes) {
                    opts.yes(that.index, $dialog)
                } else if (opts['btn1']) {
                    opts['btn1'](that.index, $dialog)
                } else {
                    UI.close(that.index);
                }
            } else {
                var close = opts['btn' + (index + 1)] && opts['btn' + (index + 1)](that.index, $dialog);
                close === false || UI.close(that.index);
            }
        });

        // 取消
        function cancel() {
            var close = opts.cancel && opts.cancel(that.index, $dialog);
            close === false || UI.close(that.index);
        }

        // 右上角关闭回调
        $dialog.find('.dialog-close').on('click', cancel);

        // 点遮罩关闭
        if (opts.shadeClose) {
            $('#dialog-shade' + that.index).on('click', function () {
                UI.close(that.index);
            });
        }

        // 最小化
        $dialog.find('.dialog-min').on('click', function (e) {
            e.preventDefault();

            UI.min(that.index, opts);
            opts.min && opts.min($dialog);
        });

        // 全屏/还原
        $dialog.find('.dialog-max').on('click', function (e) {
            e.preventDefault();

            if ($(this).hasClass('dialog-maxmin')) {
                UI.restore(that.index);
                opts.restore && opts.restore($dialog);
            } else {
                UI.full(that.index, opts);
                opts.full && opts.full($dialog);
            }
        });

        opts.end && (Dialog._end[that.index] = opts.end);
    };

    // 需依赖原型的对外方法
    fn.openLayer = function () {
        var that = this;

        //置顶当前窗口
        UI.zIndex = that.opts.zIndex;
        UI.setTop = function ($dialog) {
            var setZindex = function () {
                UI.zIndex++;
                $dialog.css('z-index', UI.zIndex + 1);
            };
            UI.zIndex = parseInt($dialog[0].style.zIndex);
            $dialog.on('mousedown', setZindex);
            return UI.zIndex;
        };
    };

    // 对话框
    UI.dialog = function (options) {
        var dialog = new Dialog(options);
        return dialog.index;
    };

    // 获取子iframe的DOM
    UI.getChildFrame = function (selector, index) {
        index = index || $('.dialog-iframe').attr('times');
        return $('#dialog' + index).find('iframe').contents().find(selector);
    };

    // 得到当前iframe层的索引，子iframe时使用
    UI.getFrameIndex = function (name) {
        return $('#' + name).parents('.dialog-iframe').attr('times');
    };

    // iframe层自适应宽高
    UI.iframeAuto = function (index) {
        if (!index) {
            return;
        }
        var heg = UI.getChildFrame('html', index).outerHeight();
        var $dialog = $('#dialog' + index);
        var titHeight = $dialog.find('.dialog-header').outerHeight() || 0;
        var btnHeight = $dialog.find('.dialog-footer').outerHeight() || 0;
        $dialog.css({height: heg + titHeight + btnHeight});
        $dialog.find('iframe').css({height: heg});
    };

    // 重置iframe url
    UI.iframeSrc = function (index, url) {
        $('#dialog' + index).find('iframe').attr('src', url);
    };

    // 设定层的样式
    UI.style = function (index, options) {
        var $dialog = $('#dialog' + index),
            type = $dialog.attr('type');
        var titHeight = $dialog.find('.dialog-header').outerHeight() || 0;
        var btnHeight = $dialog.find('.dialog-footer').outerHeight() || 0;
        if (type === Dialog._type[1] || type === Dialog._type[2]) {
            $dialog.css(options);
            if (type === Dialog._type[2]) {
                $dialog.find('iframe').css({
                    height: parseFloat(options.height) - titHeight - btnHeight
                });
            }
        }
    };

    // 最小化
    UI.min = function (index, options) {
        var $dialog = $('#dialog' + index);
        var titHeight = $dialog.find('.dialog-header').outerHeight() || 0;
        Dialog._record($dialog);
        UI.style(index, {width: 180, height: titHeight, overflow: 'hidden'});
        $dialog.find('.dialog-min').hide();
        $dialog.attr('type') === 'page' && $dialog.find('dialog-iframe').hide();
        Dialog._rescollbar(index);
    };

    // 还原
    UI.restore = function (index) {
        var $dialog = $('#dialog' + index);
        var size = $dialog.attr('size').split(',');
        var type = $dialog.attr('type');
        UI.style(index, {
            width: parseFloat(size[0]),
            height: parseFloat(size[1]),
            top: parseFloat(size[2]),
            left: parseFloat(size[3]),
            overflow: 'visible'
        });
        $dialog.find('.dialog-max').removeClass('dialog-maxmin');
        $dialog.find('.dialog-min').show();
        $dialog.attr('type') === 'page' && $dialog.find('dialog-iframe').show();
        Dialog._rescollbar(index);
    };

    // 全屏
    UI.full = function (index) {
        var $dialog = $('#dialog' + index),
            timer;
        Dialog._record($dialog);
        if (!$html.attr('ui-full')) {
            $html.css('overflow', 'hidden').attr('ui-full', index);
        }
        clearTimeout(timer);
        timer = setTimeout(function () {
            var isfix = $dialog.css('position') === 'fixed';
            UI.style(index, {
                top: isfix ? 0 : $win.scrollTop(),
                left: isfix ? 0 : $win.scrollLeft(),
                width: $win.width(),
                height: $win.height()
            });
            $dialog.find('.dialog-min').hide();
        }, 100);
    };

    // 修改标题
    UI.title = function (name, index) {
        var $header = $('#dialog' + (index || Dialog.index)).find('.dialog-header');
        $header.html(name);
    };

    // 关闭对话框
    UI.close = function (index) {
        var $dialog = $('#dialog' + index);
        var type = $dialog.attr('type');
        if (!$dialog[0]) {
            return;
        }

        if ((type === Dialog._type[0] || type === Dialog._type[1]) && $dialog.attr('conType') === 'object') {
            $dialog.children(':not(.dialog-body)').remove();
            for (var i = 0; i < 2; i++) {
                $dialog.find('.dialog-wrap').unwrap().hide();
            }
        } else {
            $dialog[0].innerHTML = '';
            $dialog.remove();
        }
        $('#dialog-moves, #dialog-shade' + index).remove();
        Dialog._rescollbar(index);
        $(document).off('keydown', Dialog._enter);
        typeof Dialog._end[index] === 'function' && Dialog._end[index]();
    };

    // 关闭所有层
    UI.closeAll = function (type) {
        $.each($('.dialog'), function () {
            var $this = $(this);
            var is = type ? ($this.attr('type') === type) : 1;
            is && UI.close($this.attr('times'));
            is = null;
        });
    };



    UI.Dialog = Dialog;

    function Plugin(options) {
        return $(this).each(function () {

            var $this = $(this);

            var data = $this.data('ui.dialog');

            if (options === 'hide') {
                var index = $this.data('dialog-index');
                //data['hide'];
                UI.close(index);
            } else {
                var type = 0;
                if (options && options.type) {
                    type = options.type;
                }
                var opt = $.extend({}, options, {
                    type: type,
                    content: $(this),
                })
                var index = UI.dialog(opt);
                $this.data('dialog-index', index);
            }
        });
    }

    // 支持jQuery
    $.fn.dialog = Plugin;

    // RequireJS
    if (typeof define === 'function') {
        define(function () { return UI; });
    }

})(jQuery);

// overlay
;(function ($) {

    $.fn.overlay = function (options) {
        return $(this).each(function () {

            var $this = $(this);

            var data = $this.data('ui.dialog');

            if (options === 'hide') {
                var index = $this.data('dialog-index');
                UI.close(index);
            } else {
                var opt = $.extend({}, options, {
                    type: 1,
                    content: $(this),
                })
                var index = UI.dialog(opt);
                $this.data('dialog-index', index);
            }
        });
    }
})(jQuery);

// confirm
;(function ($) {

    /* 确认框 */
    UI.confirm = function (content, options, yes, cancel) {
        if (typeof options === 'function') {
            cancel = yes;
            yes = options;
            options = {};
        }

        return UI.dialog($.extend({
            type: 0,
            closeBtn: 'icon icon-close',
            title: '信息',
            content: content,
            btn: ['确定', '取消'],
            yes: yes,
            btn2: cancel
        }, options));
    };

    UI.loading = function (icon, options) {
        return UI.dialog($.extend({
            type: 3,
            skin: 'dialog-loading',
            icon: icon || 0,
            shade: 0.01
        }, options));
    };

    UI.tips = function (content, follow, options) {
        return UI.dialog($.extend({
            type: 4,
            content: [content, follow],
            closeBtn: false,
            time: 3000,
            shade: false,
            maxWidth: 210
        }, options));
    };

    // frame
    UI.frame = function (content, options) {
        return UI.dialog($.extend({
            type: 2,
            content: content,
            closeBtn: 'icon icon-close',
            title: '信息',
            btn: ['确定'],
        }, options));
    };


})(jQuery);

// alert
;(function ($) {
    function Alert() {

    }

    Alert.DEFAULTS = {
        type: 0,
        skin: 'dialog-alert',
        title: '信息',
        closeBtn: 'icon icon-close',
        btn: ['确定'],
    };

    UI.Alert = Alert;

    // 警告框
    UI.alert = function (content, options, yes) {
        if (typeof options === 'function') {
            yes = options;
            options = {};
        }
        if (options && options.content) {
            content = $(options.content);
        }
        return UI.dialog($.extend({}, Alert.DEFAULTS, {
            content: content,
            yes: yes,
        }, options));
    };
})(jQuery);

// prompt
;(function ($) {
    function Prompt() {

    }

    Prompt.DEFAULTS = {
        type: 0,
        skin: 'dialog-prompt',
        title: '信息',
        btn: ['确定', '取消'],
        closeBtn: 'icon icon-close',
    };

    UI.Prompt = Prompt;

    UI.prompt = function (options, yes) {
        options = options || {};
        if (typeof options === 'function') {
            yes = options;
        }
        var prompt, content = options.formType == 2 ? '<textarea class="form-control dialog-input">' + (options.value || '') + '</textarea>' : function () {
            return '<input type="' + (options.formType == 1 ? 'password' : 'text') + '" class="form-control dialog-input" value="' + (options.value || '') + '">';
        }();
        return UI.dialog($.extend({}, Prompt.DEFAULTS, {
            content: content,
            success: function ($dialog) {
                prompt = $dialog.find('.dialog-input');
                prompt.focus();
            },
            yes: function (index) {
                var value = prompt.val();
                if (value === '') {
                    prompt.focus();
                } else if (value.length > (options.maxlength || 500)) {
                    UI.tips('最多输入' + (options.maxlength || 500) + '个字数', prompt, {tips: 1});
                } else {
                    yes && yes(value, index, prompt);
                }
            }
        }, options));
    };
})(jQuery);

// msg
;(function ($) {
    /* 消息提示 */
    function Message() {

    }

    Message.DEFAULTS = {

    };

    UI.msg = function (content, options, end) {
        if (typeof options === 'function') {
            end = options;
            options = {};
        }

        return UI.dialog($.extend({
            type: 0,
            content: content,
            time: 3000,
            shade: false,
            skin: 'dialog-msg',
            title: false,
            closeBtn: false,
            btn: false,
            end: end,
            scrollbar: true,
        }, options));
    };
})(jQuery);
;;(function ($) {
    'use strict';

    // 下拉菜单类定义

    var backdrop = '.dropdown-backdrop';
    var toggle = '[data-toggle="dropdown"]';

    var Dropdown = function (element) {
        $(element).on('click.ui.dropdown', this.toggle);
    };

    Dropdown.VERSION = '1.3.0';

    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '');// strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent();
    }

    // 请空页面上所有显示出来的下拉菜单
    function clearMenus(e) {
        if (e && e.which === 3) {
            return;
        }
        $(backdrop).remove();
        $(toggle).each(function () {
            var $this = $(this);
            var $parent = getParent($this);
            var relatedTarget = {relatedTarget: this};

            if (!$parent.hasClass('open')) {
                return;
            }

            if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName)
                && $.contains($parent[0], e.target)) {
                return;
            }

            $parent.trigger(e = $.Event('hide.ui.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $this.attr('aria-expanded', 'false');
            $parent.removeClass('open').trigger($.Event('hidden.ui.dropdown', relatedTarget));
        })
    }

    var fn = Dropdown.prototype;

    // 显示/隐藏下拉菜单
    fn.toggle = function (e) {
        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');

        clearMenus();

        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $(document.createElement('div'))
                    .addClass('dropdown-backdrop')
                    .insertAfter($(this))
                    .on('click', clearMenus);
            }

            var relatedTarget = {relatedTarget: this};
            $parent.trigger(e = $.Event('show.ui.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $this
                .trigger('focus')
                .attr('aria-expanded', 'true');

            $parent
                .toggleClass('open')
                .trigger($.Event('shown.ui.dropdown', relatedTarget));
        }

        return false;
    };

    fn.keydown = function (e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');

        if (!isActive && e.which != 27 || isActive && e.which == 27) {
            if (e.which == 27) {
                $parent.find(toggle).trigger('focus');
            }
            return $this.trigger('click');
        }

        var desc = ' li:not(.disabled):visible a';
        var $items = $parent.find('.dropdown-menu' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index(e.target);

        // up
        if (e.which == 38 && index > 0) {
            index--;
        }
        // down
        if (e.which == 40 && index < $items.length - 1) {
            index++;
        }
        if (!~index){
            index = 0;
        }

        $items.eq(index).trigger('focus');
    };

    fn.hoverover = function(e) {
        toggle(e);
    };

    // 下拉菜单插件定义
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.dropdown');

            if (!data) {
                data = new Dropdown(this);
                $this.data('ui.dropdown', data);
            }
            if (typeof option == 'string') {
                data[option].call($this);
            }
        });
    }

    var old = $.fn.dropdown;

    $.fn.dropdown = Plugin;
    $.fn.dropdown.Constructor = Dropdown;

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this;
    };

    $(document)
        .on('click.ui.dropdown.data-api', clearMenus)
        .on('click.ui.dropdown.data-api', '.dropdown form', function (e) {
            e.stopPropagation();
        })
        .on('click.ui.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.ui.dropdown.data-api', toggle, Dropdown.prototype.keydown)
        .on('keydown.ui.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
        //.on('mouseover', '[data-hover="dropdown"]', Dropdown.prototype.hoverover);

})(jQuery);
;;(function ($) {
    'use strict';

    var Tooltip = function (element, options) {
        this.type = null;
        this.opts = null;
        this.enabled = null;
        this.timeout = null;
        this.hoverState = null;
        this.$element = null;
        this.inState = null;

        this.init('tooltip', element, options)
    };

    Tooltip.VERSION = '1.0.0';
    Tooltip.TRANSITION_DURATION = 150;

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: 'body', // false
        viewport: {
            selector: 'body',
            padding: 0
        }
    };

    var fn = Tooltip.prototype;

    fn.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.opts = this.getOptions(options);
        this.$viewport = this.opts.viewport && $($.isFunction(this.opts.viewport) ? this.opts.viewport.call(this, this.$element) : (this.opts.viewport.selector || this.opts.viewport))
        this.inState = {click: false, hover: false, focus: false};

        if (this.$element[0] instanceof document.constructor && !this.opts.selector) {
            throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
        }

        var triggers = this.opts.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.opts.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn + '.' + this.type, this.opts.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.opts.selector, $.proxy(this.leave, this))
            }
        }

        this.opts.selector ?
            (this._options = $.extend({}, this.opts, {trigger: 'manual', selector: ''})) :
            this.fixTitle()
    };

    fn.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    fn.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            }
        }

        return options
    };

    fn.getDelegateOptions = function () {
        var options = {};
        var defaults = this.getDefaults();

        this._options && $.each(this._options, function (key, value) {
            if (DEFAULTS[key] != value) options[key] = value
        });

        return options
    };

    fn.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).data('ui.' + this.type);

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
            $(obj.currentTarget).data('ui.' + this.type, self)
        }

        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
        }

        if (self.tip().hasClass('in') || self.hoverState == 'in') {
            self.hoverState = 'in';
            return
        }

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.opts.delay || !self.opts.delay.show) return self.show();

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show()
        }, self.opts.delay.show)
    };

    fn.isInStateTrue = function () {
        for (var key in this.inState) {
            if (this.inState[key]) return true
        }

        return false;
    };

    fn.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).data('ui.' + this.type);

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
            $(obj.currentTarget).data('ui.' + this.type, self)
        }

        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
        }

        if (self.isInStateTrue()) return;

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.opts.delay || !self.opts.delay.hide) return self.hide();

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide()
        }, self.opts.delay.hide)
    };

    fn.show = function () {
        var e = $.Event('show.ui.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
            if (e.isDefaultPrevented() || !inDom) return
            var that = this;

            var $tip = this.tip();

            var tipId = this.getUID(this.type);

            this.setContent();
            $tip.attr('id', tipId);
            this.$element.attr('aria-describedby', tipId);

            if (this.opts.animation) $tip.addClass('fade');

            var placement = typeof this.opts.placement == 'function' ?
                this.opts.placement.call(this, $tip[0], this.$element[0]) :
                this.opts.placement;

            var autoToken = /\s?auto?\s?/i;
            var autoPlace = autoToken.test(placement);
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top';

            $tip
                .detach()
                .css({top: 0, left: 0, display: 'block'})
                .addClass(placement)
                .data('ui.' + this.type, this);

            this.opts.container ? $tip.appendTo(this.opts.container) : $tip.insertAfter(this.$element);
            this.$element.trigger('inserted.ui.' + this.type);

            var pos = this.getPosition();
            var actualWidth = $tip[0].offsetWidth;
            var actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var orgPlacement = placement;
                var viewportDim = this.getPosition(this.$viewport);

                placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' :
                    placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' :
                        placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' :
                            placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' :
                                placement;

                $tip
                    .removeClass(orgPlacement)
                    .addClass(placement)
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);

            var complete = function () {
                var prevHoverState = that.hoverState;
                that.$element.trigger('shown.ui.' + that.type);
                that.hoverState = null;

                if (prevHoverState == 'out') that.leave(that)
            };

            $.support.transition && this.$tip.hasClass('fade') ?
                $tip
                    .one('uiTransitionEnd', complete)
                    .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
                complete()
        }
    };

    fn.applyPlacement = function (offset, placement) {
        var $tip = this.tip();
        var width = $tip[0].offsetWidth;
        var height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10);
        var marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop))  marginTop = 0;
        if (isNaN(marginLeft)) marginLeft = 0;

        offset.top += marginTop;
        offset.left += marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                })
            }
        }, offset), 0);

        $tip.addClass('in');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth = $tip[0].offsetWidth;
        var actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight
        }

        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

        if (delta.left) offset.left += delta.left;
        else offset.top += delta.top;

        var isVertical = /top|bottom/.test(placement);
        var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

        $tip.offset(offset);
        this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
    };

    fn.replaceArrow = function (delta, dimension, isVertical) {
        this.arrow()
            .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
            .css(isVertical ? 'top' : 'left', '')
    };

    fn.setContent = function () {
        var $tip = this.tip();
        var title = this.getTitle();

        $tip.find('.tooltip-inner')[this.opts.html ? 'html' : 'text'](title);
        $tip.removeClass('fade in top bottom left right');
    }

    fn.hide = function (callback) {
        var that = this;
        var $tip = $(this.$tip);
        var e = $.Event('hide.ui.' + this.type);

        function complete() {
            if (that.hoverState != 'in') $tip.detach();
            that.$element
                .removeAttr('aria-describedby')
                .trigger('hidden.ui.' + that.type);
            callback && callback()
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) return;

        $tip.removeClass('in');

        $.support.transition && $tip.hasClass('fade') ?
            $tip
                .one('uiTransitionEnd', complete)
                .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
            complete();

        this.hoverState = null;

        return this
    };

    fn.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    };

    fn.hasContent = function () {
        return this.getTitle()
    };

    fn.getPosition = function ($element) {
        $element = $element || this.$element;

        var el = $element[0];
        var isBody = el.tagName == 'BODY';

        var elRect = el.getBoundingClientRect();
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually
            elRect = $.extend({}, elRect, {width: elRect.right - elRect.left, height: elRect.bottom - elRect.top})
        }
        var elOffset = isBody ? {top: 0, left: 0} : $element.offset();
        var scroll = {scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop()}
        var outerDims = isBody ? {width: $(window).width(), height: $(window).height()} : null;

        return $.extend({}, elRect, scroll, outerDims, elOffset)
    };

    fn.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2} :
            placement == 'top' ? {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2} :
                placement == 'left' ? {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth} :
                    /* placement == 'right' */ {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left + pos.width
                }

    };

    fn.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
        var delta = {top: 0, left: 0};
        if (!this.$viewport) return delta;

        var viewportPadding = this.opts.viewport && this.opts.viewport.padding || 0;
        var viewportDimensions = this.getPosition(this.$viewport);

        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
            if (topEdgeOffset < viewportDimensions.top) { // top overflow
                delta.top = viewportDimensions.top - topEdgeOffset
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding;
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
            if (leftEdgeOffset < viewportDimensions.left) { // left overflow
                delta.left = viewportDimensions.left - leftEdgeOffset
            } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
            }
        }

        return delta
    };

    fn.getTitle = function () {
        var title;
        var $e = this.$element;
        var o = this.opts;

        title = $e.attr('data-original-title')
            || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);

        return title
    };

    fn.getUID = function (prefix) {
        do prefix += ~~(Math.random() * 1000000);
        while (document.getElementById(prefix));
        return prefix
    };

    fn.tip = function () {
        if (!this.$tip) {
            this.$tip = $(this.opts.template);
            if (this.$tip.length != 1) {
                throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
            }
        }
        return this.$tip
    };

    fn.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
    };

    fn.enable = function () {
        this.enabled = true
    };

    fn.disable = function () {
        this.enabled = false
    };

    fn.toggleEnabled = function () {
        this.enabled = !this.enabled
    };

    fn.toggle = function (e) {
        var self = this;
        if (e) {
            self = $(e.currentTarget).data('ui.' + this.type);
            if (!self) {
                self = new this.constructor(e.currentTarget, this.getDelegateOptions());
                $(e.currentTarget).data('ui.' + this.type, self)
            }
        }

        if (e) {
            self.inState.click = !self.inState.click;
            if (self.isInStateTrue()) self.enter(self);
            else self.leave(self)
        } else {
            self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
        }
    };

    fn.destroy = function () {
        var that = this;
        clearTimeout(this.timeout);
        this.hide(function () {
            that.$element.off('.' + that.type).removeData('ui.' + that.type);
            if (that.$tip) {
                that.$tip.detach()
            }
            that.$tip = null;
            that.$arrow = null;
            that.$viewport = null;
        })
    }


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.tooltip');
            var options = typeof option == 'object' && option;

            if (!data && /destroy|hide/.test(option)) return;
            if (!data) $this.data('ui.tooltip', (data = new Tooltip(this, options)));
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tooltip;

    $.fn.tooltip = Plugin;
    $.fn.tooltip.Constructor = Tooltip;


    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old;
        return this;
    }

})(jQuery);
;;(function ($) {
    'use strict';

    var Popover = function (element, options) {
        this.init('popover', element, options);
    };

    if (!$.fn.tooltip) {
        throw new Error('Popover requires tooltip.js');
    }

    Popover.VERSION = '1.3.0';

    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right',
        trigger: 'hover',
        content: '',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    });


    // NOTE: POPOVER 继承 tooltip.js

    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
    var fn = Popover.prototype;

    Popover.prototype.constructor = Popover;

    fn.getDefaults = function () {
        return Popover.DEFAULTS
    };

    fn.setContent = function () {
        var $tip = this.tip();
        var title = this.getTitle();
        var content = this.getContent();

        $tip.find('.popover-title')[this.opts.html ? 'html' : 'text'](title);
        $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
            this.opts.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
            ](content);

        $tip.removeClass('fade top bottom left right in');

        // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
        // this manually by checking the contents.
        if (!$tip.find('.popover-title').html()) {
            $tip.find('.popover-title').hide();
        }
    };

    fn.hasContent = function () {
        return this.getTitle() || this.getContent();
    };

    fn.getContent = function () {
        var $e = this.$element;
        var o = this.opts;

        return $e.attr('data-content')
            || (typeof o.content == 'function' ?
                o.content.call($e[0]) :
                o.content);
    };

    fn.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
    };

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.popover');
            var options = typeof option == 'object' && option;

            if (!data && /destroy|hide/.test(option)) {
                return;
            }
            if (!data) {
                $this.data('ui.popover', (data = new Popover(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    }

    var old = $.fn.popover;

    $.fn.popover = Plugin;
    $.fn.popover.Constructor = Popover;

    $.fn.popover.noConflict = function () {
        $.fn.popover = old;
        return this;
    }
})(jQuery);
;;(function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body);
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
    this.opts        = $.extend({}, ScrollSpy.DEFAULTS, options);
    this.selector       = (this.opts.target || '') + ' .nav li > a';
    this.offsets        = [];
    this.targets        = [];
    this.activeTarget   = null;
    this.scrollHeight   = 0;

    this.$scrollElement.on('scroll.ui.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '1.3.0'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.opts.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.opts.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this._activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this._activate(targets[i])
    }
  }

  ScrollSpy.prototype._activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.ui.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.opts.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('ui.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('ui.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.ui.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

})(jQuery);
;;(function ($) {
    'use strict';

    // TAB 类定义
    var Tab = function (element) {
        this.element = $(element);
    };

    Tab.VERSION = '1.3.0';

    Tab.TRANSITION_DURATION = 150;

    var fn = Tab.prototype;

    // 用于切换触发区与相关事件,并在里面调用切换面板的activate
    fn.show = function () {
        var $this = this.element;
        var $ul = $this.closest('ul:not(.dropdown-menu)'); // 找到触发区的容器
        var selector = $this.data('target'); // 取得对应的面板的CSS表达式

        if (!selector) {
            selector = $this.attr('href'); // 没有则从href得到
        }

        if ($this.parent('.nav-item').hasClass('active')) {
            return;
        }

        var $previous = $ul.find('.active:last .link-item'); // 获得被激活的链接之前的链接
        var hideEvent = $.Event('hide.ui.tab', {
            relatedTarget: $this[0]
        });
        var showEvent = $.Event('show.ui.tab', {
            relatedTarget: $previous[0]
        });

        $previous.trigger(hideEvent);
        $this.trigger(showEvent);

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
            return;
        }

        var $target = $(selector);

        this._activate($this.closest('.nav-item'), $ul);
        this._activate($target, $target.parent(), function () {
            $previous.trigger({
                type: 'hidden.ui.tab',
                relatedTarget: $this[0]
            });
            $this.trigger({
                type: 'shown.ui.tab',
                relatedTarget: $previous[0]
            });
        })
    };

    fn._activate = function (element, container, callback) {
        var $active = container.find('> .active');
        var transition = callback
            && $.support.transition
            && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

        function next() {
            // 让之前的处于激活状态取消激活状态
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active')
                .end()
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', false);
            //让当前面板处于激活状态
            element
                .addClass('active')
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', true);

            if (transition) {
                element[0].offsetWidth; // reflow for transition
                element.addClass('in');
            } else {
                element.removeClass('fade');
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('active')
                    .end()
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', true);
            }

            // 执行回调，目的是触发shown事件
            callback && callback();
        }

        $active.length && transition ?
            $active
                .one('uiTransitionEnd', next)
                .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
            next();

        // 开始触发CSS3 transition回调
        $active.removeClass('in');
    };


    // TAB 插件定义

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ui.tab');

            if (!data) {
                $this.data('ui.tab', (data = new Tab(this)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        })
    }

    var old = $.fn.tab;

    $.fn.tab = Plugin;
    $.fn.tab.Constructor = Tab;

    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this
    };

    // TAB DATA-API

    var clickHandler = function (e) {
        e.preventDefault();
        Plugin.call($(this), 'show')
    };

    $(document)
        .on('click.ui.tab.data-api', '[data-toggle="tab"]', clickHandler)
        .on('click.ui.tab.data-api', '[data-toggle="pill"]', clickHandler);

})(jQuery);
;;(function ($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {end: transEndEventNames[name]};
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function (duration) {
        var called = false
        var $el = this
        $(this).one('uiTransitionEnd', function () {
            called = true
        })
        var callback = function () {
            if (!called) $($el).trigger($.support.transition.end)
        }
        setTimeout(callback, duration)
        return this
    }

    $(function () {
        $.support.transition = transitionEnd()

        if (!$.support.transition) return

        $.event.special.uiTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function (e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })

})(jQuery);
;(function($) {

    $.fn.euiToTop = function(options) {

        var defaults = {
            topOffset: 300, // 滚动条距离顶部多少像素时显示返回顶部按钮
            duration: 700, // 返回顶部滚动时间(ms)
        };
        var opts = $.extend({}, DEFAULTS, options);

        var $this = $(this);

        $this.hide().on('click', function(event) {
            event.preventDefault();
            $('body,html').animate({
                    scrollTop: 0
                },
                opts.duration
            );
        });

        $(window).scroll(function() {
            if ($(this).scrollTop() > opts.topOffset) {
                $this.fadeIn();
            } else {
                $this.fadeOut();
            }
        });

        return this;
    }
})(jQuery);
