/*  ConfigurableMapViewerCMV
 *  version 1.3.4
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/query","dojo/dom-style","dijit/PopupMenuItem","dijit/TooltipDialog","dijit/form/HorizontalSlider","dijit/form/HorizontalRuleLabels"],function(a,b,c,d,e,f,g,h,i){return a(f,{layer:null,constructor:function(a){a=a||{},b.mixin(this,a)},postCreate:function(){this.inherited(arguments);var a=new h({value:this.layer.opacity,minimum:0,maximum:1,discreteValues:21,intermediateChanges:!0,showButtons:!1,onChange:b.hitch(this,function(a){this.layer.setOpacity(a),c.forEach(d("."+this.layer.id+"-layerLegendImage"),function(b){e.set(b,"opacity",a)})})}),f=new i({labels:["100%","50%","0%"],style:"height:1em;font-size:75%;"},a.bottomDecoration);f.startup(),a.startup(),this.popup=new g({style:"width:200px;",content:a}),e.set(this.popup.connectorNode,"display","none"),this.popup.startup()}})});
//# sourceMappingURL=Transparency.map