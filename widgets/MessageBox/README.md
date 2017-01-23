#Message Box for CMV
Show a modal Confirmation or Alert dialog box. Intended to be called from other widgets.

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `nameSpace` | String | Default is null Optional Namespace. If omitted, the global window Namespace is used. |
| `okMessage` | String | Default is 'MessageBox.OK'. |
| `cancelMessage` | String | Default is 'MessageBox.Cancel'. |


---
## Example Configuration:
``` javascript
messagebox: {
    include: true,
    id: 'messagebox',
    type: 'invisible',
    path: 'widgets/MessageBox',
    options: {
        nameSpace: 'app' // optional namespace
    }
}
```
## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/messagebox1.jpg)

