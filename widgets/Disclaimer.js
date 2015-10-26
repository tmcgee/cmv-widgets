/*eslint strict: 0 */
define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'gis/dijit/_FloatingWidgetMixin',

    'dojo/text!./Disclaimer/templates/Disclaimer.html',
    'dojo/i18n!./Disclaimer/nls/Disclaimer',

    'dijit/layout/ContentPane',
    'dijit/form/Form',
    'dijit/form/Button',

    'xstyle/css!./Disclaimer/css/Disclaimer.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _FloatingWidgetMixin,

    DisclaimerTemplate,
    i18n
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _FloatingWidgetMixin], {
        widgetsInTemplate: true,
        templateString: DisclaimerTemplate,
        defaultI18n: i18n,
        i18n: {},
        baseClass: 'cmvDisclaimerWidget',
        draggable: false,

        openOnStartup: true,

        content: '',
        href: null,
        declineHref: '#',

        postMixInProperties: function () {
            this.inherited(arguments);
            this.i18n = this.mixinDeep(this.defaultI18n, this.i18n);
        },

        postCreate: function () {
            this.inherited(arguments);

            this.messageNode.set('content', this.content);
            if (this.href) {
                this.messageNode.set('href', this.href);
            }

            // prevent the dialog from closing with the escape key
            this.parentWidget._onKey = function () {};
        },

        acceptDisclaimer: function () {
            this.parentWidget.hide();
        },

        declineDisclaimer: function () {
            window.location.href = this.declineHref;
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