/*eslint strict: 0 */
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/registry',
    'dojo/_base/array',
    'dojo/topic',

    'esri/tasks/query',
    'esri/tasks/QueryTask'

], function (
    declare,
    lang,
    registry,
    arrayUtil,
    topic,

    Query,
    QueryTask
) {

    return declare(null, {

        registryId: null,
        url: null,
        fieldName: null,

        /**
         * @constructor
         * @param {string} registryId The Dojo id of the control to populate with unique values.
         * @param {string} url The URL to the ArcGIS Server REST resource that represents a map service layer.
         * @param {string} fieldName The field name for which to retrieve unique values.
         * @param {boolean} includeBlankValue Whether to include a blank value.
         */
        constructor: function (registryId, url, fieldName, includeBlankValue) {
            this.registryId = registryId;
            this.url = url;
            this.fieldName = fieldName;
            this.includeBlankValue = includeBlankValue || false;

            var input = registry.byId(this.registryId);
            input.set('disabled', true);
        },

        /**
         * Execute the query to return distinct values.
         * @return {void}
         */
        executeQuery: function () {
            var queryTask = new QueryTask(this.url);
            var query = new Query();
            query.outFields = [this.fieldName];
            query.orderByFields = [this.fieldName];
            query.returnDistinctValues = true;
            query.returnGeometry = false;
            query.where = '1=1';

            queryTask.on('complete', lang.hitch(this, function (results) {
                var featureSet = results.featureSet,
                    options = [];
                if (this.includeBlankValue) {
                    options.push({
                        label: '&nbsp;',
                        value: null,
                        selected: false
                    });
                }
                if (featureSet.features) {
                    if (featureSet.features.length > 0) {
                        arrayUtil.forEach(featureSet.features, function (feature) {
                            options.push({
                                label: feature.attributes[this.fieldName].toString(),
                                value: feature.attributes[this.fieldName].toString(),
                                selected: false
                            });
                        }, this);
                        if (options.length > 0) {
                            options[0].selected = true;
                        }
                        var input = registry.byId(this.registryId);
                        input.set('options', options);
                        input.set('disabled', false);
                    }
                }
            }));

            queryTask.on('error', lang.hitch(this, function (error) {
                // an error occurred so no loading of the Select control with values
                topic.publish('viewer/handleError', {
                    error: error
                });
            }));

            queryTask.execute(query);
        }
    });
});