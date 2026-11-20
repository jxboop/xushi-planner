/** 把课表注入本地 App 存储（用于验证周视图） */
const http = require('http');
const fs = require('fs');

const PORT = process.env.CDP_PORT || 9224;

function getJSON(u) {
  return new Promise((res, rej) => {
    http.get(u, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
  });
}

(async () => {
  const tt = fs.readFileSync('D:\\tmp\\timetable.txt', 'utf8');
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find((t) => t.type === 'page' && /8848/.test(t.url));
  if (!page) { console.log('找不到 App 页面'); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (m, p) => new Promise((res) => {
    const i = ++id;
    const h = (e) => { const x = JSON.parse(e.data); if (x.id === i) { ws.removeEventListener('message', h); res(x); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method: m, params: p || {} }));
  });

  const expr = `(function(){
    var t = ${JSON.stringify(tt)};
    var n = 0;
    Store.parseTimetableLines(t).forEach(function(c){
      S.courses.push({id:U.uid(),name:c.name,teacher:c.teacher,place:c.place,day:c.day,periods:c.periods,weeks:c.weeks,start:'',end:'',color:'#3B6CFF'});
      n++;
    });
    S.settings.semesterStart = U.addDays(U.mondayOf(U.today()), -70);
    Store.save();
    return '超入 ' + n + ' 门课，今天是第 ' + Store.weekNo(U.today()) + ' 周';
  })()`;

  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  console.log((r.result && r.result.result && r.result.result.value) || JSON.stringify(r.result).slice(0, 300));
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
