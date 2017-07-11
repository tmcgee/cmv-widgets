define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/fx',
    'dojo/dom-style',
    'dojo/dom-construct',
    'dojo/topic',
    'dojo/date/locale',
    'dojo/number',
    'dojo/currency',
    'module',

    'esri/tasks/PrintTask',
    'esri/tasks/PrintTemplate',
    'esri/tasks/PrintParameters',
    'esri/urlUtils',

    // template
    'dojo/text!./Report/templates/Report.html',

    //i18n
    'dojo/i18n!./Report/nls/Report',

    // add fake data for testing
    //'https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js',

    'xstyle/css!./Report/css/Report.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    lang,
    array,
    fx,
    domStyle,
    domConstruct,
    topic,
    locale,
    number,
    currency,
    module,

    PrintTask,
    PrintTemplate,
    PrintParameters,
    urlUtils,

    template,
    i18n

    //faker

) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'cmvReportWidget',

        // i18n
        defaultI18n: i18n,
        i18n: {},

        map: null,
        doc: null,
        reportLayout: {},

        defaultStyles: {
            font: {
                color: 0,
                size: 11,
                font: 'helvetica',
                style: 'normal'
            },
            line: {
                width: 0.5,
                color: 0
            },
            rectangle: {
                lineWidth: 0.5,
                lineColor: 0,
                fillColor: [255, 255, 255, 0]
            }
        },
        topicID: 'reportWidget',

        printTaskURL: '',

        fadeInDuration: 100,
        fadeOutDuration: 100,

        imagePrefix: 'reportImage-',
        images: {},

        postMixInProperties: function () {
            this.inherited(arguments);
            this.i18n = this.mixinDeep(this.defaultI18n, this.i18n);
        },

        postCreate: function () {
            this.inherited(arguments);
            this.addTopics();

            if (!window.jsPDF) {
                this.loadJSPDF();
            }
            this.originalDefaultStyles = this.defaultStyles;
            domConstruct.place(this.reportOverlayNode, document.body);
        },

        addTopics: function () {
            this.own(topic.subscribe(this.topicID + '/createReport', lang.hitch(this, 'createReport')));
        },

        loadJSPDF: function () {
            var modulesPath = module.uri.substring(0, module.uri.lastIndexOf('/')) + '/Report/lib';
            window.dojoConfig.packages.push({
                name: 'jspdf',
                main: 'jspdf-1.3.4.min',
                location: modulesPath
            });
            window.dojoConfig.packages.push({
                name: 'autotable',
                main: 'jspdf.plugin.autotable-2.3.1.min',
                location: modulesPath
            });

            require(window.dojoConfig, [
                'autotable'
            ]);
        },

        createReport: function (options) {
            if (options.feature) {
                this.feature = options.feature;
            }

            if (options.features) {
                this.features = options.features;
            }

            this.defaultStyles = this.originalDefaultStyles;
            if (options.defaultStyles) {
                this.defaultStyles = options.defaultStyles;
            }

            if (options.printTaskURL) {
                this.printTaskURL = options.printTaskURL;
            }

            if (options.reportLayout) {
                this.reportLayout = options.reportLayout;
            }

            this.showLoadingMask();

            // clear previous images
            this.clearImages();

            // preload any images
            this.preloadImages();

            if (this.reportLayout.map) {
                if (this.feature && this.feature.geometry && this.feature.geometry.getExtent) {
                    this.mapExtent = this.map.extent;
                    if (this.feature.geometry.type === 'point') {
                        this.map.centerAndZoom(this.feature.geometry, this.map.getMaxZoom() - 5).then(lang.hitch(this, 'printMap'));
                    } else {
                        this.map.setExtent(this.feature.geometry.getExtent(), true).then(lang.hitch(this, 'printMap'));
                    }
                } else {
                    this.mapExtent = null;
                    this.printMap();
                }
            } else {
                this.checkImages();
            }
        },

        // prints the map
        printMap: function () {
            var options = lang.clone(this.reportLayout.map);
            var printTemplate = new PrintTemplate();
            options.dpi = options.dpi || 72;
            if (!options.scale) {
                options.scale = options.dpi / 72;
            }
            printTemplate.exportOptions.height = this.converPointToPixel(options.height) * options.scale;
            printTemplate.exportOptions.width = this.converPointToPixel(options.width) * options.scale;
            printTemplate.exportOptions.dpi = options.dpi;

            printTemplate.format = options.format.toUpperCase() || 'PNG32';
            printTemplate.layout = 'MAP_ONLY';
            printTemplate.preserveScale = options.preserveScale;

            var params = new PrintParameters();
            params.map = this.map;
            params.template = printTemplate;

            var printTask = new PrintTask(this.printTaskURL);
            printTask.execute(params, lang.hitch(this, 'onPrintComplete'), lang.hitch(this, 'onPrintError'));
        },

        onPrintError: function (err) {
            this.hideLoadingMask();
            topic.publish('viewer/handleError', {
                error: err
            });
            topic.publish('growler/growl', {
                title: 'Report Failed',
                message: 'Could not create a map image for report.',
                level: 'error',
                timeout: 3000
            });
        },

        onPrintComplete: function (data) {
            if (!data.url) {
                this.onPrintError('Error, try again');
            }
            if (this.mapExtent) {
                this.map.setExtent(this.mapExtent);
            }

            this.mapImage = lang.clone(this.reportLayout.map);
            this.mapImage.id = this.mapImage.id || this.imagePrefix + 'map';
            this.mapImage.url = this.getProxiedUrl(data.url);
            this.mapImage.format = this.getMapFormat();
            this.loadImage(this.mapImage.id, this.mapImage.url);
        },

        createPDF: function () {
            var options = this.reportLayout;

            /* eslint new-cap: 0 */
            this.doc = new window.jsPDF(options.layout);
            this.docEventID = this.doc.internal.events.subscribe('addPage', lang.hitch(this, 'newPage'));

            this.resetFont();
            this.resetRectangle();

            this.addMetadata();
            this.addPageHeaderFooter({
                pageNumber: 1
            });

            // add the map image first
            if (this.mapImage && this.images[this.imagePrefix + 'map']) {
                this.addImage(this.mapImage);
            }

            this.addGroupedItems(options);

            // clear images
            this.clearImages();

            this.hideLoadingMask();
            this.outputReport();

            // reinitialize the doc
            this.doc.internal.events.unsubscribe(this.docEventID);
            this.doc = new window.jsPDF();
        },

        outputReport: function () {
            var output = this.reportLayout.output,
                result = null;
            if (output) {

                if (output.type === 'print') {
                    this.doc.autoPrint();
                    result = this.doc.output('bloburl');
                } else if (output.type === 'save') {
                    result = this.doc.save(output.options);
                } else {
                    result = this.doc.output(output.type);
                }

                switch (output.type) {
                case 'arraybuffer':
                    break;

                case 'blob':
                    // alternative way to save the file
                    // must include FileSave: https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js
                    if (output.options) {
                        window.saveAs(result, output.options);
                    }
                    break;

                case 'print':
                case 'bloburi':
                case 'bloburl':
                    window.open(result, '_blank');
                    break;

                case 'dataurlnewwindow': // opens a new window
                    break;

                case 'datauri':
                case 'dataurl':
                    break;

                case 'datauristring':
                case 'dataurlstring':
                    break;

                case 'save': // prompts the user to save
                    break;

                default:
                    break;
                }

                // publish the results
                if (result) {
                    topic.publish(this.topicID + '/output', result);
                }

            }
        },

        addMetadata: function () {
            if (this.reportLayout.metadata) {
                this.doc.setProperties(this.reportLayout.metadata);
            }
        },

        newPage: function (pageOptions) {
            this.addPageHeaderFooter(pageOptions);
        },

        addPage: function () {
            this.doc.addPage();
        },

        addPageHeaderFooter: function (pageOptions) {
            var options = this.reportLayout;
            if (pageOptions.pageNumber === 1) {
                if (options.header && options.header.text && !options.header.skipFirst) {
                    this.addHeader(pageOptions);
                }

                if (options.footer && !options.footer.skipFirst) {
                    this.addFooter(pageOptions);
                }
            } else {
                if (options.header && options.header.text && (options.header.eachPage !== false)) {
                    this.addHeader(pageOptions);
                }

                if (options.footer && (options.footer.eachPage !== false)) {
                    this.addFooter(pageOptions);
                }
            }
        },

        addHeader: function (pageOptions) {
            var options = lang.clone(this.reportLayout.header);
            options.pageNumber = pageOptions.pageNumber;
            this.addGroupedItems(options);
        },

        addFooter: function (pageOptions) {
            var options = lang.clone(this.reportLayout.footer);
            options.pageNumber = pageOptions.pageNumber;
            this.addGroupedItems(options);
        },

        addGroupedItems: function (items) {
            var pageNumber = 1;

            // you can group items on a per page basis
            if (items.pageNumber) {
                this.setPage(items.pageNumber);
                pageNumber = items.pageNumber;
            }

            // pages are just like groups of items. do the pages first =
            array.forEach(items.pages, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addGroupedItems(item);
            }));

            // add any attributes
            array.forEach(items.attributes, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addAttributes(item);
            }));

            // add any tables
            array.forEach(items.tables, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                if (item.features === true && this.features && this.features.length) {
                    item.data = array.map(this.features, function (feat) {
                        return feat.attributes;
                    });
                }
                this.addTable(item);
            }));

            // add any images
            array.forEach(items.images, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addImage(item);
            }));

            // add any shapes
            array.forEach(items.shapes, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addShape(item);
            }));

            // add any text
            array.forEach(items.text, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addText(item);
            }));

            // add any lines
            array.forEach(items.lines, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addLine(item);
            }));

            // add any borders
            array.forEach(items.borders, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addBorder(item);
            }));

            // add any groupedItems. can be nested
            array.forEach(items.groupedItems, lang.hitch(this, function (item) {
                item.pageNumber = item.pageNumber || pageNumber;
                this.addGroupedItems(item);
            }));

        },

        addAttributes: function (attr) {
            if (attr.title) {
                this.addText(lang.mixin({
                    left: attr.left + 5,
                    top: attr.top,
                    pageNumber: attr.pageNumber
                }, attr.title));
            }
            if (attr.lines) {
                array.forEach(attr.lines, lang.hitch(this, function (line) {
                    this.addLine(lang.mixin({
                        left: attr.left + 5,
                        top: attr.top,
                        pageNumber: attr.pageNumber
                    }, line));
                }));
            }

            switch (attr.layout) {
            case 'stacked':
                this.addStackedAttributes(attr);
                break;

            case 'column':
                this.addColumnAttributes(attr);
                break;

            case 'table':
                this.addTable(attr);
                break;

            case 'fake':
                this.addFakeTable(attr);
                break;

            default:
            }
        },

        addStackedAttributes: function (attr) {
            var font = lang.mixin(lang.clone(this.defaultStyles.font), attr.font);
            var top = attr.top + 20;
            if (attr.pageNumber) {
                this.setPage(attr.pageNumber);
            }

            if (attr.fields) {
                var field = null,
                    left = attr.left + 5, origLeft = left,
                    len = attr.fields.length;

                for (var k = 0; k < len; k++) {
                    field = attr.fields[k];
                    left = this.addStackedAttributesLabel(field, font, left, top, attr.pageNumber);
                    this.addStackedAttributesValue(field, font, left, top, attr.pageNumber);
                    top += this.doc.internal.getLineHeight();
                    left = origLeft;
                }

                if (attr.border) {
                    this.addStackedAttributesBorder(attr);
                }
            }
        },

        addStackedAttributesLabel: function (field, font, left, top, pageNumber) {
            var label = field.label;
            if (label && label.length > 0) {
                label += ':';
                font.style = 'bold';
                this.setFont(font);
                var labelWidth = parseInt(this.doc.getStringUnitWidth(label) * this.doc.internal.getFontSize(), 10) + 5;
                this.addText({
                    text: label,
                    left: left,
                    top: top,
                    font: font,
                    align: field.labelAlign,
                    pageNumber: pageNumber
                });
                left += labelWidth;
            }
            return left;
        },

        addStackedAttributesValue: function (field, font, left, top, pageNumber) {
            var value = field.value;
            if (field.fieldName && this.feature && this.feature.attributes) {
                value = this.feature.attributes[field.fieldName];
            }
            if (!value) {
                value = '';
            }

            if (value && value.length > 0) {
                font.style = 'normal';
                this.addText({
                    text: value,
                    left: left,
                    top: top,
                    font: font,
                    align: field.valueAlign,
                    pageNumber: pageNumber
                });
            }

        },

        addStackedAttributesBorder: function (attr) {
            var margins = this.reportLayout.margins;
            var width = attr.width || this.doc.internal.pageSize.width - margins.right;
            width -= attr.right || 0;
            this.addBorder({
                left: attr.left,
                top: attr.top,
                width: width,
                height: attr.height,
                border: attr.border,
                pageNumber: attr.pageNumber
            });
        },

        addColumnAttributes: function (attr) {
            if (attr.fields) {
                var field = null,
                    label = null,
                    value = null,
                    len = attr.fields.length;

                attr.columns = [
                    {title: 'Label', dataKey: 'label'},
                    {title: 'Value', dataKey: 'value'}
                ];
                attr.data = [];

                for (var k = 0; k < len; k++) {
                    field = attr.fields[k];
                    label = field.label;

                    value = field.value;
                    if (field.fieldName && this.feature && this.feature.attributes) {
                        value = this.feature.attributes[field.fieldName];
                    }
                    if (!value || (typeof value === 'string' && value.toLowerCase() === 'null')) {
                        value = '';
                    }
                    if (typeof value === 'string') {
                        value = value.trim();
                    }
                    value = this.formatText({
                        text: value,
                        format: field.format,
                        formatOptions: field.formatOptions,
                        formatter: field.formatter,
                        attributes: this.feature.attributes
                    });
                    attr.data.push({
                        label: label,
                        value: value,
                        styles: field.styles,
                        rowHeading: field.rowHeading
                    });
                }

                attr.options = this.mixinDeep({
                    theme: 'plain',
                    styles: {
                        cellPadding: 5,
                        valign: 'top', // top, middle, bottom
                        overflow: 'linebreak' // visible, hidden, ellipsize or linebreak
                    },
                    columnStyles: {
                        label: {
                            fontStyle: 'bold'
                        }
                    },
                    drawHeaderRow: function () {
                        // Don't draw header row
                        return false;
                    }
                }, attr.options);

                this.addTable(attr);
            }
        },

        addTable: function (table) {
            if (table.columns) {
                if (table.pageNumber) {
                    this.setPage(table.pageNumber);
                }

                table.options = this.mixinDeep({
                    drawRow: lang.hitch(this, function (row, data) {
                        var rowHeading = row.raw.rowHeading;
                        var rowStyles = row.cells.label.styles;
                        if (rowHeading) {
                            var margin = rowHeading.margin || {};
                            var rowHeight = (rowHeading.height || row.height) + (margin.top || 0);
                            if (rowHeading.border) {
                                this.addBorder(this.mixinDeep({
                                    left: data.settings.margin.left,
                                    top: row.y + (margin.top || 0),
                                    width: data.table.width,
                                    height: rowHeight,
                                    fillColor: rowStyles.fillColor,
                                    lineColor: rowStyles.lineColor,
                                    lineWidth: rowStyles.lineWidth
                                }, rowHeading.border));
                            }
                            rowHeading = this.mixinDeep({
                                left: data.settings.margin.left + data.table.width / 2,
                                top: row.y + ((rowHeight > row.height) ? rowHeight - data.settings.styles.cellPadding : rowHeight / 2),
                                styles: {
                                    halign: 'center',
                                    valign: (rowHeight > row.height) ? 'bottom' : 'middle'
                                }
                            }, rowHeading);
                            if (rowHeading.font) {
                                this.setFont(rowHeading.font);
                            }
                            this.doc.autoTableText(rowHeading.text, rowHeading.left, rowHeading.top, rowHeading.styles);
                            data.cursor.y += rowHeight;
                        }
                    })
                }, table.options);

                if (table.options.addPageContent) {
                    if (typeof table.options.addPageContent === 'string') {
                        table.options.addPageContent = lang.hitch(this, this[table.options.addPageContent]);
                    } else {
                        table.options.addPageContent = lang.hitch(this, table.options.addPageContent); // anonymous function

                    }
                }
                this.doc.autoTable(table.columns, table.data, table.options);
            }
        },

        addText: function (opts) {
            opts.text = this.formatText(opts);

            this.resetFont();
            var font = lang.mixin(lang.clone(this.defaultStyles.font), opts.font);
            this.setFont(font);
            var width = this.doc.getStringUnitWidth(opts.text) * this.doc.internal.getFontSize();
            if (opts.align === 'center' || opts.halign === 'center') {
                opts.left -= width / 2;
            } else if (opts.align === 'right' || opts.halign === 'right') {
                opts.left -= width;
            }
            if (opts.pageNumber) {
                this.setPage(opts.pageNumber);
            }
            this.doc.text(opts.text, opts.left, opts.top);
            this.resetFont();
        },

        addLine: function (opts) {
            this.resetLine();
            var line = lang.mixin(lang.clone(this.defaultStyles), opts);
            this.setLine(line);
            if (opts.pageNumber) {
                this.setPage(opts.pageNumber);
            }
            this.doc.line(opts.left, opts.top, opts.right, opts.bottom);
            this.resetLine();
        },

        addBorder: function (opts) {
            this.addRectangle(opts);
        },

        addRectangle: function (opts) {
            this.resetRectangle();
            var rect = lang.mixin(lang.clone(this.defaultStyles.rectangle), opts);
            this.setRectangle(rect);
            if (opts.pageNumber) {
                this.setPage(opts.pageNumber);
            }
            if (opts.left && opts.top && opts.width && opts.height) {
                if (opts.fillStyle) {
                    this.doc.rect(opts.left, opts.top, opts.width, opts.height, opts.fillStyle);
                } else {
                    this.doc.rect(opts.left, opts.top, opts.width, opts.height);
                }
            }
            this.resetRectangle();
        },

        addSquare: function (opts) {
            if (opts.width) {
                opts.height = opts.width;
            } else if (opts.height) {
                opts.width = opts.height;
            }
            this.addRectangle(opts);
        },

        addCircle: function (opts) {
            if (!opts.width && opts.height) {
                opts.width = opts.height;
            }
            this.resetRectangle();
            var rect = lang.mixin(lang.clone(this.defaultStyles.rectangle), opts);
            this.setRectangle(rect);
            if (opts.pageNumber) {
                this.setPage(opts.pageNumber);
            }
            if (opts.x && opts.y && opts.width) {
                if (opts.fillStyle) {
                    this.doc.circle(opts.x, opts.y, opts.width, opts.fillStyle);
                } else {
                    this.doc.circle(opts.x, opts.y, opts.width);
                }
            }
            this.resetRectangle();
        },

        addEllipse: function (opts) {
            this.resetRectangle();
            var rect = lang.mixin(lang.clone(this.defaultStyles.rectangle), opts);
            this.setRectangle(rect);
            if (opts.pageNumber) {
                this.setPage(opts.pageNumber);
            }
            if (opts.x && opts.y && opts.width && opts.height) {
                if (opts.fillStyle) {
                    this.doc.ellipse(opts.x, opts.y, opts.width, opts.height, opts.fillStyle);
                } else {
                    this.doc.ellipse(opts.x, opts.y, opts.width, opts.height);
                }
            }
            this.resetRectangle();
        },

        addTriangle: function (opts) {
            this.resetRectangle();
            var rect = lang.mixin(lang.clone(this.defaultStyles.rectangle), opts);
            this.setRectangle(rect);
            if (opts.pageNumber) {
                this.setPage(opts.pageNumber);
            }
            if (opts.x1 && opts.y1 && opts.x2 && opts.y2 && opts.x3 && opts.y3) {
                if (opts.fillStyle) {
                    this.doc.triangle(opts.x1, opts.y1, opts.x2, opts.y2, opts.x3, opts.y3, opts.fillStyle);
                } else {
                    this.doc.triangle(opts.x1, opts.y1, opts.x2, opts.y2, opts.x3, opts.y3);
                }
            }
            this.resetRectangle();
        },

        addImage: function (image) {
            var opts = lang.clone(image);
            var img = this.images[opts.id];
            if (!img || !opts.left || !opts.top) {
                return;
            }
            this.resetRectangle();
            if (opts.pageNumber) {
                this.setPage(opts.pageNumber);
            }
            var imgFormat = opts.format || 'PNG';
            this.doc.addImage(img, imgFormat, opts.left, opts.top, opts.width, opts.height);
            if (opts.border) {
                this.addBorder(opts);
            }
            this.resetRectangle();
        },

        addShape: function (opts) {
            switch (opts.type) {
            case 'circle':
                this.addCircle(opts);
                break;

            case 'ellipse':
                this.addEllipse(opts);
                break;

            case 'rectangle':
                this.addRectangle(opts);
                break;

            case 'square':
                this.addSquare(opts);
                break;

            case 'triangle':
                this.addTriangle(opts);
                break;

            default:
            }
        },

        setPage: function (pageNumber) {
            pageNumber = pageNumber || 1;
            var currPages = this.doc.internal.pages.length - 1; // the jsPDF array is off by one
            if (currPages < pageNumber) {
                while (currPages < pageNumber) {
                    this.doc.addPage();
                    currPages++;
                }
            }
            this.doc.setPage(pageNumber);
        },

        setFont: function (font) {
            if (font) {
                if (typeof font.font === 'string') {
                    this.doc.setFont(font.font);
                }
                this.setTextColor(font.fontColor || font.textColor || font.color);

                var size = font.fontSize || font.size;
                if (this.isNumeric(size)) {
                    this.doc.setFontSize(size);
                }

                var style = font.fontStyle || font.style;
                if (typeof style === 'string') {
                    this.doc.setFontStyle(style);
                }
            }
        },

        resetFont: function () {
            this.setFont(this.defaultStyles.font);
        },

        setLine: function (opts) {
            if (opts) {
                this.setLineWidth(opts.lineWidth || opts.width);
                this.setDrawColor(opts.lineColor || opts.color);
            }
        },

        resetLine: function () {
            this.setLine(this.defaultStyles);
        },

        setRectangle: function (opts) {
            if (opts) {
                this.setLineWidth(opts.lineWidth || opts.width);
                this.setDrawColor(opts.lineColor || opts.color);
                this.setFillColor(opts.fillColor);
            }
        },

        resetRectangle: function () {
            this.setRectangle(this.defaultStyles.rectangle);
        },

        setLineWidth: function (width) {
            if (this.isNumeric(width)) {
                this.doc.setLineWidth(width);
            }
        },

        setTextColor: function (color) {
            if ((typeof color !== 'undefined') && (color !== null)) {
                if (color instanceof Array) {
                    if (color.length === 3) {
                        this.doc.setTextColor(color[0], color[1], color[2]);
                    } else if (color.length === 4) {
                        this.doc.setTextColor(color[0], color[1], color[2], color[3]);
                    }
                } else {
                    this.doc.setTextColor(color, 'normal');
                }
            }
        },

        setDrawColor: function (color) {
            if ((typeof color !== 'undefined') && (color !== null)) {
                if (color instanceof Array) {
                    if (color.length === 3) {
                        this.doc.setDrawColor(color[0], color[1], color[2]);
                    } else if (color.length === 4) {
                        this.doc.setDrawColor(color[0], color[1], color[2], color[3]);
                    }
                } else {
                    this.doc.setDrawColor(color);
                }
            }
        },

        setFillColor: function (color) {
            if ((typeof color !== 'undefined') && (color !== null)) {
                if (color instanceof Array) {
                    if (color.length === 3) {
                        this.doc.setFillColor(color[0], color[1], color[2]);
                    } else if (color.length === 4) {
                        this.doc.setFillColor(color[0], color[1], color[2], color[3]);
                    }
                } else {
                    this.doc.setFillColor(color);
                }
            }
        },

        getMapFormat: function () {
            var options = this.mapImage;
            var format = options.format || 'png';
            format = format.toLowerCase();
            if (format.substr(0, 3) === 'png') {
                format = 'png';
            }
            return format;
        },

        showLoadingMask: function () {
            fx.fadeIn({
                node: this.reportOverlayNode,
                gotoStart: true,
                duration: this.fadeInDuration,
                onEnd: function (node) {
                    domStyle.set(node, 'display', 'block');
                }
            }).play();
        },

        hideLoadingMask: function () {
            fx.fadeOut({
                node: this.reportOverlayNode,
                gotoStart: true,
                duration: this.fadeOutDuration,
                onEnd: function (node) {
                    domStyle.set(node, 'display', 'none');
                }
            }).play();
        },

        convertPixelToMilimeter: function (pixels) {
            return (pixels * 25.4) / (this.reportLayout.map.dpi || 72);
        },

        converMilimeterToPixel: function (mm) {
            return (mm * (this.reportLayout.map.dpi || 72)) / 25.4;
        },

        convertPixelToPoint: function (pixels) {
            return (pixels * (3 / 4));
        },

        converPointToPixel: function (points) {
            return (points * (4 / 3));
        },

        isNumeric: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        formatText: function (opts) {
            var text = opts.text,
                date = null,
                format = opts.format || '';

            if (opts.formatter) { // custom formatter?
                return opts.formatter(text, opts.attributes);
            }

            if (typeof text === 'undefined' || text === null) {
                switch (format.toLowerCase()) {
                case 'date':
                    text = this.formatDate(new Date());
                    break;
                case 'datetime':
                    text = this.formatDateTime(new Date());
                    break;
                case 'pagenumber':
                    text = 'Page ' + opts.pageNumber;
                    break;
                default:
                    text = '';
                    break;
                }

            } else {
                switch (format.toLowerCase()) {
                case 'date':
                    date = this.getDateTime(text);
                    if (date) {
                        text = this.formatDate(date, opts.formatOptions);
                    }
                    break;
                case 'datetime':
                    date = this.getDateTime(text);
                    if (date) {
                        text = this.formatDateTime(date, opts.formatOptions);
                    }
                    break;
                case 'currency':
                    text = this.formatCurrency(text, opts.formatOptions);
                    break;
                case 'integer':
                    text = this.formatNumber(text, opts.formatOptions);
                    break;
                case 'double':
                    text = this.formatSingleDouble(text, opts.formatOptions);
                    break;
                case 'truefalse':
                case 'boolean':
                    text = this.formatBoolean(text);
                    break;
                case 'yesno':
                    text = this.formatYesNo(text);
                    break;
                default:
                    break;
                }
            }

            return text;
        },

        formatDateTime: function (value, formatOptions) {
            if (value instanceof Date) {
                return locale.format(value, formatOptions || {
                    formatLength: 'short'
                });
            }
            return '';
        },

        formatDate: function (value, formatOptions) {
            if (value instanceof Date) {
                return locale.format(value, formatOptions || {
                    selector: 'date',
                    formatLength: 'short'
                });
            }
            return '';
        },

        formatNumber: function (value, formatOptions) {
            if (!isNaN(value)) {
                return number.format(value, formatOptions || {
                    places: 0
                });
            }
            return '';
        },

        formatSingleDouble: function (value, formatOptions) {
            if (!isNaN(value)) {
                return number.format(value, formatOptions || {
                    places: 3
                });
            }
            return '';
        },

        formatCurrency: function (value, formatOptions) {
            if (!isNaN(value)) {
                return currency.format(value, formatOptions || {
                    currency: 'USD'
                });
            }
            return '';
        },

        formatBoolean: function (value) {
            if (!isNaN(value)) {
                return (Math.abs(parseInt(value, 10)) === 1) ? 'True' : 'False';
            }
            return '';
        },

        formatYesNo: function (value) {
            if (!isNaN(value)) {
                return (Math.abs(parseInt(value, 10)) === 1) ? 'Yes' : 'No';
            }
            return '';
        },

        getDateTime: function (value) {
            if (isNaN(value) || value === 0 || value === null || value === '') {
                return null;
            }
            return new Date(value);
        },

        checkImages: function () {
            for (var key in this.images) {
                if (!this.images[key]) {
                    return;
                }
            }
            this.createPDF();
        },

        preloadImages: function () {
            if (this.reportLayout.map) {
                this.reportLayout.map.id = this.reportLayout.map.id || this.imagePrefix + 'map';
                this.images[this.reportLayout.map.id] = null;
            }

            array.forEach(this.reportLayout.images, lang.hitch(this, function (image) {
                if (!image.id) {
                    image.id = this.imagePrefix + String(Object.keys(this.images).length);
                }
                this.images[image.id] = null;
                this.loadImage(image.id, image.url);
            }));
        },

        loadImage: function (id, url) {
            var blankPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = lang.hitch(this, function () {
                this.images[id] = img;
                this.checkImages();
            });
            img.onerror = lang.hitch(this, function () {
                img.src = blankPNG;
                this.images[id] = img;
                this.checkImages();
            });
            img.id = id;
            img.src = url;
            //resets cache on src of img if it comes back undefined, using a 1x1 blank gif dataURI
            if (img.complete || typeof img.complete === 'undefined') {
                img.src = blankPNG;
                img.src = url;
            }
        },

        clearImages: function () {
            for (var key in this.images) {
                if (this.images.hasOwnProperty(key)) {
                    delete this.images[key];
                }
            }
            this.images = [];
            this.mapImage = null;
        },

        /*
        convertImgToDataURLviaCanvas: function (url, format, callback) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = lang.hitch(this, callback, img, format); //, callback);
            img.src = url;
            //resets cache on src of img if it comes back undefined, using a 1x1 blank gif dataURI
            if (img.complete || typeof img.complete === 'undefined') {
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
                img.src = url;
            }
        },

        onImageLoad: function (img, format, callback) {
            format = format || 'PNG';
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            dataURL = canvas.toDataURL(format);
            if (callback) {
                callback(img);
            }
            canvas = null;
        },

        convertFileToDataURLviaFileReader: function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function () {
                var reader = new FileReader();
                reader.onloadend = function () {
                    callback(reader.result);
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.send();
        },
        */

        getProxiedUrl: function (url) {
            var proxyRule = urlUtils.getProxyRule(url);
            if (proxyRule && proxyRule.proxyUrl) {
                return proxyRule.proxyUrl + '?' + url;
            }
            return url;
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

        /*
        // add a table with fake data for demonstration purposes
        addFakeTable: function (table) {
            var options = {
                columns: this.getFakeColumns(),
                data: this.getFakeData(30), // enough to fill a page to show multiple pages
                options: {
                    theme: 'grid',
                    margin: {top: table.top},
                    styles: {cellPadding: 5},
                    headerStyles: {rowHeight: 18, fontSize: 11},
                    bodyStyles: {rowHeight: 15, fontSize: 11, valign: 'middle'}
                }
            };
            table = this.mixinDeep(options, table);
            this.addTable(table);
        },

        // Returns a new array each time to avoid pointer issues
        getFakeColumns: function () {
            return [
                {title: 'ID', dataKey: 'id'},
                {title: 'Name', dataKey: 'firstName'},
                {title: 'Email', dataKey: 'email'},
                {title: 'City', dataKey: 'city'},
                {title: 'Country', dataKey: 'country'},
                {title: 'Expenses', dataKey: 'expenses'}
            ];
        },

        // Uses the faker.js library to get random data.
        getFakeData: function (rowCount) {
            rowCount = rowCount || 4;
            var sentence = faker.lorem.words(12);
            var data = [];
            for (var j = 1; j <= rowCount; j++) {
                data.push({
                    id: j,
                    firstName: faker.name.findName(),
                    email: faker.internet.email(),
                    country: faker.address.country(),
                    city: faker.address.city(),
                    expenses: faker.finance.amount(),
                    text: this.shuffleSentence(sentence),
                    text2: this.shuffleSentence(sentence)
                });
            }
            return data;
        },

        shuffleSentence: function (words) {
            words = words || faker.lorem.words(8);
            var str = faker.helpers.shuffle(words);
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        */
    });
});