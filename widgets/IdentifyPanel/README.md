# IdentifyPanel for CMV
A widget to replace the map's infoWindow including integration with the [Export](https://github.com/tmcgee/cmv-widgets#export) widget. You can include your own buttons as well. This widget is an updated and enhanced version of one originally created by [Doug Chamberlain](https://github.com/dougrchamberlain/IdentifyPanel).

---
## Example Configuration:
``` javascript
identifyPanel: {
    include: true,
    type: 'titlePane',
    path: 'widgets/IdentifyPanel',
    position: 0,
    title: 'Identify Features',
    iconClass: 'fa-info-circle',
    open: true,
    options: {
        map: true,
        mapClickMode: true,
        buttons: [
            {
                id: 'identifypanel-button-example',
                label: 'This is an example button',
                iconClass: 'fa fa-fw fa-comment',
                showLabel: false,
                style: 'float:left;margin-right:10px;display:none;',
                onClick: function () {
                    /*eslint no-alert: 0*/
                    alert('Hello from the Test Button');
                }
            }
        ]
    }
}
```
## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/identifypanel1.jpg)

