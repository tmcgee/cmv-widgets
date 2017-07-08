define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/dom-style',
    'dojo/dom-construct',
    'dojo/number',
    'dojo/aspect',

    'esri/geometry/Point',

    'proj4js/proj4',

    'dojo/text!./OpenExternalMap/templates/OpenExternalMap.html',

    'dojo/i18n!./OpenExternalMap/nls/resource',

    'gis/plugins/Google',

    'dijit/form/Button',
    'dijit/form/ToggleButton',

    'xstyle/css!./OpenExternalMap/css/OpenExternalMap.css'
], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    array,
    topic,
    domStyle,
    domConstruct,
    number,
    aspect,

    Point,

    proj4,

    template,

    i18n,

    GoogleMapsLoader,

    Button
) {
    var google = null;
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        i18n: i18n,
        mapClickMode: null,

        // the map providers and buttons  to include
        mapProviders: [
            {
                name: 'Google Maps',
                buttons: [
                    {
                        label: 'Hybrid Map',
                        iconClass: 'fa fa-google fa-fw',
                        url: 'https://www.google.com/maps/place/@{lat},{lng},{zoom}z/data=!3m1!1e3' //https://www.google.com/maps/@{lat},{lng},1000a,20y,0t/data=!3m1!1e3'
                    },
                    {
                        label: 'StreetView',
                        iconClass: 'fa fa-street-view fa-fw',
                        isStreetView: true,
                        url: 'https://maps.google.com/maps?q=&layer=c&cbll={lat},{lng}'
                    }
                ]
            },
            {
                name: 'Bing Maps',
                buttons: [
                    {
                        label: 'Hybrid Map',
                        iconClass: 'fa fa-windows fa-fw',
                        url: 'https://www.bing.com/maps?cp={lat}~{lng}&lvl={zoom}&sstyle=h'
                    },
                    {
                        label: 'Bird\'s Eye',
                        iconClass: 'fa fa-building fa-fw',
                        url: 'https://bing.com/maps/?cp={lat}~{lng}&style=o'
                    },
                    {
                        label: 'Streetside',
                        iconClass: 'fa fa-street-view fa-fw',
                        url: 'https://bing.com/maps/?cp={lat}~{lng}&lvl=19&dir=113.8911&pi=-0.284&style=x&v=2&sV=1'
                    }
                ]
            },
            {
                name: 'Other Maps',
                buttons: [
                    {
                        label: 'MapQuest',
                        iconClass: 'fa fa-globe fa-fw',
                        url: 'https://www.mapquest.com/map?q={lat},{lng}&zoom={zoom}&maptype=hybrid'
                    },
                    {
                        label: 'OpenStreetMap',
                        iconClass: 'fa fa-globe fa-fw',
                        url: 'http://www.openstreetmap.org/?lat={lat}&lon={lng}&zoom={zoom}'
                    }
                ]
            }
        ],

        // group the providers by their name, otherwise group all buttons together
        groupProviders: true,

        // set the Lat/Lng from the map's center point when the map's extent is updated
        useMapCenter: true,

        // Show coordinate in Degrees, Minutes and Seconds
        showDMS: true,

        // conversion factor for DMS
        unitScale: 2,

        // is street view available at the coordinates
        streetViewAvailable: false,

        // not currently implemented
        useEmbeddedWindow: false,

        // in case this changes some day
        proj4BaseURL: 'https://epsg.io/',

        //  options are ESRI, EPSG and SR-ORG
        // See http://spatialreference.org/ for more information
        proj4Catalog: 'EPSG',

        // if desired, you can load a projection file from your server
        // instead of using one from spatialreference.org
        // i.e., http://server/projections/102642.js
        projCustomURL: null,

        _mapButtons: [],

        postCreate: function () {
            this.inherited(arguments);

            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));

            if (this.parentWidget) {
                if (this.parentWidget.toggleable) {
                    this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                        this.onLayoutChange(this.parentWidget.open);
                    })));
                }
            }

            //load the google api asynchronously
            GoogleMapsLoader.load(lang.hitch(this, function (g) {
                //store a reference to google
                google = g;
            }));

            var wkid = this.map.spatialReference.wkid;
            if (wkid === 102100) { // ESRI --> EPSG
                wkid = 3857;
            }
            var key = this.proj4Catalog + ':' + String(wkid);
            if (!proj4.defs[key]) {
                var url = this.proj4BaseURL + String(wkid) + '.js';
                require([url]);
            }

            this.addProviders();

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

        addProviders: function () {
            var btnContainer = null,
                btn = null,
                providerClass = null,
                buttonsClass = null,
                buttonClass = null;
            if (!this.groupProviders) {
                btnContainer = domConstruct.create('div', {
                    class: 'externalMapButtons'
                }, this.providerContainer);
            }
            array.forEach(this.mapProviders, lang.hitch(this, function (provider) {
                if (this.groupProviders) {
                    if (provider.name) {
                        providerClass = 'mapLabel-' + provider.name.replace(' ', '-').toLowerCase();
                        domConstruct.create('div', {
                            class: 'mapLabel ' + providerClass,
                            innerHTML: provider.name
                        }, this.providerContainer);
                    }

                    buttonsClass = 'mapButtons-' + provider.name.replace(' ', '-').toLowerCase();
                    btnContainer = domConstruct.create('div', {
                        class: 'mapButtons ' + buttonsClass
                    }, this.providerContainer);
                }

                array.forEach(provider.buttons, lang.hitch(this, function (button) {
                    providerClass = (provider.name) ? 'mapButton-' + provider.name.replace(' ', '-').toLowerCase() : '';
                    buttonClass = ((providerClass.length > 0) ? providerClass : 'mapButton') + '-' + button.label.replace(' ', '-').toLowerCase();
                    btn = new Button({
                        label: button.label,
                        class: 'mapButton ' + buttonClass + ' ' + providerClass,
                        iconClass: button.iconClass
                    });
                    btn.on('click', lang.hitch(this, 'openMap', button));
                    btn.startup();
                    btn.set('disabled', true);
                    btn.placeAt(btnContainer, 'last');
                    this._mapButtons.push(btn);
                }));
            }));
        },

        onMapPoint: function (evt) {
            if (this.mapClickMode === 'externalmap') {
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
            if (this.mapClickMode === 'externalmap') {
                this.connectMapClick();
            }
        },

        onLayoutChange: function (open) {
            if (!open) {
                this.onClose();
            }
        },

        placePoint: function () {
            if (this.OEMapButtonDijit.get('checked')) {
                this.disconnectMapClick();
            } else {
                this.connectMapClick();
            }
        },

        disconnectMapClick: function () {
            this.OEMapButtonDijit.set('checked', true);
            this.map.setMapCursor('crosshair');
            topic.publish('mapClickMode/setCurrent', 'externalmap');
        },

        connectMapClick: function () {
            this.OEMapButtonDijit.set('checked', false);
            if (this.mapClickMode === 'externalmap') {
                this.map.setMapCursor('auto');
                topic.publish('mapClickMode/setDefault');
            }
        },

        processPoint: function (point) {
            var latLng = this.convertCoordinates(point);
            this.checkStreetView(latLng);

            this.OEMapLatitudeDijit.set('value', latLng[1].toFixed(6));
            this.OEMapLongitudeDijit.set('value', latLng[0].toFixed(6));
            window.setTimeout(lang.hitch(this, 'connectMapClick'), 100);

            this.checkButtons();
        },

        openMap: function (button) {
            if (!this.checkCoordinates(button)) {
                return;
            }
            var lat = this.OEMapLatitudeDijit.get('value');
            var lng = this.OEMapLongitudeDijit.get('value');
            var zoom = '';
            if (this.map.spatialReference.wkid === 102100) {
                zoom = this.map.getLevel();
            }
            var url = lang.replace(button.url, {
                lat: lat,
                lng: lng,
                zoom: zoom
            });

            if (this.useEmbeddedWindow) {
                // do something here with floating window
            } else {
                window.open(url);
            }
        },

        checkCoordinates: function (button) {
            if (!this.validateCoordinates('lat')) {
                topic.publish('growler/growl', {
                    title: button.label,
                    message: i18n.latitudeInvalid,
                    level: 'error',
                    timeout: 3000
                });
                return false;
            }

            if (!this.validateCoordinates('lng')) {
                topic.publish('growler/growl', {
                    title: button.label,
                    message: i18n.longitudeInvalid,
                    level: 'error',
                    timeout: 3000
                });
                return false;
            }

            if (button.isStreetView && !this.streetViewAvailable) {
                topic.publish('growler/growl', {
                    title: button.label,
                    message: i18n.streetViewNotAvailable,
                    level: 'error',
                    timeout: 3000
                });
                return false;
            }

            return true;

        },

        validateCoordinates: function (checkOne) {
            var lat = this.OEMapLatitudeDijit.get('value');
            if (checkOne === 'lat' || !checkOne) {
                if (lat === '' || isNaN(lat) || lat < -85.05 || lat > 85.05) {
                    return false;
                }
            }

            var lng = this.OEMapLongitudeDijit.get('value');
            if (checkOne === 'lng' || !checkOne) {
                if (lng === '' || isNaN(lng) || lng < -180 || lng > 180) {
                    return false;
                }
            }

            return true;
        },

        checkStreetView: function (latLng) {
            /*
                Only check for availability of street view if a key is provided.
                Currently, there is not a reliable method to check that the key is valid.
            */
            if (!GoogleMapsLoader.KEY || !google) {
                this.streetViewAvailable = true;
                return;
            }

            this.streetViewAvailable = false;
            if (!this.panoramaService) {
                this.panoramaService = new google.maps.StreetViewService();
            }
            if (google) {
                var googlePt = new google.maps.LatLng(latLng[1], latLng[0]);
                this.panoramaService.getPanoramaByLocation(googlePt, 50, lang.hitch(this, function (geoPt, res) {
                    this.streetViewAvailable = (res === google.maps.StreetViewStatus.OK);
                }));
            }
        },

        checkButtons: function () {
            var valid = this.validateCoordinates();
            array.forEach(this._mapButtons, function (button) {
                button.set('disabled', !valid);
            });
        },

        latitudeChanged: function () {
            var valid = this.validateCoordinates('lat'), dms = '';
            if (valid && this.showDMS) {
                var val = this.OEMapLatitudeDijit.get('value');
                dms = this.decToDMS(val, true);
            }
            this.OEMapLatitudeDMSDijit.innerHTML = dms;
            this.checkButtons();
        },

        longitudeChanged: function () {
            var valid = this.validateCoordinates('lng'), dms = '';
            if (valid && this.showDMS) {
                var val = this.OEMapLongitudeDijit.get('value');
                dms = this.decToDMS(val, false);
            }
            this.OEMapLongitudeDMSDijit.innerHTML = dms;
            this.checkButtons();
        },

        decToDMS: function (l, lat) {
            var dir = '?',
                abs = Math.abs(l),
                deg = parseInt(abs, 10),
                min = (abs - deg) * 60,
                minInt = parseInt(min, 10),
                sec = number.round((min - minInt) * 60, this.unitScale),
                minIntTxt = (minInt < 10) ? '0' + minInt : minInt,
                secTxt = (sec < 10) ? '0' + sec : sec;

            if (lat) {
                dir = (l > 0) ? 'N' : 'S';
            } else {
                dir = (l > 0) ? 'E' : 'W';
            }

            return deg + '&deg;&nbsp;' + minIntTxt + '\'&nbsp;' + secTxt + '"&nbsp;' + dir;
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

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        }
    });
});