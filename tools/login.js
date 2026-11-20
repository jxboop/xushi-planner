/**
 * 在已经打开的可见浏览器窗口里，像人一样填表登录（不是后台爬虫）
 *   EAMS_USER=学号 EAMS_PASS=密码 node login.js probe   ← 只填不提交，看要不要验证码
 *   EAMS_USER=学号 EAMS_PASS=密码 node login.js submit  ← 填 + 点登录
 */
const http = require('http');

const PORT = process.env.CDP_PORT || 9223;
const USER = process.env.EAMS_USER || '';
const PASS = process.env.EAMS_PASS || '';
const mode = process.argv[2] || 'probe';

function getJSON(url) {
  return new Promise((res, rej) => {
    http.get(url, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

(async () => {
  if (!USER || !PASS) { console.log('缺少 EAMS_USER / EAMS_PASS'); process.exit(1); }
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find((t) => t.type === 'page' && /idas|uestc|eams/i.test(t.url)) || list.find((t) => t.type === 'page');
  if (!page) { console.log('没有可用标签页'); process.exit(1); }
  console.log('目标页:', page.url.slice(0, 90));

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (method, params) => new Promise((res) => {
    const myId = ++id;
    const h = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id === myId) { ws.removeEventListener('message', h); res(m); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: myId, method, params: params || {} }));
  });
  const evalJs = async (expr, userGesture) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: !!userGesture });
    if (r.result && r.result.exceptionDetails) return { err: r.result.exceptionDetails.text };
    return { v: r.result && r.result.result && r.result.result.value };
  };

  // 1. 填账号密码（模拟真人输入：先 focus，再设值，再派发 input）
  const fill = `
    (function(){
      var u = document.querySelector('#username');
      var p = document.querySelector('#password');
      if (!u || !p) return 'no-fields';
      u.focus(); u.value = ${JSON.stringify(USER)};
      u.dispatchEvent(new Event('input', {bubbles:true}));
      u.dispatchEvent(new Event('change', {bubbles:true}));
      p.focus(); p.value = ${JSON.stringify(PASS)};
      p.dispatchEvent(new Event('input', {bubbles:true}));
      p.dispatchEvent(new Event('change', {bubbles:true}));
      u.blur(); p.blur();
      return 'filled';
    })()`;
  console.log('填表:', (await evalJs(fill)).v);

  await new Promise((r) => setTimeout(r, 1200));

  // 2. 看验证码是不是要输
  const probe = `
    (function(){
      var c = document.querySelector('#captcha');
      var box = c ? (c.closest('.form-group') || c.parentElement) : null;
      var vis = !!(c && c.offsetParent !== null);
      return JSON.stringify({
        captchaVisible: vis,
        captchaBox: box ? (getComputedStyle(box).display + '/' + getComputedStyle(box).visibility) : 'none',
        btn: !!document.querySelector('#login_submit'),
        userVal: (document.querySelector('#username')||{}).value ? 'ok' : 'empty',
        err: (document.querySelector('.auth_error, #msg, .login-error, .errorMsg')||{}).textContent || ''
      });
    })()`;
  const info = JSON.parse((await evalJs(probe)).v || '{}');
  console.log('状态:', JSON.stringify(info));

  if (mode === 'submit') {
    if (info.captchaVisible) {
      console.log('需要验证码，停下等你手动输入');
    } else {
      console.log('点登录…');
      await evalJs("(function(){var b=document.querySelector('#login_submit'); if(b){b.click(); return 'clicked';} return 'no-btn';})()", true);
      await new Promise((r) => setTimeout(r, 5000));
      const after = await evalJs('location.href + " | " + document.title');
      console.log('跳转后:', after.v);
    }
  }
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
