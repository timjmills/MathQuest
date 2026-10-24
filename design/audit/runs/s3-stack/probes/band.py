# band.py img x0 y0 x1 y1 : ink extent inside a box (inner, borders excluded by 4px inset); prints empty bands %
import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('L'); x0,y0,x1,y1=map(int,sys.argv[2:6]); i=int(sys.argv[6]) if len(sys.argv)>6 else 8
px=im.load(); xs=[];ys=[]
for y in range(y0+i,y1-i):
    for x in range(x0+i,x1-i):
        if px[x,y]<160: xs.append(x); ys.append(y)
H=y1-y0; W=x1-x0
print(f"ink x {min(xs)}-{max(xs)} y {min(ys)}-{max(ys)}; top {100*(min(ys)-y0)/H:.0f}% bottom {100*(y1-max(ys))/H:.0f}% left {100*(min(xs)-x0)/W:.0f}% right {100*(x1-max(xs))/W:.0f}%")
