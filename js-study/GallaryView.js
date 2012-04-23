define(function(require, exports) {
    var Backbone = require('../lib/backbone');
    var _ = require('../lib/underscore');
    var $ = require('../lib/jquery');

    var STEP = 1;
    var PADDING = 10;

    var GallaryView = Backbone.View.extend({
        isMouseOnImage: false,

        events: {
            'mouseover .gallary-image .thumb-image': 'onMouseover',
            'mouseout .gallary-image .thumb-image': 'onMouseout',
            'mousemove .gallary-image .thumb-image': 'onMousemove',
            'click .gallary-image': 'onGallaryImageClick'
        },

        initialize: function(options) {
            _.bindAll(this, 'toggle', 'shrink', 'expand');
            $('.gallary-image').live('hover', _.bind(function(evt) {
                if ($(evt.currentTarget).hasClass('image-expanded')) {
                    if (evt.type == 'mouseenter') {
                        this.showImageOp(evt);
                    } else {
                        this.hideImageOp(evt);
                    }
                }
            }, this));

            this.collection = options.collection;
        },

        limitBorder: function(offset, rect, pos) {
            if (pos < offset) {
                return offset;
            } else if (pos > offset + rect) {
                return rect + offset;
            } else {
                return pos;
            }
        },

        showImageOp: function(evt) {
            var $box = $(evt.currentTarget);
            var width = 516;
            if (this.collection) {
                var model = this.collection.getByCid($box.data('cid'));
                if (model && model.attributes && !model.get('noImageOP')) {
                    var photos = model.attributes.photos;
                    var photo = photos.get($box.data('image-id'));
                    photo = photo.toJSON();
                    var ImageOp = require('../view/ImageOp');
                    var bar = new ImageOp({photo: photo});
                    width = Math.min(width, photo.width);
                    bar.show($box, width);
                    this.bar = bar;
                }
            }
        },

        hideImageOp: function(evt) {
            if (this.bar) {
                this.bar.remove();
                this.bar = undefined;
            }
        },

        onMouseover: function(evt) {
            this.isMouseOnImage = true;
            var image = evt.target;
            var $image = $(image);
            if (!(image.width && image.height)) {
                return; // image is not loaded
            }

            if (image.width === image.height) {
                return;
            }

            if (image.width > image.height) {
                $(image).data('startPos', evt.pageX);
            } else {
                $(image).data('startPos', evt.pageY);
            }

            $image.closest('.gallary-image').animate({
                opacity: 0.8
            }, 200);
        },

        onMousemove: function(evt) {
            if (!this.isMouseOnImage) {
                return;
            }
            var image = evt.target;
            var $image = $(image);
            var startPosition = $image.data('startPos');

            if (!startPosition) {
                return;
            }

            var eventFix = null;
            var offsetFix = null;
            var rectFix = null;
            if (image.width > image.height) {
                eventFix = 'pageX';
                offsetFix = 'left';
                rectFix = 'width';
            } else {
                eventFix = 'pageY';
                offsetFix = 'top';
                rectFix = 'height';
            }

            var offset = $image.closest('.gallary-image').offset()[offsetFix] + PADDING;
            var rect = $image.closest('.gallary-image')[rectFix]() - 2*PADDING;
            var lastFix = $image.data('lastFix') || 0;
            var eventPosition = this.limitBorder(offset, rect, evt[eventFix]);
            startPosition = this.limitBorder(offset, rect, startPosition);

            var delta = startPosition - eventPosition;
            var precentage = null;
            var movement = null;

            if (delta < 0) {
                precentage = delta/(offset + rect - startPosition);
                movement = precentage * (image[rectFix] - rect - 2*PADDING + lastFix);
            } else if (delta > 0) {
                precentage = delta/(startPosition - offset);
                movement = precentage * (0 - lastFix);
            } else {
                return;
            }

            if (movement < STEP && movement > -STEP) {
                if (movement > 0) {
                    movement = STEP;
                } else if (movement < 0) {
                    movement = -STEP;
                }
            }
            movement += lastFix;

            var leftBorder = 0;
            var rightBorder = rect + 2*PADDING - image[rectFix];

            if (movement > leftBorder - STEP || movement < rightBorder + STEP) {
                movement = movement > leftBorder - STEP ? leftBorder : rightBorder;
                $image.data('startPos', eventPosition);
                $image.data('lastFix', movement);
            }

            movement = parseInt(movement, 10);
            $image.css('margin-' + offsetFix, movement);
            $image.data('currentFix', movement);
        },

        onMouseout: function(evt) {
            this.isMouseOnImage = false;
            var image = evt.target;
            var startPosition = $(image).data('startPos');

            if (!startPosition) {
                return;
            }

            $(image).data('lastFix', $(image).data('currentFix'));

            $(image).closest('.gallary-image').animate({
                opacity: 1
            }, 200);
        },

        onGallaryImageClick: function(evt) {
            var $gallarys = $(evt.currentTarget).siblings('.gallary-image').andSelf();

            if (! $(evt.currentTarget).hasClass('image-expanded')) {
                $gallarys.each(this.saveOriginalPosition);

                this.showImageOp(evt);
            }

            $gallarys.each(this.toggle);

            var $that = $(evt.currentTarget);
            if($(evt.currentTarget).hasClass('image-expanded')){
                var wp = $that.attr('wp');
                var sp = $that.attr('sp');
                var owx = Number(wp.split(';')[0]);
                var owy = Number(wp.split(';')[1]);
                var osx = Number(sp.split(';')[0]);
                var osy = Number(sp.split(';')[1]);
                window.scrollTo(owx + $that.offset().left - osx, owy + $that.offset().top - osy);
                this.onMouseout(evt);
            }else{
                window.scrollTo($that.attr('wp').split(';')[0], $that.attr('wp').split(';')[1]);
                $gallarys.each(this.clearOriginalPosition);
            }
        },

        saveOriginalPosition: function(index, gallary){
            var $gallary = $(gallary);
            var scrollX;
            var scrollY;
            if(window.scrollX !== undefined){
                scrollX = window.scrollX;
                scrollY = window.scrollY;
            }else{
                scrollX = window.document.documentElement.scrollLeft;
                scrollY = window.document.documentElement.scrollTop;
            }

            $gallary.attr('wp', scrollX + ';' + scrollY);
            $gallary.attr('sp', $gallary.offset().left + ';' + $gallary.offset().top);
        },

        clearOriginalPosition: function(index, gallary){
            var $gallary = $(gallary);
            $gallary.attr('wp', '');
            $gallary.attr('sp', '');
        },

        toggle: function(index, gallary) {
            var $gallary = $(gallary);

            if ($gallary.hasClass('image-expanded')) {
                this.shrink($gallary);
            } else {
                this.expand($gallary);
            }
        },

        expand: function($gallary) {
            if ($gallary.find('.normal-image').length > 0) {
                $gallary.addClass('image-expanded');

                $gallary.find('.thumb-image').addClass('hidden').siblings('.normal-image').removeClass('hidden');
            }
        },

        shrink: function($gallary) {
            $gallary.removeClass('image-expanded');
            $gallary.find('.thumb-image').removeClass('hidden').siblings('.normal-image').addClass('hidden');

            // clean image op bar
            this.hideImageOp();
        }
    });

    return GallaryView;
});

