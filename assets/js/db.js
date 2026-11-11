/* =========================================================================
   数据访问层（纯前端版：浏览器本地存储）
   二期改为服务器数据库时，只需替换本文件中的读写实现，页面代码基本不变。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;
  var S = YS.storage, U = YS.util;

  var seeds = {};
  var ADMIN_COLLECTIONS = ['recipes', 'rules', 'contents'];

  function meta(name) { return S.get('meta_' + name, {}); }
  function setMeta(name, m) { S.set('meta_' + name, m); }

  YS.db = {
    /** 注册示例数据（首次打开或示例版本升级且未被修改时自动载入） */
    registerSeed: function (name, version, getter) { seeds[name] = { version: version, get: getter }; },
    hasSeed: function (name) { return !!seeds[name]; },
    list: function (name) {
      var data = S.get('c_' + name, null);
      var seed = seeds[name];
      if (seed) {
        var m = meta(name);
        if (data === null || (m.seedVersion !== seed.version && !m.dirty)) {
          data = U.clone(seed.get()) || [];
          S.set('c_' + name, data);
          setMeta(name, { seedVersion: seed.version, dirty: false, seededAt: Date.now() });
        }
      }
      return data || [];
    },
    saveAll: function (name, arr, opts) {
      S.set('c_' + name, arr);
      if (!(opts && opts.silent)) {
        var m = meta(name);
        m.dirty = true;
        m.updatedAt = Date.now();
        setMeta(name, m);
        if (ADMIN_COLLECTIONS.indexOf(name) >= 0) YS.db.autoSnapshot();
      }
    },
    get: function (name, id) {
      var arr = YS.db.list(name);
      for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
      return null;
    },
    upsert: function (name, item, opts) {
      var arr = YS.db.list(name);
      if (!item.id) item.id = U.uid(name.slice(0, 2).toUpperCase());
      var found = false;
      for (var i = 0; i < arr.length; i++) if (arr[i].id === item.id) { arr[i] = item; found = true; break; }
      if (!found) arr.push(item);
      YS.db.saveAll(name, arr, opts);
      return item;
    },
    remove: function (name, id) {
      YS.db.saveAll(name, YS.db.list(name).filter(function (x) { return x.id !== id; }));
    },
    /** 恢复为示例数据 */
    reset: function (name) {
      S.remove('c_' + name);
      S.remove('meta_' + name);
      return YS.db.list(name);
    },
    meta: meta,

    /* ---------- 药膳方版本记录（验收项 M01-10） ---------- */
    versions: function (id) { return (S.get('versions', {})[id] || []); },
    addVersion: function (recipe, note, user) {
      var all = S.get('versions', {});
      var list = all[recipe.id] || [];
      list.unshift({ version: recipe.version || 1, time: Date.now(), user: user || '', note: note || '', data: U.clone(recipe) });
      all[recipe.id] = list.slice(0, 30);
      S.set('versions', all);
    },

    /* ---------- 自动备份快照（浏览器内，保留最近 5 份，间隔≥10 分钟） ---------- */
    snapshots: function () { return S.get('snapshots', []); },
    snapshot: function (reason) {
      var list = S.get('snapshots', []);
      var data = {};
      ADMIN_COLLECTIONS.forEach(function (n) { data[n] = S.get('c_' + n, null); });
      data.versions = S.get('versions', {});
      var who = YS.auth && YS.auth.user() ? YS.auth.user().name : '';
      list.unshift({ id: U.uid('SN'), time: Date.now(), reason: reason || '自动备份', user: who, data: data });
      S.set('snapshots', list.slice(0, 5));
    },
    autoSnapshot: function () {
      var list = S.get('snapshots', []);
      if (!list.length || Date.now() - list[0].time > 10 * 60 * 1000) YS.db.snapshot('自动备份');
    },
    restoreSnapshot: function (id) {
      var sn = S.get('snapshots', []).filter(function (x) { return x.id === id; })[0];
      if (!sn) return false;
      ADMIN_COLLECTIONS.forEach(function (n) {
        if (sn.data[n]) { S.set('c_' + n, sn.data[n]); var m = meta(n); m.dirty = true; setMeta(n, m); }
      });
      if (sn.data.versions) S.set('versions', sn.data.versions);
      return true;
    }
  };

  /* ---------- 访客、推荐记录、收藏、知情同意 ---------- */
  function cap(arr, n) { return arr.length > n ? arr.slice(arr.length - n) : arr; }

  YS.track = {
    uid: function () {
      var id = S.get('uid', '');
      if (!id) { id = U.uid('U'); S.set('uid', id); }
      return id;
    },
    /** 推广来源（二维码中的 src 参数），在本次会话中保持 */
    src: function () {
      var s = U.qs('src');
      if (s) YS.session.set('src', s);
      return s || YS.session.get('src', '') || '';
    },
    visit: function (page) {
      var v = S.get('visits', []);
      v.push({ t: Date.now(), uid: YS.track.uid(), page: page, src: YS.track.src() });
      S.set('visits', cap(v, 5000));
      var u = YS.track.profile();
      u.lastSeen = Date.now();
      YS.track.saveProfile(u, true);
    },
    profile: function () {
      var p = S.get('profile', null);
      if (!p) p = { id: YS.track.uid(), firstSeen: Date.now(), region: '江南', src: YS.track.src() };
      return p;
    },
    /** 保存本机用户画像，并同步到“用户管理”列表 */
    saveProfile: function (p, quiet) {
      p.id = YS.track.uid();
      S.set('profile', p);
      var users = S.get('c_users', []);
      var row = {
        id: p.id, constitution: p.constitution || '', secondary: p.secondary || [], gender: p.gender || '',
        ageGroup: p.ageGroup || '', region: p.region || '', testedAt: p.testedAt || null,
        firstSeen: p.firstSeen || Date.now(), lastSeen: p.lastSeen || Date.now(), src: p.src || '', demo: false
      };
      var found = false;
      for (var i = 0; i < users.length; i++) if (users[i].id === row.id) { users[i] = row; found = true; }
      if (!found) users.push(row);
      S.set('c_users', users);
      if (!quiet) S.set('profile_updated', Date.now());
    },
    recommend: function (input, result) {
      var logs = S.get('c_reclogs', []);
      var picks = [];
      ['早', '午', '晚'].forEach(function (m) {
        var x = result.meals && result.meals[m];
        if (x && x.pick) picks.push({ meal: m, id: x.pick.recipe.id, name: x.pick.recipe.name });
      });
      logs.push({
        id: U.uid('RL'), t: Date.now(), uid: YS.track.uid(), src: YS.track.src(),
        input: { constitution: input.constitution || '', term: input.term || '', organ: input.organ || '', age: input.age || '', region: input.region || '' },
        picks: picks, ms: Math.round(result.elapsedMs * 100) / 100, mode: input.mode || '三餐'
      });
      S.set('c_reclogs', cap(logs, 5000));
    }
  };

  YS.fav = {
    list: function () { return S.get('favorites', []); },
    has: function (type, key) { return YS.fav.list().some(function (f) { return f.type === type && f.key === key; }); },
    toggle: function (type, key, title, data) {
      var list = YS.fav.list();
      var idx = -1;
      list.forEach(function (f, i) { if (f.type === type && f.key === key) idx = i; });
      if (idx >= 0) { list.splice(idx, 1); S.set('favorites', list); return false; }
      list.unshift({ type: type, key: key, title: title, data: data || null, time: Date.now() });
      S.set('favorites', list);
      return true;
    },
    remove: function (type, key) { S.set('favorites', YS.fav.list().filter(function (f) { return !(f.type === type && f.key === key); })); }
  };

  YS.consent = {
    agreed: function () { return !!(S.get('consent', null) || {}).agreed; },
    agree: function () { S.set('consent', { agreed: true, time: Date.now(), version: '1.0' }); },
    revoke: function () { S.remove('consent'); }
  };
})(window);
