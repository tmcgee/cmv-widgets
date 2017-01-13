define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/topic',

    'esri/layers/WebTiledLayer'
], function (
    declare,
    _WidgetBase,

    lang,
    topic,

    WebTiledLayer
) {
    return declare([_WidgetBase], {
        url: 'https://maps.googleapis.com/maps/vt?lyrs=svv&apiv3&style=40,18&gl=US&&x={col}&y={row}&z={level}',

        options: {
            id: 'streetViewAvailability',
            title: ' StreetView Availability',
            copyright: 'Google',
            opacity: 1,
            minScale: 500000,
            visible: false
        },

        postCreate: function () {
            this.inherited(arguments);
            this.svLayer = new WebTiledLayer(this.url, this.options);
            this.map.addLayer(this.svLayer);
            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'checkMapClickMode')));
        },

        checkMapClickMode: function (mode) {
            if (this.svLayer) {
                this.svLayer.setVisibility(mode === 'streetview' || mode === 'externalmap');
            }
        }
    });
});