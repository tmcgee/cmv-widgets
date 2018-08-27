define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 3,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Introduction Widget',
        subHeader: 'This is an example of the CMV Introduction widget',
        pageTitle: 'CMV Introduction Widget'
    },

    operationalLayers: [
        {
            type: 'dynamic',
            url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
            title: 'Louisville Public Safety',
            options: {
                id: 'louisvillePubSafety',
                opacity: 1.0,
                visible: false
            }
        }
    ],

    widgets: {

        introduction: {
            include: true,
            id: 'introduction',
            type: 'invisible',
            path: 'widgets/Introduction',
            options: 'config/introductionWidget'
        },

        search: {
            include: true,
            type: 'domNode',
            path: 'esri/dijit/Search',
            srcNodeRef: 'geocoderButton',
            options: {
                map: true,
                visible: true,
                enableInfoWindow: false,
                enableButtonMode: false,
                expanded: false
            }
        },

        layerControl: {
            include: true,
            id: 'layerControl',
            type: 'titlePane',
            path: 'gis/dijit/LayerControl',
            title: 'Layers',
            iconClass: 'fa fa-th-list',
            open: true,
            position: 0,
            options: {
                map: true,
                layerControlLayerInfos: true
            }
        },

        measure: {
            include: true,
            id: 'measurement',
            type: 'titlePane',
            canFloat: true,
            path: 'gis/dijit/Measurement',
            title: 'Measure',
            iconClass: 'fa fa-fw fa-expand',
            open: false,
            position: 1,
            options: {
                map: true,
                mapClickMode: true
            }
        },

        print: {
            include: true,
            id: 'print',
            type: 'titlePane',
            canFloat: true,
            path: 'gis/dijit/Print',
            title: 'Print',
            iconClass: 'fa fa-fw fa-print',
            open: false,
            position: 2,
            options: {
                map: true,
                printTaskURL: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'
            }
        }

    }
});