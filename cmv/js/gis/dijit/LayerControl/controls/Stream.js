/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_Contained","./_Control","./../plugins/legendUtil"],function(a,b,c,d,e,f){var g=a([b,c,d,e],{_layerType:"overlay",_esriLayerType:"raster",_layerTypeInit:function(){f.isLegend(this.controlOptions.noLegend,this.controller.noLegend)?(this._expandClick(),f.layerLegend(this.layer,this.expandNode)):this._expandRemove()}});return g});
//# sourceMappingURL=Stream.js.map