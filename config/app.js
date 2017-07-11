(function () {
    var path = location.pathname.replace(/[^/]+$/, '');
    window.dojoConfig = {
        async: true,
        packages: [
            {
                name: 'viewer',
                location: 'https://cdn.rawgit.com/cmv/cmv-app/v2.0.0-beta.2/viewer/js/viewer'
            }, {
                name: 'gis',
                location: 'https://cdn.rawgit.com/cmv/cmv-app/v2.0.0-beta.2/viewer/js/gis'
            }, {
                name: 'config',
                location: path + 'config'
            }, {
                name: 'widgets',
                location: path + 'widgets'
            }, {
                name: 'proj4js',
                location: '//cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15'
            }, {
                name: 'flag-icon-css',
                location: '//cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.8.0'
            },

            // jquery is only required for the Advanced Search in Search widget
            {
                name: 'jquery',
                location: '//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1',
                main: 'jquery.min'
            }
            // end jquery
        ]
    };

    require(window.dojoConfig, [
        'dojo/_base/declare',

        // minimal Base Controller
        'viewer/_ControllerBase',

        // *** Controller Mixins
        // Use the core mixins, add custom mixins
        // or replace core mixins with your own
        'viewer/_ConfigMixin', // manage the Configuration
        'viewer/_LayoutMixin', // build and manage the Page Layout and User Interface
        'viewer/_MapMixin', // build and manage the Map
        'viewer/_WidgetsMixin', // build and manage the Widgets
        // 'viewer/_WebMapMixin' // for WebMaps
        'viewer/_SidebarMixin' // for mobile sidebar
        //'config/_customMixin'

    ], function (
        declare,

        _ControllerBase,
        _ConfigMixin,
        _LayoutMixin,
        _MapMixin,
        _WidgetsMixin,
        // _WebMapMixin
        _SidebarMixin
        //_MyCustomMixin

    ) {
        var App = declare([
            // Mixin for Mobile Sidebar
            _SidebarMixin,
            _LayoutMixin,
            _WidgetsMixin,
            // _WebMapMixin,
            _MapMixin,
            _ConfigMixin,
            _ControllerBase
        ]);
        var app = new App();
        app.startup();
    });
})();
