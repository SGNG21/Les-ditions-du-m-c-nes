# Redirections de les-editions-du-mecene.fr vers les-editions-du-mecene.com

Le site officiel des Éditions du Mécène est désormais **https://les-editions-du-mecene.com**.
L'ancien site en .fr doit renvoyer chaque visiteur (et Google) vers la page équivalente du .com,
avec des **redirections permanentes 301**, page par page.

## Tableau des redirections (301)

| Ancienne adresse (.fr)                                   | Nouvelle adresse (.com)                                      |
|----------------------------------------------------------|--------------------------------------------------------------|
| https://www.les-editions-du-mecene.fr/                   | https://les-editions-du-mecene.com/                          |
| https://www.les-editions-du-mecene.fr/editeur-livre      | https://les-editions-du-mecene.com/entreprises               |
| https://www.les-editions-du-mecene.fr/entreprise         | https://les-editions-du-mecene.com/entreprises               |
| https://www.les-editions-du-mecene.fr/livres             | https://les-editions-du-mecene.com/entreprises               |
| https://www.les-editions-du-mecene.fr/collaboration      | https://les-editions-du-mecene.com/entreprises               |
| https://www.les-editions-du-mecene.fr/livre-cadeau       | https://les-editions-du-mecene.com/cadeau-fin-annee          |
| https://www.les-editions-du-mecene.fr/auteurs            | https://les-editions-du-mecene.com/                          |
| https://www.les-editions-du-mecene.fr/contact            | https://les-editions-du-mecene.com/contact                   |
| https://www.les-editions-du-mecene.fr/english-version    | https://les-editions-du-mecene.com/international             |
| **Toute autre page** du .fr                              | https://les-editions-du-mecene.com/                          |

Les mêmes règles valent pour l'adresse sans « www » (https://les-editions-du-mecene.fr/...).

## Deux façons de faire

### Solution A — Solocal met les redirections en place sur son hébergement
Leur demander d'appliquer le tableau ci-dessus en **301** (et non 302), puis de laisser
les redirections actives au moins jusqu'à la fin du contrat (idéalement 12 mois).

### Solution B (recommandée) — récupérer la gestion du nom de domaine .fr
Si Solocal accepte de transférer le domaine (code de transfert / « code AUTH »), ou simplement
de modifier ses DNS :

1. Pointer le .fr vers Vercel :
   - enregistrement **A** sur `les-editions-du-mecene.fr` → `76.76.21.21`
   - enregistrement **CNAME** sur `www` → `cname.vercel-dns.com.`
2. Ajouter `les-editions-du-mecene.fr` et `www.les-editions-du-mecene.fr` au projet Vercel
   « editions-du-mecene » (Settings → Domains).

Les redirections du tableau sont **déjà programmées dans le site** (fichier `vercel.json`) :
dès que le .fr pointe vers Vercel, elles fonctionnent toutes seules, sans rien d'autre à faire.
Avantage : le .fr reste sous notre contrôle après la fin du contrat Solocal.

## Après la mise en place

- Google Search Console : sur la propriété du .fr, Paramètres → **Changement d'adresse** → choisir le .com.
- Vérifier quelques anciennes adresses : elles doivent arriver sur la bonne page du .com.
- Ne pas laisser expirer le nom de domaine .fr : le renouveler pour garder les redirections.
