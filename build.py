"""把 src/ 裡的檔案照順序接起來，產生可以直接玩的單一檔案 find-the-1yuan.html。

改程式時改 src/ 裡的檔案，再執行：
    python build.py          產生 find-the-1yuan.html
    python build.py --check  只檢查 find-the-1yuan.html 是不是最新的（不一樣就回傳 1）
"""
import io
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'find-the-1yuan.html')


def parts():
    js = sorted(f for f in os.listdir(os.path.join(SRC, 'js')) if f.endswith('.js'))
    return ['page-head.html', 'style.css', 'page-body.html'] + ['js/' + f for f in js] + ['page-end.html']


def build():
    return ''.join(io.open(os.path.join(SRC, p), encoding='utf-8', newline='').read() for p in parts())


if __name__ == '__main__':
    html = build()
    old = io.open(OUT, encoding='utf-8', newline='').read() if os.path.exists(OUT) else ''
    if '--check' in sys.argv:
        print('find-the-1yuan.html 是最新的' if html == old else 'find-the-1yuan.html 跟 src/ 不一樣，請執行 python build.py')
        sys.exit(0 if html == old else 1)
    io.open(OUT, 'w', encoding='utf-8', newline='').write(html)
    print('產生 find-the-1yuan.html（%d 個檔案，%d 字）' % (len(parts()), len(html)))
