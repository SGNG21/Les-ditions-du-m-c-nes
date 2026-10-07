import html
LOGO='<img class="brand-logo" src="assets/logo-mecene.svg" width="1730" height="626" alt="Les Éditions du Mécène">'
def page(p):
    facts=''.join(f'<div><b>{k}</b><span>{v}</span></div>' for k,v in p['facts'])
    gallery=''.join(f'<figure><img loading="lazy" decoding="async" src="{s}" alt="{a}"><figcaption>{c}</figcaption></figure>' for s,a,c in p.get('gallery',[]))
    gal_html=f'<section class="lp-sec"><div class="wrap"><div class="lp-gallery">{gallery}</div></div></section>' if gallery else ''
    quotes=''.join(f'<blockquote>« {q} »<cite>{c}</cite></blockquote>' for q,c in p.get('quotes',[]))
    q_html=f'<section class="lp-sec lp-dark"><div class="wrap"><div class="eyebrow">Ils en parlent</div><div class="lp-quotes">{quotes}</div></div></section>' if quotes else ''
    points=''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a,b in p['points'])
    qty=''.join(f'<option>{o}</option>' for o in p['qty'])
    return f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow">
<title>{p['title']} — Les Éditions du Mécène</title>
<meta name="description" content="{html.escape(p['desc'])}">
<link rel="canonical" href="{{{{SITE_URL}}}}/{p['canon']}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Les Éditions du Mécène">
<meta property="og:title" content="{html.escape(p['title'])}"><meta property="og:description" content="{html.escape(p['desc'])}">
<meta property="og:image" content="{{{{SITE_URL}}}}/{p['cover']}"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#11110f"><link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="assets/favicon-32.png" sizes="32x32">
<link rel="stylesheet" href="style.css"></head><body class="lp {p['theme']}">
<header class="lp-top"><div class="wrap lp-top-in"><a href="index.html" aria-label="Les Éditions du Mécène — accueil">{LOGO}</a><a class="button lp-top-cta" href="#commander">{p['cta']}</a></div></header>
<main>
<section class="lp-hero"><div class="wrap lp-hero-grid">
<div class="lp-hero-copy"><div class="kicker">{p['kicker']}</div><h1>{p['h1']}</h1><p class="lp-lead">{p['lead']}</p>
<ul class="lp-points">{points}</ul>
<div class="hero-cta"><a class="button" href="#commander">{p['cta']}</a><a class="button button-ghost" href="#commander" data-usage="Cadeau d’affaires personnalisé">Offrir à vos clients, à vos couleurs</a></div></div>
<div class="lp-hero-visual"><img fetchpriority="high" decoding="async" src="{p['cover']}" alt="Couverture : {html.escape(p['title'])}"></div>
</div></section>
<section class="lp-sec"><div class="wrap lp-about"><div><div class="eyebrow">Le livre</div><h2>{p['h2']}</h2></div><div>{p['body']}<div class="book-specs lp-specs">{facts}</div></div></div></section>
{gal_html}{q_html}
<section class="lp-sec lp-gift"><div class="wrap lp-gift-grid"><div><div class="eyebrow">Pour les entreprises</div><h2>Le cadeau qu’on <em>garde.</em></h2><p class="copy">Offrez {p['short']} à vos clients et partenaires, personnalisé à vos couleurs : votre logo en couverture, une préface de votre président, des exemplaires numérotés. À partir de 100 exemplaires.</p></div><ol class="lp-steps"><li>Vous choisissez le nombre d’exemplaires</li><li>Vous nous envoyez votre logo et votre texte</li><li>Vous validez le bon à tirer</li><li>Nous imprimons et livrons</li></ol></div></section>
<section class="lp-sec lp-order" id="commander"><div class="wrap lp-order-grid"><div><div class="eyebrow">Commander</div><h2>Recevez <em>{p['short']}.</em></h2><p class="copy">Laissez-nous vos coordonnées : nous vous répondons sous 48 heures avec le prix, le délai de livraison et, pour les entreprises, une proposition de personnalisation.</p><p class="lp-phone">Ou appelez-nous : <a href="tel:+33681277860">06 81 27 78 60</a></p><div class="lp-cover-sm"><img loading="lazy" src="{p['cover']}" alt=""></div></div>
<form class="form" id="contact-form" novalidate>
<input type="hidden" name="projet" value="Commander : {p['short_raw']}">
<div class="field full"><label for="f-usage">Pour</label><select id="f-usage"><option>Moi-même ou un proche</option><option>Cadeau d’affaires personnalisé</option><option>Une librairie ou une institution</option></select></div>
<div class="field"><label for="f-qte">Nombre d’exemplaires</label><select id="f-qte">{qty}</select></div>
<div class="field"><label for="f-societe">Société <small>(facultatif)</small></label><input id="f-societe" name="societe" type="text" autocomplete="organization"></div>
<div class="field"><label for="f-nom">Nom &amp; prénom <span class="req" aria-hidden="true">*</span></label><input id="f-nom" name="nom" type="text" required autocomplete="name"><span class="field-error" id="e-nom">Merci d’indiquer votre nom.</span></div>
<div class="field"><label for="f-tel">Téléphone</label><input id="f-tel" name="telephone" type="tel" autocomplete="tel"></div>
<div class="field full"><label for="f-email">E-mail <span class="req" aria-hidden="true">*</span></label><input id="f-email" name="email" type="email" required autocomplete="email"><span class="field-error" id="e-email">Adresse e-mail invalide.</span></div>
<input type="hidden" name="fonction" id="f-fonction" value="">
<div class="field full"><label for="message">Message <span class="req" aria-hidden="true">*</span></label><textarea id="message" name="message" required>Bonjour, je souhaite commander {p['short_raw']}.</textarea><span class="field-error" id="e-message">Merci d’écrire quelques mots.</span></div>
<div class="hp-field" aria-hidden="true"><label for="company_url">Ne pas remplir ce champ</label><input id="company_url" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
<input type="hidden" name="ts" id="f-ts"><p class="form-status" id="form-status" role="status" aria-live="polite"></p>
<button class="button" type="submit">{p['cta']}</button>
<p class="form-note">Vos informations servent uniquement à répondre à votre demande. <a href="politique-confidentialite.html">Politique de confidentialité</a>.</p>
</form></div></section>
</main>
<footer class="lp-foot"><div class="wrap"><span>Les Éditions du Mécène · maison indépendante créée en 1987 · membre du SNE</span><span><a href="index.html">Le site</a> · <a href="mentions-legales.html">Mentions légales</a> · <a href="politique-confidentialite.html">Confidentialité</a></span></div></footer>
<script src="app.js"></script>
<script>
(function(){{var f=document.getElementById("contact-form");if(!f)return;
document.querySelectorAll("[data-usage]").forEach(function(a){{a.addEventListener("click",function(){{var u=document.getElementById("f-usage");if(u)u.value=a.getAttribute("data-usage");}});}});
var q=new URLSearchParams(location.search),src=["utm_source","utm_medium","utm_campaign"].map(function(k){{return q.get(k)}}).filter(Boolean).join(" / ");
f.addEventListener("submit",function(){{var m=f.message;if(m.value.indexOf("Exemplaires :")!==-1)return;if(m.value.trim().length<10)return;
m.value=m.value.trim()+"\\n\\nPour : "+document.getElementById("f-usage").value+"\\nExemplaires : "+document.getElementById("f-qte").value+(src?"\\nCampagne : "+src:"")+"\\nPage : {p['canon']}";}},true);}})();
</script></body></html>'''
P=[
dict(canon='lp-histoire-amoureuse-du-vin.html',theme='lp-wine',title='Histoire Amoureuse du Vin',cover='assets/vin.jpg',
 desc='70 personnalités et leurs vins préférés, de Dionysos à Churchill : le beau livre de Debra Finerman et Patrice de Moncan, à commander ou à offrir personnalisé.',
 kicker='Édition de prestige · grand format',h1='Histoire Amoureuse <em>du Vin.</em>',
 lead='De Dionysos à Napoléon, de Louis XIV à Churchill, de Colette à Sting : 70 personnalités racontées à travers leurs vins préférés.',
 points=[('70','personnalités, de l’Antiquité à nos jours'),('160','pages, grand format 32 × 23,5 cm'),('100','exemplaires minimum pour une édition à vos couleurs')],
 cta='Commander le livre',short='Histoire Amoureuse du Vin',short_raw='Histoire Amoureuse du Vin',
 h2='Une autre lecture de l’Histoire, <em>par le vin.</em>',
 body='<p class="copy">Depuis l’Antiquité, le vin accompagne les destins hors du commun. À la table des rois, dans l’intimité des artistes, au cœur des grandes décisions, il révèle une part essentielle de l’humanité. Chaque personnalité est racontée sur une double page, avec ses vins de prédilection.</p>',
 facts=[('Auteurs','Debra Finerman &amp; Patrice de Moncan'),('Format','32 × 23,5 cm'),('Pages','160'),('Éditeur','Les Éditions du Mécène')],
 gallery=[('assets/vin-prestige/double-napoleon.jpg','Double page Napoléon Ier','Napoléon Ier · le Chambertin'),('assets/vin-prestige/double-colette.jpg','Double page Colette','Colette · tous les crus'),('assets/vin-prestige/double-montaigne.jpg','Double page Montaigne','Montaigne · le clairet'),('assets/vin-prestige/double-sting.jpg','Double page Sting et Trudy Styler','Sting &amp; Trudy Styler')],
 quotes=[('Un travail de titan… un régal à lire.','Sud Radio'),('Voilà un ouvrage remarquable.','Valeurs Actuelles'),('Les auteurs s’amusent très sérieusement.','La Revue des Vins de France'),('Passionnant.','Le Magazine des Cavistes')],
 qty=['1 exemplaire','2 à 5','6 à 20','100 à 249 (édition personnalisée)','250 et plus']),
dict(canon='lp-paris-avant-apres.html',theme='lp-stone',title='Paris avant-après Haussmann',cover='assets/realisations/paris-avant-apres.jpg',
 desc='740 photographies : le Paris photographié par Charles Marville pour Haussmann, et les mêmes lieux aujourd’hui. Le livre de Patrice de Moncan, à commander ou à offrir.',
 kicker='Charles Marville · Studio Traktir · Patrice de Moncan',h1='Paris <em>avant-après</em> Haussmann.',
 lead='En 1860, Haussmann charge Charles Marville de photographier le Paris promis à la démolition. 150 ans plus tard, les mêmes points de vue, photographiés à l’identique.',
 points=[('740','photographies : 380 de Marville, 360 d’aujourd’hui'),('40','plans comparatifs'),('452','pages')],
 cta='Commander le livre',short='Paris avant-après Haussmann',short_raw='Paris avant-après Haussmann',
 h2='La ville d’avant Haussmann, <em>face à celle d’aujourd’hui.</em>',
 body='<p class="copy">À la demande de Patrice de Moncan, les photographes du Studio Traktir ont repris, un siècle et demi plus tard, les points de vue exacts de Charles Marville, photographe de la Ville de Paris sous le Second Empire. Rue par rue, le livre confronte les deux villes ; les légendes détaillent tout ce qui a changé.</p>',
 facts=[('Auteur','Patrice de Moncan'),('Photographies','Charles Marville · Studio Traktir'),('Pages','452'),('Parution','2010, Les Éditions du Mécène')],
 qty=['1 exemplaire','2 à 5','6 à 20','100 et plus (édition personnalisée)']),
dict(canon='lp-paris-inonde.html',theme='lp-water',title='Paris inondé, la grande crue de 1910',cover='assets/realisations/paris-inonde.jpg',
 desc='Janvier 1910 : la Seine envahit Paris. Le récit en photographies de la grande crue, un livre des Éditions du Mécène à commander ou à offrir.',
 kicker='Nouveauté · Les Éditions du Mécène',h1='Paris <em>inondé.</em>',
 lead='Janvier 1910 : la Seine sort de son lit et Paris vit sous les eaux. Rues parcourues en barque, quartiers submergés : la grande crue racontée par les photographies de l’époque.',
 points=[('1910','la grande crue de la Seine'),('Photographies','d’époque, en noir et blanc'),('Nouveauté','des Éditions du Mécène')],
 cta='Commander le livre',short='Paris inondé',short_raw='Paris inondé',
 h2='Quand la Seine <em>envahit Paris.</em>',
 body='<p class="copy">En janvier 1910, la crue de la Seine paralyse la capitale pendant des semaines. Ce livre réunit les images de ce Paris méconnaissable, où l’on circule en barque devant les immeubles haussmanniens.</p>',
 facts=[('Sujet','La grande crue de la Seine, janvier 1910'),('Illustrations','Photographies d’époque'),('Éditeur','Les Éditions du Mécène')],
 qty=['1 exemplaire','2 à 5','6 à 20','100 et plus (édition personnalisée)'])]
import os
for p in P:
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..',p['canon']),'w').write(page(p))
print('ok')
