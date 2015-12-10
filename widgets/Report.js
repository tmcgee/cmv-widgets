/*eslint strict: 0, new-cap: 0 */
define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/date/locale',

    'esri/tasks/PrintTask',
    'esri/tasks/PrintTemplate',
    'esri/tasks/PrintParameters',

    // add fake data for testing
    './libs/Faker/faker.min',

    // a custom version for loading AMD-style
    './libs/jsPDF/jspdf.debug'

    // cannot load the current version from the CDN!
    //'//cdnjs.cloudflare.com/ajax/libs/jspdf/1.1.135/jspdf.min.js'

], function (
    declare,
    _WidgetBase,

    lang,
    array,
    topic,
    locale,

    PrintTask,
    PrintTemplate,
    PrintParameters,

    faker

) {
    return declare([_WidgetBase], {
        map: null,
        doc: null,
        reportLayout: {},
        topicID: 'reportWidget',

        printTaskURL: '',

        postCreate: function () {
            this.inherited(arguments);
            this.addTopics();
            this.addjsPDFModules();
        },

        addTopics: function () {
            this.own(topic.subscribe(this.topicID + '/createReport', lang.hitch(this, 'createReport')));
        },

        addjsPDFModules: function () {
            var modules = [
                // load the autotable plugin
                //'//cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/2.0.16/jspdf.plugin.autotable.js'
                '//cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/2.0.16/jspdf.plugin.autotable.src.js'
            ];

            switch (this.reportLayout.output.type) {
            case 'blob':
            case 'bloburi':
            case 'bloburl':
            case 'save':
                modules.push('//cdn.rawgit.com/eligrey/Blob.js/master/Blob.js');
                //modules.push('//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js');
                modules.push('//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.js');
                break;
            default:
            }

            require(modules);
        },

        createReport: function () {
            this.printMap();
        },

        // prints the map
        printMap: function () {
            var options = lang.clone(this.reportLayout.map);
            var template = new PrintTemplate();
            options.dpi = options.dpi || 72;
            if (!options.scale) {
                options.scale = options.dpi / 72;
            }
            template.exportOptions.height = this.converPointToPixel(options.height) * options.scale;
            template.exportOptions.width = this.converPointToPixel(options.width) * options.scale;
            template.exportOptions.dpi = options.dpi;

            template.format = options.format || 'PNG32';
            template.layout = 'MAP_ONLY';
            template.preserveScale = options.preserveScale || true;

            var params = new PrintParameters(this.printTaskURL);
            params.map = this.map;
            params.template = template;

            var printTask = new PrintTask(this.printTaskURL);
            printTask.execute(params, lang.hitch(this, 'onPrintComplete'), lang.hitch(this, 'onPrintError'));
        },

        onPrintError: function (err) {
            topic.publish('viewer/handleError', err);
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
            var url = data.url;
            var format = this.getMapFormat();
            this.convertImgToDataURLviaCanvas(url, lang.hitch(this, 'afterMapImageConvert'), format);
        },

        afterMapImageConvert: function (dataURL) {
            this.mapDataURL = dataURL;
            this.createPDF();
            this.outputReport();
        },

        createPDF: function () {
            var options = this.reportLayout;
            var doc = new window.jsPDF(options.layout);
            this.doc = doc;

            this.resetFont();
            this.resetBorder();

            if (options.map && this.mapDataURL) {
                this.addMapImage();
            }

            if (options.attributes) {
                array.forEach(options.attributes, lang.hitch(this, 'addAttributes'));
            }

            if (options.footer) {
                this.addFooter();
            }

            if (options.header && options.header.text) {
                this.addHeader();
            }

            if (options.table) {
                this.addTable(options.table);
            }

            if (options.tables) {
                array.forEach(options.tables, lang.hitch(this, 'addTable'));
            }

            if (options.text) {
                array.forEach(options.text, lang.hitch(this, 'addText'));
            }

            if (options.images) {
                array.forEach(options.images, lang.hitch(this, 'addImage'));
            }

            if (options.shapes) {
                array.forEach(options.shape, lang.hitch(this, 'addShape'));
            }

        },

        outputReport: function () {
            var output = this.reportLayout.output;
            if (output) {
                var outputresult = this.doc.output(output.type, output.options);
                if (outputresult) {
                    topic.publish(this.topicID + 'output', outputresult);
                }
                switch (output.type) {
                case 'arraybuffer':
                    break;
                case 'blob':
                    break;

                case 'bloburi':
                case 'bloburl':
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
            }

        },

        addHeader: function () {
            var pageWidth = this.doc.internal.pageSize.width;
            var margins = this.reportLayout.margins;
            var options = this.reportLayout.header;

            if (options.line) {
                var line = lang.mixin(lang.clone(this.reportLayout.line), options.line);
                this.setLine(line);
                this.doc.line(margins.left, margins.top + 5, (pageWidth - margins.right), margins.top + 5);
            }

            if (options.text) {
                var font = lang.mixin(lang.clone(this.reportLayout.font), options.font);
                this.setFont(font);
                this.doc.text(options.text, parseInt(pageWidth / 2, 10), margins.top, 'center');
            }

            this.resetFont();
            this.resetLine();
        },

        addFooter: function () {
            var pageWidth = this.doc.internal.pageSize.width;
            var pageHeight = this.doc.internal.pageSize.height;
            var margins = this.reportLayout.margins;
            var top = pageHeight - margins.bottom;
            var options = this.reportLayout.footer;
            var font;

            if (options.line) {
                var line = lang.mixin(lang.clone(this.reportLayout.line), options.line);
                this.setLine(line);
                this.doc.line(margins.left, top, (pageWidth - margins.left), top);
            }

            if (options.date) {
                font = lang.mixin(lang.clone(this.reportLayout.font), options.date.font);
                this.setFont(font);
                var date = (options.date.includeTime) ? this.formatDateTime(new Date()) : this.formatDate(new Date());
                this.doc.text('Printed: ' + date, margins.left + 2, top + 10);
            }

            if (options.copyright) {
                font = lang.mixin(lang.clone(this.reportLayout.font), options.copyright.font);
                this.setFont(font);
                this.doc.text(options.copyright.text, (pageWidth - margins.right - 5), top + 10, 'right');
            }

            this.resetFont();
            this.resetLine();
        },

        addMapImage: function () {
            var options = lang.clone(this.reportLayout.map);
            var format = this.getMapFormat();
            this.doc.addImage(this.mapDataURL, format, options.left, options.top, options.width, options.height);
            if (options.border) {
                var border = lang.mixin(lang.clone(this.reportLayout.border), options.border);
                this.setBorder(border);
                this.doc.rect(options.left, options.top, options.width, options.height);
                this.resetBorder();
            }
        },

        addAttributes: function (attr) {
            var title = attr.title, font;
            var top = attr.top;

            this.resetFont();
            if (title) {
                font = lang.mixin(lang.clone(this.reportLayout.font), title.font);
                this.setFont(font);
                this.doc.text(title.text, attr.left + 5, top);
            }

            this.resetFont();
            font = lang.mixin(lang.clone(this.reportLayout.font), attr.font);
            this.setFont(font);

            switch (attr.layout) {
            case 'stacked':
                this.addStackedAttributes(attr);
                break;

            case 'table':
            default:
                this.addAttributesTable(attr);
            }

            this.resetFont();
            this.resetBorder();
        },

        addStackedAttributes: function (attr) {
            var margins = this.reportLayout.margins;
            var width = attr.width || this.doc.internal.pageSize.width - margins.right;
            width -= attr.right || 0;

            if (attr.fields) {
                if (attr.title) {
                    attr.top += 3;
                }
                var field, top = attr.top + 20;
                var left = attr.left + 5, origLeft = left;
                var label, fieldName, labelWidth, len = attr.fields.length;
                for (var k = 0; k < len; k++) {
                    field = attr.fields[k];
                    label = field.label;
                    fieldName = field.fieldName;

                    if (label && label.length > 0) {
                        label += ': ';
                        labelWidth = this.doc.getStringUnitWidth(label) * this.doc.internal.getFontSize();
                        this.doc.setFontStyle('bold');
                        this.doc.text(label, left, top);
                        left += labelWidth + 5;
                    }

                    if (fieldName && fieldName.length > 0) {
                        this.doc.setFontStyle('normal');
                        this.doc.text(fieldName, left, top);
                    }

                    top += this.doc.internal.getLineHeight();
                    left = origLeft;
                }

                if (attr.border) {
                    var border = lang.mixin(lang.clone(this.reportLayout.border), attr.border);
                    this.setBorder(border);
                    this.doc.rect(attr.left, attr.top, width, attr.height);
                }

            }
        },

        addAttributesTable: function (attr) {
            if (attr.fields) {
                if (attr.title) {
                    attr.top += 3;
                }

                // add fake data for initial proof of concept
                this.doc.autoTable(this.getFakeColumns(), this.getFakeData(20), {
                    margin: {top: attr.top},
                    styles: {cellPadding: 2},
                    headerStyles: {rowHeight: 18, fontSize: 11},
                    bodyStyles: {rowHeight: 15, fontSize: 11, valign: 'middle'}
                });

                // border around the new table
                // this should be done in the theme styling...
                var y = this.doc.autoTableEndPosY();
                var margins = this.reportLayout.margins;
                var width = attr.width || this.doc.internal.pageSize.width - margins.right;
                width -= attr.right || 0;
                if (attr.border) {
                    var border = lang.mixin(lang.clone(this.reportLayout.border), attr.border);
                    this.setBorder(border);
                    this.doc.rect(attr.left + 5, attr.top, width - 5, y - attr.top);
                }
            }
        },

        addTable: function (table) {
            return table;
        },

        addText: function (text) {
            this.resetFont();
            return text;
        },

        addImage: function (image) {
            return image;
        },

        addShape: function (shape) {
            return shape;
        },

        setFont: function (font) {
            if (font) {
                this.doc.setFont(font.font);

                if (typeof(font.color) !== 'string' && font.color.length === 3) {
                    this.doc.setTextColor(font.color[0], font.color[1], font.color[2]);
                } else {
                    this.doc.setTextColor(font.color, 'normal');
                }

                this.doc.setFontSize(font.size);
                this.doc.setFontStyle(font.style);
            }
        },

        resetFont: function () {
            var options = this.reportLayout.font;
            this.setFont(options);
        },

        setLine: function (line) {
            if (line) {
                this.doc.setLineWidth(line.width);
                this.doc.setDrawColor(line.color);
            }
        },

        resetLine: function () {
            var options = this.reportLayout.line;
            this.setLine(options);
        },

        setBorder: function (border) {
            if (border) {
                this.doc.setLineWidth(border.width);
                this.doc.setDrawColor(border.color);
            }
        },

        resetBorder: function () {
            var options = this.reportLayout.border;
            this.setBorder(options);
        },

        getMapFormat: function () {
            var options = this.reportLayout.map;
            var format = options.format || 'png';
            format = format.toLowerCase();
            if (format.substr(0, 3) === 'png') {
                format = 'png';
            }
            return format;
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

        formatDateTime: function (value) {
            if (value instanceof Date) {
                return locale.format(value, {
                    formatLength: 'short'
                });
            }
            return '';
        },

        formatDate: function (value) {
            if (value instanceof Date) {
                return locale.format(value, {
                    selector: 'date',
                    formatLength: 'medium'
                });
            }
            return '';
        },

        convertImgToDataURLviaCanvas: function (url, callback, outputFormat) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                canvas.height = this.height;
                canvas.width = this.width;
                ctx.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback(dataURL);
                canvas = null;
            };
            img.src = url;
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
            var str = faker.helpers.shuffle(words).join(' ').trim();
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    });
});