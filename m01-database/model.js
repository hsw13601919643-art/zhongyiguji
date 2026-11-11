/* =========================================================================
   M01 数据库 — 药膳方数据模型：字段定义、药食同源核验、校验、CSV 导入导出、展示片段
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS, U = YS.util, esc = U.esc;

  YS.db.registerSeed('recipes', YS.seed.recipesVersion || '1', function () { return YS.seed.recipes || []; });

  /* 13 个必备字段（方案 4.1(2)）与扩展字段 */
  var FIELDS = [
    { key: 'name', label: '方名', required: true, note: '经典药膳方名称' },
    { key: 'source', label: '出处', required: true, note: '古籍名称、卷次、篇目' },
    { key: 'composition', label: '组成', required: true, note: '药材、食材及用量' },
    { key: 'efficacy', label: '功效', required: true, note: '中医功效描述' },
    { key: 'ages', label: '适用年龄', required: true, note: '如老年、中年、儿童等' },
    { key: 'constitutions', label: '适用体质', required: true, note: '九种体质' },
    { key: 'organs', label: '调补脏腑', required: true, note: '肝、心、脾、肺、肾（病症见“主治病症”）' },
    { key: 'seasons', label: '适用节气', required: true, note: '四季及二十四节气' },
    { key: 'yaoshi', label: '药食同源应用', required: true, note: '是否属于106种目录（系统自动核验）' },
    { key: 'method', label: '制作方法', required: true, note: '烹饪、炮制、加工工艺' },
    { key: 'cautions', label: '注意事项', required: true, note: '禁忌、慎用人群' },
    { key: 'research', label: '现代研究', required: true, note: '相关论文、机制研究摘要' },
    { key: 'dataSource', label: '数据来源', required: true, note: '古籍原文、数据库链接' }
  ];
  var EXT_FIELDS = [
    { key: 'meals', label: '适用餐次', note: '早、午、晚——三餐推荐所需' },
    { key: 'category', label: '膳食类别', note: '粥、汤、羹、茶饮等' },
    { key: 'nature', label: '四气', note: '寒、凉、平、温、热' },
    { key: 'tastes', label: '五味', note: '五行规则所需' },
    { key: 'colors', label: '五色', note: '五行规则所需' },
    { key: 'tags', label: '功效标签', note: '规则引擎匹配所需' }
  ];

  var idx = null;
  function yaoshiIndex() {
    if (idx) return idx;
    idx = {};
    (YS.seed.yaoshi || []).forEach(function (y) {
      idx[y.name] = y;
      idx[y.name.replace(/（.*?）/g, '')] = y;
      y.aliases.forEach(function (a) { idx[a] = y; });
    });
    return idx;
  }
  function findYaoshi(name) {
    if (!name) return null;
    var i = yaoshiIndex();
    var n = String(name).trim();
    return i[n] || i[n.replace(/[（(].*?[）)]/g, '')] || null;
  }

  YS.model = {
    FIELDS: FIELDS,
    EXT_FIELDS: EXT_FIELDS,
    yaoshi: function () { return YS.seed.yaoshi || []; },
    findYaoshi: findYaoshi,

    /** 药食同源核验：组成中“药材”类须全部在 106 种目录内（食材、调料按普通食品处理） */
    compliance: function (r) {
      var items = (r.composition || []).map(function (c) {
        var y = c.type === '药' ? findYaoshi(c.std || c.name) : null;
        return { name: c.name, std: c.std, amount: c.amount, type: c.type, inList: c.type !== '药' ? null : !!y, listName: y ? y.name : '', note: y ? y.note : '' };
      });
      var bad = items.filter(function (x) { return x.inList === false; });
      var inList = items.filter(function (x) { return x.inList === true; });
      return {
        ok: bad.length === 0,
        items: items,
        nonList: bad.map(function (x) { return x.std || x.name; }),
        listed: inList.map(function (x) { return x.listName; }),
        text: bad.length ? '含目录外药材：' + bad.map(function (x) { return x.std || x.name; }).join('、')
          : (inList.length ? '药材均在目录内：' + YS.util.uniq(inList.map(function (x) { return x.listName; })).join('、') : '仅含普通食材')
      };
    },

    sourceText: function (r) {
      var s = r.source || {};
      return '《' + (s.book || '—') + (s.chapter ? '·' + s.chapter : '') + '》';
    },
    statusBadge: function (st) {
      var d = YS.dict.statuses[st] || { text: st || '—', cls: '' };
      return '<span class="badge ' + d.cls + '">' + esc(d.text) + '</span>';
    },
    seasonText: function (r) {
      var s = r.seasons || [];
      var t = s.length === 4 ? '四季皆宜' : s.join('、');
      if (r.terms && r.terms.length) t += '（' + r.terms.join('、') + '）';
      return t || '—';
    },
    compText: function (r) {
      return (r.composition || []).map(function (c) { return c.name + (c.amount ? c.amount : ''); }).join('、');
    },
    /** 组成片段：药材绿色、目录外红色 */
    compHtml: function (r) {
      var cp = YS.model.compliance(r);
      return '<div class="comp-list">' + cp.items.map(function (c) {
        var cls = c.inList === true ? 'comp yao' : c.inList === false ? 'comp bad' : 'comp';
        var title = c.inList === true ? '药食同源目录：' + c.listName : c.inList === false ? '不在药食同源目录内' : (c.type === '调料' ? '调料' : '普通食材');
        return '<span class="' + cls + '" title="' + esc(title) + '">' + esc(c.name) + (c.amount ? ' <span class="amt">' + esc(c.amount) + '</span>' : '') + '</span>';
      }).join('') + '</div>';
    },
    yaoshiBadge: function (r) {
      var cp = YS.model.compliance(r);
      return cp.ok ? '<span class="badge green" title="' + esc(cp.text) + '">✓ 药食同源</span>'
        : '<span class="badge red" title="' + esc(cp.text) + '">✕ 含目录外药材</span>';
    },
    sampleBadge: function (r) {
      return r.sample ? '<span class="badge amber" title="示例数据：出处与标注待甲方专家审核">示例数据</span>' : '';
    },

    blank: function () {
      return {
        id: '', name: '', alias: '', source: { book: '', chapter: '', original: '', edition: '' }, composition: [],
        efficacy: '', indication: '', ages: [], constitutions: [], organs: [], seasons: [], terms: [],
        meals: [], category: '', nature: '', tastes: [], colors: [], tags: [], method: '', cautions: '',
        research: [], researchNote: '', dataSource: '', status: 'draft', sample: false, verify: '',
        standardized: false, sampleRecord: '', reviewer: '', reviewedAt: null, version: 1
      };
    },
    nextId: function () {
      var max = 0;
      YS.db.list('recipes').forEach(function (r) { var n = parseInt(String(r.id).replace(/\D/g, ''), 10); if (n > max) max = n; });
      return 'YS' + ('000' + (max + 1)).slice(-4);
    },
    /** 校验：返回错误信息数组 */
    validate: function (r) {
      var e = [];
      var D = YS.dict;
      if (!r.name) e.push('方名不能为空');
      if (!r.source || !r.source.book) e.push('出处（古籍名称）不能为空');
      if (!r.composition || !r.composition.length) e.push('组成至少填写一项');
      (r.composition || []).forEach(function (c, i) {
        if (!c.name) e.push('组成第' + (i + 1) + '项缺少名称');
        if (['药', '食', '调料'].indexOf(c.type) < 0) e.push('组成“' + c.name + '”类型须为 药/食/调料');
      });
      if (!r.efficacy) e.push('功效不能为空');
      function chk(key, label, allowed) {
        (r[key] || []).forEach(function (v) { if (allowed.indexOf(v) < 0) e.push(label + '含非标准值“' + v + '”'); });
      }
      chk('constitutions', '适用体质', D.names('constitutions'));
      chk('organs', '调补脏腑', D.names('organs'));
      chk('seasons', '适用季节', D.seasons);
      chk('terms', '适用节气', YS.solar.ORDER);
      chk('ages', '适用年龄', D.names('ages'));
      chk('meals', '适用餐次', D.meals);
      chk('tastes', '五味', D.tastes);
      chk('colors', '五色', D.colors);
      if (r.category && D.categories.indexOf(r.category) < 0) e.push('膳食类别须为：' + D.categories.join('/'));
      if (r.nature && D.natures.indexOf(r.nature) < 0) e.push('四气须为：' + D.natures.join('/'));
      if (!r.meals || !r.meals.length) e.push('适用餐次至少选择一项（三餐推荐所需）');
      return e;
    }
  };

  /* ---------- 完整字段展示（M01 方库详情、M02 详情页、M03 预览共用） ---------- */
  YS.model.detailHtml = function (r, opts) {
    opts = opts || {};
    var cp = YS.model.compliance(r);
    var s = r.source || {};
    function list(a) { return a && a.length ? esc(a.join('、')) : '<span class="muted">—</span>'; }
    function txt(v) { return v ? esc(v) : '<span class="muted">—</span>'; }
    var research = (r.research || []).length
      ? '<ol style="margin:0;padding-left:18px">' + r.research.map(function (x) {
        return '<li>' + esc(x.title) + (x.authors ? '，' + esc(x.authors) : '') + (x.journal ? '，《' + esc(x.journal) + '》' : '') + (x.year ? '，' + esc(x.year) : '') +
          (x.url ? ' <a href="' + esc(x.url) + '" target="_blank" rel="noopener">链接</a>' : '') + '</li>';
      }).join('') + '</ol>'
      : '';
    var wx = (r.colors || []).map(function (c) { return '<span class="wx wx-' + esc(c) + '"></span>' + esc(c); }).join(' ');
    var html = '<dl class="kv">' +
      '<dt>方名</dt><dd><b class="serif" style="font-size:17px">' + esc(r.name) + '</b>' + (r.alias ? ' <span class="muted">（' + esc(r.alias) + '）</span>' : '') + '</dd>' +
      '<dt>出处</dt><dd>' + esc(YS.model.sourceText(r)) + '</dd>' +
      '<dt>原文</dt><dd class="serif">' + txt(s.original) + '</dd>' +
      '<dt>组成</dt><dd>' + YS.model.compHtml(r) + '</dd>' +
      '<dt>功效</dt><dd>' + txt(r.efficacy) + '</dd>' +
      '<dt>主治病症</dt><dd>' + txt(r.indication) + '</dd>' +
      '<dt>适用年龄</dt><dd>' + list(r.ages) + '</dd>' +
      '<dt>适用体质</dt><dd>' + list(r.constitutions) + '</dd>' +
      '<dt>调补脏腑</dt><dd>' + list(r.organs) + '</dd>' +
      '<dt>适用节气</dt><dd>' + esc(YS.model.seasonText(r)) + '</dd>' +
      '<dt>药食同源</dt><dd>' + YS.model.yaoshiBadge(r) + ' <span class="muted" style="font-size:13px">' + esc(cp.text) + '</span></dd>' +
      '<dt>制作方法</dt><dd>' + txt(r.method) + '</dd>' +
      '<dt>注意事项</dt><dd>' + txt(r.cautions) + '</dd>' +
      '<dt>现代研究</dt><dd>' + research + (r.researchNote ? '<span class="' + (research ? '' : 'muted') + '">' + esc(r.researchNote) + '</span>' : (research ? '' : '<span class="muted">—</span>')) + '</dd>' +
      '<dt>数据来源</dt><dd>' + txt(r.dataSource) + '</dd>' +
      '</dl>';
    if (opts.ext !== false) {
      html += '<div class="section-title">扩展字段（推荐算法使用）</div><dl class="kv">' +
        '<dt>适用餐次</dt><dd>' + list((r.meals || []).map(function (m) { return YS.dict.mealNames[m] || m; })) + '</dd>' +
        '<dt>膳食类别</dt><dd>' + txt(r.category) + '</dd>' +
        '<dt>四气五味</dt><dd>' + txt(r.nature) + (r.tastes && r.tastes.length ? '；' + esc(r.tastes.join('、')) : '') + '</dd>' +
        '<dt>五色</dt><dd>' + (wx || '<span class="muted">—</span>') + '</dd>' +
        '<dt>功效标签</dt><dd><div class="tags">' + (r.tags || []).map(function (t) { return '<span class="badge primary">' + esc(t) + '</span>'; }).join('') + '</div></dd>' +
        '</dl>';
    }
    if (opts.workflow) {
      html += '<div class="section-title">审核与打样</div><dl class="kv">' +
        '<dt>状态</dt><dd>' + YS.model.statusBadge(r.status) + ' ' + YS.model.sampleBadge(r) + '</dd>' +
        '<dt>审核人</dt><dd>' + txt(r.reviewer) + (r.reviewedAt ? ' · ' + esc(U.fmtTime(r.reviewedAt)) : '') + '</dd>' +
        '<dt>标准化打样</dt><dd>' + (r.standardized ? '<span class="badge green">已完成</span> ' + esc(r.sampleRecord || '') : '<span class="muted">未完成</span>') + '</dd>' +
        '<dt>版本</dt><dd>V' + esc(r.version || 1) + (r.updatedAt ? ' · 更新于 ' + esc(U.fmtTime(r.updatedAt)) : '') + '</dd>' +
        '</dl>';
    }
    return html;
  };

  /* ---------- CSV 导入导出（验收项 M01-07、M01-08） ---------- */
  var CSV_COLS = [
    ['id', '编号'], ['name', '方名*'], ['alias', '别名'], ['book', '古籍名称*'], ['chapter', '卷次篇目'], ['original', '原文摘录'],
    ['composition', '组成*（名称:用量:类型；…）'], ['efficacy', '功效*'], ['indication', '主治病症'],
    ['ages', '适用年龄'], ['constitutions', '适用体质'], ['organs', '调补脏腑'], ['seasons', '适用季节'], ['terms', '适用节气'],
    ['method', '制作方法'], ['cautions', '注意事项'], ['research', '现代研究（题名|作者|刊名|年份|链接；…）'], ['researchNote', '现代研究摘要'],
    ['dataSource', '数据来源'], ['meals', '适用餐次*'], ['category', '膳食类别'], ['nature', '四气'], ['tastes', '五味'], ['colors', '五色'], ['tags', '功效标签']
  ];
  YS.model.CSV_COLS = CSV_COLS;

  function joinMulti(a) { return (a || []).join('、'); }
  YS.model.toCsv = function (recipes) {
    var rows = [CSV_COLS.map(function (c) { return c[1]; })];
    recipes.forEach(function (r) {
      rows.push(CSV_COLS.map(function (c) {
        var k = c[0];
        if (k === 'book' || k === 'chapter' || k === 'original') return (r.source || {})[k] || '';
        if (k === 'composition') return (r.composition || []).map(function (x) { return x.name + (x.std ? '=' + x.std : '') + ':' + (x.amount || '') + ':' + x.type; }).join('；');
        if (k === 'research') return (r.research || []).map(function (x) { return [x.title, x.authors, x.journal, x.year, x.url].join('|'); }).join('；');
        var v = r[k];
        return Array.isArray(v) ? joinMulti(v) : (v === undefined || v === null ? '' : v);
      }));
    });
    return U.csvStringify(rows);
  };

  /** 解析导入文件：返回 { ok: [recipe], errors: [{row, msgs}] } */
  YS.model.fromCsv = function (text) {
    var rows = U.csvParse(text);
    var out = { ok: [], errors: [] };
    if (!rows.length) { out.errors.push({ row: 0, msgs: ['文件为空'] }); return out; }
    var head = rows[0].map(function (h) { return h.replace(/\s/g, ''); });
    var colIndex = {};
    CSV_COLS.forEach(function (c) {
      var label = c[1].replace(/\s/g, '');
      var i = head.indexOf(label);
      if (i < 0) i = head.indexOf(label.replace(/[*＊]/g, '').replace(/（.*$/, ''));
      if (i < 0) head.forEach(function (h, j) { if (i < 0 && h.replace(/[*＊]/g, '').replace(/（.*$/, '') === label.replace(/[*＊]/g, '').replace(/（.*$/, '')) i = j; });
      colIndex[c[0]] = i;
    });
    if (colIndex.name < 0 || colIndex.composition < 0) {
      out.errors.push({ row: 1, msgs: ['表头不符合模板，请使用系统提供的录入模板'] });
      return out;
    }
    rows.slice(1).forEach(function (row, n) {
      function g(k) { var i = colIndex[k]; return i >= 0 ? String(row[i] || '').trim() : ''; }
      if (/^示例|^【示例】/.test(g('id'))) return; // 跳过模板示例行
      var r = YS.model.blank();
      r.id = g('id');
      r.name = g('name'); r.alias = g('alias');
      r.source = { book: g('book').replace(/[《》]/g, ''), chapter: g('chapter'), original: g('original'), edition: '' };
      r.composition = g('composition').split(/[；;\n]/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) {
        var p = x.split(/[:：]/);
        var nm = (p[0] || '').split('=');
        return { name: nm[0].trim(), std: (nm[1] || '').trim(), amount: (p[1] || '适量').trim(), type: (p[2] || '食').trim().replace('药材', '药').replace('食材', '食') };
      });
      r.efficacy = g('efficacy'); r.indication = g('indication');
      ['ages', 'constitutions', 'organs', 'seasons', 'terms', 'meals', 'tastes', 'colors', 'tags'].forEach(function (k) { r[k] = U.splitMulti(g(k)); });
      r.constitutions = r.constitutions.map(function (x) { return /质$/.test(x) ? x : x + '质'; });
      r.meals = r.meals.map(function (x) { return x.replace('餐', ''); });
      if (r.seasons.indexOf('四季') >= 0) r.seasons = ['春', '夏', '秋', '冬'];
      r.method = g('method'); r.cautions = g('cautions'); r.researchNote = g('researchNote'); r.dataSource = g('dataSource');
      r.research = g('research').split(/[；;]/).filter(Boolean).map(function (x) {
        var p = x.split('|');
        return { title: p[0] || '', authors: p[1] || '', journal: p[2] || '', year: p[3] || '', url: p[4] || '' };
      });
      r.category = g('category'); r.nature = g('nature');
      var errs = YS.model.validate(r);
      if (errs.length) out.errors.push({ row: n + 2, name: r.name, msgs: errs });
      else out.ok.push(r);
    });
    return out;
  };
})(window);
