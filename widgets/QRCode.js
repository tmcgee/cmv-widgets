define([
    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/topic',
    'dojo/aspect',
    'dojo/dom',
    'dojo/query',

    'esri/geometry/Point',

    'proj4js/proj4',

    'dojo/text!./QRCode/templates/QRCode.html',
    'dojo/i18n!./QRCode/nls/QRCode',

    './QRCode/qrcode.min',

    'dijit/form/RadioButton',
    'dijit/form/ToggleButton',

    'dojo/NodeList-traverse',

    'xstyle/css!./QRCode/css/QRCode.css'

], function (
    declare,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    array,
    html,
    topic,
    aspect,
    dom,
    query,

    Point,

    proj4,

    template,
    i18n
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'cmvQRCodeMapWidget',

        i18n: i18n,

        mapClickMode: null,
        point: null,

        // set the Lat/Lng from the map's center point when the map's extent is updated
        useMapCenter: true,

        // in case this changes some day
        proj4BaseURL: 'https://epsg.io/',

        //  options are ESRI, EPSG and SR-ORG
        // See http://spatialreference.org/ for more information
        proj4Catalog: 'EPSG',

        // if desired, you can load a projection file from your server
        // instead of using one from spatialreference.org
        // i.e., http://server/projections/102642.js
        projCustomURL: null,

        startup: function () {
            this.inherited(arguments);

            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));

            if (this.parentWidget) {
                if (this.parentWidget.toggleable) {
                    this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                        this.onLayoutChange(this.parentWidget.open);
                    })));
                }
            }

            var wkid = this.map.spatialReference.wkid;
            if (wkid === 102100) { // ESRI --> EPSG
                wkid = 3857;
            }
            var key = this.proj4Catalog + ':' + String(wkid);
            if (!proj4.defs[key]) {
                var url = this.proj4BaseURL + String(wkid) + '.js';
                require([url]);
            }

            this.qrCodeObj = new window.QRCode(this.qrCodeNode, {
                width: 128,
                height: 128
            });

            this.map.on('click', lang.hitch(this, 'onMapPoint'));
            if (this.useMapCenter) {
                this.map.on('extent-change', lang.hitch(this, 'onMapCenter'));
                if (this.map.extent) {
                    this.onMapCenter({
                        extent: this.map.extent
                    });
                }
            }
        },

        onMapPoint: function (evt) {
            if (this.mapClickMode === 'qr2go') {
                var mapPoint = evt.mapPoint;
                if (!mapPoint) {
                    return;
                }
                this.processPoint(mapPoint);
            }
        },

        onMapCenter: function (opts) {
            var extent = opts.extent;
            var centerPoint = extent.getCenter();
            this.processPoint(centerPoint);
        },

        onClose: function () {
            if (this.mapClickMode === 'qr2go') {
                this.connectMapClick();
            }
        },

        onLayoutChange: function (open) {
            if (!open) {
                this.onClose();
            }
        },

        placePoint: function () {
            if (this.QRCodeButtonDijit.get('checked')) {
                this.disconnectMapClick();
            } else {
                this.connectMapClick();
            }
        },

        processPoint: function (point) {
            this.point = this.convertCoordinates(point);
            this.generateQr();
        },

        generateQr: function () {
            this.qrCodeObj.clear(); // clear the code.
            if (!this.point || this.point.length !== 2) {
                return;
            }
            var x = this.point[0];
            var y = this.point[1];

            if (this.QRCodeGeoRadioDijit.get('checked')) {
                this.qrCodeObj.makeCode('geo://' + y + ',' + x);
            } else if (this.QRCodeAppleRadioDijit.get('checked')) {
                this.qrCodeObj.makeCode('maps://' + y + ',' + x);
            } else if (this.QRCodeTrek2ThereRadioDijit.get('checked')) {
                this.qrCodeObj.makeCode('arcgis-trek2there://?stop=' + y + ',' + x);
            } else if (this.QRCodeNavigatorRadioDijit.get('checked')) {
                this.qrCodeObj.makeCode('arcgis-navigator://?stop=' + y + ',' + x);
            }

        },

        convertCoordinates: function (mapPoint) {
            // convert the map point's coordinate system into lat/long
            var wkid = this.map.spatialReference.wkid;
            if (wkid === 102100) { // ESRI --> EPSG
                wkid = 3857;
            }
            var key = this.proj4Catalog + ':' + String(wkid);
            return proj4(proj4.defs[key]).inverse([mapPoint.x, mapPoint.y]);
        },

        disconnectMapClick: function () {
            this.QRCodeButtonDijit.set('checked', true);
            this.map.setMapCursor('crosshair');
            topic.publish('mapClickMode/setCurrent', 'qr2go');
        },

        connectMapClick: function () {
            this.QRCodeButtonDijit.set('checked', false);
            this.map.setMapCursor('auto');
            topic.publish('mapClickMode/setDefault');
        },


        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        }

    });
});