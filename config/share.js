define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Sharing Widget',
        subHeader: 'This is an example of using the Sharing widget',
        pageTitle: 'CMV Sharing Widget'
    },


    panes: {
        left: {
            collapsible: false,
            style: 'display:none'
        }
    },
    collapseButtonsPane: 'center', //center or outer

    operationalLayers: [],

    widgets: {
        share: {
            include: true,
            id: 'share',
            type: 'floating',
            path: 'widgets/Share',
            title: 'Share This Map',
            options: {
                map: true
            }
        }
    }
});