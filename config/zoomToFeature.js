define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Zoom To Feature Widget',
        subHeader: 'This is an example of zooming to a feature',
        pageTitle: 'CMV Zoom To Feature Widget'
    },

    collapseButtonsPane: 'center', //center or outer

    operationalLayers: [],

    widgets: {
        zoomToFeature: {
            include: true,
            id: 'zoomToFeature',
            type: 'titlePane',
            title: 'Zoom to A California County',
            position: 0,
            open: true,
            path: 'widgets/ZoomToFeature',
            options: {
                map: true,
                // you can customize the button text
                i18n: {
                    selectFeature: 'Select A County'
                },
                url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2',
                field: 'NAME',
                where: 'STATE_FIPS = \'06\''
            }
        }
    }
});