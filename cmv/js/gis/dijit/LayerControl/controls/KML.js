/*  ConfigurableMapViewerCMV
 *  version 1.3.4
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_Contained","./_Control","./../plugins/legendUtil"],function(a,b,c,d,e,f){var g=a([b,c,d,e],{_layerType:"vector",_esriLayerType:"kml",_layerTypeInit:function(){this._expandClick(),f.isLegend(this.controlOptions.noLegend,this.controller.noLegend)&&f.layerLegend(this.layer,this.expandNode)}});return g});
//# sourceMappingURL=KML.map