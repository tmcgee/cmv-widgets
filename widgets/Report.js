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
    'esri/urlUtils',

    // add fake data for testing
    './libs/Faker/faker.min',

    // a custom version for loading AMD-style
    './libs/jsPDF/jspdf.debug'

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
    urlUtils,

    faker

) {
    return declare([_WidgetBase], {
        map: null,
        doc: null,
        reportLayout: {},
        topicID: 'reportWidget',

        printTaskURL: '',

        imagePrefix: 'reportImage-',
        images: {},

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
                'https//cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/2.0.16/jspdf.plugin.autotable.js'
            ];

            switch (this.reportLayout.output.type) {
            case 'blob':
            case 'bloburi':
            case 'bloburl':
            case 'save':
                modules.push('https//cdn.rawgit.com/eligrey/Blob.js/master/Blob.js');
                modules.push('https//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js');
                break;
            default:
            }

            require(modules);
        },

        createReport: function (layout) {
            if (layout) {
                this.reportLayout = layout;
            }

            // preload any images
            this.preloadImages();

            if (this.reportLayout.map) {
                this.printMap();
            } else {
                this.checkImages();
            }
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

            this.reportLayout.map.url = this.getProxiedUrl(data.url);
            this.reportLayout.map.format = this.getMapFormat();
            this.loadImage(this.imagePrefix + 'map', this.reportLayout.map.url);
        },

        createPDF: function () {
            var options = this.reportLayout;
            var doc = new window.jsPDF(options.layout);
            this.doc = doc;

            this.resetFont();
            this.resetBorder();

            if (options.header && options.header.text) {
                this.addHeader();
            }

            if (options.footer) {
                this.addFooter();
            }

            if (options.map && this.images[this.imagePrefix + 'map']) {
                this.addImage(options.map);
            }

            if (options.attributes) {
                array.forEach(options.attributes, lang.hitch(this, 'addAttributes'));
            }

            if (options.table) {
                this.addTable(options.table);
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

            this.outputReport();
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

            if (options.text) {
                this.addText(lang.mixin({
                    left: margins.left,
                    top: margins.top
                }, options, options.text));
            }

            if (options.line) {
                this.addLine(lang.mixin({
                    left: margins.left,
                    top: margins.top + 5,
                    right: (pageWidth - margins.right),
                    bottom: options.line.top || margins.top + 5
                }, options.line));
            }

        },

        addFooter: function () {
            var pageWidth = this.doc.internal.pageSize.width;
            var pageHeight = this.doc.internal.pageSize.height;
            var margins = this.reportLayout.margins;
            var options = this.reportLayout.footer;

            if (options.date) {
                this.addText(lang.mixin({
                    text: (options.date.includeTime) ? this.formatDateTime(new Date()) : this.formatDate(new Date()),
                    top: (pageHeight - margins.bottom + 10)
                }, options, options.date));
            }

            if (options.copyright) {
                this.addText(lang.mixin({
                    top: (pageHeight - margins.bottom + 10)
                }, options, options.copyright));
            }

            if (options.line) {
                this.addLine(lang.mixin({
                    left: margins.left,
                    top: (pageHeight - margins.bottom),
                    right: (pageWidth - margins.right),
                    bottom: (pageHeight - margins.bottom)
                }, options.line));
            }

        },

        addAttributes: function (attr) {
            var title = attr.title;
            var top = attr.top;

            if (title) {
                this.addText({
                    text: title.text,
                    left: attr.left + 5,
                    top: top,
                    font: title.font
                });
            }

            switch (attr.layout) {
            case 'stacked':
                this.addStackedAttributes(attr);
                break;

            case 'table':
                this.addAttributesTable(attr);
                break;

            default:
            }
        },

        addStackedAttributes: function (attr) {
            var margins = this.reportLayout.margins;
            var width = attr.width || this.doc.internal.pageSize.width - margins.right;
            width -= attr.right || 0;
            var font = lang.mixin(lang.clone(this.reportLayout.font), attr.font);

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
                        labelWidth = parseInt(this.doc.getStringUnitWidth(label) * this.doc.internal.getFontSize(), 10);
                        font.style = 'bold';
                        this.addText({
                            text: label,
                            left: left,
                            top: top,
                            font: font
                        });
                        left += labelWidth + 5;
                    }

                    if (fieldName && fieldName.length > 0) {
                        font.style = 'normal';
                        this.addText({
                            text: fieldName,
                            left: left,
                            top: top,
                            font: font
                        });
                    }
                    top += this.doc.internal.getLineHeight();
                    left = origLeft;
                }

                if (attr.border) {
                    this.addBorder({
                        left: attr.left,
                        top: attr.top,
                        width: width,
                        height: attr.height,
                        border: attr.border
                    });
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
                    this.addBorder({
                        left: attr.left + 5,
                        top: attr.top,
                        width: width - 5,
                        height: y - attr.top,
                        border: attr.border
                    });
                }
            }
        },

        addText: function (opts) {
            this.resetFont();
            var font = lang.mixin(lang.clone(this.reportLayout.font), opts.font);
            this.setFont(font);
            var width = this.doc.getStringUnitWidth(opts.text) * this.doc.internal.getFontSize();
            if (opts.align === 'center') {
                opts.left -= width / 2;
            } else if (opts.align === 'right') {
                opts.left -= width;
            }
            this.doc.text(opts.text, opts.left, opts.top);
            this.resetFont();
        },

        addLine: function (opts) {
            this.resetLine();
            var line = lang.mixin(lang.clone(this.reportLayout.line), opts);
            this.setLine(line);
            this.doc.line(opts.left, opts.top, opts.right, opts.bottom);
            this.resetLine();
        },

        addBorder: function (opts) {
            this.resetBorder();
            var border = lang.mixin(lang.clone(this.reportLayout.border), opts.border);
            this.setBorder(border);
            this.doc.rect(opts.left, opts.top, opts.width, opts.height);
            this.resetBorder();
        },

        addImage: function (image) {
            var options = lang.clone(image);
            var img = this.images[options.id];
            this.doc.addImage(img, options.left, options.top, options.width, options.height);
            if (options.border) {
                this.addBorder(options);
            }
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

                this.loadImage(image.id, image.url, function (id, img) {
                    this.images[id] = img;
                    this.checkImages();
                });
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
            if (proxyRule.proxyUrl) {
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