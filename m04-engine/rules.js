/* =========================================================================
   M04 推荐算法 — 默认推荐规则（管理端“推荐规则配置”可增删改、停用）
   规则结构：
     when    触发条件：seasons 季节 / terms 节气 / organs 脏腑 / constitutions 体质 / ages 年龄段 / regions 地域
             （各项为空表示不限；全部满足才触发）
     prefer  偏好：tags 功效标签 / tastes 五味 / colors 五色 / natures 四气 / categories 膳食类别 / ingredients 组成
             （方剂命中任意一项即加分 weight）
     avoid   规避：同上（命中任意一项即扣分 weight）
   依据：方案 4.2(3) 规则示例；三.2 中医体质学说、脏腑学说、五行学说及“三应”原则（应时、应地、应体）。
   ⚠ 规则内容为初稿，须经甲方专家确认（验收项 M04-02）。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;

  function rule(id, group, name, when, prefer, avoid, weight, basis) {
    return { id: id, group: group, name: name, enabled: true, when: when || {}, prefer: prefer || {}, avoid: avoid || {}, weight: weight, basis: basis || '' };
  }

  YS.seed.rules = [
    /* 方案 4.2(3) 规则示例 */
    rule('R01', '方案示例', '春季＋肝＋气郁质 → 疏肝理气、酸味青色', { seasons: ['春'], organs: ['肝'], constitutions: ['气郁质'] },
      { tags: ['疏肝', '理气'], tastes: ['酸'], colors: ['青'] }, null, 15, '方案4.2(3)'),
    rule('R02', '方案示例', '冬季＋肾＋阳虚质 → 温补肾阳、黑色食材', { seasons: ['冬'], organs: ['肾'], constitutions: ['阳虚质'] },
      { tags: ['温补', '补肾', '温阳'], colors: ['黑'], natures: ['温'] }, null, 15, '方案4.2(3)'),
    rule('R03', '方案示例', '老年＋脾＋气虚质 → 健脾益气、易消化', { ages: ['老年'], organs: ['脾'], constitutions: ['气虚质'] },
      { tags: ['健脾', '益气'], categories: ['粥', '羹'] }, null, 15, '方案4.2(3)'),

    /* 应体：九种体质宜忌 */
    rule('R10', '应体', '气虚质：宜益气健脾', { constitutions: ['气虚质'] }, { tags: ['益气', '健脾'] }, { natures: ['寒'] }, 8, '中医体质学说'),
    rule('R11', '应体', '阳虚质：宜温补，忌寒凉', { constitutions: ['阳虚质'] }, { tags: ['温补', '温阳', '温中'] }, { natures: ['寒', '凉'] }, 10, '中医体质学说'),
    rule('R12', '应体', '阴虚质：宜养阴润燥，忌温燥', { constitutions: ['阴虚质'] }, { tags: ['养阴', '润燥'] }, { natures: ['热'] }, 10, '中医体质学说'),
    rule('R13', '应体', '痰湿质：宜健脾祛湿化痰', { constitutions: ['痰湿质'] }, { tags: ['祛湿', '化痰', '健脾'] }, null, 8, '中医体质学说'),
    rule('R14', '应体', '湿热质：宜清热利湿，忌温热', { constitutions: ['湿热质'] }, { tags: ['清热', '祛湿', '利水'] }, { natures: ['温', '热'] }, 10, '中医体质学说'),
    rule('R15', '应体', '血瘀质：宜活血化瘀', { constitutions: ['血瘀质'] }, { tags: ['活血', '化瘀'] }, null, 8, '中医体质学说'),
    rule('R16', '应体', '气郁质：宜理气解郁安神', { constitutions: ['气郁质'] }, { tags: ['理气', '解郁', '疏肝', '安神'] }, null, 8, '中医体质学说'),
    rule('R17', '应体', '特禀质：宜益气固表，避鱼腥发物', { constitutions: ['特禀质'] }, { tags: ['益气', '补肺'] }, { ingredients: ['鲫鱼', '鲤鱼', '羊肉', '鱼', '虾', '蟹'] }, 10, '中医体质学说'),
    rule('R18', '应体', '平和质：宜平补，不偏寒热', { constitutions: ['平和质'] }, { natures: ['平'] }, { natures: ['寒', '热'] }, 5, '中医体质学说'),

    /* 应时：四季 */
    rule('R20', '应时', '春季：养肝疏泄', { seasons: ['春'] }, { tags: ['养肝', '疏肝', '清肝'] }, null, 5, '《素问·四气调神大论》春养生'),
    rule('R21', '应时', '夏季：清热消暑祛湿', { seasons: ['夏'] }, { tags: ['清热', '消暑', '祛湿'] }, { natures: ['热'] }, 5, '《素问·四气调神大论》夏养长'),
    rule('R22', '应时', '秋季：润燥养肺', { seasons: ['秋'] }, { tags: ['润肺', '润燥', '养阴'] }, null, 5, '《素问·四气调神大论》秋养收'),
    rule('R23', '应时', '冬季：温补藏精', { seasons: ['冬'] }, { tags: ['温补', '补肾', '益精'] }, { natures: ['寒'] }, 5, '《素问·四气调神大论》冬养藏'),
    rule('R24', '应时', '长夏（小暑、大暑）：健脾化湿', { terms: ['小暑', '大暑'] }, { tags: ['健脾', '祛湿'] }, null, 5, '五行学说：长夏应脾'),

    /* 应地：地域 */
    rule('R30', '应地', '江南湿润：宜健脾祛湿', { regions: ['江南'] }, { tags: ['祛湿', '健脾'] }, null, 3, '“三应”原则·应地'),
    rule('R31', '应地', '华北、西北干燥：宜润燥', { regions: ['华北', '西北'] }, { tags: ['润燥', '养阴', '润肺'] }, null, 3, '“三应”原则·应地'),
    rule('R32', '应地', '岭南湿热：宜清热祛湿', { regions: ['岭南'] }, { tags: ['清热', '祛湿'] }, null, 3, '“三应”原则·应地'),
    rule('R33', '应地', '东北寒冷：宜温补', { regions: ['东北'] }, { tags: ['温补', '温中'] }, null, 3, '“三应”原则·应地'),
    rule('R34', '应地', '西南潮湿：宜温中祛湿', { regions: ['西南'] }, { tags: ['祛湿', '温中'] }, null, 3, '“三应”原则·应地')
  ];
  YS.seed.rulesVersion = '2026.11.1';
  YS.db.registerSeed('rules', YS.seed.rulesVersion, function () { return YS.seed.rules; });

  /* 推荐设置（管理端可改） */
  YS.engineSettings = {
    defaults: { complianceMode: 'exclude', alternatives: 2 },
    get: function () { var s = YS.storage.get('engine_settings', {}); var d = YS.engineSettings.defaults; return { complianceMode: s.complianceMode || d.complianceMode, alternatives: s.alternatives || d.alternatives }; },
    set: function (s) { YS.storage.set('engine_settings', s); }
  };
})(window);
