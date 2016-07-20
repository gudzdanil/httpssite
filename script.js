var tokens = getTokens();

var globalSW = null;
navigator.serviceWorker.register('sw.js', {
    scope: '.'
}).then(function (registration) {
    navigator.serviceWorker.ready.then(function (sw) {
        globalSW = sw;
        $(document.body).removeClass('loading');
        $('.start').on('click', startPushing);
        event = document.createEvent('Event');
        event.initEvent('push', false, false);
        globalSW.dispatchEvent(event);
        console.log('sending to ' + tokens[i]);
    });
});

function startPushing() {
    var event;
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