define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    './Search/QueryBuilder/QueryBuilderMixin',

    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-style',
    'dojo/aspect',
    'dojo/topic',
    'dojo/keys',
    'dojo/_base/array',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-attr',
    'dojo/dom-geometry',
    'dijit/registry',
    'dojo/io-query',

    'dojo/when',
    'dojo/promise/all',

    'dijit/form/Select',
    'dijit/form/TextBox',
    'dijit/form/SimpleTextarea',
    'dijit/form/DateTextBox',
    'dijit/form/TimeTextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/CurrencyTextBox',
    'dijit/form/NumberSpinner',

    'esri/toolbars/draw',
    'esri/tasks/query',
    'esri/tasks/GeometryService',
    'esri/geometry/geometryEngine',

    'esri/layers/GraphicsLayer',
    'esri/graphic',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol',

    './Search/GetDistinctValues',

    // template
    'dojo/text!./Search/templates/Search.html',

    //i18n
    'dojo/i18n!./Search/nls/Search',

    //template widgets
    'dijit/layout/LayoutContainer',
    'dijit/layout/ContentPane',
    'dijit/layout/TabContainer',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'dijit/form/ToggleButton',

    // css
    'xstyle/css!./Search/css/Search.css',
    'xstyle/css!./Search/css/Draw.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    _QueryBuilderMixin,

    lang,
    on,
    domStyle,
    aspect,
    topic,
    keys,
    array,
    dom,
    domConstruct,
    domAttr,
    domGeom,
    registry,
    ioQuery,

    when,
    allPromise,

    Select,
    TextBox,
    SimpleTextarea,
    DateTextBox,
    TimeTextBox,
    NumberTextBox,
    CurrencyTextBox,
    NumberSpinner,

    Draw,
    Query,
    GeometryService,
    geometryEngine,
    GraphicsLayer,
    Graphic,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,

    GetDistinctValues,

    template,

    i18n
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _QueryBuilderMixin], {
        name: 'Search',
        baseClass: 'cmvSearchWidget',
        widgetsInTemplate: true,
        templateString: template,
        mapClickMode: null,

        // i18n
        defaultI18n: i18n,
        i18n: {},

        title: 'Search Results',
        topicID: 'searchResults',
        attributesContainerID: 'attributesContainer',

        shapeLayer: 0,
        attributeLayer: 0,
        searchIndex: 0,
        drawToolbar: null,

        isAdvancedSearch: false,
        loadingCount: 0,

        // to override the default tab when the widget starts
        defaultTab: 0,

        defaultBufferDistance: 0,

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
        enableAdvancedSearch: false,
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

        defaultQueryStringOptions: {
            // what parameter is used to pass the layer index
            layerParameter: 'layer',

            // what parameter is used to pass the attribute search index
            searchParameter: 'search',

            // what parameter is used to pass the values to be searched
            valueParameter: 'values',

            // if passing multiple values, how are they delimited
            valueDelimiter: '|',

            // Should the widget open when the search is executed?
            openWidget: true
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

        postMixInProperties: function () {
            this.inherited(arguments);
            this.i18n = this.mixinDeep(this.defaultI18n, this.i18n);
        },

        postCreate: function () {
            this.inherited(arguments);
            this.initAdvancedFeatures();
            this.initLayerSelect();
            this.initSpatialFilters();
            this.inputBufferDistance.set('value', this.defaultBufferDistance || 0);
            this.selectBufferUnits.set('options', this.bufferUnits);
            this.drawToolbar = new Draw(this.map);
            this.enableDrawingButtons();
            this.addGraphicsLayer();

            this.tabContainer.watch('selectedChildWidget', lang.hitch(this, function () {
                this.stopDrawing();
            }));

            if (this.map.infoWindow) {
                on(this.map.infoWindow, 'show', lang.hitch(this, 'enableIdentifyButton'));
                on(this.map.infoWindow, 'hide', lang.hitch(this, 'disableIdentifyButton'));
            }
            this.own(on(this.drawToolbar, 'draw-end', lang.hitch(this, 'endDrawing')));

            this.addTopics();
        },

        startup: function () {
            this.inherited(arguments);

            this.buildSearchControls();

            if (this.getParent) {
                var parent = this.getParent();
                if (parent) {
                    this.own(on(parent, 'show', lang.hitch(this, function () {
                        this.tabContainer.resize();
                    })));
                }
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

            // Search from the applications query string
            this.checkQueryString();

            this.setAdvancedSearch(false);
        },

        addTopics: function () {
            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
            this.own(topic.subscribe(this.topicID + '/search', lang.hitch(this, 'executeSearch')));
            this.own(topic.subscribe(this.attributesContainerID + '/tableUpdated', lang.hitch(this, 'setSearchTable')));

            if (this.parentWidget) {
                this.own(aspect.after(this.parentWidget, 'resize', lang.hitch(this, 'resize')));
                this.own(topic.subscribe(this.parentWidget.id + '/resize/resize', lang.hitch(this, 'resize')));

                this.own(topic.subscribe('titlePane/event', lang.hitch(this, function (args) {
                    if (this.parentWidget && args.widgetID === this.parentWidget.id && (args.action === 'dock' || args.action === 'undock')) {
                        this.resize({
                            action: args.action
                        });
                    }
                })));
            }
        },

        /*******************************
        *  Search Functions
        *******************************/

        executeSearchWithReturn: function (evt) {
            if (evt.keyCode === keys.ENTER) {
                this.doAttributeSearch();
            }
        },

        search: function (geometry, layerIndex, advancedQuery) {
            if (!this.layers || this.layers.length === 0) {
                return;
            }

            var layer = this.layers[layerIndex];
            var search = layer.attributeSearches[this.searchIndex] || {};
            var searchOptions = this.buildSearchOptions(layer, search, advancedQuery);
            if (layer.findOptions) { // It is a FindTask
                searchOptions.findOptions = this.buildFindOptions(layer, search);
            } else {
                searchOptions.queryOptions = this.buildQueryOptions(layer, search, geometry, advancedQuery);
            }

            this.hideInfoWindow();

            // publish to an accompanying attributed table
            if (searchOptions.findOptions || searchOptions.queryOptions) {
                topic.publish(this.attributesContainerID + '/addTable', searchOptions);
            }

        },

        buildSearchOptions: function (layer, search, advancedQuery) {
            var gridOptions = lang.clone(search.gridOptions || layer.gridOptions || {});
            var featureOptions = lang.clone(search.featureOptions || layer.featureOptions || {});
            var symbolOptions = lang.clone(search.symbolOptions || layer.symbolOptions || {});
            var toolbarOptions = lang.clone(search.toolbarOptions || layer.toolbarOptions || {});
            var infoTemplates = lang.clone(search.infoTemplates || layer.infoTemplates || {});

            return {
                title: search.title || layer.title || this.title,
                topicID: search.topicID || layer.topicID || this.topicID,
                findOptions: null,
                queryOptions: advancedQuery || null,
                gridOptions: gridOptions,
                featureOptions: featureOptions,
                symbolOptions: symbolOptions,
                toolbarOptions: toolbarOptions,
                infoTemplates: infoTemplates
            };
        },

        buildQueryOptions: function (layer, search, geometry, advancedQuery) {
            var where = null,
                distance = null,
                unit = null,
                showOnly = false,
                addToExisting = false,
                queryOptions = {
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
                where = this.buildWhereClause(layer, search, advancedQuery);
                if (where === null) {
                    return null;
                }
                geometry = this.getSpatialFilterGeometry();
                addToExisting = this.checkAttributeAddToExisting.get('checked');
            }

            var queryParameters = lang.clone(search.queryParameters || layer.queryParameters || {});
            queryOptions.queryParameters = lang.mixin(queryParameters, {
                //type: search.type || layer.type || 'spatial',
                geometry: this.geometryToJson(geometry),
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
                var inputId = search.inputIds[0];
                var input = registry.byId(inputId);
                searchTerm = this.getSearchTerm(input, search.searchFields[0]);
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

        buildWhereClause: function (layer, search, advancedQuery) {
            var fields = search.searchFields;
            var searchTerm = null;
            var where = this.getDefaultWhereClause(layer, search);
            if (advancedQuery && advancedQuery.where) {
                if (where !== '') {
                    where += ' AND ';
                }
                where = where + '(' + advancedQuery.where + ')';
                return where;
            }

            var len = fields.length;
            for (var k = 0; k < len; k++) {
                var field = fields[k];
                var inputId = search.inputIds[k];
                var input = registry.byId(inputId);

                if (field.where) {
                    if (where !== '') {
                        where += ' AND ';
                    }
                    where += '(' + field.where + ')';
                }

                searchTerm = this.getSearchTerm(input, field);
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
            if (where.length === 0) {
                where = '1=1';
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
            var popup = this.map.infoWindow,
                feature = null;
            if (popup && popup.isShowing) {
                feature = popup.getSelectedFeature();
            }
            return feature.geometry;
        },

        getGeometryFromSelectedFeatures: function () {
            var geom = null;
            if (this.selectedTable) {
                geom = this.getGeometryFromGraphicsLayer(this.selectedTable.selectedGraphics);
            }
            return geom;
        },

        getSearchTerm: function (input, field) {
            var fieldName = field.label || field.field || field.name;
            if (input.isValid && !input.isValid()) {
                topic.publish('growler/growl', {
                    title: 'Search',
                    message: 'Invalid value for ' + fieldName + '.',
                    level: 'error',
                    timeout: 3000
                });
                return null;
            }

            var value = input.get('value'), searchTerm = '';
            switch (field.type) {
            case 'date':
            case 'time':
            case 'number':
            case 'currency':
            case 'numberspinner':
                value = input.toString();
                if (field.format) {
                    searchTerm = input.format(value);
                } else {
                    searchTerm = value;
                }
                break;

            default:
                if (lang.isArray(value)) {
                    searchTerm = value.join('\', \'');
                }
                searchTerm = value;
                if (searchTerm === '*' || searchTerm === null) {
                    searchTerm = '';
                }
                break;
            }

            if (searchTerm === '' && field.required) {
                input.domNode.focus();

                topic.publish('growler/growl', {
                    title: 'Search',
                    message: 'You must provide a search term for ' + fieldName + '.',
                    level: 'error',
                    timeout: 3000
                });
                return null;
            }
            if (field.minChars && field.required) {
                if (searchTerm.length < field.minChars) {
                    input.domNode.focus();
                    topic.publish('growler/growl', {
                        title: 'Search',
                        message: 'Search term for ' + fieldName + ' must be at least ' + field.minChars + ' characters.',
                        level: 'error',
                        timeout: 3000
                    });
                    return null;
                }
            }

            return searchTerm;
        },

        // a topic subscription to listen for published topics
        // also used to search from the queryString
        executeSearch: function (options) {
            if (options.bufferDistance) {
                this.inputBufferDistance.set('value', options.bufferDistance);
                if (options.bufferUnits) {
                    this.selectBufferUnits.set('value', options.bufferUnits);
                }
            }

            //attribute search
            var doAttrSearch = false;
            if (options.searchTerm) {
                var inputId = null,
                    input = null,
                    layer = this.layers[options.layerIndex];

                if (layer) {
                    this.attributeLayer = options.layerIndex;
                    this.onAttributeLayerChange(this.attributeLayer);
                    var search = layer.attributeSearches[options.searchIndex];
                    if (search) {
                        this.onAttributeQueryChange(options.searchIndex);
                        if (lang.isArray(options.searchTerm)) {
                            var len = options.searchTerm.length;
                            for (var k = 0; k < len; k++) {
                                inputId = search.inputIds[k];
                                if (inputId) {
                                    input = registry.byId(inputId);
                                    if (input) {
                                        input.set('value', options.searchTerm[k]);
                                        doAttrSearch = true;
                                    }
                                }
                            }
                        } else {
                            inputId = search.inputIds[0];
                            input = registry.byId(inputId);
                            if (input) {
                                input.set('value', options.searchTerm);
                                doAttrSearch = true;
                            }
                        }
                    }
                }
            }
            if (options.geometry || doAttrSearch) {
                this.search(options.geometry, options.layerIndex);
            }
        },

        checkQueryString: function () {
            // searching by geometry from the query string is not yet supported
            var options = this.mixinDeep(this.defaultQueryStringOptions, this.queryStringOptions || {});
            var uri = window.location.href;
            var qs = uri.substring(uri.indexOf('?') + 1, uri.length);
            var qsObj = ioQuery.queryToObject(qs);
            var value = qsObj[options.valueParameter];
            var layerIndex = qsObj[options.layerParameter] || 0;
            var searchIndex = qsObj[options.searchParameter] || 0;
            var widget = null;

            // only continue if there is a term to search
            if (!value) {
                return;
            }
            if (value.indexOf(options.valueDelimiter) > -1) {
                value = value.split(options.valueDelimiter);
            }

            if (options.openWidget) {
                widget = this.parentWidget;
                if (widget && widget.toggleable) {
                    if (!widget.open) {
                        widget.toggle();
                    }
                }
            }

            // make sure the attributesTable widget is loaded before executing
            // check every 0.25 seconds
            var qsTimer = window.setInterval(lang.hitch(this, function () {
                widget = registry.byId(this.attributesContainerID + '_widget');
                if (widget) {
                    // no need to continue, so clear the timer
                    window.clearInterval(qsTimer);

                    // we're ready so execute the search.
                    this.executeSearch({
                        layerIndex: layerIndex,
                        searchIndex: searchIndex,
                        searchTerm: value
                    });
                }
            }), 250);

            // clear the timer after 30 seconds in case we are waiting that long
            window.setTimeout(function () {
                window.clearInterval(qsTimer);
            }, 30000);
        },

        /*******************************
        *  Form/Field Functions
        *******************************/

        // Initialize the controls used for the search.
        buildSearchControls: function () {
            // change to
            var domNode = this.divAttributeQueryFields;
            if (domNode) {
                for (var i = 0; i < this.layers.length; i++) {
                    var layer = this.layers[i];
                    if (layer) {
                        var searches = layer.attributeSearches;
                        if (searches) {
                            for (var j = 0; j < searches.length; j++) {
                                var search = searches[j];
                                if (search) {
                                    var firstSearch = ((i === 0) && (j === 0));
                                    // add the div for the search
                                    var id = '_' + i.toString() + '_' + j.toString();
                                    var divName = 'divSearch' + id;
                                    var divNode = domConstruct.create('div', {
                                        id: divName,
                                        style: {
                                            display: 'none'
                                        }
                                    }, domNode, 'last');
                                    // display the first search for the first layer
                                    if (firstSearch) {
                                        domStyle.set(divName, 'display', 'block');
                                    }
                                    search.divName = divName;
                                    search.inputIds = [];

                                    // add the controls for the search
                                    for (var k = 0; k < search.searchFields.length; k++) {
                                        this.buildSearchControl(search, layer, divNode, id, k, firstSearch);
                                    }
                                    //this.initialized = true;
                                }
                            }
                        }
                    }
                }
            }
        },

        buildSearchControl: function (search, layer, divNode, id, k, firstSearch) {
            var field = search.searchFields[k];
            var inputId = 'inputSearch_' + id + '_' + k.toString();

            if (field) {
                var fieldNode = domConstruct.create('div', {
                    className: 'searchField'
                }, divNode, 'last');

                this.buildSearchControlLabel(field, search, layer, fieldNode);

                if (field.unique || field.values) {
                    this.buildSearchControlSelect(field, search, layer, fieldNode, inputId, firstSearch);
                } else {
                    this.buildSearchControlInput(field, search, layer, fieldNode, inputId);
                }

                // the first input field is for focus
                search.inputIds.push(inputId);
            }

        },

        buildSearchControlLabel: function (field, search, layer, fieldNode) {
            var labelWidth = field.labelWidth || layer.labelWidth || null;
            if (typeof labelWidth === 'number') {
                labelWidth += 'px';
            }

            var txt = field.label + ':';
            var title = field.label;
            if (field.minChars) {
                title = 'Enter at least ' + field.minChars + ' characters';
            }

            domConstruct.create('div', {
                innerHTML: txt,
                className: 'searchFieldLabel',
                title: title,
                style: {
                    width: labelWidth
                }

            }, fieldNode, 'last');

        },

        buildSearchControlSelect: function (field, search, layer, fieldNode, inputId, firstSearch) {
            var input = null,
                style = field.style || layer.style || null,
                fieldWidth = field.width || layer.fieldWidth || '99%',
                fieldHeight = field.height || layer.fieldHeight || 'inherit',
                options = [];

            if (typeof fieldWidth === 'number') {
                fieldWidth += 'px';
            }
            if (typeof fieldHeight === 'number') {
                fieldHeight += 'px';
            }

            if (field.values) {
                array.forEach(field.values, function (item) {
                    if (typeof item === 'string') {
                        options.push({
                            label: item,
                            value: item,
                            selected: false
                        });
                    } else {
                        options.push(item);
                    }
                });
                if (options.length > 0) {
                    options[0].selected = true;
                }
            }

            input = new Select({
                id: inputId,
                options: options,
                style: style || {
                    height: fieldHeight,
                    width: fieldWidth
                }
            });

            if (input) {
                input.placeAt(fieldNode, 'last');
            }

            // only do this for the first search for the first layer
            if (field.type === 'unique' && firstSearch) {
                var queryParameters = lang.clone(layer.queryParameters);
                queryParameters.url = field.url || layer.queryParameters.url;
                var where = this.getDefaultWhereClause(layer, search, field);
                var fieldName = field.field || field.name;
                this.getDistinctValues(inputId, queryParameters, fieldName, field.includeBlankValue, where);
            }
        },

        buildSearchControlInput: function (field, search, layer, fieldNode, inputId) {
            var input = null,
                style = field.style || layer.style || null,
                fieldWidth = field.width || layer.fieldWidth || '99%',
                fieldHeight = field.height || layer.fieldHeight || 'inherit';

            if (typeof fieldWidth === 'number') {
                fieldWidth += 'px';
            }
            if (typeof fieldHeight === 'number') {
                fieldHeight += 'px';
            }

            var options = {
                id: inputId,
                constraints: field.constraints || {},
                value: field.defaultValue,
                placeHolder: field.placeholder,
                style: style || {
                    height: fieldHeight,
                    width: fieldWidth
                }
            };

            switch (field.type) {
            case 'date':
                input = new DateTextBox(options);
                break;
            case 'time':
                input = new TimeTextBox(options);
                break;
            case 'number':
                input = new NumberTextBox(options);
                break;
            case 'currency':
                input = new CurrencyTextBox(options);
                break;
            case 'numberspinner':
                options.smallDelta = field.smallDelta || 1;
                input = new NumberSpinner(options);
                break;
            case 'textarea':
                input = new SimpleTextarea(options);
                break;
            default:
                input = new TextBox(options);
                break;
            }

            if (input) {
                input.placeAt(fieldNode, 'last');
                this.own(on(input, 'keyup', lang.hitch(this, 'executeSearchWithReturn')));
            }
        },

        initLayerSelect: function () {
            var attrOptions = [],
                shapeOptions = [];
            var len = this.layers.length,
                option = null,
                attributeLayerSet = false;
            for (var i = 0; i < len; i++) {
                option = {
                    value: i,
                    label: this.layers[i].name
                };
                if (this.layers[i].attributeSearches && this.layers[i].attributeSearches.length > 0) {
                    attrOptions.push(lang.clone(option));
                    if (!attributeLayerSet) {
                        this.attributeLayer = i;
                        attributeLayerSet = true;
                    }
                }
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

            // allow or not the Advanced Attributes Search
            this.checkAdvancedSearchEnabled();

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

            this.showLoadingSpinnerWhile(allPromise([
                this.loadBasicAttributeQuerySelect()
            ]));
        },

        loadBasicAttributeQuerySelect: function () {
            var layer = this.layers[this.attributeLayer];
            if (!layer || !layer.attributeSearches) {
                return when(null);
            }

            domStyle.set(this.divAttributeQuerySelect, 'display', 'none');
            this.selectAttributeQuery.set('value', null);
            this.selectAttributeQuery.set('options', null);

            if (!layer.attributeSearches || layer.attributeSearches.length === 0) {
                return when(null);
            }

            var options = layer.attributeSearches.map(function (search, i) {
                var option = {
                    value: i,
                    label: search.name
                };
                if (i === 0) {
                    option.selected = true;
                }
                return option;
            });

            this.selectAttributeQuery.set('options', options);
            this.selectAttributeQuery.set('disabled', false);
            this.selectAttributeQuery.set('value', 0);
            return this.onAttributeQueryChange(0).then(lang.hitch(this, function () {
                if (options.length > 1) {
                    domStyle.set(this.divAttributeQuerySelect, 'display', 'block');
                }
            }));
        },

        showLoadingSpinnerWhile: function (fn) {
            this.loadingCount += 1;
            domStyle.set(this.divLoadingSpinner, 'display', 'block');
            domStyle.set(this.divSearchAttributesCenter, 'display', 'none');

            if (typeof fn === 'function') {
                fn = fn();
            }
            return when(fn).then(lang.hitch(this, function () {
                this.loadingCount -= 1;

                if (this.loadingCount === 0) {
                    domStyle.set(this.divLoadingSpinner, 'display', 'none');
                    domStyle.set(this.divSearchAttributesCenter, 'display', 'block');
                }
            }));
        },

        onAttributeQueryChange: function (newValue) {
            // 'none' all of the query divs
            var domNode = this.divAttributeQueryFields;
            if (domNode) {
                array.forEach(this.layers, function (layer) {
                    if (!layer.attributeSearches) {
                        return;
                    }
                    array.forEach(layer.attributeSearches, function (search) {
                        var divNode = dom.byId(search.divName);
                        if (divNode) {
                            domStyle.set(search.divName, 'display', 'none');
                        }
                    });
                });
            }

            // 'block' the query div and set the focus to the first widget
            this.searchIndex = newValue;
            var layer = this.layers[this.attributeLayer];
            if (!layer || !layer.attributeSearches || !layer.attributeSearches[newValue]) {
                return when(null);
            }

            var search = layer.attributeSearches[newValue];
            if (!dom.byId(search.divName)) {
                return when(null);
            }

            var queryBuilderPromise = this.getQueryBuilder();

            // refresh the controls if any require unique values
            return allPromise(
                queryBuilderPromise,
                search.searchFields.map(lang.hitch(this, function (field, k) {

                    if (field.unique) {
                        var queryParameters = lang.clone(search.queryParameters || layer.queryParameters || {});
                        var where = this.getDefaultWhereClause(layer, search, field);
                        if (field.url) {
                            queryParameters.url = field.url;
                        }
                        var fieldName = field.field || field.name;
                        return this.getDistinctValues(search.inputIds[k], queryParameters, fieldName, field.includeBlankValue, where);
                    }
                    return when(null);
                }))
            ).then(lang.hitch(this, function () {
                domStyle.set(search.divName, 'display', 'block');

                // only show "Contains" checkbox for FindTasks
                domStyle.set(this.divQueryContains, 'display', ((layer.findOptions) ? 'block' : 'none'));

                this.checkAdvancedSearchEnabled(layer, search);
                this.checkClearButtonEnabled(layer, search);

                // put focus on the first input field
                var input = registry.byId(search.inputIds[0]);
                if (input && input.domNode) {
                    input.domNode.focus();
                    this.btnAttributeSearch.set('disabled', false);
                }
            }));
        },

        clearAttributeFields: function () {
            var layer = this.layers[this.attributeLayer];
            if (layer) {
                var searches = layer.attributeSearches;
                if (searches) {
                    for (var j = 0; j < searches.length; j++) {
                        var search = searches[j];
                        if (search) {
                            var divNode = dom.byId(search.divName);
                            if (!divNode) {
                                return;
                            }
                            for (var k = 0; k < search.searchFields.length; k++) {
                                var input = registry.byId(search.inputIds[k]);
                                if (input) {
                                    input.setValue('');
                                }
                            }
                        }
                    }
                }
            }
        },

        getDefaultWhereClause: function (layer, search, field) {
            var where = layer.expression || '';
            if (search && search.expression) {
                if (where !== '') {
                    where += ' AND ';
                }
                where += '(' + search.expression + ')';
            }
            if (field && field.where) {
                if (where !== '') {
                    where += ' AND ';
                }
                where += '(' + field.where + ')';
            }
            return where;
        },

        /*
         * Retrieve the list of distinct values from ArcGIS Server using the ArcGIS API for JavaScript.
         * @param {string} inputId The Dojo id of the control to populate with unique values.
         * @param {object} queryParameters Used to get the operational layer's url to be queried for unique values.
         * @param {string} fieldName The field name for which to retrieve unique values.
         * @param {boolean} includeBlankValue Whether to add a blank (null) value to the resulting list.
         * @param {string} expression The where expression with which to filter the query.
         */
        getDistinctValues: function (inputId, queryParameters, fieldName, includeBlankValue, expression) {
            var url = this.getLayerURL(queryParameters);

            var q = new GetDistinctValues(url, fieldName, expression);
            q.executeQuery().then(function (results) {
                var options = [];
                if (includeBlankValue) {
                    options.push({
                        label: '&nbsp;',
                        value: null,
                        selected: false
                    });
                }
                options = options.concat(array.map(results, function (value) {
                    return {
                        label: value,
                        value: value,
                        selected: false
                    };
                }));
                var input = registry.byId(inputId);
                input.set('options', options);
                if (options.length > 0) {
                    options[0].selected = true;
                    input.set('value', 0);
                }
            });
        },
        getLayerURL: function (qp) {
            var url = qp.url;
            if (!url && qp.layerID) {
                var layer = this.map.getLayer(qp.layerID);
                if (layer) {
                    if (layer.declaredClass === 'esri.layers.FeatureLayer') { // Feature Layer
                        url = layer.url;
                    } else if (layer.declaredClass === 'esri.layers.ArcGISDynamicMapServiceLayer') { // Dynamic Layer
                        if (qp.sublayerID !== null) {
                            url = layer.url + '/' + qp.sublayerID;
                        } else if (layer.visibleLayers && layer.visibleLayers.length === 1) {
                            url = layer.url + '/' + layer.visibleLayers[0];
                        }
                    }
                }
            }
            return url;
        },

        doAttributeSearch: function () {
            if (this.enableAdvancedSearch && this.isAdvancedSearch) {
                this.doAdvancedSearch();
            } else {
                this.search(null, this.attributeLayer);
            }
        },

        doAdvancedSearch: function () {
            var where = this.queryBuilder.toSQL();
            if (!where) {
                return;
            }
            this.search(null, this.attributeLayer, {
                where: where.sql
            });
        },

        initSpatialFilters: function () {
            var type = this.selectAttributeSpatialFilter.get('value'),
                geomOptions = [],
                popup = this.map.infoWindow,
                includeOption = null;

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
        *  Advanced Search Functions
        *******************************/

        setAdvancedSearch: function (advanced) {
            this.isAdvancedSearch = advanced;

            domStyle.set(this.btnAdvancedSwitch.domNode, 'display', this.isAdvancedSearch ? 'none' : 'block');
            domStyle.set(this.divBasicSearchBody, 'display', this.isAdvancedSearch ? 'none' : 'block');

            domStyle.set(this.btnBasicSwitch.domNode, 'display', this.isAdvancedSearch ? 'block' : 'none');
            domStyle.set(this.divAdvancedSearchBody, 'display', this.isAdvancedSearch ? 'block' : 'none');
        },

        toggleAdvancedSearch: function () {
            this.setAdvancedSearch(!this.isAdvancedSearch);
        },

        checkAdvancedSearchEnabled: function (layer, search) {
            var enabled = this.enableAdvancedSearch;
            if (layer && layer.enableAdvancedSearch === false) {
                enabled = false;
            } else if (layer && layer.findOptions) {
                enabled = false;
            } else if (search && search.enableAdvancedSearch === false) {
                enabled = false;
            } else if (layer && search) {
                var advancedSearchOptions = search.advancedSearchOptions || layer.advancedSearchOptions || {};
                if (advancedSearchOptions.enabled === false) {
                    enabled = false;
                }
            }
            if (enabled) {
                this.showAdvancedSearch();
            } else {
                this.hideAdvancedSearch();
            }
            return enabled;
        },

        checkClearButtonEnabled: function (layer, search) {
            var enabled = this.enableClearButton;
            if (layer && layer.enableClearButton === false) {
                enabled = false;
            } else if (search && search.enableClearButton === false) {
                enabled = false;
            }
            
            if (enabled) {
                this.showClearButton();
            } else {
                this.hideClearButton();
            }
            return enabled;
        },

        showAdvancedSearch: function () {
            if (this.enableAdvancedSearch) {
                domStyle.set(this.divAdvancedSearchButtons, 'display', 'block');
            }
        },

        hideAdvancedSearch: function () {
            domStyle.set(this.divAdvancedSearchButtons, 'display', 'none');
            this.setAdvancedSearch(false);
        },

        showClearButton: function () {
            if (this.enableClearButton) {
                domStyle.set(this.divExtraActions, 'display', 'inline-block');
            }
        },

        hideClearButton: function () {
            domStyle.set(this.divExtraActions, 'display', 'none');
        },

        doExportSQL: function () {
            domAttr.set(this.sqlImportExportDialogTitle, 'textContent', this.i18n.Labels.exportDialogTitle);
            this.sqlImportExportTextbox.set('disabled', true);
            this.sqlImportExportTextbox.set('value', this.queryBuilder.toSQL().sql);
            this.sqlImportExportDialog.show();
            domStyle.set(this.searchAdvancedImportDialogBtn, 'display', 'none');
        },

        doShowImportSQLDialog: function () {
            domAttr.set(this.sqlImportExportDialogTitle, 'textContent', this.i18n.Labels.importDialogTitle);
            this.sqlImportExportTextbox.set('disabled', false);
            this.sqlImportExportTextbox.set('value', '');
            this.sqlImportExportDialog.show();
            domStyle.set(this.searchAdvancedImportDialogBtn, 'display', 'block');
        },
        doImportSQL: function () {
            this.queryBuilder.fromSQL(this.sqlImportExportTextbox.get('value'));
            this.sqlImportExportDialog.hide();
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
            disp = (opts.identifiedFeature !== false) ? 'inline-block' : 'none';
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
            this.searchStopDrawingButtonDijit.set('disabled', true);
            this.btnSpatialSearch.set('disabled', true);
        },

        endDrawing: function (evt) {
            var clickMode = this.mapClickMode,
                geometry = null;

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
                    this.searchStopDrawingButtonDijit.set('disabled', false);
                } else {
                    this.doSpatialSearch();
                }
            }
        },

        stopDrawing: function () {
            this.cancelDrawing();
            this.connectMapClick();
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
            var symbol = null,
                graphic = null;
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
            var geometry = null,
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
        *  Miscellaneous Functions
        *******************************/

        resize: function (options) {
            if (options) {
                if (options.h) {
                    domGeom.setContentSize(this.containerNode, {
                        h: (options.h - 2)
                    });
                }
                if (this.parentWidget && options.action === 'undock') {
                    var dim = domGeom.getContentBox(this.parentWidget.containerNode);
                    var minSize = this.parentWidget.resizeOptions.minSize;
                    if (minSize) {
                        if (minSize.w && minSize.w > dim.w) {
                            domGeom.setContentSize(this.parentWidget.domNode, {
                                w: (minSize.w)
                            });
                        }
                    }
                }
            }
            this.tabContainer.resize();
        },

        geometryToJson: function (geom) {
            if (geom && geom.type && geom.toJson) {
                var type = geom.type;
                geom = geom.toJson();
                geom.type = type;
            }
            return geom;
        },

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
