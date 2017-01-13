/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","dojo/_base/lang","dojo/topic","esri/dijit/BasemapGallery","dojo/text!./BasemapGallery/templates/BasemapGallery.html","dojo/i18n!./BasemapGallery/nls/resource","dijit/layout/ContentPane","dijit/TitlePane","xstyle/css!./BasemapGallery/css/BasemapGallery.css"],function(a,b,c,d,e,f,g,h,i){return a([b,c,d],{widgetsInTemplate:!0,templateString:h,i18n:i,baseClass:"cmvBasemapGalleryWidget",galleryOptions:{showArcGISBasemaps:!0},postCreate:function(){this.inherited(arguments);var a=e.mixin({map:this.map},this.galleryOptions||{});this.basemapGallery=new g(a,"basemapGallery"),this.basemapGallery.startup(),this.basemapGallery.on("selection-change",e.hitch(this,"basemapSelected")),this.basemapGallery.on("error",function(a){f.publish("viewer/handleError","basemap gallery error: "+a)})},basemapSelected:function(){this.basemapGalleryTitlePane.set("open",!1)}})});
//# sourceMappingURL=BasemapGallery.js.map