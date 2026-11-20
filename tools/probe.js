const http = require('http');
const PORT = 9223;
function getJSON(u){return new Promise((res,rej)=>{http.get(u,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}})}).on('error',rej)})}
(async()=>{
  const list = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = list.find(t=>t.type==='page' && /courseTable/.test(t.url)) || list.find(t=>t.type==='page' && /eams/.test(t.url));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r));
  let id=0;
  const send=(m,p)=>new Promise(res=>{const i=++id;const h=e=>{const x=JSON.parse(e.data);if(x.id===i){ws.removeEventListener('message',h);res(x)}};ws.addEventListener('message',h);ws.send(JSON.stringify({id:i,method:m,params:p||{}}))});
  const ev=async(expr)=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});return r.result&&r.result.result&&r.result.result.value};
  console.log(await ev(process.argv[2]||'1'));
  ws.close();
})();
