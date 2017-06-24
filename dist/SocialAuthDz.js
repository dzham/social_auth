(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        exports = module.exports = SocialAuthDz;
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.SocialAuthDz = factory();
    }
}(this, function() {
    'use strict';

    var SocialAuthDz = function () {

        this.providers = {

            vkontakte: {
                name: "Вконтакте",
                url: "https://oauth.vk.com/authorize",
                clientId: null,
                redirectUri: window.location.origin,
                scope: 'email',
                responseType: 'code',
                popup: {
                    height: 300,
                    width: 700
                }
            },
            yandex: {
                name: "Яндекс",
                url: "https://oauth.yandex.ru/authorize",
                clientId: null,
                redirectUri: window.location.origin,
                scope: null,
                responseType: 'code',
                popup: {
                    height: 500,
                    width: 700
                }
            },
        };

        this.updateOptions = function (options) {
            if (!options) {
                return;
            }

            for (var index in options) {
                //проверяем есть ли такой провайдер
                if (this.providers.hasOwnProperty(index)) {
                    for (var index_opt in options[index]) {
                        if (this.providers[index].hasOwnProperty(index_opt)) {
                            this.providers[index][index_opt] = options[index][index_opt];
                        }
                    }
                }
            }
        };

        this.generateUrl = function (provider) {
            var url = provider.url;
            var arrParams = [];

            if (provider.clientId) {
                arrParams.push('client_id=' + provider.clientId);
            }
            if (provider.redirectUri) {
                arrParams.push('redirect_uri=' + provider.redirectUri);
            }
            if (provider.scope) {
                arrParams.push('scope=' + provider.scope);
            }
            if (provider.responseType) {
                arrParams.push('response_type=' + provider.responseType);
            }

            if (arrParams.length) {
                url += '?' + arrParams.join('&');
            }

            return url;
        };

        this.auth = function (provider, callback) {

            //проверяем провайдера и настройки
            if (!this.providers.hasOwnProperty(provider)) {
                this.error('Несуществующий провайдер');
                return;
            }

            var provider = this.providers[provider];

            if (!provider.clientId) {
                this.error('Не указан clientId');
                return;
            }

            //открываем окно
            var authPopup = window.open(this.generateUrl(provider), provider.name, "height=" + provider.popup.height + ", width=" + provider.popup.width + "");
            //начинаем следить
            var popupInterval = setInterval(function () {
                if (!authPopup || authPopup.closed || authPopup.closed === undefined) {
                    clearInterval(popupInterval);
                }
                try{
                    authPopup.location.hasOwnProperty('origin')
                }catch (e){
                    return;
                }

                if (authPopup.location.hasOwnProperty('origin') && window.location.origin == authPopup.location.origin) {
                    clearInterval(popupInterval);
                    
                    //извлекаем USER_ID
                    var reg = /code\=([\w]*)/;
                    var code = reg.exec(authPopup.location.search);
                    if(!code){
                        authPopup.close();
                        return;
                    }
                    code = code[1];
                    if (code) {
                        callback(code);
                    }

                    authPopup.close();
                }
            }, 30)

        };

        this.error = function (message) {
            throw new Error('[SocialAuthDz]: ' + message);
        }

    };

    return SocialAuthDz;
}));