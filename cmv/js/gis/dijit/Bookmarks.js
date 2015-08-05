/*  ConfigurableMapViewerCMV
 *  version 1.3.4
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dijit/_WidgetBase","esri/dijit/Bookmarks","dojo/json","dojo/cookie","dojo/_base/lang","xstyle/css!./Bookmarks/css/Bookmarks.css"],function(a,b,c,d,e,f){return a([b],{declaredClass:"gis.digit.Bookmarks",postCreate:function(){this.inherited(arguments);var a=this.bookmarks;this.bookmarkItems=e("bookmarkItems"),void 0===this.bookmarkItems?this.bookmarkItems=[]:this.bookmarkItems=d.parse(this.bookmarkItems),this.bookmarks=new c({map:this.map,editable:this.editable,bookmarks:f.mixin(this.bookmarkItems,a)},this.domNode),this.connect(this.bookmarks,"onEdit","setBookmarks"),this.connect(this.bookmarks,"onRemove","setBookmarks")},setBookmarks:function(){e("bookmarkItems",d.stringify(this.bookmarks.toJson()),{expires:365})},_export:function(){return d.stringify(this.bookmarks.toJson())}})});
//# sourceMappingURL=Bookmarks.map