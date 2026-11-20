/**
 * 用 CDP 读浏览器当前页面（Node 22+ 自带 WebSocket）
 *   node cdp.js                 读当前页标题/地址/正文摘要
 *   node cdp.js html            读整页 HTML 写到 D:\tmp\page.html
 *   node cdp.js text            读整页纯文本写到 D:\tmp\page.txt
 */
const http = require('http');
const fs = require('fs');

const PORT = process.env.CDP_PORT || 9223;
const mode = process.argv[2] || 'info';
const navUrl = process.argv[3] || '';

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
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find((t) => t.type === 'page' && /uestc|eams|jwgl|ehall/i.test(t.url))
    || list.find((t) => t.type === 'page' && !/^(chrome|edge|devtools)/.test(t.url));
  if (!page) { console.log('没有找到网页标签'); process.exit(1); }

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

  if (mode === 'nav') {
    const nav = await send('Page.navigate', { url: navUrl });
    console.log('导航:', navUrl, JSON.stringify(nav.result || {}));
    await new Promise((r) => setTimeout(r, 3500));
    const cur = await send('Runtime.evaluate', { expression: 'location.href + " | " + document.title', returnByValue: true });
    console.log('现在:', (cur.result && cur.result.result && cur.result.result.value) || '');
    ws.close();
    return;
  }

  const expr = mode === 'html'
    ? 'document.documentElement.outerHTML'
    : mode === 'text'
      ? 'document.body.innerText'
      : 'JSON.stringify({title:document.title,url:location.href,text:document.body.innerText.slice(0,800),frames:[...document.querySelectorAll("iframe")].map(f=>f.src)})';

  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: false });
  const val = r.result && r.result.result && r.result.result.value;

  if (mode === 'html') {
    fs.writeFileSync('D:\\tmp\\page.html', val || '', 'utf8');
    console.log('已写 D:\\tmp\\page.html', (val || '').length, '字符');
  } else if (mode === 'text') {
    fs.writeFileSync('D:\\tmp\\page.txt', val || '', 'utf8');
    console.log('已写 D:\\tmp\\page.txt', (val || '').length, '字符');
  } else {
    console.log(val);
  }
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
