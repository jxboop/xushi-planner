/* ============================================================
   序时 · 图片仓（IndexedDB）
   照片不进 localStorage：那里只有 5MB 且 base64 会再膨胀 33%。
   IndexedDB 存的是原始 Blob，容量按手机剩余空间算，
   同一张图重复导入只存一份（按内容 hash 去重）。
   ============================================================ */
(function () {
  'use strict';

  const DB_NAME = 'xushi';
  const DB_VER = 1;
  const STORE = 'images';
  let dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('这个浏览器不支持 IndexedDB')); return; }
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function () {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbp;
  }

  function tx(mode) {
    return open().then(function (db) {
      return db.transaction(STORE, mode).objectStore(STORE);
    });
  }

  /** dataURL → Blob */
  function toBlob(dataUrl) {
    const parts = String(dataUrl).split(',');
    if (parts.length < 2) return null;
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
    const bin = atob(parts[1]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  /** 内容指纹：长度 + 采样哈希，够用来去重 */
  function fingerprint(dataUrl) {
    const s = String(dataUrl);
    let h = 2166136261;
    const step = Math.max(1, Math.floor(s.length / 512));
    for (let i = 0; i < s.length; i += step) {
      h ^= s.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return 'img_' + s.length.toString(36) + '_' + h.toString(36);
  }

  const cache = {};   // key -> objectURL

  const IDB = {
    available() { return !!window.indexedDB; },

    /** 存一张图，返回 key（已存在就复用） */
    async put(dataUrl) {
      const key = fingerprint(dataUrl);
      if (cache[key]) return key;
      const blob = toBlob(dataUrl);
      if (!blob) throw new Error('图片数据无效');
      const st = await tx('readwrite');
      await new Promise(function (resolve, reject) {
        const req = st.put(blob, key);
        req.onsuccess = resolve;
        req.onerror = function () { reject(req.error); };
      });
      return key;
    },

    /** 取 Blob */
    async getBlob(key) {
      const st = await tx('readonly');
      return await new Promise(function (resolve, reject) {
        const req = st.get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    },

    /** 取可直接放进 <img src> 的 URL（带缓存） */
    async getURL(key) {
      if (cache[key]) return cache[key];
      const blob = await IDB.getBlob(key);
      if (!blob) return '';
      const url = URL.createObjectURL(blob);
      cache[key] = url;
      return url;
    },

    async del(key) {
      const st = await tx('readwrite');
      await new Promise(function (resolve, reject) {
        const req = st.delete(key);
        req.onsuccess = resolve;
        req.onerror = function () { reject(req.error); };
      });
    },

    /** 统计：多少张、共多大 */
    async stats() {
      const st = await tx('readonly');
      return await new Promise(function (resolve, reject) {
        let n = 0, bytes = 0;
        const req = st.openCursor();
        req.onsuccess = function () {
          const cur = req.result;
          if (!cur) { resolve({ count: n, bytes: bytes }); return; }
          n++;
          if (cur.value && cur.value.size) bytes += cur.value.size;
          cur.continue();
        };
        req.onerror = function () { reject(req.error); };
      });
    }
  };

  window.IDB = IDB;
})();
