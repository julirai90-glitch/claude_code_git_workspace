import json
from PIL import Image
import numpy as np
from scipy import ndimage
def load(f):
    a=np.asarray(Image.open(f).convert('RGB')).astype(int); return a
out={}
# --- p8 map red dots
a=load('hi/h-08.jpg'); H,W,_=a.shape
r,g,b=a[...,0],a[...,1],a[...,2]
red=(r>170)&(g<90)&(b<90)
y0,y1=int(.29*H),int(.88*H); x0,x1=int(.05*W),int(.97*W)
m=np.zeros_like(red); m[y0:y1,x0:x1]=red[y0:y1,x0:x1]
lab,n=ndimage.label(m)
dots=[]
for i,sl in enumerate(ndimage.find_objects(lab)):
    h=sl[0].stop-sl[0].start; w=sl[1].stop-sl[1].start
    if 15<h<80 and 15<w<80 and abs(h-w)<10:
        dots.append([round((sl[1].start+w/2)/W,4),round((sl[0].start+h/2)/H,4),round(w/W,4)])
out['mapDots']=dots
print('dots',len(dots))
# --- p9 chart bars (red)
a=load('hi/h-09.jpg'); H,W,_=a.shape
r,g,b=a[...,0],a[...,1],a[...,2]
red=(r>160)&(g<100)&(b<100)
y0,y1=int(.44*H),int(.68*H)
sub=red[y0:y1]
colfrac=sub.sum(0)
cols=colfrac>5
# runs
runs=[];x=0
while x<W:
    if cols[x]:
        s=x
        while x<W and cols[x]: x+=1
        runs.append((s,x))
    x+=1
runs=[r_ for r_ in runs if r_[1]-r_[0]>8]
print('p9 bars',len(runs))
ys=np.where(sub.any(1))[0]
base=y0+ys.max()+1; top=y0+ys.min()
out['p9']={'bars':[[round(s/W,5),round(e/W,5)] for s,e in runs],'base':round(base/H,5),'top':round(top/H,5)}
# --- p27 Aderlass: grey + red bars
a=load('hi/h-27.jpg'); H,W,_=a.shape
r,g,b=a[...,0],a[...,1],a[...,2]
grey=(abs(r-g)<12)&(abs(g-b)<12)&(r>100)&(r<175)
red=(r>160)&(g<100)&(b<100)
bar=grey|red
y0,y1=int(.53*H),int(.76*H); x0,x1=int(.08*W),int(.95*W)
sub=bar[y0:y1,x0:x1]
cols=sub.sum(0)>8
runs=[];x=0
while x<len(cols):
    if cols[x]:
        s=x
        while x<len(cols) and cols[x]: x+=1
        runs.append((s+x0,x+x0))
    x+=1
runs=[r_ for r_ in runs if r_[1]-r_[0]>10]
print('p27 bars',len(runs), [ (e-s) for s,e in runs][:5])
ys=np.where(sub.any(1))[0]
out['p27']={'bars':[[round(s/W,5),round(e/W,5)] for s,e in runs],'top':round((y0+ys.min())/H,5),'bot':round((y0+ys.max()+1)/H,5)}
json.dump(out,open('geo.json','w'),indent=1)
print(out['p9']['base'],out['p9']['top'],out['p27']['top'],out['p27']['bot'])
