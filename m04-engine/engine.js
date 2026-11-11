/* =========================================================================
   M04 推荐算法 — “规则引擎 ＋ 标签匹配”（方案 4.2(3)）
   流程：① 只取“已发布”方剂 → ② 按《药食同源目录》过滤（目录外药材不推荐）
        → ③ 标签匹配打分（体质 > 脏腑 > 节气/季节 > 年龄 > 五行色味）
        → ④ 规则引擎加减分（应体、应时、应地及方案示例规则）
        → ⑤ 按早、午、晚分配，避免同一方剂重复（无更优选择时允许重复）
   分值分层设计：上一层的分值大于下面各层之和，保证“辨体施膳”优先，结果可解释。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;

  var W = {
    constitution: 200,   // 体质匹配
    organ: 80,           // 脏腑匹配
    term: 50,            // 精确匹配节气
    season: 40,          // 匹配季节
    seasonal: 5,         // 时令方（非四季通用）加分
    age: 10,             // 年龄段匹配
    wxColor: 5,          // 五行：五色对应
    wxTaste: 5,          // 五行：五味对应
    ruleCap: 30,         // 规则加分上限
    reuse: 40            // 同一方案中重复使用的扣分（仅在同一匹配层级内比较）
  };
  var MEALS = ['早', '午', '晚'];

  function has(arr, v) { return !!(arr && v && arr.indexOf(v) >= 0); }

  function context(input) {
    input = input || {};
    var term = input.term || YS.solar.termOf(input.date || new Date());
    var season = YS.solar.seasonOf(term);
    return {
      constitution: input.constitution || '', organ: input.organ || '', term: term, season: season,
      wxSeason: YS.solar.isChangxia(term) ? '长夏' : season,
      age: input.age || '', region: input.region || ''
    };
  }

  function ruleMatches(rule, ctx) {
    if (!rule || rule.enabled === false) return false;
    var w = rule.when || {};
    function ok(list, v) { return !list || !list.length || has(list, v); }
    return ok(w.seasons, ctx.season) && ok(w.terms, ctx.term) && ok(w.organs, ctx.organ) &&
      ok(w.constitutions, ctx.constitution) && ok(w.ages, ctx.age) && ok(w.regions, ctx.region);
  }

  /** 方剂命中规则偏好/规避项，返回命中的标签文字 */
  function hits(spec, r) {
    if (!spec) return [];
    var out = [];
    (spec.tags || []).forEach(function (t) { if (has(r.tags, t)) out.push(t); });
    (spec.tastes || []).forEach(function (t) { if (has(r.tastes, t)) out.push(t + '味'); });
    (spec.colors || []).forEach(function (t) { if (has(r.colors, t)) out.push(t + '色'); });
    (spec.natures || []).forEach(function (t) { if (r.nature === t) out.push('性' + t); });
    (spec.categories || []).forEach(function (t) { if (r.category === t) out.push(t); });
    (spec.ingredients || []).forEach(function (t) {
      (r.composition || []).forEach(function (c) { if ((c.name || '').indexOf(t) >= 0 || (c.std || '').indexOf(t) >= 0) out.push(c.name); });
    });
    return YS.util.uniq(out);
  }

  function score(r, ctx, rules) {
    var s = 0, reasons = [], applied = [];
    var m = { constitution: false, organ: false, season: false };
    if (ctx.constitution && has(r.constitutions, ctx.constitution)) { s += W.constitution; m.constitution = true; reasons.push('体质：' + ctx.constitution); }
    if (ctx.organ && has(r.organs, ctx.organ)) { s += W.organ; m.organ = true; reasons.push('调补' + ctx.organ); }
    if (has(r.terms, ctx.term)) { s += W.term; m.season = true; reasons.push('节气：' + ctx.term); }
    else if (has(r.seasons, ctx.season)) { s += W.season; m.season = true; reasons.push((r.seasons.length === 4 ? '四季皆宜' : ctx.season + '季')); }
    if (m.season && r.seasons && r.seasons.length < 4) s += W.seasonal;
    if (ctx.age && has(r.ages, ctx.age)) { s += W.age; reasons.push('适合' + ctx.age); }

    // 五行：所选脏腑及当令季节对应的五色、五味
    var wxs = YS.dict.seasonWuxing[ctx.wxSeason] || {};
    var org = ctx.organ ? YS.dict.organ(ctx.organ) : null;
    var colors = YS.util.uniq([org && org.color, wxs.color].filter(Boolean));
    var tastes = YS.util.uniq([org && org.taste, wxs.taste].filter(Boolean));
    var wxHit = [];
    if (colors.some(function (c) { return has(r.colors, c); })) { s += W.wxColor; wxHit.push(colors.filter(function (c) { return has(r.colors, c); }).join('') + '色'); }
    if (tastes.some(function (t) { return has(r.tastes, t); })) { s += W.wxTaste; wxHit.push(tastes.filter(function (t) { return has(r.tastes, t); }).join('') + '味'); }
    if (wxHit.length) reasons.push('五行：' + wxHit.join('·'));

    // 规则引擎
    var bonus = 0;
    (rules || []).forEach(function (rule) {
      if (!ruleMatches(rule, ctx)) return;
      var p = hits(rule.prefer, r), a = hits(rule.avoid, r);
      var w = Number(rule.weight) || 0;
      if (p.length) { bonus += w; applied.push({ id: rule.id, name: rule.name, type: 'prefer', hits: p, weight: w }); }
      if (a.length) { s -= w; applied.push({ id: rule.id, name: rule.name, type: 'avoid', hits: a, weight: -w }); }
    });
    s += Math.min(bonus, W.ruleCap);
    return { score: s, reasons: reasons, rules: applied, matched: m };
  }

  function candidates(recipes, settings) {
    var ok = [], filtered = [];
    (recipes || []).forEach(function (r) {
      if (r.status !== 'published') return;
      var cp = YS.model.compliance(r);
      if (!cp.ok) {
        if (settings.complianceMode === 'flag') { ok.push(r); return; }
        filtered.push({ recipe: r, reason: cp.text });
        return;
      }
      ok.push(r);
    });
    return { ok: ok, filtered: filtered };
  }

  /**
   * 三餐推荐
   * input: { constitution, term, organ, age, region, date }
   * opts:  { recipes, rules, settings }（缺省读取本地数据库）
   */
  function recommend(input, opts) {
    opts = opts || {};
    var t0 = YS.util.now();
    var ctx = context(input);
    var rules = opts.rules || YS.db.list('rules');
    var settings = opts.settings || YS.engineSettings.get();
    var cand = candidates(opts.recipes || YS.db.list('recipes'), settings);
    var scored = cand.ok.map(function (r) {
      var x = score(r, ctx, rules);
      x.recipe = r;
      x.flagged = !YS.model.compliance(r).ok;
      return x;
    }).sort(function (a, b) { return b.score - a.score || (a.recipe.id < b.recipe.id ? -1 : 1); });

    // 匹配层级：体质 4 + 脏腑 2 + 节气/季节 1。去重只在同一层级内进行，绝不以牺牲匹配度换取多样性。
    function tier(x) { return (x.matched.constitution ? 4 : 0) + (x.matched.organ ? 2 : 0) + (x.matched.season ? 1 : 0); }
    var used = {}, meals = {}, nAlt = settings.alternatives || 2;
    MEALS.forEach(function (meal) {
      var list = scored.filter(function (x) { return has(x.recipe.meals, meal); })
        .map(function (x) { return { x: x, tier: tier(x), adj: x.score - (used[x.recipe.id] ? W.reuse : 0) }; })
        .sort(function (a, b) { return b.tier - a.tier || b.adj - a.adj || (a.x.recipe.id < b.x.recipe.id ? -1 : 1); });
      if (!list.length) { meals[meal] = { pick: null, alternatives: [] }; return; }
      var pick = list[0].x;
      used[pick.recipe.id] = true;
      meals[meal] = {
        pick: pick,
        alternatives: list.slice(1, 1 + nAlt).map(function (y) { return y.x; }),
        exact: !ctx.constitution || pick.matched.constitution
      };
    });

    return {
      input: input, ctx: ctx, meals: meals,
      appliedRules: rules.filter(function (r) { return ruleMatches(r, ctx); }).map(function (r) { return { id: r.id, name: r.name, group: r.group }; }),
      filtered: cand.filtered, candidates: scored.length, ranking: scored,
      elapsedMs: YS.util.now() - t0
    };
  }

  /** 四季方案：分别以春分、夏至、秋分、冬至为代表节气生成三餐方案 */
  function seasonal(input, opts) {
    var t0 = YS.util.now();
    var rep = { 春: '春分', 夏: '夏至', 秋: '秋分', 冬: '冬至' };
    var out = {};
    YS.dict.seasons.forEach(function (s) {
      var inp = {};
      for (var k in input) inp[k] = input[k];
      inp.term = rep[s];
      out[s] = recommend(inp, opts);
    });
    return { seasons: out, elapsedMs: YS.util.now() - t0 };
  }

  YS.engine = { WEIGHTS: W, context: context, ruleMatches: ruleMatches, hits: hits, score: score, recommend: recommend, seasonal: seasonal };
})(window);
