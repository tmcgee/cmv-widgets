define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang'
], function (
    declare,
    _WidgetBase,

    lang
) {

    // signup and get your track code and id at https://maptiks.com/
    return declare([_WidgetBase], {
        baseClass: 'maptiks-widget',

        maptiksTrackcode: null,
        maptiksID: null,

        postCreate: function () {
            this.inherited(arguments);

            require(['//cdn.maptiks.com/esri3/mapWrapper.js'], lang.hitch(this, function (mapWrapper) {
                var container = this.map.container;
                var maptiksMapOptions = {
                    'maptiks_trackcode': this.maptiksTrackcode,
                    'maptiks_id': this.maptiksId
                };
                mapWrapper(container, maptiksMapOptions, this.map);
            }));
        }
    });
});