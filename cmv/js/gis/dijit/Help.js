/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","gis/dijit/_FloatingWidgetMixin","dojo/dom-construct","dojo/on","dojo/_base/lang","dojo/aspect","dojo/text!./Help/templates/HelpDialog.html","dojo/i18n!./Help/nls/resource","dijit/form/Button","dijit/layout/TabContainer","dijit/layout/ContentPane","xstyle/css!./Help/css/Help.css"],function(a,b,c,d,e,f,g,h,i,j,k){return a([b,c,d,e],{widgetsInTemplate:!0,templateString:j,i18n:k,html:'<a href="#">link</a>'.replace("link",k.link),domTarget:"helpDijit",draggable:!1,baseClass:"helpDijit",postCreate:function(){if(this.inherited(arguments),this.parentWidget.draggable=this.draggable,this.parentWidget.toggleable)this.own(i.after(this.parentWidget,"toggle",h.hitch(this,function(){this.containerNode.resize()})));else{var a=f.place(this.html,this.domTarget);g(a,"click",h.hitch(this.parentWidget,"show"))}},onOpen:function(){this.openOnStartup||this.containerNode.resize()},close:function(){this.parentWidget.hide&&this.parentWidget.hide()}})});
//# sourceMappingURL=Help.js.map