/*  ConfigurableMapViewerCMV
 *  version 1.3.4
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dojo/on","dojo/_base/lang"],function(a,b,c){return a(null,{startup:function(){this.parentWidget&&"gis.dijit.FloatingWidget"===this.parentWidget.declaredClass&&this.onOpen&&b(this.parentWidget,"show",c.hitch(this,"onOpen")),this.parentWidget&&"gis.dijit.FloatingWidget"===this.parentWidget.declaredClass&&this.onClose&&b(this.parentWidget,"hide",c.hitch(this,"onClose")),this.parentWidget&&"gis.dijit.FloatingWidget"===this.parentWidget.declaredClass&&this.openOnStartup&&this.parentWidget.show(),this.inherited(arguments)}})});
//# sourceMappingURL=_FloatingWidgetMixin.map