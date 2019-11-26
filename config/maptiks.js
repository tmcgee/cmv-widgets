define([
    'esri/layers/ImageParameters'
], function (ImageParameters) {

    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';

    return {
        isDebug: false,

        mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 5,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV Maptiks Widget',
            subHeader: 'This is an example of using the CMV Maptiks Widget',
            pageTitle: 'CMV Maptiks Widget'
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
            },
            {
                type: 'dynamic',
                url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer',
                title: 'Cities',
                options: {
                    id: 'cities',
                    opacity: 0.7,
                    visible: true,
                    imageParameters: imageParameters
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
                open: true,
                position: 0,
                options: {
                    map: true,
                    layerControlLayerInfos: true
                }
            },

            maptiks: {
                include: true,
                type: 'map',
                path: 'widgets/Maptiks',
                options: {
                    map: true,
                    // signup and get your track code and id at https://maptiks.com/
                    maptiksTrackcode: '',
                    maptiksId: ''
                }
            }
        }
    };
});