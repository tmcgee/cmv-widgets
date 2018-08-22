// http://dojotoolkit.org/reference-guide/1.10/dojo/i18n.html
define({
    root: {
        messages: {
            searching: {
                title: 'Searching',
                message: 'Please wait...',
                level: 'info'
            },

            searchError: {
                title: 'Search Error',
                message: 'Sorry, an error occurred and your search could not be completed.'
            },

            confirmCloseTab: {
                title: 'Close Tab?',
                content: 'Do you really want to close this tab?'
            },


            searchResults: {
                title: 'Search Results',
                message: null,
                noFeatures: 'No features',
                newFeatures: 'new',
                feature: 'feature',
                features: 'features',
                found: 'found',
                total: 'total'
            }
        },

        menus: {
            zoom: {
                title: 'Zoom',
                zoomToFeatures: 'Zoom To All Features',
                zoomToSelectedFeatures: 'Zoom To Selected Feature(s)',
                zoomToSourceGraphics: 'Zoom To Source Graphic(s)',
                zoomToBuffer: 'Zoom To Buffer'
            },

            view: {
                title: 'Display',
                showAllRecords: 'Display All Records',
                showOnlySelectedRecords: 'Display Only Selected Record(s)'
            },

            clear: {
                title: 'Clear',
                clearFeatures: 'Clear All Features',
                clearSelectedFeatures: 'Clear Selected Feature(s)',
                clearSourceGraphics: 'Clear Source Graphic(s)',
                clearBufferGraphics: 'Clear Buffer',
                clearGrid: 'Clear Grid',
                clearAll: 'Clear All',
                clearSelectedRecords: 'Clear Selected Record(s)'
            },

            'export': {
                title: 'Export'
            }
        }
    }
});
