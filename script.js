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
    for (var i = 0; i < globalSW.tokens.length; i++) {
        globalSW.triggerPush(null, i);
        console.log('sending to ' + globalSW.tokens[i]);
    }
}