define([
], function () {

	return {
		// used for debugging your app
		isDebug: false,

		//default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multipult map click actions from taking place (ie identify while drawing).
		defaultMapClickMode: 'identify',
		// map options, passed to map constructor. see: https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1
		mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 5,
			sliderStyle: 'small'
		},

        titles: {
            header: 'CMV Disclaimer Widget',
            subHeader: 'This is an example of using a disclaimer',
            pageTitle: 'CMV Disclaimer Widget'
        },

		collapseButtonsPane: 'center', //center or outer

        panes: {
            left: {
                collapsible: false,
                style: 'display:none'
            }
        },

		// operationalLayers: Array of Layers to load on top of the basemap: valid 'type' options: 'dynamic', 'tiled', 'feature'.
		// The 'options' object is passed as the layers options for constructor. Title will be used in the legend only. id's must be unique and have no spaces.
		// 3 'mode' options: MODE_SNAPSHOT = 0, MODE_ONDEMAND = 1, MODE_SELECTION = 2
		operationalLayers: [],

		// set include:true to load. For titlePane type set position the the desired order in the sidebar
		widgets: {
            disclaimer: {
                include: true,
                id: 'disclaimer',
                type: 'floating',
                path: 'widgets/Disclaimer',
                title: 'Beware!!!',
                options: {

                    // you can customize the button text
                    i18n: {
                    //    accept: 'Arghhhh!',
                    //    decline: 'Run Away!'
                    },

                    // pre-define the height so the dialog is centered properly
                    style: 'height:295px;width:375px;',

                    // you can put your content right in the config
                    //content: '<div align="center" style="background-color:black;color:white;font-size:18px;padding:20px;">Abandon all hope, ye who enter here...<br/><img src="http://fc06.deviantart.net/fs5/i/2004/313/2/5/Captain_Jolly_Roger_by_ramiusraven.jpg" style="width:160px;margin:25px;" /></div>'

                    // or you can provide the url for another page with the content
                    href: './config/disclaimer.html',

                    // the url to go to, if the user declines
                    //declineHref: 'http://esri.com/'

                }

            }
		}
	};
});