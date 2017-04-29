# Export Widget for CMV
1. Export attributes in tabular formats from the [Attributes Table](https://github.com/tmcgee/cmv-widgets#attributes-tables) widget or other widgets that have a [dgrid](http://dgrid.io). Formats supported:
    * Excel (xlsx and xls)
    * Comma-Separated-Values (csv)

2. Export features in spatial formats. Formats supported:
    * Esri Shapefiles
    * KML
    * KMZ
    * GeoJSON
    * TopoJSON
    * Well-Known Text (wkt)

3. Examples of exported features:
    * Features from the [Attributes Table](https://github.com/tmcgee/cmv-widgets#attributes-tables) widget
    * An Identified Feature
    * Features from a Feature layer on the map
    * Graphics from a Graphics layer on the map
    * Drawn Graphic Shapes from a Draw widget
    * Features return from a QueryTask or FindTask of a Map Service
    * A FeatureSet returned from a Geoprocessing Task

All geometries exported to GeoJSON or KML are projected to Lat/Lng using Spatial Reference 4326. When exporting to Well-Known Text or Esri Shapefile, an output Spatial Reference WKID can be provided and the geometries are projected to the selected Spatial Reference.

NOTE: Downloading the export file when using Internet Explorer 9 or older is not supported.

---
## Configurable Options:
| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `topicID` | String | Default is `exportDialog` |
| `excel` | Boolean | Allow attributes to be exported to Excel. Default is true |
| `xlsExcel` | Boolean | Allow attributes to be exported to Excel (XLS format)Default is false |
| `csv` | Boolean | Allow attributes to be exported to CSV. Default is true |
| `shapefile` | Boolean | Allow attributes to be exported to a Shapefile. Default is false |
| `kml` | Boolean | Allow attributes to be exported to KML. Default is false |
| `kmz` | Boolean | Allow attributes to be exported to KMZ. Default is false |
| `geojson` | Boolean | Allow attributes to be exported to GeoJSON. Default is false |
| `topjson` | Boolean | Allow attributes to be exported to TopoJSON. Default is false |
| `wkt` | Boolean | Allow attributes to be exported to Well-Known Text. Default is false |
| `filename` | String | Name of file for export. Default is `results` |
| `defaultExportType` | String | The default type of export. Default is 'excel' |
| `shapefileOptions` | Object | Options for Shapefile format. |
| `kmlOptions` | Object | Options for KML format. |
| `geojsonOptions` | Object | Options for GeoJSON format. |
| `topojsonOptions` | Object | Options for TopJSON format. |

---
## Example Configuration:
``` javascript
exportDialog: {
    include: true,
    id: 'export',
    type: 'floating',
    path: 'widgets/Export',
    title: 'Export',
    options: {
        excel: true,
        xlsExcel: false,
        csv: true,

        shapefile: true,
        kml: true,
        kmz: true,
        geojson: true,
        topojson: true,
        wkt: true,

        defaultExportType: 'shapefile',

        // this option can be a string or a function that returns
        // a string.
        //
        // filename: 'my_results'
        filename: function () {
            var date = new Date();
            return 'export_results_' + date.toLocaleDateString();
        }
    }
}
```

## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/export1.jpg)

---
## Communicating with other widgets
The Exports widget does not stand-alone. It is intended with to be used as a querying interface for an attributes table. Two other widgets are planned that can communicate with an attributes table:

1. Plug-in for layerControl widget
2. Query Builder widget

Communication to/from another widget to an attributes table is via dojo's topic publish/subscribe model. The available topics are listed below.

---
## Export Topics

### Subscribed Topics
The Export widget subscribes to the following topics.
```javascript
// open the widget
'exportWidget/openDialog'

// export attributes or features without opening the dialog
'exportWidget/export'

```
