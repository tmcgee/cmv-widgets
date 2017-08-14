define([
    'esri/config',
    'esri/tasks/GeometryService',
    'esri/layers/ImageParameters'
], function (esriConfig, GeometryService, ImageParameters) {

    var style = document.createElement('style');
    style.type = 'text/css';
    var styles = '.identifyContent_parent .titlePaneIcon{color:#00C;}';
    style.appendChild(document.createTextNode(styles));
    document.head.appendChild(style);

    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';

    return {
        isDebug: false,

        defaultMapClickMode: 'identify',
        mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 4,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV Identify Panel Example',
            subHeader: 'This is an example of the Identify Panel Widget',
            pageTitle: 'CMV Identify Panel Example'
        },

        collapseButtonsPane: 'center', //center or outer

        operationalLayers: [
            {
                type: 'dynamic',
                url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
                title: 'Louisville Public Safety',
                options: {
                    id: 'louisvillePubSafety',
                    opacity: 1.0,
                    visible: true,
                    imageParameters: imageParameters
                }
            },
            {
                type: 'dynamic',
                url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/DamageAssessment/MapServer',
                title: 'Damage Assessment',
                options: {
                    id: 'DamageAssessment',
                    opacity: 1.0,
                    visible: true,
                    imageParameters: imageParameters
                }
            },
            {
                type: 'dynamic',
                url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer',
                title: 'Cities',
                options: {
                    id: 'cities',
                    opacity: 0.7,
                    visible: true,
                    imageParameters: imageParameters
                }
            }
        ],

        widgets: {

            identifyPanel: {
                include: true,
                type: 'titlePane',
                path: 'widgets/IdentifyPanel',
                position: 0,
                title: 'Identify Features',
                iconClass: 'fa-info-circle',
                open: true,
                options: {
                    map: true,
                    mapClickMode: true,
                    buttons: [
                        {
                            id: 'identifypanel-button-example',
                            label: 'This is an example button',
                            iconClass: 'fa fa-fw fa-comment',
                            showLabel: false,
                            style: 'float:left;margin-right:10px;display:none;',
                            onClick: function () {
                                /*eslint no-alert: 0*/
                                alert('Hello from the Test Button');
                            }
                        }
                    ]
                }
            },

            identify: {
                include: true,
                type: 'invisible',
                path: 'gis/dijit/Identify',
                preload: true,
                options: {
                    map: true,
                    mapClickMode: true,
                    identifyLayerInfos: true,
                    identifyTolerance: 10
                }
            },

            exportDialog: {
                include: true,
                id: 'export',
                type: 'floating',
                path: 'widgets/Export',
                title: 'Export',
                iconClass: 'fa-download',
                preload: true,
                options: {
                    excel: false,
                    xlsExcel: true,
                    csv: true,

                    shapefile: true,
                    kml: true,
                    kmz: true,
                    geojson: true,
                    topojson: true,
                    wkt: true,

                    defaultExportType: 'shapefile',
                    // this option can be a string or a function that returns
                    // a string.
                    //
                    // filename: 'my_results'
                    filename: function () {
                        var date = new Date();
                        return 'identified_feature_' + date.toLocaleDateString();
                    }
                }
            }
        }
    };
});