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
    'dojo/text!./Export/templates/Export.html',

    //i18n
    'dojo/i18n!./Export/nls/Export',

    //template widgets
    'dijit/_Container',
    'dijit/form/Select',
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

        excel: true,        // allow attributes to be exported to Excel
        csv: true,          // allow attributes to be exported to CSV

        // spatial exports are not ready
        //geojson: false,     // allow features to be exported to GeoJSON
        //shapefile: false,   // allow the features to be exported to a Shape File

        // query results to export
        results: null,
        // optional grid if you want to export only visible columns and use column names
        grid: null,

        postCreate: function() {
            this.inherited(arguments);
            this.parentWidget.draggable = this.draggable;

            this.addTopics();
            this.loadXLSXParser();
            this.loadArcGISParser();
            this.initExportSelect();
        },

        addTopics: function () {
            this.own(topic.subscribe(this.topicID + '/openDialog', lang.hitch(this, 'openDialog')));
        },

        onOpen: function () {
            //  Make sure the content is visible when the dialog
            //  is shown/opened. Something like this may be needed
            //  for all floating windows that don't open on startup?
            this.containerNode.resize();
        },

        // setup the export selection dialog with the appropriate options
        initExportSelect: function () {
            // exports to geojson and shapefile are not done yet
            this.geojson = false;
            this.shapefile = false;

            // attempt reloads in case the options have changed.
            this.loadXLSXParser();
            this.loadArcGISParser();

            var options = [];
            var exportOptions = [
                {value: 'excel', label: i18n.exportToExcel, type: 'attributes'},
                {value: 'csv', label: i18n.exportToCSV, type: 'attributes'},
                {value: 'geojson', label: i18n.exportToGeoJSON, type: 'features'},
                {value: 'shapefile', label: i18n.exportToShapeFile , type: 'features'}
            ];

            this.selectExportType.set('options', []);

            array.forEach(exportOptions, lang.hitch(this, function (option) {
                if (option.type === 'features') {
                    if (!this.features || this.features.length < 0) {
                        return;
                    }
                }
                if (this[option.value] === true) {
                    options.push(option);
                }
            }));

            if (exportOptions.length > 0) {
                this.selectExportType.set('options', options);
                this.selectExportType.set('value', options[0].value);
                this.btnExport.set('disabled', false);
            }

        },

        onExportTypeChange: function () {
            this.btnExport.set('disabled', false);
        },

        openDialog: function (options) {
            this.results = options.results;
            this.grid = options.grid;

            if (options.excel !== undefined) {
                this.excel = options.excel;
            }
            if (options.csv !== undefined) {
                this.csv = options.csv;
            }
            /*
            if (options.geojson !== undefined) {
                this.geojson = options.geojson;
            }
            if (options.shapefile !== undefined) {
                this.shapefile = options.shapefile;
            }
            */

            this.initExportSelect();

            if (options.show) {
                this.parentWidget.show();
            }
        },

        /*******************************
        *  Export Function
        *******************************/

        doExport: function () {
            var type = this.selectExportType.get('value');
            switch (type) {
            case 'excel':
                this.exportToXLSX();
                break;
            case 'csv':
                this.exportToCSV();
                break;
            case 'geojson':
                this.exportToGeoJSON();
                break;
            case 'shapefile':
                this.exportToShapeFile();
                break;
            }
        },

        /*******************************
        *  Excel/CSV Functions
        *******************************/

        exportToXLSX: function () {
            var ws = this.createXLSX();
            if (!ws) {
                topic.publish('viewer/handleError', {
                    widget: 'Export',
                    error: '${i18n.errorExcel}'
                });
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
                type: 'base64'
            });

            this.downloadFile(wbout, 'application/vnd.ms-excel;base64;', 'results.xlsx', false);
        },

        exportToCSV: function () {
            var ws = this.createXLSX();
            if (!ws) {
                topic.publish('viewer/handleError', {
                    widget: 'Export',
                    error: '${i18n.errorCSV}'
                });
                return;
            }
            var csv = window.XLSX.utils.sheet_to_csv(ws);
            this.downloadFile(csv, 'text/csv;charset=utf-8;', 'results.csv', true);
        },

        createXLSX: function () {
            var xlsx = window.XLSX;
            if (!xlsx) {
                return null;
            }

            // function to format dates as numbers as GMT.
            // ** TODO ** Need to adjust to local time zone.
            function datenum(v, date1904) {
                if (date1904) {
                    v += 1462;
                }
                var epoch = Date.parse(v);
                return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
            }

            var ws = {}, cell, cell_ref;
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
                field, val;
            var aliases = null; //this.results.fieldAliases;
            var rows = this.grid.get('store').data;
            var columns = this.grid.get('columns');
            var wscols = [];

            // build the header row with field names
            array.forEach(columns, function (column) {
                if (column.exportable !== false && column.hidden !== true) {
                    cell = {
                        v: column.label || aliases[column.field] || column.field,
                        t: 's'
                    };
                    cell_ref = xlsx.utils.encode_cell({
                        c: c,
                        r: 0
                    });
                    ws[cell_ref] = cell;
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
                        cell_ref = xlsx.utils.encode_cell({
                            c: c,
                            r: r
                        });
                        ws[cell_ref] = cell;

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

        loadXLSXParser: function () {
            if (this.excel || this.csv) {
                require([
                    // consider making this a local library
                    '//cdnjs.cloudflare.com/ajax/libs/xlsx/0.7.8/xlsx.core.min.js'
                ]);
            }
        },

        /*******************************
        *  GeoJson/Shapefile Functions
        *******************************/

        exportToGeoJSON: function () {
            var str = this.createGeoJSON();
            if (!str) {
                topic.publish('viewer/handleError', {
                    widget: 'Export',
                    error: '${i18n.errorGeoJSON}'
                });
                return;
            }
            this.downloadFile(str, 'text/csv;charset=utf-8;', 'results.geojson', true);
        },

        exportToShapeFile: function () {
            alert('Export to Shape File is not yet available');
            return;
            /*
            var str = this.createGeoJSON();
            if (!str) {
                topic.publish('viewer/handleError', {
                    widget: 'AttributeTable/' + this.topicID,
                    error: '${i18n.errorShapeFile}'
                });
                return;
            }

            //** TODO Post to http://ogre.adc4gis.com/ for
            // converting geojson to shapefile?
            // http://ogre.adc4gis.com/convertJson/
            */
        },

        createGeoJSON: function () {
            if (this.features.length < 1) {
                return null;
            }
            if (!window.Terraformer || !window.Terraformer.ArcGIS) {
                topic.publish('viewer/handleError', {
                    widget: 'AttributeTable/' + this.topicID,
                    error: 'Could not create GeoJSON File.'
                });
                return null;
            }
            var geojson = {
                type: 'FeatureCollection',
                features: []
            };
            array.forEach(this.features, function (feature, index) {
                var feat = window.Terraformer.ArcGIS.parse(feature);
                feat.id = index;
                geojson.features.push(feat);
            }, this);
            var str = json.stringify(geojson);
            return str;
        },

        loadArcGISParser: function () {
            // arcgis parser must be loaded after the terraformer core module
            if (this.geojson || this.shapefile) {
                // consider making these local libraries
                require([
                    '//cdn-geoweb.s3.amazonaws.com/terraformer/1.0.4/terraformer.min.js'
                ], function () {
                    require([
                        '//cdn-geoweb.s3.amazonaws.com/terraformer-arcgis-parser/1.0.4/terraformer-arcgis-parser.min.js'
                    ]);
                });
            }
        },

        /*******************************
        *  Download Functions
        *******************************/

        // works for chrome, firefox and IE10+
        downloadFile: function (content, mimeType, fileName, useBlob) {
            mimeType = mimeType || 'application/octet-stream';
            var url;
            var dataURI = 'data:' + mimeType + ',' + content;
            var link = document.createElement('a');
            var blob = new Blob([content], {
                'type': mimeType
            });

            // feature detection
            if (link.download !== undefined) {
                // Browsers that support HTML5 download attribute
                if (useBlob) {
                    url = window.URL.createObjectURL(blob);
                } else {
                    url = dataURI;
                }
                link.setAttribute('href', url);
                link.setAttribute('download', fileName);

             //feature detection using IE10+ routine
            } else if (navigator.msSaveBlob) {
                if (!useBlob) {
                    url = window.URL.createObjectURL(blob);
                } else {
                    url = blob;
                }
                link.addEventListener('click', function () {
                    navigator.msSaveBlob(url, fileName);
                }, false);
            } else {
                window.open(dataURI);
                window.focus();
                return;
            }

            link.style = 'visibility:hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
});
