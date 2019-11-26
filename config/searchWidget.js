/*eslint no-alert: 0*/
define([
    'dojo/on',
    'dojo/number',
    'esri/geometry/geometryEngine'
], function (on, number, geometryEngine) {

    function getDateTime (value) {
        if (isNaN(value) || value === 0 || value === null) {
            return null;
        }
        return new Date(value);
    }

    return {
        map: true,
        mapClickMode: true,

        queryStringOptions: {
            valueParameter: 'NAME'
        },

        enableAdvancedSearch: true,
        enableClearButton: true,

        layers: [
            {
                name: 'Damage Assessment',
                expression: '', // additional where expression applied to all queries
                idProperty: 'objectid',
                labelWidth: 110,
                queryParameters: {
                    type: 'spatial', // spatial, relationship, table or database
                    layerID: 'DamageAssessment', // from operational layers
                    sublayerID: 0,
                    outFields: ['*']
                },
                infoTemplates: {
                    buffer: {
                        title: 'Search Buffer',
                        content: function (feature) {
                            if (feature.geometry) {
                                return number.format(geometryEngine.geodesicArea(feature.geometry, 'acres'), {
                                    places: 2
                                }) + ' Acres';
                            }
                            return '';
                        }
                    }
                },
                attributeSearches: [
                    {
                        name: 'Search For Assessments',
                        searchFields: [
                            {
                                field: 'Inspector Name',
                                label: 'Inspector Name',
                                expression: '(inspector LIKE \'[value]%\')',
                                width: 'calc(100% - 130px)'
                            },
                            {
                                field: 'Type of Damage',
                                label: 'Type of Damage',
                                expression: '(typdamage LIKE \'[value]%\')',
                                values: ['*', 'Destroyed', 'Major', 'Minor'],
                                width: 125
                            }
                        ],
                        title: 'Assessments',
                        topicID: 'assessmentsQuery'
                    }
                ]
            },
            {
                name: 'Public Safety',
                expression: '', // additional where expression applied to all queries
                idProperty: 'OBJECTID',
                attributeSearches: [
                    {
                        name: 'Hospitals',
                        queryParameters: {
                            type: 'table', // spatial, relationship, table or database
                            layerID: 'louisvillePubSafety', // from operational layers
                            sublayerID: 5,
                            outFields: ['*']
                        },
                        enableClearButton: false,
                        searchFields: [
                            {
                                field: 'Hospital Name',
                                label: 'Name',
                                expression: '(NAME LIKE \'%[value]%\')',
                                required: true,
                                minChars: 3,
                                defaultValue: 'Bap',
                                width: 'calc(100% - 65px)'
                            },
                            {
                                field: 'Total Admissions',
                                label: 'Admissions >=',
                                type: 'numberspinner',
                                constraints: {min: 0, max: 100000, places: 0},
                                defaultValue: 0,
                                expression: '(TOTALADM >= [value])',
                                width: 120
                            },
                            {
                                field: 'Total Admissions',
                                label: 'Admissions <=',
                                type: 'numberspinner',
                                expression: '(TOTALADM <= [value])',
                                constraints: {min: 1, max: 99999, places: 0},
                                defaultValue: 4000,
                                width: 120
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
                                        node.innerHTML = '<i class=\'fas fa-pencil\' style=\'margin-left:8px;\'></i>';
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
                                    formatter: 'dateTime'
                                }
                            ],
                            sort: [
                                {
                                    property: 'NAME',
                                    descending: 'ASC'
                                }
                            ]
                        }
                    },
                    {
                        name: 'Police Stations',
                        queryParameters: {
                            type: 'table', // spatial, relationship, table or database
                            url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer/2',
                            outFields: ['*']
                        },
                        enableAdvancedSearch: false,

                        searchFields: [
                            {
                                field: 'PDNAME',
                                label: 'Station',
                                expression: '(PDNAME = \'[value]\')',
                                unique: true,
                                includeBlankValue: true,
                                width: 'calc(100% - 85px)'
                            },
                            {
                                field: 'LASTUPDATE',
                                label: 'Updated After',
                                expression: '(LASTUPDATE >= date \'[value]\')',
                                type: 'date',
                                labelWidth: 110,
                                width: 130
                            },
                            {
                                field: 'LASTUPDATE',
                                label: 'Updated Before',
                                expression: '(LASTUPDATE <= date \'[value]\')',
                                type: 'date',
                                labelWidth: 110,
                                width: 130
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
                                    field: 'PDFUNCTION',
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
                                    formatter: 'dateTime'
                                },
                                {
                                    field: 'layerName',
                                    label: 'Layer',
                                    width: 100
                                }
                            ],
                            sort: [
                                {
                                    property: 'PDNAME',
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
                    url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
                    layerIds: [1, 2, 3, 4, 5, 6, 7],
                    searchFields: ['FDNAME, PDNAME', 'NAME', 'RESNAME']
                },
                attributeSearches: [
                    {
                        name: 'Search for Public Safety Locations By Name',
                        searchFields: [
                            {
                                field: 'Name',
                                label: 'Name',
                                expression: '[value]%\')',
                                placeholder: 'fdname, pdname, name or resname',
                                required: true,
                                minChars: 3,
                                height: 120,
                                width: 'calc(100% - 65px)'
                            }
                        ],

                        title: 'Public Safety Locations',
                        topicID: 'findPublicSafetyQuery',
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
                                    formatter: 'date'

                                }
                            ],
                            sort: [
                                {
                                    property: 'Name',
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