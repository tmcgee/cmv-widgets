define([
    'esri/config'
], function (esriConfig) {

    esriConfig.defaults.io.corsEnabledServers.push('api.what3words.com');

    return {
        isDebug: false,

        mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 5,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV what3words Widget',
            subHeader: 'This is an example of using what3words',
            pageTitle: 'CMV what3words Widget'
        },

        collapseButtonsPane: 'center', //center or outer

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
            what3words: {
                include: true,
                id: 'what3words',
                type: 'titlePane',
                title: 'what3words',
                canFloat: true,
                position: 0,
                open: true,
                path: 'widgets/What3Words',
                options: {
                    map: true,
                    key: '123456'
                }
            }
        }
    };
});