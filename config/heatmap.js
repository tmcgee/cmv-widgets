define({
    isDebug: true,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 3,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Heatmap Widget',
        subHeader: 'This is an example of the CMV Heatmap widget',
        pageTitle: 'CMV Heatmap Widget'
    },

    operationalLayers: [
        {
            type: 'feature',
            url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Earthquakes_Since1970/MapServer/0',
            title: 'Earthquakes Since 1970',
            options: {
                id: 'earthquakes',
                opacity: 1.0,
                visible: true,
                mode: 0
            }
        },
        {
            type: 'feature',
            url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer/0',
            title: 'Cities',
            options: {
                id: 'cities',
                opacity: 1.0,
                visible: false
            }
        }
    ],

    widgets: {

        layerControl: {
            include: true,
            id: 'layerControl',
            type: 'titlePane',
            path: 'gis/dijit/LayerControl',
            title: 'Layers',
            iconClass: 'fas fa-th-list',
            open: false,
            position: 0,
            preload: true,
            options: {
                map: true,
                layerControlLayerInfos: true,
                separated: true
            }
        },

        heatmap: {
            include: true,
            id: 'heatmap',
            type: 'titlePane',
            title: 'Heatmap',
            iconClass: 'fas fa-fire',
            open: true,
            position: 1,
            path: 'widgets/Heatmap',
            options: {
                map: true,
                layerControlLayerInfos: true,
                layers: [
                    //{id: 'earthquakes', fields: ['magnitude', 'num_deaths']}
                ]
            }
        },
        messagebox: {
            include: true,
            id: 'messagebox',
            type: 'invisible',
            path: 'widgets/MessageBox',
            options: {}
        }
    }
});