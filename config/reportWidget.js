define([
    'dojo/topic'
], function (topic) {
    'use strict';

    return {
        map: true,

        /*
            printTaskURL must be on the same same as application
            or the server must be configured for CORS
            or you can use a proxy
        */
        printTaskURL: 'http://gis.scwa.ca.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        //'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

        startup: function () {
            topic.publish('reportWidget/createReport');
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
                color: [33, 33, 33],
                size: 11,
                font: 'helvetica',
                style: 'normal'
            },
            line: {
                width: 0.5,
                color: 30
            },
            border: {
                width: 0.5,
                color: 128
            },
            header: {
                text: 'City of Petaluma Parcel Report',
                left: 306, // page width = 612 pts
                top: 40,
                align: 'center',
                font: {
                    color: [66, 66, 66],
                    size: 24,
                    style: 'bold'
                },
                line: {
                    left: 60,
                    top: 47,
                    width: 1.5,
                    color: 66
                }
            },
            footer: {
                line: {
                    width: 1.5,
                    color: 66
                },
                date: {
                    left: 35, // just inside the left margin
                    includeTime: false,
                    font: {
                        color: [66, 66, 66],
                        size: 9,
                        style: 'italic'
                    }
                },
                copyright: {
                    text: 'Copyright 2015, City of Petaluma California',
                    left: 575, // just inside the right margin
                    align: 'right',
                    font: {
                        color: [66, 66, 66],
                        size: 9,
                        style: 'italic'
                    }
                }
            },
            map: {
                top: 85,
                left: 40,
                height: 250,
                width: 290,
                dpi: 144,  //multiple of 72
                format: 'PNG32',
                preserveScale: true,
                border: true
            },
            images: [
                {
                    top: 15,
                    left: 15,
                    width: 50,
                    height: 50,
                    url: '/proxy/proxy.ashx?https://xara1-4.cityofpetaluma.net/jsviewers/maplibrary/images/Petaluma1858verC2_graybg.bmp'
                }
            ],
            text: [],
            lines: [],
            shapes: [],
            attributes: [
                {
                    top: 97,
                    left: 350,
                    height: 235,
                    width: 225,
                    title: {
                        text: 'These are attributes',
                        font: {
                            color: [66, 66, 66],
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
                    top: 370,
                    left: 35,
                    right: 45,
                    height: 270,
                    title: {
                        text: 'These are attributes two',
                        font: {
                            color: [66, 66, 66],
                            size: 12,
                            style: 'bold'
                        }
                    },
                    border: true,
                    layout: 'table',
                    fields: []
                }
            ]

        }
    };
});