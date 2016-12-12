define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/_base/array',

    'esri/symbols/TextSymbol',
    'esri/layers/LabelClass'
], function (
    declare,
    _WidgetBase,

    lang,
    array,

    TextSymbol,
    LabelClass
) {
    return declare([_WidgetBase], {
        textSymbol: {
            type: 'esriTS',
            color: [33, 33, 33, 255],
            font: {
                size: 10,
                family: 'Arial',
                weight: 'bolder'
            }
        },

        // array of feature layers
        layers: [],

        postCreate: function () {
            this.inherited(arguments);
            array.forEach(this.layers, lang.hitch(this, function (layer) {
                var mapLayer = this.map.getLayer(layer.id);
                if (mapLayer) {
                    var label = new TextSymbol(layer.textSymbol || this.textSymbol);
                    var labelClass = new LabelClass({
                        'labelExpressionInfo': layer.labelExpressionInfo,
                        symbol: label
                    });
                    mapLayer.setLabelingInfo([labelClass]);
                }
            }));
        }
    });
});