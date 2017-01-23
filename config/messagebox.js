define({
    isDebug: true,

    mapOptions: {
        basemap: 'streets',
        center: [-96.59179687497497, 39.09596293629694],
        zoom: 5,
        sliderStyle: 'small'
    },

    titles: {
        header: 'CMV MessageBox Widget',
        subHeader: 'This is an example of Confirm and Alert MessageBoxes',
        pageTitle: 'CMV MessageBox Widget'
    },

    panes: {
        left: {
            collapsible: false,
            style: 'display:none'
        }
    },

    operationalLayers: [],

    widgets: {

        // widget to create the MessageBox
        messagebox: {
            include: true,
            id: 'messagebox',
            type: 'invisible',
            path: 'widgets/MessageBox',
            options: {
                nameSpace: 'app' // optional namespace
            }
        },

        // simple widget to show how to open
        // and respond to a message box
        callMeAMessageBox: {
            include: true,
            id: 'callMeAMessageBox',
            type: 'invisible',
            path: 'dijit/_WidgetBase',
            options: {
                map: true,
                startup: function () {
                    // waiting a second. not normally needed when used in your code
                    window.setTimeout(function () {

                        // use the same namespace defined in the messagebox options above
                        // can be called from anywhere in your code
                        var mb = window.app.MessageBox;
                        mb.confirm({
                            title: 'Delete Feature?',
                            content: 'Are you sure you want to delete this feature?<br/><br/>This action cannot be undone.'
                        }).then(
                            function (result) {
                                // respond based on the results returned from the confirm MessageBox
                                if (result === mb.okMessage) {
                                    mb.alert({
                                        title: 'Feature Deleted',
                                        content: 'You chose to delete the feature.'
                                    });
                                } else if (result === mb.cancelMessage) {
                                    mb.alert({
                                        title: 'NOT Deleted',
                                        content: 'You chose NOT to delete the feature.'
                                    });
                                }
                            },
                            function (/* result */) {}
                        );
                    }, 1000);
                }
            }
        }
    }
});