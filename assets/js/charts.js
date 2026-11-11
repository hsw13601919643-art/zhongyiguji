/* =========================================================================
   轻量图表（无第三方依赖）：单序列横向条形图、按日柱状图
   规范：单一色相；数值用文字色；细条、圆角端；悬停显示数值；可切换表格视图。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS, esc = YS.util.esc;

  /**
   * 横向条形图
   * data: [{ label, value, display?, highlight?, note? }]
   * opts: { max, unit, thresholds:[{value, label}], emptyText }
   */
  function hbar(el, data, opts) {
    opts = opts || {};
    if (!data.length) { el.innerHTML = '<div class="empty">' + esc(opts.emptyText || '暂无数据') + '</div>'; return; }
    var max = opts.max || Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var marks = (opts.thresholds || []).map(function (t) {
      return '<span class="ch-th" style="left:' + (t.value / max * 100) + '%" title="' + esc(t.label) + '"><i>' + esc(t.label) + '</i></span>';
    }).join('');
    el.innerHTML = '<div class="ch-hbar' + (marks ? ' has-th' : '') + '" role="img" aria-label="' + esc(opts.label || '条形图') + '">' + data.map(function (d) {
      var pct = Math.max(0, Math.min(100, d.value / max * 100));
      var shown = d.display !== undefined ? d.display : d.value + (opts.unit || '');
      return '<div class="ch-row' + (d.highlight ? ' hl' : '') + '" title="' + esc(d.label + '：' + shown + (d.note ? '（' + d.note + '）' : '')) + '">' +
        '<span class="ch-label">' + esc(d.label) + '</span>' +
        '<span class="ch-track">' + marks + '<span class="ch-bar" style="width:' + pct + '%"></span></span>' +
        '<span class="ch-val">' + esc(shown) + (d.note ? ' <small>' + esc(d.note) + '</small>' : '') + '</span></div>';
    }).join('') + '</div>';
  }

  /**
   * 按日柱状图（SVG）
   * data: [{ label:'11-01', value }]
   */
  function columns(el, data, opts) {
    opts = opts || {};
    if (!data.length) { el.innerHTML = '<div class="empty">暂无数据</div>'; return; }
    var W = Math.max(320, el.clientWidth || 600), H = opts.height || 180, pl = 34, pb = 22, pt = 10;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var nice = Math.pow(10, Math.floor(Math.log10(max)));
    max = Math.ceil(max / nice) * nice || 1;
    var bw = (W - pl - 6) / data.length;
    var barW = Math.max(2, Math.min(22, bw - 2));
    var grid = '', ticks = 4;
    for (var i = 0; i <= ticks; i++) {
      var y = pt + (H - pt - pb) * (1 - i / ticks);
      grid += '<line x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" class="ch-grid"/>' +
        '<text x="' + (pl - 6) + '" y="' + (y + 4) + '" class="ch-ax" text-anchor="end">' + Math.round(max * i / ticks) + '</text>';
    }
    var step = Math.ceil(data.length / 8);
    var bars = data.map(function (d, i) {
      var h = (H - pt - pb) * d.value / max;
      var x = pl + i * bw + (bw - barW) / 2, y = H - pb - h;
      var r = Math.min(4, barW / 2, h);
      var path = h > 0 ? 'M' + x + ',' + (H - pb) + ' V' + (y + r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' H' + (x + barW - r) + ' Q' + (x + barW) + ',' + y + ' ' + (x + barW) + ',' + (y + r) + ' V' + (H - pb) + ' Z' : '';
      return '<g class="ch-col"><title>' + esc(d.label + '：' + d.value + (opts.unit || '')) + '</title>' +
        '<rect x="' + (pl + i * bw) + '" y="' + pt + '" width="' + bw + '" height="' + (H - pt - pb) + '" fill="transparent"/>' +
        (path ? '<path d="' + path + '" class="ch-colbar"/>' : '') +
        (i % step === 0 ? '<text x="' + (x + barW / 2) + '" y="' + (H - 6) + '" class="ch-ax" text-anchor="middle">' + esc(d.label) + '</text>' : '') + '</g>';
    }).join('');
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="img" aria-label="' + esc(opts.label || '柱状图') + '">' + grid +
      '<line x1="' + pl + '" x2="' + W + '" y1="' + (H - pb) + '" y2="' + (H - pb) + '" class="ch-base"/>' + bars + '</svg>';
  }

  YS.charts = { hbar: hbar, columns: columns };

  // 样式（随脚本注入，避免各页重复）
  var css = '.ch-hbar{display:grid;gap:8px}.ch-row{display:grid;grid-template-columns:72px minmax(0,1fr) 78px;gap:10px;align-items:center;font-size:13px}' +
    '.ch-label{color:var(--c-text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ch-track{position:relative;height:12px;background:var(--c-surface-2);border-radius:6px}' +
    '.ch-bar{display:block;height:100%;background:var(--c-primary-100);border-radius:0 6px 6px 0;min-width:2px}.ch-row.hl .ch-bar{background:var(--c-primary)}' +
    '.ch-row.hl .ch-label{color:var(--c-text);font-weight:600}.ch-val{font-variant-numeric:tabular-nums;color:var(--c-text);text-align:right;white-space:nowrap}.ch-val small{color:var(--c-text-3)}' +
    '.ch-th{position:absolute;top:-4px;bottom:-4px;width:0;border-left:1px dashed var(--c-border-strong);z-index:1}.ch-th i{display:none}' +
    '.ch-hbar.has-th .ch-row:first-child .ch-th i{display:block;position:absolute;top:-18px;left:-10px;font-style:normal;font-size:11px;color:var(--c-text-3);white-space:nowrap}' +
    '.ch-hbar.has-th{padding-top:14px}.ch-grid{stroke:var(--c-border);stroke-width:1}.ch-base{stroke:var(--c-border-strong);stroke-width:1}' +
    '.ch-ax{fill:var(--c-text-3);font-size:11px}.ch-colbar{fill:var(--c-primary)}.ch-col:hover .ch-colbar{fill:var(--c-accent)}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
})(window);
