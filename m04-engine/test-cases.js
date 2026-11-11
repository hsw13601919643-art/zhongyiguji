/* =========================================================================
   M04 推荐算法 — 覆盖测试用例（与验收表《推荐覆盖测试》43 个用例一一对应）
   A 组：九种体质（模拟问卷作答 → 判定 → 推荐，三餐首选方剂均须含该体质）
   B 组：二十四节气（三餐首选方剂均须适用该节气或所在季节）
   C 组：五脏调理（三餐首选方剂均须调补该脏）
   R 组：方案 4.2(3) 典型规则、药食同源合规过滤、默认当前节气
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;

  function picks(res) {
    return ['早', '午', '晚'].map(function (m) { var x = res.meals[m]; return x && x.pick ? x.pick : null; });
  }
  function names(res) {
    return picks(res).map(function (p, i) { return ['早', '午', '晚'][i] + '：' + (p ? p.recipe.name : '无'); }).join('；');
  }
  function allMeals(res, fn) { return picks(res).every(function (p) { return p && fn(p); }); }

  function build(today) {
    today = today || new Date();
    var cur = YS.solar.termOf(today);
    var cases = [];

    YS.constitutionTest.ORDER.forEach(function (t, i) {
      cases.push({
        id: 'A' + ('0' + (i + 1)).slice(-2), group: 'A组 九种体质', item: t,
        input: '按' + t + '特征作答体质问卷；节气＝当前（' + cur + '）；脏腑不限',
        expect: '问卷判定为' + t + '；三餐首选方剂“适用体质”均含' + t,
        run: function () {
          var t0 = YS.util.now();
          var ev = YS.constitutionTest.evaluate(YS.constitutionTest.simulate(t));
          var res = YS.engine.recommend({ constitution: ev.primary, term: cur });
          var ok = ev.primary === t && allMeals(res, function (p) { return p.matched.constitution; });
          return { pass: ok, actual: '判定：' + ev.primary + '（' + ev.scores[t] + '分）；' + names(res), ms: YS.util.now() - t0 };
        }
      });
    });

    YS.solar.ORDER.forEach(function (term, i) {
      var season = YS.solar.seasonOf(term);
      cases.push({
        id: 'B' + ('0' + (i + 1)).slice(-2), group: 'B组 二十四节气', item: term + '（' + season + '）',
        input: '手动切换节气为' + term + '；体质、脏腑不限',
        expect: '三餐首选方剂“适用节气”含' + term + '或' + season + '季',
        run: function () {
          var res = YS.engine.recommend({ term: term });
          return { pass: allMeals(res, function (p) { return p.matched.season; }), actual: names(res), ms: res.elapsedMs };
        }
      });
    });

    YS.dict.names('organs').forEach(function (o, i) {
      cases.push({
        id: 'C0' + (i + 1), group: 'C组 五脏调理', item: o,
        input: '调理脏腑＝' + o + '；节气＝当前（' + cur + '）；体质不限',
        expect: '三餐首选方剂“调补脏腑”均含' + o,
        run: function () {
          var res = YS.engine.recommend({ organ: o, term: cur });
          return { pass: allMeals(res, function (p) { return p.matched.organ; }), actual: names(res), ms: res.elapsedMs };
        }
      });
    });

    function ruleCase(id, item, input, ruleId, expect) {
      cases.push({
        id: id, group: 'R组 典型规则', item: item, input: input.text, expect: expect,
        run: function () {
          var rule = YS.db.list('rules').filter(function (r) { return r.id === ruleId; })[0];
          var res = YS.engine.recommend(input.params);
          if (!rule) return { pass: false, actual: '规则 ' + ruleId + ' 不存在（可在规则配置中恢复默认规则）', ms: res.elapsedMs };
          var applied = res.appliedRules.some(function (r) { return r.id === ruleId; });
          var hit = picks(res).filter(function (p) { return p && YS.engine.hits(rule.prefer, p.recipe).length; });
          return {
            pass: applied && hit.length > 0,
            actual: (applied ? '规则' + ruleId + '已触发' : '规则未触发') + '；' + names(res) +
              (hit.length ? '（命中：' + hit.map(function (p) { return p.recipe.name + '·' + YS.engine.hits(rule.prefer, p.recipe).join('/'); }).join('，') + '）' : ''),
            ms: res.elapsedMs
          };
        }
      });
    }
    ruleCase('R1', '春季＋肝＋气郁', { text: '节气＝春分；脏腑＝肝；体质＝气郁质', params: { term: '春分', organ: '肝', constitution: '气郁质' } }, 'R01', '推荐疏肝理气、酸味青色食材药膳');
    ruleCase('R2', '冬季＋肾＋阳虚', { text: '节气＝冬至；脏腑＝肾；体质＝阳虚质', params: { term: '冬至', organ: '肾', constitution: '阳虚质' } }, 'R02', '推荐温补肾阳、黑色食材药膳');
    ruleCase('R3', '老年＋脾＋气虚', { text: '年龄段＝老年；脏腑＝脾；体质＝气虚质；节气＝当前', params: { age: '老年', organ: '脾', constitution: '气虚质', term: cur } }, 'R03', '推荐健脾益气、易消化药膳');

    cases.push({
      id: 'R4', group: 'R组 典型规则', item: '药食同源合规过滤',
      input: '临时加入1首含目录外药材（附子）且各项条件全匹配的测试方，以相同条件请求推荐（不写入数据库）',
      expect: '测试方不出现在推荐结果中，并列入“已过滤”清单',
      run: function () {
        var test = YS.model.blank();
        test.id = 'TEST-R4'; test.name = '【测试】附子羊肉汤'; test.status = 'published';
        test.source.book = '测试'; test.efficacy = '测试';
        test.composition = [{ name: '附子', std: '', amount: '9克', type: '药' }, { name: '羊肉', std: '', amount: '500克', type: '食' }];
        test.constitutions = YS.dict.names('constitutions'); test.organs = YS.dict.names('organs');
        test.seasons = ['春', '夏', '秋', '冬']; test.meals = ['早', '午', '晚']; test.ages = YS.dict.names('ages');
        test.tags = ['温补', '补肾', '温阳']; test.nature = '平';
        var recipes = YS.db.list('recipes').concat([test]);
        var res = YS.engine.recommend({ constitution: '阳虚质', organ: '肾', term: '冬至' }, { recipes: recipes, settings: { complianceMode: 'exclude', alternatives: 2 } });
        var inResult = ['早', '午', '晚'].some(function (m) {
          var x = res.meals[m];
          return x && ((x.pick && x.pick.recipe.id === test.id) || x.alternatives.some(function (a) { return a.recipe.id === test.id; }));
        });
        var filtered = res.filtered.some(function (f) { return f.recipe.id === test.id; });
        return { pass: !inResult && filtered, actual: (inResult ? '测试方出现在结果中' : '测试方未出现') + '；已过滤：' + res.filtered.map(function (f) { return f.recipe.name; }).join('、'), ms: res.elapsedMs };
      }
    });

    cases.push({
      id: 'R5', group: 'R组 典型规则', item: '默认当前节气',
      input: '不选择节气直接请求推荐；并核对已知节气日期',
      expect: '默认使用当天所属节气；节气日期与历书一致',
      run: function () {
        var t0 = YS.util.now();
        var known = [[2025, '立春', '2025-02-03'], [2025, '冬至', '2025-12-21'], [2026, '雨水', '2026-02-18'], [2026, '立冬', '2026-11-07'], [2026, '冬至', '2026-12-22'], [2027, '立春', '2027-02-04']];
        var bad = known.filter(function (k) { return YS.util.fmtDate(YS.solar.dateOf(k[0], k[1])) !== k[2]; });
        var res = YS.engine.recommend({});
        var ok = !bad.length && res.ctx.term === cur;
        return { pass: ok, actual: '默认节气：' + res.ctx.term + '（' + YS.util.fmtDate(today) + '）；已知日期核对 ' + (known.length - bad.length) + '/' + known.length + ' 一致', ms: YS.util.now() - t0 };
      }
    });
    return cases;
  }

  YS.engineTests = {
    build: build,
    runAll: function (today) {
      return build(today).map(function (c) {
        var r;
        try { r = c.run(); } catch (e) { r = { pass: false, actual: '运行出错：' + e.message, ms: 0 }; }
        return { id: c.id, group: c.group, item: c.item, input: c.input, expect: c.expect, pass: r.pass, actual: r.actual, ms: r.ms };
      });
    }
  };
})(window);
