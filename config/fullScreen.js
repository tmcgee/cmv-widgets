define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Full Screen Widget',
        subHeader: 'This is an example of maximizing the map to full screen',
        pageTitle: 'CMV Full Screen Widget'
    },

    panes: {
        left: {
            content: '<div style="margin:10px;"><h2>Full Screen Widget</h2>This pane will collapse when the map is full screen.</div>'
        }
    },
    collapseButtonsPane: 'center', //center or outer

    operationalLayers: [],

    widgets: {
        fullScreen: {
            include: true,
            id: 'fullScreen',
            type: 'domNode',
            path: 'widgets/FullScreen',
            srcNodeRef: 'homeButton',
            options: {}
        }
    }
});