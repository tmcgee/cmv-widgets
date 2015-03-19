#PrintPlus Widget for CMV
An updated version of the PrintPlus widget originally created by [@LarryStout](https://github.com/LarryStout) in early 2014. Larry's original source code can be found in [here](https://github.com/tmcgee/cmv-hamilton-county) with a few of his other widgets.

This widget has been tested using CMV version 1.3.3. It may work with previous versions.

**IMPORTANT NOTE** This widget is provided as is with no support so please do not expect me to fix any issues found with this widget. Pull Requests for fixes and enhancements are welcome.

As of March, 2015, this version of the widget is ~95% functional. There is a serious issue that the map extent does not get restored properly after printing. I am working on this issue as time permits. There may also be some possible issues with map scaling.

Pay close attention to the layoutParams, they must match your existing print layouts. To use the full functionality, you will need to have two versions of each print layout configured on your server - one with a title block and one without.

---
## Configurable Options:
| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `defaultDpi` | numeric | the default print resolution in DPI. |
| `noTitleBlockPrefix` | string | the prefix for layout templates that have the same paper size and orientation as another template, but do not have a title block (e.g. "No TB "). Layout templates with this prefix will not show in the dropdown list, but will activate the "Show Layout" checkbox when the corresponding layout template is selected (e.g. "Letter ANSI A Landscape" and "No TB Letter ANSI A Landscape"). |
| `layoutParams` | array | An array of objects each containing the alias, paper units, and paper dimensions for each layout template. `alias` will be used to populate the layout dropdown. `units` is the string value of the ESRI Units constant (e.g. "esriInches" or "esriCentimeters") and is used to project the map layout onto the map. `pageSize` is the overall layout size. `mapSize` is the size of the map area in the layout. `pageMargins` is the offset of the map area from the lower left corner. `titleBlockOffsets` is the left/right and top/bottom margins of the layout when no title block is shown. |
| `relativeScale` | string | The string template to use for displaying the relative scale (e.g. "(1" = [value]')" yields "(1" = 500')" for an absolute scale of 1:6,000). |
| `relativeScaleFactor` | numeric | The multiplier to use with the absolute scale to produce the relative scale (e.g. 0.08333333 for the example above). |
| `scalePrecision` | numeric | The number of decimal places for the relative scale (e.g. 1" = 1.5 miles reflects a value of 1 and 1" = 1.50 miles reflects a value of 2). |
| `mapScales` | array | An array of the absolute scales that determines the tick locations (and labels) on the map scale slider. Any scale can be entered into the map scale input box. |
| `outWkid` | string | The WKID of the Spatial Reference to use for the printed map. |
| `showLayout` | boolean | Determines whether the layout template will be displayed over the map as a red graphic. |

---
## Example Configuration:
``` javascript
print: {
    include: true,
    id: 'print',
    type: 'titlePane',
    path: 'widgets/PrintPlus',
    canFloat: true,
    title: 'Print Plus',
    open: true,
    position: 0,
    options: 'config/printplusWidget'
}
```

## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/printplus1.jpg)

---
## Example PrintPlus Widget Configuration:
``` javascript
define([
   'esri/units'
], function (units) {
    return {
        map: true,
        printTaskURL: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        copyrightText: 'Copyright 2014',
        authorText: 'Me',
        defaultTitle: 'Viewer Map',
        defaultFormat: 'PDF',
        defaultLayout: 'Letter ANSI A Landscape',

        // Print Enhancements BEGIN
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
                units: units.INCHES,
                pageSize: {x: 11, y: 8.5},
                mapSize: {x: 10, y: 6.25},
                pageMargins: {x: 0.5, y: 1.5},
                titleBlockOffsets: {x: 0.5, y: 0.5}
            },
            'Letter ANSI A Portrait': {
                alias: 'Letter Portrait (ANSI A)',
                units: units.INCHES,
                pageSize: {x: 8.5, y: 11},
                mapSize: {x: 7.5, y: 8},
                pageMargins: {x: 0.5, y: 2.25},
                titleBlockOffsets: {x: 0.5, y: 0.5}
            },
            'Tabloid ANSI B Landscape': {
                alias: 'Tabloid Landscape (ANSI B)',
                units: units.INCHES,
                pageSize: {x: 17, y: 11},
                mapSize: {x: 16, y: 7.75},
                pageMargins: {x: 0.5, y: 2.5},
                titleBlockOffsets: {x: 0.5, y: 0.5}
            },
            'Tabloid ANSI B Portrait': {
                alias: 'Tabloid Portrait (ANSI B)',
                units: units.INCHES,
                pageSize: {x: 11, y: 17},
                mapSize: {x: 10, y: 11.75},
                pageMargins: {x: 0.5, y: 4.5},
                titleBlockOffsets: {x: 0.5, y: 0.5}
            },
            'A4 Landscape': {
                alias: 'A4 Landscape',
                units: units.CENTIMETERS,
                pageSize: {x: 29.7, y: 21},
                mapSize: {x: 27.7, y: 15.9},
                pageMargins: {x: 1, y: 3.8},
                titleBlockOffsets: {x: 1, y: 1}
            },
            'A4 Portrait': {
                alias: 'A4 Portrait',
                units: units.CENTIMETERS,
                pageSize: {x: 21, y: 29.7},
                mapSize: {x: 19, y: 22.3},
                pageMargins: {x: 1, y: 5.7},
                titleBlockOffsets: {x: 1, y: 1}
            },
            'A3 Landscape': {
                alias: 'A3 Landscape',
                units: units.CENTIMETERS,
                pageSize: {x: 42, y: 29.7},
                mapSize: {x: 40, y: 21.7},
                pageMargins: {x: 1, y: 6.3},
                titleBlockOffsets: {x: 1, y: 1}
            },
            'A3 Portrait': {
                alias: 'A3 Portrait',
                units: units.CENTIMETERS,
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
        scalePrecision: 4,
        mapScales: [6336000, 5068800, 3801600, 3168000, 2534400, 1900800, 1267200, 633600, 506880, 380160, 316800, 253440, 190080, 126720, 63360, 50688, 38016, 31680, 25344, 19008, 12672, 6336, 5069, 3802, 3168, 2534, 1901, 1267, 634, 507, 380, 317, 253, 190, 127, 63],
        showLayout: true
        // Print Enhancements END
    };
});
```
