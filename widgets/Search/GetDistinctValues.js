define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/Deferred',

    'esri/tasks/query',
    'esri/tasks/QueryTask'

], function (
    declare,
    lang,
    arrayUtil,
    topic,
    Deferred,

    Query,
    QueryTask
) {

    return declare(null, {

        url: null,
        fieldName: null,

        /**
         * @constructor
         * @param {string} url The URL to the ArcGIS Server REST resource that represents a map service layer.
         * @param {string} fieldName The field name for which to retrieve unique values.
         * @param {string} where The where expression with which to filter the query.
         */
        constructor: function (url, fieldName, where) {
            this.url = url;
            this.fieldName = fieldName;
            if (!where) {
                where = '1=1';
            }
            this.where = where;
        },

        /**
         * Execute the query to return distinct values.
         * @return {void}
         */
        executeQuery: function () {
            var deferred = new Deferred();

            var queryTask = new QueryTask(this.url);
            var query = new Query();
            query.outFields = [this.fieldName];
            query.orderByFields = [this.fieldName];
            query.returnDistinctValues = true;
            query.returnGeometry = false;
            query.where = this.where;

            queryTask.on('complete', lang.hitch(this, function (records) {
                var featureSet = records.featureSet,
                    results = [];
                if (featureSet.features) {
                    if (featureSet.features.length > 0) {
                        results = arrayUtil.map(featureSet.features, function (feature) {
                            return feature.attributes[this.fieldName];
                        }, this);
                        deferred.resolve(results);
                    }
                }
            }));

            queryTask.on('error', lang.hitch(this, function (error) {
                // an error occurred so no loading of the Select control with values
                topic.publish('viewer/handleError', {
                    error: error
                });
                deferred.reject(error);
            }));

            queryTask.execute(query);
            return deferred;
        }
    });
});