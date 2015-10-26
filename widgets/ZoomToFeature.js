/*eslint strict: 0 */
define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/keys',
    'dojo/store/Memory',
    'esri/tasks/QueryTask',
    'esri/tasks/query',
    'esri/layers/GraphicsLayer',
    'esri/graphic',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/graphicsUtils',
    'dojo/text!./ZoomToFeature/templates/ZoomToFeature.html',
    'dojo/i18n!./ZoomToFeature/nls/resources',
    'dijit/form/Form',
    'dijit/form/FilteringSelect',
    'xstyle/css!./ZoomToFeature/css/ZoomToFeature.css'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, lang, array, on, keys, Memory, QueryTask, Query, GraphicsLayer, Graphic, SimpleRenderer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, graphicsUtils, template, i18n) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        defaultI18n: i18n,
        i18n: {},
        baseClass: 'cmwZoomToFeatureWidget',

        // url of the MapServer to Query
        url: null,

        // description field for display in drop-down list
        field: null,

        // where clause to filter the results
        where: '1=1',

        // Spatial Reference. uses the map's spatial reference if none provided
        spatialReference: null,

        // Use 0.0001 for decimal degrees (wkid 4326)
        // or 500 for meters/feet
        pointExtentSize: null,

        // default symbology for found features
        defaultSymbols: {
            point: {
                type: 'esriSMS',
                style: 'esriSMSCircle',
                size: 25,
                color: [0, 255, 255, 32],
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: [0, 255, 255, 255],
                    width: 2
                }
            },
            polyline: {
                type: 'esriSLS',
                style: 'esriSLSSolid',
                color: [0, 255, 255, 255],
                width: 2
            },
            polygon: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: [0, 255, 255, 32],
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: [0, 255, 255, 255],
                    width: 2
                }
            }
        },

        features: null,
        featureStore: null,
        featureIdx: null,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.i18n = this.mixinDeep(this.defaultI18n, this.i18n);
        },
        postCreate: function () {
            this.inherited(arguments);

            if (!this.spatialReference) {
                this.spatialReference = this.map.spatialReference.wkid;
            }
            if (!this.pointExtentSize) {
                if (this.spatialReference === 4326) { // special case for geographic lat/lng
                    this.pointExtentSize = 0.0001;
                } else {
                    this.pointExtentSize = 250; // could be feet or meters
                }
            }

            this.createGraphicLayers();
            this.createGraphicRenderers();

            // allow pressing enter key to initiate the search
            this.own(on(this.featureSelectDijit, 'keyup', lang.hitch(this, function (evt) {
                if (evt.keyCode === keys.ENTER) {
                    this.search();
                }
            })));

            if (this.url) {
                this.getFeatures();
            }

        },

        createGraphicRenderers: function () {
            var pointSymbol = null,
                polylineSymbol = null,
                polygonSymbol = null,
                pointRenderer = null,
                polylineRenderer = null,
                polygonRenderer = null;

            var symbols = lang.mixin({}, this.symbols);
            // handle each property to preserve as much of the object heirarchy as possible
            symbols = {
                point: lang.mixin(this.defaultSymbols.point, symbols.point),
                polyline: lang.mixin(this.defaultSymbols.polyline, symbols.polyline),
                polygon: lang.mixin(this.defaultSymbols.polygon, symbols.polygon)
            };

            if (symbols.point && this.pointGraphics) {
                pointSymbol = new SimpleMarkerSymbol(symbols.point);
                pointRenderer = new SimpleRenderer(pointSymbol);
                pointRenderer.label = 'Search Results (Points)';
                pointRenderer.description = 'Search results (Points)';
                this.pointGraphics.setRenderer(pointRenderer);
            }

            if (symbols.polyline && this.polylineGraphics) {
                polylineSymbol = new SimpleLineSymbol(symbols.polyline);
                polylineRenderer = new SimpleRenderer(polylineSymbol);
                polylineRenderer.label = 'Search Results (Lines)';
                polylineRenderer.description = 'Search Results (Lines)';
                this.polylineGraphics.setRenderer(polylineRenderer);
            }

            if (symbols.polygon && this.polygonGraphics) {
                polygonSymbol = new SimpleFillSymbol(symbols.polygon);
                polygonRenderer = new SimpleRenderer(polygonSymbol);
                polygonRenderer.label = 'Search Results (Polygons)';
                polygonRenderer.description = 'Search Results (Polygons)';
                this.polygonGraphics.setRenderer(polygonRenderer);
            }
        },

        createGraphicLayers: function () {
            // points
            this.pointGraphics = new GraphicsLayer({
                id: this.id + '_Points',
                title: this.id + ' Points'
            });

            // polyline
            this.polylineGraphics = new GraphicsLayer({
                id: this.id + '_Lines',
                title: this.id + ' Lines'
            });

            // polygons
            this.polygonGraphics = new GraphicsLayer({
                id: this.id + '_Polygons',
                title: this.id + ' Polygons'
            });

            this.map.addLayer(this.polygonGraphics);
            this.map.addLayer(this.polylineGraphics);
            this.map.addLayer(this.pointGraphics);
        },

        getFeatures: function () {
            var query = new Query();
            query.outFields = [this.field];
            query.where = this.where;
            query.returnGeometry = true;
            //query.returnDistinctValues = true;
            query.outSpatialReference = {
                wkid: this.spatialReference
            };

            var queryTask = new QueryTask(this.url);
            queryTask.execute(query, lang.hitch(this, 'populateList'));
        },

        //Populate the dropdown list box with unique values
        populateList: function (results) {
            this.features = results.features;

            var values = [],
                k = 0,
                field = this.field;
            array.forEach(this.features, function (feature) {
                values.push({
                    id: k,
                    name: feature.attributes[field]
                });
                k++;
            });

            this.featureStore = new Memory({
                data: values
            });
            this.featureSelectDijit.set('store', this.featureStore);
            this.featureSelectDijit.set('disabled', false);
        },

        onFeatureChange: function (featureIdx) {
            if (featureIdx >= 0 && featureIdx < this.features.length) {
                this.featureIdx = featureIdx;
                this.search();
            }
        },

        search: function () {
            this.clearFeatures();

            if (this.featureIdx === null) {
                return;
            }
            var feature = this.features[this.featureIdx];
            if (feature) {
                this.highlightFeature(feature);
                var extent = this.getGraphicsExtent([feature]);
                if (extent) {
                    this.zoomToExtent(extent);
                }
            }
        },

        clearResults: function () {
            this.featureIdx = null;
            this.clearFeatures();
            this.clearButtonDijit.set('disabled', true);
            this.featureSelectDijit.reset();
        },

        clearFeatures: function () {
            this.pointGraphics.clear();
            this.polylineGraphics.clear();
            this.polygonGraphics.clear();
        },

        highlightFeature: function (feature) {
            var graphic;
            switch (feature.geometry.type) {
            case 'point':
                // only add points to the map that have an X/Y
                if (feature.geometry.x && feature.geometry.y) {
                    graphic = new Graphic(feature.geometry);
                    this.pointGraphics.add(graphic);
                    this.clearButtonDijit.set('disabled', false);
                }
                break;
            case 'polyline':
                // only add polylines to the map that have paths
                if (feature.geometry.paths && feature.geometry.paths.length > 0) {
                    graphic = new Graphic(feature.geometry);
                    this.polylineGraphics.add(graphic);
                    this.clearButtonDijit.set('disabled', false);
                }
                break;
            case 'polygon':
                // only add polygons to the map that have rings
                if (feature.geometry.rings && feature.geometry.rings.length > 0) {
                    graphic = new Graphic(feature.geometry, null, {
                        ren: 1
                    });
                    this.polygonGraphics.add(graphic);
                    this.clearButtonDijit.set('disabled', false);
                }
                break;
            default:
                break;
            }
        },

        zoomToExtent: function (extent) {
            this.map.setExtent(extent.expand(1.5));
        },
        getGraphicsExtent: function (graphics) {
            var extent;
            if (graphics && graphics.length > 0) {
                extent = graphicsUtils.graphicsExtent(graphics);
                if (extent.xmin === extent.xmax || extent.ymin === extent.ymax) {
                    extent = this.expandExtent(extent);
                }
            }
            return extent;
        },

        expandExtent: function (extent) {
            extent.xmin -= this.pointExtentSize;
            extent.ymin -= this.pointExtentSize;
            extent.xmax += this.pointExtentSize;
            extent.ymax += this.pointExtentSize;
            return extent;
        },

        mixinDeep: function (dest, source) {
            //Recursively mix the properties of two objects
            var empty = {};
            for (var name in source) {
                if (!(name in dest) || (dest[name] !== source[name] && (!(name in empty) || empty[name] !== source[name]))) {
                    try {
                        if (source[name].constructor === Object) {
                            dest[name] = this.mixinDeep(dest[name], source[name]);
                        } else {
                            dest[name] = source[name];
                        }
                    } catch (e) {
                        // Property in destination object not set. Create it and set its value.
                        dest[name] = source[name];
                    }
                }
            }
            return dest;
        }
    });
});