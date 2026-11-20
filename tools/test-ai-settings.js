/** 在线上站点模拟填「视觉模型」三项并保存，验证是否写入 */
const http = require('http');

const PORT = process.env.CDP_PORT || 9229;

function getJSON(u) {
  return new Promise((res, rej) => {
    http.get(u, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
  });
}

const FLOW = `(async function(){
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function q(s){ return document.querySelector(s); }
  var log = [];
  var tab = q('[data-act="go"][data-page="me"]');
  if (!tab) return 'ERR 找不到我的标签';
  tab.click(); await wait(400);
  var open = q('[data-act="openAI"]');
  if (!open) return 'ERR 找不到 AI 设置入口';
  open.click(); await wait(400);
  var m = q('[name="visionModel"]'), b = q('[name="visionBase"]'), k = q('[name="visionKey"]');
  log.push('字段存在: ' + !!(m && b && k));
  if (!m) return 'ERR 视觉模型字段不存在';
  m.value = 'qwen3-vl-plus';
  b.value = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  k.value = 'sk-ws-TESTKEY1234567890';
  (m.dispatchEvent(new Event('input',{bubbles:true})), b.dispatchEvent(new Event('input',{bubbles:true})), k.dispatchEvent(new Event('input',{bubbles:true})));
  var save = q('[data-act="saveAI"]');
  log.push('保存按钮: ' + !!save);
  save.click(); await wait(600);
  log.push('折叠后 S.settings.visionModel = ' + (S.settings.visionModel || '(空)'));
  log.push('折叠后 S.settings.visionBase 有值: ' + !!S.settings.visionBase);
  log.push('折叠后 S.settings.visionKey 有值: ' + !!S.settings.visionKey);
  var ls = JSON.parse(localStorage.getItem('xushi.v1') || '{}');
  log.push('localStorage.visionModel = ' + (((ls.settings||{}).visionModel) || '(空)'));
  return log.join(' | ');
})()`;

(async () => {
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find((t) => t.type === 'page' && /github\.io|xushi|8848/.test(t.url));
  if (!page) { console.log('没找到 App 页面'); process.exit(1); }
  console.log('页面:', page.url.slice(0, 70));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (m, p) => new Promise((res) => {
    const i = ++id;
    const h = (e) => { const x = JSON.parse(e.data); if (x.id === i) { ws.removeEventListener('message', h); res(x); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method: m, params: p || {} }));
  });
  const r = await send('Runtime.evaluate', { expression: FLOW, returnByValue: true, awaitPromise: true });
  const v = r.result && r.result.result && r.result.result.value;
  console.log(v || JSON.stringify(r.result).slice(0, 400));
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
