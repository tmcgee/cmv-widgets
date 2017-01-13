define({
    isDebug: false,

    mapOptions: {
        basemap: 'topo',
        center: [-122.385, 37.615],
        zoom: 12,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Open External Map Widget',
        subHeader: 'This is an example of using the Open External Map widget',
        pageTitle: 'CMV Open External Map Widget'
    },

    panes: {
        left: {
            style: 'width:350px;'
        }
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
        externalmap: {
            include: true,
            id: 'externalmap',
            type: 'titlePane',
            canFloat: true,
            position: 0,
            path: 'widgets/OpenExternalMap',
            title: 'Open External Map',
            open: true,
            options: {
                map: true
            }
        },
        toggleStreetViewTiles: {
            include: true,
            type: 'invisible',
            path: 'widgets/ToggleStreetViewTiles',
            options: {
                map: true
            }
        }
    }
});