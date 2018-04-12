define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'gis/dijit/_FloatingWidgetMixin',

    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-construct',

    'dijit/registry',

    'dojo/text!./LocatorControl/templates/LocatorControl.html',
    'dojo/i18n!./LocatorControl/nls/LocatorControl',

    'dijit/form/Form',
    'dijit/form/CheckBox',
    'dijit/form/NumberTextBox',

    'xstyle/css!./LocatorControl/css/LocatorControl.css'

], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _FloatingWidgetMixin,

    lang,
    on,
    domConstruct,

    registry,

    template,
    i18n
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _FloatingWidgetMixin], {
        widgetsInTemplate: true,
        templateString: template,
        i18n: i18n,
        baseClass: 'cmwLocatorControlWidget',

        html: '<i class="fa fa-compass fa-2x fa-fw" style="cursor:pointer;color:#FF0"></i>',
        domTarget: 'helpDijit',
        draggable: true,

        locatorWidgetID: 'locateButton_widget',
        locateWidget: null,

        postCreate: function () {
            this.inherited(arguments);

            if (!this.parentWidget.toggleable) {
                this.parentWidget.draggable = this.draggable;
                var btn = domConstruct.place(this.html, this.domTarget);
                on(btn, 'click', lang.hitch(this.parentWidget, 'show'));
            }

            this.widgetChecker = window.setInterval(lang.hitch(this, 'checkForLocator'), 100);
        },

        onValueChange: function () {
            if (this.locateWidget) {
                this.locateWidget.set('centerAt', this.centerAtDijit.get('checked'));
                this.locateWidget.set('useTracking', this.useTrackingDijit.get('checked'));

                this.locateWidget.set('setScale', this.setScaleDijit.get('checked'));
                this.locateWidget.set('scale', this.scaleDijit.get('value'));
            }
        },

        checkForLocator: function () {
            var widget = registry.byId(this.locatorWidgetID);
            if (widget) {
                this.locateWidget = widget;

                this.centerAtDijit.set('checked', this.locateWidget.get('centerAt'));
                this.useTrackingDijit.set('checked', this.locateWidget.get('useTracking'));

                this.setScaleDijit.set('checked', this.locateWidget.get('setScale'));
                this.scaleDijit.set('value', this.locateWidget.get('scale'));

                window.clearInterval(this.widgetChecker);
                return;
            }
        }
    });
});