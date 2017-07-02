define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/Deferred',
    'dojo/promise/all',
    'dojo/when',
    'dojo/topic',
    'module',

    'esri/request',

    'jquery',

    '../GetDistinctValues',

    'xstyle/css!./lib/query-builder.default.min.css',
    'xstyle/css!./lib/querybuilder-bootstrap-shim.min.css',
    'xstyle/css!./lib/selectize.default.min.css',
    'xstyle/css!./lib/selectize.bootstrap3.min.css',
    'xstyle/css!../css/AdvancedSearch.css'
], function (
    declare,
    lang,
    array,
    Deferred,
    allPromise,
    when,
    topic,
    module,

    esriRequest,

    $,

    GetDistinctValues
) {

    return declare(null, {
        queryBuilder: null,

        defaultQueryBuilderOptions: {
            icons: {
                'add_group': 'fa fa-plus-square',
                'add_rule': 'fa fa-plus-circle',
                'remove_group': 'fa fa-minus-square',
                'remove_rule': 'fa fa-minus-circle',
                'error': 'fa fa-exclamation-triangle'
            },
            'display_errors': true,
            'allow_groups': false,

            filters: []
        },

        firstValidationError: null,

        postCreate: function () {
            this.inherited(arguments);

            this.showLoadingSpinnerWhile(lang.hitch(this, function () {
                var deferred = new Deferred();

                // load the query-builder scripts as modules
                var modulesPath = module.uri.substring(0, module.uri.lastIndexOf('/')) + '/lib';
                window.dojoConfig.packages.push({
                    name: 'query-builder',
                    location: modulesPath,
                    main: 'query-builder.standalone.min'
                });
                window.dojoConfig.packages.push({
                    name: 'selectize',
                    location: modulesPath,
                    main: 'selectize.min'
                });

                require(window.dojoConfig, [
                    'query-builder',
                    'selectize'
                ], lang.hitch(this, function () {
                    this.loadQueryBuilder().then(function () {
                        deferred.resolve();
                    }, function (e) {
                        deferred.reject(e);
                    });
                }));

                return deferred;
            }));
        },

        loadQueryBuilder: function () {
            var qbOptions = this.mixinDeep(this.defaultQueryBuilderOptions, this.queryBuilderOptions || {});

            this.queryBuilder = { // Namespace the configuration variables in this mixin
                _queryBuilderDOM: null,
                _queryBuilder: null,

                search: null,
                url: null,

                _fields: {},

                options: {
                    targetDOM: null,
                    qbOptions: qbOptions
                },

                init: function (options) {
                    lang.mixin(this.options, options);
                },

                setSearch: function (search) {
                    if (!search || !search.queryParameters) {
                        return when(null);
                    }

                    this.search = search;
                    this.url = this.getLayerURL(search.queryParameters);
                    if (!this.url) {
                        return when(null);
                    }

                    if (this._queryBuilder) {
                        this._queryBuilder.destroy();
                        delete this._queryBuilder;
                    }

                    this._initQBOptions();

                    this._fields = {};

                    var queries = [];
                    var defaultToCaseInsensitive = false;
                    var advancedSearchOptions = search.advancedSearchOptions;
                    if (advancedSearchOptions.defaultToCaseInsensitive) {
                        defaultToCaseInsensitive = true;
                    }
                    if (advancedSearchOptions.fields && advancedSearchOptions.fields.length) {
                        array.forEach(advancedSearchOptions.fields, function (field) {
                            field.id = field.id || field.field;
                            if (field.id) {
                                this._fields[field.id] = lang.clone(field);
                                if (field.unique) {
                                    queries.push(this._fetchSelectOptions(this._fields[field.id]));
                                }
                            }
                        }, this);
                    }

                    if (!advancedSearchOptions.fields || advancedSearchOptions.fetchAllFields) {
                        queries.push(this._fetchAllFields().then(lang.hitch(this, function (esriFields) {
                            array.forEach(esriFields, function (f) {
                                var parsed = this._parseESRIField(f);
                                parsed = lang.mixin(parsed, {
                                    caseInsensitive: defaultToCaseInsensitive
                                });
                                this._fields[parsed.id] = lang.mixin(parsed, this._fields[parsed.id]); // Local config takes precedence
                            }, this);
                        })));
                    }

                    allPromise(queries).then(lang.hitch(this, function () {
                        this._createQueryBuilder();
                    }));

                    return when(null);
                },

                getLayerURL: function (qp) {
                    var url = qp.url;
                    if (!url && qp.layerID) {
                        var layer = this.options.map.getLayer(qp.layerID);
                        if (layer) {
                            if (layer.declaredClass === 'esri.layers.FeatureLayer') { // Feature Layer
                                url = layer.url;
                            } else if (layer.declaredClass === 'esri.layers.ArcGISDynamicMapServiceLayer') { // Dynamic Layer
                                if (qp.sublayerID !== null) {
                                    url = layer.url + '/' + qp.sublayerID;
                                } else if (layer.visibleLayers && layer.visibleLayers.length === 1) {
                                    url = layer.url + '/' + layer.visibleLayers[0];
                                }
                            }
                        }
                    }
                    return url;
                },

                _initQBOptions: function () {
                    this.qbOptions = lang.clone(this.options.qbOptions);

                    // Use <> instead of != in SQL output
                    this.qbOptions.sqlOperators = {
                        'not_equal': {
                            op: '<> ?'
                        },
                        'is_not_empty': {
                            op: '<> \'\''
                        }
                    };
                    this.qbOptions.sqlRuleOperators = {
                        '<>': function (v) {
                            return {
                                val: v,
                                op: v === '' ? 'is_not_empty' : 'not_equal'
                            };
                        }
                    };
                    this.qbOptions.filters = [];
                },

                _fetchAllFields: function () {
                    var deferred = new Deferred();
                    var content = {
                            f: 'json'
                        },
                        options = {
                            disableIdentityLookup: false,
                            usePost: false,
                            useProxy: false
                        };
                    esriRequest({
                        url: this.url,
                        callbackParamName: 'callback',
                        content: content
                    }, options).then(
                        function (data) {
                            deferred.resolve(data.fields);
                        },
                        function () {
                            deferred.reject();
                        }
                    );
                    return deferred;
                },

                _fetchSelectOptions: function (field) {
                    var distinct = new GetDistinctValues(this.url, field.id, this.search.where);
                    return distinct.executeQuery()
                        .then(lang.hitch(this, function (fieldID, results) {
                            this._fields[fieldID].options = array.map(results, function (result) {
                                return {
                                    id: result,
                                    name: result
                                };
                            });
                        }, field.id));
                },

                _qbOnUpdateOperator: function (e, rule) {
                    if (rule.filter.plugin === 'selectize') {
                        var el = rule.$el.find('.rule-value-container input')[0];
                        if (!el || !el.selectize) {
                            return;
                        }
                        el.selectize.settings.maxItems = (rule.operator.multiple ? null : 1);
                        var mode = el.selectize.settings.mode = (rule.operator.multiple ? 'multi' : 'single');

                        // SUPER HACKY
                        rule.$el.find('.rule-value-container .selectize-control').removeClass('multi').removeClass('single').addClass(mode);
                        rule.$el.find('.rule-value-container .selectize-dropdown').removeClass('multi').removeClass('single').addClass(mode);
                    }
                },

                _createQueryBuilder: function () {
                    var fieldNames = Object.keys(this._fields).sort(function (a, b) {
                        a = a.toLowerCase();
                        b = b.toLowerCase();
                        if (a < b) {
                            return -1;
                        }
                        if (a > b) {
                            return 1;
                        }
                        return 0;
                    });
                    var filterableFields = null;
                    if (this.search.advancedSearchOptions) {
                        filterableFields = this.search.advancedSearchOptions.filterableFields;
                    }

                    array.forEach(fieldNames, lang.hitch(this, function (fname) {
                        if (!this._fields[fname].hidden) {
                            if (!filterableFields || array.indexOf(filterableFields, fname) !== -1) {
                                this._addFilter(this._fields[fname]);
                            }
                        }
                    }));

                    // Make sure we successfully created at least one filter
                    if (this.qbOptions.filters.length === 0) {
                        return;
                    }

                    this._queryBuilder = $(this.options.targetDOM).queryBuilder(this.qbOptions)[0].queryBuilder;

                    // Selectize fix
                    this._queryBuilder.on('afterCreateRuleInput.queryBuilder', function (e, rule) {
                        if (rule.filter.plugin === 'selectize') {
                            rule.$el.find('.rule-value-container').css('min-width', '200px')
                                .find('.selectize-control').removeClass('form-control');
                        }
                    });

                    // Multiple-selectize on IN / NOT IN operators
                    this._queryBuilder.on('afterUpdateRuleFilter.queryBuilder', lang.hitch(this, this._qbOnUpdateOperator));
                    this._queryBuilder.on('afterUpdateRuleOperator.queryBuilder', lang.hitch(this, this._qbOnUpdateOperator));

                    this._queryBuilder.on('validationError.queryBuilder', lang.hitch(this, function (e, rule, error /*, value */) {
                        if (!this.firstValidationError) {
                            this.firstValidationError = this._queryBuilder.lang.errors[error];
                        }
                    }));
                    this._queryBuilder.on('validate.queryBuilder.filter', lang.hitch(this, function (e) {
                        if (!e.value) {
                            topic.publish('growler/growl', {
                                title: 'Advanced Search',
                                message: this.firstValidationError || 'Unknown QueryBuilder error.',
                                level: 'error',
                                timeout: 3000
                            });
                            this.firstValidationError = null;
                        }
                        return e.value;
                    }));

                    // Support case-insensitivity
                    // NB: This will break when sql is exported and then re-imported, but that functionality is currently disabled anyway
                    // This function replicates much of the functionality of query-builder's getSQL function, adding value whitespace trimming and case insensitivity for singular and multiple values.
                    function sqlFnShim (qb, rule) {
                        var value = '';
                        var sql = qb.settings.sqlOperators[rule.operator];
                        var Utils = $.fn.queryBuilder.constructor.utils;
                        rule.value.forEach(function (v, i) {
                            if (i > 0) {
                                value += sql.sep;
                            }

                            if (rule.type === 'integer' || rule.type === 'double' || rule.type === 'boolean') {
                                v = Utils.changeType(v, rule.type, true);
                            } else {
                                v = Utils.escapeString(v);
                            }

                            if (sql.mod) {
                                v = Utils.fmt(sql.mod, v);
                            }

                            if (typeof v === 'string') {
                                v = '\'' + v.trim() + '\'';

                                if (rule.data.caseInsensitive) {
                                    v = 'UPPER(' + v + ')';
                                }
                            }

                            value += v;
                        });
                        return value;
                    }
                    this._queryBuilder.on('ruleToSQL.filter', lang.hitch(this, function (e, rule, value, sqlFn) {
                        if (rule.data.type === 'string' && rule.data.caseInsensitive) { // check rule.data.type so we don't use UPPER for select inputs
                            e.value = 'UPPER(' + rule.field + ') ' + sqlFn(sqlFnShim(this._queryBuilder, rule));
                        }
                    }));
                },

                _addFilter: function (field) {
                    var filter = this._buildFilterConfig(field);

                    switch (filter.type) {
                    case 'string':
                    case 'integer':
                    case 'double':
                    case 'datetime':
                    case 'date':
                        this.qbOptions.filters.push(filter);
                        return;
                    default:
                        return;
                    }
                },

                clear: function () {
                    if (this._queryBuilder) {
                        this._queryBuilder.reset();
                    }
                },

                toSQL: function () {
                    if (!this._queryBuilder.getRules()) {
                        return null;
                    }
                    return this._queryBuilder.getSQL();
                },

                fromSQL: function (sql) {
                    if (!sql) {
                        return null;
                    }
                    return this._queryBuilder.setRulesFromSQL(sql);
                },

                _buildFilterConfig: function (field) {
                    var filter = {
                        id: field.id,
                        label: field.label,
                        type: field.type,
                        'value_separator': ','
                    };
                    if (field.type === 'date' || field.type === 'datetime') {
                        filter = {
                            id: field.id,
                            label: field.label,
                            type: 'date',
                            // Validation requires MomentJS to be defined globally, which we don't want.  Just break if an invalid date is passed for now.
                            // validation: {
                            //   format: 'MM/DD/YYYY'
                            // },
                            placeholder: 'MM/DD/YYYY'
                            // plugin: 'datepicker', // jQuery UI doesn't easily play well with Dojo
                            // plugin_config: {
                            //   format: 'yyyy/mm/dd',
                            //   todayBtn: 'linked',
                            //   todayHighlight: true,
                            //   autoclose: true
                            // }
                        };
                    } else if (field.unique || field.options) {
                        filter = {
                            id: field.id,
                            label: field.label,
                            type: field.type,
                            operators: ['equal', 'not_equal', 'in', 'not_in'],
                            plugin: 'selectize',
                            'value_separator': ',',
                            'plugin_config': {
                                valueField: 'id',
                                labelField: 'name',
                                searchField: 'name',
                                sortField: 'name',
                                plugins: [], // 'remove_button' would be nice, but doesn't play well with single/multi switching customizations
                                delimeter: ',', // WARNING: This could cause issues if there's a comma in a value
                                onInitialize: function () {
                                    if (!field.options) {
                                        return;
                                    }
                                    array.forEach(field.options, function (item) {
                                        if (typeof item !== 'object') {
                                            item = {
                                                id: item,
                                                name: item
                                            };
                                        }
                                        this.addOption(item);
                                    }, this);
                                    // this.refreshItems();
                                }
                            },
                            valueSetter: function (rule, value) {
                                rule.$el.find('.rule-value-container input')[0].selectize.setValue(value);
                            },
                            valueGetter: function (rule) {
                                var val = rule.$el.find('.rule-value-container input')[0].selectize.getValue();
                                return val.split(',');
                            }
                        };
                    }

                    if (field.range) { // Can apply to integers, doubles, dates, strings, selects (count min/max)
                        filter.validation = {
                            min: field.range.min,
                            max: field.range.max
                        };
                    }

                    filter.data = lang.clone(field);

                    return filter;
                },

                _parseESRIField: function (field) {
                    var parsed = {
                        id: field.name,
                        label: field.alias || field.name,
                        type: this._convertFieldTypeFromESRI(field.type)
                    };

                    if (field.domain) {
                        if (field.domain.type === 'codedValue' && parsed.type === 'string') {
                            parsed.options = array.map(field.domain.codedValues, function (cv) {
                                return {
                                    id: cv.code,
                                    name: cv.name
                                };
                            });
                        } else if (field.domain.type === 'range') {
                            parsed.range = {
                                min: field.domain.minValue,
                                max: field.domain.maxValue
                            };
                        }
                    }

                    return parsed;
                },

                _convertFieldTypeFromESRI: function (esriType) {
                    switch (esriType) {
                    case 'esriFieldTypeSmallInteger':
                    case 'esriFieldTypeInteger':
                        return 'integer';
                    case 'esriFieldTypeSingle': // Can a single-precision float accept a double-precision float as query input?  For now we presume yes
                    case 'esriFieldTypeDouble':
                        return 'double';
                    case 'esriFieldTypeString':
                        return 'string';
                    case 'esriFieldTypeDate':
                        return 'datetime';
                    case 'esriFieldTypeOID':
                    case 'esriFieldTypeGlobalID':
                        return 'string';
                    case 'esriFieldTypeGeometry':
                    case 'esriFieldTypeBlob':
                    case 'esriFieldTypeRaster':
                    case 'esriFieldTypeXML':
                        // Complex types are currently unimplemented
                        return null;
                    default:
                        return esriType;
                    }
                },

                _showLoadingSpinner: function () {
                    //future
                },

                _hideLoadingSpinner: function () {
                    //future
                }
            };

            this.queryBuilder.init({
                targetDOM: this.divAdvancedQueryBuilder,
                map: this.map
            });
            return this.getQueryBuilder();
        },

        getQueryBuilder: function () {
            var layer = this.layers[this.attributeLayer];
            var searchIndex = this.searchIndex || 0;
            if (!layer || !layer.attributeSearches || !layer.attributeSearches[searchIndex]) {
                return when(null);
            }

            var search = layer.attributeSearches[searchIndex];

            if (!this.checkAdvancedSearchEnabled(layer, search)) {
                return when(null);
            }

            var advancedSearchOptions = lang.clone(search.advancedSearchOptions || layer.advancedSearchOptions || {});
            var queryParameters = lang.clone(search.queryParameters || layer.queryParameters || {});
            var where = this.getDefaultWhereClause(layer, search);
            return this.queryBuilder ? this.queryBuilder.setSearch({
                where: where,
                queryParameters: queryParameters,
                advancedSearchOptions: advancedSearchOptions
            }) : when(null);

        }
    });
});