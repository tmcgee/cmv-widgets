define({
    isDebug: false,

    mapOptions: {
        basemap: 'topo',
        center: [-120.0417, 39.0917],
        zoom: 10,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Elevation Profile Example',
        subHeader: 'This is an example of using the Elevation Profile widget',
        pageTitle: 'CMV Elevation Profile Widget'
    },

    collapseButtonsPane: 'center', //center or outer

    panes: {
        bottom: {
            id: 'sidebarBottom',
            placeAt: 'outer',
            splitter: true,
            collapsible: true,
            region: 'bottom',
            open: 'none', // using false doesn't work
            style: 'height: 350px',
            content: '<div id="attributesContainer"></div>'
        }
    },

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
        elevationProfile: {
            include: true,
            type: 'titlePane',
            path: 'widgets/ElevationProfile',
            canFloat: true,
            title: 'Elevation Profile',
            iconClass: 'fa fa-fw fa-area-chart',
            open: true,
            position: 0,
            options: {
                map: true
            }
        },

        attributesTable: {
            include: true,
            id: 'attributesContainer',
            type: 'domNode',
            srcNodeRef: 'attributesContainer',
            path: 'widgets/AttributesTable',
            options: {
                map: true,
                mapClickMode: true,

                // use a tab container for multiple tables or
                // show only a single table
                useTabs: true,

                // used to open the sidebar after a query has completed
                sidebarID: 'sidebarBottom'
            }
        }

    }
});
