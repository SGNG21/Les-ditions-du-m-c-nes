# Les Éditions du Mécène — Site web

Prototype de site multipage pour Les Éditions du Mécène (maison d'édition indépendante, fondée en 1987 par Patrice de Moncan).

## Structure

```
.
├── index.html               Accueil
├── catalogue.html           Catalogue (17 ouvrages, 5 univers)
├── editions-privees.html    Offre éditions d'entreprise (Dentressangle, Badoit, FNAIM…)
├── vin.html                 Projet "Histoire Amoureuse du Vin"
├── fondateur.html           Portrait de Patrice de Moncan
├── contact.html             Coordonnées et formulaire
├── styles.css               Feuille de style commune
├── assets/                  Couvertures, logo (fichiers séparés, non versionnés en base64)
└── vercel.json              Config Vercel (URLs sans .html)
```

Site 100% statique — HTML/CSS/JS vanilla, aucune dépendance, aucun build nécessaire.

## Déploiement

### Vercel (recommandé)

Le dépôt est prêt pour un import direct sur [vercel.com/new](https://vercel.com/new) :
- Framework preset : **Other** (site statique)
- Build command : *(aucun)*
- Output directory : `.`

Ou en local avec la CLI :
```bash
npm i -g vercel
vercel --prod
```

### En local

Aucun serveur requis — ouvrir `index.html` directement, ou servir le dossier :
```bash
python3 -m http.server 8000
```

## À faire avant mise en ligne définitive

- [ ] Faire valider tous les textes par Patrice de Moncan (dates, titres exacts, libellés de prix)
- [ ] Remplacer le cadre portrait vide (page fondateur) par une vraie photo
- [ ] Brancher le formulaire de contact (`contact.html`) sur un vrai service d'envoi (actuellement une alerte de démonstration)
- [ ] Vérifier les droits d'usage des couvertures et du texte des quatrièmes de couverture avant publication publique
- [ ] Ajouter un favicon et les balises Open Graph pour le partage sur les réseaux
