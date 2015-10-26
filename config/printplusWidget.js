define({
    map: true,
    printTaskURL: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
    copyrightText: 'Copyright 2014',
    authorText: 'Me',
    defaultTitle: 'Viewer Map',
    defaultFormat: 'PDF',
    defaultLayout: 'Letter ANSI A Landscape',

    //Print Enhancements BEGIN
    defaultDpi: 96,
    noTitleBlockPrefix: 'No TB ',
    layoutParams: {
        // The params array defines the template dimensions so the template footprint can be displayed on the map.
        // The first item is the page size.
        // The second item is the map hole size.
        // The third item is the offset to the lower left corner of the map area.
        // The fourth item is the side and top borders for the layout with no title block.
        'Letter ANSI A Landscape': {
            alias: 'Letter Landscape (ANSI A)',
            units: 'esriInches',
            pageSize: {x: 11, y: 8.5},
            mapSize: {x: 10, y: 6.25},
            pageMargins: {x: 0.5, y: 1.5},
            titleBlockOffsets: {x: 0.5, y: 0.5}
        },
        'Letter ANSI A Portrait': {
            alias: 'Letter Portrait (ANSI A)',
            units: 'esriInches',
            pageSize: {x: 8.5, y: 11},
            mapSize: {x: 7.5, y: 8},
            pageMargins: {x: 0.5, y: 2.25},
            titleBlockOffsets: {x: 0.5, y: 0.5}
        },
        'Tabloid ANSI B Landscape': {
            alias: 'Tabloid Landscape (ANSI B)',
            units: 'esriInches',
            pageSize: {x: 17, y: 11},
            mapSize: {x: 16, y: 7.75},
            pageMargins: {x: 0.5, y: 2.5},
            titleBlockOffsets: {x: 0.5, y: 0.5}
        },
        'Tabloid ANSI B Portrait': {
            alias: 'Tabloid Portrait (ANSI B)',
            units: 'esriInches',
            pageSize: {x: 11, y: 17},
            mapSize: {x: 10, y: 11.75},
            pageMargins: {x: 0.5, y: 4.5},
            titleBlockOffsets: {x: 0.5, y: 0.5}
        },
        'A4 Landscape': {
            alias: 'A4 Landscape',
            units: 'esriCentimeters',
            pageSize: {x: 29.7, y: 21},
            mapSize: {x: 27.7, y: 15.9},
            pageMargins: {x: 1, y: 3.8},
            titleBlockOffsets: {x: 1, y: 1}
        },
        'A4 Portrait': {
            alias: 'A4 Portrait',
            units: 'esriCentimeters',
            pageSize: {x: 21, y: 29.7},
            mapSize: {x: 19, y: 22.3},
            pageMargins: {x: 1, y: 5.7},
            titleBlockOffsets: {x: 1, y: 1}
        },
        'A3 Landscape': {
            alias: 'A3 Landscape',
            units: 'esriCentimeters',
            pageSize: {x: 42, y: 29.7},
            mapSize: {x: 40, y: 21.7},
            pageMargins: {x: 1, y: 6.3},
            titleBlockOffsets: {x: 1, y: 1}
        },
        'A3 Portrait': {
            alias: 'A3 Portrait',
            units: 'esriCentimeters',
            pageSize: {x: 29.7, y: 42},
            mapSize: {x: 27.7, y: 29},
            pageMargins: {x: 1, y: 11},
            titleBlockOffsets: {x: 1, y: 1}
        },
        'MAP_ONLY': {
            alias: 'Just the Map',
            units: NaN,
            pageSize: {x: 0, y: 0},
            mapSize: {x: 0, y: 0},
            pageMargins: {x: 0, y: 0},
            titleBlockOffsets: {x: 0, y: 0}
        }
    },
    relativeScale: '(1 inch = [value] miles)',
    relativeScaleFactor: 0.0000157828,
    scalePrecision: 1,
    mapScales: [6336000, 5068800, 3801600, 3168000, 2534400, 1900800, 1267200, 633600, 506880, 380160, 316800, 253440, 190080, 126720, 63360, 50688, 38016, 31680, 25344, 19008, 12672, 6336, 5069, 3802, 3168, 2534, 1901, 1267, 634, 507, 380, 317, 253, 190, 127, 63],
    showLayout: true
    //Print Enhancements END
});