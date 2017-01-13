/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dojo/_base/lang"],function(a,b){return a(null,{startup:function(){this.inherited(arguments),this.initConfigAsync().then(b.hitch(this,"initConfigSuccess"),b.hitch(this,"initConfigError"))},handleError:function(a){if(this.config.isDebug&&"object"==typeof console)for(var b in a)a.hasOwnProperty(b)},mixinDeep:function(a,b){var c={};for(var d in b)if(!(d in a&&(a[d]===b[d]||d in c&&c[d]===b[d])))try{b[d].constructor===Object?a[d]=this.mixinDeep(a[d],b[d]):a[d]=b[d]}catch(c){a[d]=b[d]}return a}})});
//# sourceMappingURL=_ControllerBase.js.map