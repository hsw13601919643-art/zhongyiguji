/* =========================================================================
   M02 用户端 — 中医体质问卷与判定（验收项 M02-01）
   依据：中华中医药学会标准《中医体质分类与判定》（ZYYXH/T157—2009）的问卷条目与计分方法。
   计分：每题 1—5 分（没有/很少/有时/经常/总是）；平和质中标 * 的条目反向计分。
         转化分 =（原始分 − 条目数）÷（条目数 × 4）× 100
   判定：平和质 —— 转化分 ≥ 60 且其他 8 种均 < 30 为“是”；≥ 60 且其他 8 种均 < 40 为“基本是”；
         偏颇体质 —— ≥ 40 为“是”；30—39 为“倾向是”；< 30 为“否”。
   重复条目（如“容易疲乏”）只作答一次，分别计入相关体质。
   ⚠ 条目文字须由甲方对照标准原文核对。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS;

  var COLD = '您比一般人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？';
  var TIRED = '您容易疲乏吗？', WEAK = '您说话声音低弱无力吗？', SAD = '您感到闷闷不乐、情绪低沉吗？';
  var COLDS = '您比别人容易患感冒吗？', FORGET = '您容易忘事（健忘）吗？';
  var SR6 = '__湿热6__';

  // [条目, 是否反向计分]
  var TYPES = {
    平和质: [['您精力充沛吗？', false], [TIRED, true], [WEAK, true], [SAD, true], [COLD, true], ['您能适应外界自然和社会环境的变化吗？', false], ['您容易失眠吗？', true], [FORGET, true]],
    气虚质: [[TIRED], ['您容易气短（呼吸短促，接不上气）吗？'], ['您容易心慌吗？'], ['您容易头晕或站起时晕眩吗？'], [COLDS], ['您喜欢安静、懒得说话吗？'], [WEAK], ['您活动量稍大就容易出虚汗吗？']],
    阳虚质: [['您手脚发凉吗？'], ['您胃脘部、背部或腰膝部怕冷吗？'], ['您感到怕冷、衣服比别人穿得多吗？'], [COLD], [COLDS], ['您吃（喝）凉的东西会感到不舒服或者怕吃（喝）凉的东西吗？'], ['您受凉或吃（喝）凉的东西后，容易腹泻（拉肚子）吗？']],
    阴虚质: [['您感到手脚心发热吗？'], ['您感觉身体、脸上发热吗？'], ['您皮肤或口唇干吗？'], ['您口唇的颜色比一般人红吗？'], ['您容易便秘或大便干燥吗？'], ['您面部两颧潮红或偏红吗？'], ['您感到眼睛干涩吗？'], ['您感到口干咽燥、总想喝水吗？']],
    痰湿质: [['您感到胸闷或腹部胀满吗？'], ['您感到身体沉重不轻松或不爽快吗？'], ['您腹部肥满松软吗？'], ['您有额部油脂分泌多的现象吗？'], ['您上眼睑比别人肿（上眼睑有轻微隆起的现象）吗？'], ['您嘴里有黏黏的感觉吗？'], ['您平时痰多，特别是咽喉部总感到有痰堵着吗？'], ['您舌苔厚腻或有舌苔厚厚的感觉吗？']],
    湿热质: [['您面部或鼻部有油腻感或者油亮发光吗？'], ['您易生痤疮或疮疖吗？'], ['您感到口苦或嘴里有异味吗？'], ['您大便黏滞不爽、有解不尽的感觉吗？'], ['您小便时尿道有发热感、尿色浓（深）吗？'], [SR6]],
    血瘀质: [['您的皮肤在不知不觉中会出现青紫瘀斑（皮下出血）吗？'], ['您两颧部有细微红丝吗？'], ['您身体上有哪里疼痛吗？'], ['您面色晦黯或容易出现褐斑吗？'], ['您容易有黑眼圈吗？'], [FORGET], ['您口唇颜色偏黯吗？']],
    气郁质: [[SAD], ['您容易精神紧张、焦虑不安吗？'], ['您多愁善感、感情脆弱吗？'], ['您容易感到害怕或受到惊吓吗？'], ['您胁肋部或乳房胀痛吗？'], ['您无缘无故叹气吗？'], ['您咽喉部有异物感，且吐之不出、咽之不下吗？']],
    特禀质: [['您没有感冒时也会打喷嚏吗？'], ['您没有感冒时也会鼻塞、流鼻涕吗？'], ['您有因季节变化、温度变化或异味等原因而咳喘的现象吗？'], ['您容易过敏（对药物、食物、气味、花粉或在季节交替、气候变化时）吗？'], ['您的皮肤容易起荨麻疹（风团、风疹块、风疙瘩）吗？'], ['您的皮肤因过敏出现过紫癜（紫红色瘀点、瘀斑）吗？'], ['您的皮肤一抓就红，并出现抓痕吗？']]
  };
  var ORDER = ['平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质'];

  // 去重后的题目列表：{ id, text, refs:[{type, reverse}] }
  var questions = [], byText = {};
  // 题目按体质交错排列，避免同类题目扎堆（作答体验更自然）
  var maxLen = Math.max.apply(null, ORDER.map(function (t) { return TYPES[t].length; }));
  for (var i = 0; i < maxLen; i++) {
    ORDER.forEach(function (t) {
      var item = TYPES[t][i];
      if (!item) return;
      var text = item[0];
      if (!byText[text]) { byText[text] = { id: 'q' + (questions.length + 1), text: text, refs: [] }; questions.push(byText[text]); }
      byText[text].refs.push({ type: t, reverse: !!item[1] });
    });
  }

  var OPTIONS = [
    { v: 1, text: '没有', sub: '根本不' }, { v: 2, text: '很少', sub: '有一点' }, { v: 3, text: '有时', sub: '有些' },
    { v: 4, text: '经常', sub: '相当' }, { v: 5, text: '总是', sub: '非常' }
  ];

  function questionText(q, gender) {
    if (q.text !== SR6) return q.text;
    return gender === '男' ? '您的阴囊部位潮湿吗？（限男性回答）' : '您带下色黄（白带颜色发黄）吗？（限女性回答）';
  }

  /** answers: { qid: 1..5 }；返回各体质转化分、判定、主体质与兼夹体质 */
  function evaluate(answers) {
    var scores = {}, judge = {}, missing = [];
    questions.forEach(function (q) { if (!answers[q.id]) missing.push(q.id); });
    ORDER.forEach(function (t) {
      var raw = 0, n = 0;
      questions.forEach(function (q) {
        q.refs.forEach(function (ref) {
          if (ref.type !== t) return;
          var a = Number(answers[q.id]) || 1;
          raw += ref.reverse ? 6 - a : a;
          n++;
        });
      });
      scores[t] = Math.round((raw - n) / (n * 4) * 1000) / 10;
    });
    var others = ORDER.slice(1).map(function (t) { return scores[t]; });
    var ph = scores['平和质'];
    judge['平和质'] = ph >= 60 && others.every(function (s) { return s < 30; }) ? '是'
      : ph >= 60 && others.every(function (s) { return s < 40; }) ? '基本是' : '否';
    ORDER.slice(1).forEach(function (t) { judge[t] = scores[t] >= 40 ? '是' : scores[t] >= 30 ? '倾向是' : '否'; });

    var biased = ORDER.slice(1).filter(function (t) { return judge[t] !== '否'; })
      .sort(function (a, b) { return scores[b] - scores[a]; });
    var primary, weak = false;
    if (judge['平和质'] !== '否') primary = '平和质';
    else if (biased.length) primary = biased[0];
    else { primary = '平和质'; weak = true; }
    return {
      scores: scores, judge: judge, primary: primary,
      secondary: biased.filter(function (t) { return t !== primary; }),
      weak: weak, missing: missing
    };
  }

  /** 按某体质的典型特征模拟作答（用于覆盖测试 A 组） */
  function simulate(type) {
    var ans = {};
    questions.forEach(function (q) {
      var v = 1;
      q.refs.forEach(function (ref) {
        if (ref.type !== type) return;
        v = ref.reverse ? 1 : 5;
      });
      ans[q.id] = v;
    });
    return ans;
  }

  YS.constitutionTest = {
    ORDER: ORDER, OPTIONS: OPTIONS, questions: questions, questionText: questionText,
    evaluate: evaluate, simulate: simulate, count: questions.length
  };
})(window);
