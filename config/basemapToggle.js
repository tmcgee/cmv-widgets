define([
], function () {

	return {
		isDebug: false,

		mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 5,
			sliderStyle: 'small'
		},

        titles: {
            header: 'CMV Basemap Toggle Example',
            subHeader: 'This is an example of using a basemap toggle',
            pageTitle: 'CMV Basemap Toggle Example'
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
            basemaps: {
                include: true,
                id: 'basemaps',
                type: 'domNode',
                path: 'esri/dijit/BasemapToggle',
                srcNodeRef: 'basemapsDijit',
                options: {
                    map: true,
                    basemap: 'satellite'
                }
            }
		}
	};
});