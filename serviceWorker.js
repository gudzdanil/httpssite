var host_url = "https://gravitec.gravitec.net:7781/";
var app_key = "88bdffd3dfdbd0e60e4b3e4b6df43f62";

self.addEventListener('install', function (event) {
    event.waitUntil(skipWaiting());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(clients.claim());
});


self.addEventListener('push', function (event) {
    if(event.data) {
        console.log(event.data);
    }
    return event.waitUntil(self.registration.pushManager.getSubscription().then(function (subscription) {
        var regID = prepareId(subscription).gid;

        return fetch(host_url + "/api/sites/lastmessage/?regID=" + encodeURIComponent(regID) + "&app_key=" + app_key)
            .then(function (response) {
                return response.json().then(function (jsons) {
                    var i, nots = [];
                    if (jsons instanceof Array) {
                        for (i = 0; i < jsons.length; i++) {
                            nots.push(showNotification(jsons[i]));
                        }
                        return nots[0];
                    }
                    return showNotification(jsons);
                });
            })
            .catch(function (err) {
                console.error('Unable to retrieve data', err);
                var title = 'Error';
                var message = 'Something wrong happens';
                var notificationTag = 'notification-error';
                return self.registration.showNotification(title, {
                    body: message,
                    tag: notificationTag
                });
            });
    }));
});

self.addEventListener('notificationclick', function (event) {
    var notification = event.notification;
    var data = getNotificationData(notification) || {};
    var url = decodeURI(data.url);
    var buttonData;
    var promiseAction, promiseRequest;

    notification.close();

    if(event.action) {
        buttonData = data.buttons[event.action];
        if(buttonData.url) {
            promiseAction = clientActions(decodeURI(buttonData.url), buttonData.action);
        }
        if(buttonData.request) {
            promiseRequest = fetch(decodeURI(buttonData.request));
        }
    }
    else if ( url) {
        promiseAction = clientActions(url, data.action);
        promiseRequest = fetch(host_url + "/api/sites/" + data.messageid + "/read");
    }

    return event.waitUntil(Promise.all([promiseAction || Promise.resolve(), promiseRequest || Promise.resolve()]));
});

function clientActions(url, action) {
    if(url) {
        if(action === 'open' && clients.openWindow) {
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
                        if(action === 'focus') {
                            return promise;
                        }
                    }
                }
                if(!action) {
                    return self.clients.openWindow(url);
                }
            });
    }
    return Promise.reject();
}

function showNotification(json, isEventData) {
    var notifData = {};
    var notifOptions = {};
    var displayDuration = json.duration;
    var notifId = json.id;

    notifData.messageid = json.id;
    notifData.url = encodeURI(json.url);
    notifData.action = json.action;
    notifData.buttons = generateButtonsData(json.buttons);

    notifOptions.body = json.tx;
    notifOptions.icon = (json.icon || 'http://www.mykitchenshrink.com/wp-content/uploads/2013/11/Icon-Message.png') + '?' + generateQueryString(notifData);
    notifOptions.vibrate = json.vibrate || [];
    notifOptions.direction = json.direction || 'auto';
    notifOptions.actions = generateButtons(json.buttons);
    notifOptions.data = notifData;

    return self.registration.showNotification(json.tl || "Title", notifOptions).then(function () {
        if(displayDuration) {
            setTimeout(function() {closeNotifications(notifId)}, displayDuration*1000);
        }
    });
}

function generateQueryString(data) {
    var params = [];
    for(var i in data) {
        params.push(i + '=' + (typeof data[i] === 'string' ? data[i] : JSON.stringify(data[i])));
    }
    return params.join('&');
}

function parseQueryString(str) {
    var data = {};
    var params = str.split('&');
    var param;
    for(var i in params) {
        param = params[i].split('=');
        data[param[0]] = param[1];
    }
    return data;
}

function closeNotifications(id) {
    self.registration.getNotifications().then(function (notifications) {
        var data;
        for (var i = 0; i < notifications.length; ++i) {
            if(id) {
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
    return notification.data || parseQueryString(notification.iconUrl.split('?')[1]);
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
    for(var i = 0, l = buttons.length ; i < l; i++) {
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
    var subscriptionId = 'subscriptionId' in subscription ? subscription.subscriptionId : subscription.endpoint;
    var browsers = [
        {
            name: 'CHROME',
            prefix: 'https://android.googleapis.com/gcm/send/'
        },
        {
            name: 'FIREFOX',
            prefix: 'https://updates.push.services.mozilla.com/push/'
        }
    ];
    for (i = 0; i < browsers.length; i++) {
        browser = browsers[i];
        if (~subscriptionId.indexOf(browsers[i].prefix)) {
            additions.gid = subscriptionId.split(browsers[i].prefix)[1];
            additions.browser = browsers[i].name;
        }
    }
    additions.gid = additions.gid || subscriptionId;
    return additions;
}
