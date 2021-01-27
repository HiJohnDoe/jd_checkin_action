/*
新店福利
Author: 799953468 https://github.com/799953468
更新时间：2020-11-05 07:45
[task_local]
# 京东抽奖机
2 0 * * * ./JD/jd_new_shop.js, tag=新店福利, img-url=https://raw.githubusercontent.com/Orz-3/task/master/jd.png, enabled=true
*/

const $ = new Env('新店福利');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [],
    cookie = '',
    sharecodes = [
        'P04z54XCjVXmIaW5m9cZ2esjHVDlzxvdLVQQM0', //账号 1
        'P04z54XCjVXmIaW5m9cZ2esjHVDlzxvdLVQQM0', //账号 2
    ];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    });

    // github actions 用户的好友互助码 Secret 变量: NEWSHOP_SHARECODES (格式参考农村、萌宠)
    const $ENV_SHARECODES = process.env.NEWSHOP_SHARECODES;
    if ($ENV_SHARECODES) {
        $ENV_SHARECODES.trim()
            .split(/([\n\r]|\\n|\\r)+|&/) //用 & 代替换行分隔多账号，可留空。
            .map(str => (str || '').trim())
            .forEach((str, i) => {
                if (!sharecodes[i])
                    sharecodes[i] = '';
                sharecodes[i] = str + '@' + sharecodes[i];
            });
    }
} else {
    cookiesArr.push($.getdata('CookieJD'));
    cookiesArr.push($.getdata('CookieJD2'));
}

sharecodes = sharecodes.map(str => {
    return [...new Set(str.trim().split('@').filter(Boolean))];
});

let message = '',
    UserName = '',
    subTitle = '',
    beanCount = 0
const JD_API_HOST = 'https://api.m.jd.com/client.action';
!(async() => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
            console.log(`\n===============开始【京东账号${$.UserName}】==================\n`);
            $.errorMsg = '';
            $.index = i + 1;
            await getHomeData();
            console.log('互助码: ' + $.homeData.data.result.taskVos[0].assistTaskDetailVo.taskToken);
            await shop();
            await product();
            await meet();
            await share();
            await lottery();
            await showMsg();
        }
    }
})()
.catch((e) => {
    $.log('', `❌ ${$.UserName}, 失败! 原因: ${e}!`, '')
})

.finally(() => {
    $.done();
})

function showMsg() {
    if ($.isLogin) {
        $.log(`\n${message}\n`);
        jdNotify = $.getdata('jdnewshop') ? $.getdata('jdnewshop') : jdNotify;
        if (!jdNotify || jdNotify === 'false') {
            $.msg($.name, subTitle, `【京东账号${$.index}】${UserName}\n` + message);
        }
    }
}

// 获取任务信息
async function getHomeData() {
    const functionId = `interact_template_getHomeData`;
    const body = `"appId":"1EFRQxA"`;
    $.homeData = await request(functionId, body);
}

// 关注店铺
async function shop() {
    console.log('开始关注店铺');
    if ($.homeData.data.result.taskVos[1].times === $.homeData.data.result.taskVos[1].maxTimes) {
        console.log('任务已经完成');
    } else {
        for (i = 0; i < $.homeData.data.result.taskVos[1].followShopVo.length; i++) {
            await getHomeData();
            if ($.homeData.data.result.taskVos[1].times === $.homeData.data.result.taskVos[1].maxTimes) {
                break;
            }
            let functionId = `followShop`;
            const shopId = $.homeData.data.result.taskVos[1].followShopVo[i].shopId;
            const body = `"follow":"true",'shopId':'${shopId}'`
            $.followInfo = await request(functionId, body);
            if ($.followInfo.code === '0') {
                functionId = 'harmony_collectScore';
                const taskToken = $.homeData.data.result.taskVos[1].followShopVo[i].taskToken;
                const body = `'appId':'1EFRQxA','taskToken':'${taskToken}'`;
                $.finishfollow = await request(functionId, body);
                await getHomeData();
                console.log('关注' + $.homeData.data.result.taskVos[1].followShopVo[i].shopName + ' ' + $.homeData.data.result.taskVos[1].times + '/' + $.homeData.data.result.taskVos[1].maxTimes);
                await sleep(2000);
            }
        }
    }
}

// 浏览商品
async function product() {
    console.log('开始浏览商品');
    if ($.homeData.data.result.taskVos[2].times === $.homeData.data.result.taskVos[2].maxTimes) {
        console.log('任务已经完成');
    } else {
        for (i = 0; i < $.homeData.data.result.taskVos[2].productInfoVos.length; i++) {
            await getHomeData();
            if ($.homeData.data.result.taskVos[2].times === $.homeData.data.result.taskVos[2].maxTimes) {
                break;
            }
            const functionId = `harmony_collectScore`;
            const taskToken = $.homeData.data.result.taskVos[2].productInfoVos[i].taskToken;
            const body = `'appId':'1EFRQxA','taskToken':'${taskToken}'`
            $.productInfo = await request(functionId, body);
            if ($.productInfo.code === 0) {
                console.log($.productInfo.data.bizMsg);
            }
            await sleep(2000);
        }
    }
}

// 浏览会场
async function meet() {
    console.log('开始逛会场');
    const functionId = `harmony_collectScore`;
    const taskToken = $.homeData.data.result.taskVos[3].shoppingActivityVos[0].taskToken;
    const body = `'appId':'1EFRQxA','taskToken':'${taskToken}'`;
    $.meetInfo = await request(functionId, body);
    if ($.meetInfo.code === 0) {
        console.log($.meetInfo.data.bizMsg);
    }
    await sleep(2000);
}

// 互助
async function share() {
    const shareCode = sharecodes[$.index - 1];
    for (i = 0; i < shareCode.length; i++) {
        if (shareCode[i] === $.homeData.data.result.taskVos[0].assistTaskDetailVo.taskToken) {
            console.log('跳过自己的助力码');
        } else {
            console.log('开始助力第' + (i + 1) + '个好友');
            const functionId = 'interact_template_getHomeData';
            const taskToken = shareCode[i];
            const body = `'appId':'1EFRQxA','taskToken':'${taskToken}'`;
            $.shareInfo = await request(functionId, body);
            console.log($.shareInfo.data.bizMsg);
            await sleep(1000);
        }
    }
}

// 抽奖
async function lottery() {
    console.log('开始抽奖');
    await getHomeData();
    const functionId = 'interact_template_getLotteryResult';
    const body = `'appId':'1EFRQxA'`;
    while ($.homeData.data.result.userInfo.userScore > 500) {
        $.lottery = await request(functionId, body);
        if ($.lottery.data.result.userAwardsCacheDto.type === 2) {
            console.log('获得京豆：' + $.lottery.data.result.userAwardsCacheDto.jBeanAwardVo.quantity + '个');
            beanCount = benCount + parseInt($.lottery.data.result.userAwardsCacheDto.jBeanAwardVo.quantity)
        } else if ($.lottery.data.result.userAwardsCacheDto.type === 1) {
            console.log('获得优惠券: 满' + $.lottery.data.result.userAwardsCacheDto.couponVo.usageThreshold + '减' + $.lottery.data.result.userAwardsCacheDto.couponVo.quota);
        }
        await getHomeData();
        await sleep(1000);
    }
    console.log('金币不足无法抽奖');
    $.msg('新店福利', subTitle, '\n 获得京豆' + beanCount + '个,优惠券前往个人中心查看')
}

function sleep(s) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, s);
    })
}

function request(functionId, body) {
    return new Promise(resolve => {
        $.post(taskPostUrl(functionId, body), (err, resp, data) => {
            try {
                if (err) {
                    console.log('\n京东泡泡大战: API查询请求失败 ‼️‼️')
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function taskPostUrl(functionId, body) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}`,
        headers: {
            'Origin': `https://h5.m.jd.com`,
            'Cookie': cookie,
            'Connection': `keep-alive`,
            'Accept': `application/json`,
            'Referer': `https://h5.m.jd.com/babelDiy/Zeus/3KmxuozXP5PfANN3KwuE1irq11qZ/index.html`,
            'Host': `api.m.jd.com`,
            'Accept-Encoding': `gzip, deflate, br`,
            'Accept-Language': `zh-cn`,
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : "jdapp;iPhone;9.2.2;14.2;") : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;")
        },
        body: `body={${body}}&client=wh5&clientVersion=1.0.0`
    }
}

// prettier-ignore
function Env(t, e) {
    class s {
        constructor(t) { this.env = t }
        send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, o) => { t ? i(t) : e(s) }) }) }
        get(t) { return this.send.call(this.env, t) }
        post(t) { return this.send.call(this.env, t, "POST") }
    }
    return new class {
        constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) }
        isNode() { return "undefined" != typeof module && !!module.exports }
        isQuanX() { return "undefined" != typeof $task }
        isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon }
        isLoon() { return "undefined" != typeof $loon }
        toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } }
        toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } }
        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try { s = JSON.parse(this.getdata(t)) } catch {}
            return s
        }
        setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } }
        getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) }
        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                o = o ? 1 * o : 20, o = e && e.timeout ? e.timeout : o;
                const [r, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": r, Accept: "*/*" } };
                this.post(a, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }
        loaddata() {
            if (!this.isNode()) return {}; {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    o = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(e, o) : this.fs.writeFileSync(t, o)
            }
        }
        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let o = t;
            for (const t of i)
                if (o = Object(o)[t], void 0 === o) return s;
            return o
        }
        lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), o = s ? this.getval(s) : "";
                if (o) try {
                    const t = JSON.parse(o);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) { e = "" }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, o] = /^@(.*?)\.(.*?)$/.exec(e), r = this.getval(i), h = i ? "null" === r ? null : r || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, o, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const r = {};
                    this.lodash_set(r, o, t), s = this.setval(JSON.stringify(r), i)
                }
            } else s = this.setval(t, e);
            return s
        }
        getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null }
        setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null }
        initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) }
        get(t, e = (() => {})) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }) : this.isQuanX() ? $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: o, body: r } = t;
                e(null, { status: s, statusCode: i, headers: o, body: r }, r)
            }, t => e(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                    this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                } catch (t) { this.logErr(t) }
            }).then(t => {
                const { statusCode: s, statusCode: i, headers: o, body: r } = t;
                e(null, { status: s, statusCode: i, headers: o, body: r }, r)
            }, t => e(t)))
        }
        post(t, e = (() => {})) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) $httpClient.post(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) });
            else if (this.isQuanX()) t.method = "POST", $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: o, body: r } = t;
                e(null, { status: s, statusCode: i, headers: o, body: r }, r)
            }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const { url: s, ...i } = t;
                this.got.post(s, i).then(t => {
                    const { statusCode: s, statusCode: i, headers: o, body: r } = t;
                    e(null, { status: s, statusCode: i, headers: o, body: r }, r)
                }, t => e(t))
            }
        }
        time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t }
        msg(e = t, s = "", i = "", o) {
            const r = t => {
                if (!t || !this.isLoon() && this.isSurge()) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return { openUrl: e, mediaUrl: s }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return { "open-url": e, "media-url": s }
                    }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, r(o)) : this.isQuanX() && $notify(e, s, i, r(o)));
            let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
            h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h)
        }
        log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) }
        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t)
        }
        wait(t) { return new Promise(e => setTimeout(e, t)) }
        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
