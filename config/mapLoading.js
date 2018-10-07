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
            header: 'CMV MapLoader Widget',
            subHeader: 'This is an example of using a Map Loader',
            pageTitle: 'CMV MapLoader'
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
            mapLoading: {
                include: true,
                type: 'map',
                path: 'widgets/MapLoading',
                options: {
                    map: true
                }
            }
        }
    };
});