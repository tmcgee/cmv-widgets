define({
    // mimic a dojo dijit button
    html: '<span class="dijitButton" style="color:#333"><span class="dijitReset dijitInline dijitButtonNode"><span class="dijitReset dijitStretch dijitButtonContents"><span class="dijitReset dijitInline dijitIcon fa fa-video-camera"></span><span class="dijitReset dijitInline dijitButtonText">Take the CMV Tour</span></span></span></span>',

    // place the button in the upper right
    domTarget: 'helpDijit',

    startOnLoad: true,

    cookieOptions: {
        expires: new Date(Date.now() + (360000 * 24 * 0)) // Always show in the demo
    },

    // Documentation https://introjs.com/docs/themes/list
    introTheme: 'modern',

    // Documentation: https://introjs.com/docs/intro/options/
    introOptions: {
        steps: [
            {
                intro: [
                    '<div style="width:350px;">',
                    '<h4>Welcome to CMV, the Configurable Map Viewer</h4>',
                    'We hope you enjoy and find useful our brief introduction to the most flexible and powerful map viewer.<br/><br/>',
                    '<div style="text-align:center">',
                    '<a href="https://github.com/cmv/cmv-app" target="_blank" style="color:#fff;text-decoration:underline;">',
                    '<img src="https://cmv.io/images/rocket-logo.png" style="width:100px;" /><br/>',
                    'Get CMV on Github',
                    '</a><br/><br/>',
                    '</div>',
                    '</div>'
                ].join('')
            },
            {
                element: '#mapCenter',
                intro: '<h4>Map navigation</h4>Use the mouse and keyboard to:<br/>' +
                [
                    '<ul>',
                    '<li>Drag to pan</li>',
                    '<li>SHIFT + Click to recenter</li>',
                    '<li>SHIFT + Drag to zoom in</li>',
                    '<li>SHIFT + CTRL + Drag to zoom out</li>',
                    '<li>Mouse Scroll Forward to zoom in</li>',
                    '<li>Mouse Scroll Backward to zoom out</li>',
                    '<li>Use Arrow keys to pan</li>',
                    '<li>+ key to zoom in a level</li>',
                    '<li>- key to zoom out a level</li>',
                    '<li>Double Click to Center and Zoom in</li>',
                    '</ul>'
                ].join('')
            },
            {
                element: '#mapCenter_zoom_slider',
                intro: '<h4>Zoom Buttons</h4>You can zoom in and out of the map by clicking these buttons.'
            },
            {
                element: '.searchGroup',
                intro: '<h4>Search Widget</h4>A variety of searches can be performed with the Search widget:' + [
                    '<ul>',
                    '<li>Search by Address</li>',
                    '<li>Search by Place Name</li>',
                    '<li>Search By Zip Code, County, etc.</li>',
                    '</ul>'
                ].join(''),
                position: 'right'
            },
            {
                element: '#sidebarLeft',
                intro: '<h4>Left Sidebar</h4>You will find many of the widgets contained within the left sidebar pane.',
                position: 'right'
            },
            {
                element: '.sidebarleftCollapseButton',
                intro: '<h4>Expand/Collapse the Sidebar</h4>You can collapse and hide the sidebar by clicking here.',
                position: 'right'
            },
            {
                element: '#layerControl_parent .dijitTitlePaneTitle',
                intro: '<h4>Layer Control Widget</h4>You can change the visibility of layers using the Layer Control widget.',
                position: 'right'
            },
            {
                element: '#measurement_parent .dijitTitlePaneTitle',
                intro: '<h4>Measurement Widget</h4>The Measurement widget provides the capabilities to draw a point, line, or polygon on the map and specify the unit of measurement.',
                position: 'right'
            },
            {
                element: '#print_parent .dijitTitlePaneTitle',
                intro: '<h4>Print Widget</h4>This map can be exported to various formats and layouts using the Print widget.',
                position: 'right'
            },
            {
                element: '#helpDijit',
                intro: '<h4>Replay this Tour</h4>You can view this introductory tour at any time by clicking here.',
                position: 'left'
            }
        ]
    }
});