define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',

    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-construct',
    'dojo/cookie',
    'module',

    './Introduction/intro.min',

    'xstyle/css!./Introduction/css/introjs.min.css',
    'xstyle/css!./Introduction/css/Introduction.css'

], function (
    declare,
    _WidgetBase,

    lang,
    on,
    domConstruct,
    cookie,
    module,

    IntroJS
) {

    return declare([_WidgetBase], {

        html: null,
        domTarget: null,

        // Documentation https://introjs.com/docs/themes/list
        introTheme: null,

        // Documentation: https://introjs.com/docs/intro/options/
        introOptions: {
            steps: [
                {
                    intro: 'Hello world!'
                }
            ]
        },

        showAtStartup: true,
        showDelay: 1000,

        cookieKey: 'cmvIntroduction',
        cookieOptions: {
            expires: new Date(Date.now() + (360000 * 24 * 30)) // show every 30 days
        },

        postCreate: function () {
            this.introJs = IntroJS;

            if (this.introTheme) {
                var path = module.uri.substring(0, module.uri.lastIndexOf('.'));
                require(['xstyle/css!' + path + '/css/introjs-' + this.introTheme + '.css']);
            }

            if (this.html && this.domTarget) {
                var btn = domConstruct.place(this.html, this.domTarget);
                on(btn, 'click', lang.hitch(this, 'show'));

                if (this.showAtStartup) {
                    var introCookie = cookie(this.cookieKey);
                    if (!introCookie) {
                        // pause to allow some slower widgets to get loaded
                        window.setTimeout(lang.hitch(this, 'show'), this.showDelay);
                    }

                }
            } else {
                this.show();
            }
        },

        show: function () {
            this.intro = this.introJs();
            this.intro.setOptions(this.introOptions);
            this.intro.start();

            // The expiration date X days in the future
            cookie(this.cookieKey, true, this.cookieOptions);
        }

    });
});
