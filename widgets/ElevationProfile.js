define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom',
    'dojo/topic',
    'dojo/aspect',
    'dojo/_base/lang',
    'dijit/registry',
    'dijit/layout/ContentPane',

    'esri/dijit/ElevationProfile',
    'esri/toolbars/draw',
    'esri/symbols/CartographicLineSymbol',
    'esri/graphic',
    'esri/units',
    'esri/Color',

    'dojo/text!./ElevationProfile/templates/ElevationProfile.html',

    'dijit/form/Select',
    'dijit/form/Button',

    'xstyle/css!./ElevationProfile/css/ElevationProfile.css',
    'xstyle/css!./ElevationProfile/css/Draw.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    dom,
    topic,
    aspect,
    lang,
    registry,
    ContentPane,

    ElevationsProfileWidget,
    Draw,
    CartographicLineSymbol,
    Graphic,
    Units,
    Color,

    template
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'cmvElevationProfileWidget',

        toolbar: null,
        epWidget: null,
        lineSymbol: null,
        pane: null,

        measureUnit: Units.MILES,

        title: 'Elevation Profile',
        nodeID: 'profileChartNode',
        attributesContainerID: 'attributesContainer',

        profileOptions: {
            profileTaskUrl: 'https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer',
            scalebarUnits: Units.MILES,
            chartOptions: {
                title: null,
                chartTitleFontSize: 1,
                axisTitleFontSize: 11,
                axisLabelFontSize: 9,
                indicatorFontColor: '#eee',
                indicatorFillColor: '#666',
                titleFontColor: '#fff',
                axisFontColor: '#ccc',
                axisMajorTickColor: '#333',
                skyTopColor: '#B0E0E6',
                skyBottomColor: '#4682B4',
                waterLineColor: '#eee',
                waterTopColor: '#ADD8E6',
                waterBottomColor: '#0000FF',
                elevationLineColor: '#D2B48C',
                elevationTopColor: '#8B4513',
                elevationBottomColor: '#CD853F'
            }
        },

        postCreate: function () {
            this.inherited(arguments);

            if (this.parentWidget) {
                if (this.parentWidget.toggleable) {
                    this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                        this.onLayoutChange(this.parentWidget.open);
                    })));
                }
            }
            this.unitsSelect.set('value', this.measureUnit);

            this.lineSymbol = new CartographicLineSymbol(
                CartographicLineSymbol.STYLE_SOLID,
                new Color([255, 0, 0]), 2,
                CartographicLineSymbol.CAP_ROUND,
                CartographicLineSymbol.JOIN_MITER, 2
            );

            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
        },

        initElevation: function () {
            if (!this.tableWidget) {
                this.tableWidget = registry.byId(this.attributesContainerID + '_widget');
            }

            if (!this.tableWidget) {
                topic.publish('viewer/handleError', {
                    error: 'Elevation Profile: The Attributes Table widget could not be found.'
                });
                return;
            }

            //open the bottom pane
            topic.publish(this.attributesContainerID + '/openPane');

            var tabs = null;

            if (!this.pane) {
                this.pane = new ContentPane({
                    title: this.title,
                    closable: false,
                    content: '<div id="' + this.nodeID + '"></div>'
                });
                tabs = this.tableWidget.tabContainer;
                tabs.addChild(this.pane);
            }

            if (!this.epWidget) {
                //Chart options
                var profileOptions = this.profileOptions;
                profileOptions.map = this.map;
                profileOptions.chartOptions.title = profileOptions.chartOptions.title || this.title;

                this.epWidget = new ElevationsProfileWidget(profileOptions, dom.byId(this.nodeID));
                this.epWidget.on('error', function (event) {
                    topic.publish('elevationProfile/error', {
                        event: event
                    });
                });
                this.epWidget.startup();

                topic.publish('elevationProfile/init', {
                    widget: this
                });
            } else {
                this.epWidget.clearProfile(); //Clear profile
            }

            if (!this.toolbar) {
                this.toolbar = new Draw(this.map);
                this.toolbar.on('draw-end', lang.hitch(this, 'addGraphic'));
            }

            tabs = this.tableWidget.tabContainer;
            tabs.selectChild(this.pane);

            this.btnClear.set('disabled', false);
            this.map.graphics.clear();
            this.map.disableMapNavigation();
            this.disconnectMapClick();
        },

        addGraphic: function (evt) {
            //deactivate the toolbar and clear existing graphics
            this.toolbar.deactivate();
            this.connectMapClick();
            this.map.enableMapNavigation();
            var symbol = this.lineSymbol;
            this.map.graphics.add(new Graphic(evt.geometry, symbol));
            this.epWidget.set('profileGeometry', evt.geometry);
            this.epWidget.set('measureUnits', this.measureUnit);
            this.btnClear.set('disabled', false);
        },

        onUnitChange: function (newValue) {
            this.measureUnit = newValue.toString();
        },

        onPolyline: function () {
            this.initElevation();
            this.toolbar.activate('polyline');
        },

        onFreehandPolyline: function () {
            this.initElevation();
            this.toolbar.activate('freehandpolyline');
        },

        onLayoutChange: function () {
            topic.publish('elevationProfile/layoutChange', {
                open: open
            });
        },

        onClear: function () {
            this.clearProfile();
        },

        clearProfile: function () {
            if (this.toolbar) {
                this.toolbar.deactivate();
            }
            if (this.epWidget) {
                this.epWidget.clearProfile();
            }
            this.map.setMapCursor('default');
            this.map.graphics.clear();
            this.btnClear.set('disabled', true);

            this.connectMapClick();
            this.map.enableMapNavigation();

            topic.publish('elevationProfile/clear', {
                widget: this
            });
        },

        disconnectMapClick: function () {
            topic.publish('mapClickMode/setCurrent', 'elevationProfile');
        },

        connectMapClick: function () {
            if (this.mapClickMode === 'elevationProfile') {
                topic.publish('mapClickMode/setDefault');
            }
        },

        setMapClickMode: function (mode) {
            if (mode !== 'elevationProfile') {
                if (this.toolbar && this.toolbar.activated) {
                    this.disconnectMapClick();
                    return;
                }
            }
            this.mapClickMode = mode;
        }
    });
});