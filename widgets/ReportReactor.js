define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/query',
    'dojo/on',
    'dojo/topic',
    'dojo/_base/lang'

], function (
    declare,
    _WidgetBase,

    domQuery,
    on,
    topic,
    lang
) {
    return declare([_WidgetBase], {

        postCreate: function () {
            this.inherited(arguments);

            this.map.infoWindow.on('selection-change', lang.hitch(this, function (evt) {
                var infoWindow = evt.target;
                var nodes = domQuery('#parcel-report', infoWindow.domNode),
                    targetNode = null;
                if (nodes.length > 0) {
                    targetNode = nodes[0];
                    if (targetNode) {
                        on(targetNode, 'click', lang.hitch(this, 'parcelReportClick'));
                    }
                }
            }));
        },

        parcelReportClick: function () {
            var feature = this.map.infoWindow.getSelectedFeature();
            topic.publish('parcelReportWidget/createReport', {
                feature: feature
            });
            return false;
        }

    });
});