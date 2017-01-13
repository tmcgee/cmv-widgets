/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dijit/_WidgetBase","dojo/_base/lang","esri/dijit/Legend"],function(a,b,c,d){return a([b],{startup:function(){this.inherited(arguments),this.legend=new d({arrangement:this.arrangement||d.ALIGN_LEFT,autoUpdate:this.autoUpdate||!0,id:this.id+"_legend",layerInfos:this.layerInfos,map:this.map,respectCurrentMapScale:this.respectCurrentMapScale||!0},this.domNode),this.legend.startup(),this.map.on("update-end",c.hitch(this,function(){this.legend.refresh()}))}})});
//# sourceMappingURL=Legend.js.map