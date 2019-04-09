# Export Graphics Widget for CMV

The Export Graphics widget works with the [Export](https://github.com/tmcgee/cmv-widgets#export) widget to allow the user to export graphic features from one or more Graphic or Feature layers.

---

## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `layerIds` | Array | Default includes the layer IDs used by the CMV [Draw](https://github.com/cmv/cmv-apps) widget and the  [Advanced Draw](https://github.com/ishiland/cmv-widgets#advanceddraw) widget contributed by [isiland](https://github.com/ishiland/).  |
| `includeMapGraphics` | Boolean | IF you want to include graphics added to the map, not a specific layer. Default is false. |
| `exportOptions` | Object | Options to pass to the Export widget. Default is {} |

---

## Example Configuration:

``` javascript
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
}
```

## Screenshot:

![Screenshot](https://tmcgee.github.io/cmv-widgets/images/exportgraphics1.jpg)
