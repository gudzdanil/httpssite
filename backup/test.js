var input = [
    // ['logworker', '128.68.5.115 - - [21/Jul/2016:13:33:53 +0300] "POST /api/sites/logworkerrors/?app_key=e23956b7059de5c4df40e827af026030&token=eEyg72OlVCw:APA91bGdf9lj7xjiJTgp3fQo0Qt94PRb82UK1_RXGW-STkFeGLQgXaLfCaiRnbsHNaR8SEHxLXezboPrh-KMyITcOhDo-sNxDV6ZJi2_v75o6SOHdzaNcWjiet2M3Vtt56Ac7U3UbRB4&time=1469097234&version=1.0.2 HTTP/1.1" 405 338 "https://fithacker.jeapie.com/push-worker.js" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"'],
    // ['message', '52.28.58.77 - - [21/Jul/2016:12:54:25 +0300] "GET /api/v2/web/message?app_key=599045d9d8871589ea38f5587bc367de&token=ftGFPFh0P2w:APA91bGLZ_rnp0FudMKHxkRh3P8gSGTr_cGhPHGJAOPSnaZQGWnZMAhKhR6IjuaH_n0soKS5eSA_hhkMzvURrsWDDdarCZnso37XcmV2S4_B8bpMCbqCIpXeT6v7jqRYEhBgowa36eLI HTTP/1.1" 200 981 "https://vlast.kz/push-worker.js" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"'],
    // ['browser', '52.28.58.77 - - [21/Jul/2016:15:12:08 +0300] "GET /api/v2/web/browser?app_key=76d44fccbbbc0fd8577f58dc75042bf3&data={%22type%22:%22open%22,%22device_id%22:%22APA91bH6IszMtRSKMAZvferWcfcXTpDQsbas43kuAoDQGlOipn5mZQw9ZxnDXrGHR9vj-rT_Kg5kSIACbZo-GLRju8TCK_DDEBvzFaioXonLw7eLzmrXvLA-MrAlXGFCLbOTljAPLHS73PtTcRkQ3p4a0Y_00o8a7S5it-_Astgf-HuQInTrwuY%22,%22value%22:%221540448010967711744%22,%22time%22:1469103136} HTTP/1.1" 200 9 "https://www.ipay.ua/push-worker.js" "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36"'],
    ['receive', '91.221.174.37 - - [21/Jul/2016:15:15:33 +0300] "GET /api/sites/receive/1540459968759595008 HTTP/1.1" 200 45 "https://fithacker.gravitec.net/push-worker.js" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 YaBrowser/16.6.1.30165 Yowser/2.5 Safari/537.36"']
    // ['read', '89.78.141.207 - - [21/Jul/2016:15:15:56 +0300] "GET /api/sites/1540368964014571520/read HTTP/1.1" 200 44 "https://busfor.ua/push-worker.js" "Mozilla/5.0 (Linux; Android 4.2.2; Fly IQ4405_Quad Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.89 Mobile Safari/537.36"']
];
var regs = [
    ['id', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "(?:[A-Za-z]+) (?:\/api\/sites\/(?:(\d+)\/read|receive\/(\d+)))/],
    ['ip', /^((?:[\d]+\.){3}[\d]+)/],
    ['date', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(.*)/],
    ['method', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "([A-Za-z]+)/],
    ['api', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "(?:[A-Za-z]+) ((?:\/[^r?][a-z0-9]+)+\/?(?:(?:read|receive)(?:\/\d+)?)?)/],
    ['apiname', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "(?:[A-Za-z]+) (?:(?:\/[^r?][a-z0-9]+)+\/(?:(read|receive)(?:\/\d+)?)?)/],
    ['query', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "(?:[A-Za-z]+) (?:(?:\/[^r?][a-z0-9]+)+\/(?:(?:read|receive)(?:\/\d+)?)?)\/?(\?.*)/],
    ['status', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "(?:[A-Za-z]+) (?:(?:\/[^r?][a-z0-9]+)+\/(?:(?:read|receive)(?:\/\d+)?)?)\/?(?:\?(?:[^&]+&)+(?:[^\s]+))?\s+[^"]+"\s+(\d+)\s/],
    ['referrer', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "(?:[A-Za-z]+) (?:(?:\/[^r?][a-z0-9]+)+\/(?:(?:read|receive)(?:\/\d+)?)?)\/?(?:\?(?:[^&]+&)+(?:[^\s]+))?\s+[^"]+"\s+\d+\s[^"]+"([^"]+)"/],
    ['useragent', /^(?:(?:[\d]+\.){3}[\d]+) - - \[(?:.*)\] "(?:[A-Za-z]+) (?:(?:\/[^r?][a-z0-9]+)+\/(?:(?:read|receive)(?:\/\d+)?)?)\/?(?:\?(?:[^&]+&)+(?:[^\s]+))?\s+[^"]+"\s+\d+\s[^"]+"[^"]+"[^"]+"([^"]+)"/]
];
var res;
for(var i = 0 ; i < input.length; i++) {
    console.log();
    console.log(input[i][0]);
    for(var j = 0 ; j < regs.length; j++) {
        res = regs[j][1].exec(input[i][1]);
        console.log(regs[j][0], res && res.slice(1));
    }
}