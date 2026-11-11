/* =========================================================================
   M03 管理端 — 演示数据生成（仅用于展示统计功能，所有记录带 demo 标记，可一键清除）
   纯前端版只能看到本机产生的数据；二期接入服务器后统计为全部用户的真实数据。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function weighted(r, items) { var x = r(), s = 0; for (var i = 0; i < items.length; i++) { s += items[i][1]; if (x <= s) return items[i][0]; } return items[items.length - 1][0]; }

  var CON = [['平和质', .25], ['气虚质', .15], ['阳虚质', .12], ['阴虚质', .10], ['痰湿质', .10], ['湿热质', .08], ['血瘀质', .06], ['气郁质', .08], ['特禀质', .06]];
  var AGE = [['老年', .42], ['中年', .30], ['青年', .23], ['青少年', .03], ['儿童', .02]];
  var SRC = [['社区-示例街道', .3], ['长者食堂-示例点位', .3], ['食养机构-示例', .15], ['', .25]];
  var PAGES = [['首页', .3], ['推荐', .3], ['体质测评', .12], ['详情', .15], ['科普', .1], ['收藏', .03]];
  var ORG = [['', .55], ['脾', .15], ['肾', .1], ['肝', .08], ['肺', .07], ['心', .05]];

  YS.demoData = {
    generate: function (days) {
      days = days || 60;
      YS.demoData.clear();
      var r = rng(20261111);
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var start = today.getTime() - (days - 1) * 864e5;
      var users = [];
      for (var i = 0; i < 48; i++) {
        users.push({
          id: 'DEMO-' + ('00' + (i + 1)).slice(-3), constitution: r() < .85 ? weighted(r, CON) : '', secondary: [], gender: r() < .62 ? '女' : '男',
          ageGroup: weighted(r, AGE), region: r() < .88 ? '江南' : weighted(r, [['华北', .4], ['岭南', .3], ['西南', .3]]),
          testedAt: null, firstSeen: start + Math.floor(r() * days * .8) * 864e5 + Math.floor(r() * 864e5), lastSeen: 0, src: weighted(r, SRC), demo: true
        });
      }
      var visits = YS.storage.get('visits', []), recs = YS.storage.get('c_reclogs', []), tests = YS.storage.get('c_testlogs', []);
      for (var d = 0; d < days; d++) {
        var day = start + d * 864e5, date = new Date(day);
        var weekend = date.getDay() === 0 || date.getDay() === 6;
        var growth = .6 + .8 * d / days;
        var active = users.filter(function (u) { return u.firstSeen <= day + 864e5; });
        if (!active.length) continue;
        var nv = Math.round((18 + r() * 30) * growth * (weekend ? .7 : 1));
        for (var k = 0; k < nv; k++) {
          var u = active[Math.floor(r() * active.length)];
          var t = day + Math.floor((7 + r() * 13) * 3600e3);
          visits.push({ t: t, uid: u.id, page: weighted(r, PAGES), src: u.src, demo: true });
          if (t > u.lastSeen) u.lastSeen = t;
        }
        var nr = Math.round((6 + r() * 14) * growth);
        var term = YS.solar.termOf(date);
        for (var j = 0; j < nr; j++) {
          var uu = active[Math.floor(r() * active.length)];
          var input = { constitution: uu.constitution, term: term, organ: weighted(r, ORG), age: uu.ageGroup, region: uu.region };
          var res = YS.engine.recommend(input);
          var picks = ['早', '午', '晚'].map(function (m) { var x = res.meals[m]; return x.pick ? { meal: m, id: x.pick.recipe.id, name: x.pick.recipe.name } : null; }).filter(Boolean);
          recs.push({ id: YS.util.uid('RL'), t: day + Math.floor((6 + r() * 15) * 3600e3), uid: uu.id, src: uu.src, input: input, picks: picks, ms: Math.round(res.elapsedMs * 100) / 100, mode: r() < .85 ? '三餐' : '四季', demo: true });
        }
        var nt = Math.floor(r() * 4);
        for (var q = 0; q < nt; q++) {
          var ut = active[Math.floor(r() * active.length)];
          if (!ut.constitution) continue;
          ut.testedAt = ut.testedAt || day + 3600e3 * 10;
          tests.push({ t: day + Math.floor(r() * 864e5), uid: ut.id, result: ut.constitution, src: ut.src, demo: true });
        }
      }
      users.forEach(function (u) { if (!u.lastSeen) u.lastSeen = u.firstSeen; });
      visits.sort(function (a, b) { return a.t - b.t; });
      recs.sort(function (a, b) { return a.t - b.t; });
      YS.storage.set('visits', visits.slice(-8000));
      YS.storage.set('c_reclogs', recs.slice(-8000));
      YS.storage.set('c_testlogs', tests.slice(-3000));
      YS.storage.set('c_users', YS.storage.get('c_users', []).concat(users));
      return { users: users.length, visits: visits.length, recs: recs.length };
    },
    clear: function () {
      function strip(k) { YS.storage.set(k, YS.storage.get(k, []).filter(function (x) { return !x.demo; })); }
      ['visits', 'c_reclogs', 'c_testlogs', 'c_users'].forEach(strip);
    },
    has: function () { return YS.storage.get('c_users', []).some(function (u) { return u.demo; }); }
  };
})(window);
