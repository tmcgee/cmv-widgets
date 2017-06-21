# Mapillary Widget for CMV
A replacement for the CMV Google StreetView widget that display street level imagery from [Mapillary](https://www.mapillary.com/) using [MapillaryJS](https://github.com/mapillary/mapillary-js).

To use MapillaryJS you must [create an account](https://www.mapillary.com/signup) and [obtain a Client ID](https://www.mapillary.com/app/settings/developers).

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `mapillaryOptions` | Object | Options supported by the [Mapillary Viewer](https://github.com/mapillary/mapillary-js) |
| `layerOptions` | Object | Options for the VectorTiles layer displaying the Mapillary coverage | 

---
## Example Configuration:
``` javascript
mapillary: {
    include: true,
    type: 'titlePane',
    title: 'Mapillary',
    iconClass: 'fa-location-arrow fa-rotate-90',
    open: true,
    position: 0,
    path: 'widgets/Mapillary',
    canFloat: true,
    paneOptions: {
        resizable: true,
        resizeOptions: {
            minSize: {
                w: 250,
                h: 250
            }
        }
    },
    options: {
        map: true,
        mapillaryOptions: {
            clientID: 'insert-your-own-client-id',
            photoID: null
        }
    }
}
```
## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/mapillary1.jpg)

