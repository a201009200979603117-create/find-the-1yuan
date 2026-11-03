"""把 src/ 裡的檔案照順序接起來，產生可以直接玩的單一檔案 find-the-1yuan.html。

改程式時改 src/ 裡的檔案，再執行：
    python build.py            產生 find-the-1yuan.html
    python build.py --check    只檢查 find-the-1yuan.html 是不是最新的（不一樣就回傳 1）
    python build.py --missing  列出畫面上會出現、但 src/lang/en.tsv 還沒翻成英文的中文
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'find-the-1yuan.html')
HAN = re.compile(r'[一-鿿]')


def read(p):
    return io.open(os.path.join(SRC, p), encoding='utf-8', newline='').read()


def parts():
    js = sorted(f for f in os.listdir(os.path.join(SRC, 'js')) if f.endswith('.js'))
    return ['page-head.html', 'style.css', 'page-body.html'] + ['js/' + f for f in js] + ['page-end.html']


def en_dict():
    d = {}
    for line in read('lang/en.tsv').split('\n'):
        line = line.rstrip('\r')  # Windows 的 git 可能把換行改成 CRLF
        if not line or line.startswith('#'):
            continue
        k, _, v = line.partition('\t')
        d[k] = v
    return d


def build():
    out = []
    for p in parts():
        # 英文字典放在翻譯程式前面
        if p == 'js/00c-i18n.js':
            out.append('const EN_DICT=' + json.dumps(en_dict(), ensure_ascii=False, separators=(',', ':')) + ';\n')
        out.append(read(p))
    return ''.join(out)


def strings(js):
    """JS 裡的字串常值（跳過註解）"""
    k, n = 0, len(js)
    while k < n:
        c = js[k]
        if c == '/' and js[k + 1:k + 2] == '/':
            k = js.find('\n', k)
            k = n if k < 0 else k
            continue
        if c in "'\"`":
            j = k + 1
            while j < n and js[j] != c:
                j += 2 if js[j] == '\\' else 1
            yield from (re.split(r'\$\{[^}]*\}', js[k + 1:j]) if c == '`' else [js[k + 1:j]])
            k = j + 1
            continue
        k += 1


def pieces(t):
    t = t.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n')
    for m in re.findall(r'="([^"]*)"', t):
        if HAN.search(m):
            yield m.strip()
    for p in re.split(r'<[^>]*>|\n|&nbsp;', t):
        p = p.strip()
        if '>' in p:
            p = p[p.rindex('>') + 1:].strip()
        if HAN.search(p) and '="' not in p:
            yield p


def missing():
    d, seen = en_dict(), []
    for f in ['page-head.html', 'page-body.html']:
        h = re.sub(r'<script[\s\S]*?</script>', '', read(f))
        for m in re.finditer(r'(?:title|placeholder)="([^"]*)"|>([^<>]+)<', h):
            seen += pieces(m.group(1) or m.group(2))
    for f in sorted(os.listdir(os.path.join(SRC, 'js'))):
        # 翻譯程式本身不用翻；自我檢查是開發用的，那些字也不放進字典
        if not f.endswith('.js') or f == '00c-i18n.js':
            continue
        js = read('js/' + f)
        if 'async function selfTest' in js:
            a = js.index('async function selfTest')
            js = js[:a] + js[js.index('\n', js.index('selftest\\b', a)):]
        for t in strings(js):
            seen += pieces(t)
    out = []
    for s in seen:
        if s not in d and s not in out:
            out.append(s)
    return out


if __name__ == '__main__':
    if '--missing' in sys.argv:
        m = missing()
        print('\n'.join(m) if m else '全部都有英文了')
        sys.exit(0)
    html = build()
    old = io.open(OUT, encoding='utf-8', newline='').read() if os.path.exists(OUT) else ''
    if '--check' in sys.argv:
        print('find-the-1yuan.html 是最新的' if html == old else 'find-the-1yuan.html 跟 src/ 不一樣，請執行 python build.py')
        sys.exit(0 if html == old else 1)
    io.open(OUT, 'w', encoding='utf-8', newline='').write(html)
    print('產生 find-the-1yuan.html（%d 個檔案，%d 字）' % (len(parts()), len(html)))
