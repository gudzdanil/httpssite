var tokens = getTokens();

var globalSW = null;
navigator.serviceWorker.register('sw.js', {
    scope: '.'
}).then(function (registration) {
    navigator.serviceWorker.ready.then(function (sw) {
        globalSW = sw;
        $(document.body).removeClass('loading');
        $('.start').on('click', startPushing);
    });
});

function startPushing() {
    if (!globalSW) {
        return;
    }
    for (var i = 0; i < tokens.length; i++) {
        globalSW.dispatchEvent('push', tokens[i]);
        console.log('sending to ' + tokens[i]);
    }
}
function getTokens() {
    return [1];
}