import json
from PIL import Image
import numpy as np
g=json.load(open('geo.json'))
out={}
out['mapDots']=[d for d in g['mapDots'] if not (d[0]<0.2 and d[1]<0.42)]
def chart(f,key,bars,y_top,y_bot,nbars,zero=None,name=None):
    im=Image.open(f).convert('RGB'); a=np.asarray(im).astype(int); H,W,_=a.shape
    s0=bars[0][0]; e0=bars[0][1]; sl=bars[-1][0]; el=bars[-1][1]
    bw=e0-s0; pitch=(sl-s0)/(nbars-1)
    x0=int(s0*W)-6; x1=int(el*W)+6; y0=int(y_top*H); y1=int(y_bot*H)
    crop=a[y0:y1,x0:x1].copy()
    r,gg,b=crop[...,0],crop[...,1],crop[...,2]
    lum=crop.mean(2)
    # background per row = 90th percentile luminance pixel color (white/grid) - use median of brightest half
    clean=crop.copy()
    for y in range(crop.shape[0]):
        row=crop[y]; L=lum[y]
        dk=(row.max(1)<100)
        if dk.mean()>0.5:
            clean[y,:]=row[dk].mean(0); continue
        cand=row[L>195]
        if len(cand)<5: cand=row[L>=np.percentile(L,95)]
        vals,counts=np.unique((cand.mean(1)//5).astype(int),return_counts=True)
        mode=vals[counts.argmax()]
        sel=cand[(cand.mean(1)//5).astype(int)==mode]
        clean[y,:]=sel.mean(0)
    Image.fromarray(crop.astype(np.uint8)).save(f'video/assets/{name}_orig.png')
    Image.fromarray(clean.astype(np.uint8)).save(f'video/assets/{name}_clean.png')
    cols=[[ (s0+i*pitch - x0/W) / ((x1-x0)/W), (s0+i*pitch+bw - x0/W)/((x1-x0)/W)] for i in range(nbars)]
    res={'rect':[x0/W,y0/H,x1/W,y1/H],'cols':[[round(c[0],5),round(c[1],5)] for c in cols]}
    if zero is not None: res['zero']=(zero-y0)/(y1-y0)
    return res, a, (x0,y0,x1,y1)
# p9: top: a bit above highest gridline (500)
p9=g['p9']
res,a,_=chart('hi/h-09.jpg','p9',p9['bars'],p9['top']-0.004,p9['base']+0.0008,47,name='p9chart')
out['p9chart']=res
# p27: find zero line row: dark row in plot
a=np.asarray(Image.open('hi/h-27.jpg').convert('L')).astype(int); H,W=a.shape
p27=g['p27']; xs=int(p27['bars'][3][0]*W)-4  # gap column left of bar 4
xc=int((p27['bars'][2][1]*W+p27['bars'][3][0]*W)/2)
colv=a[int(.53*H):int(.77*H),xc]
dark=np.where(colv<80)[0]
zy=(int(.53*H)+dark[0]) / H
print('zero', zy, dark[:5])
res,_,_=chart('hi/h-27.jpg','p27',p27['bars'],0.532,0.7595,45,zero=zy*H,name='p27chart')
out['p27chart']=res
json.dump(out,open('video/geo.json','w'),indent=1)
print(json.dumps(out)[:600])
