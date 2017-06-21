define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/dom-geometry',

    'esri/Color',
    'esri/geometry/Point',
    'esri/geometry/webMercatorUtils',
    'esri/SpatialReference',

    'esri/graphic',
    'esri/InfoTemplate',

    'esri/layers/GraphicsLayer',
    'esri/layers/VectorTileLayer',
    'esri/symbols/PictureMarkerSymbol',
    'esri/renderers/SimpleRenderer',

    'dijit/MenuItem',

    'proj4js/proj4',

    'dojo/text!./Mapillary/templates/Mapillary.html',
    'dojo/i18n!./Mapillary/nls/Mapillary',

    'https://unpkg.com/mapillary-js@2.5.2/dist/mapillary.min.js',
    'xstyle/css!https://unpkg.com/mapillary-js@2.5.2/dist/mapillary.min.css',

    'xstyle/css!./Mapillary/css/Mapillary.css',

    'dijit/form/ToggleButton',
    'dijit/form/CheckBox'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    topic,
    on,
    aspect,
    dom,
    domClass,
    domStyle,
    domGeom,

    Color,
    Point,
    webMercatorUtils,
    SpatialReference,

    Graphic,
    InfoTemplate,

    GraphicsLayer,
    VectorTileLayer,
    PictureMarkerSymbol,
    SimpleRenderer,

    MenuItem,
    proj4,

    template,
    i18n,

    Mapillary

) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        i18n: i18n,
        baseClass: 'cmvMapillaryWidget',

        mapClickMode: null,

        // in case this changes some day
        proj4BaseURL: 'https://epsg.io/',

        //  options are ESRI, EPSG and SR-ORG
        // See http://sepsg.io/ for more information
        proj4Catalog: 'EPSG',

        // if desired, you can load a projection file from your server
        // instead of using one from epsg.io
        // i.e., http://server/projections/102642.js
        proj4CustomURL: null,

        domID: 'mapillary-node',

        mapillaryOptions: {},
        defaultMapillaryOptions: {
            clientID: null,
            photoID: null,
            options: {
                baseImageSize: Mapillary.ImageSize.Size320,
                basePanoramaSize: Mapillary.ImageSize.Size1024,
                component: {
                    cache: false,
                    cover: false,
                    direction: true
                },
                maxImageSize: Mapillary.ImageSize.Size1024,
                renderMode: Mapillary.RenderMode.Letterbox
            }
        },

        layerOptions: {},
        defaultLayerOptions: {
            url: require.toUrl('./widgets/Mapillary/mapillary-style.json'),
            id: 'mapillary',
            opacity: 0.6,
            visible: false
        },

        visibleOnFirstOpen: true,

        startup: function () {
            this.inherited(arguments);

            this.mapillaryOptions = this.mixinDeep(this.defaultMapillaryOptions, this.mapillaryOptions);
            this.layerOptions = this.mixinDeep(this.defaultLayerOptions, this.layerOptions);

            this.createMapillary();

            this.createGraphicsLayer();
            this.createVectorLayer();

            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));

            this.map.on('click', lang.hitch(this, 'getMapillary'));

            if (this.parentWidget) {
                if (this.parentWidget.toggleable) {
                    if (this.parentWidget.get('open') && this.visibleOnFirstOpen) {
                        this.layer.setVisibility(true);
                    }
                    this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                        this.onLayoutChange(this.parentWidget.open);
                    })));
                }
                this.own(aspect.after(this.parentWidget, 'resize', lang.hitch(this, 'resize')));
                this.own(topic.subscribe(this.parentWidget.id + '/resize/resize', lang.hitch(this, 'resize')));
            }

            if (!window.proj4) {
                window.proj4 = proj4;
            }

            if (this.mapRightClickMenu) {
                this.addRightClickMenu();
            }

        },

        createMapillary: function () {
            this.mapillary = new Mapillary.Viewer(
                this.domID,
                this.mapillaryOptions.clientID,
                this.mapillaryOptions.photoID,
                this.mapillaryOptions.options
            );
            this.mapillary.on(Mapillary.Viewer.nodechanged, lang.hitch(this, 'onNodeChanged'));
            this.mapillary.on(Mapillary.Viewer.bearingchanged, lang.hitch(this, 'onBearingChanged'));
        },

        createVectorLayer: function () {
            this.layer = new VectorTileLayer(this.layerOptions.url, this.layerOptions);
            this.map.addLayer(this.layer);

            this.layer.on('visibility-change', lang.hitch(this, function () {
                this.checkLayerVisible.set('checked', this.layer.visible);
                this.visibleOnFirstOpen = false;
            }));

            this.checkLayerVisible.set('checked', this.layer.visible);
            on(this.checkLayerVisible, 'change', lang.hitch(this, function () {
                this.layer.setVisibility(this.checkLayerVisible.get('checked'));
            }));
        },

        createGraphicsLayer: function () {
            this.pointGraphics = new GraphicsLayer({
                id: 'mapillary_graphics',
                title: 'Mapillary'
            });
            this.pointSymbol = new PictureMarkerSymbol(require.toUrl('widgets/Mapillary/images/blueArrow.png'), 24, 24);
            this.pointRenderer = new SimpleRenderer(this.pointSymbol);
            this.pointRenderer.label = 'Mapillary';
            this.pointRenderer.description = 'Mapillary';
            this.pointGraphics.setRenderer(this.pointRenderer);
            this.map.addLayer(this.pointGraphics);
        },

        addRightClickMenu: function () {
            this.map.on('MouseDown', lang.hitch(this, function (evt) {
                this.mapRightClickPoint = evt.mapPoint;
            }));
            this.mapRightClickMenu.addChild(new MenuItem({
                label: this.i18n.rightClickMenuItem.label,
                onClick: lang.hitch(this, 'mapillaryFromMapRightClick')
            }));
        },

        resize: function (options) {
            if (options && options.h) {
                domGeom.setContentSize(this.containerNode, {
                    h: (options.h - 2)
                });
            }
            this.mapillary.resize();
        },

        getMapillary: function (evt, overRide) {
            if (this.mapClickMode === 'mapillary' || overRide) {
                var mapPoint = evt.mapPoint;
                if (!mapPoint) {
                    return;
                }

                if (this.parentWidget && !this.parentWidget.open) {
                    this.parentWidget.toggle();
                }

                this.disableMapClick();

                // convert the map point's coordinate system into lat/long
                var geometry = null,
                    wkid = mapPoint.spatialReference.wkid;
                if (wkid === 102100) {
                    wkid = 3857;
                }
                var key = this.proj4Catalog + ':' + String(wkid);
                if (!proj4.defs[key]) {
                    var url = this.proj4CustomURL || this.proj4BaseURL + String(wkid) + '.js';
                    require([url], lang.hitch(this, 'getMapillary', evt, true));
                    return;
                }
                // only need one projection as we are
                // converting to WGS84 lat/long
                var projPoint = proj4(proj4.defs[key]).inverse([mapPoint.x, mapPoint.y]);
                if (projPoint) {
                    geometry = {
                        x: projPoint[0],
                        y: projPoint[1]
                    };
                }

                domStyle.set(this.mapillaryInstructions, 'display', 'none');
                if (geometry) {
                    domStyle.set(this.noMapillaryResults, 'display', 'none');
                    domStyle.set(this.mapillaryNode, 'display', 'block');
                    this.getMapillaryLocation(geometry);
                } else {
                    this.clearGraphics();
                    domStyle.set(this.noMapillaryResults, 'display', 'block');
                    domStyle.set(this.mapillaryNode, 'display', 'none');
                }
            }
        },

        getMapillaryLocation: function (geometry) {
            var promise = this.mapillary.moveCloseTo(geometry.y, geometry.x);
            promise.catch(lang.hitch(this, function () {
                this.clearGraphics();
                domStyle.set(this.noMapillaryResults, 'display', 'block');
                domStyle.set(this.mapillaryNode, 'display', 'none');
            }));
        },

        mapillaryFromMapRightClick: function () {
            var evt = {
                mapPoint: this.mapRightClickPoint
            };
            this.getMapillary(evt, true);
        },

        onNodeChanged: function (node) {
            var lng = node.latLon.lon;
            var lat = node.latLon.lat;

            this.setPlaceMarkerPosition(lat, lng);
            this.mapillary.resize();
        },

        onBearingChanged: function (bearing) {
            if (this.placeMarker) {
                this.pointSymbol.setAngle(bearing);
                this.pointGraphics.refresh();
            }
        },

        onOpen: function () {
            this.pointGraphics.show();
            if (this.visibleOnFirstOpen) {
                this.layer.setVisibility(true);
            }
        },

        onClose: function () {
            // end mapillary on close of title pane
            this.pointGraphics.hide();
            this.layer.setVisibility(false);
            if (this.mapClickMode === 'mapillary') {
                this.connectMapClick();
            }
        },
        onLayoutChange: function (open) {
            if (open) {
                this.onOpen();
            } else {
                this.onClose();
            }
        },

        placePoint: function () {
            if (this.mapillaryButtonDijit.get('checked')) {
                this.enableMapClick();
            } else {
                this.disableMapClick();
            }
        },

        enableMapClick: function () {
            this.mapillaryButtonDijit.set('checked', true);
            this.map.setMapCursor('crosshair');
            this.layer.setVisibility(true);
            topic.publish('mapClickMode/setCurrent', 'mapillary');
        },

        disableMapClick: function () {
            this.mapillaryButtonDijit.set('checked', false);
            this.map.setMapCursor('auto');
            topic.publish('mapClickMode/setDefault');
        },

        clearGraphics: function () {
            this.pointGraphics.clear();
            domStyle.set(this.noMapillaryResults, 'display', 'block');
        },

        setPlaceMarkerPosition: function (lat, lng) {
            if (!this.placeMarker || this.pointGraphics.graphics.length === 0) {
                this.placeMarker = new Graphic();
                // Add graphic to the map
                this.pointGraphics.add(this.placeMarker);
            }
            // get the new lat/long from streetview
            // Make sure they are numbers
            if (!isNaN(lat) && !isNaN(lng)) {
                // convert the resulting lat/long to the map's spatial reference
                var xy = null,
                    wkid = this.map.spatialReference.wkid;
                if (wkid === 102100) {
                    wkid = 3857;
                }
                var key = this.proj4Catalog + ':' + String(wkid);
                if (!proj4.defs[key]) {
                    var url = this.proj4CustomURL || this.proj4BaseURL + String(wkid) + '.js';
                    require([url], lang.hitch(this, 'setPlaceMarkerPosition'));
                    return;
                }
                // only need the one projection as we are
                // converting from WGS84 lat/long
                xy = proj4(proj4.defs[key]).forward([lng, lat]);
                if (xy) {
                    var point = new Point(xy, new SpatialReference({
                        wkid: wkid
                    }));

                    // change point position on the map
                    this.placeMarker.setGeometry(point);
                }
            }
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
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