define([], function () {

    return {
        map: true, // needs a reference to the map
        // define all valid basemaps here.
        basemaps: {
            streets: {},
            'streets-night-vector': {}, // requires v3.16 or higher
            'streets-navigation-vector': {}, // requires v3.16 or higher
            'streets-relief-vector': {}, // requires v3.16 or higher
            satellite: {},
            hybrid: {},
            topo: {},
            terrain: {},
            'gray-vector': {}, // requires v3.16 or higher
            'dark-gray-vector': {}, // requires v3.16 or higher
            oceans: {},
            'national-geographic': {},
            osm: {}
        }
    };
});