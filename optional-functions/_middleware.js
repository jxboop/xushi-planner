/**
 * 可选：给站点加一道口令（Cloudflare Pages Functions）
 * ------------------------------------------------------------
 * 默认不启用。想启用：
 *   1. 把本文件复制到项目根目录的 functions/_middleware.js
 *      （路径必须是 functions/_middleware.js）
 *   2. Cloudflare Pages 项目 → Settings → Environment variables
 *      加一个 APP_PASSWORD = 你的口令
 *   3. 重新部署
 *
 * 之后打开站点会弹系统登录框：用户名随便填，密码填 APP_PASSWORD。
 * Safari 会记住，日常不用每次输。
 *
 * 副作用（先说清楚）：
 *   - 首次打开 / 清缓存后要输一次密码
 *   - 离线打开（Service Worker 缓存）时不受影响
 *   - 如果你只是不想别人看到，其实用「随机项目名」就够，
 *     比如 xushi-x7k2m9.pages.dev —— 猜不到就行，不用加这层
 */

export async function onRequest(context) {
  const PASSWORD = context.env.APP_PASSWORD;
  if (!PASSWORD) return context.next(); // 没设口令就直通

  const auth = context.request.headers.get('Authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const raw = atob(auth.slice(6));
      const idx = raw.indexOf(':');
      const pass = idx >= 0 ? raw.slice(idx + 1) : '';
      if (pass === PASSWORD) return context.next();
    } catch (e) {}
  }

  return new Response('需要口令才能访问', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Xushi", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}
