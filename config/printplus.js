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
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 4,
            sliderStyle: 'small'
        },

        titles: {
            header: 'CMV PrintPlus Widget',
            subHeader: 'This is an example of the PrintPlus Widget',
            pageTitle: 'CMV PrintPlus Widget'
        },

		collapseButtonsPane: 'center', //center or outer

		operationalLayers: [
			{
				type: 'dynamic',
				url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
				title: 'Louisville Public Safety',
				options: {
					id: 'louisvillePubSafety',
					opacity: 1.0,
					visible: true,
					imageParameters: imageParameters
				},
				identifyLayerInfos: {
					layerIds: [2, 4, 5, 8, 12, 21]
				}
			},
			{
	            type: 'dynamic',
	            url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/DamageAssessment/MapServer',
	            title: 'Damage Assessment',
	            options: {
	                id: 'DamageAssessment',
	                opacity: 1.0,
	                visible: true,
	                imageParameters: imageParameters
	            }
            }
		],

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