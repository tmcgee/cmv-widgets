define([], function () {

    return {
        isDebug: false,

        //default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multipult map click actions from taking place (ie identify while drawing).
        defaultMapClickMode: 'identify',
        mapOptions: {
            basemap: 'hybrid',
            center: [-122.6314, 38.2658],
            zoom: 19,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV Report Widget',
            subHeader: 'Identify a parcel by clicking the map',
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
                url: 'http://gis-webpub.sonoma-county.org/arcgis/rest/services/BaseMap/Parcels/MapServer',
                title: 'Parcels',
                options: {
                    id: 'parcels',
                    opacity: 1
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
                    mapRightClickMenu: true,
                    identifyLayerInfos: true,
                    identifyTolerance: 5,
                    identifies: {
                        parcels: {
                            0: {
                                fieldInfos: [
                                    {
                                        fieldName: 'APN',
                                        visible: true
                                    },
                                    {
                                        fieldName: 'Reports',
                                        visible: true,
                                        formatter: function () {
                                            return '<a id="parcel-report" title="Run Parcel Report" style="cursor:pointer">Parcel Report</a>';
                                        },
                                        useExpression: false
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            report: {
                include: true,
                id: 'report',
                type: 'invisible',
                path: 'widgets/Report',
                options: 'config/reportWidget'
            },
            reportReactor: {
                include: true,
                id: 'reportReactor',
                type: 'invisible',
                path: 'widgets/ReportReactor',
                options: {
                    map: true
                }
            }
        }
    };
});