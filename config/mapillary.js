define({
    isDebug: true,

    mapOptions: {
        basemap: 'topo',
        center: [-122.435, 37.775],
        zoom: 13,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Mapillary Widget',
        subHeader: 'This is an example of displaying street level imagery from Mapillary',
        pageTitle: 'CMV Mapillary Widget'
    },

    collapseButtonsPane: 'center', //center or outer

    operationalLayers: [],

    widgets: {
        mapillary: {
            include: true,
            type: 'titlePane',
            title: 'Mapillary',
            iconClass: 'fa-location-arrow fa-rotate-90',
            open: true,
            position: 0,
            path: 'widgets/Mapillary',
            canFloat: true,
            paneOptions: {
                resizable: true,
                resizeOptions: {
                    minSize: {
                        w: 250,
                        h: 250
                    }
                }
            },
            options: {
                map: true,
                mapillaryOptions: {
                    // this is for demo purposes only
                    // get your own clientID at mapillary.com
                    clientID: 'cjJ1SUtVOEMtdy11b21JM0tyYTZIQTpiNjQ0MTgzNTIzZGM2Mjhl',
                    photoID: null
                }
            }
        }
    }
});
