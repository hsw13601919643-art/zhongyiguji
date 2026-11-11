/* =========================================================================
   经典药膳方数据库及推荐系统 — 公共核心（命名空间、存储、工具、界面组件）
   纯前端版：不使用 ES 模块，便于直接双击 index.html 打开（file://）。
   ========================================================================= */
(function (global) {
  'use strict';

  var YS = global.YS = global.YS || {};
  YS.version = '1.0.0';
  YS.appName = '经典药膳方数据库及“三餐四季”推荐系统';
  YS.seed = YS.seed || {};

  /* ---------- 根目录定位：由本脚本地址推算 ---------- */
  YS.root = (function () {
    var s = document.currentScript;
    var src = s ? s.src : '';
    var m = src.match(/^(.*\/)assets\/js\/core\.js(\?.*)?$/);
    return m ? m[1] : './';
  })();
  YS.url = function (path) { return YS.root + (path || ''); };

  /* ---------- 本地存储（统一前缀 ys_） ---------- */
  var PREFIX = 'ys_';
  var memory = {};
  function rawGet(k) {
    try { return global.localStorage.getItem(PREFIX + k); } catch (e) { return Object.prototype.hasOwnProperty.call(memory, k) ? memory[k] : null; }
  }
  function rawSet(k, v) {
    try { global.localStorage.setItem(PREFIX + k, v); return true; }
    catch (e) {
      memory[k] = v;
      if (e && /quota/i.test(String(e.name || e.message))) YS.ui && YS.ui.toast('浏览器存储空间已满，请在“数据备份”中导出后清理', 'err');
      return false;
    }
  }
  YS.storage = {
    get: function (k, def) {
      var v = rawGet(k);
      if (v === null || v === undefined) return def;
      try { return JSON.parse(v); } catch (e) { return def; }
    },
    set: function (k, val) { return rawSet(k, JSON.stringify(val)); },
    remove: function (k) { try { global.localStorage.removeItem(PREFIX + k); } catch (e) { delete memory[k]; } },
    keys: function () {
      var out = [];
      try {
        for (var i = 0; i < global.localStorage.length; i++) {
          var key = global.localStorage.key(i);
          if (key && key.indexOf(PREFIX) === 0) out.push(key.slice(PREFIX.length));
        }
      } catch (e) { out = Object.keys(memory); }
      return out;
    },
    available: function () {
      try { global.localStorage.setItem('__ys_t', '1'); global.localStorage.removeItem('__ys_t'); return true; } catch (e) { return false; }
    }
  };
  YS.session = {
    get: function (k, def) { try { var v = global.sessionStorage.getItem(PREFIX + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set: function (k, v) { try { global.sessionStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* 忽略 */ } },
    remove: function (k) { try { global.sessionStorage.removeItem(PREFIX + k); } catch (e) { /* 忽略 */ } }
  };

  /* ---------- 工具函数 ---------- */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  YS.util = {
    esc: function (s) { return s === null || s === undefined ? '' : String(s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); },
    uid: function (prefix) { return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
    clone: function (o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); },
    pad: pad,
    fmtDate: function (d) { d = d ? new Date(d) : new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    fmtTime: function (d) { d = d ? new Date(d) : new Date(); return YS.util.fmtDate(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); },
    cnDate: function (d) { d = d ? new Date(d) : new Date(); return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; },
    weekday: function (d) { return '星期' + '日一二三四五六'.charAt((d ? new Date(d) : new Date()).getDay()); },
    qs: function (name, url) {
      var q = (url || global.location.search || '').replace(/^.*\?/, '');
      var parts = q.split('&');
      for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split('=');
        if (decodeURIComponent(kv[0] || '') === name) return decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      }
      return '';
    },
    toQuery: function (obj) {
      return Object.keys(obj).filter(function (k) { return obj[k] !== undefined && obj[k] !== null && obj[k] !== ''; })
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&');
    },
    debounce: function (fn, ms) { var t; return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms || 200); }; },
    uniq: function (arr) { var seen = {}; return (arr || []).filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); },
    /** 多值字段拆分：支持 、，,；; 空格 / */
    splitMulti: function (s) {
      if (Array.isArray(s)) return s;
      return String(s || '').split(/[、，,；;\/\s]+/).map(function (x) { return x.trim(); }).filter(Boolean);
    },
    download: function (filename, content, mime) {
      var blob = content instanceof Blob ? content : new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },
    /** 解析 CSV（RFC 4180，支持引号、换行、BOM） */
    csvParse: function (text) {
      text = String(text || '').replace(/^﻿/, '');
      var rows = [], row = [], cell = '', q = false;
      for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (q) {
          if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
          else cell += c;
        } else if (c === '"') q = true;
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
          if (c === '\r' && text[i + 1] === '\n') i++;
          row.push(cell); rows.push(row); row = []; cell = '';
        } else cell += c;
      }
      if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
      return rows.filter(function (r) { return r.some(function (x) { return String(x).trim() !== ''; }); });
    },
    csvStringify: function (rows) {
      return '﻿' + rows.map(function (r) {
        return r.map(function (v) {
          v = v === null || v === undefined ? '' : String(v);
          return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        }).join(',');
      }).join('\r\n');
    },
    isWeChat: function () { return /MicroMessenger/i.test(global.navigator.userAgent); },
    isMobile: function () { return /Android|iPhone|iPad|iPod|Mobile/i.test(global.navigator.userAgent); },
    isFile: function () { return global.location.protocol === 'file:'; },
    now: function () { return (global.performance && performance.now) ? performance.now() : Date.now(); }
  };

  /* ---------- 界面组件 ---------- */
  var esc = YS.util.esc;
  function toastWrap() {
    var w = document.querySelector('.ys-toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'ys-toast-wrap'; w.setAttribute('role', 'status'); document.body.appendChild(w); }
    return w;
  }
  YS.ui = {
    toast: function (msg, type) {
      var t = document.createElement('div');
      t.className = 'ys-toast ' + (type || '');
      t.textContent = msg;
      toastWrap().appendChild(t);
      setTimeout(function () { t.remove(); }, type === 'err' ? 4200 : 2600);
    },
    /**
     * 弹窗：opts = { title, html, wide, actions:[{text, cls, onClick(close) → false 阻止关闭}], onOpen(el) }
     */
    modal: function (opts) {
      var mask = document.createElement('div');
      mask.className = 'ys-mask';
      mask.innerHTML = '<div class="ys-modal' + (opts.wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' +
        '<div class="ys-modal-head"><h3>' + esc(opts.title || '') + '</h3><button class="ys-close" aria-label="关闭">×</button></div>' +
        '<div class="ys-modal-body"></div>' +
        (opts.actions && opts.actions.length ? '<div class="ys-modal-foot"></div>' : '') + '</div>';
      var body = mask.querySelector('.ys-modal-body');
      if (typeof opts.html === 'string') body.innerHTML = opts.html; else if (opts.html) body.appendChild(opts.html);
      function close() { mask.remove(); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); }
      function onKey(e) { if (e.key === 'Escape') close(); }
      mask.querySelector('.ys-close').onclick = close;
      mask.addEventListener('mousedown', function (e) { if (e.target === mask && !opts.sticky) close(); });
      document.addEventListener('keydown', onKey);
      var foot = mask.querySelector('.ys-modal-foot');
      (opts.actions || []).forEach(function (a) {
        var b = document.createElement('button');
        b.className = 'btn ' + (a.cls || '');
        b.textContent = a.text;
        b.onclick = function () { var r = a.onClick ? a.onClick(close, body) : undefined; if (r !== false) close(); };
        foot.appendChild(b);
      });
      document.body.appendChild(mask);
      if (opts.onOpen) opts.onOpen(body, close);
      var first = body.querySelector('input,select,textarea');
      if (first) setTimeout(function () { first.focus(); }, 30);
      return { el: body, close: close };
    },
    confirm: function (msg, okText, danger) {
      return new Promise(function (resolve) {
        var done = false;
        YS.ui.modal({
          title: '请确认', html: '<p>' + esc(msg) + '</p>',
          onClose: function () { if (!done) resolve(false); },
          actions: [
            { text: '取消', onClick: function () { done = true; resolve(false); } },
            { text: okText || '确定', cls: danger ? 'danger' : 'primary', onClick: function () { done = true; resolve(true); } }
          ]
        });
      });
    },
    prompt: function (title, label, def) {
      return new Promise(function (resolve) {
        var done = false;
        YS.ui.modal({
          title: title,
          html: '<label class="field"><span>' + esc(label) + '</span><textarea id="ys-prompt-v">' + esc(def || '') + '</textarea></label>',
          onClose: function () { if (!done) resolve(null); },
          actions: [
            { text: '取消', onClick: function () { done = true; resolve(null); } },
            { text: '确定', cls: 'primary', onClick: function (c, body) { done = true; resolve(body.querySelector('#ys-prompt-v').value.trim()); } }
          ]
        });
      });
    },
    /** 选择片组：values 为可选项，selected 为已选；multi 为多选；required 为单选时不可取消（类似单选按钮） */
    chips: function (container, values, selected, multi, onChange, required) {
      selected = (selected || []).slice();
      container.classList.add('chips');
      container.innerHTML = values.map(function (v) {
        var val = typeof v === 'object' ? v.value : v, text = typeof v === 'object' ? v.text : v;
        return '<button type="button" class="chip' + (selected.indexOf(val) >= 0 ? ' on' : '') + '" data-v="' + esc(val) + '" aria-pressed="' + (selected.indexOf(val) >= 0) + '">' + esc(text) + '</button>';
      }).join('');
      container.onclick = function (e) {
        var b = e.target.closest('.chip');
        if (!b) return;
        var v = b.getAttribute('data-v');
        if (multi) {
          var i = selected.indexOf(v);
          if (i >= 0) selected.splice(i, 1); else selected.push(v);
        } else {
          selected = selected[0] === v ? (required ? [v] : []) : [v];
        }
        Array.prototype.forEach.call(container.querySelectorAll('.chip'), function (c) {
          var on = selected.indexOf(c.getAttribute('data-v')) >= 0;
          c.classList.toggle('on', on);
          c.setAttribute('aria-pressed', on);
        });
        if (onChange) onChange(selected.slice());
      };
      return { get: function () { return selected.slice(); } };
    },
    /** 生成二维码（SVG 字符串）；依赖 assets/lib/qrcode.js */
    qrSvg: function (text, cell) {
      if (typeof global.qrcode !== 'function') return '<p class="muted">二维码组件未加载</p>';
      global.qrcode.stringToBytes = global.qrcode.stringToBytesFuncs['UTF-8'];
      var qr = global.qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      return qr.createSvgTag({ cellSize: cell || 6, margin: 2, scalable: true });
    },
    /** 分享：优先系统分享；微信内提示右上角；否则显示链接与二维码 */
    share: function (title, url, text) {
      url = url || global.location.href;
      if (global.navigator.share && !YS.util.isWeChat()) {
        global.navigator.share({ title: title, text: text || title, url: url }).catch(function () { /* 用户取消 */ });
        return;
      }
      var tip = YS.util.isWeChat()
        ? '<div class="notice info mb-2">在微信中：点击右上角「···」，选择“发送给朋友”或“分享到朋友圈”。</div>' : '';
      var fileTip = YS.util.isFile()
        ? '<div class="notice warn mb-2">当前为本地文件打开，链接仅本机可用；部署到服务器后，二维码可供手机扫描。</div>' : '';
      YS.ui.modal({
        title: '分享：' + title,
        html: tip + fileTip +
          '<div class="center" style="max-width:220px;margin:0 auto 12px">' + YS.ui.qrSvg(url, 5) + '</div>' +
          '<label class="field"><span>链接</span><input type="text" readonly value="' + esc(url) + '" id="ys-share-url"></label>',
        actions: [{ text: '复制链接', cls: 'primary', onClick: function (c, body) {
          var inp = body.querySelector('#ys-share-url');
          inp.select();
          var ok = false;
          try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
          if (global.navigator.clipboard) global.navigator.clipboard.writeText(url).then(function () { YS.ui.toast('链接已复制', 'ok'); }, function () { if (!ok) YS.ui.toast('请手动复制链接'); });
          else YS.ui.toast(ok ? '链接已复制' : '请手动复制链接', ok ? 'ok' : '');
          return false;
        } }, { text: '关闭' }]
      });
    }
  };

  /* ---------- 页面公共：顶部条（模块页） ---------- */
  YS.topbar = function (opts) {
    opts = opts || {};
    var el = document.createElement('header');
    el.className = 'topbar no-print';
    var links = (opts.links || [
      { href: 'index.html', text: '系统首页' },
      { href: 'm02-user/index.html', text: '用户端' },
      { href: 'm03-admin/index.html', text: '管理端' },
      { href: 'acceptance/index.html', text: '验收导航' }
    ]).map(function (l) { return '<a href="' + esc(YS.url(l.href)) + '">' + esc(l.text) + '</a>'; }).join('');
    el.innerHTML = '<div class="container"><a class="brand" href="' + esc(YS.url('index.html')) + '"><span class="brand-mark">膳</span>' +
      '<span>' + esc(opts.title || '经典药膳方数据库') + (opts.sub ? '<br><span class="sub">' + esc(opts.sub) + '</span>' : '') + '</span></a>' +
      '<nav>' + links + '</nav></div>';
    document.body.insertBefore(el, document.body.firstChild);
  };
})(window);
