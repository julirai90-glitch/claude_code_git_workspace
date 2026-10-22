"""Fetch swisstopo WMTS (LV95) tiles and mosaic an exact extent at given resolution."""
import sys, os, io, math, urllib.request, concurrent.futures as cf
import numpy as np
from PIL import Image
RES={'2056_25':{18:50,19:20,20:10,21:5,22:2.5,23:2,24:1.5,25:1},
     '2056_26':{19:20,20:10,21:5,22:2.5,23:2,24:1.5,25:1,26:0.5},
     '2056_28':{21:5,22:2.5,23:2,24:1.5,25:1,26:0.5,27:0.25,28:0.1}}
X0,Y0=2420000.0,1350000.0
def fetch(url,cache):
    if os.path.exists(cache): return Image.open(cache).convert('RGBA')
    for i in range(4):
        try:
            data=urllib.request.urlopen(url,timeout=60).read(); break
        except Exception as e:
            if getattr(e,'code',0)==404: return None
            err=e
    else: raise err
    open(cache,'wb').write(data)
    return Image.open(io.BytesIO(data)).convert('RGBA')
def mosaic(layer,time,tms,z,ext,ext_fmt,cachedir):
    r=RES[tms][z]; xmin,ymin,xmax,ymax=ext; span=256*r
    c0,c1=int((xmin-X0)//span),int((xmax-X0)//span)
    r0,r1=int((Y0-ymax)//span),int((Y0-ymin)//span)
    os.makedirs(cachedir,exist_ok=True)
    W=(c1-c0+1)*256; H=(r1-r0+1)*256
    out=Image.new('RGBA',(W,H),(0,0,0,0))
    jobs={}
    with cf.ThreadPoolExecutor(8) as ex:
        for c in range(c0,c1+1):
            for rr in range(r0,r1+1):
                url=f"https://wmts.geo.admin.ch/1.0.0/{layer}/default/{time}/2056/{z}/{c}/{rr}.{ext_fmt}"
                jobs[(c,rr)]=ex.submit(fetch,url,f"{cachedir}/{layer}_{time}_{z}_{c}_{rr}.{ext_fmt}")
        for (c,rr),f in jobs.items():
            im=f.result()
            if im: out.paste(im,((c-c0)*256,(rr-r0)*256))
    ox=X0+c0*span; oy=Y0-r0*span
    box=(round((xmin-ox)/r),round((oy-ymax)/r),round((xmax-ox)/r),round((oy-ymin)/r))
    return out.crop(box)
if __name__=='__main__':
    layer,time,tms,z,ext,fmt,out=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),[float(v) for v in sys.argv[5].split(',')],sys.argv[6],sys.argv[7]
    mosaic(layer,time,tms,z,ext,fmt,os.path.join(os.path.dirname(out) or '.','..','dl','tilecache')).save(out)
