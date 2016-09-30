define([
    'esri/urlUtils'
], function (urlUtils) {

    urlUtils.addProxyRule({
        urlPrefix: 'http://server.domain',
        proxyUrl: '/proxy/proxy.ashx'
    });

    return {
        isDebug: true,

        mapOptions: {
            basemap: 'hybrid',
            center: [-122.6314, 38.2658],
            // center: [-122.431297, 37.773972],
            zoom: 19,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV Report Widget',
            subHeader: 'This is an example of the Report Widget',
            pageTitle: 'CMV Report Widget'
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
            report: {
                include: true,
                id: 'report',
                type: 'invisible',
                path: 'widgets/Report',
                options: 'config/reportWidget'
            }
        }
    };
});