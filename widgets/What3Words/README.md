#what3words Widget for CMV
A simple widget to send a 3 word address or lat/lng to what3words and zoom the map to the resulting location. The lat/lng and 3 word address for the location are displayed from the search result.

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `key` | String | Default is ` `. Your what3words key. You will need to supply this. Available [here]( https://developer.what3words.com/api-register). (required) |
| `url` | String | Default is `https://api.what3words.com/`. The url for the what3words api. You should not need to change this. |
| `symbol` | Object | JSON used with [PictureMarkerSymbol](https://developers.arcgis.com/javascript/jsapi/picturemarkersymbol-amd.html) for the placemark. |
| `growlID` | String | Default is `w3w-search`. Used to dismiss the "Searching" growl when the search is completed. |
| `spatialReference` | Number | Default is `null`. Spatial Reference. uses the map's spatial reference if none provided. |
| `pointExtentSize` | Number | Default is `null`. Uses 0.001 for decimal degrees (wkid 4326) or 2500 for meters/feet if none provided. |
| `proj4BaseURL` | String | Default is `https://epsg.io/`. The base url for reprojecting points not in WGS 84 (4326) or Web Mercator (3857/10211). |
| `proj4Catalog` | String | Default is `EPSG`. Options are ESRI, EPSG and SR-ORG. See https://epsg.io/ for more information |
| `projCustomURL` | String | Default is `null`. if desired, you can load a projection file from your server instead of using one from epsg.io. |

---
## Example Configuration:
``` javascript
what3words: {
    include: true,
    id: 'what3words',
    type: 'titlePane',
    title: 'what3words',
    canFloat: true,
    position: 0,
    open: true,
    path: 'widgets/What3Words',
    options: {
        map: true,
        key: 'YOUR-W3W-API-KEY'
    }
}
```
Be sure to include the url for the what3words api in the array or corsEnabledServers or use a proxy.
```
esriConfig.defaults.io.corsEnabledServers.push('api.what3words.com');
```
## To Do
1. Add method for user to click on map to get w3w address via position search.
2. Complete and test access to position search from right-click menu.

## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/what3words1.jpg)