define({
    isDebug: false,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV Export Graphics Widget',
        subHeader: 'This is an example of exporting graphics from specific layers',
        pageTitle: 'CMV Export Graphics Widget'
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

        drawContentPane: {
            include: true,
            id: 'drawContentPane',
            type: 'titlePane',
            title: 'Drawing',
            path: 'dijit/layout/ContentPane',
            iconClass: 'fas fa-fw fa-paint-brush',
            position: 0,
            open: true,
            options: {
                content: '<div id="drawDijit"></div><div id="exportGraphicsDijit"></div>'
            }
        },

        draw: {
            include: true,
            id: 'draw',
            type: 'domNode',
            srcNodeRef: 'drawDijit',
            path: 'gis/dijit/Draw',
            options: {
                map: true,
                style: 'padding-bottom:15px;border-bottom: 1px solid #CCC;',
                mapClickMode: true
            }
        },

        exportGraphics: {
            include: true,
            id: 'exportGraphics',
            type: 'domNode',
            srcNodeRef: 'exportGraphicsDijit',
            path: 'widgets/ExportGraphics',
            options: {
                map: true,

                exportOptions: {
                    excel: false,
                    xlsExcel: false,
                    csv: false,

                    shapefile: true,
                    kml: true,
                    kmz: true,
                    geojson: false,
                    topojson: false,
                    wkt: false,

                    defaultExportType: 'shapefile',
                    // this option can be a string or a function that returns
                    // a string.
                    //
                    // filename: 'my_results'
                    filename: function () {
                        var date = new Date();
                        return 'export_graphics_' + date.toLocaleDateString();
                    }
                }

            }
        },

        exportDialog: {
            include: true,
            id: 'export',
            type: 'floating',
            path: 'widgets/Export',
            title: '<i class="fa fa-fw fa-download"></i> Export',
            preload: true,
            options: {}
        }
    }
});
