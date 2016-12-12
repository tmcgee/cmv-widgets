define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/lang'
], function (
    declare,
    _WidgetBase,
    topic,
    array,
    lang
) {
    return declare([_WidgetBase], {
        map: true,

        // array of IDs for layers that can be toggled
        layerGroup: [],

        // ID of labels layer (if any)
        labelsID: null,

        postCreate: function () {
            this.inherited(arguments);
            topic.subscribe('layerControl/layerToggle', lang.hitch(this, function (r) {
                if (array.indexOf(this.layerGroup, r.id) >= 0) {
                    array.forEach(this.layerGroup, lang.hitch(this, function (id) {
                        if (id !== r.id) {
                            var lyr = this.map.getLayer(id);
                            if (lyr) {
                                lyr.setVisibility(false);
                            }
                        }
                    }));
                }
            }));
        }
    });
});