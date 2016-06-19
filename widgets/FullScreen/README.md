#Full Screen Widget for CMV
A simple widget containing a button to toggle the CMV map to a maximized full screen view and restore it to the original dimensions. By default, any sidebar panes in the application are collapsed when the map is maximized to full screen.

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `domNodeID` | String | Default is 'borderContainerOuter' If you want to maximize a different div, substitute the id of the desired div. |
| `closePanes` | Array | An array of the panes you want to close when the map is maximized. Default is ['left', 'right', 'top', 'bottom']. Use [] if you do not want to close the panes. |

---
## Example Configuration:
``` javascript
fullScreen: {
    include: true,
    id: 'fullScreen',
    type: 'domNode',
    path: 'widgets/FullScreen',
    srcNodeRef: 'homeButton',
    options: {}
}
```
## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/fullscreen1.jpg)

