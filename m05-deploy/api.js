/* =========================================================================
   M05 系统集成 — 预留接口（验收项 M05-04）
   一期：在浏览器内模拟，返回结构与二期服务器接口完全一致（见《接口文档》）。
   二期：同名方法改为调用 HTTPS 接口（fetch），调用方代码无需修改。
   统一返回：{ code: 0 成功 / 非 0 失败, message, data, requestId, elapsedMs }
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;

  function ok(data, t0) { return Promise.resolve({ code: 0, message: 'ok', data: data, requestId: YS.util.uid('REQ'), elapsedMs: Math.round((YS.util.now() - t0) * 100) / 100 }); }
  function fail(code, msg) { return Promise.resolve({ code: code, message: msg, data: null, requestId: YS.util.uid('REQ') }); }

  /** 对外输出的药膳方（不含审核流程等内部字段） */
  function pub(r) {
    var cp = YS.model.compliance(r);
    return {
      id: r.id, name: r.name, alias: r.alias, source: YS.model.sourceText(r), original: r.source.original,
      composition: r.composition.map(function (c) { return { name: c.name, amount: c.amount, type: c.type }; }),
      efficacy: r.efficacy, indication: r.indication, ages: r.ages, constitutions: r.constitutions, organs: r.organs,
      seasons: r.seasons, terms: r.terms, meals: r.meals, category: r.category, nature: r.nature,
      yaoshi: { compliant: cp.ok, note: cp.text }, method: r.method, cautions: r.cautions, sample: !!r.sample
    };
  }
  function brief(x) { return x ? { id: x.recipe.id, name: x.recipe.name, efficacy: x.recipe.efficacy, category: x.recipe.category, reasons: x.reasons } : null; }
  function plan(res) {
    var out = {};
    ['早', '午', '晚'].forEach(function (m) { var x = res.meals[m]; out[{ 早: 'breakfast', 午: 'lunch', 晚: 'dinner' }[m]] = { pick: brief(x.pick), alternatives: x.alternatives.map(brief) }; });
    return { term: res.ctx.term, season: res.ctx.season, meals: out, appliedRules: res.appliedRules.map(function (r) { return r.id; }), filtered: res.filtered.length };
  }
  function check(body, key, list) { return !body[key] || list.indexOf(body[key]) >= 0; }

  var ENDPOINTS = [
    { id: 'recommend', method: 'POST', path: '/api/v1/recommend', name: '三餐推荐', sample: { constitution: '气虚质', term: '立冬', organ: '脾', age: '老年', region: '江南' } },
    { id: 'seasonal', method: 'POST', path: '/api/v1/recommend/seasonal', name: '四季方案', sample: { constitution: '阳虚质', organ: '肾' } },
    { id: 'canteenMenu', method: 'POST', path: '/api/v1/canteen/menu', name: '长者食堂每日菜单', sample: { date: '', region: '江南', age: '老年', constitutions: ['平和质', '气虚质', '阳虚质'] } },
    { id: 'listRecipes', method: 'GET', path: '/api/v1/recipes', name: '药膳方检索', sample: { keyword: '', constitution: '阴虚质', organ: '', season: '秋', page: 1, size: 10 } },
    { id: 'getRecipe', method: 'GET', path: '/api/v1/recipes/{id}', name: '药膳方详情', sample: { id: 'YS0001' } },
    { id: 'evaluateConstitution', method: 'POST', path: '/api/v1/constitution/evaluate', name: '体质判定（第三方问卷对接）', sample: { answers: '（省略：60 题答案，键为题号 q1—q60，值为 1—5）', simulate: '气郁质' } },
    { id: 'solarTerm', method: 'GET', path: '/api/v1/solar-term', name: '当前节气', sample: { date: '' } },
    { id: 'yaoshiList', method: 'GET', path: '/api/v1/yaoshi', name: '药食同源目录', sample: { keyword: '枣' } }
  ];

  var D = function () { return YS.dict; };
  YS.api = {
    ENDPOINTS: ENDPOINTS,
    recommend: function (b) {
      var t0 = YS.util.now(); b = b || {};
      if (!check(b, 'constitution', D().names('constitutions'))) return fail(40001, 'constitution 取值不正确');
      if (!check(b, 'organ', D().names('organs'))) return fail(40002, 'organ 取值不正确');
      if (!check(b, 'term', YS.solar.ORDER)) return fail(40003, 'term 取值不正确');
      return ok(plan(YS.engine.recommend(b)), t0);
    },
    seasonal: function (b) {
      var t0 = YS.util.now(); var s = YS.engine.seasonal(b || {}), out = {};
      Object.keys(s.seasons).forEach(function (k) { out[k] = plan(s.seasons[k]); });
      return ok(out, t0);
    },
    canteenMenu: function (b) {
      var t0 = YS.util.now(); b = b || {};
      var date = b.date ? new Date(b.date) : new Date();
      if (isNaN(date)) return fail(40004, 'date 格式应为 YYYY-MM-DD');
      var term = YS.solar.termOf(date);
      var cons = (b.constitutions && b.constitutions.length ? b.constitutions : ['平和质']);
      var menus = cons.map(function (c) { return { constitution: c, plan: plan(YS.engine.recommend({ constitution: c, term: term, age: b.age || '老年', region: b.region || '江南' })) }; });
      return ok({ date: YS.util.fmtDate(date), term: term, tip: YS.dict.termTips[term], menus: menus }, t0);
    },
    listRecipes: function (q) {
      var t0 = YS.util.now(); q = q || {};
      var rows = YS.db.list('recipes').filter(function (r) {
        return r.status === 'published' && (!q.constitution || r.constitutions.indexOf(q.constitution) >= 0) && (!q.organ || r.organs.indexOf(q.organ) >= 0) &&
          (!q.season || r.seasons.indexOf(q.season) >= 0) && (!q.keyword || (r.name + r.efficacy + YS.model.compText(r)).indexOf(q.keyword) >= 0);
      });
      var size = Math.min(Number(q.size) || 20, 100), page = Math.max(Number(q.page) || 1, 1);
      return ok({ total: rows.length, page: page, size: size, items: rows.slice((page - 1) * size, page * size).map(pub) }, t0);
    },
    getRecipe: function (q) {
      var t0 = YS.util.now(); var r = YS.db.get('recipes', (q || {}).id);
      if (!r || r.status !== 'published') return fail(40400, '药膳方不存在或未发布');
      return ok(pub(r), t0);
    },
    evaluateConstitution: function (b) {
      var t0 = YS.util.now(); b = b || {};
      var ans = b.simulate && YS.constitutionTest ? YS.constitutionTest.simulate(b.simulate) : b.answers;
      if (!ans || typeof ans !== 'object') return fail(40005, 'answers 须为对象，键为题号，值为 1—5');
      var ev = YS.constitutionTest.evaluate(ans);
      if (ev.missing.length) return fail(40006, '缺少 ' + ev.missing.length + ' 道题的答案');
      return ok({ primary: ev.primary, secondary: ev.secondary, scores: ev.scores, judge: ev.judge }, t0);
    },
    solarTerm: function (q) {
      var t0 = YS.util.now(); var d = q && q.date ? new Date(q.date) : new Date();
      if (isNaN(d)) return fail(40004, 'date 格式应为 YYYY-MM-DD');
      var term = YS.solar.termOf(d), nx = YS.solar.next(d);
      return ok({ date: YS.util.fmtDate(d), term: term, season: YS.solar.seasonOf(term), tip: YS.dict.termTips[term], next: nx ? { term: nx.name, date: YS.util.fmtDate(nx.date), days: nx.days } : null }, t0);
    },
    yaoshiList: function (q) {
      var t0 = YS.util.now(); var k = (q || {}).keyword || '';
      return ok(YS.model.yaoshi().filter(function (y) { return !k || y.name.indexOf(k) >= 0 || y.aliases.join('').indexOf(k) >= 0; }), t0);
    }
  };
})(window);
