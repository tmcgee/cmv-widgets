#Open External Map for CMV
Open maps in an external window for Google Hybrid, Google StreetView, Bing Hybrid, Bing Bird's Eye, Bing Streetside, MapQuest and OpenStreetMap. The map is centered on the coordinates based on a map click or Latitude and Longitude values provided by the user. Can be combined with the [Toggle StreetView Tiles](https://github.com/tmcgee/cmv-widgets#toggle-streetview-tiles) widget to show the availability of Google StreetView while clicking on the map.

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `param` | String | Default is 'blah' Description. |

---
## Example Configuration:
``` javascript
externalmap: {
    include: true,
    id: 'externalmap',
    type: 'titlePane',
    canFloat: true,
    position: 0,
    path: 'widgets/OpenExternalMap',
    title: 'Open External Map',
    open: true,
    options: {
        map: true
    }
}
```
## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/openexternalmap1.jpg)

