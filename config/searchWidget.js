/*eslint no-alert: 0*/
define([
    'dojo/on',
    'dojo/_base/lang',
    'dojo/date/locale'
], function (on, lang, locale) {
    'use strict';

    function formatDateTime (value) {
        if (value instanceof Date) {
            return locale.format(value, {
                formatLength: 'short'
            });
        }
        return '';
    }

    function formatDate (value) {
        if (value instanceof Date) {
            return locale.format(value, {
                selector: 'date',
                formatLength: 'medium'
            });
        }
        return '';
    }

    function getDateTime (value) {
        if (isNaN(value) || value === 0 || value === null) {
            return null;
        }
        return new Date(value);
    }

    return {
        map: true,
        mapClickMode: true,

        layers: [
            {
                name: 'Damage Assessment',
                expression: '', // additional where expression applied to all queries
                idProperty: 'objectid',
                queryParameters: {
                    type: 'spatial', // spatial, relationship, table or database
                    layerID: 'DamageAssessment', // from operational layers
                    sublayerID: 0,
                    outFields: ['*']
                },
                attributeSearches: [
                    {
                        name: 'Search For Assessments',
                        searchFields: [
                            {
                                name: 'Inspector Name',
                                label: 'Inspector Name',
                                expression: '(inspector LIKE \'[value]%\')',
                                placeholder: 'Enter the name Fred',
                                required: true,
                                minChars: 3
                            },
                            {
                                name: 'Type of Damage',
                                label: 'Type of Damage',
                                expression: '(typdamage LIKE \'[value]%\')',
                                placeholder: 'Enter the text Destroyed, Major or Minor',
                                minChars: 3
                            }
                        ],

                        title: 'Assessments',
                        topicID: 'assessmentsQuery',
                        gridOptions: {
                            columns: [
                                {
                                    field: 'incidentnm',
                                    label: 'Name'
                                },
                                {
                                    field: 'inspdate',
                                    label: 'Inspected',
                                    width: 150,
                                    get: function (object) { // allow export as a proper date
                                        return getDateTime(object.inspdate);
                                    },
                                    formatter: formatDateTime
                                },
                                {
                                    field: 'inspector',
                                    label: 'Inspector'
                                },
                                {
                                    field: 'fulladdr',
                                    label: 'Address'
                                },
                                {
                                    field: 'pstlcity',
                                    label: 'City'
                                },
                                {
                                    field: 'typdamage',
                                    label: 'Damage'
                                },
                                {
                                    field: 'lastupdate',
                                    label: 'Updated',
                                    get: function (object) { // allow export as a proper date
                                        return getDateTime(object.lastupdate);
                                    },
                                    formatter: formatDateTime
                                }
                            ],
                            sort: [
                                {
                                    attribute: 'incidentnm',
                                    descending: 'ASC'
                                }
                            ]
                        }
                    }
                ]
            },
            {
                name: 'Hospitals',
                expression: '', // additional where expression applied to all queries
                idProperty: 'OBJECTID',
                queryParameters: {
                    type: 'table', // spatial, relationship, table or database
                    layerID: 'louisvillePubSafety', // from operational layers
                    sublayerID: 5,
                    outFields: ['*']
                },
                attributeSearches: [
                    {
                        name: 'Search For Hospital',
                        searchFields: [
                            {
                                name: 'Hospital Name',
                                label: 'Name',
                                expression: '(NAME LIKE \'%[value]%\')',
                                placeholder: 'Enter the name of the hospital',
                                required: true,
                                minChars: 3
                            },
                            {
                                name: 'Total Admissions',
                                label: 'Total Admissions >=',
                                expression: '(TOTALADM >= [value])',
                                placeholder: 'Total Admissions >='
                            },
                            {
                                name: 'Total Admissions',
                                label: 'Total Admissions <=',
                                expression: '(TOTALADM <= [value])',
                                placeholder: 'Total Admissions <='
                            }
                        ],

                        title: 'Hospitals',
                        topicID: 'hospitalQuery',
                        gridOptions: {
                            columns: [
                                {
                                    id: 'Action',
                                    field: 'OBJECTID',
                                    label: 'Action',
                                    width: 60,
                                    sortable: false,
                                    exportable: false,
                                    renderCell: function (object, value, node) {
                                        on(node, 'click', function () {
                                            alert('Do something exciting here like search for related records or edit the selected record.');
                                        });
                                        node.innerHTML = '<i class=\'fa fa-pencil\' style=\'margin-left:8px;\'></i>';
                                    }
                                },
                                {
                                    field: 'NAME',
                                    label: 'Name'
                                },
                                {
                                    field: 'ADDRESS',
                                    label: 'Address',
                                    width: 150
                                },
                                {
                                    field: 'CITY',
                                    label: 'City',
                                    width: 80
                                },
                                {
                                    field: 'STABREV',
                                    label: 'State',
                                    width: 50
                                },
                                {
                                    field: 'ZIPCODE',
                                    label: 'Zip Code',
                                    width: 100
                                },
                                {
                                    field: 'TOTALADM',
                                    label: 'Total Admission',
                                    width: 100
                                },
                                {
                                    field: 'LASTUPDATE',
                                    label: 'Last Update',
                                    width: 120,
                                    get: function (object) { // allow export as a proper date
                                        return getDateTime(object.LASTUPDATE);
                                    },
                                    formatter: formatDateTime
                                }
                            ],
                            sort: [
                                {
                                    attribute: 'NAME',
                                    descending: 'ASC'
                                }
                            ]
                        }
                    }
                ]
            },
            {
                name: 'Police Stations',
                expression: '', // additional where expression applied to all queries
                queryParameters: {
                    type: 'table', // spatial, relationship, table or database
                    layerID: 'louisvillePubSafety', // from operational layers
                    sublayerID: 2,
                    outFields: ['*']
                },
                idProperty: 'OBJECTID',
                attributeSearches: [
                    {
                        name: 'Search For Police Station By Name',
                        searchFields: [
                            {
                                name: 'Police Station',
                                label: 'Name',
                                expression: '(PDNAME LIKE \'[value]%\')',
                                placeholder: 'Enter the Name of the Police Station',
                                required: true,
                                minChars: 3
                            }
                        ],

                        title: 'Police Stations',
                        topicID: 'policeStationQuery',
                        gridOptions: {
                            columns: [
                                {
                                    field: 'PDNAME',
                                    label: 'Name',
                                    width: 150
                                },
                                {
                                    field: 'ADDRESS',
                                    label: 'Address',
                                    width: 150
                                },
                                {
                                    field: 'PDTYPE',
                                    label: 'Type',
                                    width: 100
                                },
                                {
                                    field: 'FUNCTION',
                                    label: 'Function',
                                    width: 100
                                },
                                {
                                    field: 'LASTUPDATE',
                                    label: 'Last Update',
                                    width: 100,
                                    get: function (object) { // allow export as a proper date
                                        return new Date(object.LASTUPDATE);
                                    },
                                    formatter: formatDateTime
                                }
                            ],
                            sort: [
                                {
                                    attribute: 'PDNAME',
                                    descending: 'ASC'
                                }
                            ]
                        }
                    }
                ]
            },
            {
                name: 'Public Safety by Name',
                findOptions: {
                    url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
                    layerIds: [1, 2, 3, 4, 5, 6, 7],
                    searchFields: ['FDNAME, PDNAME', 'NAME', 'RESNAME']
                },
                attributeSearches: [
                    {
                        name: 'Search for Public Safety Locations By Name',
                        searchFields: [
                            {
                                name: 'Name',
                                label: 'Name',
                                expression: '[value]%\')',
                                placeholder: 'fdname, pdname, name or resname',
                                required: true,
                                minChars: 3
                            }
                        ],

                        title: 'Public Safety Locations',
                        topicID: 'findPublicSafterQuery',
                        gridOptions: {
                            columns: [
                                {
                                    field: 'value',
                                    label: 'Name'
                                },
                                {
                                    field: 'displayFieldName',
                                    label: 'Field',
                                    width: 150
                                },
                                {
                                    field: 'layerName',
                                    label: 'Layer',
                                    width: 150
                                },
                                {
                                    field: 'Last Update Date',
                                    label: 'Last Updated',
                                    width: 150,
                                    get: function (object) { // allow export as a proper date
                                        return new Date(object['Last Update Date']);
                                    },
                                    formatter: formatDate

                                }
                            ],
                            sort: [
                                {
                                    attribute: 'Name',
                                    descending: false
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    };
});