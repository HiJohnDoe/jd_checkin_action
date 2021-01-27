/**
*
    Name:京喜财富岛
    ADD：京喜App==>>全民赚大钱
    Thanks:
       whyour大佬
       TG：https://t.me/joinchat/O1WgnBbM18YjQQVFQ_D86w
       GitHub：https://github.com/whyour

    Quantumult X:
    [task_local]
    30 23 * * * https://raw.githubusercontent.com/MoPoQAQ/Script/main/Me/jx_cfd.js, tag=京喜财富岛, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jxcfd.png, enabled=true
    Loon:
    [Script]
    cron "30 23 * * *" script-path=https://raw.githubusercontent.com/MoPoQAQ/Script/main/Me/jx_cfd.js,tag=京喜财富岛
    Surge:
    京喜财富岛 = type=cron,cronexp="30 23 * * *",wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/MoPoQAQ/Script/main/Me/jx_cfd.js

    BoxJS订阅
    https://raw.githubusercontent.com/whyour/hundun/master/quanx/whyour.boxjs.json
*
**/

const $ = new Env("京喜财富岛");
const JD_API_HOST = "https://m.jingxi.com/";
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
$.showLog = $.getdata("cfd_showLog")
  ? $.getdata("cfd_showLog") === "true"
  : false;
$.notifyTime = $.getdata("cfd_notifyTime");
$.result = [];
$.cookieArr = [];
$.currentCookie = '';
$.allTask = [];
$.info = {};

!(async () => {
  if (!getCookies()) return;
  for (let i = 0; i < $.cookieArr.length; i++) {
    $.currentCookie = $.cookieArr[i];
    if ($.currentCookie) {
      const userName = decodeURIComponent(
        $.currentCookie.match(/pt_pin=(.+?);/) &&
          $.currentCookie.match(/pt_pin=(.+?);/)[1]
      );
      $.log(`\n开始【京东账号${i + 1}】${userName}`);

      const beginInfo = await getUserInfo();
      await $.wait(500);
      await querySignList();

      await $.wait(500);
      await getMoney();

      await $.wait(500);
      await getTaskList();
      await $.wait(500);
      await browserTask();
      await $.wait(500);
      await treasureHunt();

      const endInfo = await getUserInfo();
      $.result.push(
        `任务前财富值：${beginInfo.ddwMoney} 任务后财富值：${endInfo.ddwMoney}`,
        `获得财富值：${endInfo.ddwMoney - beginInfo.ddwMoney}`
      );
    }
  }
  await showMsg();
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

//暂时不知道需要什么信息。。。。
//{"Card":[],"GoodPrivilege":{"PrizeLevel":[],"ddwPeriodId":0,"ddwPrivilegeId":0,"ddwStopTime":0,"ddwUserMoney":30896,"dwDiscMoney":0,"dwDiscount":0,"dwNeedMoney":0,"dwOriginMoney":0,"dwStatus":1,"dwSurplusTime":0,"strPrizePool":""},"Interactive":{},"RecommendExchange":{"ddwPaperMoney":0,"dwHaveRecommend":0,"dwLvl":0,"strPoolName":"","strPrizeName":"","strPrizePic":""},"RedPack":{"dwCanDraw":0},"SceneList":{"1001":{"AllEmployeeList":{},"EmployeeList":{},"SuperEmployee":{"dwAwardMoney":0,"dwEmployeeNum":0,"dwHasActived":1,"dwMaxEmployeeNum":6,"dwNewEmployeeNum":0},"dwCostMoey":1,"dwEmployeeNum":0,"dwEmployeeSpeed":145,"dwMaxEmployeeNum":12,"dwSceneId":1001,"dwSceneMoney":2600,"strSceneName":"欢乐牧场"}},"XbStatus":{"XBDetail":[{"ddwColdEndTm":0,"dwRemainCnt":3,"strIndex":"small_stone"},{"ddwColdEndTm":0,"dwRemainCnt":3,"strIndex":"tree"},{"ddwColdEndTm":0,"dwRemainCnt":3,"strIndex":"wood"}],"dwXBRemainCnt":9},"ddwExperience":30896,"ddwMoney":30896,"dwAccessGift":3,"dwAccessMoney":1,"dwBoxType":0,"dwCurTime":1606976501,"dwIsAssisted":0,"dwIsBlack":0,"dwIsCloseAppService":0,"dwIsDefaultPin":0,"dwIsHaveBoxInfo":0,"dwIsIncrLevel":0,"dwIsNewUser":0,"dwIsStopProduce":0,"dwLevel":2,"dwNoVaildCard":1,"dwPeriodProduced":2600,"dwProductivity":333,"dwSwitch":1,"dwZcfStatus":3,"goodprivilege":[],"goodprivilegepool":"","iRet":0,"sErrMsg":"success","strHeadPic":"https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKTVpoI8Q6ialgXShZoMFZHIlBPlrPs4y8fX2LFz8cUpNzDjzibfbSRiadKhCCMFiaQp4rSZleVCyNjnQ/132","strMyShareId":"90A15070F26FE5335C0DD5B80BC737B5C0D89A4A3509F9C0E450E23AB72AEA5D","strNickname":"墨*","strPin":"jd_5a3d9cc737f52"}
function getUserInfo() {
  return new Promise((resolve) => {
    $.get(taskUrl("user/QueryUserInfo"), async (err, resp, data) => {
      try {
        //$.log(data);
        const {
          iret,
          SceneList,
          ddwMoney,
          sErrMsg,
          strMyShareId,
          strPin,
        } = JSON.parse(data);
        $.log(`\n获取用户信息：${sErrMsg}\n${$.showLog ? data : ""}`);
        var sceneId = eval("(" + JSON.stringify(SceneList) + ")")["1001"]
          .dwSceneId;
        //$.log();
        $.info = {
          ...$.info,
          sceneId,
          ddwMoney,
          strMyShareId,
          strPin,
        };
        resolve({
          sceneId,
          ddwMoney,
          strMyShareId,
          strPin,
        });
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

//签到列表
function querySignList() {
  return new Promise(async (resolve) => {
    $.get(taskUrl(`task/QuerySignListV2`), async (err, resp, data) => {
      try {
        const { iRet, sData: { Sign = [] } = {}, sErrMsg } = JSON.parse(data);
        $.log(
          `\n签到列表：${sErrMsg}\n${
            $.showLog ? data : ""
          }`
        );
        const nextSign = Sign.filter(x => x.dwStatus === 0)[0];
        if (nextSign && nextSign.ddwMoney) {
          await userSignReward(nextSign.ddwMoney);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

//签到
async function userSignReward(ddwMoney) {
  return new Promise(async (resolve) => {
    $.get(
      taskUrl(
        `task/UserSignRewardV2`,
        `dwReqUserFlag=1&ddwMoney=${ddwMoney}`
      ),
      async (err, resp, data) => {
        try {
          //$.log(data)
          const { iRet, sData, sErrMsg } = JSON.parse(data);
          $.log(
            `\n签到：${sErrMsg}，获得财富 ¥ ${sData.dwMoney || 0}\n${
              $.showLog ? data : ""
            }`
          );
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

//领取财富值
function getMoney() {
  return new Promise(async (resolve) => {
    $.get(
      taskUrl(
        "user/GetMoney",
        `dwSceneId=${$.info.sceneId}&strEmployeeId=undefined&dwSource=1`
      ),
      async (err, resp, data) => {
        try {
          const { iRet, dwMoney, sErrMsg } = JSON.parse(data);
          $.log(
            `\n状态：${sErrMsg} 获取财富值：¥ ${dwMoney || 0}\n${
              $.showLog ? data : ""
            }`
          );
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

//捡地上的奖励
async function treasureHunt() {
  const place = ["tree", "wood", "small_stone"];
  let placeStatus = false;
  for (let i = 0; i < place.length; i++) {
    placeStatus = await doTreasureHunt(place[i]);
    if (placeStatus) {
      break;
    }
    await $.wait(3000);
  }
}

function doTreasureHunt(place) {
  return new Promise(async (resolve) => {
    $.get(
      taskUrl("consume/TreasureHunt", `strIndex=${place}&dwIsShare=0`),
      async (err, resp, data) => {
        try {
          //$.log(data);
          const { iRet, dwExperience, sErrMsg } = JSON.parse(data);
          $.log(
            `\n状态：${sErrMsg} 获取随机奖励：¥ ${dwExperience || 0} \n${
              $.showLog ? data : ""
            }`
          );
          resolve(iRet === 0)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

//成就赚财富
//GET /jxcfd/consume/AchieveInfo?strZone=jxcfd&bizCode=jxcfd&source=jxcfd&dwEnv=7&_cfd_t=1607013109572&ptag=138631.26.55&_stk=_cfd_t%2CbizCode%2CdwEnv%2Cptag%2Csource%2CstrZone&_ste=1&h5st=20201204003149574%3B8183163432738160%3B10009%3Btk01w9f7c1c01a8nSDVybnU2b3lMEYRtFNtXiAo6Z0BJLI7QSOHrsTPHEheibS%2F2cyD6RSFZHwHIWaBNxeHWeZEhzTTh%3B6cfe97b3240fc778a95cd7d357aec39002878211f398a32793387d2677f5d150&_=1607013109576&sceneval=2&g_login_type=1&callback=jsonpCBKM&g_ty=ls HTTP/1.1

//GET /jxcfd/consume/AchieveAward?strZone=jxcfd&bizCode=jxcfd&source=jxcfd&dwEnv=7&_cfd_t=1607013860702&ptag=138631.26.55&strTaskIndex=11&_stk=_cfd_t%2CbizCode%2CdwEnv%2Cptag%2Csource%2CstrTaskIndex%2CstrZone&_ste=1&h5st=20201204004420702%3B8183163432738160%3B10009%3Btk01w9f7c1c01a8nSDVybnU2b3lMEYRtFNtXiAo6Z0BJLI7QSOHrsTPHEheibS%2F2cyD6RSFZHwHIWaBNxeHWeZEhzTTh%3B325fc0d756cd235c1d0efbe0d59ce71b041371165db980365280d6a3edce2a5e&_=1607013860705&sceneval=2&g_login_type=1&callback=jsonpCBKJJJ&g_ty=ls HTTP/1.1

//日常赚财富
function getTaskList() {
  return new Promise(async (resolve) => {
    $.get(taskListUrl("GetUserTaskStatusList"), async (err, resp, data) => {
      try {
        const { ret, data: { userTaskStatusList = [] } = {}, msg } = JSON.parse(
          data
        );
        $.allTask = userTaskStatusList.filter((x) => x.awardStatus !== 1);
        $.log(`\n获取任务列表 ${msg}，总共${$.allTask.length}个任务！\n${
          $.showLog ? data : ""
        }`);
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

//浏览任务 + 做任务 + 领取奖励
function browserTask() {
  return new Promise(async (resolve) => {
    const times = Math.max(...[...$.allTask].map((x) => x.configTargetTimes));
    for (let i = 0; i < $.allTask.length; i++) {
      const task = $.allTask[i];
      $.log(`\n开始第${i + 1}个日常任务：${task.taskName}`);
      const status = [true, true];
      for (let i = 0; i < times; i++) {
        await $.wait(500);
        if (status[0]) {
          //做任务
          status[0] = await doTask(task);
        }
        await $.wait(500);
        if (status[1]) {
          //领取奖励
          status[1] = await awardTask(task);
        }
        if (!status[0] && !status[1]) {
          break;
        }
      }
      $.log(`\n结束第${i + 1}个日常任务：${task.taskName}\n`);
    }
    resolve();
  });
}

//做日常任务
function doTask({ taskId, completedTimes, configTargetTimes, taskName }) {
  return new Promise(async (resolve) => {
    if (parseInt(completedTimes) >= parseInt(configTargetTimes)) {
      resolve(false);
      $.log(`\n${taskName}[做日常任务]： mission success`);
      return;
    }
    $.get(taskListUrl(`DoTask`, `taskId=${taskId}`), (err, resp, data) => {
      try {
        //$.log(`taskId:${taskId},data:${data}`);
        const { msg, ret } = JSON.parse(data);
        $.log(
          `\n${taskName}[做任务]：${
            msg.indexOf("活动太火爆了") !== -1
              ? "任务进行中或者未到任务时间"
              : msg
          }\n${$.showLog ? data : ""}`
        );
        resolve(ret === 0);
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

//领取奖励
function awardTask({ taskId, taskName }) {
  return new Promise((resolve) => {
    $.get(taskListUrl(`Award`, `taskId=${taskId}`), (err, resp, data) => {
      try {
        const { msg, ret, data: { prizeInfo = '' } = {} } = JSON.parse(data);
        let str = '';
        if (msg.indexOf('活动太火爆了') !== -1) {
          str = '任务为成就任务或者未到任务时间';
        } else {
          str = msg + prizeInfo ? ` 获得财富值 ¥ ${JSON.parse(prizeInfo).ddwMoney}` : '';
        }
        $.log(`${taskName}[领奖励]：${str}\n${$.showLog ? data : ''}`);
        resolve(ret === 0);
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

//获取宝箱任务
//GET /jxcfd/consume/GetAdvancedBox?strZone=jxcfd&bizCode=jxcfd&source=jxcfd&dwEnv=7&_cfd_t=1606923650844&ptag=138631.26.55&_stk=_cfd_t%2CbizCode%2CdwEnv%2Cptag%2Csource%2CstrZone&_ste=1&h5st=20201202234050845%3B8183163432738160%3B10009%3Btk01w9f7c1c01a8nSDVybnU2b3lMEYRtFNtXiAo6Z0BJLI7QSOHrsTPHEheibS%2F2cyD6RSFZHwHIWaBNxeHWeZEhzTTh%3B8066c6939083d5cd828b90ad72a7428333496bef65ed0baa1f068b293c6a6453&_=1606923650846&sceneval=2&g_login_type=1&callback=jsonpCBKHHH&g_ty=ls HTTP/1.1

function getCookies() {
  if ($.isNode()) {
    $.cookieArr = Object.values(jdCookieNode);
  } else {
    $.cookieArr = [$.getdata("CookieJD") || "", $.getdata("CookieJD2") || ""];
  }
  if (!$.cookieArr[0]) {
    $.msg(
      $.name,
      "【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取",
      "https://bean.m.jd.com/",
      {
        "open-url": "https://bean.m.jd.com/",
      }
    );
    return false;
  }
  return true;
}

function taskUrl(function_path, body) {
  return {
    url: `${JD_API_HOST}jxcfd/${function_path}?strZone=jxcfd&bizCode=jxcfd&source=jxcfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=138631.26.55&${body}&_ste=1&_=${Date.now()}&sceneval=2&g_login_type=1&g_ty=ls`,
    headers: {
      Cookie: $.currentCookie,
      Accept: "*/*",
      Connection: "keep-alive",
      Referer:
        "https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
      "Accept-Encoding": "gzip, deflate, br",
      Host: "m.jingxi.com",
      "User-Agent":
        "jdpingou;iPad;3.15.2;14.2;c18613cab073b19ba6d9f4e49695c585997ad5e7;network/wifi;model/iPad7,5;appBuild/100365;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/68;pap/JA2015_311210;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPad; CPU OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "Accept-Language": "zh-cn",
    },
  };
}

function taskListUrl(function_path, body) {
  return {
    url: `${JD_API_HOST}newtasksys/newtasksys_front/${function_path}?strZone=jxcfd&bizCode=jxcfd&source=jxcfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=138631.26.55&${body}&_ste=1&_=${Date.now()}&sceneval=2&g_login_type=1&g_ty=ls`,
    headers: {
      Cookie: $.currentCookie,
      Accept: "*/*",
      Connection: "keep-alive",
      Referer:
        "https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
      "Accept-Encoding": "gzip, deflate, br",
      Host: "m.jingxi.com",
      "User-Agent":
        "jdpingou;iPad;3.15.2;14.2;c18613cab073b19ba6d9f4e49695c585997ad5e7;network/wifi;model/iPad7,5;appBuild/100365;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/68;pap/JA2015_311210;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPad; CPU OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "Accept-Language": "zh-cn",
    },
  };
}

function showMsg() {
  return new Promise((resolve) => {
    if ($.notifyTime) {
      const notifyTimes = $.notifyTime.split(",").map((x) => x.split(":"));
      const now = $.time("HH:mm").split(":");
      $.log(`\n${JSON.stringify(notifyTimes)}`);
      $.log(`\n${JSON.stringify(now)}`);
      if (
        notifyTimes.some((x) => x[0] === now[0] && (!x[1] || x[1] === now[1]))
      ) {
        $.msg($.name, "", `\n${$.result.join("\n")}`);
      }
    } else {
      $.msg($.name, "", `\n${$.result.join("\n")}`);
    }
    resolve();
  });
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}