define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-class',
    'dojo/Deferred',
    'dojo/aspect',

    'dijit/ConfirmDialog',

    'xstyle/css!./MessageBox/css/MessageBox.css'

], function (
    declare,
    _WidgetBase,

    lang,
    array,
    domClass,
    Deferred,
    aspect,

    ConfirmDialog
) {

    return declare([_WidgetBase], {

        nameSpace: null,
        okMessage: 'MessageBox.OK',
        cancelMessage: 'MessageBox.Cancel',

        startup: function () {

            // create the namespace if it doesn't exist
            if (this.nameSpace && (typeof this.nameSpace === 'string')) {
                this.nameSpace = this._createNamespace(this.nameSpace);
            }
            var ns = this.nameSpace || window;

            // only create it once
            if (!ns.MessageBox) {
                ns.MessageBox = {
                    okMessage: this.okMessage,
                    cancelMessage: this.cancelMessage,

                    confirm: lang.hitch(this, function (opts) {
                        opts = lang.mixin(opts, {
                            'class': 'cmvMessageBox cmvConfirmDialog'
                        });
                        return this._createDialog(opts);
                    }),

                    alert: lang.hitch(this, function (opts) {
                        opts = lang.mixin(opts, {
                            'class': 'cmvMessageBox cmvAlertDialog'
                        });
                        return this._createDialog(opts);
                    })
                };
            }
        },

        _createNamespace: function () {
            var o = null,
                d = null;
            array.forEach(arguments, function (v) {
                d = v.split('.');
                o = window[d[0]] = window[d[0]] || {};
                array.forEach(d.slice(1), function (v2) {
                    o = o[v2] = o[v2] || {};
                });
            });
            return o;
        },

        _createDialog: function (opts) {
            var deferred = new Deferred(),
                signal = null,
                signals = [];

            var dialog = new ConfirmDialog(opts);
            dialog.startup();
            domClass.add(dialog.okButton.domNode, 'cmvOKButton');
            domClass.add(dialog.cancelButton.domNode, 'cmvCancelButton');

            function destroyDialog () {
                array.forEach(signals, function (sig) {
                    sig.remove();
                });
            }

            signal = aspect.after(dialog, 'onExecute', lang.hitch(this, function () {
                destroyDialog();
                deferred.resolve(this.okMessage);
            }));
            signals.push(signal);

            signal = aspect.after(dialog, 'onCancel', lang.hitch(this, function () {
                destroyDialog();
                deferred.resolve(this.cancelMessage);
            }));
            signals.push(signal);

            dialog.show();

            signal = aspect.after(dialog, 'onHide', function () {
                signal.remove();
                dialog.destroyRecursive();
            });

            return deferred;
        }
    });
});
