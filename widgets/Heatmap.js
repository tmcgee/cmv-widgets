/*
    Inspired by this WAB widget:
    https://github.com/AdriSolid/WAB-Custom-Widgets#heat-map-wab-27-fire-live-demo
*/
define([
    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/dom-style',
    'dojo/store/Memory',

    'esri/graphic',
    'esri/layers/FeatureLayer',
    'esri/renderers/HeatmapRenderer',
    'esri/toolbars/draw',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/Color',

    'dojo/text!./Heatmap/templates/Heatmap.html',
    'dojo/i18n!./Heatmap/nls/Heatmap',

    'dijit/form/FilteringSelect',
    'dijit/form/Button',
    'dijit/form/HorizontalSlider',
    'dijit/form/CheckBox',
    'gis/dijit/FloatingTitlePane',
    'esri/dijit/HeatmapSlider',

    'xstyle/css!./Heatmap/css/Draw.css',
    'xstyle/css!./Heatmap/css/Heatmap.css'

], function (
    declare,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    array,
    topic,
    domStyle,
    Memory,

    Graphic,
    FeatureLayer,
    HeatmapRenderer,
    Draw,
    Query,
    QueryTask,
    SimpleFillSymbol,
    SimpleLineSymbol,
    Color,

    template,
    i18n
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        i18n: i18n,
        baseClass: 'cmvHeatmapWidget',

        topicID: 'heatmap',

        layers: [],
        addToLayerControl: true,
        geometryType: 'point', // 'point', 'line', 'polygon' or '*'

        drawingOptions: {
            rectangle: true,
            circle: true,
            ellipse: false,
            polygon: true,
            freehandPolygon: true,
            stopDrawing: true
        },

        blurRadius: 10,
        maxValue: 100,
        minValue: 1,
        colorStops: [
            {
                'ratio': 0,
                'color': {'r': 133, 'g': 193, 'b': 200, 'a': 0}
            }, {
                'ratio': 0.01,
                'color': {'r': 133, 'g': 193, 'b': 200, 'a': 0}
            }, {
                'ratio': 0.01,
                'color': {'r': 133, 'g': 193, 'b': 200, 'a': 0.7}
            }, {
                'ratio': 0.01,
                'color': {'r': 133, 'g': 193, 'b': 200, 'a': 0.7}
            }, {
                'ratio': 0.0925,
                'color': {'r': 144, 'g': 161, 'b': 190, 'a': 0.7}
            }, {
                'ratio': 0.175,
                'color': {'r': 156, 'g': 129, 'b': 132, 'a': 0.7}
            }, {
                'ratio': 0.2575,
                'color': {'r': 167, 'g': 97, 'b': 170, 'a': 0.7}
            }, {
                'ratio': 0.34,
                'color': {'r': 175, 'g': 73, 'b': 128, 'a': 0.7}
            }, {
                'ratio': 0.4225,
                'color': {'r': 184, 'g': 48, 'b': 85, 'a': 0.7}
            }, {
                'ratio': 0.505,
                'color': {'r': 192, 'g': 24, 'b': 42, 'a': 0.7}
            }, {
                'ratio': 0.5875,
                'color': {'r': 200, 'g': 0, 'b': 0, 'a': 0.7}
            }, {
                'ratio': 0.67,
                'color': {'r': 211, 'g': 51, 'b': 0, 'a': 0.7}
            }, {
                'ratio': 0.7525,
                'color': {'r': 222, 'g': 102, 'b': 0, 'a': 0.7}
            }, {
                'ratio': 0.835,
                'color': {'r': 233, 'g': 153, 'b': 0, 'a': 0.7}
            }, {
                'ratio': 0.9175,
                'color': {'r': 244, 'g': 204, 'b': 0, 'a': 0.7}
            }, {
                'ratio': 1,
                'color': {'r': 255, 'g': 255, 'b': 0, 'a': 0.7}
            }
        ],

        layerInfo: null,
        heatmapFeatureLayer: null,
        heatmapRenderer: null,
        heatmapLayers: [],
        mapClickMode: null,
        drawingGeometry: null,

        postCreate: function () {
            this.inherited(arguments);

            this.addTopics();
            this.initLayerSelect();
            this.initSliders();
            this.initDrawingTools();
        },

        addTopics: function () {
            this.own(topic.subscribe('heatmap/addLayer', lang.hitch(this, 'addHeatmapLayer')));
            this.own(topic.subscribe('heatmap/removeLayer', lang.hitch(this, 'removeHeatmapLayer')));
            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
        },

        initLayerSelect: function () {
            var data = [],
                type = this.geometryType;

            var layerInfos = this.getLayerInfos();
            array.forEach(layerInfos, lang.hitch(this, function (layerInfo) {
                var layer = layerInfo.layer;

                switch (true) {
                case (type === '*'):
                case (type === 'polygon' && layer.geometryType === 'esriGeometryPolygon'):
                case (type === 'point' && layer.geometryType === 'esriGeometryPoint'):
                case (type === 'line' && layer.geometryType === 'esriGeometryLine'):
                case (type === 'line' && layer.geometryType === 'esriGeometryPolyLine'):
                case (type === 'multiPatch' && layer.geometryType === 'esriGeometryMultiPatch'):
                    data.push({
                        id: layerInfo.id,
                        name: layerInfo.title
                    });
                    break;
                default:
                }
            }));

            this.layerStore = new Memory({
                data: data
            });
            this.layerSelect.set('store', this.layerStore);

            if (data.length > 0) {
                this.layerSelect.set('value', data[0].id);
                this.layerSelect.set('disabled', false);
                this.layerSelect.set('readOnly', (data.length === 1));
            }
        },

        initSliders: function () {
            this.blurRadiusSliderDijit.set('value', this.blurRadius);
            this.maxValueSliderDijit.set('value', this.maxValue);
            this.minValueSliderDijit.set('value', this.minValue);
            this.heatmapSliderDijit.set('colorStops', this.colorStops);
            this.heatmapSliderDijit.on('handle-value-change', lang.hitch(this, 'onChangeHeatmapStops'));
        },

        getLayerInfos: function () {
            var layerInfos = [],
                layerIDs = [];

            // get layers pre-defined in configuration
            array.forEach(this.layers, lang.hitch(this, function (layer) {
                layerIDs.push(layer.id);
            }));

            // Not pre-defined, so get any graphic layers in layerControlLayerInfos, if included
            if (layerIDs.length === 0) {
                array.forEach(this.layerInfos, lang.hitch(this, function (layerInfo) {
                    if (this.map.graphicsLayerIds.includes(layerInfo.layer.id)) {
                        layerIDs.unshift(layerInfo.layer.id); // reverse the order
                    }
                }));
            }

            // Still nothing, so get the layers from the map
            if (layerIDs.length === 0) {
                layerIDs = this.map.graphicsLayerIds;
            }

            array.forEach(layerIDs, lang.hitch(this, function (layerID) {
                var layer = this.map.getLayer(layerID);
                if (layer) {
                    layerInfos.push({
                        id: layerID,
                        title: this.getLayerTitle(layerID, layer.name),
                        layer: layer
                    });
                }
            }));

            this.heatmapLayerInfos = layerInfos;
            return layerInfos;
        },

        getLayerInfo: function (layerID) {
            this.layerInfo = null;
            array.forEach(this.heatmapLayerInfos, lang.hitch(this, function (layerInfo) {
                if (layerInfo.id === layerID) {
                    this.layerInfo = layerInfo;
                }
            }));
            var url = this.getLayerURL();
            if (url) {
                this.enableDrawingButtons();
            } else {
                this.cancelDrawing();
                this.disableDrawingButtons();
            }

            return this.layerInfo;
        },

        getLayerTitle: function (layerID, name) {
            var layerTitle = null;
            array.forEach(this.layers, function (layer) {
                if (layer.layer.id === layerID) {
                    layerTitle = layer.title;
                }
            });

            if (!layerTitle) {
                array.forEach(this.layerInfos, function (layer) {
                    if (layer.layer.id === layerID) {
                        layerTitle = layer.title;
                    }
                });
            }

            return layerTitle || name;
        },

        getLayerURL: function () {
            return (this.layerInfo && this.layerInfo.layer) ? this.layerInfo.layer.url : null;
        },

        getFieldStore: function () {
            if (!this.layerInfo) {
                return null;
            }

            var layerID = this.layerInfo.layer.id,
                fields = this.layerInfo.layer.fields,
                data = [],
                validTypes = [
                    'esriFieldTypeDouble',
                    'esriFieldTypeInteger',
                    'esriFieldTypeSingle"',
                    'esriFieldTypeSmallInteger'
                ];

                // is it a pre-defined layer?
            var layers = array.filter(this.layers, function (layer) {
                return (layer.id === layerID);
            });

            // yes, so use the pre-defined fields, if they exist
            if (layers.length > 0) {
                var fieldNames = layers[0].fields;
                if (fieldNames) {
                    array.forEach(fields, function (field) {
                        if (fieldNames.includes(field.name) && validTypes.includes(field.type)) {
                            data.push({
                                id: field.name,
                                name: field.alias || field.name
                            });
                        }
                    });
                }
            }

            if (data.length === 0) {
                array.forEach(fields, function (field) {
                    if (validTypes.includes(field.type)) {
                        data.push({
                            id: field.name,
                            name: field.alias || field.name
                        });
                    }
                });
            }

            return new Memory({
                data: data
            });

        },

        getFieldOptions: function () {
            this.fieldSelect.set('options', []);
            this.fieldSelect.set('disabled', true);

            if (this.layerInfo) {
                var fieldStore = this.getFieldStore();

                this.fieldSelect.set('store', fieldStore);

                if (fieldStore) {
                    var data = fieldStore.data;
                    if (data.length > 0) {
                        this.fieldSelect.set('value', data[0].id);
                        this.fieldSelect.set('disabled', false);
                        this.fieldSelect.set('readOnly', (data.length === 1));
                    }
                }

            }
        },

        displayHeatMapLayer: function (features) {
            var field = this.fieldSelect.get('value'),
                layer = this.layerInfo.layer;

            var featureCollection = {
                layerDefinition: {
                    geometryType: layer.geometryType,
                    objectIdField: layer.objectIdField,
                    fields: [field]
                },
                featureSet: {
                    features: features,
                    geometryType: layer.geometryType
                }
            };

            var heatmapFeatureLayerOptions = {
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields: [field]
            };

            this.heatmapFeatureLayer = new FeatureLayer(featureCollection, heatmapFeatureLayerOptions);
            this.heatmapRenderer = new HeatmapRenderer({
                field: field,
                blurRadius: this.blurRadius,
                maxPixelIntensity: this.maxValue,
                minPixelIntensity: this.minValue,
                colorStops: this.heatmapSliderDijit.get('colorStops')
            });

            this.heatmapFeatureLayer.setRenderer(this.heatmapRenderer);
            this.map.addLayer(this.heatmapFeatureLayer);
            if (this.addToLayerControl) {
                this.addLayerToLayerControl();
            }
            this.heatmapLayers.push(this.heatmapFeatureLayer);
            this.clearLayersButtonDijit.set('disabled', false);
        },

        clearLayers: function () {
            this.cancelDrawing();
            if (this.addToLayerControl) {
                this.removeLayersFromLayerControl();
            }
            array.forEach(this.heatmapLayers, lang.hitch(this, function (layer) {
                this.map.removeLayer(layer);
            }));
            this.heatmapLayers = [];
            this.clearLayersButtonDijit.set('disabled', true);
        },

        addLayerToLayerControl: function () {
            var layerControlInfo = {
                controlOptions: {
                    expanded: false,
                    noLegend: true,
                    metadataUrl: false,
                    swipe: false
                },
                layer: this.heatmapFeatureLayer,
                title: 'Heatmap ' + (this.heatmapLayers.length + 1),
                type: 'feature'
            };
            topic.publish('layerControl/addLayerControls', [layerControlInfo]);
        },

        removeLayersFromLayerControl: function () {
            topic.publish('layerControl/removeLayerControls', this.heatmapLayers);
        },

        addGraphic: function (geometry) {
            this.cancelDrawing();
            this.connectMapClick();
            var symbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([200, 0, 0]), 2),
                new Color([0, 0, 0, 0.2])
            );
            var graphic = new Graphic(geometry, symbol);
            this.map.graphics.add(graphic);
            this.drawingGeometry = geometry;
            this.stopDrawingButtonDijit.set('disabled', false);
        },

        onChangeLayerSelect: function (layerID) {
            this.getLayerInfo(layerID);
            this.getFieldOptions();
        },

        onCreateHeatmap: function () {
            var graphics = [],
                geometry = null;

            if (this.drawingGeometry) {
                geometry = this.drawingGeometry;
            } else {
                geometry = this.map.extent;
            }

            var url = this.getLayerURL();
            if (url) {
                var q = new Query();
                q.where = '1=1';
                q.returnGeometry = true;
                q.geometry = geometry;
                q.outFields = ['*'];

                var qt = new QueryTask(url);
                qt.execute(q, lang.hitch(this, function (results) {
                    array.forEach(results.features, function (graphic) {
                        graphics.push(new Graphic({
                            geometry: graphic.geometry,
                            attributes: graphic.attributes
                        }));
                    });
                    this.displayHeatMapLayer(graphics);
                }));
            } else {
                array.forEach(this.layer.graphics, function (graphic) {
                    graphics.push(new Graphic({
                        geometry: graphic.geometry,
                        attributes: graphic.attributes
                    }));
                });
                this.displayHeatMapLayer(graphics);
            }
        },

        onClearLayers: function () {
            if (this.heatmapLayers.length > 0) {
                var mb = window.MessageBox;
                if (mb) {
                    mb.confirm(this.i18n.Messages.confirm).then(
                        lang.hitch(this, function (result) {
                            if (result === mb.okMessage) {
                                this.clearLayers();
                            }
                        })
                    );
                } else {
                    this.clearLayers();
                }
            }
        },

        onChangeBlurRadius: function () {
            var value = this.blurRadiusSliderDijit.get('value');
            this.blurRadius = value;
            this.blurRadiusDom.innerHTML = value.toFixed(0);
            if (this.heatmapRenderer) {
                if (value !== this.heatmapRenderer.blurRadius) {
                    this.heatmapRenderer.setBlurRadius(value);
                    if (this.heatmapFeatureLayer) {
                        this.heatmapFeatureLayer.redraw();
                    }
                }
            }
        },

        onChangeMaxValue: function () {
            var value = this.maxValueSliderDijit.get('value');
            this.maxValue = value;
            this.maxValueDom.innerHTML = value.toFixed(0);
            if (this.heatmapRenderer) {
                if (value !== this.heatmapRenderer.maxPixelIntensity) {
                    this.heatmapRenderer.setMaxPixelIntensity(value);
                    if (this.heatmapFeatureLayer) {
                        this.heatmapFeatureLayer.redraw();
                    }
                }
            }
        },

        onChangeMinValue: function () {
            var value = this.minValueSliderDijit.get('value');
            this.minValue = value;
            this.minValueDom.innerHTML = value.toFixed(0);
            if (this.heatmapRenderer) {
                if (value !== this.heatmapRenderer.minPixelIntensity) {
                    this.heatmapRenderer.setMinPixelIntensity(value);
                    if (this.heatmapFeatureLayer) {
                        this.heatmapFeatureLayer.redraw();
                    }
                }
            }
        },

        onChangeHeatmapStops: function () {
            var colorStops = this.heatmapSliderDijit.get('colorStops');
            if (this.heatmapRenderer) {
                this.heatmapRenderer.setColorStops(colorStops);
                if (this.heatmapFeatureLayer) {
                    this.heatmapFeatureLayer.redraw();
                }
            }
        },

        disconnectMapClick: function () {
            topic.publish('mapClickMode/setCurrent', this.topicID);
        },

        connectMapClick: function () {
            topic.publish('mapClickMode/setDefault');
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
            if (mode !== this.topicID) {
                this.cancelDrawing();
            }
        },

        // subscribed topics
        addHeatmapLayer: function (/*options*/) {

        },

        removeHeatmapLayer: function (/*options*/) {

        },

        /*******************************
        *  Drawing Functions
        *******************************/

        initDrawingTools: function () {
            this.drawingButtons = [
                this.rectangleButtonDijit,
                this.circleButtonDijit,
                this.ellipseButtonDijit,
                this.polygonButtonDijit,
                this.freehandPolygonButtonDijit
            ];

            this.drawToolbar = new Draw(this.map);
            this.drawToolbar.on('draw-end', lang.hitch(this, function (evtObj) {
                this.drawToolbar.deactivate();
                if (this.mapClickMode === 'heatmap') {
                    this.addGraphic(evtObj.geometry);
                }
            }));

            this.enableDrawingButtons();
        },

        enableDrawingButtons: function () {
            var opts = this.drawingOptions;
            var disp = (opts.rectangle !== false) ? 'inline-block' : 'none';
            domStyle.set(this.rectangleButtonDijit.domNode, 'display', disp);
            disp = (opts.circle !== false) ? 'inline-block' : 'none';
            domStyle.set(this.circleButtonDijit.domNode, 'display', disp);
            disp = (opts.ellipse !== false) ? 'inline-block' : 'none';
            domStyle.set(this.ellipseButtonDijit.domNode, 'display', disp);
            disp = (opts.polygon !== false) ? 'inline-block' : 'none';
            domStyle.set(this.polygonButtonDijit.domNode, 'display', disp);
            disp = (opts.freehandPolygon !== false) ? 'inline-block' : 'none';
            domStyle.set(this.freehandPolygonButtonDijit.domNode, 'display', disp);
            disp = (opts.stopDrawing !== false) ? 'inline-block' : 'none';
            domStyle.set(this.stopDrawingButtonDijit.domNode, 'display', disp);

            array.forEach(this.drawingButtons, function (button) {
                button.set('disabled', false);
            });
        },

        disableDrawingButtons: function () {
            array.forEach(this.drawingButtons, function (button) {
                button.set('disabled', true);
            });
        },

        prepareForDrawing: function (btn) {
            // is btn checked?
            var chk = btn.get('checked');
            this.cancelDrawing();
            if (chk) {
                // toggle btn to checked state
                btn.set('checked', true);
                this.stopDrawingButtonDijit.set('disabled', false);
            }
            return chk;
        },

        onDrawRectangle: function () {
            var btn = this.rectangleButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.EXTENT);
            }
        },

        onDrawCircle: function () {
            var btn = this.circleButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.CIRCLE);
            }
        },

        onDrawEllipse: function () {
            var btn = this.ellipseButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.ELLIPSE);
            }
        },

        onDrawPolygon: function () {
            var btn = this.polygonButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.POLYGON);
            }
        },

        onDrawFreehandPolygon: function () {
            var btn = this.freehandPolygonButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.FREEHAND_POLYGON);
            }
        },

        onStopDrawing: function () {
            this.cancelDrawing();
            this.connectMapClick();
        },

        uncheckDrawingTools: function () {
            this.rectangleButtonDijit.set('checked', false);
            this.circleButtonDijit.set('checked', false);
            this.ellipseButtonDijit.set('checked', false);
            this.polygonButtonDijit.set('checked', false);
            this.freehandPolygonButtonDijit.set('checked', false);
            this.stopDrawingButtonDijit.set('disabled', true);
        },

        cancelDrawing: function () {
            this.disconnectMapClick();
            this.uncheckDrawingTools();
            this.drawToolbar.deactivate();
            this.map.graphics.clear();
            this.drawingGeometry = null;
            this.stopDrawingButtonDijit.set('disabled', true);
        }

    });
});