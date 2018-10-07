define([
    'dojo/_base/declare',
    'dijit/_WidgetBase'
], function (
    declare,
    _WidgetBase
) {

    // signup and get your track code and id at https://maptiks.com/
    return declare([_WidgetBase], {
        baseClass: 'maptiks-widget',

        maptiksTrackcode: null,
        maptiksID: null,

        postCreate: function () {
            this.inherited(arguments);

            require(['//cdn.maptiks.com/esri3/mapWrapper.js'], (mapWrapper) => {
                var container = this.map.container;
                var maptiksMapOptions = {
                    'maptiks_trackcode': this.maptiksTrackcode,
                    'maptiks_id': this.maptiksId
                };
                mapWrapper(container, maptiksMapOptions, this.map);
            });
        }
    });
});