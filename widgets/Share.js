/*eslint strict: 0, no-console: 0 */
define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'gis/dijit/_FloatingWidgetMixin',

    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-attr',
    'dojo/dom-construct',
    'dojo/number',
    'dojo/_base/event',

    'esri/request',
    'esri/urlUtils',
    'esri/geometry/Extent',

    // template
    'dojo/text!./Share/templates/Share.html',

    //i18n
    'dojo/i18n!./Share/nls/Share',

    //template widgets
    'dijit/form/CheckBox',

    // css
    'xstyle/css!./Share/css/Share.css'
], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _FloatingWidgetMixin,

    lang,
    on,
    domAttr,
    domConstruct,
    number,
    event,

    esriRequest,
    urlUtils,
    Extent,

    template,

    i18n

) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _FloatingWidgetMixin], {
        name: 'Share',
        baseClass: 'cmvShareWidget',
        widgetsInTemplate: true,
        templateString: template,
        mapClickMode: null,

        // i18n
        i18n: i18n,

        html: '<a href="#">Share</a>',
        domTarget: 'helpDijit',

        url: window.location.href,
        mailURL: 'mailto:%20?subject={title}&body={summary}%20{url}',
        facebookURL: 'https://www.facebook.com/sharer/sharer.php?s=100&p[url]={url}&p[images][0]={image}&p[title]={title}&p[summary]={summary}',
        twitterURL: 'https://twitter.com/intent/tweet?url={url}&text={title}&hashtags={hashtags}',
        googlePlusURL: 'https://plus.google.com/share?url={url}',

        bitlyAPI: location.protocol === 'https:' ? 'https://api-ssl.bitly.com/v3/shorten' : 'http://api.bit.ly/v3/shorten',
        bitlyLogin: '',
        bitlyKey: '',

        title: '',
        image: '',
        summary: '',
        hashtags: '',

        windowSpecs: 'height=500, width=700, scrollbars=false',

        embedHeight: null,
        embedWidth: null,

        embedSizes: [
            {
                'width': '100%',
                'height': '640px'
            }, {
                'width': '100%',
                'height': '480px'
            }, {
                'width': '100%',
                'height': '320px'
            }, {
                'width': '800px',
                'height': '600px'
            }, {
                'width': '640px',
                'height': '480px'
            }, {
                'width': '480px',
                'height': '320px'
            }
        ],

        useExtent: false,
        extentEvt: null,

        draggable: true,

        postCreate: function () {
            this.inherited(arguments);
            if (!this.parentWidget.toggleable) {
                this.parentWidget.draggable = this.draggable;
                var share = domConstruct.place(this.html, this.domTarget);
                on(share, 'click', lang.hitch(this.parentWidget, 'show'));
            }

            this.own(on(this.extentInput, 'click', lang.hitch(this, this.useExtentUpdate)));
            this.setExtentChecked();

            this.watch('url', this.updateUrl);
            this.watch('embedSizes', this.setSizeOptions);
            this.watch('embed', this.updateEmbed);
            this.watch('bitlyUrl', this.updateBitlyUrl);
            this.watch('useExtent', this.useExtentChanged);

            this.updateUrl();
            this.shareLink();
        },

        startup: function () {
            this.inherited(arguments);

            // set sizes for select box
            this.setSizeOptions();

            // handle any query string parameters
            // like zoom to extent
            this.handeQueryParameters();

            // set embed url
            this.updateUrl();

            // update the widget user interface
            this.updateUI();
        },

        handeQueryParameters: function () {
            var urlObject = urlUtils.urlToObject(window.location.href);
            urlObject.query = urlObject.query || {};
            if (urlObject.query.extent) {
                var vals = urlObject.query.extent.split(',');
                if (vals.length === 4 && !isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2]) && !isNaN(vals[3])) {
                    // assumes lat/lng
                    var extent = new Extent({
                        xmin: number.parse(vals[0]),
                        ymin: number.parse(vals[1]),
                        xmax: number.parse(vals[2]),
                        ymax: number.parse(vals[3]),
                        spatialReference: {
                            wkid: 4326
                        }
                    });
                    this.map.setExtent(extent);
                }
            }
        },

        updateUI: function () {

            // select menu change
            this.own(on(this.comboBoxNode, 'change', lang.hitch(this, function (evt) {
                this.set('embedWidth', this.get('embedSizes')[parseInt(evt.currentTarget.value, 10)].width);
                this.set('embedHeight', this.get('embedSizes')[parseInt(evt.currentTarget.value, 10)].height);
                this.setEmbedCode();
            })));

            // facebook click
            this.own(on(this.facebookButton, 'click', lang.hitch(this, function () {
                this.configureShareLink(this.get('facebookURL'));
            })));

            // twitter click
            this.own(on(this.twitterButton, 'click', lang.hitch(this, function () {
                this.configureShareLink(this.get('twitterURL'));
            })));

            // google plus click
            this.own(on(this.gplusButton, 'click', lang.hitch(this, function () {
                this.configureShareLink(this.get('googlePlusURL'));
            })));

            // email click
            this.own(on(this.emailButton, 'click', lang.hitch(this, function () {
                this.configureShareLink(this.get('mailURL'), true);
            })));

            // link click
            this.own(on(this.linkButton, 'click', lang.hitch(this, function () {
                this.configureShareLink(this.get('url'), false, true);
            })));

            // link box click
            this.own(on(this.shareMapUrlText, 'click', lang.hitch(this, function () {
                this.shareMapUrlText.setSelectionRange(0, 9999);
            })));

            // link box mouseup stop for touch devices
            this.own(on(this.shareMapUrlText, 'mouseup', function (evt) {
                event.stop(evt);
            }));

            // embed box click
            this.own(on(this.embedNode, 'click', lang.hitch(this, function () {
                this.embedNode.setSelectionRange(0, 9999);
            })));

            // embed box mouseup stop for touch devices
            this.own(on(this.embedNode, 'mouseup', function (evt) {
                event.stop(evt);
            }));

        },

        updateUrl: function () {
            // nothing currently shortened
            this.shortened = null;
            // no bitly shortened
            this.set('bitlyUrl', null);
            // vars
            var map = this.get('map'),
                url = this.get('url'),
                useSeparator;
            // get url params
            var urlObject = urlUtils.urlToObject(window.location.href);
            urlObject.query = urlObject.query || {};
            // include extent in url
            if (this.get('useExtent') && map) {
                // get map extent in geographic
                var gExtent = map.geographicExtent;
                // set extent string
                urlObject.query.extent = gExtent.xmin.toFixed(6) + ',' + gExtent.ymin.toFixed(6) + ',' + gExtent.xmax.toFixed(6) + ',' + gExtent.ymax.toFixed(6);
            } else {
                urlObject.query.extent = null;
            }

            // create base url
            url = window.location.protocol + '//' + window.location.host + window.location.pathname;
            // each param
            for (var i in urlObject.query) {
                if (urlObject.query[i] && urlObject.query[i] !== 'config') {
                    // use separator
                    if (useSeparator) {
                        url += '&';
                    } else {
                        url += '?';
                        useSeparator = true;
                    }
                    url += i + '=' + urlObject.query[i];
                }
            }
            // update url
            this.set('url', url);
            // reset embed code
            this.setEmbedCode();
            // set url value
            domAttr.set(this.shareMapUrlText, 'value', url);

        },

        updateEmbed: function () {
            domAttr.set(this.embedNode, 'value', this.get('embed'));
        },

        setEmbedCode: function () {
            var es = '<iframe width=\'' + this.get('embedWidth') + '\' height=\'' + this.get('embedHeight') + '\' src=\'' + this.get('url') + '\' frameborder=\'0\' scrolling=\'no\'></iframe>';
            this.set('embed', es);
        },

        setExtentChecked: function () {
            this.extentInput.setValue(this.useExtent);
            if (this.useExtent) {
                this.extentEvt = this.own(this.map.on('extent-change', lang.hitch(this, function () {
                    this.updateUrl();
                })));
            } else if (this.extentEvt && this.extentEvt.remove) {
                this.extentEvt.remove();
            }
        },

        useExtentUpdate: function () {
            this.set('useExtent', this.extentInput.getValue());
        },

        useExtentChanged: function () {
            this.updateUrl();
            this.shareLink();
            this.setExtentChecked();
        },

        setSizeOptions: function () {
            // clear select menu
            this.comboBoxNode.innerHTML = '';
            // if embed sizes exist
            if (this.get('embedSizes') && this.get('embedSizes').length) {
                // map sizes
                for (var i = 0; i < this.get('embedSizes').length; i++) {
                    if (i === 0) {
                        this.set('embedWidth', this.get('embedSizes')[i].width);
                        this.set('embedHeight', this.get('embedSizes')[i].height);
                    }
                    var option = domConstruct.create('option', {
                        value: i,
                        innerHTML: this.get('embedSizes')[i].width + ' x ' + this.get('embedSizes')[i].height
                    });
                    domConstruct.place(option, this.comboBoxNode, 'last');
                }
            }
        },

        updateBitlyUrl: function () {
            var bitly = this.get('bitlyUrl');
            if (bitly) {
                domAttr.set(this.shareMapUrlText, 'value', bitly);
                domAttr.set(this.linkButton, 'href', bitly);
            }
        },

        shareLink: function () {
            if (this.get('bitlyAPI') && this.get('bitlyLogin') && this.get('bitlyKey')) {
                var currentUrl = this.get('url');
                // not already shortened
                if (currentUrl !== this.shortened) {
                    // set shortened
                    this.shortened = currentUrl;
                    // make request
                    esriRequest({
                        url: this.get('bitlyAPI'),
                        callbackParamName: 'callback',
                        content: {
                            uri: currentUrl,
                            login: this.get('bitlyLogin'),
                            apiKey: this.get('bitlyKey'),
                            f: 'json'
                        },
                        load: lang.hitch(this, function (response) {
                            if (response && response.data && response.data.url) {
                                this.set('bitlyUrl', response.data.url);
                            }
                        }),
                        error: function (error) {
                            console.log(error);
                        }
                    });
                }
            }
        },

        configureShareLink: function (Link, isMail, isLink) {
            // replace strings
            var fullLink = lang.replace(Link, {
                url: encodeURIComponent(this.get('bitlyUrl') ? this.get('bitlyUrl') : this.get('url')),
                image: encodeURIComponent(this.get('image')),
                title: encodeURIComponent(this.get('title')),
                summary: encodeURIComponent(this.get('summary')),
                hashtags: encodeURIComponent(this.get('hashtags'))
            });
            // email link
            if (isMail) {
                window.location.href = fullLink;
            // just a normal link
            } else if (isLink) {
                window.open(fullLink);
            } else {
                console.log(this.get('windowSpecs'));
                window.open(fullLink, 'cmvShare', this.get('windowSpecs'));
            }
        }

    });
});