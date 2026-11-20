/**
 * 从已登录的课表页提取课程，存 D:\tmp\courses.json
 */
const http = require('http');
const fs = require('fs');

const PORT = process.env.CDP_PORT || 9223;

function getJSON(u) {
  return new Promise((res, rej) => {
    http.get(u, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

const EXPR = `(function(){
  var acts = (window.table0 && window.table0.activities) || [];
  var out = [];
  document.querySelectorAll('[id^=TD]').forEach(function(td){
    if (!td.title) return;
    var m = td.id.match(/^TD(\\d+)_(\\d+)$/); if (!m) return;
    var idx = +m[1];
    var day = Math.floor(idx / 12);
    var unit = idx % 12;
    var span = td.rowSpan || 1;
    var a = (acts[idx] && acts[idx][0]) || {};
    out.push({
      day: day + 1,
      start: unit + 1,
      end: unit + span,
      title: td.title,
      name: a.courseName || '',
      teacher: a.teacherName || '',
      room: a.roomName || '',
      weeksRaw: a.vaildWeeks || '',
      courseId: a.courseId || ''
    });
  });
  return JSON.stringify({ count: out.length, items: out, unitCounts: (window.table0||{}).unitCounts });
})()`;

(async () => {
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find((t) => t.type === 'page' && /courseTable/.test(t.url)) || list.find((t) => t.type === 'page' && /eams/.test(t.url));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (m, p) => new Promise((res) => {
    const i = ++id;
    const h = (e) => { const x = JSON.parse(e.data); if (x.id === i) { ws.removeEventListener('message', h); res(x); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method: m, params: p || {} }));
  });
  const r = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true, awaitPromise: true });
  const val = r.result && r.result.result && r.result.result.value;
  if (!val) { console.log('提取失败', JSON.stringify(r.result).slice(0, 300)); ws.close(); return; }
  fs.writeFileSync('D:\\tmp\\courses.json', val, 'utf8');
  const j = JSON.parse(val);
  console.log('提取到', j.count, '个课程块，unitCounts =', j.unitCounts);
  console.log('已保存 D:\\tmp\\courses.json');
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
