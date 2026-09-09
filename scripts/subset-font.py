from pathlib import Path
from fontTools import subset
root = Path(__file__).resolve().parents[1]
text = ''.join(p.read_text(encoding='utf-8') for p in [root/'src/model.js',root/'src/main.js',root/'src/v2.js',root/'index.html'])
options = subset.Options()
options.flavor = 'woff2'
font = subset.load_font(str(root/'public/fonts/LXGWWenKai-Regular.ttf'), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font,str(root/'public/fonts/letter.woff2'),options)
print('Font subset saved')
