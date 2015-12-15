define([
    'esri/urlUtils',
    'esri/layers/ImageParameters'
], function (urlUtils, ImageParameters) {
    'use strict';

    urlUtils.addProxyRule({
        urlPrefix: 'http://gis.scwa.ca.gov',
        proxyUrl: '/proxy/proxy.ashx'
    });

    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';

    return {
        isDebug: true,

        mapOptions: {
            basemap: 'streets',
            center: [-122.6314, 38.2658],
            zoom: 19,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV Report Widget',
            subHeader: 'This is an example of the Report Widget',
            pageTitle: 'CMV Report Widget'
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
                type: 'dynamic',
                url: 'https://xara1-4.cityofpetaluma.net/arcgis/rest/services/BaseMaps/Basemap_WM_CL/MapServer',
                title: 'Basemap',
                options: {
                    id: 'countyBasemap',
                    opacity: 1,
                    visible: true,
                    imageParameters: imageParameters
                }
            },
            {
                type: 'dynamic',
                url: 'https://xara1-4.cityofpetaluma.net/arcgis/rest/services/BaseMaps/Parcels_Public/MapServer',
                title: 'Parcels',
                options: {
                    id: 'countParcels',
                    opacity: 0.7,
                    visible: true,
                    imageParameters: imageParameters
                },
                identifyLayerInfos: {
                    layerIds: [0]
                }
            }
        ],

        widgets: {
            growler: {
                include: true,
                id: 'growler',
                type: 'domNode',
                path: 'gis/dijit/Growler',
                srcNodeRef: 'growlerDijit',
                options: {}
            },
            report: {
                include: true,
                id: 'report',
                type: 'invisible',
                path: 'widgets/Report',
                options: 'config/reportWidget'
            }
        }
    };
});