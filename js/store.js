/* ============================================================
   序时 · 数据层（localStorage 持久化 + 日期/课表/工具）
   ============================================================ */
(function () {
  'use strict';

  const KEY = 'xushi.v1';

  /* ---------------- 时间工具 ---------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const U = {
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    pad,
    /** Date -> '2026-11-19' */
    ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    /** '2026-11-19' -> 本地 Date（避免被当作 UTC） */
    toDate(s) {
      if (s instanceof Date) return new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const m = String(s || '').match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/);
      if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    },
    today() { return U.ymd(new Date()); },
    addDays(s, n) {
      const d = U.toDate(s);
      d.setDate(d.getDate() + n);
      return U.ymd(d);
    },
    /** 本周周一 */
    mondayOf(s) {
      const d = U.toDate(s);
      const w = (d.getDay() + 6) % 7; // 周一=0
      d.setDate(d.getDate() - w);
      return U.ymd(d);
    },
    weekCN: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    /** 相对今天的中文描述 */
    relLabel(dayStr) {
      const t = U.today();
      const diff = Math.round((U.toDate(dayStr) - U.toDate(t)) / 86400000);
      if (diff === 0) return '今天';
      if (diff === 1) return '明天';
      if (diff === 2) return '后天';
      if (diff === -1) return '昨天';
      if (diff > 0 && diff < 7) return U.weekCN[U.toDate(dayStr).getDay()] + '（' + diff + ' 天后）';
      return U.toDate(dayStr).getMonth() + 1 + ' 月 ' + U.toDate(dayStr).getDate() + ' 日';
    },
    /** 分钟数：'14:30' -> 870 */
    mins(t) {
      const m = String(t || '').match(/(\d{1,2})[:：](\d{2})/);
      return m ? +m[1] * 60 + +m[2] : -1;
    },
    /** 现在距某时刻的友好文案 */
    untilText(dayStr, time) {
      const m = U.mins(time);
      if (m < 0) return '';
      const now = new Date();
      const target = U.toDate(dayStr);
      target.setHours(Math.floor(m / 60), m % 60, 0, 0);
      let diff = Math.round((target - now) / 60000);
      const abs = Math.abs(diff);
      const h = Math.floor(abs / 60), mm = abs % 60;
      const unit = h ? (h + ' 小时' + (mm ? ' ' + mm + ' 分' : '')) : (mm + ' 分钟');
      return diff >= 0 ? unit + '后' : unit + '前';
    },
    esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    clamp(n, a, b) { return Math.max(a, Math.min(b, n)); },
    /** 中文数字 → 阿拉伯数字（支持 七 / 十二 / 二十三） */
    cnNum(s) {
      const str = String(s || '').trim();
      if (/^\d+$/.test(str)) return parseInt(str, 10);
      const map = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
      if (str === '十') return 10;
      if (str.length === 1) return map[str] != null ? map[str] : 0;
      if (str[0] === '十') return 10 + (map[str[1]] || 0);
      if (str[1] === '十') {
        const head = (map[str[0]] || 0) * 10;
        return str.length > 2 ? head + (map[str[2]] || 0) : head;
      }
      return map[str] || 0;
    },
    host(url) {
      try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return String(url || ''); }
    },
    favicon(url) {
      try {
        const u = new URL(url);
        const root = u.protocol + '//' + u.hostname;
        return root + '/favicon.ico';
      } catch (e) { return ''; }
    },
    initials(name) {
      const s = String(name || '?').trim();
      return /^[a-zA-Z]/.test(s) ? s.slice(0, 2).toUpperCase() : s.slice(0, 1);
    },
    isNative() {
      return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    },
    download(filename, text, mime) {
      const cap = window.Capacitor;
      // 原生里没有浏览器下载，写到缓存目录后调系统分享面板（可存文件 / 发微信 / 发给电脑）
      if (cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.Filesystem) {
        const b64 = btoa(unescape(encodeURIComponent(text)));
        cap.Plugins.Filesystem.writeFile({ path: filename, data: b64, directory: 'CACHE', encoding: 'base64' })
          .then((res) => cap.Plugins.Share.share({ title: filename, url: res.uri }).catch(() => {}))
          .catch(() => { if (window.toast) window.toast('导出失败，检查是否装了 Filesystem 插件'); });
        return;
      }
      const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    },
    copy(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
      return Promise.resolve();
    }
  };

  /* ---------------- 默认节次时间（可在设置里改） ---------------- */
  const DEFAULT_PERIODS = [
    ['08:30', '09:15'], ['09:20', '10:05'],
    ['10:25', '11:10'], ['11:15', '12:00'],
    ['14:30', '15:15'], ['15:20', '16:05'],
    ['16:25', '17:10'], ['17:15', '18:00'],
    ['19:00', '19:45'], ['19:50', '20:35'],
    ['20:45', '21:30']
  ];

  const DEFAULT_SETTINGS = {
    name: '',
    school: '电子科技大学',
    apiBase: 'https://api.deepseek.com',
    apiKey: '',
    model: 'deepseek-chat',
    proxyBase: '',
    visionBase: 'https://open.bigmodel.cn/api/paas/v4',
    visionKey: '',
    visionModel: 'glm-4v-flash',
    semesterStart: '',
    theme: 'auto',
    periods: DEFAULT_PERIODS,
    briefTime: '08:00',
    reasoning: false,
    gpaMode: 'level',
    targetGpa: '3.7',
    focusLen: 25,
    breakLen: 5,
    weekStartMon: true,
    onboarded: false
  };

  /* ---------------- 默认内容（首次打开） ---------------- */
  function seed() {
    const t = U.today();
    const mon = U.mondayOf(t);
    return {
      events: [
        { id: U.uid(), date: U.addDays(t, 1), start: '14:00', end: '15:35', title: '（示例）数据结构实验', place: '品学楼 A203', note: '这条是示例，点开就能删', tag: '实验', done: false, createdAt: Date.now() },
        { id: U.uid(), date: t, start: '', end: '', title: '把课程表导进来', note: '「我的 → 课程表导入」，粘贴教务系统的课表文本，AI 会排成每周重复的课', tag: '上手', done: false, createdAt: Date.now() - 2000 },
        { id: U.uid(), date: t, start: '', end: '', title: '试试对它说人话', note: '在「今天」页输入：周五下午三点到图书馆还书，提醒我带上学生证', tag: '上手', done: false, createdAt: Date.now() - 1000 }
      ],
      todos: [
        { id: U.uid(), title: '在「我的」里填入 DeepSeek API Key', date: t, done: false, prio: 1, tag: '上手', createdAt: Date.now() }
      ],
      courses: [],
      links: [
        { id: U.uid(), title: '教务处', url: 'https://jwc.uestc.edu.cn', group: '校园', color: '#3B6CFF' },
        { id: U.uid(), title: '图书馆', url: 'https://lib.uestc.edu.cn', group: '校园', color: '#8B5CF6' },
        { id: U.uid(), title: '学校官网', url: 'https://www.uestc.edu.cn', group: '校园', color: '#0EA5E9' },
        { id: U.uid(), title: 'B站', url: 'https://www.bilibili.com', group: '常用', color: '#FB7299' },
        { id: U.uid(), title: '知乎', url: 'https://www.zhihu.com', group: '常用', color: '#0084FF' },
        { id: U.uid(), title: 'DeepSeek', url: 'https://chat.deepseek.com', group: '常用', color: '#4D6BFE' }
      ],
      inbox: [],
      drafts: [],
      goals: [
        { id: U.uid(), title: '大一上 GPA 3.7+', type: '学业', due: '', done: false },
        { id: U.uid(), title: '进一个实验室 / 竞赛队', type: '保研', due: '', done: false }
      ],
      ddls: [
        { id: U.uid(), title: '（示例）英语四级报名截止', date: U.addDays(t, 6), time: '23:59', note: '记得先去教务系统确认报名状态', tag: '考试', done: false }
      ],
      grades: [],
      reviews: [],
      focus: [],
      chats: [],
      journals: []
    };
  }

  /* ---------------- 载入 / 保存 ---------------- */
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    let data = null;
    if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
    const base = seed();
    const s = Object.assign({}, base, data || {});
    s.settings = Object.assign({}, DEFAULT_SETTINGS, (data && data.settings) || {});
    ['events', 'todos', 'courses', 'links', 'inbox', 'drafts', 'goals', 'ddls', 'grades', 'reviews', 'focus', 'chats', 'journals'].forEach((k) => {
      if (!Array.isArray(s[k])) s[k] = base[k] || [];
    });
    return s;
  }

  const S = load();
  let tKey = null;
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {
      if (String(e).indexOf('Quota') >= 0 || e.name === 'QuotaExceededError') {
        // 配额满：丢掉草稿缩略图再试一次
        S.drafts.forEach((d) => { delete d.thumb; });
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e2) {}
        if (window.toast) window.toast('本地空间快满了，已清理图片缩略图');
      }
    }
  }

  /* ---------------- 课表 → 当日课程 ---------------- */
  function weekNo(dayStr) {
    const start = S.settings.semesterStart;
    if (!start) return 0;
    const a = U.toDate(U.mondayOf(start));
    const b = U.toDate(U.mondayOf(dayStr));
    return Math.floor((b - a) / 604800000) + 1;
  }

  /** "1-16" / "1-16单" / "2-16双" / "1-8,10-16" / "3" */
  function weeksInclude(spec, w) {
    if (!spec) return true;
    if (!w) return true;
    const parts = String(spec).split(/[,，、\s]+/).filter(Boolean);
    if (!parts.length) return true;
    for (const p of parts) {
      const odd = /单/.test(p), even = /双/.test(p);
      const nums = p.replace(/[^\d-]/g, '');
      const mm = nums.split('-');
      let a = +mm[0], b = mm.length > 1 ? +mm[1] : a;
      if (!a) continue;
      if (b < a) { const x = a; a = b; b = x; }
      if (w >= a && w <= b) {
        if (odd && w % 2 === 0) continue;
        if (even && w % 2 === 1) continue;
        return true;
      }
    }
    return false;
  }

  function periodSpan(periods) {
    const ps = (periods || []).filter((n) => n >= 1 && n <= 20);
    if (!ps.length) return { start: '', end: '' };
    const a = Math.min.apply(null, ps), b = Math.max.apply(null, ps);
    const t = S.settings.periods || DEFAULT_PERIODS;
    return { start: (t[a - 1] || [])[0] || '', end: (t[b - 1] || [])[1] || '' };
  }

  /** 某天要上的课（已过滤周次） */
  function coursesOn(dayStr) {
    const w = weekNo(dayStr);
    const dow = ((U.toDate(dayStr).getDay() + 6) % 7) + 1; // 周一=1
    return S.courses.filter((c) => Number(c.day) === dow && weeksInclude(c.weeks, w)
      && (!c.weeks || weeksInclude(c.weeks, w))).map((c) => {
      const sp = (c.start && c.end) ? { start: c.start, end: c.end } : periodSpan(c.periods);
      const p = (c.periods || []).slice().sort((x, y) => x - y);
      return {
        id: 'c-' + c.id + '-' + dayStr,
        courseId: c.id,
        title: c.name,
        place: c.place || '',
        teacher: c.teacher || '',
        start: sp.start,
        end: sp.end,
        periodText: p.length ? (p.length > 1 ? p[0] + '-' + p[p.length - 1] : '' + p[0]) + ' 节' : '',
        tag: '课程',
        kind: 'course',
        color: c.color || '',
        done: false,
        locked: true
      };
    });
  }

  /* ---------------- 当天全部条目 ---------------- */
  function eventsOn(dayStr) {
    return S.events.filter((e) => e.date === dayStr).map((e) => Object.assign({ kind: 'event' }, e));
  }

  function todosOn(dayStr) {
    return S.todos.filter((t) => (t.date || '') === dayStr).map((t) => Object.assign({ kind: 'todo' }, t));
  }

  function dayItems(dayStr) {
    const list = [].concat(coursesOn(dayStr), eventsOn(dayStr), todosOn(dayStr));
    list.sort((a, b) => {
      const am = U.mins(a.start), bm = U.mins(b.start);
      if (am < 0 && bm < 0) return (a.createdAt || 0) - (b.createdAt || 0);
      if (am < 0) return 1;
      if (bm < 0) return -1;
      return am - bm;
    });
    return list;
  }

  function hasItems(dayStr) {
    return S.events.some((e) => e.date === dayStr) || S.todos.some((t) => (t.date || '') === dayStr) || coursesOn(dayStr).length > 0;
  }

  /* ---------------- 增删改 ---------------- */
  const Api = {
    addEvent(o) {
      const ev = Object.assign({ id: U.uid(), date: U.today(), start: '', end: '', title: '', note: '', tag: '', done: false, createdAt: Date.now() }, o);
      S.events.push(ev); save(); return ev;
    },
    addTodo(o) {
      const td = Object.assign({ id: U.uid(), title: '', date: '', done: false, prio: 0, tag: '', createdAt: Date.now() }, o);
      S.todos.push(td); save(); return td;
    },
    delItem(kind, id) {
      if (kind === 'todo') S.todos = S.todos.filter((x) => x.id !== id);
      else S.events = S.events.filter((x) => x.id !== id);
      save();
    },
    toggleItem(kind, id) {
      const arr = kind === 'todo' ? S.todos : S.events;
      const it = arr.find((x) => x.id === id);
      if (it) { it.done = !it.done; it.doneAt = it.done ? Date.now() : 0; save(); }
      return it;
    },
    /** 把 AI 生成的条目写进库 */
    commit(draft) {
      const out = [];
      (draft.events || []).forEach((e) => {
        out.push(Api.addEvent({
          title: e.title || '未命名', date: e.date || U.today(), start: e.start || '', end: e.end || '',
          note: e.note || '', tag: e.tag || ''
        }));
      });
      (draft.todos || []).forEach((t) => {
        out.push(Api.addTodo({ title: t.title || '未命名', date: t.date || '', prio: t.prio || 0, tag: t.tag || '' }));
      });
      (draft.inbox || []).forEach((m) => {
        S.inbox.unshift({ id: U.uid(), text: m.text || '', from: m.from || 'AI 整理', level: m.level || 'normal', ts: Date.now(), done: false });
      });
      save();
      return out;
    }
  };

  /* ---------------- 导出 .ics（交给系统日历提醒） ---------------- */
  function icsEscape(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  function stamp(dayStr, time, plusMin) {
    const d = U.toDate(dayStr);
    const m = U.mins(time);
    const h = m >= 0 ? Math.floor(m / 60) : 9;
    const mi = m >= 0 ? m % 60 : 0;
    d.setHours(h, mi + (plusMin || 0), 0, 0);
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }
  function buildICS(fromDay, days) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Xushi//AI Planner//CN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:序时日程'];
    const daysN = days || 30;
    for (let i = 0; i < daysN; i++) {
      const day = U.addDays(fromDay || U.today(), i);
      dayItems(day).forEach((it) => {
        const dur = it.kind === 'course' ? 105 : 60;
        const ds = it.start ? stamp(day, it.start, 0) : stamp(day, '09:00', 0);
        const de = it.end ? stamp(day, it.end, 0) : stamp(day, it.start || '09:00', dur);
        lines.push('BEGIN:VEVENT');
        lines.push('UID:' + it.id + '@xushi');
        lines.push('DTSTAMP:' + stamp(U.today(), '00:00', 0));
        lines.push('DTSTART:' + ds);
        lines.push('DTEND:' + de);
        lines.push('SUMMARY:' + icsEscape(it.title + (it.place ? ' @' + it.place : '')));
        if (it.note) lines.push('DESCRIPTION:' + icsEscape(it.note));
        if (it.place) lines.push('LOCATION:' + icsEscape(it.place));
        lines.push('BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:序时提醒', 'END:VALARM');
        lines.push('END:VEVENT');
      });
    }
    // DDL：全部未完成的都导进去（不受 45 天窗口限制），提前一天 + 2 小时各提醒一次
    S.ddls.filter((d) => !d.done && d.date).forEach((d) => {
      const ds = d.time ? stamp(d.date, d.time, 0) : stamp(d.date, '09:00', 0);
      const de = d.time ? stamp(d.date, d.time, 30) : stamp(d.date, '09:00', 30);
      lines.push('BEGIN:VEVENT');
      lines.push('UID:ddl-' + d.id + '@xushi');
      lines.push('DTSTAMP:' + stamp(U.today(), '00:00', 0));
      lines.push('DTSTART:' + ds, 'DTEND:' + de);
      lines.push('SUMMARY:' + icsEscape('⏰ ' + d.title));
      if (d.note) lines.push('DESCRIPTION:' + icsEscape(d.note));
      lines.push('BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(d.title + ' 明天截止'), 'END:VALARM');
      lines.push('BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(d.title + ' 2 小时后截止'), 'END:VALARM');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /* ---------------- 图片压缩 ---------------- */
  function compress(file, maxSide, quality) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, (maxSide || 1200) / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          const data = cv.toDataURL('image/jpeg', quality || 0.82);
          URL.revokeObjectURL(url);
          resolve({ data, w, h });
        } catch (e) { URL.revokeObjectURL(url); reject(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
      img.src = url;
    });
  }

  /* ---------------- 成绩 / GPA ---------------- */
  const GPA_LEVEL = [[90, 4.0], [85, 3.7], [82, 3.3], [78, 3.0], [75, 2.7], [72, 2.3], [68, 2.0], [64, 1.5], [60, 1.0]];

  /** 单科绩点。mode: 'level' 分段制 | 'linear' 连续式 (分数-50)/10 */
  function gpaPoint(score, mode) {
    const v = parseFloat(score);
    if (!isFinite(v) || v <= 0) return 0;
    if (v < 60) return 0;
    if (mode === 'linear') return Math.min(4.0, (v - 50) / 10);
    for (let i = 0; i < GPA_LEVEL.length; i++) if (v >= GPA_LEVEL[i][0]) return GPA_LEVEL[i][1];
    return 0;
  }

  function gpa() {
    const mode = S.settings.gpaMode || 'level';
    let cw = 0, cp = 0, credits = 0, pass = 0, fail = 0;
    S.grades.forEach((g) => {
      const c = parseFloat(g.credit) || 0;
      const hasScore = g.score !== '' && g.score != null && isFinite(parseFloat(g.score));
      if (!hasScore || c <= 0) return;
      const p = gpaPoint(g.score, mode);
      cw += c; cp += c * p; credits += c;
      if (parseFloat(g.score) >= 60) pass++; else fail++;
    });
    return {
      gpa: cw ? cp / cw : 0,
      credits: Math.round(credits * 10) / 10,
      points: Math.round(cp * 100) / 100,
      count: S.grades.length,
      graded: pass + fail, pass, fail,
      mode
    };
  }

  /* ---------------- DDL 倒数 ---------------- */
  function ddlDue(d) {
    if (!d || !d.date) return 0;
    const dt = U.toDate(d.date);
    if (d.time) {
      const m = U.mins(d.time);
      dt.setHours(m >= 0 ? Math.floor(m / 60) : 23, m >= 0 ? m % 60 : 59, 0, 0);
    } else {
      dt.setHours(23, 59, 0, 0);
    }
    return dt.getTime();
  }

  /** 未完成的 DDL，按截止时间升序 */
  function ddlsOpen() {
    return S.ddls.filter((d) => !d.done && d.date)
      .map((d) => Object.assign({}, d, { dueMs: ddlDue(d) }))
      .sort((a, b) => a.dueMs - b.dueMs);
  }

  /** 毫秒 → { text, level }  level: past|today|soon|normal */
  function ddlLabel(ms) {
    const diff = ms - Date.now();
    const dayMs = 86400000;
    if (diff < 0) {
      const d = Math.ceil(-diff / dayMs);
      return { text: d <= 1 ? '已过期' : '过期 ' + d + ' 天', level: 'past' };
    }
    if (diff < dayMs && new Date(ms).toDateString() === new Date().toDateString()) {
      const h = Math.floor(diff / 3600000);
      return { text: h < 1 ? '不到 1 小时' : '还剩 ' + h + ' 小时', level: 'today' };
    }
    const d = Math.ceil(diff / dayMs);
    return { text: 'D-' + d, level: d <= 3 ? 'soon' : 'normal' };
  }

  /* ---------------- 专注 / 番茄钟 ---------------- */
  function focusState() {
    const st = S.focusState;
    if (!st) return { running: false, remain: 0, total: 0, minutes: 0, pct: 0 };
    const total = (st.minutes || 25) * 60000;
    const remain = st.running ? Math.max(0, st.endAt - Date.now()) : Math.max(0, st.remain || 0);
    return {
      running: !!st.running,
      remain,
      total,
      minutes: st.minutes || 25,
      label: st.label || '',
      pct: total ? Math.min(1, (total - remain) / total) : 0,
      done: remain <= 0
    };
  }

  function focusStart(minutes, label) {
    const m = Math.max(1, parseInt(minutes, 10) || 25);
    S.focusState = { running: true, minutes: m, label: label || '', startAt: Date.now(), endAt: Date.now() + m * 60000 };
    save();
    return focusState();
  }

  function focusPause() {
    const st = S.focusState;
    if (!st || !st.running) return focusState();
    st.remain = Math.max(0, st.endAt - Date.now());
    st.running = false;
    save();
    return focusState();
  }

  function focusResume() {
    const st = S.focusState;
    if (!st || st.running) return focusState();
    st.endAt = Date.now() + (st.remain || 0);
    st.running = true;
    save();
    return focusState();
  }

  /** 结束一节；completed=true 才计入记录 */
  function focusStop(completed) {
    const st = S.focusState;
    if (st && completed) {
      S.focus.unshift({
        id: U.uid(), ts: Date.now(), minutes: st.minutes || 25,
        label: st.label || '', date: U.today()
      });
      if (S.focus.length > 400) S.focus.length = 400;
    }
    S.focusState = null;
    save();
    return st;
  }

  /** 今天累计专注分钟 */
  function focusToday() {
    const t = U.today();
    return S.focus.filter((f) => f.date === t || U.ymd(new Date(f.ts)) === t)
      .reduce((a, b) => a + (b.minutes || 0), 0);
  }

  /* ---------------- 粘贴课表文本（不花 AI 的本地解析） ----------------
     格式：课程名|周一|1-2|教室|周次[|教师]
     竖线、制表符、连续空格都能分隔
  ------------------------------------------------------------ */
  const DAY_MAP = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7, 天: 7 };

  function parseTimetableLines(text) {
    const out = [];
    String(text || '').split(String.fromCharCode(10)).forEach(function (line) {
      const raw = line.trim();
      if (!raw || /^[#/\-]/.test(raw)) return;
      const parts = raw.split(/[|｜	]+|\s{2,}/).map(function (x) { return String(x).trim(); }).filter(Boolean);
      if (parts.length < 4) return;

      const name = parts[0].replace(/[（(][^)）]*[)）]$/, '').trim() || parts[0];
      const dm = parts[1].match(/[周星期礼拜]([一二三四五六日天])/);
      const day = dm ? DAY_MAP[dm[1]] : 0;
      if (!day) return;

      const pm = parts[2].match(/(\d{1,2})\s*[-–~到至]\s*(\d{1,2})/) || parts[2].match(/(\d{1,2})/);
      if (!pm) return;
      const a = parseInt(pm[1], 10);
      const b = pm[2] ? parseInt(pm[2], 10) : a;
      const periods = [];
      for (let i = a; i <= b && i <= 20; i++) periods.push(i);

      out.push({
        name: name.slice(0, 40),
        teacher: (parts[5] || '').slice(0, 20),
        place: (parts[3] || '').slice(0, 30),
        day: day,
        periods: periods,
        weeks: parts[4] || '1-16'
      });
    });
    return out;
  }

  /* ---------------- 统计 ---------------- */
  function stats() {
    const t = U.today();
    const items = dayItems(t);
    const total = items.length;
    const done = items.filter((x) => x.done).length;
    const timed = items.filter((x) => U.mins(x.start) >= 0);
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    const next = timed.find((x) => U.mins(x.start) >= nowM && !x.done);
    const overdue = S.todos.filter((x) => !x.done && x.date && x.date < t).length;
    return { total, done, timed: timed.length, next, overdue, rate: total ? Math.round(done / total * 100) : 0 };
  }

  window.U = U;
  window.S = S;
  window.Store = {
    save, seed, DEFAULT_SETTINGS, DEFAULT_PERIODS,
    coursesOn, eventsOn, todosOn, dayItems, hasItems, weekNo, weeksInclude, periodSpan,
    addEvent: Api.addEvent, addTodo: Api.addTodo, delItem: Api.delItem,
    toggleItem: Api.toggleItem, commit: Api.commit,
    buildICS, compress, stats, parseTimetableLines,
    gpaPoint, gpa,
    ddlDue, ddlsOpen, ddlLabel,
    focusState, focusStart, focusPause, focusResume, focusStop, focusToday,
    exportAll() { return JSON.stringify({ exportedAt: new Date().toISOString(), data: S }, null, 2); },
    importAll(text) {
      const j = JSON.parse(text);
      const d = j && j.data ? j.data : j;
      if (!d || !d.settings) throw new Error('文件格式不对');
      Object.keys(d).forEach((k) => { S[k] = d[k]; });
      save();
    },
    resetAll() {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    }
  };
})();
