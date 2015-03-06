#Zoom To Feature Widget for CMV
A simple widget to provide a drop-down list of features to zoom the map to. Similar to bookmarks but driven by actual data in a Map Service.

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `url` | String | url of the MapServer to Query. (required) |
| `field` | String | description field for display in drop-down list. (required) |
| `where` | String | A where clause to filter the resulting feature set. Default is '1=1' |
| `i18n` | Object | Default is {}. You can override the Internationalization with your own strings for the text in the widget. See example below. |

---
## Example Configuration:
``` javascript
zoomToFeature: {
    include: true,
    id: 'zoomToFeature',
    type: 'titlePane',
    title: 'Zoom to A California County',
    position: 0,
    open: true,
    path: 'widgets/ZoomToFeature',
    options: {
        map: true,

        url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2',
        field: 'NAME',
        where: 'STATE_FIPS = \'06\'',

        // you can customize the text
        i18n: {
            selectFeature: "Select A County"
        }
    }
}
```

## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/zoomToFeature1.jpg)