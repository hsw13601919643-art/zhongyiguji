/* =========================================================================
   M06 数据安全 — 操作日志（验收项 M06-02）
   记录：操作人、角色、时间、操作类型、对象、内容、结果。保留最近 3000 条。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;
  var KEY = 'c_audit', MAX = 3000;

  YS.audit = {
    /**
     * @param action 操作类型（如 新增药膳方 / 审核通过 / 登录）
     * @param target 操作对象（如 YS0001 当归生姜羊肉汤）
     * @param detail 内容说明
     * @param result 成功 / 失败 / 拒绝
     * @param who    可选，未登录时指定操作人
     */
    log: function (action, target, detail, result, who) {
      var u = who || (YS.auth && YS.auth.user()) || { username: '（未登录）', name: '', role: '' };
      var list = YS.storage.get(KEY, []);
      list.push({
        id: YS.util.uid('LG'), t: Date.now(), username: u.username, name: u.name || '', role: u.role || '',
        action: action, target: target || '', detail: detail || '', result: result || '成功',
        ua: (global.navigator.userAgent || '').slice(0, 120)
      });
      if (list.length > MAX) list = list.slice(list.length - MAX);
      YS.storage.set(KEY, list);
    },
    list: function () { return YS.storage.get(KEY, []); }
  };
})(window);
