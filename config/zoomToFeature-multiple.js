define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Multiple Zoom To Feature Widgets',
        subHeader: 'This is an example of including multiple widgets in the same titlePane',
        pageTitle: 'CMV Mutiple Zoom To Feature Widgets'
    },

    collapseButtonsPane: 'center', //center or outer

    operationalLayers: [],

    widgets: {
        zoomContent: {
            include: true,
            id: 'zoomContent',
            type: 'titlePane',
            title: 'Zoom to A County',
            path: 'dijit/layout/ContentPane',
            position: 0,
            open: true,
            options: {
                content: '<div id="zoomToDijit-1"></div><div id="zoomToDijit-2"></div><div id="zoomToDijit-3"></div>'
            }
        },
        anotherWidget: {
            include: true,
            id: 'anotherWidget',
            type: 'titlePane',
            title: 'Another widget',
            path: 'dijit/layout/ContentPane',
            position: 1,
            open: false,
            options: {}
        },
        zoomToFeature1: {
            include: true,
            type: 'domNode',
            id: 'zoomToFeature1',
            srcNodeRef: 'zoomToDijit-1',
            path: 'widgets/ZoomToFeature',
            options: {
                map: true,
                // you can customize the button text
                i18n: {
                    selectFeature: 'California County'
                },
                url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2',
                field: 'NAME',
                where: 'STATE_FIPS = \'06\''
            }
        },
        zoomToFeature2: {
            include: true,
            type: 'domNode',
            id: 'zoomToFeature2',
            srcNodeRef: 'zoomToDijit-2',
            path: 'widgets/ZoomToFeature',
            options: {
                map: true,
                // you can customize the button text
                i18n: {
                    selectFeature: 'Kansas County'
                },
                style: 'margin-top:50px;',
                url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2',
                field: 'NAME',
                where: 'STATE_FIPS = \'20\''
            }
        },
        zoomToFeature3: {
            include: true,
            type: 'domNode',
            id: 'zoomToFeature3',
            srcNodeRef: 'zoomToDijit-3',
            path: 'widgets/ZoomToFeature',
            options: {
                map: true,
                // you can customize the button text
                i18n: {
                    selectFeature: 'South Carolina County'
                },
                style: 'margin-top:50px;',
                url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2',
                field: 'NAME',
                where: 'STATE_FIPS = \'45\''
            }
        }
    }
});