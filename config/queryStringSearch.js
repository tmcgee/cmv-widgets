define([
    'dojo/io-query'
], function (ioQuery) {
    'use strict';
    var uri = window.location.href;
    var qs = uri.substring(uri.indexOf('?') + 1, uri.length);
    var qsObj = ioQuery.queryToObject(qs);
    var fips = qsObj.fips || '';

    return {
        isDebug: false,

        mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 5,
            sliderStyle: 'small'
        },

        panes: {
            left: {
                collapsible: false,
                style: 'display:none'
            },
            bottom: {
                id: 'sidebarBottom',
                placeAt: 'outer',
                splitter: true,
                collapsible: true,
                region: 'bottom',
                style: 'height:200px;',
                content: '<div id="attributesContainer"></div>'
            }
        },

        operationalLayers: [],

        widgets: {
            growler: {
                include: true,
                id: 'growler',
                type: 'domNode',
                path: 'gis/dijit/Growler',
                srcNodeRef: 'growlerDijit',
                options: {}
            },
            attributesTable: {
                include: true,
                id: 'attributesContainer',
                type: 'domNode',
                srcNodeRef: 'attributesContainer',
                path: 'widgets/AttributesTable',
                options: {
                    map: true,
                    mapClickMode: true,

                    // use a tab container for multiple tables or
                    // show only a single table
                    useTabs: false,

                    // used to open the sidebar after a query has completed
                    sidebarID: 'sidebarBottom',

                    tables: [
                        {
                            title: 'Census',
                            topicID: 'censusQuery',
                            queryOptions: {
                                queryParameters: {
                                    url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/4',
                                    where: 'FIPS = \'' + fips + '\''
                                },
                                idProperty: 'ObjectID'
                            },
                            toolbarOptions: {
                                show: false
                            }
                        }
                    ]
                }
            }
        }
    };
});