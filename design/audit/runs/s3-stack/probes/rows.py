# rows.py img x0 x1 y0 y1 : rows (y) that have ink between x0+8..x1-8, ignoring rows that are a full-width rule
import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('L'); px=im.load()
x0,x1,y0,y1=map(int,sys.argv[2:6])
ys=[]
for y in range(y0+3,y1-2):
    n=sum(1 for x in range(x0+8,x1-8) if px[x,y]<150)
    if 0<n<0.9*(x1-x0-16): ys.append(y)
print(sys.argv[1].split('/')[-2], 'ink rows', ys[0] if ys else None, '-', ys[-1] if ys else None, 'cell', y0, y1, 'bottom band %.0f%%' % (100*(y1-ys[-1])/(y1-y0)) if ys else '')
