var tokens = getTokens();
var event;
var globalSW = null;
navigator.serviceWorker.register('sw.js').then(function (registration) {
    navigator.serviceWorker.ready.then(function (sw) {
        globalSW = sw;
        var messageChannel = new MessageChannel();

        $(document.body).removeClass('loading');
        $('.start').on('click', function (){postMessage(123)});
        // event = document.createEvent('Event');
        // event.initEvent('push', false, false);
        // navigator.serviceWorker.controller.postMessage('message', [messageChannel]);//.dispatchEvent(event);
        console.log('sending to ' + 1);
    });
});

function postMessage(message) {
    return new Promise(function(resolve, reject) {
        var messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function(event) {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data);
            }
        };

        navigator.serviceWorker.controller.postMessage(message,
            [messageChannel.port2]);
    });
}

function startPushing() {
    if (!globalSW) {
        return;
    }
    for (var i = 0; i < tokens.length; i++) {
        event = document.createEvent('Event');
        event.initEvent('push', false, false);
        globalSW.dispatchEvent(event);
        console.log('sending to ' + tokens[i]);
    }
}
function getTokens() {
    return [1];
}