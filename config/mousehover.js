define([
    'dojo/_base/lang',
    'dojo/dom-style',

    'dijit/popup',
    'dijit/TooltipDialog',

    'esri/graphic',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/Color'
], function (
    lang,
    domStyle,

    popup,
    TooltipDialog,

    Graphic,
    SimpleFillSymbol,
    SimpleLineSymbol,
    Color
) {
    return {
        isDebug: true,

        mapOptions: {
            basemap: 'hybrid',
            center: [-83.29, 42.585],
            zoom: 16,
            sliderStyle: 'small'
        },

        titles: {
            header: 'Mouse Hover Example',
            subHeader: 'This is an example of mouse hover',
            pageTitle: 'Mouse Hover Example'
        },


        panes: {
            left: {
                collapsible: false,
                style: 'display:none'
            }
        },
        collapseButtonsPane: 'center', //center or outer

        operationalLayers: [
            {
                type: 'feature',
                url: 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/BloomfieldHillsMichigan/Parcels/MapServer/2',
                title: 'Parcels',
                options: {
                    id: 'parcels',
                    opacity: 0.7,
                    mode: 1,
                    outFields: ['PARCELID']
                }
            }

        ],

        widgets: {
            mouseover: {
                include: true,
                type: 'invisible',
                id: 'mouseover',
                path: 'dijit/_WidgetBase',
                options: {
                    map: true,
                    startup: function () {
                        // set reference to layer by layerid
                        var parcels = this.map.getLayer('parcels');

                        // set up ToolTip dialog
                        var dialog = new TooltipDialog({
                            style: 'position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100'
                        });
                        dialog.startup();
                        domStyle.set(dialog.domNode, 'opacity', 0.85);

                        // set up outline color and fill of symbol when mouse is over feature
                        var highlightSymbol = new SimpleFillSymbol(
                            SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(
                                SimpleLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 3
                            ),
                            new Color([125, 125, 125, 0.35])
                        );

                        // enable mouse events on graphics within map
                        this.map.graphics.enableMouseEvents();

                        // clear graphics and close popup when mouse moves out of features
                        this.map.graphics.on('mouse-out', function () {
                            this._map.graphics.clear();
                            popup.close(dialog);
                        });

                        // when mouse is over feature, setup popup attributes,
                        // highlight and fill the graphic, add to map, show popup
                        parcels.on('mouse-over', function (evt) {
                            this._map.graphics.clear();
                            var highlightGraphic = new Graphic(evt.graphic.geometry, highlightSymbol);
                            this._map.graphics.add(highlightGraphic);

                            var t = '<b>Parcel ID </b>: ${PARCELID}';
                            var content = lang.replace(t, evt.graphic.attributes);
                            dialog.setContent(content);

                            popup.open({
                                popup: dialog,
                                orient: ['below-centered', 'above-centered'],
                                x: evt.pageX,
                                y: evt.pageY
                            });
                        });
                    }
                }
            }
        }
    };
});