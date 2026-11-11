/* =========================================================================
   二十四节气计算（21 世纪通式：[Y×D + C] − L，含已知例外修正）
   适用年份：2001—2099。用于“默认当前节气”（验收项 M02-02）。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS = global.YS || {};

  // 按公历月份排列：名称、月份、21 世纪 C 值
  var TERMS = [
    ['小寒', 1, 5.4055], ['大寒', 1, 20.12], ['立春', 2, 3.87], ['雨水', 2, 18.73],
    ['惊蛰', 3, 5.63], ['春分', 3, 20.646], ['清明', 4, 4.81], ['谷雨', 4, 20.1],
    ['立夏', 5, 5.52], ['小满', 5, 21.04], ['芒种', 6, 5.678], ['夏至', 6, 21.37],
    ['小暑', 7, 7.108], ['大暑', 7, 22.83], ['立秋', 8, 7.5], ['处暑', 8, 23.13],
    ['白露', 9, 7.646], ['秋分', 9, 23.042], ['寒露', 10, 8.318], ['霜降', 10, 23.438],
    ['立冬', 11, 7.438], ['小雪', 11, 22.36], ['大雪', 12, 7.18], ['冬至', 12, 21.94]
  ];
  // 已知例外（年份-节气 → 日期修正）
  var FIX = {
    '2019小寒': -1, '2082大寒': 1, '2026雨水': -1, '2084春分': 1, '2008小满': 1,
    '2016小暑': 1, '2002立秋': 1, '2089霜降': 1, '2089立冬': 1, '2021冬至': -1
  };
  // 展示顺序（自立春起）
  var ORDER = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'];
  var SEASON = {};
  ORDER.forEach(function (n, i) { SEASON[n] = ['春', '夏', '秋', '冬'][Math.floor(i / 6)]; });

  function dateOf(year, name) {
    for (var i = 0; i < TERMS.length; i++) {
      if (TERMS[i][0] !== name) continue;
      var y = year % 100;
      var early = TERMS[i][1] <= 2; // 1、2 月节气按上一年闰年数修正
      var L = Math.floor((early ? y - 1 : y) / 4);
      var day = Math.floor(y * 0.2422 + TERMS[i][2]) - L + (FIX[year + name] || 0);
      return new Date(year, TERMS[i][1] - 1, day);
    }
    return null;
  }
  function yearTerms(year) {
    return TERMS.map(function (t) { return { name: t[0], date: dateOf(year, t[0]) }; });
  }
  function startOfDay(d) { d = d ? new Date(d) : new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  /** 返回某日所属节气（该日之前最近的一个节气） */
  function termOf(d) {
    d = startOfDay(d);
    var list = yearTerms(d.getFullYear());
    var cur = null;
    for (var i = 0; i < list.length; i++) if (list[i].date <= d) cur = list[i];
    if (!cur) cur = { name: '冬至', date: dateOf(d.getFullYear() - 1, '冬至') };
    return cur.name;
  }
  function next(d) {
    d = startOfDay(d);
    var list = yearTerms(d.getFullYear()).concat(yearTerms(d.getFullYear() + 1));
    for (var i = 0; i < list.length; i++) {
      if (list[i].date > d) return { name: list[i].name, date: list[i].date, days: Math.round((list[i].date - d) / 864e5) };
    }
    return null;
  }

  YS.solar = {
    ORDER: ORDER,
    dateOf: dateOf,
    yearTerms: yearTerms,
    termOf: termOf,
    next: next,
    seasonOf: function (term) { return SEASON[term] || ''; },
    /** 长夏（小暑、大暑）——五行属土、应脾 */
    isChangxia: function (term) { return term === '小暑' || term === '大暑'; },
    termsOfSeason: function (season) { return ORDER.filter(function (n) { return SEASON[n] === season; }); },
    /** 当前节气的起始日期 */
    startOf: function (term, refDate) {
      refDate = startOfDay(refDate);
      var d = dateOf(refDate.getFullYear(), term);
      if (d > refDate) d = dateOf(refDate.getFullYear() - 1, term);
      return d;
    }
  };
})(window);
