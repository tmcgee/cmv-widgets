#Export Widget for CMV
Export features from the [Attribute Table](https://github.com/tmcgee/cmv-widgets#attributes-tables) widget or other widgets that have a [dgrid](http://dgrid.io).

File formats supported: Excel and CSV.

NOTE: Downloading the export file when using Internet Explorer 9 or older is not supported.

---
## Configurable Options:
| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `topicID` | String | Default is `exportDialog` |

---
## Example Configuration:
``` javascript
exportDialog: {
    include: true,
    id: 'export',
    type: 'floating',
    path: 'widgets/Export',
    title: 'Export',
    options: {}
}
```

## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/export1.jpg)

---
##Communicating with other widgets
The Exports widget does not stand-alone. It is intended with to be used as a querying interface for an attributes table. Two other widgets are planned that can communicate with an attributes table:

1. Plug-in for layerControl widget
2. Query Builder widget

Communication to/from another widget to an attributes table is via dojo's topic publish/subscribe model. The available topics are listed below.

---
##Export Topics

### Subscribed Topics
The Export widget subscribes to the following topics.
```javascript
// open the widget
'exportWidget/openDialog'
```
