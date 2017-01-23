define(null, function () {

    //portrait letter
    var pageWidth = 612;
    var pageHeight = 792;
    var pageCenter = 306;

    //landscape letter
    //var pageWidth = 792;
    //var pageHeight = 612;
    //var pageCenter = 346;

    var colors = {
        text: [33, 33, 33],
        line: [15, 53, 101],
        border: [99, 99, 99],
        subheading: [15, 53, 101],
        heading: [15, 53, 101],
        transparent: [255, 255, 255, 0],
        white: [255, 255, 255]
    };

    var fonts = {
        text: {
            color: colors.text,
            size: 11,
            font: 'helvetica',
            style: 'normal'
        },
        heading: {
            color: colors.heading,
            size: 14,
            style: 'bold'
        },
        rowHeading: {
            color: colors.subheading,
            size: 11,
            style: 'bold'
        },
        footer: {
            color: colors.text,
            size: 9,
            style: 'italic'
        }
    };

    var formatOptions = {
        currency: {
            currency: 'USD',
            places: 0
        }
    };

    return {
        map: true,

        topicID: 'parcelReportWidget',

        /*
            printTaskURL must be on the same server as application
            or the server must be configured for CORS
            or you can use a proxy
        */
        printTaskURL: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

        defaultStyles: {
            font: fonts.text,
            line: {
                width: 0.5,
                color: colors.line
            },
            rectangle: {
                lineWidth: 0.5,
                lineColor: colors.border,
                fillColor: colors.transparent
            }
        },

        reportLayout: {
            layout: {
                orientation: 'portrait',
                unit: 'pt',
                format: 'letter'
            },
            output: {
                type: 'save',
                options: 'report.pdf'
            },
            margins: {
                top: 30,
                left: 30,
                bottom: 30,
                right: 30
            },
            metadata: {
                title: 'Parcel Report',
                author: 'MoosePoint Technology',
                keywords: 'parcel, moosepoint',
                creator: 'MoosePoint Technology'
            },
            header: {
                text: [
                    {
                        text: 'Anytown USA Parcel Report',
                        left: 306,
                        top: 55,
                        align: 'center',
                        font: {
                            color: colors.heading,
                            size: 20,
                            style: 'bold'
                        }
                    }
                ],
                lines: [
                    {
                        left: 35,
                        top: 65,
                        bottom: 65,
                        right: pageWidth - 35,
                        width: 1.5,
                        color: colors.line
                    }
                ],
                attributes: [
                    {
                        top: 35,
                        left: pageWidth - 140,
                        layout: 'stacked',
                        fields: [
                            {
                                fieldName: 'APN',
                                label: 'APN'
                            }
                        ]
                    }
                ]
            },
            footer: {
                text: [
                    {
                        format: 'date',
                        left: 38,
                        top: pageHeight - 30,
                        font: fonts.footer
                    },
                    {
                        format: 'pageNumber',
                        left: pageCenter,
                        top: pageHeight - 30,
                        align: 'center',
                        font: fonts.footer
                    },
                    {
                        text: 'Anytown, USA',
                        left: pageWidth - 38,
                        top: pageHeight - 30,
                        align: 'right',
                        font: fonts.footer
                    }
                ],
                lines: [
                    {
                        left: 35,
                        top: pageHeight - 40,
                        bottom: pageHeight - 40,
                        right: pageWidth - 35,
                        width: 0.5,
                        color: colors.line
                    }
                ]
            },
            map: {
                top: 80,
                left: 35,
                height: 266,
                width: 266,
                dpi: 144,  //multiple of 72
                format: 'JPG',
                preserveScale: false,
                border: true
            },
            text: [],
            lines: [],
            pages: [], // you can group everything related to each individual page, if desired
            groupedItems: [], // for grouped items such as text on top of a graphic or shape
            shapes: [], // types: circle, ellipse, rectangle, square, triangle
            tables: [],
            attributes: [
                {
                    layout: 'column',
                    options: {
                        margin: {top: 110, left: pageCenter + 5, bottom: 35, right: 0},
                        tableWidth: 266,
                        theme: 'grid',
                        /*style: tableStyle,*/
                        styles: {
                            fontSize: 10,
                            cellPadding: 5,
                            fillColor: colors.white,
                            valign: 'top', // top, middle, bottom
                            overflow: 'linebreak', // visible, hidden, ellipsize or linebreak
                            labelWidth: 95
                        }
                    },
                    fields: [
                        {
                            fieldName: 'SitusFormatted1',
                            label: 'Situs Formatted 1',
                            rowHeading: {
                                text: 'Site Address',
                                font: fonts.rowHeading
                            }
                        },
                        {
                            fieldName: 'SitusFormatted2',
                            label: 'Situs Formatted 2'
                        },
                        {
                            fieldName: 'MailingDBAorCareOf',
                            label: 'DBA/Care of',
                            rowHeading: {
                                text: 'Mailing Address',
                                margin: {
                                    top: 20
                                },
                                font: fonts.rowHeading
                            }
                        },
                        {
                            fieldName: 'MailingAddress1',
                            label: 'Mailing Address 1'
                        },
                        {
                            fieldName: 'MailingAddress2',
                            label: 'Mailing Address 2'
                        },
                        {
                            fieldName: 'MailingAddress3',
                            label: 'Mailing Address 3'
                        },
                        {
                            fieldName: 'MailingAddress4',
                            label: 'Mailing Address 4'
                        }
                    ]
                },
                {
                    layout: 'column',
                    options: {
                        margin: {top: 396, left: 35, bottom: 35},
                        tableWidth: 266,
                        theme: 'grid',
                        /*style: tableStyle,*/
                        styles: {
                            fontSize: 10,
                            cellPadding: 5,
                            fillColor: colors.white,
                            valign: 'top', // top, middle, bottom
                            overflow: 'linebreak', // visible, hidden, ellipsize or linebreak
                            columnWidth: 133
                        }
                    },
                    fields: [
                        {
                            fieldName: 'LandSizeSqft',
                            label: 'Land Size (SF)',
                            format: 'integer',
                            rowHeading: {
                                text: 'Property Information',
                                font: fonts.rowHeading
                            }
                        },
                        {
                            fieldName: 'LandSizeAcres',
                            label: 'Land Size (Acres)'
                        },
                        {
                            fieldName: 'Subdivision',
                            label: 'Subdivision'
                        },
                        {
                            fieldName: 'UseCode',
                            label: 'Use Code'
                        },
                        {
                            fieldName: 'UseCodeType',
                            label: 'Use Code Type'
                        },
                        {
                            fieldName: 'UseCodeDescription',
                            label: 'Use Code Description'
                        },
                        {
                            fieldName: 'Taxability',
                            label: 'Taxability',
                            rowHeading: {
                                text: 'Tax Information',
                                margin: {
                                    top: 20
                                },
                                font: fonts.rowHeading
                            }
                        },
                        {
                            fieldName: 'TaxabilityDescription',
                            label: 'Taxability Description'
                        },
                        {
                            fieldName: 'TaxRateArea',
                            label: 'Tax Rate Area'
                        },
                        {
                            fieldName: 'TaxRateAreaDescription',
                            label: 'Tax Rate Area Description'
                        }
                    ]
                },
                {
                    layout: 'column',
                    options: {
                        margin: {top: 396, left: pageCenter + 5, bottom: 35, right: 0},
                        tableWidth: 266,
                        theme: 'grid',
                        /*style: tableStyle,*/
                        styles: {
                            fontSize: 10,
                            cellPadding: 5,
                            fillColor: colors.white,
                            valign: 'top', // top, middle, bottom
                            overflow: 'linebreak', // visible, hidden, ellipsize or linebreak
                            columnWidth: 133
                        }
                    },
                    fields: [
                        {
                            fieldName: 'Value601RollYear',
                            label: 'Roll Year Value',
                            rowHeading: {
                                text: 'Value History',
                                font: fonts.rowHeading
                            }
                        },
                        {
                            fieldName: 'Value601Land',
                            label: 'Land Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601Structure',
                            label: 'Structure Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601Fixtures',
                            label: 'Fixtures Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601FixturesRP',
                            label: 'Fixtures RP Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601Growing',
                            label: 'Growing Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601PPBusiness',
                            label: 'PP Business Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601PPMobileHome',
                            label: 'PP Mobile Home Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601TotalLI',
                            label: 'Total LI Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        },
                        {
                            fieldName: 'Value601NetValue',
                            label: 'Net Value',
                            format: 'currency',
                            formatOptions: formatOptions.currency
                        }
                    ]
                }
            ]
        }
    };
});