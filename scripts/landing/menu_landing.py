"""Ajoute aux landing pages le même menu que le site (liens, distinctions, livres à parrainer). Idempotent."""
import re,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')
MENU='''<!-- MENU LANDING -->
<style>
.lpm-btn{position:fixed;top:18px;right:18px;z-index:9000;display:flex;align-items:center;gap:12px;background:#14110E;color:#F3EEE4;border:0;padding:14px 20px;font:500 11px/1 'Jost','Helvetica Neue',sans-serif;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer}
.lpm-btn i{display:block;width:26px;height:1px;background:currentColor;position:relative}.lpm-btn i:after{content:'';position:absolute;left:8px;top:6px;width:18px;height:1px;background:currentColor}
.lpm{position:fixed;inset:0;z-index:9500;background:#11110f;color:#F3EEE4;display:none}
.lpm.open{display:grid;grid-template-columns:1.25fr .75fr}
.lpm-left{display:flex;flex-direction:column;padding:0 6vw}
.lpm-head{height:130px;display:flex;align-items:center;justify-content:center;position:relative}
.lpm-head img{height:96px;width:auto}
.lpm-links{flex:1;display:flex;flex-direction:column;justify-content:center}
.lpm-links a{display:flex;gap:24px;align-items:baseline;color:#F3EEE4;text-decoration:none;font:500 clamp(40px,5vw,84px)/.95 'Cormorant Garamond',Georgia,serif;letter-spacing:-.04em;padding:7px 0;transition:color .25s,padding .25s}
.lpm-links a span{font:400 11px 'DM Mono','Jost',monospace;letter-spacing:.12em;color:#B79A5D}
.lpm-links a:hover{color:#B79A5D;padding-left:18px}
.lpm-awards{border-top:1px solid rgba(255,255,255,.12);padding:22px 0 34px;display:flex;flex-direction:column;gap:12px}
.lpm-awards div{display:flex;flex-wrap:wrap;row-gap:12px}
.lpm-awards p{margin:0;padding:0 18px;border-left:1px solid rgba(183,154,93,.35)}
.lpm-awards p:first-child{padding-left:0;border-left:0}
.lpm-awards small{display:block;font:400 9px 'DM Mono','Jost',monospace;letter-spacing:.14em;text-transform:uppercase;color:#B79A5D;margin-bottom:5px}
.lpm-awards b{font:italic 400 17px 'Cormorant Garamond',Georgia,serif;color:#F3EEE4}
.lpm-awards>small{font:400 9.5px 'DM Mono','Jost',monospace;letter-spacing:.16em;text-transform:uppercase;color:#8f897c}
.lpm-side{background:#24221e;padding:0 var(--lpm-pad,48px) 5vh;display:flex;flex-direction:column}
.lpm-close{height:130px;display:flex;align-items:center;justify-content:flex-end}
.lpm-close button{background:none;border:1px solid rgba(243,238,228,.35);color:#F3EEE4;padding:12px 18px;font:500 11px 'Jost',sans-serif;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer}
.lpm-side h3{font:italic 500 clamp(28px,2.6vw,40px)/1.1 'Cormorant Garamond',Georgia,serif;color:#F3EEE4;margin:0}
.lpm-side h3 em{color:#B79A5D}
.lpm-books{position:relative;flex:1;min-height:0;margin:3vh 0}
.lpm-books a{position:absolute;inset:0;display:flex;flex-direction:column;color:inherit;text-decoration:none;opacity:0;transform:translateX(24px);transition:opacity .9s,transform .9s;pointer-events:none}
.lpm-books a.on{opacity:1;transform:none;pointer-events:auto}
.lpm-books img{display:block;height:calc(100% - 50px);width:auto;max-width:100%;object-fit:contain;object-position:left center;filter:drop-shadow(0 26px 40px rgba(0,0,0,.6));align-self:flex-start}
.lpm-books span{display:flex;justify-content:space-between;gap:16px;margin-top:18px;font:400 11px 'DM Mono','Jost',monospace;letter-spacing:.12em;text-transform:uppercase}
.lpm-books span i{font-style:normal;color:#B79A5D}
.lpm-ctrl{display:flex;align-items:center;gap:12px;margin-bottom:2.5vh}
.lpm-ctrl button{width:44px;height:44px;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:none;color:#F3EEE4;font-size:16px;cursor:pointer}
.lpm-ctrl i{width:26px;height:2px;background:rgba(255,255,255,.25)}.lpm-ctrl i.on{background:#B79A5D}
.lpm-contact{display:flex;align-items:center;gap:24px}
.lpm-contact a{background:#651c27;color:#F3EEE4;padding:16px 26px;text-decoration:none;font:500 11px 'Jost',sans-serif;letter-spacing:2.5px;text-transform:uppercase}
.lpm-contact a+a{background:none;padding:0 0 3px;border-bottom:1px solid rgba(255,255,255,.3);font:400 12px 'DM Mono','Jost',monospace;letter-spacing:.14em}
@media(max-width:1000px){.lpm.open{display:block;overflow:auto}.lpm-side{display:none}.lpm-head{justify-content:space-between}.lpm-head img{height:56px}.lpm-mclose{display:block!important}}
</style>
<button class="lpm-btn" type="button" aria-label="Ouvrir le menu" onclick="document.getElementById('lpm').classList.add('open')">Menu <i></i></button>
<div class="lpm" id="lpm" role="dialog" aria-label="Menu">
<div class="lpm-left">
<div class="lpm-head"><a href="index.html"><img src="assets/logo-mecene-clair.svg" alt="Les Éditions du Mécène"></a><button class="lpm-mclose" type="button" style="display:none;background:none;border:1px solid rgba(243,238,228,.35);color:#F3EEE4;padding:10px 14px;font:500 11px Jost,sans-serif;letter-spacing:2px;text-transform:uppercase" onclick="document.getElementById('lpm').classList.remove('open')">Fermer ×</button></div>
<nav class="lpm-links"><a href="index.html"><span>01</span>Accueil</a><a href="entreprises.html"><span>02</span>Éditions d’entreprise</a><a href="catalogue.html"><span>03</span>Catalogue</a><a href="contact.html"><span>04</span>Votre projet</a><a href="international.html" hreflang="en"><span>05</span>International</a></nav>
<div class="lpm-awards"><div><p><small>Prix</small><b>Société de Géographie</b></p><p><small>Grand Prix</small><b>FNAIM</b></p><p><small>Prix</small><b>Ville de Paris</b></p><p><small>Grand Prix</small><b>Musée d’Orsay</b></p><p><small>Grand Prix</small><b>SACEM</b></p></div><small>Maison d’édition indépendante · depuis 1987</small></div>
</div>
<aside class="lpm-side">
<div class="lpm-close"><button type="button" onclick="document.getElementById('lpm').classList.remove('open')">Fermer ×</button></div>
<h3>Pour les <em>fêtes de fin d’année</em>, devenez mécène de l’un de ces livres.</h3>
<div class="lpm-books">
<a class="on" href="lp-histoire-amoureuse-du-vin.html"><img src="assets/lp-vin/livre-relief.webp" alt="Histoire Amoureuse du Vin" loading="lazy"><span><b>Histoire Amoureuse du Vin</b><i>Devenir mécène →</i></span></a>
<a href="lp-paris-avant-apres.html"><img src="assets/avant-apres/livre-relief.webp" alt="Paris Avant-Après Haussmann" loading="lazy"><span><b>Paris Avant-Après Haussmann</b><i>Devenir mécène →</i></span></a>
</div>
<div class="lpm-ctrl"><button type="button" aria-label="Livre précédent" data-d="-1">←</button><i class="on"></i><i></i><button type="button" aria-label="Livre suivant" data-d="1">→</button></div>
<div class="lpm-contact"><a href="contact.html#contact-form">Prendre contact</a><a href="tel:+33681277860">06 81 27 78 60</a></div>
</aside>
</div>
<script>(function(){var m=document.getElementById('lpm'),it=[].slice.call(m.querySelectorAll('.lpm-books a')),dots=[].slice.call(m.querySelectorAll('.lpm-ctrl i')),i=0,t;
function show(n){it[i].classList.remove('on');dots[i].classList.remove('on');i=(n+it.length)%it.length;it[i].classList.add('on');dots[i].classList.add('on')}
function start(){clearInterval(t);t=setInterval(function(){show(i+1)},4500)}
m.querySelectorAll('.lpm-ctrl button').forEach(function(b){b.onclick=function(){show(i+(+b.dataset.d));start()}});start();
document.addEventListener('keydown',function(e){if(e.key==='Escape')m.classList.remove('open')})})();</script>
<!-- /MENU LANDING -->
'''
for name in ['lp-histoire-amoureuse-du-vin.html','lp-paris-avant-apres.html','lp-paris-inonde.html']:
    f=os.path.join(ROOT,name); s=open(f).read()
    s=re.sub(r'<!-- MENU LANDING -->.*?<!-- /MENU LANDING -->\n','',s,flags=re.S)
    s=s.replace('</body>',MENU+'</body>',1)
    open(f,'w').write(s); print(name,'ok')
