/*eslint strict: 0 */
define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/topic',

    'esri/tasks/FeatureSet',
    'esri/tasks/Geoprocessor',
    'esri/graphic',
    'esri/tasks/LinearUnit',
    'esri/symbols/SimpleMarkerSymbol'

], function (
    declare,
    _WidgetBase,

    lang,
    topic,

    FeatureSet,
    Geoprocessor,
    Graphic,
    LinearUnit,
    SimpleMarkerSymbol
) {

    return declare([_WidgetBase], {

        topicID: 'attributesContainer',

        url: 'http://sampleserver6.arcgisonline.com/ArcGIS/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed',

        symbol: {
            type: 'esriSMS',
            style: 'esriSMSCircle',
            size: 14,
            color: [0, 255, 0, 64],
            outline: {
                type: 'esriSLS',
                style: 'esriSLSSolid',
                color: [255, 0, 0],
                width: 1
            }
        },

        distance: 5,
        distanceUnits: 'esriMiles',

        postCreate: function () {
            this.inherited(arguments);

            // execute the computeViewShed method when user clicks the map
            this.map.on('click', lang.hitch(this, 'computeViewShed'));
        },

        computeViewShed: function (evt) {
            // remove previous point, if any
            this.map.graphics.clear();

            // add the point to the map
            var pointSymbol = new SimpleMarkerSymbol(this.symbol);
            var graphic = new Graphic(evt.mapPoint, pointSymbol);
            this.map.graphics.add(graphic);

            // create the feature set to pass to the GP
            var featureSet = new FeatureSet();
            featureSet.features = [graphic];
            var vsDistance = new LinearUnit();
            vsDistance.distance = this.distance;
            vsDistance.units = this.distanceUnits;
            var params = {
                'Input_Observation_Point': featureSet,
                'Viewshed_Distance': vsDistance
            };

            // execute the GP
            var gp = new Geoprocessor(this.url);
            gp.setOutputSpatialReference({
                wkid: this.map.spatialReference.wkid
            });

            gp.execute(params, lang.hitch(this, 'drawViewshed'));
        },

       // process the results of GP
        drawViewshed: function (results) {
            // clear any query Results
            topic.publish(this.topicID + '/clearQueryResults');

            // clear any previous features
            topic.publish(this.topicID + '/clearFeatures');

            // load the features into the table
            topic.publish(this.topicID + '/populateGrid', results[0].value);

            // open the bottom pane
            topic.publish('viewer/togglePane', {
                pane: 'bottom',
                show: 'block'
            });
        }
    });
});