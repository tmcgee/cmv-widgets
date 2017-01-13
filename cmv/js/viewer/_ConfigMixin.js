/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dojo/_base/lang","dojo/Deferred"],function(a,b,c){return a(null,{initConfigAsync:function(){var a=new c,b="config/viewer",d=window.location.search,e=d.match(/config=([^&]*)/i);return e&&e.length>0&&(b=e[1],b.indexOf("/")<0&&(b="config/"+b)),require([b],function(b){a.resolve(b)}),a},initConfigSuccess:function(a){this.config=a,this.createWidgets(["loading"]),a.isDebug&&(window.app=this),this.mapClickMode={current:a.defaultMapClickMode,defaultMode:a.defaultMapClickMode},this.initLayout(),this.createWidgets(["layout"]),this.initMapAsync().then(b.hitch(this,"initMapComplete"),b.hitch(this,"initMapError"))},initConfigError:function(a){this.handleError({source:"Controller",error:a})}})});
//# sourceMappingURL=_ConfigMixin.js.map