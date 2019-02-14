define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-style',
    'dojo/topic',

    'put-selector/put'

], function (
    declare,
    _WidgetBase,

    lang,
    on,
    domStyle,
    topic,

    put
) {

    return declare([_WidgetBase], {

        className: 'fa fa-spinner fa-spin',
        style: 'color:#333;text-shadow:2px 2px #eee;font-size:32px;display:none;position:absolute;top:calc(50% - 16px);left:calc(50% - 16px);z-index:999',
        text_style: 'color:#333;text-shadow:2px 2px #eee;font-size:32px;display:none;position:absolute;top:calc(50% - 16px);left:calc(50% + 20px);z-index:999',
        
        postCreate: function () {
            this.inherited(arguments);

            this.loading = put(this.map.root, 'i', {
                className: this.className,
                style: this.style
            });
            this.loadingText = put(this.map.root, 'i', {
                className: '',
                style: this.text_style,
                textContent: 'Loading'
            });            
            on(this.map, 'update-start', lang.hitch(this, 'showLoading'));
            on(this.map, 'update-end', lang.hitch(this, 'hideLoading'));

            topic.subscribe('showLoading/showLoading', lang.hitch(this, 'showLoading'));
            topic.subscribe('showLoading/hideLoading', lang.hitch(this, 'hideLoading'));
        },

        showLoading: function () {
            domStyle.set(this.loading, 'display', 'block');
            domStyle.set(this.loadingText, 'display', 'block');
            this.map.disableMapNavigation();
            this.map.hideZoomSlider();
        },

        hideLoading: function () {
            domStyle.set(this.loading, 'display', 'none');
            domStyle.set(this.loadingText, 'display', 'none');            
            this.map.enableMapNavigation();
            this.map.showZoomSlider();
        }
    });
});
