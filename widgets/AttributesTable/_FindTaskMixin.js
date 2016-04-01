define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/number',

    'esri/tasks/FindTask',
    'esri/tasks/FindParameters'
], function (
    declare,
    lang,
    topic,
    num,

    FindTask,
    FindParameters
) {
    'use strict';

    return declare(null, {

        findOptions: {},

        // for all the standard parameters, see for https://developers.arcgis.com/javascript/jsapi/query-amd.html
        defaultFindOptions: {
            contains: true,
            dynamicLayerInfos: null,
            layerIds: null,
            layerDefinitions: null,
            maxAllowableOffset: null,
            outSpatialReference: null,
            returnGeometry: true,
            searchFields: null,
            searchText: null
        },

        getFindConfiguration: function (options) {
            this.findOptions = this.mixinDeep(lang.clone(this.defaultFindOptions), options);
        },

        executeFindTask: function (options) {
            this.getConfiguration(options);
            if (this.executingQuery === true) {
                return;
            }
            this.clearAll();

            this.getConfiguration(options);

            var url = this.getFindTaskURL();
            if (!url) {
                return;
            }

            this.executingQuery = true;

            var findParams = this.getFindParams();
            var findTask = new FindTask(url);
            findTask.execute(findParams, lang.hitch(this, this.processFindResults), lang.hitch(this, this.processFindError));
        },

        refreshFindTask: function () {
            this.executeFindTask(this.findOptions);
        },

        processFindError: function (error) {
            this.clearGrowl();
            this.executingQuery = false;

            var msg = lang.mixin(this.i18n.messages.searchError, {
                level: 'error',
                timeout: 5000
            });
            topic.publish('growler/growl', msg);
            topic.publish('viewer/handleError', {
                error: error
            });
        },

        processFindResults: function (results) {
            this.clearGrowl();
            this.executingQuery = false;

            if (!results) {
                return;
            }

            this.results = results;
            this.getFeaturesFromResults();

            var recCount = this.getFeatureCount();
            var msgNls = this.i18n.messages.searchResults;
            var msg = msgNls.message;
            if (!msg) {
                if (recCount > 0) {
                    msg = num.format(recCount) + ' ';
                    msg += (recCount > 1) ? msgNls.features : msgNls.feature;
                    msg += ' ' + msgNls.found + '.';
                } else {
                    msg = msgNls.noFeatures;
                }
            }

            if (recCount > 0) {
                this.populateGrid(results);
            }

            topic.publish(this.attributesContainerID + '/openPane');

            topic.publish('growler/growl', {
                title: this.title + ' ' + msgNls.title,
                message: msg,
                level: 'default',
                timeout: 5000
            });

            topic.publish(this.topicID + '/findResults', this.results);
        },

        getFindParams: function () {
            var findParams = new FindParameters();
            findParams.contains = this.findOptions.contains;
            findParams.dynamicLayerInfos = this.findOptions.dynamicLayerInfos;
            findParams.layerIds = this.findOptions.layerIds;
            findParams.layerDefinitions = this.findOptions.layerDefs;
            findParams.maxAllowableOffset = this.findOptions.maxAllowableOffset;
            findParams.outSpatialReference = this.findOptions.outSpatialReference;
            findParams.returnGeometry = this.findOptions.returnGeometry;
            findParams.searchFields = this.findOptions.searchFields;
            findParams.searchText = this.findOptions.searchText;
            return findParams;
        },

        getFindResults: function () {
            return this.getQueryResults();
        },

        clearFindResults: function () {
            this.clearQueryResults();
        },

        getFindTaskURL: function () {
            var fo = this.findOptions;
            var url = fo.url;
            if (!url && fo.layerID) {
                var layer = this.map.getLayer(fo.layerID);
                if (layer) {
                    url = layer.url;
                }
            }
            return url;
        }
    });
});
