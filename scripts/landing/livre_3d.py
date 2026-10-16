# Génère un livre en relief (1re ou 4e de couverture) à partir d’une image plate.
# Usage : python3 scripts/landing/livre_3d.py couverture.jpg sortie.webp front|back
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
def coeffs(dst, src):
    # maps output (dst) pts -> input (src) pts
    A=[];B=[]
    for (x,y),(u,v) in zip(dst,src):
        A.append([x,y,1,0,0,0,-u*x,-u*y]); B.append(u)
        A.append([0,0,0,x,y,1,-v*x,-v*y]); B.append(v)
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()
def render(src_path,out_path,side='front',W=1100):
    cov=Image.open(src_path).convert('RGB')
    cw,ch=cov.size; ar=ch/cw
    fw=int(W*0.78); fh=int(fw*ar)
    cov=cov.resize((fw,fh),Image.LANCZOS)
    # --- surface : rainure de charnière + léger vernis
    a=np.array(cov).astype(float)
    x=np.arange(fw)[None,:,None]/fw
    hinge_pos=0.035 if side=='front' else 0.965
    d=np.abs(x-hinge_pos)
    groove=1-0.38*np.exp(-(d/0.006)**2)          # creux sombre
    lift=1+0.10*np.exp(-((x-(hinge_pos+(0.012 if side=='front' else -0.012)))/0.01)**2)
    edge=1-0.25*np.clip((0.015-np.minimum(x,1-x))/0.015,0,1)  # bords assombris
    gl=1+0.06*np.exp(-((x-0.35)/0.25)**2)
    a=np.clip(a*groove*lift*edge*gl,0,255).astype('uint8')
    cov=Image.fromarray(a)
    H=int(fh*1.12); canvas=Image.new('RGBA',(W,H),(0,0,0,0))
    top=int(fh*0.05)
    # perspective : bord de la reliure plein, bord opposé raccourci
    shrink=0.055*fh
    if side=='front':
        x0=int(W*0.13); x1=x0+fw
        dst=[(x0,top),(x1,top+shrink*0.55),(x1,top+fh-shrink*0.45),(x0,top+fh)]
    else:
        x1=int(W*0.87); x0=x1-fw
        dst=[(x0,top+shrink*0.55),(x1,top),(x1,top+fh),(x0,top+fh-shrink*0.45)]
    src=[(0,0),(fw,0),(fw,fh),(0,fh)]
    # tranche de pages (côté opposé à la reliure)
    d=ImageDraw.Draw(canvas)
    pw=int(W*0.022)
    if side=='front':
        (ax,ay),(bx,by)=dst[1],dst[2]
        pages=[(ax,ay+2),(ax+pw,ay+6),(bx+pw,by-6),(bx,by-2)]
    else:
        (ax,ay),(bx,by)=dst[0],dst[3]
        pages=[(ax,ay+2),(ax-pw,ay+6),(bx-pw,by-6),(bx,by-2)]
    d.polygon(pages,fill=(238,231,214,255))
    n=60
    for i in range(1,n):
        t=i/n
        if side=='front': xa=ax+pw*t; ya=ay+2+4*t; xb=bx+pw*t; yb=by-2-4*t
        else: xa=ax-pw*t; ya=ay+2+4*t; xb=bx-pw*t; yb=by-2-4*t
        c=205+int(25*((i%3)==0))
        d.line([(xa,ya),(xb,yb)],fill=(c,c-6,c-20,255),width=1)
    # dos (reliure) visible en fine bande
    sw=int(W*0.018)
    col=tuple(int(v*0.55) for v in np.array(cov).reshape(-1,3)[::97].mean(0))
    if side=='front':
        (px,py),(qx,qy)=dst[0],dst[3]
        d.polygon([(px-sw,py+4),(px,py),(qx,qy),(qx-sw,qy-4)],fill=col+(255,))
    else:
        (px,py),(qx,qy)=dst[1],dst[2]
        d.polygon([(px,py),(px+sw,py+4),(qx+sw,qy-4),(qx,qy)],fill=col+(255,))
    face=cov.convert('RGBA').transform((W,H),Image.PERSPECTIVE,coeffs(dst,src),Image.BICUBIC)
    canvas.alpha_composite(face)
    bb=canvas.getbbox(); canvas=canvas.crop((bb[0]-4,bb[1]-4,bb[2]+4,bb[3]+4))
    canvas.save(out_path,quality=88,method=6)
    print(out_path,canvas.size)
if __name__=='__main__':
    render(sys.argv[1],sys.argv[2],sys.argv[3])
