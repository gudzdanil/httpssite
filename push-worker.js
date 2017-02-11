var host_url = "https://{{host_url}}/",
    app_key = "{{app_key}}",
api_url = "https://{{api_url}}/",
loadScript = false,
    version = '01.12.16',
    functions = {
        'install': onInstallFunc,
        'activate': onActivateFunc,
        'push': onPushFunc,
        'pushclick': onPushClickFunc
    };

self.addEventListener('install', installDefault);

self.addEventListener('activate', activateDefault);

self.addEventListener('push', pushDefault);

self.addEventListener('notificationclick', notificationclickDefault);

function pushDefault (event) {
    if(typeof push == 'undefined') loadBase();
    if(push)  return push(event);
    sendMessage("tracing SW Push", "Begin Push Event", true);
    var promise = functions.push.call(self, event);
    event.waitUntil(promise.then(function (promiseObjects) {
        return Promise.all(promiseObjects.map(function (promiseObj) {
            return promiseObj.close;
        }));
    }));
    return promise.then(function (promiseObjects) {
        return promiseObjects[0].show;
    });
}

function notificationclickDefault(event) {
    if(typeof notificationclick == 'undefined') loadBase();
    if(notificationclick)  return notificationclick(event);
    return event.waitUntil(Promise.all(functions.pushclick(event)));
}

function activateDefault(event) {
    if(typeof activate == 'undefined') loadBase();
    if(activate)  return activate(event);
    sendMessage("Trace worker", 'activate', true);
    event.waitUntil(functions.activate(event));
}

function installDefault (event) {
    if(typeof install == 'undefined') loadBase();
    if(install)  return install(event);
    sendMessage("Trace worker", 'install', true);
    event.waitUntil(functions.install(event));
}

function wait(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function loadBase() {
    try{
        return importScripts(host_url + 'push/shim/base.js?token='+new Date().getTime())
    }catch (e){
        sendMessage("Error get file from server", e, false);
    }}

function loadShim(shim) {
    importScripts(host_url + 'push/shim/helper.js?token='+new Date().getTime())
    return new Promise(function (resolve) {
        importScripts(host_url + 'push/shim/' + shim + '.js?token='+new Date().getTime());
    });
}

function onInstallFunc(event) {
    return skipWaiting();
}

function onActivateFunc(event) {
    return clients.claim();
}

function onPushFunc(event) {
    return this.registration.pushManager.getSubscription().then(function (subscription) {
        sendMessage('tracing SW Push with subscription', 'Begin Push Event', true, subscription && (subscription.subscriptionId || subscription.endpoint));
        var regID;
        try {
            regID = prepareId(subscription).gid;
        }
        catch (e) {
            sendMessage("Error parsing gid", e, false, subscription);
            return onErrorMessage();
        }
        var dataJson =  event.data && event.data.length>0 && event.data.json()
        if (dataJson) {
            return showNotifications([dataJson], regID);
        }
        var fetchItteration = 0,
            countOfNeedItteration=1;
        var serverResponse = {};
        function fetchDataFromServer(){
            fetchItteration++;
            return fetch(api_url + "api/sites/lastmessage/?regID=" + encodeURIComponent(regID) + "&app_key=" + app_key + "&version=" + (version || 1))
                .then(function (response) {
                    serverResponse =response;
                    if (response.status < 200 || response.status >= 300) {
                        if (logging) console.log('Looks like there was a problem. Status Code: ' + response.status);
                        sendMessage("Last message fetching error", {
                            errorCode: response.status,
                            errorMessage: response.statusText
                        }, false, regID);
                        return onErrorMessage();
                    }
                    return response.json().then(function (jsons) {
                        if (!jsons || (jsons instanceof Array && jsons.length == 0)) {
                            sendMessage("Last message response object error", 'The API returned an error.', false, regID);
                            return onErrorMessage();
                        }
                        return Promise.resolve(showNotifications(jsons, regID));
                    }).catch(function (err) {
                        sendMessage("Error parsing last message response json", err, false, regID);
                        return onErrorMessage();
                    });
                })
                .catch(function (err) {
                    if(fetchItteration>countOfNeedItteration){
                        sendMessage("Last message fetching request error", serverResponse, false, regID);
                        return onErrorMessage();
                    }else{
                        return wait(500).then(function(){
                            return fetchDataFromServer();
                        });
                    }
                });
        }
        return fetchDataFromServer();

    }).catch(function (err) {
        sendMessage("Error during getSubscription()", err, false);
        return onErrorMessage();
    });
}

function onErrorMessage() {
    var title = 'Service notification';
    var message = 'Your subscription has been updated. Thank you for staying with us!';
    var notificationTag = 'notification-error';
    var promise = {};
    promise.show = promise.close = self.registration.showNotification(title, {
        body: message,
        tag: notificationTag
    });
    return [promise];
}

function onPushClickFunc(event) {
    var notification = event.notification;
    var data = getNotificationData(notification) || {};
    var url = decodeURI(data.url || data.redirectUrl);
    var messageid = data.messageid || data.pushId;
    var buttonData;
    var promiseAction, promiseRequest;

    sendMessage('Tracing push click data', {notificationData: data, messageid: messageid, url: url}, true);

    if (event.action) {
        buttonData = data.buttons[event.action];
        if (buttonData.url) {
            promiseAction = clientActions(decodeURI(buttonData.url), buttonData.action);
        }
        if (buttonData.request) {
            promiseRequest = fetch(decodeURI(buttonData.request));
        }
    }
    else if (url) {
        promiseAction = clientActions(url, data.action);
        promiseRequest = fetch(api_url + "api/sites/" + messageid + "/read?version=" + (version || 1));
    }
    promiseRequest.catch(function (err) {
        sendMessage("Error fetching read", err, false);
    });

    notification.close();
    return [promiseAction || Promise.resolve(), promiseRequest || Promise.resolve()];
}

function showNotifications(jsons, regID) {
    var notif;
    try {
        sendMessage("Trace worker", 'showNotifications executed', true, regID);
        var i, nots = [];
        if (jsons instanceof Array) {
            for (i = 0; i < jsons.length; i++) {
                fetch(api_url + "api/sites/receive/" + jsons[i].id + "?version=" + (version || 1)).catch(function (err) {
                    sendMessage("Error fetching receive", err, false, regID);
                });
            }
            for (i = 0; i < jsons.length; i++) {
                sendMessage('displaying push', 'index: ' + i + ', id: ' + jsons[i].id, true, regID);
                nots.push(showNotification(jsons[i], regID));
                sendMessage('displayed push', 'index: ' + i + ', id: ' + jsons[i].id, true, regID);
            }
            return nots;
        }
        fetch(api_url + "api/sites/receive/" + jsons.id + "?version=" + (version || 1)).catch(function (err) {
            sendMessage("Error fetching receive", err, false, regID);
        });
        notif = showNotification(jsons, regID);
    }
    catch (e) {
        sendMessage("Error iterating over messages", e, false, regID);
    }
    return [notif];
}

function showNotification(json, regID) {
    sendMessage("Trace worker", 'showNotification executed', true, regID);
    var notifData = {};
    var notifOptions = {};
    var displayDuration = json.duration;
    var notifId = json.id;

    notifData.messageid = json.id;
    notifData.url = encodeURI(json.redirect);
    notifData.action = json.action;
    notifData.buttons = generateButtonsData(json.buttons);

    notifOptions.body = json.tx;
    notifOptions.icon = (json.icon || host_url + 'img/icons/Icon-Message.png') + '?' + generateQueryString(notifData);
    notifOptions.vibrate = json.vibrate || [];
    notifOptions.direction = json.direction || 'auto';
    notifOptions.actions = generateButtons(json.buttons);
    notifOptions.data = notifData;
    notifOptions.requireInteraction = true;

    var promiseObj = {};
    promiseObj.show = self.registration.showNotification(json.tl || "Title", notifOptions);
    promiseObj.close = displayDuration ? promiseObj.show.then(function () {
            return wait(displayDuration * 1000).then(function(){
                closeNotifications(notifId);
            });
        }) : promiseObj.show;
    return promiseObj;
}

function generateQueryString(data) {
    var params = [];
    for (var i in data) {
        params.push(i + '=' + (typeof data[i] === 'string' ? data[i] : JSON.stringify(data[i])));
    }
    return params.join('&');
}

function parseQueryString(str) {
    var data = {};
    var params = str.split('&');
    var param;
    for (var i in params) {
        param = params[i].split('=');
        data[param[0]] = param[1];
    }
    return data;
}

function closeNotifications(id) {
    self.registration.getNotifications().then(function (notifications) {
        var data;
        for (var i = 0; i < notifications.length; ++i) {
            if (id) {
                data = getNotificationData(notifications[i]);
                if (id == data.messageid) {
                    notifications[i].close();
                    return;
                }
            }
            else {
                notifications[i].close();
            }
        }
    });
}

function getNotificationData(notification) {
    return notification.data || parseQueryString((notification.icon || notification.iconUrl).split('?')[1]);
}

function generateButtonsData(buttons) {
    buttons = buttons || [];
    var button;
    var data = {};
    for (var i = 0, l = buttons.length; i < l; i++) {
        button = buttons[i];
        data[button.type + i] = {
            url: encodeURI(button.url),
            request: encodeURI(button.request),
            action: button.action
        };
    }
    return data;
}

function generateButtons(buttons) {
    buttons = buttons || [];
    var button;
    var actions = [];
    for (var i = 0, l = buttons.length; i < l; i++) {
        button = buttons[i];
        actions.push({
            action: button.type + i,
            title: button.title,
            icon: button.icon
        });
    }
    return actions;
}

function prepareId(subscription, additions) {
    additions = additions || {};
    var i, browser;
    var subscriptionId = (subscription && 'subscriptionId' in subscription) ? subscription.subscriptionId : subscription && subscription.endpoint;
    var browsers = [
        {
            name: 'CHROME',
            prefix: 'https://android.googleapis.com/gcm/send/'
        },
        {
            name: 'FIREFOX',
            prefix: 'https://updates.push.services.mozilla.com/'
        }
    ];
    for (i = 0; i < browsers.length; i++) {
        browser = browsers[i];
        if (~subscriptionId.indexOf(browsers[i].prefix)) {
            additions.gid = subscriptionId.split(browsers[i].prefix)[1];
            additions.browser = browsers[i].name;
        }
    }
    if(!additions.gid) {
        var subId = subscriptionId && subscriptionId.split && subscriptionId.split('/');
        if(subId && subId.length) {
            subId = subId.pop();
        }
        additions.gid = subId;
    }
    return additions;
}

function sendMessage(subject, error, isTrace, token) {
    if(isTrace){
        return Promise.resolve();
    }
    var promise = Promise.resolve(typeof token == 'string' ? token : JSON.stringify(token));
    if (!token) {
        promise = self.registration.pushManager.getSubscription().then(function (subscription) {
            var prepared = prepareId(subscription);
            return Promise.resolve(prepared && prepared.gid);
        }).catch(function (err) {
            return Promise.resolve(null);
        });
    }
    if (typeof error != 'string')
        error = JSON.stringify(error.message ? error.message : error);
    error = (subject || "No subject") + ": " + error;

    return promise.then(function (token) {
        var errorUrl = api_url + 'api/sites/' + (isTrace ? 'logtraceworker' : 'logworkerrors') + '/?app_key=' + app_key + '&token=' + token + '&time=' + Math.floor(Date.now() / 1000) + "&version=" + (version || 1);
        return fetch(errorUrl, {
            method: 'post',
            body: error
        });
    });
}

function clientActions(url, action) {
    if (url) {
        if (action === 'open' && clients.openWindow) {
            return self.clients.openWindow(url);
        }
        return self.clients.matchAll({
            type: "window"
        })
            .then(function (windowClients) {
                var i, client, promise;
                for (i = 0; i < windowClients.length; i++) {
                    client = windowClients[i];
                    if ('focus' in client && client.url.indexOf(url) === 0) {
                        promise = client.focus();
                        if (action === 'focus') {
                            return promise;
                        }
                    }
                }
                if (!action) {
                    return self.clients.openWindow(url);
                }
            });
    }
    return Promise.reject();
}