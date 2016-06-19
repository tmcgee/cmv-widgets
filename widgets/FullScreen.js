define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/_base/array',
    'dojo/dom-class',
    'dojo/query',

    'dojo/text!./FullScreen/templates/FullScreen.html',
    'dojo/i18n!./FullScreen/nls/FullScreen',

    'xstyle/css!./FullScreen/css/FullScreen.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    topic,
    on,
    array,
    domClass,
    domQuery,

    template,
    i18n
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        i18n: i18n,
        baseClass: 'cmvFullScreenWidget',

        domNodeID: 'borderContainerOuter',
        closePanes: ['left', 'right', 'top', 'bottom'],

        postCreate: function () {
            this.inherited(arguments);

            var doc = window.top.document;
            this.own(on(doc, 'webkitfullscreenchange, mozfullscreenchange, MSFullscreenChange, fullscreenchange', lang.hitch(this, 'onFullScreenChange')));
        },

        toggleFullScreen: function (force) {
            if (this.isFullScreen() || force === false) {
                this.exitFullScreen();
            } else {
                this.enterFullScreen();
            }
        },

        isFullScreen: function () {
            var doc = window.top.document;
            return !(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement);
        },

        enterFullScreen: function () {
            var dom = document.getElementById(this.domNodeID);
            if (!dom) {
                return;
            }

            var calls = [
                'requestFullScreen',
                'webkitRequestFullScreen',
                'msRequestFullscreen',
                'mozRequestFullScreen'
            ];
            array.forEach(calls, function (call) {
                if (dom[call]) {
                    dom[call]();
                }
            });

            if (this.closePanes && this.closePanes.length > 0) {
                array.forEach(this.closePanes, function (pane) {
                    topic.publish('viewer/togglePane', {
                        pane: pane,
                        show: 'none'
                    });
                });
            }

            var btns = domQuery('.' + this.baseClass + ' .FullScreenButton');
            if (btns) {
                btns[0].title = this.i18n.restore;
            }

            btns = domQuery('.' + this.baseClass + ' .FullScreen');
            array.forEach(btns, function (btn) {
                domClass.add(btn, 'FullScreenRestore');
            });
        },

        exitFullScreen: function () {
            var calls = [
                'exitFullScreen',
                'webkitCancelFullScreen',
                'msExitFullscreen',
                'mozCancelFullScreen'
            ];
            array.forEach(calls, function (call) {
                if (window.top.document[call]) {
                    window.top.document[call]();
                }
            });

            var btns = domQuery('.' + this.baseClass + ' .FullScreenButton');
            if (btns) {
                btns[0].title = this.i18n.fullscreen;
            }

            btns = domQuery('.' + this.baseClass + ' .FullScreen');
            array.forEach(btns, function (btn) {
                domClass.remove(btn, 'FullScreenRestore');
            });
        },

        onFullScreenChange: function () {
            if (!this.isFullScreen()) {
                this.toggleFullScreen(false);
            }
        }
    });
});