define([
    'esri/config',
    'esri/tasks/GeometryService',
    'esri/layers/ImageParameters'
], function (esriConfig, GeometryService, ImageParameters) {

    esriConfig.defaults.geometryService = new GeometryService('http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';

    return {
        isDebug: true,

        mapOptions: {
            basemap: 'topo',
            center: [-120.0417, 39.0917],
            zoom: 10,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV PrintPlus Widget',
            subHeader: 'This is an example of the PrintPlus Widget',
            pageTitle: 'CMV PrintPlus Widget'
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
            print: {
                include: true,
                id: 'print',
                type: 'titlePane',
                path: 'widgets/PrintPlus',
                canFloat: false,
                title: 'Print Plus',
                open: true,
                position: 0,
                options: 'config/printplusWidget'
            }
        }
    };
});