define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Attribute Table Example',
        subHeader: 'This is an example of using an attribute table widget',
        pageTitle: 'CMV Attribute Table Widget'
    },

    collapseButtonsPane: 'center', //center or outer

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
                                url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/4',
                                maxAllowableOffset: 100,
                                where: 'STATE_FIPS = \'06\' OR STATE_FIPS = \'08\''
                            }
                        }
                    }
                ]
            }
        },
        exportDialog: {
            include: true,
            id: 'export',
            type: 'floating',
            path: 'widgets/Export',
            title: 'Export',
            options: {
                // this option can be a string or a function that returns
                // a string.
                //
                // filename: 'my_results'
                filename: function () {
                    var date = new Date();
                    return 'export_results_' + date.toLocaleDateString();
                }
            }
        }
    }
});
