/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/number","dojo/date/locale"],function(a,b){return{formatInt:function(b){return a.format(b)},formatFloat:function(b){return a.format(b,{places:3})},formatDate:function(a){var c=new Date(a);return b.format(c,{formatLength:"short"})}}});
//# sourceMappingURL=Formatters.js.map