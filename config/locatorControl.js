define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Locator Control Widget',
        subHeader: 'This is an example of using the Locator Control widget',
        pageTitle: 'CMV Locator Conntrol Widget'
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
        growler: {
            include: true,
            id: 'growler',
            type: 'domNode',
            path: 'gis/dijit/Growler',
            srcNodeRef: 'growlerDijit',
            options: {}
        },
        locateButton: {
            include: true,
            id: 'locateButton',
            type: 'domNode',
            path: 'gis/dijit/LocateButton',
            srcNodeRef: 'homeButton',
            options: {
                map: true,
                scale: 1000,
                highlightLocation: true,
                useTracking: false,
                clearOnTrackingStop: true,
                geolocationOptions: {
                    maximumAge: 0,
                    timeout: 5000,
                    enableHighAccuracy: true
                }
            }
        },
        locatorControl: {
            include: true,
            id: 'locatorControl',
            type: 'floating',
            path: 'widgets/LocatorControl',
            title: 'Locator Settings',
            iconClass: 'fas fa-compass',
            preload: true,
            options: {
                html: '<i class="fa fa-compass fa-3x" style="cursor:pointer;"></i>',
                domTarget: 'locateButton',
                openOnStartup: true
            }
        }
    }
});
