/* =========================================================================
   轻量 Markdown 渲染（文档查看器用）：标题、段落、粗体、行内代码、链接、
   有序/无序列表（含复选框）、表格、引用、代码块、分隔线。先转义后渲染，防止脚本注入。
   ========================================================================= */
(function (global) {
  'use strict';
  var YS = global.YS, esc = YS.util.esc;

  function resolve(base, href) {
    if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
    var parts = (base ? base.split('/') : []).concat(href.split('/'));
    var out = [];
    parts.forEach(function (p) { if (p === '..') out.pop(); else if (p && p !== '.') out.push(p); });
    return out.join('/');
  }

  function inline(s, opts) {
    s = esc(s);
    var codes = [];
    s = s.replace(/`([^`]+)`/g, function (m, c) { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, href) {
      href = href.replace(/&amp;/g, '&');
      if (/^\s*javascript:/i.test(href)) return text;
      var target = resolve(opts.base, href);
      var url;
      if (/^(https?:|mailto:|#)/.test(target)) url = target;
      else if (/\.md(#.*)?$/.test(target)) url = opts.docLink(target);
      else url = YS.url(target);
      var ext = /^https?:/.test(url) && url.indexOf(YS.root) !== 0;
      return '<a href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
    });
    s = s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return '<code>' + codes[Number(i)] + '</code>'; });
    return s;
  }

  function render(src, opts) {
    opts = opts || {};
    opts.docLink = opts.docLink || function (p) { return p; };
    var lines = String(src || '').replace(/\r/g, '').split('\n');
    var html = [], i = 0;
    function isTableSep(l) { return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l); }
    function cells(l) { return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); }); }
    function listBlock(start) {
      var items = [], j = start, ordered = /^\s*\d+\.\s/.test(lines[start]);
      var baseIndent = lines[start].match(/^\s*/)[0].length;
      while (j < lines.length) {
        var l = lines[j];
        var m = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m && m[1].length === baseIndent) { items.push({ text: m[3], sub: [] }); j++; continue; }
        if (m && m[1].length > baseIndent && items.length) {
          var sub = listBlock(j); items[items.length - 1].sub.push(sub.html); j = sub.end; continue;
        }
        if (l.trim() && /^\s{2,}/.test(l) && items.length) { items[items.length - 1].text += ' ' + l.trim(); j++; continue; }
        break;
      }
      var tag = ordered ? 'ol' : 'ul';
      var out = '<' + tag + '>' + items.map(function (it) {
        var t = it.text, box = '';
        if (/^\[ \]\s/.test(t)) { box = '<span class="cb">☐</span> '; t = t.slice(4); }
        else if (/^\[x\]\s/i.test(t)) { box = '<span class="cb">☑</span> '; t = t.slice(4); }
        return '<li' + (box ? ' class="task"' : '') + '>' + box + inline(t, opts) + it.sub.join('') + '</li>';
      }).join('') + '</' + tag + '>';
      return { html: out, end: j };
    }

    while (i < lines.length) {
      var l = lines[i];
      if (!l.trim()) { i++; continue; }
      var fence = l.match(/^\s*```(\w*)/);
      if (fence) {
        var code = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { code.push(lines[i]); i++; }
        i++;
        html.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
        continue;
      }
      var h = l.match(/^(#{1,6})\s+(.*)$/);
      if (h) { var n = h[1].length; html.push('<h' + n + '>' + inline(h[2], opts) + '</h' + n + '>'); i++; continue; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { html.push('<hr>'); i++; continue; }
      if (/^\s*\|/.test(l) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        var head = cells(l); i += 2;
        var rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
        html.push('<div class="table-wrap"><table class="table"><thead><tr>' + head.map(function (c) { return '<th>' + inline(c, opts) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + head.map(function (x, k) { return '<td>' + inline(r[k] || '', opts) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
        continue;
      }
      if (/^\s*>/.test(l)) {
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        html.push('<blockquote>' + render(q.join('\n'), opts) + '</blockquote>');
        continue;
      }
      if (/^\s*([-*]|\d+\.)\s+/.test(l)) { var lb = listBlock(i); html.push(lb.html); i = lb.end; continue; }
      var para = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*```|\s*>|\s*([-*]|\d+\.)\s+|\s*\|)/.test(lines[i]) && !/^\s*(-{3,})\s*$/.test(lines[i])) { para.push(lines[i].trim()); i++; }
      if (para.length) html.push('<p>' + para.map(function (p) { return inline(p, opts); }).join('<br>') + '</p>');
      else { html.push('<p>' + inline(l, opts) + '</p>'); i++; }
    }
    return html.join('\n');
  }

  YS.md = { render: render, resolve: resolve };
  YS.docUrl = function (path) { return YS.url('assets/doc-viewer.html?f=' + encodeURIComponent(path)); };
})(window);
