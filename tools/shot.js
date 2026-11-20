/** 用 CDP 给页面截图（可指定视口高度）
 *  node shot.js http://.../index.html#week 1400 out.png
 */
const http = require('http');
const fs = require('fs');

const PORT = process.env.CDP_PORT || 9224;
const url = process.argv[2] || 'http://127.0.0.1:8848/index.html';
const height = parseInt(process.argv[3] || '900', 10);
const out = process.argv[4] || 'D:\\tmp\\shot.png';

function getJSON(u) {
  return new Promise((res, rej) => {
    http.get(u, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
  });
}

(async () => {
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find((t) => t.type === 'page' && !/^(chrome|edge|devtools)/.test(t.url));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (m, p) => new Promise((res) => {
    const i = ++id;
    const h = (e) => { const x = JSON.parse(e.data); if (x.id === i) { ws.removeEventListener('message', h); res(x); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method: m, params: p || {} }));
  });

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: height, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 3200));
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const b64 = shot.result && shot.result.data;
  if (!b64) { console.log('截图失败', JSON.stringify(shot).slice(0, 200)); ws.close(); return; }
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('已保存', out);
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
