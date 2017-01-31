#QR Codes for CMV
Shows a QR code for the current map to open mobile applications on your phone/tablet such as:

- Google Maps
- OSMAnd
- Waze
- Apple Maps
- Trek2There (Esri Labs)
- Navigator for ArcGIS

---
## Example Configuration:
``` javascript
qrcode: {
    include: true,
    type: 'titlePane',
    position: 0,
    path: 'widgets/QRCode',
    title: 'QR Code',
    open: true,
    options: {
        map: true
    }
}
```
## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/qrcode1.jpg)

This widget was adapted from [this one](https://github.com/Esri/arcgis-webappbuilder-widgets-themes/tree/master/widgets/Qr2Go) intended for the Esri Web App Builder.

