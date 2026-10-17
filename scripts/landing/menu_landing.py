"""Ajoute le menu du site (bouton « Menu » + panneau) aux landing pages. Idempotent."""
import re,sys,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')
MENU='''<!-- MENU LANDING -->
<style>
.lpm-btn{position:fixed;top:18px;right:18px;z-index:9000;display:flex;align-items:center;gap:12px;background:rgba(20,17,14,.82);backdrop-filter:blur(8px);color:#F3EEE4;border:1px solid rgba(201,168,76,.45);padding:12px 18px;font:500 11px/1 'Jost','Helvetica Neue',sans-serif;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer}
.lpm-btn i{display:block;width:22px;height:1px;background:currentColor;position:relative}.lpm-btn i:after{content:'';position:absolute;left:6px;top:5px;width:16px;height:1px;background:currentColor}
.lpm{position:fixed;inset:0;z-index:9500;background:#14110E;color:#F3EEE4;display:none;overflow:auto}
.lpm.open{display:block}
.lpm-in{max-width:1200px;margin:0 auto;padding:28px 32px 48px;display:grid;grid-template-columns:1.1fr .9fr;gap:60px;min-height:100%}
.lpm-head{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center}
.lpm-head img{height:58px;width:auto}
.lpm-close{background:none;border:0;color:#F3EEE4;font:500 11px 'Jost',sans-serif;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer}
.lpm-links a{display:flex;gap:18px;align-items:baseline;color:#F3EEE4;text-decoration:none;font:400 clamp(30px,4vw,54px)/1.12 'Cormorant Garamond',Georgia,serif;padding:6px 0;transition:color .2s,padding .2s}
.lpm-links a span{font:400 11px 'Jost',sans-serif;letter-spacing:2px;color:#C9A84C}
.lpm-links a:hover{color:#E2C97E;padding-left:10px}
.lpm-side h3{font:italic 400 28px/1.2 'Cormorant Garamond',Georgia,serif;color:#E2C97E;margin:0 0 22px}
.lpm-books{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lpm-books a{color:#F3EEE4;text-decoration:none;font:400 11px/1.5 'Jost',sans-serif;letter-spacing:1.5px;text-transform:uppercase}
.lpm-books img{display:block;width:100%;height:auto;margin-bottom:10px;filter:drop-shadow(0 18px 28px rgba(0,0,0,.6));transition:transform .3s}
.lpm-books a:hover img{transform:translateY(-4px)}
.lpm-books a[aria-current]{color:#C9A84C}
.lpm-contact{margin-top:34px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.lpm-contact a{color:#14110E;background:#C9A84C;padding:14px 22px;text-decoration:none;font:500 11px 'Jost',sans-serif;letter-spacing:2px;text-transform:uppercase}
.lpm-contact a+a{background:none;color:#E2C97E;border-bottom:1px solid rgba(226,201,126,.5);padding:4px 0}
@media(max-width:900px){.lpm-in{grid-template-columns:1fr;gap:36px;padding:20px 22px 40px}.lpm-head img{height:44px}.lpm-btn{top:12px;right:12px;padding:10px 14px}}
</style>
<button class="lpm-btn" type="button" aria-label="Ouvrir le menu" onclick="document.getElementById('lpm').classList.add('open')">Menu <i></i></button>
<div class="lpm" id="lpm" role="dialog" aria-label="Menu"><div class="lpm-in">
<div class="lpm-head"><a href="index.html"><img src="assets/logo-mecene-clair.svg" alt="Les Éditions du Mécène"></a><button class="lpm-close" type="button" onclick="document.getElementById('lpm').classList.remove('open')">Fermer ×</button></div>
<nav class="lpm-links"><a href="index.html"><span>01</span>Accueil</a><a href="entreprises.html"><span>02</span>Éditions d’entreprise</a><a href="catalogue.html"><span>03</span>Catalogue</a><a href="contact.html"><span>04</span>Votre projet</a><a href="international.html" hreflang="en"><span>05</span>International</a></nav>
<div class="lpm-side"><h3>Nos livres à offrir</h3><div class="lpm-books">
<a href="lp-histoire-amoureuse-du-vin.html"><img src="assets/lp-vin/livre-relief.webp" alt="" loading="lazy">Histoire Amoureuse du Vin</a>
<a href="lp-paris-avant-apres.html"><img src="assets/avant-apres/livre-relief.webp" alt="" loading="lazy">Paris Avant-Après</a>
<a href="lp-paris-inonde.html"><img src="assets/menu/paris-inonde-relief.webp" alt="" loading="lazy">Paris inondé</a>
</div><div class="lpm-contact"><a href="contact.html#contact-form">Prendre contact</a><a href="tel:+33681277860">06 81 27 78 60</a></div></div>
</div></div>
<script>(function(){var p=location.pathname.split('/').pop().replace('.html','');document.querySelectorAll('.lpm-books a').forEach(function(a){if(a.getAttribute('href').replace('.html','')===p)a.setAttribute('aria-current','page')});document.addEventListener('keydown',function(e){if(e.key==='Escape')document.getElementById('lpm').classList.remove('open')})})();</script>
<!-- /MENU LANDING -->
'''
for name in ['lp-histoire-amoureuse-du-vin.html','lp-paris-avant-apres.html','lp-paris-inonde.html']:
    f=os.path.join(ROOT,name); s=open(f).read()
    s=re.sub(r'<!-- MENU LANDING -->.*?<!-- /MENU LANDING -->\n','',s,flags=re.S)
    s=s.replace('</body>',MENU+'</body>',1)
    open(f,'w').write(s); print(name,'ok')
