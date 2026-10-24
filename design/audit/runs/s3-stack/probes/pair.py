# pair.py out.png a.png b.png [c.png ...] : side-by-side sheet (critic contact sheet)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]
h = max(i.size[1] for i in ims); w = sum(i.size[0] for i in ims) + 8 * (len(ims) - 1)
S = Image.new('RGB', (w, h + 18), 'white'); d = ImageDraw.Draw(S); x = 0
for f, i in zip(files, ims):
    S.paste(i, (x, 18)); d.text((x + 4, 2), '/'.join(f.split('/')[-2:]), fill='blue'); x += i.size[0] + 8
S.save(out)
