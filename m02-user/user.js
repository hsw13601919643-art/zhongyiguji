/* =========================================================================
   M02 用户端 — 公共外壳：顶栏、底部导航、知情同意、访问统计、方剂卡片
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS, U = YS.util, esc = U.esc;

  var ICONS = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    meal: '<svg viewBox="0 0 24 24"><path d="M3 12h18"/><path d="M4 12a8 8 0 0 0 16 0"/><path d="M9 4c0 2 2 2 2 4M13 4c0 2 2 2 2 4"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/></svg>'
  };
  var TABS = [['home', '首页', 'index.html'], ['meal', '推荐', 'recommend.html'], ['book', '科普', 'science.html'], ['star', '收藏', 'favorites.html']];

  function showConsent(onDone) {
    YS.ui.modal({
      title: '使用前请阅读', sticky: true,
      html: '<p>为给您推荐合适的药膳，本系统会在<b>您的手机或电脑本地</b>保存：体质测评结果、性别与年龄段、所在地域、收藏内容，以及匿名的使用记录（用于统计访问量和推荐次数）。</p>' +
        '<p>本系统<b>不收集</b>姓名、手机号、身份证号、病历等个人身份或患者信息。您可随时在“收藏”页底部清除本机数据。</p>' +
        '<p class="muted" style="font-size:13px">推荐内容仅供日常饮食参考，不能替代诊疗。详见 <a href="../m06-security/privacy.html">《隐私政策》</a>。</p>',
      actions: [
        { text: '暂不同意', onClick: function () { YS.session.set('consent_skip', 1); YS.ui.toast('您仍可浏览，但测评结果与收藏不会保存'); if (onDone) onDone(false); } },
        { text: '同意并继续', cls: 'primary', onClick: function () { YS.consent.agree(); YS.ui.toast('感谢您的信任', 'ok'); if (onDone) onDone(true); } }
      ]
    });
  }

  YS.user = {
    /** opts: { title, back(true|url), tab('home'|'meal'|'book'|'star'), page, right(html) } */
    init: function (opts) {
      opts = opts || {};
      document.body.classList.add('u');
      var head = document.createElement('header');
      head.className = 'u-head';
      var back = opts.back ? '<button class="hb" id="u-back" aria-label="返回">‹ 返回</button>' : '<a href="../index.html" title="系统首页">门户</a>';
      head.innerHTML = '<div class="in"><div class="side">' + back + '</div><h1>' + esc(opts.title || '三餐四季 · 经典药膳') + '</h1><div class="side r">' + (opts.right || '') + '</div></div>';
      document.body.insertBefore(head, document.body.firstChild);
      if (opts.back) document.getElementById('u-back').onclick = function () {
        if (typeof opts.back === 'string') location.href = opts.back;
        else if (history.length > 1 && document.referrer) history.back(); else location.href = 'index.html';
      };
      var nav = document.createElement('nav');
      nav.className = 'u-tabbar';
      nav.innerHTML = '<div class="in">' + TABS.map(function (t) {
        return '<a href="' + t[2] + '"' + (opts.tab === t[0] ? ' class="on" aria-current="page"' : '') + '>' + ICONS[t[0]] + '<span>' + t[1] + '</span></a>';
      }).join('') + '</div>';
      document.body.appendChild(nav);

      YS.track.src(); // 记住扫码来源
      if (YS.consent.agreed()) YS.track.visit(opts.page || location.pathname.split('/').pop());
      else if (!YS.session.get('consent_skip', 0)) showConsent(function (ok) { if (ok) YS.track.visit(opts.page || ''); });
    },
    canSave: function () { return YS.consent.agreed(); },
    /** 需要保存数据的操作先确认同意 */
    requireConsent: function (cb, onDecline) {
      if (YS.consent.agreed()) { cb(); return; }
      showConsent(function (ok) { if (ok) cb(); else if (onDecline) onDecline(); });
    },
    profile: function () { return YS.track.profile(); },

    favButton: function (type, key, title) {
      var on = YS.fav.has(type, key);
      return '<button type="button" class="fav-btn' + (on ? ' on' : '') + '" data-fav="' + esc(type) + '|' + esc(key) + '" data-title="' + esc(title) + '">' + (on ? '★ 已收藏' : '☆ 收藏') + '</button>';
    },
    /** 绑定收藏按钮（事件委托） */
    bindFav: function (root, getData) {
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-fav]');
        if (!b) return;
        var p = b.getAttribute('data-fav').split('|');
        YS.user.requireConsent(function () {
          var on = YS.fav.toggle(p[0], p[1], b.getAttribute('data-title'), getData ? getData(p[0], p[1]) : null);
          b.classList.toggle('on', on);
          b.textContent = on ? '★ 已收藏' : '☆ 收藏';
          YS.ui.toast(on ? '已加入收藏' : '已取消收藏', on ? 'ok' : '');
        });
      });
    },

    /** 推荐结果中的单餐卡片 */
    mealCard: function (meal, x) {
      var M = YS.model;
      if (!x || !x.pick) return '<div class="card meal-card"><span class="meal">' + YS.dict.mealNames[meal] + '</span><div class="muted">暂无匹配方剂</div></div>';
      var r = x.pick.recipe;
      var why = x.pick.reasons.map(function (w) { return '<span>' + esc(w) + '</span>'; }).concat(x.pick.rules.filter(function (k) { return k.type === 'prefer'; }).map(function (k) {
        return '<span title="' + esc(k.name + '（命中：' + k.hits.join('、') + '）') + '">规则' + esc(k.id) + '</span>';
      }));
      return '<div class="card meal-card" data-meal="' + meal + '">' +
        '<div class="row between"><span class="meal">' + YS.dict.mealNames[meal] + '</span>' + YS.user.favButton('recipe', r.id, r.name) + '</div>' +
        '<div class="name"><a href="detail.html?id=' + encodeURIComponent(r.id) + '">' + esc(r.name) + '</a></div>' +
        '<div class="tags">' + M.yaoshiBadge(r) + '<span class="badge">' + esc(r.category) + '</span><span class="badge">性' + esc(r.nature) + '</span>' + M.sampleBadge(r) + '</div>' +
        '<div class="text-2" style="font-size:14px"><b style="color:var(--c-text)">功效：</b>' + esc(r.efficacy) + '</div>' +
        M.compHtml(r) +
        '<details><summary>制作方法与注意事项</summary><p>' + esc(r.method) + '</p><p><b>注意：</b>' + esc(r.cautions) + '</p></details>' +
        '<div class="why">' + why.join('') + '</div>' +
        (x.exact === false ? '<div class="notice warn" style="font-size:13px;padding:6px 10px">暂无完全匹配您体质的方剂，已推荐相近方剂</div>' : '') +
        (x.alternatives.length ? '<div class="alt">换一个：' + x.alternatives.map(function (a, i) { return '<button type="button" data-swap="' + meal + '|' + i + '">' + esc(a.recipe.name) + '</button>'; }).join('、') + '</div>' : '') +
        '</div>';
    },
    disclaimer: function () {
      return '<p class="disclaimer">推荐内容依据中医经典古籍及药食同源目录整理，仅供日常饮食参考，不能替代医疗诊治。<br>孕妇、儿童、慢性病患者及正在服药者请在医师指导下食用。</p>';
    }
  };
})(window);
