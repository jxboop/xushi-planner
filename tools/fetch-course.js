/**
 * 在已登录的浏览器里请求课表接口，把返回的 HTML 存到本地
 *   node fetch-course.js 523
 */
const http = require('http');
const fs = require('fs');

const PORT = process.env.CDP_PORT || 9223;
const SEM = process.argv[2] || '';

function getJSON(u) {
  return new Promise((res, rej) => {
    http.get(u, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

(async () => {
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find((t) => t.type === 'page' && /eams/.test(t.url));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (m, p) => new Promise((res) => {
    const i = ++id;
    const h = (e) => { const x = JSON.parse(e.data); if (x.id === i) { ws.removeEventListener('message', h); res(x); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method: m, params: p || {} }));
  });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) return 'ERR: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300);
    return r.result && r.result.result && r.result.result.value;
  };

  const body = `semester.id=${SEM}&courseTableType=std&startWeek=&project.id=1&ignoreHead=1&setting.kind=std`;
  const expr = `
    fetch('https://eams.uestc.edu.cn/eams/courseTableForStd!courseTable.action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
      body: ${JSON.stringify(body)}
    }).then(r => r.text()).then(t => t)`;

  const html = await ev(expr);
  if (typeof html !== 'string') { console.log('返回异常:', String(html).slice(0, 200)); ws.close(); return; }
  fs.writeFileSync('D:\\tmp\\course.html', html, 'utf8');
  console.log('已保存 D:\\tmp\\course.html 字符数:', html.length);
  console.log('预览:', html.replace(/\s+/g, ' ').slice(0, 300));
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
