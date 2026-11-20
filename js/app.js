/* ============================================================
   序时 · 界面与交互
   ============================================================ */
(function () {
  'use strict';

  const U = window.U, S = window.S, Store = window.Store, AI = window.AI;
  const $ = (s, r) => (r || document).querySelector(s);
  const view = $('#view'), tabbar = $('#tabbar'), sheetEl = $('#sheet'), scrim = $('#scrim'), toastEl = $('#toast');

  /* ---------------- 图标 ---------------- */
  const sv = (d, extra) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '>' + d + '</svg>';
  const ICON = {
    sun: sv('<circle cx="12" cy="12" r="4.1"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>'),
    cal: sv('<rect x="3" y="5" width="18" height="16" rx="4.5"/><path d="M8 3v4M16 3v4M3 10h18"/>'),
    spark: sv('<path d="M12 3.2l1.9 5.4 5.4 1.9-5.4 1.9-1.9 5.4-1.9-5.4L4.7 10.5l5.4-1.9z"/><path d="M18.6 15.4l.75 2.05 2.05.75-2.05.75-.75 2.05-.75-2.05-2.05-.75 2.05-.75z"/>'),
    grid: sv('<rect x="3.6" y="3.6" width="7" height="7" rx="2.2"/><rect x="13.4" y="3.6" width="7" height="7" rx="2.2"/><rect x="3.6" y="13.4" width="7" height="7" rx="2.2"/><rect x="13.4" y="13.4" width="7" height="7" rx="2.2"/>'),
    user: sv('<circle cx="12" cy="8.2" r="3.7"/><path d="M4.6 20.4c1.2-3.9 4-5.7 7.4-5.7s6.2 1.8 7.4 5.7"/>'),
    plus: sv('<path d="M12 5.2v13.6M5.2 12h13.6"/>'),
    check: sv('<path d="M20 6.5L9.3 17.2 4 11.9"/>'),
    left: sv('<path d="M15 5.5l-6.5 6.5L15 18.5"/>'),
    right: sv('<path d="M9 5.5l6.5 6.5L9 18.5"/>'),
    bell: sv('<path d="M18.2 9.3a6.2 6.2 0 10-12.4 0c0 5-2 6.2-2 6.2h16.4s-2-1.2-2-6.2"/><path d="M10.2 19.6a2 2 0 003.6 0"/>'),
    img: sv('<rect x="3" y="4.2" width="18" height="15.6" rx="4"/><circle cx="8.6" cy="9.6" r="1.6"/><path d="M3.8 17l5-4.8 3.6 3.4 3.2-2.8 4.6 4.2"/>'),
    up: sv('<path d="M12 19V5.4M6 11.4L12 5.4l6 6"/>'),
    trash: sv('<path d="M4.4 7h15.2M9.4 7V5.2h5.2V7M6.4 7l.9 12.2a1.6 1.6 0 001.6 1.5h6.2a1.6 1.6 0 001.6-1.5L17.6 7"/>'),
    gear: sv('<path d="M4 8h16M4 16h16"/><circle cx="9.2" cy="8" r="2.4" fill="var(--card-solid)"/><circle cx="15" cy="16" r="2.4" fill="var(--card-solid)"/>'),
    clock: sv('<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6V12l3.1 2"/>'),
    pin: sv('<path d="M12 21c4.6-4.2 6.9-7.4 6.9-10.6A6.9 6.9 0 105.1 10.4C5.1 13.6 7.4 16.8 12 21z"/><circle cx="12" cy="10.2" r="2.5"/>'),
    down: sv('<path d="M12 4.4v10.4M7.2 12.4L12 17.2l4.8-4.8M4.4 20h15.2"/>'),
    link: sv('<path d="M10.2 13.6a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7L12 6.1"/><path d="M13.8 10.4a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1.2-1.2"/>'),
    book: sv('<path d="M4 5.2A2 2 0 016 3.2h13v17.6H6a2 2 0 00-2 2z"/><path d="M4 5.2v15.6"/>'),
    x: sv('<path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6"/>'),
    flag: sv('<path d="M6 21V4.2c4-2 8 2 12 0v9.6c-4 2-8-2-12 0"/>'),
    timer: sv('<circle cx="12" cy="13.4" r="7.4"/><path d="M12 9.8v3.6l2.3 1.5M9.6 3.3h4.8M12 3.3v2.4"/>'),
    flame: sv('<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.2-4-5.4-4-9.4-2 1-3 2.8-3 4.6-1-.6-1.5-1.6-1.5-2.8C7.4 9 6 11.4 6 15.4 6 18.6 8.4 21 12 21z"/>'),
    chart: sv('<path d="M4.4 20.2h15.2"/><rect x="6" y="12.2" width="3.2" height="5.6" rx="1.1"/><rect x="11.4" y="7.2" width="3.2" height="10.6" rx="1.1"/><rect x="16.8" y="14.6" width="3.2" height="3.2" rx="1.1"/>'),
    target: sv('<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/>'),
    alarm: sv('<circle cx="12" cy="13.6" r="6.9"/><path d="M12 10.2v3.4l2.3 1.5M5.4 6.6 7.1 4.8M18.6 6.6 16.9 4.8"/>'),
    more: sv('<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>'),
    wrench: sv('<path d="M20.2 5.5a4.5 4.5 0 01-5.7 5.7l-7.8 7.8a2 2 0 01-2.9-2.9l7.8-7.8a4.5 4.5 0 015.7-5.7l-2.7 2.7.9 2.3 2.3.9z"/>')
  };
  const ARW = '<svg class="arw" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.6l6.4 6.4-6.4 6.4"/></svg>';
  const TAGS = ['课程', '作业', '考试', '实验', '会议', '社团', '复习', '生活', '其他'];
  const APP_VERSION = '1.3.0';

  /* 常见 App 的 URL Scheme：入口填了就先唤起 App，失败再回退网页 */
  const APP_SCHEMES = {
    'bilibili.com': 'bilibili://',
    'zhihu.com': 'zhihu://',
    'weibo.com': 'sinaweibo://',
    'xiaohongshu.com': 'xhsdiscover://',
    'douyin.com': 'snssdk1128://',
    'taobao.com': 'taobao://',
    'tmall.com': 'taobao://',
    'alipay.com': 'alipays://',
    'weixin.qq.com': 'weixin://',
    'qq.com': 'mqq://',
    '163.com': 'orpheus://',
    'notion.so': 'notion://',
    'chaoxing.com': 'chaoxingmobile://',
    'dingtalk.com': 'dingtalk://',
    'feishu.cn': 'lark://',
    'amap.com': 'iosamap://',
    'meituan.com': 'imeituan://',
    'linkedin.com': 'linkedin://'
  };
  function guessScheme(url) {
    let raw = String(url || '').trim();
    if (!raw) return '';
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    try {
      const h = new URL(raw).hostname.replace(/^www\./, '');
      const keys = Object.keys(APP_SCHEMES);
      for (let i = 0; i < keys.length; i++) {
        if (h === keys[i] || h.endsWith('.' + keys[i])) return APP_SCHEMES[keys[i]];
      }
    } catch (e) {}
    return '';
  }

  const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  const st = {
    page: 'today',
    sel: U.today(),
    calBase: U.today(),
    calMode: 'month',
    viewWeek: '',
    ai: { imgs: [], last: null, busy: false, brief: '', briefBusy: false, reviewBusy: false }
  };

  /* ---------------- 主题 ---------------- */
  let themeFromURL = false;
  function applyTheme() {
    if (!themeFromURL) {
      themeFromURL = true;
      const q = new URLSearchParams(location.search);
      if (q.get('theme') && !S.settings.themePinned) S.settings.theme = q.get('theme');
    }
    const t = S.settings.theme || 'auto';
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0A0B0F' : '#F3F4F7');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((S.settings.theme || 'auto') === 'auto') { applyTheme(); }
  });

  /* ---------------- Toast ---------------- */
  let toastTimer = 0;
  window.toast = function (msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms || 2400);
  };

  /* ---------------- Sheet ---------------- */
  function openSheet(html) {
    sheetEl.innerHTML = html;
    sheetEl.classList.add('on');
    scrim.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    sheetEl.classList.remove('on');
    scrim.classList.remove('on');
    document.body.style.overflow = '';
  }
  window.closeSheet = closeSheet;

  /* ---------------- 页面：今天 ---------------- */
  function greet() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 9) return '早上好';
    if (h < 12) return '上午好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    if (h < 23) return '晚上好';
    return '夜深了';
  }

  function weeksLeftText() {
    const start = S.settings.semesterStart;
    if (!start) return '';
    const w = Store.weekNo(U.today());
    return w > 0 ? '第 ' + w + ' 周' : '';
  }

  function itemHTML(it, i) {
    const isCourse = it.kind === 'course';
    const timeCell = it.start
      ? '<b>' + it.start + '</b>' + (it.end ? U.esc(it.end) : '')
      : '<b>·</b>全天';
    const chips = [];
    if (isCourse) chips.push('<span class="chip purple">' + U.esc(it.periodText || '课程') + '</span>');
    if (it.place) chips.push('<span class="chip gray">' + U.esc(it.place) + '</span>');
    if (it.tag) chips.push('<span class="chip">' + U.esc(it.tag) + '</span>');
    if (it.prio === 2) chips.push('<span class="chip warn">紧急</span>');
    if (it.prio === 1) chips.push('<span class="chip warn">重要</span>');
    const note = it.note ? '<div class="ev-note">' + U.esc(it.note) + '</div>' : '';
    const check = isCourse ? '' :
      '<button class="check ' + (it.done ? 'on' : '') + '" data-act="toggle" data-kind="' + (it.kind === 'todo' ? 'todo' : 'event') + '" data-id="' + it.id + '" aria-label="完成">' + ICON.check + '</button>';
    const attrs = isCourse ? 'data-act="noop"' : 'data-act="open" data-kind="' + (it.kind === 'todo' ? 'todo' : 'event') + '" data-id="' + it.id + '"';
    return '<div class="tl-row ' + (it.done ? 'done' : '') + '" data-kind="' + it.kind + '" style="--i:' + i + '">' +
      '<div class="tl-time">' + timeCell + '</div>' +
      '<div class="tl-rail"><i></i></div>' +
      '<div class="ev" ' + attrs + '>' + check +
      '<div class="ev-main"><div class="ev-title">' + U.esc(it.title) + '</div>' +
      (chips.length ? '<div class="ev-meta">' + chips.join('') + '</div>' : '') +
      note + '</div></div></div>';
  }

  /* ---------------- DDL 倒数 ---------------- */
  function ddlCardHTML() {
    const list = Store.ddlsOpen();
    if (!list.length) return '';
    let h = '<div class="sec-title">DDL 倒数 <button class="link" data-act="ddlSheet">管理</button></div>';
    h += '<div class="card ddl-wrap">';
    list.slice(0, 3).forEach((d) => {
      const lb = Store.ddlLabel(d.dueMs);
      const dt = U.toDate(d.date);
      h += '<div class="ddl-row">' +
        '<div class="ddl-badge ' + lb.level + '">' + lb.text + '</div>' +
        '<div class="ddl-main" data-act="ddlOpen" data-id="' + d.id + '"><b>' + U.esc(d.title) + '</b>' +
        '<small>' + (dt.getMonth() + 1) + ' 月 ' + dt.getDate() + ' 日' + (d.time ? ' ' + d.time : '') + (d.tag ? ' · ' + U.esc(d.tag) : '') + '</small></div>' +
        '<button class="check" data-act="ddlDone" data-id="' + d.id + '">' + ICON.check + '</button></div>';
    });
    h += '</div>';
    return h;
  }

  /* ---------------- 专注卡 ---------------- */
  function focusCardHTML() {
    const fs = Store.focusState();
    const mins = Store.focusToday();
    const cnt = S.focus.filter((f) => (f.date || U.ymd(new Date(f.ts))) === U.today()).length;
    if (fs.running || fs.remain > 0) {
      const sec = Math.ceil(fs.remain / 1000);
      const txt = Math.floor(sec / 60) + ':' + U.pad(sec % 60);
      return '<div class="card focus-card" data-act="pomoOpen">' +
        '<div class="focus-dot"></div>' +
        '<div style="flex:1;min-width:0"><div class="focus-title">' + (fs.running ? '专注中' : '已暂停') + (fs.label ? ' · ' + U.esc(fs.label) : '') + '</div>' +
        '<div class="tiny muted">还剩 ' + txt + '，点开继续</div></div>' +
        '<div class="btn-pill ghost">查看</div></div>';
    }
    return '<div class="card focus-card" data-act="pomoOpen">' +
      '<div class="focus-ic">' + ICON.flame + '</div>' +
      '<div style="flex:1;min-width:0"><div class="focus-title">专注</div>' +
      '<div class="tiny muted">今天 ' + mins + ' 分钟' + (cnt ? ' · ' + cnt + ' 节' : ' · 还没开始') + '</div></div>' +
      '<div class="btn-pill">开始</div></div>';
  }

  function pageToday() {
    const t = U.today();
    const items = Store.dayItems(t);
    const s = Store.stats();
    const inbox = S.inbox.filter((m) => !m.done).slice(0, 2);
    const loose = S.todos.filter((x) => !x.done && !x.date).slice(0, 4);
    const overdue = S.todos.filter((x) => !x.done && x.date && x.date < t);
    const d = new Date();
    const dateLine = (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 ' + U.weekCN[d.getDay()] + (weeksLeftText() ? ' · ' + weeksLeftText() : '');
    const nextText = s.next ? ('下一件 · ' + s.next.title + (s.next.start ? ' ' + U.untilText(t, s.next.start) : '')) : (items.length ? '今天的都排完了' : '今天还没有安排');

    let h = '<div class="page">';
    h += '<div class="hero"><div class="hero-top"><div>' +
      '<div class="hi">' + greet() + (S.settings.name ? '，' + U.esc(S.settings.name) : '') + '</div>' +
      '<div class="day">' + (items.length ? (s.done + ' / ' + items.length + ' 已完成') : '空着的一天') + '</div>' +
      '<div class="date">' + dateLine + '</div>' +
      '</div><div class="weather">' + U.esc(nextText) + '</div></div>' +
      '<div class="hero-stats">' +
      '<div class="stat"><b>' + s.timed + '</b><span>定时日程</span></div>' +
      '<div class="stat"><b>' + (S.todos.filter((x) => !x.done).length) + '</b><span>待办</span></div>' +
      '<div class="stat"><b>' + (overdue.length || 0) + '</b><span>逾期</span></div>' +
      '</div><div class="hero-bar"><i style="width:' + s.rate + '%"></i></div></div>';

    h += '<form class="quick" data-act="quick"><input id="quickInput" placeholder="说一句：明天下午三点开会" autocomplete="off"><button class="go" type="submit" aria-label="发送">' + ICON.up + '</button></form>';

    h += ddlCardHTML();

    if (inbox.length) {
      h += '<div class="sec-title">重要消息 <button class="link" data-act="inboxAdd">记一条</button></div>';
      inbox.forEach((m) => {
        h += '<div class="card tight" data-act="inboxOpen" data-id="' + m.id + '" style="border-left:3px solid ' + (m.level === 'high' ? 'var(--danger)' : 'var(--accent)') + '">' +
          '<div style="font-size:13.5px;line-height:1.5">' + U.esc(m.text).slice(0, 160) + '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;margin-top:6px"><span class="chip ' + (m.level === 'high' ? 'warn' : 'gray') + '">' + (m.level === 'high' ? '要处理' : U.esc(m.from || '消息')) + '</span>' +
          '<span class="tiny muted">' + U.relLabel(U.ymd(new Date(m.ts))) + '</span></div></div>';
      });
    }

    h += '<div class="sec-title">今天的安排 <button class="link" data-act="newEvent" data-day="' + t + '">+ 新建</button></div>';
    if (items.length) {
      h += '<div class="timeline">' + items.map(itemHTML).join('') + '</div>';
    } else {
      h += '<div class="card empty"><span class="big">' + ICON.sun + '</span>还没有安排。<br>上面输入一句话，AI 会自己拆好。</div>';
    }

    h += focusCardHTML();

    if (overdue.length) {
      h += '<div class="sec-title">逾期 <span class="tiny" style="color:var(--danger)">' + overdue.length + ' 条</span></div>';
      overdue.slice(0, 5).forEach((td) => {
        h += '<div class="card tight" style="display:flex;gap:10px;align-items:center">' +
          '<button class="check" data-act="toggle" data-kind="todo" data-id="' + td.id + '">' + ICON.check + '</button>' +
          '<div style="flex:1;min-width:0"><div style="font-size:14px">' + U.esc(td.title) + '</div>' +
          '<div class="tiny" style="color:var(--danger)">' + U.relLabel(td.date) + '</div></div>' +
          '<button class="tiny muted" data-act="openTodoDay" data-day="' + td.date + '">去看看</button></div>';
      });
    }

    if (loose.length) {
      h += '<div class="sec-title">收集箱 <span class="tiny muted">没定日子的待办</span></div>';
      h += '<div class="card">';
      loose.forEach((td) => {
        h += '<div style="display:flex;gap:10px;align-items:center;padding:6px 0">' +
          '<button class="check" data-act="toggle" data-kind="todo" data-id="' + td.id + '">' + ICON.check + '</button>' +
          '<span style="flex:1;font-size:14px">' + U.esc(td.title) + '</span>' +
          '<button class="tiny" style="color:var(--accent-ink)" data-act="scheduleTodo" data-id="' + td.id + '">排期</button></div>';
      });
      h += '</div>';
    }

    // 快捷入口预览
    const links = S.links.slice(0, 8);
    if (links.length) {
      h += '<div class="sec-title">快捷入口 <button class="link" data-act="go" data-page="links">全部</button></div>';
      h += '<div class="card">' + linkGrid(links) + '</div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------------- 快捷入口 ---------------- */
  function linkGrid(links, withAdd) {
    let h = '<div class="grid-links">';
    links.forEach((l) => {
      const ico = U.favicon(l.url);
      const bg = l.color ? 'style="background:' + U.esc(l.color) + ';border-color:transparent;color:#fff"' : '';
      h += '<div class="lk" data-act="linkOpen" data-id="' + l.id + '" data-url="' + U.esc(l.url) + '" oncontextmenu="return false">' +
        '<div class="lk-ico" ' + bg + '>' + (ico
          ? '<img src="' + U.esc(ico) + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.parentNode.textContent=\'' + U.esc(U.initials(l.title)) + '\'">'
          : U.esc(U.initials(l.title))) + '</div>' +
        '<div class="lk-name">' + U.esc(l.title) + '</div></div>';
    });
    if (withAdd) h += '<div class="lk add" data-act="linkEdit" data-id=""><div class="lk-ico">' + ICON.plus + '</div><div class="lk-name">添加</div></div>';
    h += '</div>';
    return h;
  }

  function pageLinks() {
    const groups = [];
    const map = {};
    S.links.forEach((l) => {
      const g = l.group || '常用';
      if (!map[g]) { map[g] = []; groups.push(g); }
      map[g].push(l);
    });
    let h = '<div class="page">';
    h += '<div class="head"><div><div class="kick">Shortcuts</div><h1>入口</h1><p class="sub">点一下直达，长按编辑</p></div>' +
      '<div class="head-side"><button class="icon-btn" data-act="linkEdit" data-id="">' + ICON.plus + '</button></div></div>';
    if (!groups.length) {
      h += '<div class="card empty"><span class="big">' + ICON.link + '</span>还没有入口。<br>把常用的教务、网课、图书馆加进来。</div>';
    }
    groups.forEach((g) => {
      h += '<div class="sec-title">' + U.esc(g) + ' <span class="tiny muted">' + map[g].length + '</span></div>';
      h += '<div class="card">' + linkGrid(map[g], false) + '</div>';
    });
    h += '<button class="btn-add" data-act="linkEdit" data-id="">' + ICON.plus + ' 添加入口</button>';
    h += '<button class="btn-add" data-act="linkBulk" style="height:auto;padding:8px;margin:4px 0 0;border:0;font-size:13px;color:var(--text-3);font-weight:500">批量粘贴导入 ›</button>';
    h += '</div>';
    return h;
  }

  /* ---------------- 日历 ---------------- */
  function pageCalendar() {
    if ((st.calMode || 'month') === 'week') return pageTimetable();
    const base = U.toDate(st.calBase);
    const y = base.getFullYear(), m = base.getMonth();
    const first = new Date(y, m, 1);
    const lead = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = lead - 1; i >= 0; i--) cells.push({ d: new Date(y, m - 1, prevDays - i), other: true });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(y, m, i), other: false });
    while (cells.length % 7 !== 0 || cells.length < 35) {
      const last = cells[cells.length - 1].d;
      cells.push({ d: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), other: true });
    }
    const todayStr = U.today();

    let h = '<div class="page">';
    h += '<div class="head"><div><div class="kick">Calendar</div><h1>' + (m + 1) + ' 月</h1>' +
      '<p class="sub">' + y + ' 年 · ' + (weeksLeftText() || ('今天 ' + (new Date().getMonth() + 1) + '/' + new Date().getDate())) + '</p></div>' +
      '<div class="head-side"><button class="icon-btn" data-act="calToday">' + ICON.sun + '</button></div></div>';
    h += '<div class="seg"><button data-act="calMode" data-m="month" class="on">日历</button><button data-act="calMode" data-m="week">课表</button></div>';
    h += '<div class="card">';
    h += '<div class="cal-top"><div class="mon">' + y + ' / ' + U.pad(m + 1) + '</div><div class="cal-nav">' +
      '<button data-act="calPrev">' + ICON.left + '</button><button data-act="calNext">' + ICON.right + '</button></div></div>';
    h += '<div class="cal-grid">' + ['一', '二', '三', '四', '五', '六', '日'].map((w) => '<div class="cal-wd">' + w + '</div>').join('');
    cells.forEach((c) => {
      const ds = U.ymd(c.d);
      const dots = [];
      if (Store.eventsOn(ds).length) dots.push('<i></i>');
      if (Store.todosOn(ds).length) dots.push('<i class="t"></i>');
      if (Store.coursesOn(ds).length) dots.push('<i></i>');
      h += '<div class="cal-cell ' + (c.other ? 'other ' : '') + (ds === todayStr ? 'today ' : '') + (ds === st.sel ? 'sel' : '') + '" data-act="calSelect" data-day="' + ds + '">' +
        c.d.getDate() + (dots.length ? '<div class="dots">' + dots.slice(0, 3).join('') + '</div>' : '') + '</div>';
    });
    h += '</div></div>';

    const items = Store.dayItems(st.sel);
    h += '<div class="sec-title">' + U.relLabel(st.sel) + ' · ' + (U.toDate(st.sel).getMonth() + 1) + '/' + U.toDate(st.sel).getDate() +
      ' <button class="link" data-act="newEvent" data-day="' + st.sel + '">+ 新建</button></div>';
    if (items.length) {
      h += '<div class="card" style="padding:8px 12px"><div class="timeline" style="margin:0">' + items.map(itemHTML).join('') + '</div></div>';
    } else {
      h += '<div class="card empty">这天是空的，留白也挺好。</div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------------- 周课表 ---------------- */
  function pageTimetable() {
    const t = U.today();
    const curMon = U.mondayOf(t);
    const mon = st.viewWeek ? U.mondayOf(st.viewWeek) : curMon;
    const semSet = !!S.settings.semesterStart;
    const wNo = Store.weekNo(mon);
    const curW = Store.weekNo(curMon);
    const days = [];
    for (let i = 0; i < 7; i++) days.push(U.addDays(mon, i));
    const total = days.reduce(function (a, d) { return a + Store.coursesOn(d).length; }, 0);

    let h = '<div class="page">';
    h += '<div class="head"><div><div class="kick">Timetable</div><h1>第 ' + (wNo || '?') + ' 周</h1>' +
      '<p class="sub">' + (U.toDate(mon).getMonth() + 1) + ' 月 ' + U.toDate(mon).getDate() + ' 日 – ' +
      (U.toDate(U.addDays(mon, 6)).getMonth() + 1) + ' 月 ' + U.toDate(U.addDays(mon, 6)).getDate() + ' 日 · ' + total + ' 节课</p></div>' +
      '<div class="head-side"><button class="icon-btn" data-act="calToday">' + ICON.sun + '</button></div></div>';
    h += '<div class="seg"><button data-act="calMode" data-m="month">日历</button><button data-act="calMode" data-m="week" class="on">课表</button></div>';

    h += '<div class="week-nav">' +
      '<button data-act="weekPrev">' + ICON.left + '</button>' +
      '<div class="week-nav-mid">' + (wNo === curW ? '本周' : (wNo ? '第 ' + wNo + ' 周' : '')) + '</div>' +
      '<button data-act="weekNext">' + ICON.right + '</button></div>';

    if (!semSet) {
      h += '<div class="card" style="border-left:3px solid var(--warn)"><div style="font-size:13.5px;line-height:1.6">' +
        '还没设「第 1 周周一」，所以现在所有课每天都显示。填一下就按真实周次过滤了。</div>' +
        '<div class="btn-row"><button class="btn primary" data-act="editSemester">去设置</button></div></div>';
    }

    days.forEach(function (d, i) {
      const list = Store.coursesOn(d);
      const isToday = d === t;
      h += '<div class="tt-day' + (isToday ? ' today' : '') + '">' +
        '<div class="tt-dayhead"><b>周' + '一二三四五六日'[i] + '</b><span>' + (U.toDate(d).getMonth() + 1) + '/' + U.toDate(d).getDate() + '</span>' +
        (isToday ? '<em>今天</em>' : '') + '</div>';
      if (!list.length) {
        h += '<div class="tt-empty">没课</div>';
      } else {
        list.forEach(function (c) {
          h += '<div class="tt-item">' +
            '<div class="tt-time">' + (c.start || '') + '</div>' +
            '<div class="tt-main"><div class="tt-name">' + U.esc(c.title) + '</div>' +
            '<div class="tt-meta">' + U.esc(c.periodText || '') + (c.place ? ' · ' + U.esc(c.place) : '') +
            (c.teacher ? ' · ' + U.esc(c.teacher) : '') + '</div></div></div>';
        });
      }
      h += '</div>';
    });

    const ended = S.courses.filter(function (c) { return Store.courseLastWeek(c) < (curW || 999); });
    if (ended.length) {
      h += '<div class="sec-title">已结课 <span class="tiny muted">' + ended.length + ' 门</span></div>';
      h += '<div class="card tight">';
      ended.forEach(function (c) {
        h += '<div style="display:flex;gap:8px;align-items:center;padding:6px 0;font-size:13px">' +
          '<span class="chip gray">到第 ' + Store.courseLastWeek(c) + ' 周</span>' +
          '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + U.esc(c.name) + '</span></div>';
      });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------------- AI 页 ---------------- */
  function pageAI() {
    let h = '<div class="page">';
    h += '<div class="head"><div><div class="kick">Assistant</div><h1>交给 AI</h1>' +
      '<p class="sub">' + (AI.ready() ? '已接入 ' + U.esc(S.settings.model || 'deepseek-chat') : '还没填 Key，先用本地解析顶着') + '</p></div>' +
      '<div class="head-side"><button class="icon-btn" data-act="openAI">' + ICON.gear + '</button></div></div>';

    // 1. 说一句
    h += '<div class="card">';
    h += '<div class="ai-box"><textarea id="aiInput" placeholder="把脑子里的东西倒出来：\n· 周三晚上七点 组会，带电脑\n· 周五前交大学物理实验预习报告\n· 12 月 20 号 英语四级，记得报">' +
      (st.ai.input || '') + '</textarea></div>';
    h += '<div class="ai-hint">' +
      ['明天下午三点去图书馆还书', '下周一交高数作业', '这周五 18:30 社团例会 二教 203', '把这段话拆成待办：买台灯、寄快递、补交材料'].map((x) => '<button class="tag-btn" data-act="fillAI" data-text="' + U.esc(x) + '">' + U.esc(x) + '</button>').join('') +
      '</div>';
    h += '<div class="btn-row"><button class="btn primary" data-act="aiParse">' + ICON.spark + ' 整理成日程</button></div>';
    h += '</div>';

    if (st.ai.last) h += draftHTML(st.ai.last);

    // 2. 相册
    h += '<div class="sec-title">相册 · 截图整理 <span class="tiny muted">课表 / 通知 / 作业截图</span></div>';
    h += '<div class="card">';
    h += '<div class="drop" data-act="pickImg"><span class="ic-big">' + ICON.img + '</span>从相册选截图，AI 读出内容并分类<br><span class="tiny">支持一次多张 · 只在本机压缩后发送</span></div>';
    h += '<input id="imgInput" type="file" accept="image/*" multiple style="display:none">';
    if (st.ai.imgs.length) {
      h += '<div class="thumbs">' + st.ai.imgs.map((x, i) => '<div class="thumb"><img src="' + x + '"><b data-act="dropImg" data-i="' + i + '">×</b></div>').join('') + '</div>';
      h += '<div class="btn-row"><button class="btn primary" data-act="aiVision">' + (st.ai.visionBusy ? '<span class="spin"></span>' : ICON.spark) + ' 读图并整理</button>' +
        '<button class="btn" data-act="clearImg">清空</button></div>';
    } else {
      h += '<div class="tiny muted" style="margin-top:10px;line-height:1.6">' +
        (AI.visionReady() ? '当前视觉模型：' + U.esc(S.settings.visionModel || '') : '未配置视觉模型，可用「长按图片 → 提取文字 → 粘贴到上面的框」的方式变通') + '</div>';
    }
    h += '</div>';

    // 3. 简报
    h += '<div class="sec-title">今日简报</div>';
    h += '<div class="card">';
    if (st.ai.brief) {
      h += '<div style="font-size:14.5px;line-height:1.72;white-space:pre-wrap">' + U.esc(st.ai.brief) + '</div>';
      h += '<div class="btn-row"><button class="btn ghost" data-act="aiBrief">' + ICON.spark + ' 再说一次</button></div>';
    } else {
      h += '<div class="muted tiny" style="margin-bottom:12px;line-height:1.6">让 AI 看一眼今天的安排，给一句「先干什么、注意什么」。</div>';
      h += '<button class="btn primary block" data-act="aiBrief">' + (st.ai.briefBusy ? '<span class="spin"></span> 正在读你的日程' : ICON.spark + ' 生成今日简报') + '</button>';
    }
    h += '</div>';

    // 4. 一周复盘
    h += '<div class="sec-title">一周复盘 <button class="link" data-act="reviewHistory">历史</button></div>';
    h += '<div class="card">';
    if (st.ai.reviewBusy) {
      h += '<div class="sk sk-line" style="width:92%"></div><div class="sk sk-line" style="width:100%"></div><div class="sk sk-line" style="width:78%"></div><div class="sk sk-line" style="width:86%"></div>';
    } else if (S.reviews.length) {
      const r = S.reviews[0];
      h += '<div class="review-meta">' + U.esc(r.range || '') + ' · ' + U.relLabel(U.ymd(new Date(r.ts))) + '</div>';
      h += '<div class="review-text">' + U.esc(r.text) + '</div>';
      h += '<div class="btn-row"><button class="btn" data-act="aiReview">' + ICON.spark + ' 再复盘一次</button></div>';
    } else {
      h += '<div class="muted tiny" style="line-height:1.6">让 AI 看这一周的完成情况、逾期、专注时长，写一段真正对着你说话的复盘——不是统计表，是有人盯着你的那种。</div>';
      h += '<button class="btn primary block" style="margin-top:13px" data-act="aiReview">生成这周复盘</button>';
    }
    h += '</div>';

    // 5. 课表
    h += '<div class="sec-title">课表</div>';
    h += '<div class="list"><div class="row tap" data-act="courseImport"><div class="ic" style="background:linear-gradient(135deg,#3B6CFF,#8B5CF6)">' + ICON.book + '</div>' +
      '<div class="lbl">导入课程表<small>粘贴教务系统文本，AI 排成每周课表</small></div>' + ARW + '</div></div>';

    if (S.courses.length) {
      h += '<div class="sec-title">已导入 ' + S.courses.length + ' 门</div><div class="card tight">';
      S.courses.slice(0, 12).forEach((c) => {
        h += '<div style="display:flex;gap:8px;align-items:center;padding:6px 0;font-size:13.5px">' +
          '<span class="chip purple">周' + '一二三四五六日'[c.day - 1] + '</span>' +
          '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + U.esc(c.name) + '</span>' +
          '<span class="tiny muted">' + (c.periods || []).join(',') + ' 节</span>' +
          '<button class="tiny" style="color:var(--danger)" data-act="courseDel" data-id="' + c.id + '">删除</button></div>';
      });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  function draftHTML(d) {
    const rows = [];
    (d.events || []).forEach((e, i) => rows.push({
      key: 'e' + i, type: '日程', t: e.title,
      meta: [e.date === U.today() ? '今天' : U.relLabel(e.date), e.start ? e.start + (e.end ? '–' + e.end : '') : '全天', e.place, e.tag].filter(Boolean).join(' · ')
    }));
    (d.todos || []).forEach((t, i) => rows.push({
      key: 't' + i, type: '待办', t: t.title,
      meta: [t.date ? U.relLabel(t.date) : '未排期', t.prio ? '重要' : '', t.tag].filter(Boolean).join(' · ')
    }));
    (d.inbox || []).forEach((m, i) => rows.push({
      key: 'i' + i, type: '消息', t: m.text, meta: (m.level === 'high' ? '要处理' : '记录') + (m.from ? ' · ' + m.from : '')
    }));
    let h = '<div class="card" style="border:1px solid var(--accent)">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
      '<span class="chip">' + (d.reply || '整理好了') + '</span></div>';
    if (!rows.length) {
      h += '<div class="muted tiny">没从里面挑出可执行的条目。换个说法，或写得具体一点。</div>';
    }
    rows.forEach((r) => {
      h += '<div class="draft"><h4><span class="chip ' + (r.type === '日程' ? '' : r.type === '待办' ? 'warn' : 'gray') + '">' + r.type + '</span>' + U.esc(r.t) + '</h4>' +
        '<p>' + U.esc(r.meta) + '</p></div>';
    });
    if (rows.length) {
      h += '<div class="btn-row"><button class="btn primary" data-act="commitDraft">全部加入</button><button class="btn ghost" data-act="dropDraft">不要</button></div>';
    } else {
      h += '<div class="btn-row"><button class="btn" data-act="dropDraft">知道了</button></div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------------- 我的 ---------------- */
  function pageMe() {
    const s = S.settings;
    const w = weeksLeftText();
    let h = '<div class="page">';
    h += '<div class="head"><div><div class="kick">Me</div><h1>我的</h1><p class="sub">' + U.esc(s.school || '') + (w ? ' · ' + w : '') + '</p></div></div>';

    h += '<div class="list">';
    h += row('user', 'linear-gradient(135deg,#3B6CFF,#8B5CF6)', '称呼', s.name || '设置一下', 'editName');
    h += row('cal', 'linear-gradient(135deg,#0EA5E9,#22D3EE)', '学期开始（第 1 周周一）', s.semesterStart || '未设置', 'editSemester');
    h += '</div>';

    h += '<div class="sec-title">AI 接口</div>';
    h += '<div class="list">';
    h += row('spark', 'linear-gradient(135deg,#4D6BFE,#7C3AED)', 'DeepSeek API Key', s.apiKey ? '已填写 ····' + String(s.apiKey).slice(-4) : '未填写', 'openAI');
    h += row('gear', 'linear-gradient(135deg,#64748B,#94A3B8)', '模型 / 代理 / 视觉模型', s.model || 'deepseek-chat', 'openAI');
    h += '</div>';

    h += '<div class="sec-title">课程</div>';
    h += '<div class="list">';
    h += row('book', 'linear-gradient(135deg,#8B5CF6,#EC4899)', '课程表', S.courses.length ? S.courses.length + ' 门' : '未导入', 'courseImport');
    h += row('clock', 'linear-gradient(135deg,#F59E0B,#F97316)', '上课节次时间', '可自定义', 'editPeriods');
    h += '</div>';

    const g = Store.gpa();
    const target = parseFloat(S.settings.targetGpa) || 0;
    h += '<div class="sec-title">成绩 <button class="link" data-act="gradeSheet">管理</button></div>';
    h += '<div class="card gpa-card" data-act="gradeSheet"><div class="gpa-big"><b style="' + (g.graded ? '' : 'color:var(--text-3)') + '">' + g.gpa.toFixed(2) + '</b><span>加权 GPA</span></div>' +
      '<div class="gpa-side"><div><b>' + (g.credits || 0) + '</b><span>学分</span></div><div><b>' + (target ? target.toFixed(1) : '—') + '</b><span>目标</span></div></div>' +
      '<div class="gpa-bar"><i style="width:' + Math.min(100, Math.round((g.gpa || 0) / 4 * 100)) + '%"></i></div>' +
      '<div class="tiny muted" style="margin-top:8px">' + (g.graded ? ('已录 ' + g.graded + ' 门' + (target ? ' · ' + (g.gpa >= target ? '已达标' : '还差 ' + (target - g.gpa).toFixed(2)) : '')) : '还没录成绩，点进来加几门') + '</div></div>';

    h += '<div class="sec-title">目标 <button class="link" data-act="goalAdd">+ 加一条</button></div>';
    h += '<div class="list">';
    if (!S.goals.length) {
      h += '<div class="row"><div class="lbl muted">还没有目标。比如「大一上 GPA 3.7+」。</div></div>';
    }
    S.goals.forEach((g) => {
      h += '<div class="row"><button class="check ' + (g.done ? 'on' : '') + '" data-act="goalToggle" data-id="' + g.id + '">' + ICON.check + '</button>' +
        '<div class="lbl" style="' + (g.done ? 'text-decoration:line-through;color:var(--text-3)' : '') + '">' + U.esc(g.title) +
        (g.type ? '<small>' + U.esc(g.type) + (g.due ? ' · ' + U.relLabel(g.due) : '') + '</small>' : '') + '</div>' +
        '<button class="tiny" style="color:var(--text-3);padding:4px 2px" data-act="goalDel" data-id="' + g.id + '">' + ICON.x + '</button></div>';
    });
    h += '</div>';

    h += '<div class="card tiny muted center" style="line-height:1.7">数据只存在这台手机上 · API Key 也只在本地<br>备份、外观、安装包这些去「维护」页</div>';
    h += '</div>';
    return h;
  }

  /* ---------------- 维护 ---------------- */
  function pageMaint() {
    const size = Math.round(new Blob([JSON.stringify(S)]).size / 1024);
    const errs = window.__errs || [];
    const total = S.events.length + S.todos.length + S.courses.length + S.links.length +
      S.ddls.length + S.grades.length + S.focus.length + S.inbox.length + S.goals.length;
    const t = U.today();
    const since = S.settings.firstOpen ? U.relLabel(U.ymd(new Date(S.settings.firstOpen))) : '今天';

    let h = '<div class="page">';
    h += '<div class="head"><div><div class="kick">Maintenance</div><h1>维护</h1>' +
      '<p class="sub">只有你自己会看到这一页</p></div>' +
      '</div>';

    h += '<div class="card mh-card">' +
      '<div class="mh"><b>v' + APP_VERSION + '</b><span>版本</span></div>' +
      '<div class="mh"><b>' + size + '<i>KB</i></b><span>数据占用</span></div>' +
      '<div class="mh"><b>' + total + '</b><span>条目</span></div>' +
      '</div>';

    h += '<div class="sec-title">数据</div><div class="list">';
    h += row('down', 'linear-gradient(135deg,#10B981,#14B8A6)', '导出到系统日历（.ics）', '含 DDL 提醒', 'exportICS');
    h += row('down', 'linear-gradient(135deg,#0EA5E9,#3B82F6)', '备份全部数据（.json）', size + ' KB', 'exportJSON');
    h += row('up', 'linear-gradient(135deg,#6366F1,#8B5CF6)', '从备份恢复', '', 'importJSON');
    h += row('trash', 'linear-gradient(135deg,#EF4444,#F97316)', '清空所有数据', '不可撤销', 'resetAll');
    h += '</div>';

    h += '<div class="sec-title">诊断</div><div class="list">';
    h += row('bell', 'linear-gradient(135deg,#64748B,#94A3B8)', '运行日志', errs.length ? errs.length + ' 条' : '无错误', 'errLog');
    h += row('chart', 'linear-gradient(135deg,#8B5CF6,#EC4899)', '本地存储配额', '点一下查', 'storageInfo');
    h += row('spark', 'linear-gradient(135deg,#4D6BFE,#7C3AED)', 'AI 对话测试', S.settings.apiKey ? U.esc(S.settings.model || '') : '未填 Key', 'aiTestQuick');
    h += row('img', 'linear-gradient(135deg,#0EA5E9,#22D3EE)', '视觉模型（读图）',
      (S.settings.visionKey || S.settings.apiKey) ? U.esc(S.settings.visionModel || '已配置') : '未配置', 'openAI');
    h += '</div>';

    h += '<div class="sec-title">环境</div><div class="list">';
    h += '<div class="row"><div class="ic" style="background:linear-gradient(135deg,#0EA5E9,#22D3EE)">' + ICON.gear + '</div>' +
      '<div class="lbl">运行方式<small>' + (isNative() ? '原生 App（Capacitor）' : '浏览器 / PWA') + '</small></div>' +
      '<div class="val">' + (isNative() ? 'iOS 原生' : '网页') + '</div></div>';
    h += '<div class="row"><div class="ic" style="background:linear-gradient(135deg,#F59E0B,#F97316)">' + ICON.cal + '</div>' +
      '<div class="lbl">今天是<small>' + U.relLabel(t) + '</small></div><div class="val">' + t + '</div></div>';
    h += '</div>';

    if (!isNative()) {
      h += '<div class="sec-title">装到手机上 <span class="tiny muted">图标 / 全屏 / 离线</span></div>';
      h += '<div class="list">' +
        row('down', 'linear-gradient(135deg,#3B6CFF,#8B5CF6)', '安装包（.mobileconfig）', '桌面图标', 'openInstall') +
        '</div>';
    }

    h += '<div class="sec-title">外观</div><div class="list"><div class="row"><div class="lbl">主题<small>' +
      (S.settings.theme === 'auto' ? '跟随系统' : S.settings.theme === 'dark' ? '深色' : '浅色') + '</small></div>' +
      '<div class="pill-row" style="padding:0;gap:5px">' + ['auto', 'light', 'dark'].map((x) => '<button class="tag-btn" data-act="theme" data-t="' + x + '" style="' + (S.settings.theme === x ? 'background:var(--accent);color:#fff;border-color:transparent' : '') + '">' + ({ auto: '自动', light: '浅', dark: '深' })[x] + '</button>').join('') + '</div></div></div>';

    h += '<div class="sec-title">更新与重置</div><div class="list">';
    h += row('down', 'linear-gradient(135deg,#3B6CFF,#8B5CF6)', '强制刷新', '清缓存重载', 'hardReload');
    h += '</div>';

    h += '<div class="card tiny muted center" style="line-height:1.75">序时 v' + APP_VERSION + ' · 单机版<br>没有账号、没有云、没有服务器，只有这台手机</div>';
    h += '</div>';
    return h;
  }

  function row(icon, grad, label, val, act) {
    return '<div class="row tap" data-act="' + act + '"><div class="ic" style="background:' + grad + '">' + ICON[icon] + '</div>' +
      '<div class="lbl">' + U.esc(label) + '</div><div class="val">' + U.esc(val) + '</div>' + ARW + '</div>';
  }

  /* ---------------- 渲染 ---------------- */
  const PAGES = { today: pageToday, calendar: pageCalendar, ai: pageAI, links: pageLinks, me: pageMe, maint: pageMaint };
  const TABS = [
    { k: 'today', t: '今天', i: 'sun' },
    { k: 'calendar', t: '日历', i: 'cal' },
    { k: 'ai', t: 'AI', i: 'spark' },
    { k: 'links', t: '入口', i: 'grid' },
    { k: 'me', t: '我的', i: 'user' },
    { k: 'maint', t: '维护', i: 'wrench' }
  ];

  function renderTab() {
    tabbar.innerHTML = TABS.map((tb) => '<button data-act="go" data-page="' + tb.k + '" class="' + (st.page === tb.k ? 'on' : '') + '">' +
      ICON[tb.i] + '<span>' + tb.t + '</span></button>').join('');
  }

  let renderTimer = 0, renderScroll = false;
  function render(keepScroll) {
    renderScroll = !!keepScroll;
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      renderTimer = 0;
      const top = view.scrollTop;
      renderTab();
      view.dataset.page = st.page;
      view.innerHTML = (PAGES[st.page] || pageToday)();
      view.scrollTop = renderScroll ? top : 0;
    }, 0);
  }
  window.render = render;

  /* ---------------- 时间轴 / 日历交互 ---------------- */
  function openLinkEdit(id) {
    const l = id ? S.links.find((x) => x.id === id) : { title: '', url: '', group: '常用', color: '' };
    if (!l) return;
    let h2 = '<h2>' + (id ? '编辑入口' : '添加入口') + '</h2>';
    h2 += '<form id="linkForm" data-id="' + (id || '') + '">';
    h2 += '<div class="field"><label>名称</label><input name="title" value="' + U.esc(l.title) + '" placeholder="教务处"></div>';
    h2 += '<div class="field"><label>网址</label><input name="url" value="' + U.esc(l.url) + '" placeholder="https://jwc.uestc.edu.cn" inputmode="url" spellcheck="false"></div>';
    h2 += '<div class="field"><label>分组</label><input name="group" value="' + U.esc(l.group || '常用') + '" placeholder="校园 / 常用 / 学习"></div>';
    h2 += '<div class="field"><label>App 链接（可选）</label><input name="scheme" value="' + U.esc(l.scheme || guessScheme(l.url || '')) + '" placeholder="bilibili://" spellcheck="false" autocapitalize="off"><div class="hint">填了就优先唤起手机上的 App，打不开再回到网页。常见 App 会自动猜。</div></div>';
    h2 += '<div class="btn-row"><button class="btn primary" type="submit">保存</button></div>';
    if (id) h2 += '<button class="btn block ghost danger" type="button" style="margin-top:10px" data-act="linkDel" data-id="' + id + '">删除</button>';
    h2 += '</form>';
    openSheet(h2);

    // 输入网址时自动补 App 链接
    const urlInp = sheetEl.querySelector('[name="url"]');
    const schInp = sheetEl.querySelector('[name="scheme"]');
    if (urlInp && schInp) {
      urlInp.addEventListener('input', function () {
        if (schInp.value.trim()) return;
        const g = guessScheme(urlInp.value);
        if (g) schInp.value = g;
      });
    }
  }

  function launchScheme(scheme, fallback) {
    let jumped = false;
    const onVis = () => { if (document.hidden) jumped = true; };
    document.addEventListener('visibilitychange', onVis);
    const a = document.createElement('a');
    a.href = scheme;
    a.rel = 'noopener';
    document.body.appendChild(a);
    try { a.click(); } catch (e) {}
    setTimeout(() => {
      document.removeEventListener('visibilitychange', onVis);
      a.remove();
      if (!jumped && !document.hidden && fallback) openExternal(fallback);
    }, 2000);
  }

  function openExternal(url) {
    const cap = window.Capacitor;
    if (cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.Browser) {
      cap.Plugins.Browser.open({ url: url }).catch(() => { window.location.href = url; });
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 500);
  }

  function go(page) {
    st.page = page;
    try { history.replaceState(null, '', '#' + page); } catch (e) {}
    render();
  }

  function openItemForm(kind, id, day) {
    let item = null;
    if (id) item = (kind === 'todo' ? S.todos : S.events).find((x) => x.id === id);
    const isTodo = kind === 'todo';
    const d = Object.assign(isTodo
      ? { title: '', date: day || '', prio: 0, tag: '' }
      : { title: '', date: day || U.today(), start: '', end: '', place: '', note: '', tag: '' }, item || {});
    let h = '<h2>' + (id ? '编辑' : isTodo ? '新待办' : '新日程') + '</h2><p class="sh-sub">' + (isTodo ? '没有确定时间的，先记在待办里' : '时间地点填清楚，导出到系统日历还能弹提醒') + '</p>';
    h += '<form id="itemForm" data-kind="' + kind + '" data-id="' + (id || '') + '">';
    h += '<div class="field"><label>做什么</label><input name="title" value="' + U.esc(d.title) + '" placeholder="比如：电路实验报告" autocomplete="off"></div>';
    h += '<div class="field"><label>日期</label><input type="date" name="date" value="' + U.esc(d.date || '') + '"></div>';
    if (!isTodo) {
      h += '<div style="display:flex;gap:10px"><div class="field" style="flex:1"><label>开始</label><input type="time" name="start" value="' + U.esc(d.start || '') + '"></div>' +
        '<div class="field" style="flex:1"><label>结束</label><input type="time" name="end" value="' + U.esc(d.end || '') + '"></div></div>';
      h += '<div class="field"><label>地点</label><input name="place" value="' + U.esc(d.place || '') + '" placeholder="品学楼 A203"></div>';
    } else {
      h += '<div class="field"><label>优先级</label><select name="prio"><option value="0"' + (d.prio === 0 ? ' selected' : '') + '>普通</option><option value="1"' + (d.prio === 1 ? ' selected' : '') + '>重要</option><option value="2"' + (d.prio === 2 ? ' selected' : '') + '>紧急</option></select></div>';
    }
    h += '<div class="field"><label>标签</label><select name="tag"><option value="">不标</option>' + TAGS.map((t) => '<option' + (d.tag === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>';
    if (!isTodo) h += '<div class="field"><label>备注</label><textarea name="note" placeholder="要带的东西、要点、链接…">' + U.esc(d.note || '') + '</textarea></div>';
    h += '<div class="btn-row sticky-actions"><button class="btn primary" type="submit">保存</button></div>';
    if (id) h += '<button class="btn block ghost danger" type="button" style="margin-top:10px" data-act="delItem" data-kind="' + kind + '" data-id="' + id + '">删除</button>';
    h += '</form>';
    openSheet(h);
  }

  /* ---------------- 设置：AI ---------------- */
  function sheetAI() {
    const s = S.settings;
    let h = '<h2>AI 接口</h2><p class="sh-sub">默认走 DeepSeek 官方接口。国内直连若被跨域拦住，把 Worker 代理地址填进来即可。</p>';
    h += '<div class="field"><label>API Key</label><input name="apiKey" value="' + U.esc(s.apiKey) + '" placeholder="sk-..." autocomplete="off" spellcheck="false"></div>';
    h += '<div class="field"><label>接口地址</label><input name="apiBase" value="' + U.esc(s.apiBase) + '" placeholder="https://api.deepseek.com" spellcheck="false"><div class="hint">任何 OpenAI 兼容端点都行：https://api.deepseek.com、https://api.moonshot.cn/v1、自建 Ollama…</div></div>';
    h += '<div class="field"><label>模型</label><input name="model" value="' + U.esc(s.model) + '" placeholder="deepseek-chat"></div>';
    h += '<div class="field"><label>代理地址（可选）</label><input name="proxyBase" value="' + U.esc(s.proxyBase) + '" placeholder="https://xxx.workers.dev/proxy" spellcheck="false"><div class="hint">部署 worker/worker.js 后填它的 URL，用来绕过浏览器跨域限制。</div></div>';
    h += '<div class="hr"></div>';
    h += '<div class="row" style="padding:0 0 12px;border:0"><div class="lbl" style="font-size:14px">深度思考<small>课表、复杂文本走 deepseek-reasoner，慢 20–60 秒但更准</small></div>' +
      '<div class="switch ' + (s.reasoning ? 'on' : '') + '" data-act="toggleReasoning"><i></i></div></div>';
    h += '<div class="field"><label>视觉模型（相册读图用）</label><input name="visionModel" value="' + U.esc(s.visionModel) + '" placeholder="glm-4v-flash"></div>';
    h += '<div class="field"><label>视觉接口地址</label><input name="visionBase" value="' + U.esc(s.visionBase) + '" placeholder="https://open.bigmodel.cn/api/paas/v4" spellcheck="false"></div>';
    h += '<div class="field"><label>视觉模型 Key</label><input name="visionKey" value="' + U.esc(s.visionKey) + '" placeholder="留空则复用上面的 Key" autocomplete="off" spellcheck="false"><div class="hint">DeepSeek 目前没有图片理解，读图需要另配一个视觉模型（智谱 glm-4v-flash 免费、通义 qwen-vl 等，都兼容这个格式）。</div></div>';
    h += '<div class="btn-row"><button class="btn primary" data-act="saveAI">保存</button><button class="btn" data-act="testAI">测试对话</button></div>';
    h += '<button class="btn block ghost" style="margin-top:9px;font-size:13.5px" data-act="testVisionModel">测试视觉模型（相册读图）</button>';
    h += '<div class="tiny muted" style="margin:8px 2px 0;line-height:1.6">视觉模型走的是另一套接口，和上面的对话模型互不影响。千问填：<code style="font-size:11px">https://dashscope.aliyuncs.com/compatible-mode/v1</code> + <code style="font-size:11px">qwen3-vl-plus</code></div>';
    openSheet(h);
  }

  /* ---------------- DDL 管理 ---------------- */
  function sheetDDL() {
    const list = S.ddls.slice().sort((a, b) => Store.ddlDue(a) - Store.ddlDue(b));
    let h = '<h2>DDL 倒数</h2><p class="sh-sub">作业、报名、考试这类硬截止单独倒数，导出日历时会提前一天和两小时各提醒一次</p>';
    h += '<div class="list">';
    if (!list.length) h += '<div class="row"><div class="lbl muted">还没有 DDL，加一个吧</div></div>';
    list.forEach((d) => {
      const lb = Store.ddlLabel(Store.ddlDue(d));
      const dt = U.toDate(d.date);
      h += '<div class="row tap" data-act="ddlOpen" data-id="' + d.id + '">' +
        '<div class="ddl-badge ' + lb.level + '" style="min-width:54px">' + lb.text + '</div>' +
        '<div class="lbl" style="' + (d.done ? 'text-decoration:line-through;color:var(--text-3)' : '') + '">' + U.esc(d.title) +
        '<small>' + (dt.getMonth() + 1) + ' 月 ' + dt.getDate() + ' 日' + (d.time ? ' ' + d.time : '') + (d.tag ? ' · ' + U.esc(d.tag) : '') + '</small></div>' +
        '<button class="tiny" style="color:var(--text-3);padding:4px 2px" data-act="ddlDel" data-id="' + d.id + '">' + ICON.x + '</button></div>';
    });
    h += '</div>';
    h += '<button class="btn-add" data-act="ddlAdd" style="margin-top:10px">' + ICON.plus + ' 加一个 DDL</button>';
    openSheet(h);
  }

  function sheetDDLForm(id) {
    const d = (id && S.ddls.find((x) => x.id === id)) || { title: '', date: U.addDays(U.today(), 7), time: '', note: '', tag: '' };
    let h = '<h2>' + (id ? '编辑 DDL' : '新 DDL') + '</h2><p class="sh-sub">到点就欠着，提前知道才不慌</p>';
    h += '<form id="ddlForm" data-id="' + (id || '') + '">';
    h += '<div class="field"><label>什么事</label><input name="title" value="' + U.esc(d.title) + '" placeholder="大物实验报告提交"></div>';
    h += '<div style="display:flex;gap:10px"><div class="field" style="flex:1.4"><label>截止日期</label><input type="date" name="date" value="' + U.esc(d.date || '') + '"></div>' +
      '<div class="field" style="flex:1"><label>时间（可空）</label><input type="time" name="time" value="' + U.esc(d.time || '') + '"></div></div>';
    h += '<div class="field"><label>标签</label><select name="tag"><option value="">不标</option>' + TAGS.map((t) => '<option' + (d.tag === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>';
    h += '<div class="field"><label>备注</label><textarea name="note" placeholder="提交到哪里、要带什么">' + U.esc(d.note || '') + '</textarea></div>';
    h += '<div class="btn-row sticky-actions"><button class="btn primary" type="submit">保存</button></div>';
    if (id) h += '<button class="btn block ghost danger" type="button" style="margin-top:10px" data-act="ddlDel" data-id="' + id + '">删除</button>';
    h += '</form>';
    openSheet(h);
  }

  /* ---------------- 成绩 / GPA ---------------- */
  function sheetGrade() {
    const g = Store.gpa();
    let h = '<h2>成绩 / GPA</h2>';
    h += '<div class="gpa-hero"><div><b>' + (g.graded ? g.gpa.toFixed(2) : '—') + '</b><span>加权 GPA</span></div>' +
      '<div><b>' + (g.credits || 0) + '</b><span>已修学分</span></div><div><b>' + g.graded + '</b><span>门课</span></div></div>';
    h += '<div class="field"><label>目标 GPA</label><div style="display:flex;gap:9px"><input id="targetGpaInput" style="flex:1" value="' + U.esc(S.settings.targetGpa || '') + '" inputmode="decimal" placeholder="3.7">' +
      '<button class="btn primary" style="height:46px;padding:0 16px" data-act="gradeSaveTarget">保存</button></div><div class="hint">填了就会显示还差多少</div></div>';
    h += '<div class="row" style="padding:0 0 12px;border:0"><div class="lbl" style="font-size:13px">绩点算法</div><div class="pill-row" style="padding:0">' +
      [['level', '分段'], ['linear', '线性']].map(([k, label]) => '<button class="tag-btn" data-act="gpaMode" data-mode="' + k + '" style="' + (g.mode === k ? 'background:var(--accent);color:#fff;border-color:transparent' : '') + '">' + label + '</button>').join('') +
      '</div></div>';
    h += '<div class="list">';
    if (!S.grades.length) h += '<div class="row"><div class="lbl muted">还没录成绩</div></div>';
    S.grades.forEach((x) => {
      const p = Store.gpaPoint(x.score, g.mode);
      h += '<div class="row"><div class="lbl">' + U.esc(x.name) +
        '<small>' + (x.credit || '?') + ' 学分' + (x.term ? ' · ' + U.esc(x.term) : '') + (x.type ? ' · ' + U.esc(x.type) : '') + '</small></div>' +
        '<div class="val" style="font-weight:600;color:' + (parseFloat(x.score) >= 60 ? 'var(--text)' : 'var(--danger)') + '">' + U.esc(x.score) + '</div>' +
        '<span class="chip' + (p >= 3.7 ? ' ok' : p >= 2.5 ? '' : ' gray') + '">' + p.toFixed(1) + '</span>' +
        '<button class="tiny" style="color:var(--text-3);padding:4px 2px" data-act="gradeDel" data-id="' + x.id + '">' + ICON.x + '</button></div>';
    });
    h += '</div>';
    h += '<button class="btn-add" data-act="gradeAdd" style="margin-top:10px">' + ICON.plus + ' 添加一门成绩</button>';
    h += '<div class="tiny muted" style="line-height:1.65;margin-top:6px">分段：90+=4.0、85+=3.7、82+=3.3、78+=3.0、75+=2.7、72+=2.3、68+=2.0、64+=1.5、60+=1.0；线性：(分数−50)/10，上限 4.0。各校细则不同，按教务处的来选。</div>';
    openSheet(h);
  }

  function sheetGradeForm() {
    let h = '<h2>添加一门成绩</h2>';
    h += '<form id="gradeForm">';
    h += '<div class="field"><label>课程</label><input name="name" placeholder="高等数学 A"></div>';
    h += '<div style="display:flex;gap:10px"><div class="field" style="flex:1"><label>学分</label><input name="credit" inputmode="decimal" placeholder="4"></div>' +
      '<div class="field" style="flex:1"><label>分数</label><input name="score" inputmode="decimal" placeholder="88"></div></div>';
    h += '<div class="field"><label>类型</label><select name="type"><option>必修</option><option>选修</option><option>通识</option></select></div>';
    h += '<div class="field"><label>学期</label><input name="term" placeholder="2026-2027-1"></div>';
    h += '<div class="btn-row sticky-actions"><button class="btn primary" type="submit">加上</button></div></form>';
    openSheet(h);
  }

  /* ---------------- 复盘 ---------------- */
  function reviewRange() {
    const t = U.today();
    const from = U.addDays(U.mondayOf(t), -7);
    return { from, to: U.addDays(from, 6) };
  }

  function reviewContext() {
    const { from, to } = reviewRange();
    const inR = (d) => d && d >= from && d <= to;
    const doneEv = S.events.filter((e) => e.done && inR(e.date));
    const openEv = S.events.filter((e) => !e.done && inR(e.date));
    const doneTodo = S.todos.filter((x) => x.done && inR(x.date));
    const openTodo = S.todos.filter((x) => !x.done && inR(x.date));
    const over = S.todos.filter((x) => !x.done && x.date && x.date < U.today());
    const focusList = S.focus.filter((f) => inR(f.date || U.ymd(new Date(f.ts))));
    const focusMin = focusList.reduce((a, b) => a + (b.minutes || 0), 0);
    const line = (arr, map) => arr.slice(0, 12).map(map).join('\n') || '（无）';
    const fmt = (x) => '- ' + (x.date ? x.date + ' ' : '') + (x.start ? x.start + ' ' : '') + x.title + (x.place ? ' @' + x.place : '') + (x.tag ? ' [' + x.tag + ']' : '');
    return '统计周期：' + from + ' 至 ' + to + '\n' +
      '本周课程门数：' + S.courses.length + '\n' +
      '专注记录：' + focusList.length + ' 节，共 ' + focusMin + ' 分钟\n\n' +
      '【做完的事】\n' + line(doneEv.concat(doneTodo), fmt) + '\n\n' +
      '【没做完的日程/待办】\n' + line(openEv.concat(openTodo), fmt) + '\n\n' +
      '【逾期未处理】\n' + line(over, fmt) + '\n\n' +
      '【进行中的 DDL】\n' + line(Store.ddlsOpen(), (d) => '- ' + d.title + ' 截止 ' + d.date) + '\n\n' +
      '【最近发的消息类记录】\n' + line(S.inbox.filter((m) => !m.done), (m) => '- ' + String(m.text).slice(0, 50));
  }

  async function runReview() {
    if (!AI.ready()) { toast('先去「我的」填 API Key'); return; }
    st.ai.reviewBusy = true;
    render(true);
    try {
      const text = await AI.review(reviewContext());
      const { from, to } = reviewRange();
      S.reviews.unshift({ id: U.uid(), ts: Date.now(), text, range: from.slice(5) + ' ~ ' + to.slice(5) });
      if (S.reviews.length > 30) S.reviews.length = 30;
      Store.save();
      toast('复盘好了');
    } catch (err) {
      toast(String(err.message || err).slice(0, 100), 4200);
    } finally {
      st.ai.reviewBusy = false;
      render(true);
    }
  }

  function sheetReviews() {
    let h = '<h2>复盘记录</h2><p class="sh-sub">每周一段，连着看能看出自己的节奏</p>';
    if (!S.reviews.length) {
      h += '<div class="card empty">还没有复盘。回到「交给 AI」生成第一份。</div>';
    }
    S.reviews.forEach((r) => {
      h += '<div class="card"><div class="review-meta">' + U.esc(r.range || '') + ' · ' + U.relLabel(U.ymd(new Date(r.ts))) + '</div>' +
        '<div class="review-text">' + U.esc(r.text) + '</div></div>';
    });
    openSheet(h);
  }

  /* ---------------- 番茄钟 ---------------- */
  const POMO_R = 88;
  const POMO_C = 2 * Math.PI * POMO_R;

  function pomoRing(fs, idle) {
    const off = POMO_C * (1 - (fs.pct || 0));
    const sec = Math.ceil((fs.remain || fs.total || 0) / 1000);
    const txt = U.pad(Math.floor(sec / 60)) + ':' + U.pad(sec % 60);
    const label = fs.running ? '专注中' : (idle ? '准备开始' : (fs.remain > 0 ? '已暂停' : '已完成'));
    return '<div class="pomo"><svg viewBox="0 0 200 200">' +
      '<defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--accent-2)"/></linearGradient></defs>' +
      '<circle class="ring-bg" cx="100" cy="100" r="' + POMO_R + '"/>' +
      '<circle class="ring-fg" id="pomoRing" cx="100" cy="100" r="' + POMO_R + '" stroke-dasharray="' + POMO_C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '</svg><div class="pomo-center"><b id="pomoTime">' + txt + '</b><span id="pomoLabel">' + label + '</span></div></div>';
  }

  function sheetPomo() {
    const fs = Store.focusState();
    const idle = !fs.running && !(fs.remain > 0);
    const todayMin = Store.focusToday();
    const cnt = S.focus.filter((f) => (f.date || U.ymd(new Date(f.ts))) === U.today()).length;
    const defMin = S.settings.focusLen || 25;
    const view = idle
      ? { running: false, remain: defMin * 60000, total: defMin * 60000, minutes: defMin, pct: 0 }
      : fs;
    let h = '<h2>专注</h2>';
    if (idle) h += '<p class="sh-sub">25 分钟做完一件事，比两小时刷着手机强</p>';
    h += pomoRing(view, idle);
    if (idle) {
      h += '<div class="field"><label>在做什么（可空）</label><div style="display:flex;gap:9px;align-items:center"><input id="pomoLabelInput" style="flex:1" placeholder="高数第三章习题" value="' + U.esc(S.settings.lastFocusLabel || '') + '"></div></div>';
      h += '<div class="pill-row" style="justify-content:center;gap:8px">' +
        [25, 45, 60].map((m) => '<button class="tag-btn" data-act="pomoStart" data-min="' + m + '" style="padding:9px 18px;font-size:14px;' + (m === defMin ? 'background:var(--accent);color:#fff;border-color:transparent' : '') + '">' + m + ' 分钟</button>').join('') + '</div>';
    } else {
      h += '<div class="btn-row"><button class="btn primary" data-act="' + (fs.running ? 'pomoPause' : 'pomoResume') + '">' + (fs.running ? '暂停' : '继续') + '</button>' +
        '<button class="btn" data-act="pomoStop">结束</button></div>';
    }
    h += '<div class="card tight" style="margin-top:14px;display:flex;gap:10px;align-items:center">' +
      '<div class="focus-ic">' + ICON.flame + '</div>' +
      '<div style="flex:1"><div style="font-size:14px;font-weight:600">今天 ' + todayMin + ' 分钟</div>' +
      '<div class="tiny muted">' + cnt + ' 节 · ' + (S.focus.length ? '累计 ' + S.focus.reduce((a, b) => a + (b.minutes || 0), 0) + ' 分钟' : '还没有记录') + '</div></div></div>';
    if (S.focus.length) {
      h += '<div class="tiny muted" style="margin:14px 2px 6px">最近</div>';
      h += '<div class="list">';
      S.focus.slice(0, 5).forEach((f) => {
        h += '<div class="row"><div class="lbl" style="font-size:13px">' + U.esc(f.label || '专注') + '<small>' + U.relLabel(f.date || U.ymd(new Date(f.ts))) + '</small></div>' +
          '<div class="val">' + f.minutes + ' 分钟</div></div>';
      });
      h += '</div>';
    }
    openSheet(h);
  }

  function tickPomo() {
    const el = document.getElementById('pomoTime');
    if (!el) return;
    if (!S.focusState) return; // 空闲态：保留默认时长显示，别被心跳刷成 00:00
    const fs = Store.focusState();
    const sec = Math.ceil(fs.remain / 1000);
    el.textContent = U.pad(Math.floor(sec / 60)) + ':' + U.pad(sec % 60);
    const ring = document.getElementById('pomoRing');
    if (ring) ring.setAttribute('stroke-dashoffset', (POMO_C * (1 - fs.pct)).toFixed(1));
    const lb = document.getElementById('pomoLabel');
    if (lb) lb.textContent = fs.running ? '专注中' : (fs.remain > 0 ? '已暂停' : '准备开始');
  }

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ac = new Ctx();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(660, ac.currentTime);
      o.frequency.setValueAtTime(880, ac.currentTime + 0.16);
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.9);
      o.start();
      o.stop(ac.currentTime + 1);
      setTimeout(() => { try { ac.close(); } catch (e) {} }, 1400);
    } catch (e) {}
  }

  function finishPomo() {
    const st0 = S.focusState;
    Store.focusStop(true);
    beep();
    if (navigator.vibrate) navigator.vibrate([18, 70, 18, 70, 18]);
    toast('专注完成 · ' + (st0 && st0.minutes || 25) + ' 分钟，起来走两步', 4000);
    if (document.querySelector('#sheet.on')) sheetPomo();
    else render(true);
  }

  /* 全局心跳：负责番茄钟倒计时与完成检测 */
  function tick() {
    const fs = Store.focusState();
    if (fs.running && fs.remain <= 0) { finishPomo(); return; }
    if (document.getElementById('pomoTime')) tickPomo();
    const dot = document.querySelector('.focus-dot');
    if (dot && (st.page === 'today')) {
      const sec = Math.ceil(fs.remain / 1000);
      const tEl = dot.parentNode.querySelector('.tiny');
      if (tEl && (fs.running || fs.remain > 0)) tEl.textContent = '还剩 ' + Math.floor(sec / 60) + ':' + U.pad(sec % 60) + '，点开继续';
    }
  }
  setInterval(tick, 1000);

  /* 长按入口 → 编辑（入口页副标题写的就是「长按编辑」） */
  let pressTimer = 0;
  view.addEventListener('pointerdown', function (e) {
    const lk = e.target.closest('.lk[data-id]');
    if (!lk || !lk.getAttribute('data-id')) return;
    const id = lk.getAttribute('data-id');
    pressTimer = setTimeout(function () {
      pressTimer = 0;
      lk.dataset.lp = '1';
      if (navigator.vibrate) navigator.vibrate(12);
      openLinkEdit(id);
    }, 550);
  });
  ['pointerup', 'pointercancel', 'pointermove', 'pointerleave'].forEach(function (t) {
    view.addEventListener(t, function () { if (pressTimer) { clearTimeout(pressTimer); pressTimer = 0; } });
  });

  /* ---------------- 事件委托 ---------------- */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.dataset && el.dataset.lp) { delete el.dataset.lp; return; }
    const act = el.getAttribute('data-act');
    const id = el.getAttribute('data-id') || '';
    const day = el.getAttribute('data-day') || '';

    switch (act) {
      case 'noop': e.stopPropagation(); break;
      case 'closeSheet': closeSheet(); break;
      case 'go': go(el.getAttribute('data-page')); break;

      case 'toggle': {
        Store.toggleItem(el.getAttribute('data-kind'), id);
        if (navigator.vibrate) navigator.vibrate(8);
        render(true);
        break;
      }
      case 'open':
        openItemForm(el.getAttribute('data-kind'), id);
        break;
      case 'newEvent': openItemForm('event', '', day || U.today()); break;
      case 'openTodoDay': st.sel = day; st.calBase = day; go('calendar'); break;
      case 'scheduleTodo': {
        const td = S.todos.find((x) => x.id === id);
        if (!td) break;
        openSheet('<h2>给这条待办定个日子</h2><p class="sh-sub">' + U.esc(td.title) + '</p>' +
          '<form id="schedForm" data-id="' + id + '"><div class="field"><label>日期</label><input type="date" name="date" value="' + U.today() + '"></div>' +
          '<div class="btn-row"><button class="btn primary" type="submit">定下</button></div></form>');
        break;
      }
      case 'delItem':
        Store.delItem(el.getAttribute('data-kind'), id);
        closeSheet(); toast('已删除'); render(true);
        break;

      case 'ingestNote':
        break;

      /* 日历 */
      case 'calPrev': st.calBase = U.addDays(U.ymd(new Date(U.toDate(st.calBase).getFullYear(), U.toDate(st.calBase).getMonth(), 1)), -1); render(); break;
      case 'calNext': {
        const b = U.toDate(st.calBase);
        const n = new Date(b.getFullYear(), b.getMonth() + 1, 1);
        st.calBase = U.ymd(n); render(); break;
      }
      case 'calToday': st.calBase = U.today(); st.sel = U.today(); render(); break;
      case 'calSelect': st.sel = day; render(); break;
      case 'calMode':
        st.calMode = el.getAttribute('data-m') || 'month';
        if (st.calMode === 'week' && !st.viewWeek) st.viewWeek = U.mondayOf(U.today());
        render();
        break;
      case 'weekPrev':
        st.viewWeek = U.addDays(st.viewWeek || U.mondayOf(U.today()), -7);
        render();
        break;
      case 'weekNext':
        st.viewWeek = U.addDays(st.viewWeek || U.mondayOf(U.today()), 7);
        render();
        break;

      /* 入口 */
      case 'linkOpen': {
        const url = el.getAttribute('data-url');
        const l = S.links.find((x) => x.id === id);
        const target = l ? l.url : url;
        if (!target) break;
        if (l && l.scheme) { launchScheme(l.scheme, target); break; }
        openExternal(target);
        break;
      }
      case 'linkEdit': openLinkEdit(id); break;

      case 'linkDel':
        S.links = S.links.filter((x) => x.id !== id); Store.save(); closeSheet(); toast('已删除'); render(true);
        break;

      /* 重要消息 */
      case 'inboxAdd':
        openSheet('<h2>记一条消息</h2><p class="sh-sub">通知、缴费、报名时间…先扔进来，别让它溜走</p>' +
          '<form id="inboxForm"><div class="field"><label>内容</label><textarea name="text" placeholder="辅导员通知：本周五前交医保材料"></textarea></div>' +
          '<div class="field"><label>来源</label><input name="from" placeholder="辅导员 / 学院群 / 教务"></div>' +
          '<div class="btn-row"><button class="btn primary" type="submit">记下</button></div></form>');
        break;
      case 'inboxOpen': {
        const m = S.inbox.find((x) => x.id === id);
        if (!m) break;
        openSheet('<h2>消息</h2><p class="sh-sub">' + U.esc(m.from || '') + ' · ' + U.relLabel(U.ymd(new Date(m.ts))) + '</p>' +
          '<div class="card" style="background:var(--card-2)"><div style="font-size:14.5px;line-height:1.65">' + U.esc(m.text) + '</div></div>' +
          '<div class="btn-row"><button class="btn primary" type="button" data-act="inboxDone" data-id="' + id + '">处理完了</button>' +
          '<button class="btn" type="button" data-act="inboxToEvent" data-id="' + id + '">变成待办</button></div>');
        break;
      }
      case 'inboxDone':
        S.inbox.forEach((m) => { if (m.id === id) m.done = true; }); Store.save(); closeSheet(); toast('已归档'); render(true);
        break;
      case 'inboxToEvent': {
        const m = S.inbox.find((x) => x.id === id);
        if (!m) break;
        Store.addTodo({ title: m.text.slice(0, 40), prio: 2, tag: '其他' });
        m.done = true; Store.save(); closeSheet(); toast('已转成待办'); render(true);
        break;
      }

      /* AI 页 */
      case 'fillAI': {
        const ta = $('#aiInput');
        if (ta) { ta.value = el.getAttribute('data-text'); ta.focus(); }
        break;
      }
      case 'aiParse': runParse(); break;
      case 'commitDraft':
        if (st.ai.last) {
          const n = (st.ai.last.events.length + st.ai.last.todos.length + st.ai.last.inbox.length);
          Store.commit(st.ai.last);
          st.ai.last = null; toast('已加入 ' + n + ' 条'); render();
        }
        break;
      case 'dropDraft': st.ai.last = null; render(); break;
      case 'pickImg': { const inp = $('#imgInput'); if (inp) inp.click(); break; }
      case 'dropImg': {
        const i = +el.getAttribute('data-i');
        st.ai.imgs.splice(i, 1); render(); break;
      }
      case 'clearImg': st.ai.imgs = []; render(); break;
      case 'aiVision': runVision(); break;
      case 'aiBrief': runBrief(); break;
      case 'openAI': sheetAI(); break;
      case 'saveAI': saveAISettings(); break;
      case 'toggleReasoning':
        S.settings.reasoning = !S.settings.reasoning;
        Store.save();
        sheetAI();
        toast(S.settings.reasoning ? '深度思考已开：解析会更准，也更慢' : '已关闭深度思考');
        break;
      case 'testAI': testAI(); break;
      case 'testVisionModel': {
        if (!S.settings.visionKey && !S.settings.apiKey) { toast('先填视觉模型 Key'); break; }
        toast('正在测视觉模型…', 15000);
        AI.testVision()
          .then((r) => toast('视觉模型通了：' + r, 5000))
          .catch((e) => toast(String(e.message || e).slice(0, 110), 6000));
        break;
      }
      case 'courseImport': sheetCourse(); break;
      case 'courseParse': runCourseParse(); break;
      case 'courseSave': saveCourses(); break;
      case 'courseDirect': {
        const t = document.getElementById('courseText');
        const list = Store.parseTimetableLines(t ? t.value : '');
        if (!list.length) { toast('没认出来，检查格式：课程名|周一|1-2|教室|4-19'); break; }
        courseDraft = list;
        showCoursePreview(list, []);
        toast('认出 ' + list.length + ' 条，点确认导入');
        break;
      }
      case 'courseDrop': {
        const i = +el.getAttribute('data-i');
        if (courseDraft) {
          courseDraft.splice(i, 1);
          showCoursePreview(courseDraft, []);
          if (!courseDraft.length) toast('都删完了，重新粘贴一次吧');
        }
        break;
      }
      case 'courseDel':
        S.courses = S.courses.filter((c) => c.id !== id); Store.save(); toast('已删除'); render(true);
        break;

      /* 我的 */
      case 'editName':
        openSheet('<h2>怎么称呼你</h2><form id="nameForm"><div class="field"><label>名字</label><input name="name" value="' + U.esc(S.settings.name) + '" placeholder="小王"></div>' +
          '<div class="btn-row"><button class="btn primary" type="submit">保存</button></div></form>');
        break;
      case 'editSemester':
        openSheet('<h2>学期开始</h2><p class="sh-sub">填第 1 周的周一，用来算「第几周」和单双周课程</p>' +
          '<form id="semForm"><div class="field"><label>第 1 周周一</label><input type="date" name="semesterStart" value="' + U.esc(S.settings.semesterStart) + '"></div>' +
          '<div class="btn-row"><button class="btn primary" type="submit">保存</button></div></form>');
        break;
      case 'editPeriods': {
        const txt = (S.settings.periods || []).map((p) => p[0] + '-' + p[1]).join('\n');
        openSheet('<h2>上课节次时间</h2><p class="sh-sub">每行一节：开始-结束。按你们学校的作息改。</p>' +
          '<form id="periodForm"><div class="field"><textarea name="periods" style="min-height:230px;font-variant-numeric:tabular-nums" spellcheck="false">' + U.esc(txt) + '</textarea></div>' +
          '<div class="btn-row"><button class="btn primary" type="submit">保存</button></div></form>');
        break;
      }
      case 'exportICS': {
        const ics = Store.buildICS(U.today(), 45);
        U.download('序时-日程.ics', ics, 'text/calendar;charset=utf-8');
        toast('已导出，打开文件即可导入系统日历');
        break;
      }
      case 'exportJSON': U.download('序时-备份-' + U.today() + '.json', Store.exportAll(), 'application/json'); break;
      case 'openInstall': window.location.href = 'install.html'; break;
      case 'importJSON': {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = '.json,application/json';
        inp.onchange = () => {
          const f = inp.files && inp.files[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => {
            try { Store.importAll(String(r.result)); toast('已恢复'); setTimeout(() => location.reload(), 500); }
            catch (err) { toast('恢复失败：' + err.message); }
          };
          r.readAsText(f);
        };
        inp.click();
        break;
      }
      case 'resetAll':
        openSheet('<h2>清空所有数据？</h2><p class="sh-sub">日程、待办、课程、入口、Key 全部删除，手机上不留痕迹。</p>' +
          '<div class="btn-row"><button class="btn" data-act="closeSheet">算了</button><button class="btn danger" data-act="resetDo">确认清空</button></div>');
        break;
      case 'resetDo': Store.resetAll(); break;
      case 'theme': {
        S.settings.theme = el.getAttribute('data-t'); Store.save(); applyTheme(); render(true); break;
      }

      /* DDL */
      case 'ddlSheet': sheetDDL(); break;
      case 'ddlAdd': sheetDDLForm(); break;
      case 'ddlOpen': sheetDDLForm(id); break;
      case 'ddlDone': {
        const d = S.ddls.find((x) => x.id === id);
        if (d) {
          d.done = true; Store.save();
          if (navigator.vibrate) navigator.vibrate(8);
          if (document.querySelector('#sheet.on')) sheetDDL();
          render(true);
        }
        break;
      }
      case 'ddlDel':
        S.ddls = S.ddls.filter((x) => x.id !== id); Store.save(); toast('已删除'); render(true);
        if (document.querySelector('#sheet.on')) sheetDDL();
        break;

      /* 成绩 / GPA */
      case 'gradeSheet': sheetGrade(); break;
      case 'gradeAdd': sheetGradeForm(); break;
      case 'gradeDel':
        S.grades = S.grades.filter((x) => x.id !== id); Store.save(); sheetGrade(); render(true);
        break;
      case 'gpaMode':
        S.settings.gpaMode = el.getAttribute('data-mode') || 'level'; Store.save(); sheetGrade(); render(true);
        break;
      case 'gradeSaveTarget': {
        const inp = document.getElementById('targetGpaInput');
        S.settings.targetGpa = inp ? inp.value.trim() : '';
        Store.save(); toast('已保存'); closeSheet(); render(true);
        break;
      }

      /* 复盘 */
      case 'aiReview': runReview(); break;
      case 'reviewHistory': sheetReviews(); break;

      /* 番茄钟 */
      case 'pomoOpen': sheetPomo(); break;
      case 'pomoStart': {
        const li = document.getElementById('pomoLabelInput');
        S.settings.lastFocusLabel = li ? li.value.trim() : '';
        Store.save();
        Store.focusStart(+el.getAttribute('data-min') || 25, S.settings.lastFocusLabel);
        sheetPomo();
        break;
      }
      case 'pomoPause': Store.focusPause(); sheetPomo(); break;
      case 'pomoResume': Store.focusResume(); sheetPomo(); break;
      case 'pomoStop': Store.focusStop(false); toast('已结束'); sheetPomo(); render(true); break;

      /* 维护 */
      case 'errLog': {
        const list = (window.__errs || []).slice(-30);
        openSheet('<h2>运行日志</h2><p class="sh-sub">只记错误信息，不记你写的内容</p>' +
          (list.length
            ? '<div class="card tight" style="font-size:11.5px;line-height:1.7;word-break:break-all">' +
              list.map((x, i) => '<div style="margin:5px 0">' + (i + 1) + '. ' + U.esc(String(x).slice(0, 220)) + '</div>').join('') + '</div>'
            : '<div class="card empty"><span class="big">' + ICON.check + '</span>没有错误记录</div>') +
          '<div class="btn-row"><button class="btn" data-act="errClear">清空日志</button></div>');
        break;
      }
      case 'errClear':
        try { window.__errs.length = 0; } catch (e) {}
        toast('已清空'); closeSheet(); render(true);
        break;
      case 'storageInfo':
        if (navigator.storage && navigator.storage.estimate) {
          navigator.storage.estimate().then((e) => {
            const u = (e.usage / 1048576).toFixed(1);
            const q = Math.round(e.quota / 1048576);
            toast('已用 ' + u + ' MB / 可用 ' + q + ' MB', 4000);
          }).catch(() => toast('查不到配额'));
        } else {
          toast('这个环境不支持查询');
        }
        break;
      case 'aiTestQuick':
        if (!AI.ready()) { toast('先去「我的 → AI 接口」填 Key'); break; }
        toast('测试中…', 12000);
        AI.test().then((r) => toast('连通正常：' + String(r).slice(0, 16), 3200))
          .catch((e) => toast(String(e.message || e).slice(0, 90), 4200));
        break;
      case 'hardReload':
        (async () => {
          try {
            if (window.caches) {
              const ks = await caches.keys();
              await Promise.all(ks.map((k) => caches.delete(k)));
            }
          } catch (e) {}
          location.reload();
        })();
        break;

      /* 目标 */
      case 'goalAdd':
        openSheet('<h2>加一个目标</h2><p class="sh-sub">长期的、值得记着的：绩点、竞赛、实验室、证书</p>' +
          '<form id="goalForm"><div class="field"><label>目标</label><input name="title" placeholder="大一上 GPA 3.7+"></div>' +
          '<div class="field"><label>类型</label><select name="type"><option>学业</option><option>保研</option><option>竞赛</option><option>科研</option><option>其他</option></select></div>' +
          '<div class="field"><label>期限（可不填）</label><input type="date" name="due"></div>' +
          '<div class="btn-row"><button class="btn primary" type="submit">加上</button></div></form>');
        break;
      case 'goalToggle': {
        const g = S.goals.find((x) => x.id === id);
        if (g) { g.done = !g.done; Store.save(); render(true); }
        break;
      }
      case 'goalDel':
        S.goals = S.goals.filter((x) => x.id !== id); Store.save(); toast('已删除'); render(true);
        break;

      /* 入口批量导入 */
      case 'linkBulk':
        openSheet('<h2>批量导入入口</h2><p class="sh-sub">一行一个。写「名称 网址」或只写网址都行，用空格 / 逗号分隔。</p>' +
          '<form id="bulkForm"><div class="field"><textarea name="bulk" style="min-height:170px" spellcheck="false" placeholder="教务处 https://jwc.uestc.edu.cn&#10;图书馆 lib.uestc.edu.cn&#10;https://www.zhihu.com"></textarea></div>' +
          '<div class="btn-row"><button class="btn primary" type="submit">导入</button></div></form>');
        break;
      default: break;
    }
  });

  /* ---------------- 表单提交 ---------------- */
  document.addEventListener('submit', function (e) {
    const f = e.target.closest('form');
    if (!f) return;
    e.preventDefault();
    const fd = new FormData(f);
    const get = (k) => String(fd.get(k) || '').trim();

    if (f.getAttribute('data-act') === 'quick') return; // 由 capture 监听器处理

    switch (f.id) {
      case 'itemForm': {
        const kind = f.getAttribute('data-kind');
        const id = f.getAttribute('data-id');
        const title = get('title');
        if (!title) { toast('写个标题'); return; }
        if (kind === 'todo') {
          let it = S.todos.find((x) => x.id === id);
          if (it) { Object.assign(it, { title, date: get('date'), prio: +get('prio') || 0, tag: get('tag') }); }
          else Store.addTodo({ title, date: get('date'), prio: +get('prio') || 0, tag: get('tag') });
        } else {
          let it = S.events.find((x) => x.id === id);
          const patch = { title, date: get('date') || U.today(), start: get('start'), end: get('end'), place: get('place'), note: get('note'), tag: get('tag') };
          if (it) Object.assign(it, patch); else Store.addEvent(patch);
        }
        Store.save(); closeSheet(); toast('已保存'); render(true);
        break;
      }
      case 'schedForm': {
        const td = S.todos.find((x) => x.id === f.getAttribute('data-id'));
        if (td) { td.date = get('date'); Store.save(); }
        closeSheet(); toast('已排期'); render(true);
        break;
      }
      case 'linkForm': {
        const id = f.getAttribute('data-id');
        let url = get('url');
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        const patch = { title: get('title') || U.host(url), url, group: get('group') || '常用', scheme: get('scheme') };
        if (id) { const l = S.links.find((x) => x.id === id); if (l) Object.assign(l, patch); }
        else S.links.push(Object.assign({ id: U.uid() }, patch));
        Store.save(); closeSheet(); toast('已保存'); render(true);
        break;
      }
      case 'inboxForm': {
        S.inbox.unshift({ id: U.uid(), text: get('text'), from: get('from') || '随手记', level: 'normal', ts: Date.now(), done: false });
        Store.save(); closeSheet(); toast('已记下'); render(true);
        break;
      }
      case 'nameForm': S.settings.name = get('name'); Store.save(); closeSheet(); render(true); break;
      case 'semForm': S.settings.semesterStart = get('semesterStart'); Store.save(); closeSheet(); toast('已保存'); render(true); break;
      case 'ddlForm': {
        const did = f.getAttribute('data-id');
        const patch = { title: get('title') || '未命名', date: get('date') || U.today(), time: get('time'), note: get('note'), tag: get('tag') };
        if (did) {
          const d = S.ddls.find((x) => x.id === did);
          if (d) Object.assign(d, patch);
        } else {
          S.ddls.push(Object.assign({ id: U.uid(), done: false, createdAt: Date.now() }, patch));
        }
        Store.save(); closeSheet(); toast('已保存'); render(true);
        break;
      }
      case 'gradeForm': {
        const name = get('name');
        if (!name) { toast('写个课程名'); return; }
        const scoreRaw = get('score');
        S.grades.push({
          id: U.uid(), name,
          credit: parseFloat(get('credit')) || 0,
          score: scoreRaw === '' ? '' : parseFloat(scoreRaw),
          type: get('type'), term: get('term')
        });
        Store.save(); sheetGrade(); toast('已加上');
        break;
      }
      case 'goalForm': {
        const title = get('title');
        if (!title) { toast('写个目标'); return; }
        S.goals.push({ id: U.uid(), title, type: get('type') || '其他', due: get('due'), done: false });
        Store.save(); closeSheet(); toast('已加上'); render(true);
        break;
      }
      case 'bulkForm': {
        const raw = get('bulk');
        const lines = raw.split(/\n+/).map((x) => x.trim()).filter(Boolean);
        let n = 0;
        lines.forEach((line) => {
          let m = line.match(/(https?:\/\/[^\s,，、\t]+)/i);
          let url = m ? m[1] : '';
          if (!url) {
            const m2 = line.match(/([a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+(\/[^\s,，、]*)?)/i);
            if (m2) url = m2[1];
          }
          if (!url) return;
          if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
          let title = line.replace(url, '').replace(/https?:\/\//i, '').replace(/[,，、\t]/g, ' ').trim();
          title = title.replace(/^[-:：\s]+/, '').trim() || U.host(url);
          S.links.push({ id: U.uid(), title: title.slice(0, 12), url, group: '导入', color: '' });
          n++;
        });
        Store.save(); closeSheet(); toast(n ? '导入 ' + n + ' 个入口' : '没识别出网址'); render(true);
        break;
      }
      case 'periodForm': {
        const lines = get('periods').split(/\n+/).map((x) => x.trim()).filter(Boolean);
        const ps = lines.map((l) => {
          const m = l.match(/(\d{1,2}[:：]\d{2})\s*[-–~]\s*(\d{1,2}[:：]\d{2})/);
          return m ? [m[1].replace('：', ':'), m[2].replace('：', ':')] : null;
        }).filter(Boolean);
        if (!ps.length) { toast('格式不对，例如 08:30-09:15'); return; }
        S.settings.periods = ps; Store.save(); closeSheet(); toast('已保存 ' + ps.length + ' 节'); render(true);
        break;
      }
      default: break;
    }
  });

  /* ---------------- 文件选择 ---------------- */
  document.addEventListener('change', async function (e) {
    const inp = e.target;
    if (inp.id !== 'imgInput' || !inp.files) return;
    const files = Array.prototype.slice.call(inp.files).slice(0, 6);
    toast('正在压缩 ' + files.length + ' 张…');
    for (const f of files) {
      try {
        const r = await Store.compress(f, 1280, 0.82);
        st.ai.imgs.push(r.data);
      } catch (err) { toast('有张图读不出来'); }
    }
    if (st.ai.imgs.length > 6) st.ai.imgs = st.ai.imgs.slice(-6);
    render(true);
  });

  /* ---------------- 快捷录入 ---------------- */
  async function quickAdd(text) {
    toast('AI 正在整理…', 6000);
    try {
      const res = AI.ready() ? await AI.parse(text) : AI.localParse(text);
      if (res.empty) { toast('没听出日程，换个说法试试'); return; }
      Store.commit(res);
      toast(res.reply || '已加入');
      if (navigator.vibrate) navigator.vibrate([8, 40, 8]);
      render();
    } catch (err) {
      const local = AI.localParse(text);
      if (!local.empty) { Store.commit(local); toast('AI 没连上，已用本地规则记下'); render(); }
      else toast(String(err.message || err).slice(0, 80));
    }
  }

  /* ---------------- AI: 文本解析 ---------------- */
  async function runParse() {
    const ta = $('#aiInput');
    const text = ta ? ta.value.trim() : '';
    if (!text) { toast('先写点什么'); return; }
    st.ai.input = text;
    st.ai.busy = true;
    toast(AI.ready() ? 'AI 正在整理…' : '本地解析中…', 6000);
    try {
      const res = AI.ready() ? await AI.parse(text) : AI.localParse(text);
      st.ai.last = res;
      st.ai.input = '';
      render();
      if (res.empty) toast('没整理出条目，写得更具体一点');
    } catch (err) {
      st.ai.last = AI.localParse(text);
      render();
      toast(String(err.message || err).slice(0, 90), 4000);
    } finally { st.ai.busy = false; }
  }

  async function runVision() {
    if (!st.ai.imgs.length) return;
    if (!AI.visionReady()) {
      toast('先配一个视觉模型（我的 → AI 接口）', 3200);
      return;
    }
    st.ai.visionBusy = true; render(true);
    toast('正在读图…', 20000);
    try {
      const res = await AI.analyzeImages(st.ai.imgs);
      st.ai.last = res;
      st.ai.imgs = [];
      render();
      if (res.empty) toast('图里没找到可安排的条目');
      else toast(res.reply || '读完了');
    } catch (err) {
      toast(String(err.message || err).slice(0, 100), 4200);
    } finally { st.ai.visionBusy = false; render(true); }
  }

  async function runBrief() {
    if (!AI.ready()) { toast('先去「我的」填 API Key'); return; }
    st.ai.briefBusy = true; render(true);
    const ctx = (function () {
      const t = U.today();
      const items = Store.dayItems(t).map((x) => '- ' + (x.start ? x.start + ' ' : '') + x.title + (x.place ? ' @' + x.place : '') + (x.done ? '（已完成）' : ''));
      const td = S.todos.filter((x) => !x.done).slice(0, 10).map((x) => '- [待办] ' + x.title + (x.date ? '（' + U.relLabel(x.date) + '）' : ''));
      const inbox = S.inbox.filter((m) => !m.done).slice(0, 5).map((m) => '- [消息] ' + m.text.slice(0, 60));
      const wk = Store.weekNo(t);
      return '今天是 ' + t + '，第 ' + (wk || '?') + ' 周。\n今天的安排：\n' + (items.join('\n') || '（空）') +
        '\n未完成待办：\n' + (td.join('\n') || '（无）') + '\n重要消息：\n' + (inbox.join('\n') || '（无）');
    })();
    try {
      const b = await AI.brief(ctx);
      st.ai.brief = b;
    } catch (err) {
      toast(String(err.message || err).slice(0, 100), 4200);
    } finally { st.ai.briefBusy = false; render(true); }
  }

  /* ---------------- AI 设置 ---------------- */
  function saveAISettings() {
    const s = S.settings;
    const val = (name) => {
      const el = sheetEl.querySelector('[name="' + name + '"]');
      return el ? el.value.trim() : undefined;
    };
    ['apiKey', 'apiBase', 'model', 'proxyBase', 'visionModel', 'visionBase', 'visionKey'].forEach((k) => {
      const v = val(k);
      if (v !== undefined) s[k] = v;
    });
    if (!s.apiBase) s.apiBase = 'https://api.deepseek.com';
    if (!s.model) s.model = 'deepseek-chat';
    Store.save(); closeSheet(); toast('已保存'); render(true);
  }

  async function testAI() {
    const s = S.settings;
    const keyEl = sheetEl.querySelector('[name="apiKey"]');
    const baseEl = sheetEl.querySelector('[name="apiBase"]');
    const modelEl = sheetEl.querySelector('[name="model"]');
    if (keyEl) s.apiKey = keyEl.value.trim();
    if (baseEl) s.apiBase = baseEl.value.trim();
    if (modelEl) s.model = modelEl.value.trim();
    Store.save();
    toast('测试中…', 12000);
    try {
      const r = await AI.test();
      toast('连通正常：' + r.slice(0, 20), 3000);
    } catch (err) {
      toast(String(err.message || err).slice(0, 110), 5000);
    }
  }

  /* ---------------- 课表导入 ---------------- */
  function sheetCourse() {
    let h = '<h2>导入课程表</h2><p class="sh-sub">从教务系统复制课表文本粘贴进来，AI 会拆成「周几 + 第几节 + 周次」。</p>';
    h += '<div class="field"><textarea id="courseText" placeholder="高等数学A  周一 1-2节 品学A101 王老师 1-16周&#10;大学物理    周三 3-4节 立人楼B203  1-16周&#10;电路分析    周五 5-6节 主楼C302   2-16双" style="min-height:150px"></textarea></div>';
    h += '<div class="field"><label>学期第 1 周周一</label><input type="date" id="courseSem" value="' + U.esc(S.settings.semesterStart || '') + '"></div>';
    h += '<div class="btn-row"><button class="btn primary" data-act="courseParse">AI 解析</button><button class="btn" data-act="courseDirect">直接导入</button></div>';
    h += '<div class="hint" style="margin:8px 2px 0;line-height:1.6">「直接导入」不花 AI，认这种一行一条的格式：<br><code style="font-size:11.5px">微积分Ⅰ|周一|1-2|品学楼A303|4-19</code><br>（课程名 | 周几 | 第几节 | 教室 | 周次）</div>';
    h += '<div id="coursePreview"></div>';
    openSheet(h);
  }

  let courseDraft = null;
  async function runCourseParse() {
    const ta = $('#courseText');
    const text = ta ? ta.value.trim() : '';
    if (!text) { toast('先粘贴课表文本'); return; }
    const sem = $('#courseSem');
    if (sem && sem.value) { S.settings.semesterStart = sem.value; Store.save(); }
    const box = $('#coursePreview');
    if (box) {
      box.innerHTML = '<div class="card tight" style="margin-top:12px">' +
        '<div class="tiny muted" style="margin-bottom:8px">' + (S.settings.reasoning ? '深度思考中，可能要 20–60 秒…' : 'AI 正在读…') + '</div>' +
        '<div class="sk sk-line" style="width:60%"></div><div class="sk sk-line" style="width:85%"></div><div class="sk sk-line" style="width:40%"></div></div>';
    }
    try {
      if (!AI.ready()) throw new Error('需要先在「我的」配置 API Key 才能解析课表');
      const res = await AI.parseCourses(text);
      const list = res.courses || [];
      courseDraft = list;
      if (!list.length) {
        let msg = '<div class="card tight" style="margin-top:12px;font-size:13px"><b>没解析出课程</b>';
        if (res.issues && res.issues.length) msg += '<div class="tiny muted" style="margin-top:6px">' + res.issues.map(U.esc).join('<br>') + '</div>';
        msg += '<div class="tiny muted" style="margin-top:8px">试试：把课表复制成「课程名 周一 1-2节 教室 1-16周」这样的纯文本；或者先在「我的 → 学期开始」填好第 1 周周一。</div></div>';
        if (box) box.innerHTML = msg;
        toast('没解析出课程');
        return;
      }
      showCoursePreview(list, res.issues);
    } catch (err) {
      if (box) box.innerHTML = '<div class="card tight" style="margin-top:12px;color:var(--danger);font-size:13px">' + U.esc(String(err.message || err)) + '</div>';
    }
  }

  function showCoursePreview(list, issues) {
    const box = $('#coursePreview');
    if (!box) return;
    let h = '<div class="card tight" style="margin-top:12px">';
    h += '<div class="tiny muted" style="margin-bottom:8px">识别到 ' + list.length + ' 条 · 点 × 删掉不对的</div>';
    list.forEach((c, i) => {
      const t = (c.start && c.end) ? c.start + '–' + c.end
        : (function () { const sp = Store.periodSpan(c.periods || []); return sp.start ? sp.start + '–' + sp.end : ''; })();
      h += '<div style="display:flex;gap:8px;align-items:center;padding:6px 0;font-size:13.5px;border-bottom:1px solid var(--line)">' +
        '<span class="chip purple">周' + '一二三四五六日'[c.day - 1] + '</span>' +
        '<div style="flex:1;min-width:0">' +
        '<div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + U.esc(c.name) + '</div>' +
        '<div class="tiny muted">' + (c.periods || []).join(',') + ' 节' + (t ? ' · ' + t : '') + (c.place ? ' · ' + U.esc(c.place) : '') + ' · ' + U.esc(c.weeks) + '</div></div>' +
        '<button class="tiny" style="color:var(--danger);padding:4px 2px" data-act="courseDrop" data-i="' + i + '">' + ICON.x + '</button></div>';
    });
    if (issues && issues.length) {
      h += '<div class="tiny" style="margin-top:9px;color:#B47708;line-height:1.6">⚠️ ' + issues.map(U.esc).join('；') + '</div>';
    }
    h += '<div class="btn-row"><button class="btn primary" data-act="courseSave">确认导入</button></div></div>';
    box.innerHTML = h;
  }

  function saveCourses() {
    if (!courseDraft || !courseDraft.length) { toast('先解析，再保存'); return; }
    const palette = ['#3B6CFF', '#8B5CF6', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#14B8A6'];
    courseDraft.forEach((c) => {
      S.courses.push({
        id: U.uid(), name: c.name, teacher: c.teacher || '', place: c.place || '',
        day: c.day, periods: (c.periods && c.periods.length) ? c.periods : [1],
        weeks: c.weeks || '1-16',
        start: c.start || '', end: c.end || '',
        color: palette[S.courses.length % palette.length]
      });
    });
    Store.save();
    const n = courseDraft.length;
    courseDraft = null;
    closeSheet(); toast('已导入 ' + n + ' 条课程'); render();
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    applyTheme();
    try { Store.applyBuiltin(); } catch (e) {}   // 内置课表（只跑一次）
    Store.save(); // 首次种子也落盘，避免刷新后 uid 变化
    const hash = (location.hash || '').replace('#', '').split(/[&?]/)[0];

    // #cfg=xxx：一次性配置链接（把 AI 接口参数写进本地，不落在代码里）
    if (hash.indexOf('cfg=') === 0) {
      try {
        const raw = decodeURIComponent(hash.slice(4));
        const obj = JSON.parse(decodeURIComponent(escape(atob(raw))));
        Object.keys(obj).forEach(function (k) { if (k in S.settings) S.settings[k] = obj[k]; });
        Store.save();
        try { history.replaceState(null, '', location.pathname); } catch (e) {}
        setTimeout(function () { toast('AI 配置已写入，去「我的」看看', 3600); }, 900);
      } catch (e) {
        setTimeout(function () { toast('配置链接无效'); }, 900);
      }
    }
    if (hash === 'week') { st.page = 'calendar'; st.calMode = 'week'; }
    else if (PAGES[hash]) st.page = hash;
    else if (hash === 'new') st.page = 'today';
    render();
    const hideBoot = () => { const b = $('#boot'); if (b) b.classList.add('hide'); };
    setTimeout(hideBoot, 300);
    setTimeout(hideBoot, 1200);
    window.addEventListener('load', () => setTimeout(hideBoot, 200));
    if (hash === 'new') setTimeout(() => openItemForm('event'), 260);
    if (hash === 'pomo') setTimeout(() => sheetPomo(), 300);
    if (hash === 'gpa') setTimeout(() => sheetGrade(), 300);
    if (hash === 'ddl') setTimeout(() => sheetDDL(), 300);
    const isLocal = /^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname);
    if ('serviceWorker' in navigator && !isLocal && !isNative()) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    if (!S.settings.onboarded) {
      S.settings.onboarded = true; Store.save();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* 快捷表单提交（顶部输入框走这里，避免每次重渲染丢焦点） */
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'aiInput') st.ai.input = e.target.value;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'quickInput') {
      e.preventDefault();
      const v = e.target.value.trim();
      if (v) { e.target.value = ''; quickAdd(v); }
    }
  });
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.getAttribute('data-act') === 'quick') {
      e.preventDefault();
      const inp = $('#quickInput');
      const v = inp ? inp.value.trim() : '';
      if (v) { inp.value = ''; quickAdd(v); }
    }
  }, true);
})();
