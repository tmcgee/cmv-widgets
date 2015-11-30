define({
    map: true, // needs a refrence to the map
    mode: 'agol', //must be either 'agol' or 'custom'
    title: 'Basemaps', // tilte for widget
    mapStartBasemap: 'streets', // must match one of the basemap keys below
    //basemaps to show in menu. define in basemaps object below and reference by name here

    basemapsToShow: ['streets', 'satellite', 'hybrid', 'topo', 'lightGray', 'gray', 'national-geographic', 'osm', 'oceans'],

    // define all valid custom basemaps here. Object of Basemap objects. For custom basemaps, the key name and basemap id must match.
    basemaps: { // agol basemaps
        streets: {
            title: 'Streets'
        },
        satellite: {
            title: 'Satellite'
        },
        hybrid: {
            title: 'Hybrid'
        },
        topo: {
            title: 'Topo'
        },
        gray: {
            title: 'Gray'
        },
        oceans: {
            title: 'Oceans'
        },
        'national-geographic': {
            title: 'Nat Geo'
        },
        osm: {
            title: 'Open Street Map'
        }
    }
});