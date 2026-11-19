/**
 * 序时 · CORS 转发代理（Cloudflare Worker）
 * ------------------------------------------------------------
 * 作用：iOS Safari / PWA 直连 AI 接口常被跨域拦住，或者想把请求
 *      挪到一台有固定出口的服务器上。这个 Worker 只做三件事：
 *      1) 校验白名单，防止变成开放代理；
 *      2) 透传 Authorization / body 到上游；
 *      3) 补 CORS 响应头。
 *
 * 部署：
 *   1. 打开 https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. 把本文件内容整段贴进编辑器，Deploy
 *   3. 拿到形如 https://xushi-proxy.你的账号.workers.dev 的地址
 *   4. 回到 App「我的 → AI 接口 → 代理地址」，填：
 *        https://xushi-proxy.你的账号.workers.dev
 *      （App 会自动拼成 ?url=<目标接口>）
 *
 * 想让别人猜不到：把下面 ROUTE_SECRET 设一个字符串，
 * 然后代理地址填 https://xxx.workers.dev/<那个字符串>
 */

const ROUTE_SECRET = ''; // 留空 = 不校验路径；填了就要求 URL 里带这一节

const ALLOW_HOSTS = [
  'api.deepseek.com',
  'open.bigmodel.cn',
  'dashscope.aliyuncs.com',
  'dashscope-intl.aliyuncs.com',
  'api.moonshot.cn',
  'api.openai.com',
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
  'api.siliconflow.cn',
  'api.groq.com',
  'openrouter.ai'
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const here = new URL(request.url);

    if (ROUTE_SECRET) {
      const path = here.pathname.replace(/^\/+|\/+$/g, '');
      if (path !== ROUTE_SECRET) {
        return json({ error: { message: 'not found' } }, 404);
      }
    }

    const target = here.searchParams.get('url');
    if (!target) {
      return json({ error: { message: 'missing ?url= 参数' } }, 400);
    }

    let upstream;
    try {
      upstream = new URL(target);
    } catch {
      return json({ error: { message: 'bad url' } }, 400);
    }

    if (!/^https?:$/.test(upstream.protocol) || !ALLOW_HOSTS.includes(upstream.hostname)) {
      return json({ error: { message: 'host not allowed: ' + upstream.hostname } }, 403);
    }

    const headers = new Headers();
    const ct = request.headers.get('content-type');
    if (ct) headers.set('content-type', ct);
    const auth = request.headers.get('authorization');
    if (auth) headers.set('authorization', auth);
    headers.set('accept', 'application/json');

    let body;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    const res = await fetch(upstream.toString(), {
      method: request.method,
      headers,
      body,
      redirect: 'follow'
    });

    const out = new Headers(CORS);
    const outCT = res.headers.get('content-type');
    if (outCT) out.set('content-type', outCT);
    out.set('cache-control', 'no-store');

    // 流式透传（SSE 也能用）
    return new Response(res.body, { status: res.status, headers: out });
  }
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'content-type': 'application/json; charset=utf-8' }, CORS)
  });
}
