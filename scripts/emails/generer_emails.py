"""Génère les 3 e-mails Brevo (HTML compatible messageries) dans docs/brevo/.

Usage : python3 scripts/emails/generer_emails.py
Les balises {{ contact.PRENOM }}, {{ unsubscribe }} et {{ mirror }} sont celles de Brevo.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "brevo"
SITE = "https://www.les-editions-du-mecene.com"
INK, IVORY, WINE, GOLD, MUTED = "#1E1B17", "#F7F2E8", "#651C27", "#B79A5D", "#6F655B"
SERIF = "Georgia,'Times New Roman',serif"
SANS = "Helvetica,Arial,sans-serif"


def utm(path, campaign, content=""):
    sep = "&" if "?" in path else "?"
    tag = f"&utm_content={content}" if content else ""
    return f"{SITE}{path}{sep}utm_source=brevo&utm_medium=email&utm_campaign={campaign}{tag}"


def p(text, size=16, color="#2A2018", italic=False, margin="0 0 16px"):
    st = "font-style:italic;" if italic else ""
    return f'<p style="margin:{margin};font-family:{SERIF};font-size:{size}px;line-height:1.6;color:{color};{st}">{text}</p>'


def bullets(items):
    rows = "".join(
        f'<tr><td valign="top" style="padding:0 10px 8px 0;color:{GOLD};font-family:{SANS};font-size:14px;">&#9670;</td>'
        f'<td style="padding:0 0 8px;font-family:{SERIF};font-size:16px;line-height:1.5;color:#2A2018;">{t}</td></tr>'
        for t in items
    )
    return f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">{rows}</table>'


def button(label, href):
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;"><tr>'
        f'<td bgcolor="{WINE}" style="background:{WINE};">'
        f'<a href="{href}" style="display:inline-block;padding:15px 28px;font-family:{SANS};font-size:13px;'
        f'letter-spacing:2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;font-weight:bold;">{label}</a>'
        f"</td></tr></table>"
    )


def specs(text):
    return (
        f'<p style="margin:0 0 20px;padding:12px 0;border-top:1px solid #D9CCB3;border-bottom:1px solid #D9CCB3;'
        f'font-family:{SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:{MUTED};">{text}</p>'
    )


def quotes(text):
    return p(text, size=15, color=WINE, italic=True, margin="0 0 22px")


def email(title, preheader, hero_img, hero_alt, hero_bg, body, campaign, logo_path):
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title></head>
<body style="margin:0;padding:0;background:#EFE7D8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#EFE7D8" style="background:#EFE7D8;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:{IVORY};">
<tr><td align="center" style="padding:10px;font-family:{SANS};font-size:11px;color:{MUTED};background:#EFE7D8;">
<a href="{{{{ mirror }}}}" style="color:{MUTED};">Voir cet e-mail dans votre navigateur</a></td></tr>
<tr><td align="center" bgcolor="{INK}" style="background:{INK};padding:28px 20px 22px;">
<a href="{utm(logo_path, campaign, 'logo')}"><img src="{SITE}/assets/logo-mecene-clair.png" width="210" alt="Les Éditions du Mécène" style="display:block;width:210px;height:auto;border:0;"></a>
<p style="margin:10px 0 0;font-family:{SERIF};font-style:italic;font-size:14px;color:#D9CCB3;">la passion des beaux livres</p></td></tr>
<tr><td bgcolor="{hero_bg}" style="background:{hero_bg};"><a href="{utm(hero_img[1], campaign, 'image')}"><img src="{SITE}/{hero_img[0]}" width="600" alt="{hero_alt}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>
<tr><td style="padding:34px 40px 10px;">
{body}
<p style="margin:26px 0 4px;font-family:{SERIF};font-size:16px;color:#2A2018;">Bien cordialement,</p>
<p style="margin:0;font-family:{SERIF};font-size:17px;color:{INK};"><b>Patrice de Moncan</b></p>
<p style="margin:0 0 14px;font-family:{SANS};font-size:13px;color:{MUTED};">Président, Les Éditions du Mécène · <a href="tel:+33681277860" style="color:{MUTED};">06 81 27 78 60</a></p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 30px;"><tr>
<td valign="middle" style="padding-right:12px;"><img src="{SITE}/assets/logos/distinctions/whos-who-in-france.png" width="56" alt="Who’s Who in France" style="display:block;width:56px;height:auto;border:0;"></td>
<td valign="middle" style="font-family:{SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:{WINE};">Membre du Who’s Who in France</td>
</tr></table>
</td></tr>
<tr><td bgcolor="{INK}" style="background:{INK};padding:22px 40px;font-family:{SANS};font-size:11px;line-height:1.7;color:#A39684;">
<a href="{utm('/', campaign, 'pied')}" style="color:{GOLD};text-decoration:none;">les-editions-du-mecene.com</a><br>
Les Éditions du Mécène · <a href="mailto:contact@les-editions-du-mecene.com" style="color:#D9CCB3;">contact@les-editions-du-mecene.com</a> · <a href="tel:+33681277860" style="color:#D9CCB3;">06 81 27 78 60</a><br>
Vous recevez ce message en raison de vos fonctions professionnelles. <a href="{{{{ unsubscribe }}}}" style="color:#D9CCB3;">Se désinscrire</a>
</td></tr>
</table></td></tr></table>
</body></html>
"""


HELLO = p('Bonjour {{ contact.PRENOM | default : "Madame, Monsieur" }},')
PERSO = [
    "le logo de votre entreprise en 4<sup>e</sup> de couverture ;",
    "une préface d’environ 4 pages signée par votre Président ;",
    "des exemplaires numérotés, livrés à vos destinataires.",
]

CAMPAGNES = [
    {
        "fichier": "1-paris-avant-apres.html",
        "campaign": "paris-avant-apres",
        "objet": "Votre cadeau de fin d’année, à vos couleurs : Paris Avant-Après",
        "preheader": "Le Paris de Charles Marville vers 1860 et les mêmes lieux aujourd’hui : réédition 2026, personnalisée pour votre entreprise.",
        "hero": ("assets/emails/paris-avant-apres.jpg", "/lp-paris-avant-apres"),
        "hero_alt": "Paris Avant-Après Haussmann, réédition 2026",
        "hero_bg": INK,
        "body": lambda c: HELLO
        + p("Pour les fêtes de fin d’année, Les Éditions du Mécène rééditent <i>Paris Avant-Après Haussmann</i> : le Paris photographié par Charles Marville vers 1860, et les mêmes lieux aujourd’hui, photographiés de l’endroit exact d’où il avait pris ses clichés.")
        + p("Le livre peut être offert à vos couleurs :", margin="0 0 10px")
        + bullets(PERSO)
        + specs("520 pages · 31 × 23 cm · 640 photographies · dès 500 exemplaires, livrés pour décembre 2026")
        + quotes("« Somptueux ! » Les Échos &nbsp;·&nbsp; « Envoûtant » Europe 1")
        + button("Découvrir le livre", utm("/lp-paris-avant-apres", c, "bouton"))
        + p("Devis gratuit sous 48 heures. Je serais heureux d’en parler avec vous."),
    },
    {
        "fichier": "2-histoire-amoureuse-du-vin.html",
        "campaign": "histoire-vin",
        "objet": "Un cadeau d’affaires qui a du goût : Histoire Amoureuse du Vin",
        "preheader": "70 personnalités et leurs vins préférés, de Bacchus à Brad Pitt : un livre personnalisé à vos couleurs.",
        "hero": ("assets/emails/histoire-amoureuse-du-vin.jpg", "/lp-histoire-amoureuse-du-vin"),
        "hero_alt": "Histoire Amoureuse du Vin",
        "hero_bg": "#3A1418",
        "body": lambda c: HELLO
        + p("À travers les vins préférés des célébrités, de Bacchus à Brad Pitt, <i>Histoire Amoureuse du Vin</i>, de Debra Finerman et Patrice de Moncan, raconte 70 personnalités, chacune sur une double page.")
        + p("Pour vos cadeaux d’affaires, le livre peut être personnalisé à vos couleurs :", margin="0 0 10px")
        + bullets(PERSO)
        + specs("160 pages · 32 × 23,5 cm · grand format · dès 500 exemplaires")
        + quotes("« Un travail de titan… un régal à lire. » Sud Radio")
        + button("Découvrir le livre", utm("/lp-histoire-amoureuse-du-vin", c, "bouton"))
        + p("Devis gratuit sous 48 heures. Je serais heureux d’en parler avec vous."),
    },
    {
        "fichier": "3-site-livre-entreprise.html",
        "campaign": "site",
        "objet": "Votre entreprise a une histoire. Éditons-la.",
        "preheader": "Depuis 1987, plus de 250 livres d’entreprise créés de A à Z.",
        "hero": ("assets/emails/livres-entreprise.jpg", "/entreprises"),
        "hero_alt": "Livres créés par Les Éditions du Mécène",
        "hero_bg": "#EFE7D8",
        "body": lambda c: HELLO
        + p("Créées en 1987, Les Éditions du Mécène se consacrent à la publication de livres d’entreprise : plus de 250 livres créés de A à Z pour de grandes entreprises, des PME et des institutions culturelles.")
        + p("Un livre d’entreprise peut célébrer un anniversaire, honorer un fondateur, documenter un savoir-faire, une réussite, animer une inauguration ou devenir un cadeau institutionnel durable.")
        + p("<b>Trois façons de publier un livre avec nous :</b>", margin="0 0 10px")
        + bullets([
            "<b>Votre propre livre</b>, qui décrira l’histoire de votre entreprise, sa culture, ses hommes et ses activités ;",
            "<b>Le mécénat de création</b> : mécéner la création d’un livre sur le sujet de votre choix ;",
            "<b>La personnalisation</b> : mécéner un livre à paraître chez nous, aux couleurs de votre entreprise, avec votre logo en couverture et la préface de votre président.",
        ])
        + quotes("Plus de vingt années de collaboration avec Ségécé et BNP Paribas Real Estate, 16 livres pour la FNAIM, 20 catalogues pour Le Louvre des Antiquaires.")
        + button("Présenter votre projet", utm("/contact", c, "bouton"))
        + p(f'Ou découvrez <a href="{utm("/entreprises", c, "texte")}" style="color:{WINE};">quelques-unes de nos réalisations</a>.'),
    },
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for c in CAMPAGNES:
        # Le logo mène à la landing de la campagne (page d'accueil pour la campagne « site »).
        logo_path = c["hero"][1] if c["campaign"] != "site" else "/"
        html = email(c["objet"], c["preheader"], c["hero"], c["hero_alt"], c["hero_bg"], c["body"](c["campaign"]), c["campaign"], logo_path)
        (OUT / c["fichier"]).write_text(html, encoding="utf-8")
        print(OUT / c["fichier"])


if __name__ == "__main__":
    main()
