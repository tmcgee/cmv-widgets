define([
    'dojo/topic'
], function (topic) {
    'use strict';

    return {
        map: true,
        printTaskURL: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

        startup: function () {
            window.setTimeout(function () {
                topic.publish('reportWidget/createReport');
            }, 200);
        },

        reportLayout: {
            layout: {
                orientation: 'portrait',
                unit: 'pt',
                format: 'letter'
            },
            output: {
                type: 'save',
                //type: 'datauristring',
                //type: 'dataurlnewwindow',
                options: 'report.pdf'
            },
            margins: {
                top: 30,
                left: 30,
                bottom: 30,
                right: 30
            },
            font: {
                color: 20,
                size: 11,
                font: 'helvetica',
                style: 'normal'
            },
            line: {
                width: 0.5,
                color: 0
            },
            border: {
                width: 0.5,
                color: 128
            },
            header: {
                text: 'City of Petaluma Parcel Report',
                font: {
                    color: [41, 128, 185],
                    size: 20,
                    style: 'bold'
                },
                line: {
                    width: 1
                }
            },
            footer: {
                line: {
                    width: 1.5,
                    color: 66
                },
                date: {
                    includeTime: false,
                    font: {
                        color: [66, 66, 66],
                        size: 9,
                        style: 'italic'
                    }
                },
                copyright: {
                    text: 'Copyright 2015, City of Petaluma California',
                    font: {
                        color: [66, 66, 66],
                        size: 9,
                        style: 'italic'
                    }
                }
            },
            map: {
                top: 55,
                left: 35,
                height: 250,
                width: 290,
                dpi: 360,  //multiple of 72
                format: 'PNG32',
                preserveScale: true,
                border: true
            },
            images: [],
            text: [],
            attributes: [
                {
                    top: 67,
                    left: 350,
                    height: 235,
                    width: 225,
                    title: {
                        text: 'These are attributes',
                        font: {
                            color: 41,
                            size: 12,
                            style: 'bold'
                        }
                    },
                    layout: 'stacked',
                    border: true,
                    fields: [
                        {
                            fieldName: '81520 Johnson Loop'
                        },
                        {
                            fieldName: 'Petaluma, CA 94952'
                        },
                        {
                        },
                        {
                            fieldName: '010-999-9999',
                            label: 'Parcel #'
                        },
                        {
                        },
                        {
                            fieldName: 'Cupid\'s Sparrow',
                            label: 'Subdivision'
                        },
                        {
                            fieldName: '0.45',
                            label: 'Acres'
                        },
                        {
                            fieldName: '2,250',
                            label: 'Sq Ft'
                        },
                        {
                        },
                        {
                            fieldName: '2',
                            label: 'Stories'
                        },
                        {
                            fieldName: '4',
                            label: 'Bedrooms'
                        },
                        {
                            fieldName: '2.5',
                            label: 'Baths'
                        },
                        {
                        },
                        {
                            fieldName: '$125,000',
                            label: 'Land Value'
                        },
                        {
                            fieldName: '$250,000',
                            label: 'Structure Value'
                        }
                    ]
                },
                {
                    top: 350,
                    left: 35,
                    right: 45,
                    height: 270,
                    title: {
                        text: 'These are attributes two',
                        font: {
                            color: 40,
                            size: 12,
                            style: 'bold'
                        }
                    },
                    border: true,
                    layout: 'table',
                    fields: [
                        {
                            label: 'Tabular Attributes will go here'
                        }
                    ]
                }
            ]

        }
    };
});