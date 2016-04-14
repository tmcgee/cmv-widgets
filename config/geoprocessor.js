define([
    'dojo/number'
], function (
    dojoNum
) {

    return {
        isDebug: false,

        mapOptions: {
            basemap: 'topo',
            center: [-122.385, 37.615],
            zoom: 12,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV Geoprocessor Example',
            subHeader: 'Click anywhere on the map to execute the Geoprocessing Task',
            pageTitle: 'CMV Geoprocessor Example'
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
                open: 'none', // using false doesn't work
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
            gpTest: {
                include: true,
                id: 'gpTest',
                type: 'invisible',
                path: 'widgets/Geoprocessor',
                options: {
                    map: true
                }
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
                            title: 'GP Test',
                            symbolOptions: {
                                features: {
                                    polygon: {
                                        color: [255, 127, 0, 200],
                                        outline: {
                                            color: [0, 0, 0, 128]
                                        }
                                    }
                                }
                            },
                            gridOptions: {
                                columns: [
                                    {
                                        field: 'Id',
                                        label: 'ID'
                                    },
                                    {
                                        field: 'Shape_Length',
                                        label: 'Length',
                                        formatter: dojoNum.format
                                    },
                                    {
                                        field: 'Shape_Area',
                                        label: 'Area',
                                        formatter: dojoNum.format
                                    }
                                ]
                            },
                            toolbarOptions: {
                                'export': {
                                    show: false
                                }
                            }
                        }
                    ]
                }
            }
        }
    };
});