#Share Widget for CMV
Share your map by using Facebook, Twitter, Google+, E-Mail, Link, or embedded iFrame code.

---
## Configurable Options

| Parameter | Type | Description |
| :----: | :--: | ----------- |
| `bitlyLogin` | String | The username for the bitly url shortener. Default = '' |
| `bitlyKey` | String | The API Key for the bitly url shortener. Default = '' |
| `title` | String | Link title. If you do not provide one, the application's title will be used. Default = '' |
| `image` | String | Image url that will be used when sharing with Facebook. Default = '' |
| `summary` | String | Summary text that will be used when sharing with Facebook. Default = '' |
| `hashtags` | String | Hash tags that will be used when sharing with Twitter. Default = '' |
| `useExtent` | Boolean | Set the default state for checkbox for 'include map extent'. Default = false |

###Note:
The user of the application must have an account for Facebook, Twitter or Google+ to share with any of those services. No account is required for sharing via E-Mail or Link.

You can copy the Embed Map text box contents and paste that into an html document to embed this map in a different website.

###Note:
The bitly API does not shorten the url, if you are running the application using your local machine with a url that starts with `http://localhost` or `http://machinename`

---
## Example Configuration for use as a floating widget:
``` javascript
share: {
    include: true,
    id: 'share',
    type: 'floating',
    path: 'widgets/Share',
    title: 'Share This Map',
    options: {
        map: true
    }
}
```

## Example Configuration for use as a titlePane widget:
``` javascript
share: {
    include: true,
    id: 'share',
    type: 'titlePane',
    path: 'widgets/Share',
    title: 'Share This Map',
    open: true,
    canFloat: true,
    position: 0,
    options: {
        map: true
    }
}
```

## Screenshot:
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/share1.jpg)

---
##Credits
This widget was originally adapted from the Share widget for WebApp Builder found [here](https://github.com/USEPA/Public_Web_AppBuilder/tree/master/widgets/Share)