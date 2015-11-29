/*eslint strict: 0 */
define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-style',
    'dojo/aspect',
    'dojo/topic',
    'dojo/keys',

    'esri/toolbars/draw',
    'esri/tasks/query',
    'esri/tasks/GeometryService',
    'esri/geometry/geometryEngine',

    'esri/layers/GraphicsLayer',
    'esri/graphic',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol',

    // template
    'dojo/text!./Search/templates/Search.html',

    //i18n
    'dojo/i18n!./Search/nls/Search',

    //template widgets
    'dijit/layout/LayoutContainer',
    'dijit/layout/ContentPane',
    'dijit/layout/TabContainer',
    'dijit/form/Select',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Button',
    'dijit/form/CheckBox',

    // css
    'xstyle/css!./Search/css/Search.css',
    'xstyle/css!./Search/css/Draw.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    on,
    domStyle,
    aspect,
    topic,
    keys,

    Draw,
    Query,
    GeometryService,
    geometryEngine,
    GraphicsLayer,
    Graphic,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,

    template,

    i18n
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        name: 'Search',
        baseClass: 'cmvSearchWidget',
        widgetsInTemplate: true,
        templateString: template,
        mapClickMode: null,

        // i18n
        i18n: i18n,

        title: 'Search Results',
        topicID: 'searchResults',
        attributesContainerID: 'attributesContainer',
        queryBuilderTopicID: 'queryBuilderWidget',

        shapeLayer: 0,
        attributeLayer: 0,
        drawToolbar: null,

        // to override the default tab when the widget starts
        defaultTab: 0,

        /*
            To hide specific tabs.
            This is an zero-based array so [1] would hide the second tab.
            It is an array to anticipate more than 2 tabs in a future release.
        */
        hiddenTabs: [],

        // collects the geometry from multiple shapes for use in the search
        spatialGeometry: null,

        // the current tab/table of search results
        selectedTable: null,

        /*
            Search capabilities that can be enabled/disabled
            individually in the configuration file.
        */
        enableQueryBuilder: false, //Query Builder widget not yet released
        enableDrawMultipleShapes: true,
        enableAddToExistingResults: true,
        enableSpatialFilters: true,

        // configure which spatial filters are available
        spatialFilters: {
            entireMap: true,
            currentExtent: true,
            identifiedFeature: true,
            searchFeatures: true,
            searchSelected: true,
            searchSource: true,
            searchBuffer: true
        },

        drawingOptions: {
            rectangle: true,
            circle: true,
            point: true,
            polyline: true,
            freehandPolyline: true,
            polygon: true,
            freehandPolygon: true,
            stopDrawing: true,
            identifiedFeature: true,
            selectedFeatures: true,

            symbols: {}
        },

        // symbology for drawn shapes
        defaultSymbols: {
            point: {
                type: 'esriSMS',
                style: 'esriSMSCircle',
                size: 6,
                color: [0, 0, 0, 64],
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: [255, 0, 0],
                    width: 2
                }
            },
            polyline: {
                type: 'esriSLS',
                style: 'esriSLSSolid',
                color: [255, 0, 0],
                width: 2
            },
            polygon: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: [0, 0, 0, 64],
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: [255, 0, 0],
                    width: 1
                }
            },

            // symbology for buffer around shapes
            buffer: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: [255, 0, 0, 32],
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSDash',
                    color: [255, 0, 0, 255],
                    width: 1
                }
            }
        },

        bufferUnits: [
            {
                value: GeometryService.UNIT_FOOT,
                label: 'Feet',
                selected: true
            },
            {
                value: GeometryService.UNIT_STATUTE_MILE,
                label: 'Miles'
            },
            {
                value: GeometryService.UNIT_METER,
                label: 'Meters'
            },
            {
                value: GeometryService.UNIT_KILOMETER,
                label: 'Kilometers'
            },
            {
                value: GeometryService.UNIT_NAUTICAL_MILE,
                label: 'Nautical Miles'
            },
            {
                value: GeometryService.UNIT_US_NAUTICAL_MILE,
                label: 'US Nautical Miles'
            }
        ],


        postCreate: function () {
            this.inherited(arguments);
            this.initAdvancedFeatures();
            this.initLayerSelect();
            this.initSpatialFilters();
            this.selectBufferUnits.set('options', this.bufferUnits);
            this.drawToolbar = new Draw(this.map);
            this.enableDrawingButtons();
            this.addGraphicsLayer();

            this.tabContainer.watch('selectedChildWidget', lang.hitch(this, function () {
                this.cancelDrawing();
            }));

            if (this.map.infoWindow) {
                on(this.map.infoWindow, 'show', lang.hitch(this, 'enableIdentifyButton'));
                on(this.map.infoWindow, 'hide', lang.hitch(this, 'disableIdentifyButton'));
            }
            this.own(on(this.drawToolbar, 'draw-end', lang.hitch(this, 'endDrawing')));

            for (var k = 0; k < 5; k++) {
                this.own(on(this['inputSearchTerm' + k], 'keyup', lang.hitch(this, 'executeSearchWithReturn')));
            }
            this.addTopics();
        },

        startup: function () {
            this.inherited(arguments);
            var parent = this.getParent();
            if (parent) {
                this.own(on(parent, 'show', lang.hitch(this, function () {
                    this.tabContainer.resize();
                })));
            }
            aspect.after(this, 'resize', lang.hitch(this, function () {
                this.tabContainer.resize();
            }));

            this.tabChildren = this.tabContainer.getChildren();
            if (this.defaultTab !== null) {
                var defTab = this.tabChildren[this.defaultTab];
                if (defTab) {
                    this.tabContainer.selectChild(defTab);
                }
            }

            var k = 0, len = this.hiddenTabs.length;
            for (k = 0; k < len; k++) {
                var tab = this.tabChildren[this.hiddenTabs[k]];
                domStyle.set(tab.domNode, 'display', 'none');
                domStyle.set(tab.controlButton.domNode, 'display', 'none');
            }
        },

        addTopics: function () {
            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
            this.own(topic.subscribe(this.topicID + '/search', lang.hitch(this, 'executeSearch')));
            this.own(topic.subscribe(this.attributesContainerID + '/tableUpdated', lang.hitch(this, 'setSearchTable')));

            // used with QueryBuilder widget
            this.own(topic.subscribe(this.topicID + '/setSQLWhereClause', lang.hitch(this, 'setSQLWhereClause')));
            this.own(topic.subscribe(this.topicID + '/clearSQLWhereClause', lang.hitch(this, 'clearSQLWhereClause')));
        },

        /*******************************
        *  Search Functions
        *******************************/

        executeSearchWithReturn: function (evt) {
            if (evt.keyCode === keys.ENTER) {
                this.doAttributeSearch();
            }
        },

        search: function (geometry, layerIndex) {
            if (!this.layers) {
                return;
            }
            if (this.layers.length === 0) {
                return;
            }

            var layer = this.layers[layerIndex];
            var search = layer.attributeSearches[this.searchIndex] || {};
            var searchOptions = {
                title: search.title || layer.title || this.title,
                topicID: search.topicID || layer.topicID || this.topicID,
                findOptions: null,
                queryOptions: null,
                gridOptions: lang.clone(search.gridOptions || layer.gridOptions || {}),
                featureOptions: lang.clone(search.featureOptions || layer.featureOptions || {}),
                symbolOptions: lang.clone(search.symbolOptions || layer.symbolOptions || {}),
                toolbarOptions: lang.clone(search.toolbarOptions || layer.toolbarOptions || {}),
                infoTemplate: search.infoTemplate || layer.infoTemplate
            };

            if (layer.findOptions) { // It is a FindTask
                searchOptions.findOptions = this.buildFindOptions(layer, search);
            } else {
                searchOptions.queryOptions = this.buildQueryOptions(layer, search, geometry);
            }

            this.hideInfoWindow();

            // publish to an accompanying attributed table
            if (searchOptions.findOptions || searchOptions.queryOptions) {
                topic.publish(this.attributesContainerID + '/addTable', searchOptions);
            }

        },

        buildQueryOptions: function (layer, search, geometry) {
            var where, distance, unit, showOnly = false, addToExisting = false;
            var queryOptions = {
                idProperty: search.idProperty || layer.idProperty || 'FID',
                linkField: search.linkField || layer.linkField || null,
                linkedQuery: lang.clone(search.linkedQuery || layer.linkedQuery || null)
            };

            if (geometry) {
                distance = this.inputBufferDistance.get('value');
                if (isNaN(distance)) {
                    topic.publish('growler/growl', {
                        title: 'Search',
                        message: 'Invalid distance',
                        level: 'error',
                        timeout: 3000
                    });
                    return null;
                }
                unit = this.selectBufferUnits.get('value');
                showOnly = this.checkBufferOnly.get('checked');
                addToExisting = this.checkSpatialAddToExisting.get('checked');

            } else {
                where = this.buildWhereClause(layer, search);
                if (where === null) {
                    return null;
                }
                geometry = this.getSpatialFilterGeometry();
                addToExisting = this.checkAttributeAddToExisting.get('checked');
            }

            var queryParameters = lang.clone(search.queryParameters || layer.queryParameters || {});
            queryOptions.queryParameters = lang.mixin(queryParameters, {
                //type: search.type || layer.type || 'spatial',
                geometry: geometry,
                where: where,
                addToExisting: addToExisting,
                outSpatialReference: search.outSpatialReference || this.map.spatialReference,
                spatialRelationship: search.spatialRelationship || layer.spatialRelationship || Query.SPATIAL_REL_INTERSECTS
            });

            var bufferParameters = lang.clone(search.bufferParameters || layer.bufferParameters || {});
            queryOptions.bufferParameters = lang.mixin(bufferParameters, {
                distance: distance,
                unit: unit,
                showOnly: showOnly
            });

            return queryOptions;

        },

        buildFindOptions: function (layer, search) {
            var searchTerm = null;
            if (search.searchFields.length > 0) {
                searchTerm = this.getSearchTerm(0, search.searchFields[0]);
                if (searchTerm === null) {
                    return null;
                }
            }
            return lang.mixin(layer.findOptions, {
                searchText: searchTerm,
                contains: !this.containsSearchText.checked,
                outSpatialReference: search.outSpatialReference || this.map.spatialReference
            });
        },

        buildWhereClause: function (layer, search) {
            var where = layer.expression || '';
            var fields = search.searchFields;
            var searchTerm = null;

            var len = fields.length;
            for (var k = 0; k < len; k++) {
                var field = fields[k];
                searchTerm = this.getSearchTerm(k, field);
                if (searchTerm === null) {
                    return null;
                } else if (searchTerm.length > 0 && field.expression) {
                    var attrWhere = field.expression;
                    attrWhere = attrWhere.replace(/\[value\]/g, searchTerm);
                    if (!attrWhere) {
                        break;
                    }
                    if (where !== '') {
                        where += ' AND ';
                    }
                    where += attrWhere;
                }
            }
            return where;
        },

        getSpatialFilterGeometry: function () {
            var geometry = null, type = this.selectAttributeSpatialFilter.get('value');

            switch (type) {
            case 'entireMap':
                break;
            case 'currentExtent':
                geometry = this.map.extent;
                break;
            case 'identifiedFeatures':
                geometry = this.getGeometryFromIdentifiedFeature();
                break;
            case 'searchSource':
                if (this.selectedTable) {
                    geometry = this.getGeometryFromGraphicsLayer(this.selectedTable.sourceGraphics);
                }
                break;
            case 'searchFeatures':
                if (this.selectedTable) {
                    geometry = this.getGeometryFromGraphicsLayer(this.selectedTable.featureGraphics);
                }
                break;
            case 'searchSelected':
                if (this.selectedTable) {
                    geometry = this.getGeometryFromSelectedFeatures();
                }
                break;
            case 'searchBuffer':
                if (this.selectedTable) {
                    geometry = this.getGeometryFromGraphicsLayer(this.selectedTable.bufferGraphics);
                }
                break;
            default:
                break;
            }

            return geometry;
        },

        getGeometryFromGraphicsLayer: function (layer) {
            if (!layer || !layer.graphics) {
                return null;
            }

            var graphics = layer.graphics;
            var k = 0, len = graphics.length, geoms = [];
            for (k = 0; k < len; k++) {
                geoms.push(graphics[k].geometry);
            }
            return geometryEngine.union(geoms);
        },

        getGeometryFromIdentifiedFeature: function () {
            var popup = this.map.infoWindow, feature;
            if (popup && popup.isShowing) {
                feature = popup.getSelectedFeature();
            }
            return feature.geometry;
        },

        getGeometryFromSelectedFeatures: function () {
            var geom;
            if (this.selectedTable) {
                geom = this.getGeometryFromGraphicsLayer(this.selectedTable.selectedGraphics);
            }
            return geom;
        },

        getSearchTerm: function (idx, field) {
            var searchTerm = this['inputSearchTerm' + idx].get('value');
            if (!searchTerm && field.required) {
                this['inputSearchTerm' + idx].domNode.focus();

                topic.publish('growler/growl', {
                    title: 'Search',
                    message: 'You must provide a search term for ' + field.name + '.',
                    level: 'error',
                    timeout: 3000
                });
                return null;
            }
            if (field.minChars && field.required) {
                if (searchTerm.length < field.minChars) {
                    topic.publish('growler/growl', {
                        title: 'Search',
                        message: 'Search term for ' + field.name + ' must be at least ' + field.minChars + ' characters.',
                        level: 'error',
                        timeout: 3000
                    });
                    return null;
                }
            }
            return searchTerm;
        },

        // a topic subscription to listen for published topics
        executeSearch: function (options) {
            if (options.searchTerm) {
                this.inputSearchTerm0.set('value', options.searchTerm);
            }
            if (options.bufferDistance) {
                this.inputBufferDistance.set('value', options.bufferDistance);
                if (options.bufferUnits) {
                    this.selectBufferUnits.set('value', options.bufferUnits);
                }
            }
            this.search(options.geometry, options.layerIndex);
        },


        /*******************************
        *  Form/Field Functions
        *******************************/

        initLayerSelect: function () {
            var attrOptions = [],
                shapeOptions = [];
            var len = this.layers.length,
                option;
            for (var i = 0; i < len; i++) {
                option = {
                    value: i,
                    label: this.layers[i].name
                };
                attrOptions.push(lang.clone(option));
                if (this.layers[i].queryParameters && this.layers[i].queryParameters.type === 'spatial') {
                    option.value = (shapeOptions.length);
                    shapeOptions.push(option);
                }
            }

            if (attrOptions.length > 0) {
                this.selectLayerByAttribute.set('options', attrOptions);
                this.onAttributeLayerChange(this.attributeLayer);
            } else {
                this.selectLayerByAttribute.set('disabled', true);
            }
            if (shapeOptions.length > 0) {
                this.selectLayerByShape.set('options', shapeOptions);
                this.onShapeLayerChange(this.shapeLayer);
            } else {
                this.selectLayerByShape.set('disabled', true);
            }
        },

        initAdvancedFeatures: function () {
            // show the queryBuilder button
            if (this.enableQueryBuilder) {
                this.btnQueryBuilder.set('disabled', false);
            } else {
                domStyle.set(this.btnQueryBuilder.domNode, 'display', 'none');
            }

            // allow or not the drawing multiple shapes before searching
            if (!this.enableDrawMultipleShapes) {
                domStyle.set(this.btnSpatialSearch.domNode, 'display', 'none');
                this.drawingOptions.stopDrawing = false;
            }

            // allow or the search results to be added to the previous results
            if (!this.enableAddToExistingResults) {
                domStyle.set(this.divAttributeAddToExisting, 'display', 'none');
                domStyle.set(this.divSpatialAddToExisting, 'display', 'none');
                this.drawingOptions.selectedFeatures = false;
            }

            // allow or not the use of spatial features
            if (!this.enableSpatialFilters) {
                domStyle.set(this.divAttributeSpatialFilter, 'display', 'none');
            }
        },

        onShapeLayerChange: function (newValue) {
            this.shapeLayer = newValue;
        },

        onAttributeLayerChange: function (newValue) {
            this.attributeLayer = newValue;
            this.selectAttributeQuery.set('disabled', true);
            var layer = this.layers[this.attributeLayer];
            if (layer) {
                this.selectAttributeQuery.set('value', null);
                this.selectAttributeQuery.set('options', null);
                var searches = layer.attributeSearches;
                var options = [];
                var len = searches.length;
                for (var i = 0; i < len; i++) {
                    var option = {
                        value: i,
                        label: searches[i].name
                    };
                    options.push(option);
                    if (i === 0) {
                        options[i].selected = true;
                    }
                }
                if (len) {
                    this.selectAttributeQuery.set('options', options);
                    this.selectAttributeQuery.set('disabled', false);
                    this.selectAttributeQuery.set('value', 0);
                    this.onAttributeQueryChange(0);

                    domStyle.set(this.divAttributeQuerySelect, 'display', (len > 1) ? 'block' : 'none');
                }
            }
        },

        onAttributeQueryChange: function (newValue) {
            this.searchIndex = newValue;
            var layer = this.layers[this.attributeLayer];
            if (layer) {
                var searches = layer.attributeSearches;
                if (searches) {
                    var search = searches[newValue];
                    if (search) {
                        // initialize all the search field inputs
                        var fields = search.searchFields;
                        for (var k = 0; k < 10; k++) {
                            var display = 'block', disabled = false;
                            if (k > 0 && layer.findOptions) { // only show one field for FindTasks
                                display = 'none';
                            }
                            var formLabel = this['labelSearchTerm' + k];
                            var formInput = this['inputSearchTerm' + k];
                            if (formInput) {
                                var field = fields[k];
                                if (field) {
                                    var txt = field.label + ':';
                                    if (field.minChars) {
                                        txt += ' (at least ' + field.minChars + ' chars)';
                                    }

                                    formLabel.textContent = txt;
                                    formInput.set('value', '');
                                    formInput.set('placeHolder', field.placeholder);
                                } else {
                                    display = 'none';
                                    disabled = true;
                                }

                                formInput.set('disabled', disabled);
                                domStyle.set(formInput.domNode, 'display', display);
                                domStyle.set(formLabel, 'display', display);
                            }
                        }

                        // only show "Contains" checkbox for FindTasks
                        domStyle.set(this.queryContainsDom, 'display', ((layer.findOptions) ? 'block' : 'none'));

                        // put focus on the first input field
                        this.inputSearchTerm0.domNode.focus();
                        this.btnAttributeSearch.set('disabled', false);

                    }
                }
            }
        },

        doAttributeSearch: function () {
            this.search(null, this.attributeLayer);
        },

        initSpatialFilters: function () {
            var type = this.selectAttributeSpatialFilter.get('value');
            var geomOptions = [], popup = this.map.infoWindow, includeOption;
            for (var key in this.spatialFilters) {
                if (this.spatialFilters.hasOwnProperty(key)) {
                    if (this.spatialFilters[key]) {
                        includeOption = false;
                        switch (key) {
                        case 'identifiedFeature':
                            if (popup && popup.isShowing) {
                                includeOption = true;
                            }
                            break;
                        case 'searchSource':
                            if (this.selectedTable && this.selectedTable.sourceGraphics.graphics.length > 0) {
                                includeOption = true;
                            }
                            break;
                        case 'searchFeatures':
                            if (this.selectedTable && this.selectedTable.featureGraphics.graphics.length > 0) {
                                includeOption = true;
                            }
                            break;
                        case 'searchSelected':
                            if (this.selectedTable && this.selectedTable.selectedGraphics.graphics.length > 0) {
                                includeOption = true;
                            }
                            break;
                        case 'searchBuffer':
                            if (this.selectedTable && this.selectedTable.bufferGraphics.graphics.length > 0) {
                                includeOption = true;
                            }
                            break;
                        default:
                            includeOption = true;
                            break;
                        }
                        if (includeOption) {
                            geomOptions.push({
                                value: key,
                                label: this.i18n.Labels.spatialFilters[key]
                            });
                        }
                    }
                }
            }

            this.selectAttributeSpatialFilter.set('options', geomOptions);
            this.selectGeometry = null;
            if (geomOptions.length > 0) {
                this.selectAttributeSpatialFilter.set('disabled', false);
                this.selectAttributeSpatialFilter.set('value', type);
            } else {
                this.selectAttributeSpatialFilter.set('disabled', true);
            }
        },

        onSpatialBufferChange: function () {
            this.addBufferGraphic();
        },

        /*******************************
        *  Drawing Functions
        *******************************/

        enableDrawingButtons: function () {
            var opts = this.drawingOptions;
            var disp = (opts.rectangle !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchRectangleButtonDijit.domNode, 'display', disp);
            disp = (opts.circle !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchCircleButtonDijit.domNode, 'display', disp);
            disp = (opts.point !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchPointButtonDijit.domNode, 'display', disp);
            disp = (opts.polyline !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchPolylineButtonDijit.domNode, 'display', disp);
            disp = (opts.freehandPolyline !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchFreehandPolylineButtonDijit.domNode, 'display', disp);
            disp = (opts.polygon !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchPolygonButtonDijit.domNode, 'display', disp);
            disp = (opts.freehandPolygon !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchFreehandPolygonButtonDijit.domNode, 'display', disp);
            disp = (opts.stopDrawing !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchStopDrawingButtonDijit.domNode, 'display', disp);
            disp = (opts.identifiedFeatures !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchIdentifyButtonDijit.domNode, 'display', disp);
            disp = (opts.selectedFeatures !== false) ? 'inline-block' : 'none';
            domStyle.set(this.searchSelectedButtonDijit.domNode, 'display', disp);
        },

        prepareForDrawing: function (btn) {
            // is btn checked?
            var chk = btn.get('checked');
            this.cancelDrawing();
            if (chk) {
                // toggle btn to checked state
                btn.set('checked', true);
            }
            return chk;
        },

        drawRectangle: function () {
            var btn = this.searchRectangleButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.EXTENT);
            }
        },

        drawCircle: function () {
            var btn = this.searchCircleButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.CIRCLE);
            }
        },

        drawPoint: function () {
            var btn = this.searchPointButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.POINT);
            }
        },

        drawPolyline: function () {
            var btn = this.searchPolylineButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.POLYLINE);
            }
        },

        drawFreehandPolyline: function () {
            var btn = this.searchFreehandPolylineButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.FREEHAND_POLYLINE);
            }
        },

        drawPolygon: function () {
            var btn = this.searchPolygonButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.POLYGON);
            }
        },

        drawFreehandPolygon: function () {
            var btn = this.searchFreehandPolygonButtonDijit;
            if (this.prepareForDrawing(btn)) {
                this.drawToolbar.activate(Draw.FREEHAND_POLYGON);
            }
        },

        uncheckDrawingTools: function () {
            this.searchRectangleButtonDijit.set('checked', false);
            this.searchCircleButtonDijit.set('checked', false);
            this.searchPointButtonDijit.set('checked', false);
            this.searchPolylineButtonDijit.set('checked', false);
            this.searchFreehandPolylineButtonDijit.set('checked', false);
            this.searchPolygonButtonDijit.set('checked', false);
            this.searchFreehandPolygonButtonDijit.set('checked', false);
            this.searchStopDrawingButtonDijit.set('checked', true);
            this.btnSpatialSearch.set('disabled', true);
        },

        endDrawing: function (evt) {
            var clickMode = this.mapClickMode, geometry;
            if (clickMode === 'search' && evt) {
                geometry = evt.geometry;
            }
            if (geometry) {
                if (this.spatialGeometry) {
                    this.spatialGeometry = geometryEngine.union(this.spatialGeometry, geometry);
                } else {
                    this.spatialGeometry = geometry;
                }
                this.addDrawingGraphic(evt);
                this.addBufferGraphic();

                if (this.enableDrawMultipleShapes) {
                    this.btnSpatialSearch.set('disabled', false);
                } else {
                    this.doSpatialSearch();
                }
            }
        },

        cancelDrawing: function () {
            this.hideInfoWindow();
            this.disconnectMapClick();
            this.uncheckDrawingTools();
            this.drawToolbar.deactivate();
            this.spatialGeometry = null;
            this.drawingGraphicsLayer.clear();
            this.bufferGraphic = null;
        },

        doSpatialSearch: function () {
            this.uncheckDrawingTools();
            this.map.enableMapNavigation();
            this.drawToolbar.deactivate();
            this.drawingGraphicsLayer.clear();
            this.bufferGraphic = null;
            this.connectMapClick();

            if (this.spatialGeometry) {
                this.search(this.spatialGeometry, this.shapeLayer);
                this.spatialGeometry = null;
            }
        },

        addGraphicsLayer: function () {
            this.drawingGraphicsLayer = new GraphicsLayer({
                id: this.topicID + '_SourceGraphics',
                title: 'Search Drawing Graphics'
            });
            this.map.addLayer(this.drawingGraphicsLayer);

            // symbology for drawn features
            var symbolOptions = this.drawingOptions.symbols || {};
            var symbols = this.mixinDeep(lang.clone(this.defaultSymbols), symbolOptions);
            this.drawingPointSymbol = new SimpleMarkerSymbol(symbols.point);
            this.drawingPolylineSymbol = new SimpleLineSymbol(symbols.polyline);
            this.drawingPolygonSymbol = new SimpleFillSymbol(symbols.polygon);
            this.bufferPolygonSymbol = new SimpleFillSymbol(symbols.buffer);
        },

        addDrawingGraphic: function (feature) {
            var symbol, graphic;
            switch (feature.geometry.type) {
            case 'point':
            case 'multipoint':
                symbol = this.drawingPointSymbol;
                break;
            case 'polyline':
                symbol = this.drawingPolylineSymbol;
                break;
            case 'extent':
            case 'polygon':
                symbol = this.drawingPolygonSymbol;
                break;
            default:
            }
            if (symbol) {
                graphic = new Graphic(feature.geometry, symbol, feature.attributes);
                this.drawingGraphicsLayer.add(graphic);
            }
        },

        addBufferGraphic: function () {
            var geometry,
                distance = this.inputBufferDistance.get('value'),
                unit = this.selectBufferUnits.get('value');

            this.drawingGraphicsLayer.remove(this.bufferGraphic);
            this.bufferGraphic = null;

            if (isNaN(distance) || distance === 0 || !this.spatialGeometry) {
                return;
            }
            if (this.map.spatialReference.wkid === 4326 || this.map.spatialReference.wkid === 102100) {
                geometry = geometryEngine.geodesicBuffer(this.spatialGeometry, distance, unit);
                if (geometry) {
                    this.bufferGraphic = new Graphic(geometry, this.bufferPolygonSymbol);
                    this.drawingGraphicsLayer.add(this.bufferGraphic);
                }
            }
        },

        /*
        onDrawToolbarDrawEnd: function (graphic) {
            this.map.enableMapNavigation();
            this.drawToolbar.deactivate();
            this.connectMapClick();

            this.search(graphic.geometry, this.shapeLayer);
        },
        */

        /*******************************
        *  Using Identify Functions
        *******************************/

        useIdentifiedFeatures: function () {
            var geometry = this.getGeometryFromIdentifiedFeature();
            if (geometry) {
                this.search(geometry, this.shapeLayer);
                return;
            }

            topic.publish('growler/growl', {
                title: 'Search',
                message: 'You must have identified a feature',
                level: 'error',
                timeout: 3000
            });
        },

        enableIdentifyButton: function () {
            this.searchIdentifyButtonDijit.set('disabled', false);
            this.initSpatialFilters();
        },

        disableIdentifyButton: function () {
            this.searchIdentifyButtonDijit.set('disabled', true);
            this.initSpatialFilters();
        },

        /*******************************
        *  Using Selected Functions
        *******************************/

        useSelectedFeatures: function () {
            var geometry = this.getGeometryFromSelectedFeatures();
            if (geometry) {
                this.search(geometry, this.shapeLayer);
                return;
            }

            topic.publish('growler/growl', {
                title: 'Search',
                message: 'You must have selected feature(s)',
                level: 'error',
                timeout: 3000
            });
        },

        toggleSelectedButton: function () {
            var geometry = this.getGeometryFromSelectedFeatures();
            if (geometry) {
                this.enableSelectedButton();
            } else {
                this.disableSelectedButton();
            }
        },

        enableSelectedButton: function () {
            this.searchSelectedButtonDijit.set('disabled', false);
        },

        disableSelectedButton: function () {
            this.searchSelectedButtonDijit.set('disabled', true);
        },

        /*******************************
        *  Query Builder Functions
        *******************************/

        openQueryBuilder: function () {
            var layer = this.layers[this.attributeLayer], search = layer.attributeSearches[this.searchIndex] || {};
            topic.publish(this.queryBuilderTopicID + '/openDialog', {
                layer: layer,
                sqlText: search.sqlWhereClause
            });
        },

        setSQLWhereClause: function (sqlText) {
            var layer = this.layers[this.attributeLayer], search = layer.attributeSearches[this.searchIndex] || {};
            search.sqlWhereClause = sqlText;
        },

        clearSQLWhereClause: function () {
            var layer = this.layers[this.attributeLayer], search = layer.attributeSearches[this.searchIndex] || {};
            search.sqlWhereClause = null;
        },

        /*******************************
        *  Miscellaneous Functions
        *******************************/

        hideInfoWindow: function () {
            if (this.map && this.map.infoWindow) {
                this.map.infoWindow.hide();
            }
        },

        disconnectMapClick: function () {
            topic.publish('mapClickMode/setCurrent', 'search');
        },

        connectMapClick: function () {
            topic.publish('mapClickMode/setDefault');
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        },

        onLayoutChange: function (open) {
            if (!open && this.mapClickMode === 'search') {
                this.connectMapClick();
                this.drawToolbar.deactivate();
                this.inherited(arguments);
            }
        },

        setSearchTable: function (searchTable) {
            this.selectedTable = searchTable;
            this.initSpatialFilters();
            this.toggleSelectedButton();
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
