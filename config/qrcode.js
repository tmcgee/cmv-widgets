define({
    isDebug: false,

    mapOptions: {
        basemap: 'topo',
        center: [-122.385, 37.615],
        zoom: 12,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV QR Code Widget',
        subHeader: 'This is an example of using the QR Code widget',
        pageTitle: 'CMV QRCode Widget'
    },

    collapseButtonsPane: 'center', //center or outer

    operationalLayers: [],

    widgets: {
        qrcode: {
            include: true,
            type: 'titlePane',
            position: 0,
            path: 'widgets/QRCode',
            title: 'QR Code',
            open: true,
            options: {
                map: true
            }
        }
    }
});