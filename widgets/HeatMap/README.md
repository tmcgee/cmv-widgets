# Heatmap Widget for CMV
The Heatmap Widget uses a HeatmapRenderer to render feature layer data into a raster visualization that emphasizes areas of higher density or weighted values. The blur radius, maximum value and minimum value for the renderer can be adjusted. All features from the layer can be included or use draw tools to select a subset of features.

The HeatmapRenderer uses a Gaussian Blur technique to average the influence of each point out over the area determined by the 'blurRadius' (the radius (in pixels) of the circle over which the majority of each point's value is spread out.). A Gaussian blur uses a Gaussian, or Normal, distribution (also called a Bell-curve) to spread value out in vertical and horizontal directions.

The Heatmap widget was inspired by this WAB widget: https://github.com/AdriSolid/WAB-Custom-Widgets#heat-map-wab-27-fire-live-demo

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `layerControlLayerInfos` | Boolean | |
| `layers` | Array| |
| `addToLayerControl` | Boolean | |
| `geometryType` | String | |
| `drawingOptions` | Object | |
| `blurRadius` | Number | |
| `maxValue` | Number | |
| `minValue` | Number | |
| `colorStops` | Array | |
| `topicID` | String | |


---
## Example Configuration:
``` javascript
heatmap: {
    include: true,
    id: 'heatmap',
    type: 'titlePane',
    title: 'Heatmap',
    iconClass: 'fas fa-fire',
    open: true,
    position: 1,
    path: 'widgets/Heatmap',
    options: {
        map: true,
        layerControlLayerInfos: true
    }
}
```
## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/heatmap1.jpg)

