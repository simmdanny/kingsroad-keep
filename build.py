"""Build Kingsroad Keep: strips the local-test hooks and writes dist/kingsroad-keep.html (pure ASCII, one file).
Usage: python build.py      (needs only Python 3)"""
import re, sys, pathlib
here = pathlib.Path(__file__).parent
src = (here / 'src' / 'kingsroad-keep.html').read_text(encoding='utf-8')
out = []
skip = False
for line in src.split('\n'):
    if '<!--LOCALTEST-->' in line:
        continue
    if line.startswith('//LT-BEGIN'):
        skip = True
        continue
    if line.startswith('//LT-END'):
        skip = False
        continue
    if not skip:
        out.append(line)
text = '\n'.join(out)
bad = [c for c in text if ord(c) > 127]
if bad:
    sys.exit('non-ASCII characters in the build (%d): escape them (use the JS escape sequence or an HTML entity)' % len(bad))
(here / 'dist').mkdir(exist_ok=True)
(here / 'dist' / 'kingsroad-keep.html').write_text(text, encoding='utf-8', newline='\n')
print('built dist/kingsroad-keep.html', len(text), 'bytes')
