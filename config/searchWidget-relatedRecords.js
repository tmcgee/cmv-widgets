define([
    'dojo/on',
    'dojo/topic'
], function (on, topic) {
    'use strict';

    return {
        map: true,
        mapClickMode: true,

        layers: [
            {
                name: 'Water Main',
                expression: '', // additional where expression applied to all queries
                idProperty: 'OBJECTID',
                queryParameters: {
                    type: 'spatial', // spatial, relationship, table or database
                    layerID: 'WaterMain', // from operational layers  //WMDocLinkTable
                    sublayerID: 4, //24
                    outFields: ['*']
                },
                attributeSearches: [
                    {
                        name: ' Documents',
                        searchFields: [
                            {
                                name: 'Document',
                                label: 'Document',
                                expression: '(Document LIKE \'%[value]%\')',
                                placeholder: 'Enter document name',
                                required: true,
                                minChars: 3
                            }
                        ],

                        title: 'Mud 71 Water Main',
                        topicID: 'WaterMainQuery',
                        gridOptions: {
                            columns: [
                                {
                                    field: 'Subdiv',
                                    label: 'Subdivision'
                                },
                                {
                                    field: 'Section',
                                    label: 'Section'
                                },
                                {
                                    field: 'Document',
                                    label: 'Document'
                                },
                                {
                                    field: 'Diameter',
                                    label: 'Diameter'
                                },
                                {
                                    id: 'Linked Documents',
                                    field: 'OBJECTID',
                                    label: 'Linked Documents',
                                    width: 100,
                                    sortable: false,
                                    exportable: true,
                                    renderCell: function (object, value, node) {
                                        on(node, 'click', function () {
                                            topic.publish('attributesContainer/addTable', {
                                                title: 'Related Documents',
                                                topicID: 'relatedDocumentsQuery',
                                                queryOptions: {
                                                    queryParameters: {
                                                        type: 'relationship',
                                                        layerID: 'WaterMain',
                                                        sublayerID: 4,
                                                        relationshipID: 1,
                                                        objectIDs: [value],
                                                        outFields: ['*']
                                                    },
                                                    idProperty: 'OBJECTID'
                                                },
                                                featureOptions: {
                                                    selected: false
                                                },
                                                toolbarOptions: {
                                                    show: false
                                                },
                                                gridOptions: {
                                                    columns: [
                                                        {
                                                            field: 'ID',
                                                            label: 'ID',
                                                            width: 100
                                                        },
                                                        {
                                                            field: 'Doc_Type',
                                                            label: 'Doc Type',
                                                            width: 100
                                                        },
                                                        {
                                                            field: 'Document',
                                                            label: 'Document',
                                                            width: 200
                                                        },
                                                        {
                                                            field: 'Document',
                                                            label: 'Link',
                                                            width: 50,
                                                            formatter: function (val) {
                                                                return '<a href="' + val + '" target="_blank"><i class="fa fa-file-pdf-o" style="color:red;"><i></a>';
                                                            }
                                                        }
                                                    ]
                                                }
                                            });
                                        });
                                        node.innerHTML = '<i class=\'fa fa-search\' style=\'margin-left:8px;\'></i>';
                                    }
                                }
                            ],
                            sort: [
                                {
                                    attribute: 'Document',
                                    descending: 'ASC'
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    };
});