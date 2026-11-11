/* =========================================================================
   M03 管理端 — 公共外壳：登录校验、侧边菜单（按角色显示）、顶栏
   页面结构：<div id="adm-content"> 页面内容 </div>，由 YS.admin.init 包裹进布局。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS, esc = YS.util.esc;

  var MENU = [
    ['工作台', 'm03-admin/index.html', 'dashboard', 'home'],
    ['药膳方管理', 'm03-admin/recipes.html', 'recipe.view', 'recipes'],
    ['推荐规则配置', 'm03-admin/rules.html', 'rules.manage', 'rules'],
    ['用户与推荐记录', 'm03-admin/users.html', 'users.view', 'users'],
    ['数据统计', 'm03-admin/stats.html', 'stats.view', 'stats'],
    ['科普内容管理', 'm03-admin/content.html', 'content.view', 'content'],
    ['|数据安全'],
    ['操作日志', 'm06-security/logs.html', 'logs.view', 'logs'],
    ['数据备份与恢复', 'm06-security/backup.html', 'backup.manage', 'backup'],
    ['安全中心', 'm06-security/index.html', 'dashboard', 'security'],
    ['|快捷入口'],
    ['经典方库浏览', 'm01-database/index.html', null, 'db'],
    ['算法测试台', 'm04-engine/index.html', null, 'engine'],
    ['用户端', 'm02-user/index.html', null, 'user'],
    ['系统首页', 'index.html', null, 'portal']
  ];

  YS.admin = {
    /**
     * opts: { key: 菜单键, title: 页面标题, perm: 页面所需权限 }
     * 返回 true 表示可继续渲染页面
     */
    init: function (opts) {
      document.body.classList.add('adm-body');
      var content = document.getElementById('adm-content');
      var u = YS.auth.user();
      if (!u) { YS.auth.require(); return false; }
      var pending = YS.db.list('recipes').filter(function (r) { return r.status === 'pending'; }).length;

      var wrap = document.createElement('div');
      wrap.className = 'adm';
      var nav = MENU.map(function (m) {
        if (m[0].charAt(0) === '|') return '<div class="grp">' + esc(m[0].slice(1)) + '</div>';
        if (m[2] && !YS.auth.can(m[2])) return '';
        var badge = m[3] === 'recipes' && pending && YS.auth.can('recipe.review') ? '<span class="n">' + pending + '</span>' : '';
        return '<a href="' + esc(YS.url(m[1])) + '"' + (m[3] === opts.key ? ' class="on" aria-current="page"' : '') + '>' + esc(m[0]) + badge + '</a>';
      }).join('');
      wrap.innerHTML =
        '<aside class="adm-side" id="adm-side"><div class="adm-brand"><span class="mk">膳</span><span><b>药膳系统管理端</b><small>M03 · 纯前端演示版</small></span></div>' +
        '<nav class="adm-nav">' + nav + '</nav><div class="foot">数据保存在本机浏览器<br>V' + YS.version + '</div></aside>' +
        '<div class="adm-main"><header class="adm-head"><button class="adm-menu" id="adm-menu" aria-label="菜单">☰</button><h1>' + esc(opts.title || '') + '</h1>' +
        '<div class="who"><span class="nm">' + esc(u.name) + '</span><span class="badge primary">' + esc(YS.auth.roleName(u.role)) + '</span><button class="btn sm" id="adm-logout">退出</button></div></header>' +
        '<div class="adm-content" id="adm-slot"></div></div>';
      document.body.insertBefore(wrap, document.body.firstChild);
      document.getElementById('adm-slot').appendChild(content);
      content.classList.remove('hidden');
      document.getElementById('adm-logout').onclick = function () { YS.auth.logout(); location.href = YS.url('m03-admin/index.html'); };
      document.getElementById('adm-menu').onclick = function () { document.getElementById('adm-side').classList.toggle('open'); };
      document.title = (opts.title || '管理端') + ' · 药膳系统管理端';

      if (opts.perm && !YS.auth.require(opts.perm)) {
        content.innerHTML = '<div class="card denied"><h2>无访问权限</h2><p class="text-2">当前角色“' + esc(YS.auth.roleName(u.role)) + '”没有“' + esc(YS.auth.permName(opts.perm)) +
          '”权限。本次访问已记录到操作日志。</p><a class="btn primary" href="' + esc(YS.url('m03-admin/index.html')) + '">返回工作台</a></div>';
        return false;
      }
      return true;
    },
    /** 分页器 */
    pager: function (el, total, page, size, onChange) {
      var pages = Math.max(1, Math.ceil(total / size));
      el.innerHTML = '<div class="row between mt-1" style="font-size:13px"><span class="muted">共 ' + total + ' 条 · 第 ' + page + ' / ' + pages + ' 页</span>' +
        '<span class="row tight"><button class="btn sm" data-p="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>上一页</button>' +
        '<button class="btn sm" data-p="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>下一页</button></span></div>';
      el.onclick = function (e) { var b = e.target.closest('[data-p]'); if (b && !b.disabled) onChange(Number(b.getAttribute('data-p'))); };
    },
    rangeStart: function (days) { if (!days) return 0; var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() - (days - 1) * 864e5; }
  };
})(window);
