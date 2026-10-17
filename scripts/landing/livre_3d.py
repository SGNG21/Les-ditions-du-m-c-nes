# Génère un livre en relief (1re ou 4e de couverture) à partir d'une image plate.
# Usage : python3 scripts/landing/livre_3d.py couverture.jpg sortie.webp front|back [epaisseur]
import sys, numpy as np
from PIL import Image, ImageDraw

def coeffs(dst, src):
    A=[];B=[]
    for (x,y),(u,v) in zip(dst,src):
        A.append([x,y,1,0,0,0,-u*x,-u*y]); B.append(u)
        A.append([0,0,0,x,y,1,-v*x,-v*y]); B.append(v)
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()

def warp(img, dst, size):
    w,h=img.size
    return img.convert('RGBA').transform(size,Image.PERSPECTIVE,coeffs(dst,[(0,0),(w,0),(w,h),(0,h)]),Image.BICUBIC)

def render(src_path,out_path,side='front',thick=0.077,W=1200):
    cov=Image.open(src_path).convert('RGB')
    fw=int(W*0.70); fh=int(fw*cov.height/cov.width)
    cov=cov.resize((fw,fh),Image.LANCZOS)       # couleurs d'origine, non retouchées
    sp=int(fw*thick)                             # épaisseur visible (dos ou tranche)
    H=int(fh*1.10); size=(W,H); top=int(fh*0.04)
    k=0.06*fh                                    # fuite de perspective
    canvas=Image.new('RGBA',size,(0,0,0,0))
    if side=='front':
        # vue 3/4 gauche : dos à gauche, face de couverture, tranche des pages à droite
        x0=int(W*0.06)+sp; x1=x0+fw
        face=[(x0,top+k*0.35),(x1,top),(x1,top+fh),(x0,top+fh-k*0.30)]
        spine=[(x0-sp,top+k*0.75),(x0,top+k*0.35),(x0,top+fh-k*0.30),(x0-sp,top+fh-k*0.62)]
        pg=int(sp*0.30)
        pages=[(x1,top+3),(x1+pg,top+k*0.25+3),(x1+pg,top+fh-k*0.2-3),(x1,top+fh-3)]
        strip=cov.crop((0,0,max(2,int(fw*0.02)),fh))   # couleur du dos = bord gauche de la couverture
    else:
        x1=W-int(W*0.06)-sp; x0=x1-fw
        face=[(x0,top),(x1,top+k*0.35),(x1,top+fh-k*0.30),(x0,top+fh)]
        spine=[(x1,top+k*0.35),(x1+sp,top+k*0.75),(x1+sp,top+fh-k*0.62),(x1,top+fh-k*0.30)]
        pg=int(sp*0.30)
        pages=[(x0,top+3),(x0-pg,top+k*0.25+3),(x0-pg,top+fh-k*0.2-3),(x0,top+fh-3)]
        strip=cov.crop((fw-max(2,int(fw*0.02)),0,fw,fh))
    # dos : bande de couleur prolongée, légèrement ombrée pour le volume
    s=np.array(strip.resize((sp,fh))).astype(float)
    shade=np.linspace(0.72,0.88,sp)[None,:,None] if side=='front' else np.linspace(0.88,0.72,sp)[None,:,None]
    s=Image.fromarray(np.clip(s*shade,0,255).astype('uint8'))
    canvas.alpha_composite(warp(s,spine,size))
    # tranche des pages : papier crème rayé
    d=ImageDraw.Draw(canvas)
    d.polygon(pages,fill=(240,234,220,255))
    (ax,ay),(bx,by),(cx,cy),(ex,ey)=pages
    n=max(30,pg//2)
    for i in range(1,n):
        t=i/n; c=212+int(20*(i%2))
        d.line([(ax+(bx-ax)*t,ay+(by-ay)*t),(ex+(cx-ex)*t,ey+(cy-ey)*t)],fill=(c,c-5,c-16,255),width=1)
    # couverture : couleurs intactes, simple liseré de charnière
    a=np.array(cov).astype(float)
    hp=0.025 if side=='front' else 0.975
    x=np.arange(fw)[None,:,None]/fw
    a*=1-0.22*np.exp(-((x-hp)/0.004)**2)
    canvas.alpha_composite(warp(Image.fromarray(np.clip(a,0,255).astype('uint8')),face,size))
    bb=canvas.getbbox(); canvas=canvas.crop((bb[0]-4,bb[1]-4,bb[2]+4,bb[3]+4))
    canvas.save(out_path,quality=90,method=6); print(out_path,canvas.size)

if __name__=='__main__':
    render(sys.argv[1],sys.argv[2],sys.argv[3],float(sys.argv[4]) if len(sys.argv)>4 else 0.077)
