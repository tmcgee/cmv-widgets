define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'gis/dijit/_FloatingWidgetMixin',

    'dojo/_base/lang',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/json',
    'dojo/string',
    'dojo/keys',
    'dojo/on',
    'dojo/query',
    'dojo/dom-style',
    'module',

    'esri/geometry/Point',
    'esri/SpatialReference',
    'esri/request',

    'dojo/text!./Export/templates/Export.html',

    //i18n
    'dojo/i18n!./Export/nls/Export',

    //template widgets
    'dijit/_Container',
    'dijit/form/Select',
    'dijit/form/TextBox',
    'dijit/form/Button',

    'xstyle/css!./Export/css/Export.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _FloatingWidgetMixin,

    lang,
    topic,
    array,
    json,
    string,
    keys,
    on,
    domQuery,
    domStyle,
    module,

    Point,
    SpatialReference,
    request,

    template,

    i18n
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _FloatingWidgetMixin], {
        widgetsInTemplate: true,
        templateString: template,
        title: 'Export',
        draggable: false,
        baseClass: 'cmvExportWidget',

        // i18n
        i18n: i18n,

        topicID: 'exportWidget',
        modulesPath: module.uri.substring(0, module.uri.lastIndexOf('.')) + '/lib',

        defaultOptions: {
            excel: true, // allow attributes to be exported to Excel
            xlsExcel: false, // allow attributes to be exported to Excel (XLS format)
            csv: true, // allow attributes to be exported to CSV

            // spatial exports
            shapefile: false, // allow the features to be exported to a Shape File
            kml: false, // allow features to be exported to KML
            kmz: false, // allow features to be exported to KMZ
            geojson: false, // allow features to be exported to GeoJSON
            topojson: false, // allow features to be exported to TopoJSON
            wkt: false, // allow features to be exported to WKT

            filename: 'results', // name of file for export

            defaultExportType: 'excel',

            geojsonOptions: {
                'simplestyle': true // mapbox styles
            },

            kmlOptions: {
                'name': 'name',
                'description': 'description',
                'documentName': 'CMV Export',
                'documentDescription': 'KML Exported from CMV',
                'simplestyle': true, // mapbox styles converted to KML Styles
                'extendedData': true,
                'styleAttributes': null
            },

            shapefileOptions: {
                'types': {
                    'point': 'points',
                    'polygon': 'polygons',
                    'polyline': 'polylines'
                }
            },

            topojsonOptions: {
                'verbose': false, // if truthy, informational messages will be output to stderr.
                'coordinate-system': null, // either "cartesian", "spherical" or null to infer the coordinate system automatically.
                'stitch-poles': false // if truthy and using spherical coordinates, polar antimeridian cuts will be stitched.
                //'quantization': null,         // quantization precision; the maximum number of differentiable points per dimension.
                //'id': null                   // a function for computing the id of each input feature.
                //'property-transform': null    // a function for remapping properties.
            }
        },

        // featureSet to export
        featureSet: null,

        // query results to export
        results: null,

        // optional grid if you want to export only visible columns and use column names
        grid: null,

        // for projecting data
        proj4BaseURL: 'https://epsg.io/',
        proj4Catalog: 'EPSG',
        proj4SrcWkid: 3857,
        proj4SrcKey: 'EPSG:3857',
        proj4DestWkid: 4326,
        proj4DestKey: 'EPSG:4326',
        proj4DestWKT: null,

        postCreate: function () {
            this.inherited(arguments);
            this.parentWidget.draggable = this.draggable;

            this.addTopics();
            this.setExportDefaults();
            this.initExportSelect();
            this.onWkidChange(this.inputWkid.get('value'));
            this.own(on(this.inputWkid, 'keyup', lang.hitch(this, 'wkidOnKeyUp')));

            window.setTimeout(lang.hitch(this, 'loadParsers'), 1000);
        },

        addTopics: function () {
            this.own(topic.subscribe(this.topicID + '/openDialog', lang.hitch(this, 'openDialog')));
            this.own(topic.subscribe(this.topicID + '/export', lang.hitch(this, 'export')));
        },

        onOpen: function () {
            //  Make sure the content is visible when the dialog
            //  is shown/opened. Something like this may be needed
            //  for all floating windows that don't open on startup?
            this.containerNode.resize();
        },

        // setup the export selection dialog with the appropriate options
        initExportSelect: function () {
            // attempt reloads in case the options have changed.
            this.loadXLSXParser();
            this.loadFeatureParser();

            var options = [];
            var exportOptions = [
                {
                    'value': 'excel',
                    'label': i18n.exportToExcel,
                    'type': 'attributes'
                },
                {
                    'value': 'xlsExcel',
                    'label': i18n.exportToXlsExcel,
                    'type': 'attributes'
                },
                {
                    'value': 'csv',
                    'label': i18n.exportToCSV,
                    'type': 'attributes'
                },

                {
                    'value': 'shapefile',
                    'label': i18n.exportToShapeFile,
                    'type': 'features'
                },
                {
                    'value': 'kml',
                    'label': i18n.exportToKML,
                    'type': 'features'
                },
                {
                    'value': 'kmz',
                    'label': i18n.exportToKMZ,
                    'type': 'features'
                },
                {
                    'value': 'geojson',
                    'label': i18n.exportToGeoJSON,
                    'type': 'features'
                },
                {
                    'value': 'topojson',
                    'label': i18n.exportToTopoJSON,
                    'type': 'features'
                },
                {
                    'value': 'wkt',
                    'label': i18n.exportToWKT,
                    'type': 'features'
                }
            ];

            this.selectExportType.set('options', []);

            array.forEach(exportOptions, lang.hitch(this, function (option) {
                // do we have attributes to export?
                if (option.type === 'attributes') {
                    if (!this.grid) {
                        if (!this.featureSet || !this.featureSet.features || this.featureSet.features.length < 0) {
                            return;
                        }
                    }
                }

                // do we have features to export?
                if (option.type === 'features') {
                    if (!this.featureSet || !this.featureSet.features || this.featureSet.features.length < 0) {
                        return;
                    }
                }

                if (this[option.value] === true) {
                    options.push(option);
                }
            }));

            if (options.length > 0) {
                this.selectExportType.set('options', options);
                this.selectExportType.set('value', this.defaultExportType || options[0].value);
                this.btnExport.set('disabled', false);
            }

        },

        onExportTypeChange: function (type) {
            if (type === 'shapefile' || type === 'wkt') {
                this.inputWkid.set('disabled', false);
                domStyle.set(this.divWkidSection, 'display', 'block');
            } else {
                domStyle.set(this.divWkidSection, 'display', 'none');
                this.inputWkid.set('disabled', true);
            }
            this.resetWkid();
            this.removeLink();
            this.btnExport.set('disabled', false);
        },

        onWkidChange: function () {
            var wkid = this.inputWkid.get('value');
            this.removeLink();
            if (wkid && !isNaN(wkid) && wkid.length > 3) {
                wkid = parseInt(wkid, 10);
                if (wkid === 102100) { // ESRI --> EPSG
                    wkid = 3857;
                }

                var key = this.proj4Catalog + ':' + String(wkid);
                if (window.proj4 && !window.proj4.defs[key]) {
                    require([this.proj4BaseURL + String(wkid) + '.js']);
                }

                require(['dojo/text!' + this.proj4BaseURL + String(wkid) + '.esriwkt'], lang.hitch(this, function (prj) {
                    if (wkid !== 4326) {
                        this.proj4DestWKT = prj;
                    }
                    this.proj4DestWkid = wkid;
                    this.proj4DestKey = this.proj4Catalog + ':' + String(wkid);
                    this.divWkidText.innerHTML = prj.split(',').join(', ');
                    domStyle.set(this.divWkidTextSection, 'display', 'block');
                    this.btnExport.set('disabled', false);
                }));
            }
        },

        wkidOnKeyUp: function () {
            var wkid = this.inputWkid.get('value');
            if (wkid && !isNaN(wkid) && wkid.length > 3) {
                wkid = parseInt(wkid, 10);
                if (wkid === 102100) { // ESRI --> EPSG
                    wkid = 3857;
                }
                if (wkid === this.proj4DestWkid) {
                    return;
                }
            }

            if (this.wkidChangeTimeoutID) {
                window.clearTimeout(this.wkidChangeTimeoutID);
            }
            this.proj4DestWkid = null;
            this.proj4DestKey = null;
            this.proj4DestWKT = null;

            this.divWkidText.innerHTML = '';
            this.btnExport.set('disabled', true);
            domStyle.set(this.divWkidTextSection, 'display', 'none');

            this.wkidChangeTimeoutID = window.setTimeout(lang.hitch(this, 'onWkidChange'), 200);
        },

        resetWkid: function () {
            this.proj4DestWkid = 4326;
            this.proj4DestKey = 'EPSG:4326';
            this.proj4DestWKT = null;
        },

        openDialog: function (options) {
            this.getExportDefaults();
            this.featureSet = options.featureSet;
            this.results = options.results;
            this.grid = options.grid;

            this.filename = (typeof options.filename !== 'undefined') ? options.filename : this.filename;

            this.excel = (typeof options.excel !== 'undefined') ? options.excel : this.excel;
            this.csv = (typeof options.csv !== 'undefined') ? options.csv : this.csv;
            this.xlsExcel = (typeof options.xlsExcel !== 'undefined') ? options.xlsExcel : this.xslExcel;

            this.geojson = (typeof options.geojson !== 'undefined') ? options.geojson : this.geojson;
            this.kml = (typeof options.kml !== 'undefined') ? options.kml : this.kml;
            this.kmz = (typeof options.kmz !== 'undefined') ? options.kmz : this.kmz;
            this.shapefile = (typeof options.shapefile !== 'undefined') ? options.shapefile : this.shapefile;
            this.topojson = (typeof options.topojson !== 'undefined') ? options.topojson : this.topojson;
            this.wkt = (typeof options.wkt !== 'undefined') ? options.wkt : this.wkt;

            this.geojsonOptions = (typeof options.geojsonOptions !== 'undefined') ? options.geojsonOptions : this.geojsonOptions;
            this.kmlOptions = (typeof options.kmlOptions !== 'undefined') ? options.kmlOptions : this.kmlOptions;
            this.shapefileOptions = (typeof options.shapefileOptions !== 'undefined') ? options.shapefileOptions : this.shapefileOptions;
            this.topojsonOptions = (typeof options.topojsonOptions !== 'undefined') ? options.topojsonOptions : this.topojsonOptions;

            this.initExportSelect();
            this.removeLink();

            if (options.show && this.parentWidget) {
                //dojo modal dialog
                if (typeof this.parentWidget.show === 'function') {
                    this.parentWidget.show();
                    // dojo-boostrap modal dialog
                } else if (typeof (this.parentWidget.containerNode) === 'string') {
                    domQuery('#' + this.parentWidget.containerNode).closest('.modal').modal('show');
                }
            }
        },

        getExportDefaults: function () {
            var options = this.defaultOptions;

            this.filename = options.filename;
            this.defaultExportType = options.defaultExportType;

            this.excel = options.excel;
            this.csv = options.csv;
            this.xlsExcel = options.xlsExcel;

            this.geojson = options.geojson;
            this.kml = options.kml;
            this.kmz = options.kmz;
            this.shapefile = options.shapefile;
            this.topojson = options.topojson;
            this.wkt = options.wkt;

            this.geojsonOptions = options.geojsonOptions;
            this.kmlOptions = options.kmlOptions;
            this.shapefileOptions = options.shapefileOptions;
            this.topojsonOptions = options.topojsonOptions;
        },

        setExportDefaults: function () {
            var options = this.defaultOptions;

            options.filename = this.filename || options.filename;
            options.defaultExportType = this.defaultExportType || options.defaultExportType;

            options.excel = this.excel || options.excel;
            options.csv = this.csv || options.csv;
            options.xslExcel = this.xlsExcel || options.xlsExcel;

            options.geojson = this.geojson || options.geojson;
            options.kml = this.kml || options.kml;
            options.kmz = this.kmz || options.kmz;
            options.shapefile = this.shapefile || options.shapefile;
            options.topjson = this.topojson || options.topojson;
            options.wkt = this.wkt || options.wkt;

            options.geojsonOptions = this.geojsonOptions || options.geojsonOptions;
            options.kmlOptions = this.kmlOptions || options.kmlOptions;
            options.shapefileOptions = this.shapefileOptions || options.shapefileOptions;
            options.topojsonOptions = this.topojsonOptions || options.topojsonOptions;
        },

        /*******************************
         *  Export Function
         *******************************/

        export: function (options) {
            if (options) {
                this.selectExportType.set('value', options.type);
                this.inputWkid.set('value', options.wkid);
                this.featureSet = options.featureSet;
                this.results = options.results;
                this.grid = options.grid;
                this.doExport();
            }
        },

        doExport: function () {
            var type = this.selectExportType.get('value');
            switch (type) {
            case 'excel':
                this.exportToXLSX();
                break;
            case 'csv':
                this.exportToCSV();
                break;
            case 'xlsExcel':
                this.exportToXLS();
                break;
            case 'geojson':
                this.exportToGeoJSON();
                break;
            case 'kml':
            case 'kmz':
                this.exportToKML();
                break;
            case 'shapefile':
                this.exportToShapeFile();
                break;
            case 'topojson':
                this.exportToTopoJSON();
                break;
            case 'wkt':
                this.exportToWKT();
                break;
            default:
                break;
            }
        },

        exportToXLSX: function () {
            var ws = this.createXLSX();
            if (!ws) {
                this.reportError(i18n.errorExcel);
                return;
            }
            var wb = {
                SheetNames: ['Table'],
                Sheets: {
                    Table: ws
                }
            };
            var wbout = window.XLSX.write(wb, {
                bookType: 'xlsx',
                bookSST: true,
                type: 'binary'
            });

            this.downloadFile(this.s2ab(wbout), 'application/vnd.ms-excel;', this.getFileName('.xlsx'), true);
        },

        exportToCSV: function () {
            var ws = this.createXLSX();
            if (!ws) {
                this.reportError(i18n.errorCSV);
                return;
            }
            var csv = window.XLSX.utils.sheet_to_csv(ws);

            this.downloadFile(csv, 'text/csv;charset=utf-8;', this.getFileName('.csv'), true);
        },

        exportToXLS: function () {
            var xlsContents = this.buildXLSContents();
            if (!xlsContents) {
                this.reportError(i18n.errorExcel);
                return;
            }

            // To UTF-8
            var uint8 = new window.Uint8Array(xlsContents.length);
            for (var i = 0; i < uint8.length; i++) {
                uint8[i] = xlsContents.charCodeAt(i);
            }

            this.downloadFile(uint8, 'application/vnd.ms-excel', this.getFileName('.xls'), true);
        },

        exportToGeoJSON: function () {
            // force export to 4326
            this.inputWkid.set('value', 4326);
            this.resetWkid();

            var geojson = this.createGeoJSON();
            if (!geojson) {
                this.reportError(i18n.errorGeoJSON);
                return;
            }

            var str = json.stringify(geojson);
            this.downloadFile(str, 'application/json;charset=utf-8;', this.getFileName('.geojson'), true);
        },

        exportToKML: function () {
            // force export to 4326
            this.inputWkid.set('value', 4326);
            this.resetWkid();

            var geojson = this.createGeoJSON();
            if (!geojson) {
                this.reportError(i18n.errorKML);
                return;
            }

            // customized version of mapbox's tokml for higher fidelity exports
            // handles more attributes than defined in the simple-spec v1.1
            // source: https://cdn.rawgit.com/mapbox/tokml/v0.4.0/tokml.js'
            require([this.modulesPath + '/tokml.min.js'], lang.hitch(this, function (tokml) {
                var kml = tokml(geojson, this.kmlOptions);
                if (!kml) {
                    this.reportError(i18n.errorKML);
                    return;
                }
                var exportType = this.selectExportType.get('value');
                if (exportType === 'kml') {
                    this.downloadFile(kml, 'application/vnd.google-earth.kml+xml;charset=utf-8;', this.getFileName('.kml'), true);
                } else {
                    /*global JSZip3 */
                    var jszip = new JSZip3();
                    jszip.file(this.getFileName('.kml'), kml);
                    jszip.generateAsync({
                        type: 'blob',
                        compression: 'STORE'
                    }).then(lang.hitch(this, function (zipFile) {
                        this.downloadFile(zipFile, 'application/vnd.google-earth.kmz;base64;', this.getFileName('.kmz'), true);
                    }));
                }

            }));
        },

        exportToShapeFile: function () {
            // force export to 4326 if none provided
            var wkid = this.inputWkid.get('value');
            if (!wkid || wkid === '') {
                this.inputWkid.set('value', 4326);
                this.resetWkid();
            }

            var geojson = this.createGeoJSON();
            if (!geojson) {
                this.reportError(i18n.errorShapeFile);
                return;
            }

            require([this.modulesPath + '/shpwrite-0.2.6.min.js'], lang.hitch(this, function (shpWrite) {
                var options = lang.clone(this.shapefileOptions);
                options.wkt = this.proj4DestWKT;
                var zipFile = shpWrite.zip(geojson, options);
                if (!zipFile) {
                    this.reportError(i18n.errorShapeFile);
                    return;
                }
                zipFile.then(lang.hitch(this, function (content) {
                    this.downloadFile(content, 'application/zip;base64;', this.getFileName('.zip'), true);
                }));
            }));

        },

        exportToTopoJSON: function () {
            // force export to 4326
            this.inputWkid.set('value', 4326);
            this.resetWkid();

            var geojson = this.createGeoJSON();
            if (!geojson) {
                this.reportError(i18n.errorTopoJSON);
                return;
            }

            require([this.modulesPath + '/topojson.min.js'], lang.hitch(this, function () {
                var options = lang.clone(this.topojsonOptions);
                if (options['property-transform'] === null) {
                    //options['property-transform'] = this.allProperties;
                }
                var topojson = window.topojson.topology({
                    'collection': geojson
                }, options);

                if (!topojson) {
                    this.reportError(i18n.errorTopoJSON);
                    return;
                }
                this.downloadFile(JSON.stringify(topojson), 'application/vnd.google-earth.kml+xml;charset=utf-8;', this.getFileName('.topojson'), true);

            }));
        },

        exportToWKT: function () {
            // force export to 4326 if none provided
            var wkid = this.inputWkid.get('value');
            if (!wkid || wkid === '') {
                this.inputWkid.set('value', 4326);
                this.resetWkid();
            }

            var geojson = this.createGeoJSON();
            if (!geojson) {
                this.reportError(i18n.errorWKT);
                return;
            }

            require([this.modulesPath + '/wellknown-0.4.2.min.js'], lang.hitch(this, function (wellknown) {
                var wkt = geojson.features.map(wellknown.stringify).join('\n');
                if (!wkt) {
                    this.reportError(i18n.errorWKT);
                    return;
                }
                this.downloadFile(wkt, 'text/plain;charset=utf-8;', this.getFileName('.wkt'), true);
            }));
        },

        /*******************************
         *  Excel/CSV Functions
         *******************************/

        buildXLSContents: function () {
            var separator = '\t';
            var carriageReturn = '\r';
            var rows = this.grid.get('collection').data;
            var columns = this.grid.get('columns');

            // Prepare formatted columns
            var formattedColumns = columns.map(function (column) {
                if (column.exportable !== false && column.hidden !== true) {
                    return column.label || column.field;
                }
                return null;
            });

            var formattedRows = [];

            // Prepare rows' contents
            array.forEach(rows, function (row) {
                var formattedRow = [];

                array.forEach(columns, function (column) {
                    if (column.exportable !== false && column.hidden !== true) {
                        var field = column.field;
                        var val = row[field];

                        if (column.get) {
                            val = column.get(row);
                        }
                        if (val === null || val === 'undefined') {
                            formattedRow.push('');
                            return;
                        }

                        formattedRow.push(val.toString());
                    }
                });

                formattedRows.push(formattedRow.join(separator));
            });

            return formattedColumns.join(separator) + carriageReturn + formattedRows.join(carriageReturn);
        },

        createXLSX: function () {
            var xlsx = window.XLSX;
            if (!xlsx) {
                return null;
            }

            // function to format dates as numbers as GMT.
            // ** TODO ** Need to adjust to local time zone.
            function datenum (v, date1904) {
                if (date1904) {
                    v += 1462;
                }
                var epoch = Date.parse(v);
                return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
            }

            var ws = {},
                cell = null,
                cellRef = null;
            var range = {
                s: {
                    c: 0,
                    r: 0
                },
                e: {
                    c: 0,
                    r: 0
                }
            };

            var c = 0,
                field = null,
                val = null;
            var aliases = (this.results && this.results.fieldAliases) ? this.results.fieldAliases : null;
            var rc = this.getRowsAndColumns();
            var rows = rc.rows;
            var columns = rc.columns;
            var wscols = [];

            // build the header row with field names
            array.forEach(columns, function (column) {
                if (column.exportable !== false && column.hidden !== true) {
                    cell = {
                        v: column.label || aliases[column.field] || column.field,
                        t: 's'
                    };
                    cellRef = xlsx.utils.encode_cell({
                        c: c,
                        r: 0
                    });
                    ws[cellRef] = cell;
                    wscols.push({
                        wpx: (!isNaN(column.width)) ? (column.width * 1.2) : 200
                    });

                    // adjust the worksheet range values
                    range.e.c = c;

                    c++;
                }
            });

            // set the column widths
            ws['!cols'] = wscols;

            // build the data rows with values
            var r = 1;
            array.forEach(rows, function (row) {
                c = 0;
                array.forEach(columns, function (column) {
                    if (column.exportable !== false && column.hidden !== true) {
                        field = column.field;
                        val = row[field];

                        if (column.get) {
                            val = column.get(row);
                        }

                        if (val === null) {
                            c++;
                            return;
                        }

                        cell = {
                            v: val
                        };

                        // format the cell
                        if (typeof (cell.v) === 'number') {
                            cell.t = 'n';
                        } else if (typeof (cell.v) === 'boolean') {
                            cell.t = 'b';
                        } else if (cell.v instanceof Date) {
                            cell.t = 'n';
                            cell.z = xlsx.SSF._table[22];
                            cell.v = datenum(cell.v);
                        } else {
                            cell.t = 's';
                        }

                        //store the cell in the worksheet
                        cellRef = xlsx.utils.encode_cell({
                            c: c,
                            r: r
                        });
                        ws[cellRef] = cell;

                        c++;
                    }
                });

                // adjust the worksheet range values
                range.e.r = r;
                r++;
            });

            if (range.s.c < 10000000) {
                ws['!ref'] = xlsx.utils.encode_range(range);
            }

            return ws;
        },

        /******************************
         *  GeoJson, KML, Shapefile,
         * TopoJSON, WKT Functions
         *******************************/

        createGeoJSON: function () {
            var type = this.selectExportType.get('value');
            var features = lang.clone(this.featureSet.features);
            if (features.length < 1) {
                return null;
            }

            if (!window.Terraformer || !window.Terraformer.ArcGIS) {
                this.reportError(i18n.errorSpatialParser);
                return null;
            }

            var geojson = {
                type: 'FeatureCollection',
                features: []
            };

            var exportType = this.selectExportType.get('value');
            var includeStyle = false;
            if ((exportType === 'kml' || exportType === 'kmz') && this.kmlOptions && this.kmlOptions.simplestyle) {
                includeStyle = true;
            } else if (exportType === 'geojson' && this.geojsonOptions && this.geojsonOptions.simplestyle) {
                includeStyle = true;
            }

            var sourceProj = window.proj4.defs[this.proj4SrcKey];
            var destProj = window.proj4.defs[this.proj4DestKey];
            var featureID = 1;
            array.forEach(features, lang.hitch(this, function (feature) {
                var attr = feature.attributes;
                if (typeof attr.feature === 'object') {
                    delete attr.feature;
                }

                // remove any attributes that have null values
                for (var key in attr) {
                    if (!attr[key]) {
                        delete attr[key];
                    }
                }

                if (((type === 'kml') || (type === 'kmz')) && feature.geometry && this.kmlOptions && this.kmlOptions.styleAttributes) {
                    feature.attributes = this.addKMLStyleAttributes(feature);
                }
                if (feature.symbol && includeStyle) {
                    feature.attributes = this.convertSymbolToAttributes(feature);
                }

                if (feature.geometry) {
                    if (sourceProj && destProj) {
                        feature.geometry = this.projectGeometry(feature.geometry);
                    }

                    var geoFeature = window.Terraformer.ArcGIS.parse(feature);
                    var geom = geoFeature.geometry;

                    // split multi-polygon/linestrings geojson into multiple single polygons/linstrings
                    if ((type === 'shapefile') && (geom.type === 'MultiPolygon' || geom.type === 'MultiLineString')) {
                        var props = geoFeature.properties;
                        for (var i = 0, len = geom.coordinates.length; i < len; i++) {
                            var feat = {
                                geometry: {
                                    type: geom.type.replace('Multi', ''),
                                    coordinates: geom.coordinates[i]
                                },
                                id: featureID++,
                                properties: props,
                                type: 'Feature'
                            };
                            geojson.features.push(feat);
                        }

                        // not a multi-polygon, so just push it
                    } else {
                        geoFeature.id = featureID++;
                        geojson.features.push(geoFeature);
                    }

                } else {
                    topic.publish('viewer/handleError', 'feature has no geometry');
                }

            }));

            return geojson;
        },

        /*******************************
         *  Projection Functions
         *******************************/

        projectGeometry: function (geometry) {
            var pt = null,
                newPt = null;
            switch (geometry.type) {
            case 'point':
                newPt = this.projectPoint(geometry);
                geometry = new Point({
                    x: newPt.x,
                    y: newPt.y,
                    spatialReference: new SpatialReference(this.proj4DestWkid)
                });
                break;

            case 'polyline':
            case 'polygon':
                var paths = geometry.paths || geometry.rings;
                var len = paths.length;
                for (var k = 0; k < len; k++) {
                    var len2 = paths[k].length;
                    for (var j = 0; j < len2; j++) {
                        pt = geometry.getPoint(k, j);
                        newPt = this.projectPoint(pt);
                        geometry.setPoint(k, j, new Point({
                            x: newPt.x,
                            y: newPt.y,
                            spatialReference: new SpatialReference(this.proj4DestWkid)
                        }));
                    }
                }
                geometry.setSpatialReference(new SpatialReference(this.proj4DestWkid));
                break;

            default:
                break;
            }

            return geometry;
        },

        projectPoint: function (point) {
            return window.proj4(
                window.proj4.defs[this.proj4SrcKey],
                window.proj4.defs[this.proj4DestKey]
            ).forward(point);
        },

        allProperties: function (properties, key, value) {
            properties[key] = value;
            return true;
        },

        /*******************************
         *  Symobology Functions
         *******************************/

        // convert symbol to attributes
        // this allows for export as geojson and kml
        // supports mapbox simple-styles for polylines and polygons
        // only handles simple symbols
        convertSymbolToAttributes: function (feature) {
            var geometry = feature.geometry;
            var symbol = feature.symbol;
            var attributes = lang.clone(feature.attributes);
            var outline = null,
                color = null;

            switch (geometry.type) {
            case 'point':
                switch (symbol.type) {
                case 'picturemarkersymbol':
                    attributes.href = symbol.imageData;
                    if (symbol.xscale) {
                        attributes.scale = symbol.xscale;
                    } else if (symbol.width && symbol.size) {
                        attributes.scale = symbol.width / symbol.size;
                    }

                    attributes['marker-opacity'] = 1.0;
                    attributes['label-scale'] = 0;
                    break;

                case 'simplemarkersymbol':
                    color = symbol.color;
                    if (color) {
                        attributes['marker-color'] = color.toHex();
                        attributes['marker-opacity'] = color.a;
                    }

                    attributes['label-scale'] = 0;
                    break;

                case 'textsymbol':
                    attributes.href = '#';
                    attributes.scale = 0;

                    attributes['label-scale'] = symbol.font.size / 16;
                    color = symbol.color;
                    if (color) {
                        attributes['label-color'] = color.toHex();
                        attributes['label-opacity'] = color.a;
                    }
                    break;
                default:
                    break;
                }

                break;

            case 'polyline':
                color = symbol.color;
                if (color) {
                    attributes.stroke = color.toHex();
                    attributes['stroke-opacity'] = color.a;
                    attributes['stroke-width'] = symbol.width;
                }

                attributes['label-scale'] = 0;
                break;

            case 'polygon':
                outline = symbol.outline;
                if (outline) {
                    color = outline.color;
                    if (color) {
                        attributes.stroke = color.toHex();
                        attributes['stroke-opacity'] = color.a;
                        attributes['stroke-width'] = outline.width;
                    }
                }

                color = symbol.color;
                if (color) {
                    attributes.fill = color.toHex();
                    attributes['fill-opacity'] = color.a;
                }

                attributes['label-scale'] = 0;
                break;

            default:
                break;
            }

            return attributes;
        },

        /*******************************
         *  load parsers
         *******************************/

        loadParsers: function () {

            window.dojoConfig.packages.push({
                name: 'JSZip3',
                location: this.modulesPath,
                main: 'jszip-3.1.3.min'
            });
            require(window.dojoConfig, [
                'JSZip3'
            ], lang.hitch(this, function (JSZip3) {
                if (!window.JSZip3) {
                    window.JSZip3 = JSZip3;
                }
                this.loadXLSXParser();
                this.loadFeatureParser();
            }));

        },

        loadXLSXParser: function () {
            if (this.excel || this.csv || this.xlsExcel) {
                //xlsx requires jszip version 2.x. version 3.x for everything else
                require([
                    this.modulesPath + '/xlsx.core-0.9.12.min.js'
                ]);
            }
        },

        loadFeatureParser: function () {
            if (this.geojson || this.kml || this.kmz || this.shapefile || this.topojson || this.wkt) {
                require([
                    'proj4js/proj4',
                    this.modulesPath + '/terraformer-1.0.8.min.js'
                ], lang.hitch(this, function (proj4) {
                    if (!window.proj4) {
                        window.proj4 = proj4;
                    }
                    this.loadSourceProj4();

                    // arcgis parser must be loaded after the terraformer core module
                    require([
                        this.modulesPath + '/terraformer-arcgis-parser-1.0.5.min.js'
                    ]);
                }));
            }
        },

        loadSourceProj4: function () {
            // which wkid are we projecting from?
            if (window.proj4 && this.featureSet && this.featureSet.features) {
                var features = this.featureSet.features;
                if (features && features.length > 0) {
                    var feature = features[0];
                    if (feature && feature.geometry && feature.geometry.spatialReference) {
                        var wkid = feature.geometry.spatialReference.wkid;
                        if (wkid === 102100) { // ESRI --> EPSG
                            wkid = 3857;
                        }
                        this.proj4SrcWkid = wkid;
                        this.proj4SrcKey = this.proj4Catalog + ':' + String(wkid);
                        if (!window.proj4.defs[this.proj4SrcKey]) {
                            require([this.proj4BaseURL + String(wkid) + '.js']);
                        }
                    }
                }
            }
        },

        /*******************************
         *  Download Functions
         *******************************/

        // works for chrome, firefox and IE10+
        downloadFile: function (content, mimeType, fileName, useBlob) {
            mimeType = mimeType || 'application/octet-stream';
            var url = null;
            var dataURI = 'data:' + mimeType + ',' + content;
            this.removeLink();
            this.link = document.createElement('a');
            var blob = new Blob([content], {
                'type': mimeType
            });

            // feature detection
            if (typeof this.link.download !== 'undefined') {
                // Browsers that support HTML5 download attribute
                if (useBlob) {
                    url = window.URL.createObjectURL(blob);
                } else {
                    url = dataURI;
                }
                this.link.setAttribute('href', url);
                this.link.setAttribute('download', fileName);
                this.link.innerHTML = i18n.download + ' ' + fileName;
                this.divExportLink.appendChild(this.link);
                this.link.click();

                return null;

                //feature detection using IE10+ routine
            } else if (navigator.msSaveOrOpenBlob) {
                return navigator.msSaveOrOpenBlob(blob, fileName);
            }

            // catch all. for which browsers?
            window.open(dataURI);
            window.focus();
            return null;

        },

        removeLink: function () {
            if (this.link && this.divExportLink && this.divExportLink.children.length > 0) {
                this.divExportLink.removeChild(this.link);
                this.divExportLink.innerHTML = '&nbsp;';
            }
            this.link = null;
        },

        /*******************************
         *  Miscellaneous Functions
         *******************************/

        getRowsAndColumns: function () {
            var rows = [];
            var columns = [];
            if (this.grid) {
                rows = this.grid.get('collection').data;
                columns = this.grid.get('columns');
            } else if (this.featureSet) {
                if (this.featureSet.features && this.featureSet.features.length > 0) {
                    columns = [];
                    var firstFeature = this.featureSet.features[0];
                    for (var key in firstFeature.attributes) {
                        if (firstFeature.attributes.hasOwnProperty(key)) {
                            columns.push({
                                exportable: true,
                                hidden: false,
                                label: (this.featureSet && this.featureSet.fieldAliases) ? this.featureSet.fieldAliases[key] : key,
                                field: key
                            });
                        }
                    }
                    rows = array.map(this.featureSet.features, function (aFeature) {
                        return aFeature.attributes;
                    });
                }
            }

            return {
                rows: rows,
                columns: columns
            };
        },

        s2ab: function (s) {
            var buf = new window.ArrayBuffer(s.length);
            var view = new window.Uint8Array(buf);
            /*jslint bitwise: true */
            for (var i = 0; i < s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            /*jslint bitwise: false */
            return buf;
        },

        getFileName: function (extension) {
            if (this.filename) {
                return (typeof this.filename === 'function' ? this.filename(this) + extension : this.filename + extension);
            }
            return 'result' + extension;
        },

        reportError: function (msg) {
            topic.publish('growler/growl', {
                title: 'Error During Export',
                error: msg
            });
            topic.publish('viewer/handleError', {
                widget: 'Export',
                error: msg
            });
        },

        addKMLStyleAttributes: function (feature) {
            if (!feature || !feature.geometry) {
                return feature.attributes;
            }
            var type = feature.geometry.type,
                attributes = feature.attributes,
                types = this.kmlOptions.styleAttributes[type],
                field = this.kmlOptions.styleAttributes.field,
                value = attributes[field];

            if (types) {
                if (!types[value] && types.default) {
                    value = 'default';
                }
                if (types[value]) {
                    attributes = lang.mixin(attributes, types[value]);
                }
            }
            return attributes;
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