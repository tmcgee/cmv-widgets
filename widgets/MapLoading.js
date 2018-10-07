define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-style',

    'put-selector/put'

], function (
    declare,
    _WidgetBase,

    lang,
    on,
    domStyle,

    put
) {
    return declare([_WidgetBase], {

        className: 'fa fa-spinner fa-spin',
        style: 'color:#333;text-shadow:2px 2px #eee;font-size:32px;display:none;position:absolute;top:calc(50% - 16px);left:calc(50% - 16px);z-index:999',

        postCreate: function () {
            this.inherited(arguments);

            this.loading = put(this.map.root, 'i', {
                className: this.className,
                style: this.style
            });

            on(this.map, 'update-start', lang.hitch(this, 'showLoading'));
            on(this.map, 'update-end', lang.hitch(this, 'hideLoading'));
        },

        showLoading: function () {
            domStyle.set(this.loading, 'display', 'block');
            this.map.disableMapNavigation();
            this.map.hideZoomSlider();
        },

        hideLoading: function () {
            domStyle.set(this.loading, 'display', 'none');
            this.map.enableMapNavigation();
            this.map.showZoomSlider();
        }
    });
});