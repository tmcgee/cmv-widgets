define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/aspect',
    'dojo/topic',
    'dojo/number',
    'dojo/dom-style',

    'dijit/registry',

    'esri/graphic',
    'esri/tasks/FeatureSet',
    'esri/dijit/Popup',

    'dijit/form/Button',

    //template
    'dojo/text!./IdentifyPanel/templates/IdentifyPanel.html',

    //i18n
    'dojo/i18n!./IdentifyPanel/nls/IdentifyPanel',

    // css
    'xstyle/css!./IdentifyPanel/css/IdentifyPanel.css',

    'dijit/layout/ContentPane'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    array,
    on,
    aspect,
    topic,
    num,
    domStyle,

    registry,

    Graphic,
    FeatureSet,
    Popup,

    Button,

    template,
    i18n
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        i18n: i18n,
        baseClass: 'cmvIdentifyPanelWidget',

        map: null,

        buttons: [],
        defaultButtons: [
            {
                id: 'identifypanel-button-zoom',
                label: i18n.Buttons.zoomToFeature.label,
                iconClass: 'fa fa-fw fa-search',
                className: 'identifypanel-button-zoom',
                showLabel: false,
                onClick: 'zoomToFeature'
            },
            {
                id: 'identifypanel-button-export',
                label: i18n.Buttons.exportFeature.label,
                iconClass: 'fa fa-fw fa-download',
                className: 'identifypanel-button-export',
                showLabel: false,
                onClick: 'exportFeature'
            }
        ],
        includeDefaultButtons: true,
        showNavigationButtons: true,

        noInfoTimeout: 5000,

        infoWindowOptions: {},
        defaultInfoWindowOptions: {
            highlight: true,
            keepHighlightOnHide: true,
            popupWindow: false,
            hideDelay: 10,
            visibleWhenEmpty: false,
            anchor: 'right',
            offsetX: -99999,
            offsetY: -99999
        },

        exportOptions: {},
        defaultExportOptions: {
            excel: true,
            csv: true,
            xlsExcel: false,
            geojson: true,
            kml: true,
            kmz: true,
            shapefile: true,
            topojson: true,
            wkt: true,

            defaultExportType: 'shapefile',
            // this option can be a string or a function that returns
            // a string.
            //
            // filename: 'my_results'
            filename: function () {
                var date = new Date();
                return 'identified_feature_' + date.toLocaleDateString();
            },

            geojsonOptions: {
                simplestyle: true // mapbox styles
            },

            kmlOptions: {
                name: null,
                description: null,
                documentName: 'Identified Feature',
                documentDescription: 'Identified Feature',
                simplestyle: true, // mapbox styles converted to KML Styles
                extendedData: true
            },

            shapefileOptions: {
                folder: 'layers',
                types: {
                    point: 'points',
                    polygon: 'polygons',
                    polyline: 'polylines'
                }
            }
        },

        featureCount: 0,
        featureIndex: 0,

        postCreate: function () {
            this.inherited(arguments);

            this.initParentWidget();
            this.initInfoWindow();
            this.initButtons();

            this.exportOptions = this.mixinDeep(this.defaultExportOptions, this.exportOptions);

            this.own(topic.subscribe('identify/execute', lang.hitch(this, 'onIdentifyExecute')));
            this.own(topic.subscribe('identify/results', lang.hitch(this, 'onIdentifyResults')));
            this.own(topic.subscribe('identify/error', lang.hitch(this, 'onIdentifyError')));
        },

        initParentWidget: function () {
            if (typeof this.parentWidget === 'string') {
                this.parentWidget = registry.byId(this.parentWidget);
            }

            if (this.parentWidget && this.parentWidget.toggleable) {
                this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, 'toggleFeatureHighlight')));
            }
        },

        initInfoWindow: function () {
            this.defaultInfoWindowOptions.map = this.map;
            var options = this.mixinDeep(this.defaultInfoWindowOptions, this.infoWindowOptions);
            this.infoWindow = new Popup(options, document.createElement('div'));
            if (options.highlight) {
                this.infoWindow.enableHighlight(this.map);
            }

            // when the selection changes update the side panel to display the popup info for the
            // currently selected feature.
            this.infoWindow.on('selection-change', lang.hitch(this, 'onSelectionChanged'));

            // When features are associated with the  map's info window update the panel with the new content.
            this.infoWindow.on('set-features', lang.hitch(this, 'onSetFeatures'));

            // make sure the map's info window is always out of the way.
            this.map.infoWindow.set('highlight', false);
            this.map.infoWindow.set('anchor', 'right');
            this.map.infoWindow.set('offsetX', -99999);
            this.map.infoWindow.set('offsetY', -99999);

        },

        initButtons: function () {
            var btns = this.buttons;
            if (this.includeDefaultButtons) {
                btns = this.defaultButtons.concat(btns);
            }

            this.buttons = [];
            array.forEach(btns, lang.hitch(this, function (btn) {
                this.buttons.push(this.addActionButton(btn));
            }));

            if (!this.showNavigationButtons) {
                domStyle.set(this.navigationButtonsNode, 'display', 'none');
            }

            if (this.buttons.length <= 0 && !this.showNavigationButtons) {
                domStyle.set(this.actionsPaneNode, 'display', 'none');
            }

            var btnActions = ['add', 'remove', 'show', 'hide', 'enable', 'disable', 'hideAll', 'showAll'];
            array.forEach(btnActions, lang.hitch(this, function (action) {
                this.own(topic.subscribe('identifyPanel/' + action + 'ActionButton', lang.hitch(this, action + 'ActionButton')));
            }));
        },

        displayPopupContent: function (feature) {
            if (!this.allowPopup) {
                this.infoWindow.hide();
            }
            this.popupContentNode.set('content', null);
            if (feature) {
                var content = feature.getContent();
                this.popupContentNode.set('content', content);
                domStyle.set(this.instructionsNode, 'display', 'none');
                domStyle.set(this.popupNode, 'display', 'block');
                domStyle.set(this.loadingNode, 'display', 'none');
                this.featureIndex = this.infoWindow.selectedIndex;
                this.checkNavigationButtons();
                this.setTitle();

                if (this.parentWidget && this.parentWidget.set) {
                    this.parentWidget.set('open', true);
                }

            } else {
                domStyle.set(this.instructionsNode, 'display', 'block');
                domStyle.set(this.popupNode, 'display', 'none');
            }
        },

        selectFirstFeature: function () {
            this.selectFeature(0);
        },

        selectPreviousFeature: function () {
            this.selectFeature(this.featureIndex - 1);
        },

        selectNextFeature: function () {
            this.selectFeature(this.featureIndex + 1);
        },

        selectLastFeature: function () {
            this.selectFeature(this.featureCount - 1);
        },

        selectFeature: function (idx) {
            this.featureIndex = idx || 0;
            if (this.featureIndex < 0) {
                this.featureIndex = 0;
            } else if (this.featureIndex >= this.featureCount) {
                this.featureIndex = this.featureCount - 1;
            }
            if (this.featureCount < 1) {
                domStyle.set(this.noInfoNode, 'display', 'block');
            }
            domStyle.set(this.loadingNode, 'display', 'none');
            this.infoWindow.select(this.featureIndex);
            this.infoWindow.showHighlight();
            this.map.infoWindow.hideHighlight();
            this.checkNavigationButtons();
        },

        clearFeatures: function () {
            domStyle.set(this.instructionsNode, 'display', 'block');
            domStyle.set(this.loadingNode, 'display', 'none');
            domStyle.set(this.noInfoNode, 'display', 'none');
            domStyle.set(this.titleNode, 'display', 'none');
            domStyle.set(this.popupNode, 'display', 'none');
            this.popupContentNode.set('content', null);
            this.infoWindow.hideHighlight();
        },

        toggleFeatureHighlight: function () {
            if (this.parentWidget) {
                if (!this.parentWidget.get('open')) {
                    this.infoWindow.hideHighlight();
                } else if (this.infoWindow.features && this.infoWindow.features.length > 0) {
                    this.infoWindow.showHighlight();
                } else {
                    this.infoWindow.hideHighlight();
                }
            }
        },

        onIdentifyExecute: function (args) {
            this.clearFeatures();
            window.clearTimeout(this.hideTimeout);
            if (args.identifies && args.identifies.length > 0) {
                domStyle.set(this.instructionsNode, 'display', 'none');
                domStyle.set(this.loadingNode, 'display', 'block');
            } else if (args.event && args.event.graphic) {
                this.infoWindow.setFeatures([args.event.graphic]);
            }
            if (this.parentWidget && this.parentWidget.set) {
                this.parentWidget.set('open', true);
            }
        },

        onIdentifyResults: function (args) {
            var features = args.features;
            if (features && features.length > 0) {
                this.infoWindow.setFeatures(features);
            } else {
                this.showNoResults();
            }
        },

        onIdentifyError: function (/* args */) {
            this.showNoResults();
        },

        onSelectionChanged: function () {
            this.displayPopupContent(this.infoWindow.getSelectedFeature());
        },

        onSetFeatures: function () {
            this.featureCount = this.infoWindow.features ? this.infoWindow.features.length : 0;
            this.selectFeature(0);
        },

        showNoResults: function () {
            this.clearFeatures();
            domStyle.set(this.instructionsNode, 'display', 'none');
            domStyle.set(this.loadingNode, 'display', 'none');
            domStyle.set(this.noInfoNode, 'display', 'block');
            window.clearTimeout(this.hideTimeout);
            this.hideTimeout = window.setTimeout(lang.hitch(this, 'clearFeatures'), this.noInfoTimeout);
        },

        setTitle: function () {
            var html = i18n.Labels.feature + ' ' + num.format(this.featureIndex + 1) + ' of ' + num.format(this.featureCount);
            this.featureNode.innerHTML = html;
            domStyle.set(this.titleNode, 'display', 'block');
        },

        checkNavigationButtons: function () {
            this.btnFirstFeature.set('disabled', this.featureIndex === 0);
            this.btnPreviousFeature.set('disabled', this.featureIndex === 0);
            this.btnNextFeature.set('disabled', (this.featureIndex >= (this.featureCount - 1)));
            this.btnLastFeature.set('disabled', (this.featureIndex >= (this.featureCount - 1)));
        },

        addActionButton: function (options) {
            options.className = (options.className ? options.className : '') + ' identifypanel-button';
            if (typeof options.onClick === 'string') {
                options.onClick = lang.hitch(this, options.onClick);
            }
            var btn = new Button(options);
            btn.placeAt(this.actionButtonsNode);
            btn.startup();
            return btn;
        },

        removeActionButton: function (btn) {
            if (typeof btn === 'string') {
                btn = registry.byId(btn);
            }
            if (btn && btn.destroy) {
                btn.destroy();
            }
        },

        showActionButton: function (btn) {
            if (typeof btn === 'string') {
                btn = registry.byId(btn);
            }
            if (btn && btn.domNode) {
                domStyle.set(btn.domNode, 'display', 'inline-block');
            }
        },

        hideActionButton: function (btn) {
            if (typeof btn === 'string') {
                btn = registry.byId(btn);
            }
            if (btn && btn.domNode) {
                domStyle.set(btn.domNode, 'display', 'none');
            }
        },

        enableActionButton: function (btn) {
            if (typeof btn === 'string') {
                btn = registry.byId(btn);
            }
            if (btn && btn.set) {
                btn.set('disabled', false);
            }
        },

        disableActionButton: function (btn) {
            if (typeof btn === 'string') {
                btn = registry.byId(btn);
            }
            if (btn && btn.set) {
                btn.set('disabled', true);
            }
        },

        showAllActionButton: function () {
            array.forEach(this.buttons, function (btn) {
                if (btn && btn.domNode) {
                    var isDefault = btn.get('defaultButton');
                    if (isDefault !== false) {
                        domStyle.set(btn.domNode, 'display', 'inline-block');
                    }
                }
            });
        },

        hideAllActionButton: function () {
            array.forEach(this.buttons, function (btn) {
                if (btn && btn.domNode) {
                    var isDefault = btn.get('defaultButton');
                    if (isDefault !== false) {
                        domStyle.set(btn.domNode, 'display', 'none');
                    }
                }
            });
        },

        zoomToFeature: function (evt) {
            this.infoWindow._zoomToFeature(evt);
        },

        exportFeature: function () {
            var feature = this.infoWindow.getSelectedFeature();
            if (feature) {
                var featureSet = new FeatureSet();
                featureSet.features = [];
                var geometry = lang.clone(feature.geometry);
                var attributes = lang.clone(feature.attributes);
                featureSet.features.push(new Graphic(geometry, null, attributes));

                var exportOpts = this.exportOptions;
                exportOpts.featureSet = featureSet;
                exportOpts.show = true; // must be true
                topic.publish('exportWidget/openDialog', exportOpts);
            }

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