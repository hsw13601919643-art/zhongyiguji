/* =========================================================================
   M06 数据安全 — 登录与角色权限（验收项 M06-01）
   ⚠ 纯前端版为“演示级”权限：账号与校验均在浏览器端，懂技术的人可绕过，
     不具备真正的安全性。二期须改为服务端鉴权（见 m06-security/安全说明.md）。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;

  var PERMS = [
    ['dashboard', '工作台'], ['recipe.view', '查看药膳方'], ['recipe.edit', '新增/编辑药膳方'], ['recipe.import', '批量导入'],
    ['recipe.submit', '提交审核'], ['recipe.review', '审核（通过/驳回）'], ['recipe.publish', '发布/下架'], ['recipe.delete', '删除药膳方'],
    ['recipe.export', '导出数据'], ['rules.manage', '推荐规则配置'], ['users.view', '用户与推荐记录'], ['stats.view', '数据统计'],
    ['stats.demo', '生成/清除演示数据'], ['content.view', '查看科普内容'], ['content.edit', '编辑科普内容'], ['content.publish', '科普内容上下架'],
    ['logs.view', '操作日志'], ['backup.manage', '数据备份与恢复']
  ];
  var ROLES = {
    admin: { name: '系统管理员', perms: ['*'] },
    editor: { name: '数据录入员', perms: ['dashboard', 'recipe.view', 'recipe.edit', 'recipe.import', 'recipe.submit', 'content.view'] },
    reviewer: { name: '审核专家', perms: ['dashboard', 'recipe.view', 'recipe.review', 'recipe.export', 'stats.view'] },
    operator: { name: '内容运营', perms: ['dashboard', 'recipe.view', 'content.view', 'content.edit', 'content.publish', 'users.view', 'stats.view'] }
  };
  // 演示账号（二期改为服务端账号体系，密码加密存储）
  var ACCOUNTS = [
    { username: 'admin', password: 'admin123', name: '演示管理员', role: 'admin' },
    { username: 'editor', password: 'editor123', name: '演示录入员', role: 'editor' },
    { username: 'reviewer', password: 'review123', name: '演示审核专家', role: 'reviewer' },
    { username: 'operator', password: 'oper123', name: '演示运营', role: 'operator' }
  ];
  var MAX_FAIL = 5, LOCK_MIN = 5;

  function admin() { return YS.url('m03-admin/index.html'); }

  YS.auth = {
    PERMS: PERMS, ROLES: ROLES, ACCOUNTS: ACCOUNTS.map(function (a) { return { username: a.username, password: a.password, name: a.name, role: a.role }; }),
    user: function () { return YS.session.get('auth', null); },
    roleName: function (r) { return (ROLES[r] || {}).name || r; },
    /** 登录：返回 { ok, user, msg } */
    login: function (username, password) {
      var lock = YS.storage.get('login_lock', {});
      var rec = lock[username] || { fail: 0, until: 0 };
      if (rec.until > Date.now()) {
        var min = Math.ceil((rec.until - Date.now()) / 60000);
        YS.audit.log('登录', username, '账号锁定中，拒绝登录', '失败', { username: username, name: username, role: '' });
        return { ok: false, msg: '连续登录失败次数过多，请 ' + min + ' 分钟后再试' };
      }
      var acc = ACCOUNTS.filter(function (a) { return a.username === username && a.password === password; })[0];
      if (!acc) {
        rec.fail += 1;
        if (rec.fail >= MAX_FAIL) { rec.until = Date.now() + LOCK_MIN * 60000; rec.fail = 0; }
        lock[username] = rec;
        YS.storage.set('login_lock', lock);
        YS.audit.log('登录', username || '（空）', '用户名或密码错误', '失败', { username: username, name: username, role: '' });
        return { ok: false, msg: rec.until > Date.now() ? '连续失败 ' + MAX_FAIL + ' 次，账号锁定 ' + LOCK_MIN + ' 分钟' : '用户名或密码错误' };
      }
      delete lock[username];
      YS.storage.set('login_lock', lock);
      var u = { username: acc.username, name: acc.name, role: acc.role, loginAt: Date.now() };
      YS.session.set('auth', u);
      YS.audit.log('登录', acc.username, '登录成功', '成功');
      return { ok: true, user: u };
    },
    logout: function () {
      var u = YS.auth.user();
      if (u) YS.audit.log('退出', u.username, '退出登录', '成功');
      YS.session.remove('auth');
    },
    can: function (perm) {
      var u = YS.auth.user();
      if (!u) return false;
      var r = ROLES[u.role];
      return !!r && (r.perms.indexOf('*') >= 0 || r.perms.indexOf(perm) >= 0);
    },
    roleCan: function (role, perm) { var r = ROLES[role]; return !!r && (r.perms.indexOf('*') >= 0 || r.perms.indexOf(perm) >= 0); },
    permName: function (p) { var x = PERMS.filter(function (k) { return k[0] === p; })[0]; return x ? x[1] : p; },
    /** 页面级校验：未登录跳转登录页；无权限返回 false */
    require: function (perm) {
      var u = YS.auth.user();
      if (!u) { location.replace(admin() + '?next=' + encodeURIComponent(location.pathname + location.search)); return false; }
      if (perm && !YS.auth.can(perm)) {
        YS.audit.log('越权访问', location.pathname.split('/').pop(), '缺少权限：' + YS.auth.permName(perm), '拒绝');
        return false;
      }
      return true;
    },
    /** 操作级校验：无权限时提示并记录日志 */
    guard: function (perm, what) {
      if (YS.auth.can(perm)) return true;
      YS.audit.log('越权操作', what || perm, '缺少权限：' + YS.auth.permName(perm), '拒绝');
      YS.ui.toast('无权限：' + YS.auth.permName(perm) + '（已记录）', 'err');
      return false;
    }
  };
})(window);
