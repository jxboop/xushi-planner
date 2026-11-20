/* ============================================================
   序时 · AI 层
   默认接 DeepSeek（OpenAI 兼容 /chat/completions），
   也支持任何同格式端点（智谱 / 通义 / Kimi / 自建代理 / Ollama）。
   ============================================================ */
(function () {
  'use strict';

  const U = window.U, S = window.S;

  /** 带思考链的模型：要求更多 max_tokens，否则回答被 reasoning 吃光 */
  function IS_REASONER(model) {
    return /reasoner|v4(\.\d)?-flash|v4(\.\d)?-pro|r1/i.test(String(model || ''));
  }

  function join(base, path) {
    let b = String(base || '').trim().replace(/\/+$/, '');
    if (!b) b = 'https://api.deepseek.com';
    if (/\/chat\/completions$/.test(b)) return b;
    if (/\/v\d+$/.test(b)) return b + path;
    return b + path;
  }

  /** 走代理时统一编码成 ?url= 形式，方便一个 Worker 转发任意上游 */
  function endpoint(base) {
    const full = join(base, '/chat/completions');
    const p = String(S.settings.proxyBase || '').trim().replace(/\/+$/, '');
    if (!p) return full;
    if (p.indexOf('http') === 0) return p + '/?url=' + encodeURIComponent(full);
    return full;
  }

  function errText(e) {
    const m = String((e && e.message) || e || '');
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) {
      return '连不上 AI 服务：可能是网络或浏览器跨域限制。若在国内或直连失败，见 README 里的 Worker 代理（填到「我的 → AI 接口 → 代理地址」）。';
    }
    if (/401|Unauthorized|invalid.*key/i.test(m)) return 'API Key 不对或已失效，去「我的 → AI 接口」重新填。';
    if (/402|Insufficient/i.test(m)) return '账户余额不足。';
    if (/429|rate/i.test(m)) return '请求太频繁，等十秒再试。';
    return m || 'AI 调用失败';
  }

  async function raw(messages, opt) {
    opt = opt || {};
    const s = S.settings;
    let key = String(opt.key != null ? opt.key : (s.apiKey || '')).trim();
    if (!key) key = String(s.visionKey || '').trim();
    const model = opt.model || s.model || 'deepseek-chat';
    const base = opt.base || s.apiBase;
    if (!key) throw new Error('还没填 API Key');
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), opt.timeout || 75000);
    let res;
    try {
      res = await fetch(endpoint(base), {
        method: 'POST',
        signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify(Object.assign({
          model: model,
          messages: messages,
          max_tokens: opt.maxTokens || 2600,
          stream: false
        },
          // 推理模型（deepseek-reasoner / v4-flash 系列）不吃 temperature，且思考会占 token
          IS_REASONER(model) ? {} : { temperature: opt.temperature != null ? opt.temperature : 0.35 },
          (opt.json && !IS_REASONER(model)) ? { response_format: { type: 'json_object' } } : {}
        ))
      });
    } catch (e) {
      clearTimeout(timer);
      throw new Error(/abort/i.test(String(e)) ? '请求超时，检查网络后再试' : errText(e));
    }
    clearTimeout(timer);
    const txt = await res.text();
    if (!res.ok) {
      let msg = txt.slice(0, 300);
      try { const j = JSON.parse(txt); msg = (j.error && (j.error.message || j.error.code)) || j.message || msg; } catch (e) {}
      throw new Error('HTTP ' + res.status + ' ' + msg);
    }
    let j = {};
    try { j = JSON.parse(txt); } catch (e) { throw new Error('返回不是 JSON：' + txt.slice(0, 120)); }
    const c = j.choices && j.choices[0];
    const out = c && ((c.message && c.message.content) || c.text) || '';
    return { text: out, usage: j.usage || null };
  }

  /** 从可能带 ```json 围栏的文本里抠出对象 */
  function pickJSON(text) {
    let t = String(text || '').trim();
    if (!t) return null;
    t = t.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a >= 0 && b > a) t = t.slice(a, b + 1);
    try { return JSON.parse(t); } catch (e) {}
    // 常见修补：尾逗号
    try { return JSON.parse(t.replace(/,\s*([}\]])/g, '$1')); } catch (e) {}
    return null;
  }

  /* ---------------- 提示词 ---------------- */
  function nowLine() {
    const d = new Date();
    const wd = U.weekCN[d.getDay()];
    return '现在是 ' + d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 ' + wd +
      ' ' + U.pad(d.getHours()) + ':' + U.pad(d.getMinutes()) + '（Asia/Shanghai），今天记为 ' + U.today() + '。';
  }

  const SYS_PARSE = function () {
    return [
      '你是「序时」App 里的日程助理，服务对象是一名中国大学生（电子科技大学大一）。',
      nowLine(),
      '任务：把用户给出的任何内容（一句话、一段话、通知、聊天记录、板书、待办清单）整理成结构化条目。',
      '严格只输出一个 JSON 对象，不要解释、不要 markdown、不要代码块。结构：',
      '{"events":[{"title":"","date":"YYYY-MM-DD","start":"HH:MM","end":"","place":"","note":"","tag":""}],',
      '"todos":[{"title":"","date":"YYYY-MM-DD","prio":0,"tag":""}],',
      '"inbox":[{"text":"","level":"high","from":""}],',
      '"reply":"一句中文小结，不超过 30 字"}',
      '规则：',
      '1. 相对时间必须换算成绝对日期：今天/明天/后天/大后天/本周X/下周X/下个月X号/X月X日 都要算准；只说了钟点没说日期 → 今天。',
      '2. 有明确时间点（几点、上午/下午+钟点、HH:MM）的事情放进 events，start 用 24 小时制 HH:MM；只给了时长或结束时间没开始时间也放进 events。',
      '3. 只有「要做的事」没有时间点 → 放进 todos，date 尽量给（没线索就给今天），prio 0=普通 1=重要 2=紧急。',
      '4. 原文里的通知、公告、缴费、报名截止、考试安排这类「需要记住的消息」→ 放进 inbox；level=high 表示要立刻处理或本周内到期。',
      '5. 不要编造原文没有的内容；某类没有就给空数组。',
      '6. tag 只能用这些短标签之一：课程、作业、考试、实验、会议、社团、复习、生活、其他。',
      '7. title 要精炼（≤18 字），把时间词去掉，保留人/地/事关键信息。',
      '8. 一条原文能拆成多件事就拆成多条。'
    ].join('\n');
  };

  const SYS_VISION = function () {
    return [
      '你是「序时」App 的图片整理助手，服务对象是中国大学生。',
      nowLine(),
      '用户会发来相册里的截图或照片，可能是：课程表截图、教务/辅导员通知、群聊记录、作业与实验要求、考试安排、板书、黑板或纸质材料。',
      '请读图里的文字，判断它属于什么，并抽取成结构化条目。只输出一个 JSON 对象，不要 markdown：',
      '{"kind":"课表|通知|作业|聊天|板书|其他","title":"这张图是什么（≤14字）",',
      '"events":[{"title":"","date":"YYYY-MM-DD","start":"HH:MM","end":"","place":"","note":"","tag":""}],',
      '"todos":[{"title":"","date":"YYYY-MM-DD","prio":0,"tag":""}],',
      '"inbox":[{"text":"","level":"high","from":""}],',
      '"reply":"一句中文小结，≤30字","text":"图里的关键原文，去重后不超过 200 字"}',
      '规则：日期、周次、节次都要换算成具体日期（不知道年份就用今年，周次换算参考今天）；看不清的字段留空，不要猜；课表类图片把每门课拆成 events 里的一条，date 填最近一次上课日期，note 里写「每周X 第几节」。'
    ].join('\n');
  };

  /** 把用户设的节次时间排成一行行，喂给模型，免得它自己编上课时间 */
  function periodTable() {
    const ps = S.settings.periods || [];
    return ps.map((p, i) => '  第' + (i + 1) + '节 ' + p[0] + '-' + p[1]).join('\n');
  }

  const SYS_NOTE = function () {
    const list = (S.courses || []).map(function (c) { return c.name; });
    const uniq = [];
    list.forEach(function (n) { if (uniq.indexOf(n) < 0) uniq.push(n); });
    return [
      '你是「序时」App 的学习笔记助手，服务对象是中国大学生（电子科技大学大一）。',
      nowLine(),
      '用户会发来相册里的图片：课堂板书、PPT 课件、作业要求、教务通知、群聊记录、教材拍照。',
      '请读懂内容，整理成一则**可以直接复习的笔记**，并判断它属于哪门课。',
      '',
      '用户这学期在上的课（course 必须从这里选，对不上就填「未分类」）：',
      uniq.length ? uniq.map(function (n) { return '- ' + n; }).join(String.fromCharCode(10)) : '- （暂未导入课表）',
      '',
      '只输出一个 JSON 对象，不要解释、不要 markdown 代码块：',
      '{"course":"课程名","title":"笔记标题（≤16字）","kind":"板书|课件|作业|通知|其他",',
      ' "content":"整理后的笔记正文：分点写，公式和数字原样保留，≤400 字",',
      ' "key":["3-5 个关键词"],"raw":"图里的关键原文，≤300 字"}',
      '规则：',
      '1. content 是给人复习用的，不是流水账：先写这页在讲什么，再列要点。',
      '2. 有公式、定义、定理、代码，原样保留不要改写。',
      '3. 图片是作业要求时，kind 填「作业」，content 里写清楚要求和截止时间。',
      '4. 完全不认识的课，course 填「未分类」，不要瞎猜。',
      '5. 看不清的地方写「（图不清）」，不要编。',
      '6. 多张图是同一门课的内容就合并成一则笔记。'
    ].join(String.fromCharCode(10));
  };

  const SYS_COURSE = function () {
    const sem = S.settings.semesterStart || '（未设置）';
    return [
      '你是课表解析器，服务对象是中国大学生。用户会粘贴从教务系统复制的课表文本（可能是表格、竖排、带「星期一/周一/1-2节/1-16周/单双周/教室/教师」等各种写法），也可能是截图识别出来的文字。',
      nowLine(),
      '学校：' + (S.settings.school || '未知') + '；学期第 1 周周一：' + sem,
      '本校作息（务必按这张表把节次换算成具体钟点，不要自己编时间）：',
      periodTable(),
      '',
      '只输出一个 JSON 对象，不要解释、不要 markdown：',
      '{"courses":[{"name":"课程名","teacher":"","place":"","day":1,"periods":[1,2],"weeks":"1-16","start":"08:30","end":"10:05","raw":"原文片段"}],',
      ' "issues":["没看懂的地方，一句话说明"],"reply":"一句中文小结"}',
      '规则：',
      '1. day：周一=1 … 周日=7。periods：节次数组，如 [1,2]、[3,4,5]。',
      '2. start/end：用上面作息表按最小/最大节次取起止时间。',
      '3. weeks：周次字符串，如 "1-16"、"1-16单"（单周）、"2-16双"（双周）、"1-8,10-16"。文中没写就填 "1-16"。',
      '4. 一句话里出现多个上课时段（如「周一1-2节，周三3-4节」）必须拆成多条课程记录。',
      '5. 同一门课不同周次段（如前 8 周、后 8 周）也要拆成多条。',
      '6. 课程名要去掉节次、周次、教室、教师这些修饰，只留课程本身（如「高等数学A」）。',
      '7. 看不清、拿不准的字段留空字符串，并把疑问写进 issues，绝对不要瞎猜编号或时间。',
      '8. raw 放这门课对应的原始文本片段（≤40 字），方便用户核对。',
      '9. 如果整段文本根本不像课表（比如是成绩单、通知），courses 返回空数组，在 issues 里说明。'
    ].join('\n');
  };

  const SYS_BRIEF = function () {
    return [
      '你是「序时」App 的日程参谋，服务对象是中国大学生（电子科技大学大一，目标保研）。',
      nowLine(),
      '根据用户今天/本周的安排，给出一段简洁、有判断力的中文简报。',
      '要求：口语、克制、有用；先说今天最要紧的一件事，再给 1-3 条具体建议（怎么排、什么时候做、别忘什么）；',
      '不要罗列清单（App 里已经有了），不要客套，不要用「首先/其次」，不超过 120 字，用 2-3 个短句或短段。'
    ].join('\n');
  };

  const SYS_REVIEW = function () {
    return [
      '你是「序时」App 的复盘教练，服务对象是中国大学生（电子科技大学大一，目标是保研）。',
      nowLine(),
      '用户会给你过去一周的原始记录：做完的事、没做完的事、逾期、课程、DDL、专注时长。',
      '写一段中文复盘，规则：',
      '1. 分成三段，每段 1-2 个短句：①这周真正推进了什么 ②卡在哪里 ③下周具体怎么调。',
      '2. 第一段要说到具体的事（不是统计数字），让人感觉真的被看过了。',
      '3. 第二段指出模式问题：拖延、排太满、只做容易的、被课程打断、专注时间太碎——挑最明显的一两个。',
      '4. 第三段要给可执行的动作：什么时间、做什么、做多少。不要「要合理规划时间」这种空话。',
      '5. 不客套、不夸、不用「首先/其次/总之」，不用 markdown、不用分点符号，不要标题。',
      '6. 全文不超过 200 字，用短句，允许直接指出问题。',
      '7. 如果数据几乎为空，就老实说这周记录太少、先记三天再复盘。'
    ].join('\n');
  };

  /* ---------------- 对外方法 ---------------- */

  async function parse(text) {
    const r = await raw([
      { role: 'system', content: SYS_PARSE() },
      { role: 'user', content: String(text).slice(0, 4000) }
    ], { json: true, temperature: 0.2 });
    const j = pickJSON(r.text) || {};
    return normalize(j);
  }

  async function analyzeImages(dataUrls, mode) {
    const isNote = mode === 'note';
    const content = [{ type: 'text', text: isNote ? '把这些图整理成一则笔记。' : '请整理这些图片，最多挑最重要的 6 条，合并重复内容。' }];
    dataUrls.slice(0, 6).forEach((u) => content.push({ type: 'image_url', image_url: { url: u } }));
    const s = S.settings;
    const r = await raw([{ role: 'system', content: isNote ? SYS_NOTE() : SYS_VISION() }, { role: 'user', content: content }], {
      json: true,
      temperature: 0.2,
      base: s.visionBase || s.apiBase,
      key: s.visionKey || s.apiKey,
      model: s.visionModel || 'glm-4v-flash',
      maxTokens: IS_REASONER(s.visionModel) ? 4000 : 2400
    });
    const j = pickJSON(r.text) || {};
    if (isNote) {
      return {
        note: {
          course: String(j.course || '未分类').trim().slice(0, 20),
          title: String(j.title || '未命名笔记').trim().slice(0, 24),
          kind: String(j.kind || '其他').trim().slice(0, 6),
          content: String(j.content || '').trim().slice(0, 900),
          key: Array.isArray(j.key) ? j.key.slice(0, 6).map(function (x) { return String(x).slice(0, 12); }) : [],
          raw: String(j.raw || '').trim().slice(0, 600)
        }
      };
    }
    return normalize(j, { keepText: true });
  }

  async function parseCourses(text) {
    const think = !!S.settings.reasoning;
    const r = await raw([
      { role: 'system', content: SYS_COURSE() },
      { role: 'user', content: '课表文本如下：' + String.fromCharCode(10) + String(text).slice(0, 9000) }
    ], {
      json: !think,
      temperature: 0.1,
      model: think ? 'deepseek-reasoner' : (S.settings.model || 'deepseek-chat'),
      maxTokens: think ? 5000 : 3200
    });
    const j = pickJSON(r.text) || {};
    const fixT = (t) => {
      const m = String(t || '').match(/(\d{1,2})[:：](\d{2})/);
      return m ? U.pad(U.clamp(+m[1], 0, 23)) + ':' + U.pad(U.clamp(+m[2], 0, 59)) : '';
    };
    const courses = (j.courses || []).map((c) => {
      const ps = (Array.isArray(c.periods) ? c.periods : [c.periods])
        .map((n) => parseInt(n, 10)).filter((n) => n >= 1 && n <= 20);
      return {
        name: String(c.name || '').trim().slice(0, 40),
        teacher: String(c.teacher || '').trim().slice(0, 20),
        place: String(c.place || '').trim().slice(0, 30),
        day: U.clamp(parseInt(c.day, 10) || 1, 1, 7),
        periods: ps,
        weeks: String(c.weeks || '1-16').trim(),
        start: fixT(c.start),
        end: fixT(c.end),
        raw: String(c.raw || '').trim().slice(0, 40)
      };
    }).filter((c) => c.name);
    return {
      courses,
      issues: Array.isArray(j.issues) ? j.issues.slice(0, 8).map((x) => String(x).slice(0, 80)) : [],
      reply: String(j.reply || '').trim().slice(0, 80)
    };
  }

  async function brief(ctxText) {
    const r = await raw([
      { role: 'system', content: SYS_BRIEF() },
      { role: 'user', content: ctxText }
    ], { temperature: 0.6, maxTokens: 500 });
    return String(r.text || '').trim();
  }

  /** 一周复盘：纯文本 */
  /** 只验证「视觉接口 + Key + 模型」通不通（发一句纯文本，不花钱） */
  async function testVision() {
    const s = S.settings;
    const key = String(s.visionKey || s.apiKey || '').trim();
    if (!key) throw new Error('还没填视觉模型 Key');
    const base = String(s.visionBase || '').trim() || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const model = String(s.visionModel || '').trim() || 'qwen3-vl-plus';
    const r = await raw([{ role: 'user', content: '只回复两个字：正常' }], {
      base: base, key: key, model: model, maxTokens: 20, temperature: 0
    });
    return model + ' → ' + String(r.text || '').trim().slice(0, 24);
  }

  async function review(ctxText) {
    const r = await raw([
      { role: 'system', content: SYS_REVIEW() },
      { role: 'user', content: ctxText }
    ], { temperature: 0.65, maxTokens: 800 });
    return String(r.text || '').trim();
  }

  async function test() {
    const r = await raw([{ role: 'user', content: '只回复两个字：正常' }], { temperature: 0, maxTokens: 20 });
    return String(r.text || '').trim();
  }

  /** 统一清洗 AI 输出 */
  function normalize(j, opt) {
    const today = U.today();
    const fixDate = (d) => {
      const s = String(d || '').trim();
      if (!s) return today;
      const m = s.match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/);
      if (m) return +m[1] + '-' + U.pad(+m[2]) + '-' + U.pad(+m[3]);
      if (/^\d{1,2}\D\d{1,2}$/.test(s)) return new Date().getFullYear() + '-' + s.replace(/\D/g, '-');
      return today;
    };
    const fixTime = (t) => {
      const m = String(t || '').match(/(\d{1,2})[:：](\d{2})/);
      if (!m) return '';
      return U.pad(U.clamp(+m[1], 0, 23)) + ':' + U.pad(U.clamp(+m[2], 0, 59));
    };
    const arr = (v) => (Array.isArray(v) ? v : []);
    const events = arr(j.events).map((e) => ({
      title: String(e.title || e.name || '未命名').trim().slice(0, 40),
      date: fixDate(e.date),
      start: fixTime(e.start || e.time),
      end: fixTime(e.end),
      place: String(e.place || e.location || '').trim(),
      note: String(e.note || e.desc || '').trim().slice(0, 200),
      tag: String(e.tag || '').trim().slice(0, 6)
    })).filter((e) => e.title);
    const todos = arr(j.todos).map((t) => ({
      title: String(t.title || t.name || '').trim().slice(0, 60),
      date: t.date ? fixDate(t.date) : '',
      prio: U.clamp(parseInt(t.prio, 10) || 0, 0, 2),
      tag: String(t.tag || '').trim().slice(0, 6)
    })).filter((t) => t.title);
    const inbox = arr(j.inbox).map((m) => ({
      text: String(m.text || m.content || '').trim().slice(0, 300),
      level: m.level === 'high' ? 'high' : 'normal',
      from: String(m.from || '').trim().slice(0, 20)
    })).filter((m) => m.text);
    const out = {
      kind: j.kind || '',
      title: j.title || '',
      events, todos, inbox,
      reply: String(j.reply || j.summary || '').trim().slice(0, 80),
      text: opt && opt.keepText ? String(j.text || '').slice(0, 400) : ''
    };
    out.empty = !events.length && !todos.length && !inbox.length;
    return out;
  }

  /* ---------------- 无 Key 时的本地兜底解析 ---------------- */
  function localParse(text) {
    const src = String(text || '').trim();
    if (!src) return normalize({});
    const today = U.today();
    let rest = src, date = today;

    // 日期
    const dm = rest.match(/(今天|今晚|今早|明天|明早|明晚|后天|大后天|这周|本周|下周|周[一二三四五六日天]|星期[一二三四五六日天]|礼拜[一二三四五六日天]|(\d{1,2})月(\d{1,2})[日号]?)/);
    if (dm) {
      const w = dm[0];
      const map = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7, 天: 7 };
      if (/^\d{1,2}月/.test(w)) {
        const mm = w.match(/(\d{1,2})月(\d{1,2})/);
        date = new Date().getFullYear() + '-' + U.pad(+mm[1]) + '-' + U.pad(+mm[2]);
      } else if (/大后天/.test(w)) date = U.addDays(today, 3);
      else if (/后天/.test(w)) date = U.addDays(today, 2);
      else if (/明/.test(w)) date = U.addDays(today, 1);
      else if (/今/.test(w)) date = today;
      else if (/[周星期礼拜]/.test(w)) {
        const key = w.replace(/[^一二三四五六日天]/g, '');
        const target = map[key] || 1;
        const cur = ((new Date().getDay() + 6) % 7) + 1;
        let delta = target - cur;
        if (/下周/.test(w)) delta += 7;
        else if (delta < 0) delta += 7;
        if (/下下周/.test(w)) delta += 7;
        date = U.addDays(today, delta);
      }
      rest = rest.replace(w, ' ');
    }

    // 时间（支持 3点 / 下午3点 / 晚七点 / 十九点半 / 15:30）
    let start = '';
    const CN = '[0-9]{1,2}|[零〇一二两三四五六七八九十]{1,3}';
    const tm = rest.match(new RegExp('(上午|早上|早晨|中午|下午|傍晚|晚上|夜里|凌晨)?\\s*(' + CN + ')\\s*[点時时](?:\\s*(' + CN + '|半|一刻|三刻)\\s*分?)?|(\\d{1,2})[:：](\\d{2})'));
    if (tm) {
      if (tm[4]) { start = U.pad(+tm[4]) + ':' + tm[5]; }
      else {
        let h = U.cnNum(tm[2]);
        const part = tm[1] || '';
        if (/下午|傍晚|晚上|夜里/.test(part) && h < 12) h += 12;
        if (/中午/.test(part) && h < 11) h += 12;
        if (/凌晨/.test(part) && h === 12) h = 0;
        let mm = 0;
        const mmRaw = tm[3];
        if (mmRaw === '半') mm = 30;
        else if (mmRaw === '一刻') mm = 15;
        else if (mmRaw === '三刻') mm = 45;
        else if (mmRaw) mm = U.cnNum(mmRaw) || 0;
        start = U.pad(U.clamp(h, 0, 23)) + ':' + U.pad(mm);
      }
      rest = rest.replace(tm[0], ' ');
    }

    let title = rest.replace(/^[，,。.\s、]+|[，,。.\s、]+$/g, '').replace(/\s+/g, ' ').trim();
    title = title.replace(/^(之前|以前|截止|前|要|记得|提醒我)+/g, '').trim();
    title = title.slice(0, 40) || '新条目';

    const isTodo = !start;
    const j = isTodo
      ? { todos: [{ title, date, prio: /重要|必须|马上|紧急/.test(src) ? 1 : 0 }], reply: '已加入待办（本地解析）' }
      : { events: [{ title, date, start, end: '', tag: '' }], reply: '已排进日程（本地解析）' };
    return normalize(j);
  }

  window.AI = {
    parse, analyzeImages, parseCourses, brief, review, testVision, test, normalize, pickJSON, localParse,
    ready() { return !!(S.settings.apiKey || '').trim(); },
    visionReady() { return !!(S.settings.visionKey || S.settings.apiKey || '').trim(); },
    endpoint
  };
})();
