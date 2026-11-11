#!/usr/bin/env python3
"""把项目中的 Markdown 文档打包为 assets/js/docs-bundle.js，
使文档查看器（assets/doc-viewer.html）在直接双击打开（file://）时也能显示文档。

用法：在项目根目录运行  python3 tools/build_docs.py
新增或修改任何 .md 文档后，请重新运行一次。
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'js', 'docs-bundle.js')
SKIP_DIRS = {'.git', 'node_modules', 'tools'}


def main():
    docs = {}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.'))
        for name in sorted(filenames):
            if not name.lower().endswith('.md'):
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, ROOT).replace(os.sep, '/')
            with open(path, encoding='utf-8') as f:
                docs[rel] = f.read()
    body = json.dumps(docs, ensure_ascii=False, indent=0)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('/* 自动生成，请勿手工修改。生成方法：python3 tools/build_docs.py */\n')
        f.write('window.YS = window.YS || {};\nwindow.YS.docs = ' + body + ';\n')
    print('已打包 %d 篇文档 -> %s' % (len(docs), os.path.relpath(OUT, ROOT)))


if __name__ == '__main__':
    main()
