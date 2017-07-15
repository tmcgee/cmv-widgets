define([
    'esri/config',
    'esri/tasks/GeometryService',
    'esri/layers/ImageParameters'
], function (esriConfig, GeometryService, ImageParameters) {

    esriConfig.defaults.geometryService = new GeometryService('https://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';

    return {
        isDebug: false,

        defaultMapClickMode: 'identify',
        mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 4,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV Search Example',
            subHeader: 'This is an example of the Search Widget',
            pageTitle: 'CMV Search Example'
        },

        panes: {
            left: {
                style: 'width:350px'
            },
            bottom: {
                id: 'sidebarBottom',
                placeAt: 'outer',
                splitter: true,
                collapsible: true,
                region: 'bottom',
                open: 'none', // using false doesn't work
                style: 'height: 200px',
                content: '<div id="attributesContainer"></div>'
            }
        },
        collapseButtonsPane: 'center', //center or outer

        operationalLayers: [
            {
                type: 'dynamic',
                url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
                title: 'Louisville Public Safety',
                options: {
                    id: 'louisvillePubSafety',
                    opacity: 1.0,
                    visible: true,
                    imageParameters: imageParameters
                },
                identifyLayerInfos: {
                    layerIds: [2, 4, 5, 8, 12, 21]
                }
            },
            {
                type: 'dynamic',
                url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/DamageAssessment/MapServer',
                title: 'Damage Assessment',
                options: {
                    id: 'DamageAssessment',
                    opacity: 1.0,
                    visible: true,
                    imageParameters: imageParameters
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
            identify: {
                include: true,
                id: 'identify',
                type: 'invisible',
                path: 'gis/dijit/Identify',
                options: {
                    map: true,
                    mapClickMode: true,
                    identifyLayerInfos: true,
                    identifyTolerance: 10
                }
            },

            layerControl: {
                include: true,
                id: 'layerControl',
                type: 'titlePane',
                path: 'gis/dijit/LayerControl',
                title: 'Layers',
                iconClass: 'fa-th-list',
                open: false,
                position: 0,
                options: {
                    map: true,
                    layerControlLayerInfos: true,
                    separated: true
                }
            },

            search: {
                include: true,
                id: 'search',
                type: 'titlePane',
                iconClass: 'fa-search',
                path: 'widgets/Search',
                title: 'Search',
                open: true,
                position: 1,
                canFloat: true,
                paneOptions: {
                    resizable: true,
                    resizeOptions: {
                        minSize: {
                            w: 650,
                            h: 520
                        }
                    }
                },
                options: 'config/searchWidget'
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
                    useTabs: true,

                    // used to open the sidebar after a query has completed
                    sidebarID: 'sidebarBottom'
                }
            },

            messagebox: {
                include: true,
                type: 'invisible',
                path: 'widgets/MessageBox',
                options: {}
            },

            exportDialog: {
                include: true,
                id: 'export',
                type: 'floating',
                path: 'widgets/Export',
                title: 'Export',
                preload: true,
                options: {}
            }
        }
    };
});