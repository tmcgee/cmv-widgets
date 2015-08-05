/*  ConfigurableMapViewerCMV
 *  version 1.3.4
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","esri/kernel","dojo/cookie","dojo/json","dojo/_base/unload","dojo/_base/lang"],function(a,b,c,d,e,f){return a(null,{constructor:function(a){this.idStateName=a||"esri_jsapi_id_manager_data",e.addOnUnload(f.hitch(this,"storeCredentials")),this.loadCredentials()},loadCredentials:function(){var a,e;a=this._supportsLocalStorage()?window.localStorage.getItem(this.idStateName):c(this.idStateName),a&&"null"!=a&&a.length>4&&(e=d.parse(a),b.id.initialize(e))},storeCredentials:function(){if(0!==b.id.credentials.length){var a=d.stringify(b.id.toJson());this._supportsLocalStorage()?window.localStorage.setItem(this.idStateName,a):c(this.idStateName,a,{expires:1})}},_supportsLocalStorage:function(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}})});
//# sourceMappingURL=Vim.map