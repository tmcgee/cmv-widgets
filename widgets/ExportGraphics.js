define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',

    'esri/graphic',
    'esri/tasks/FeatureSet',

    'dojo/text!./ExportGraphics/templates/ExportGraphics.html',
    'dojo/i18n!./ExportGraphics/nls/ExportGraphics',

    'xstyle/css!./ExportGraphics/css/ExportGraphics.css'


], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    array,
    topic,

    Graphic,
    FeatureSet,

    template,
    i18n

) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        i18n: i18n,
        baseClass: 'cmvExportGraphicsWidget',

        // array of layer IDs with graphics to export
        // default is layers for Draw widget and Advanced Draw widget
        layerIDs: [
            // Draw widget
            'drawGraphics_point',
            'drawGraphics_line',
            'drawGraphics_poly',

            // Advanced Draw widget
            'advanced_draw_text',
            'advanced_draw_point',
            'advanced_draw_polyline',
            'advanced_draw_polygon'
        ],

        includeMapGraphics: false,

        exportOptions: {},

        exportGraphics: function () {
            var featureSet = new FeatureSet();
            featureSet.features = [];

            var layerIDs = this.layerIDs || [];
            if (layerIDs.length < 1) {
                layerIDs = this.map.graphicLayerIds; // export all layers if we don't explicitly provide them
            }

            array.forEach(layerIDs, lang.hitch(this, function (id) {
                var layer = this.map.getLayer(id);
                if (layer) {
                    array.forEach(layer.graphics, lang.hitch(this, function (graphic) {
                        if (graphic.geometry && graphic.geometry.type) {
                            var newGraphic = this._createFeatureFromGraphic(graphic);
                            featureSet.features.push(newGraphic);
                        }
                    }));
                }
            }));

            if (this.includeMapGraphics) {
                array.forEach(this.map.graphics, lang.hitch(this, function (graphic) {
                    if (graphic.geometry && graphic.geometry.type) {
                        var newGraphic = this._createFeatureFromGraphic(graphic);
                        featureSet.features.push(newGraphic);
                    }
                }));
            }

            if (featureSet.features.length > 0) {
                var exportOpts = this.exportOptions || {};
                exportOpts.featureSet = featureSet;
                exportOpts.show = true; // must be true
                topic.publish('exportWidget/openDialog', exportOpts);
            } else {
                topic.publish('growler/growl', this.i18n.noGraphicsMessage);
            }
        },

        _createFeatureFromGraphic: function (graphic) {
            var attr = lang.clone(graphic.attributes || {});

            // add the Text from a symbol
            if (graphic.symbol && graphic.symbol.text) {
                attr.text = graphic.symbol.text;
            }

            return new Graphic(graphic.geometry, graphic.symbol, attr);
        }
    });
});