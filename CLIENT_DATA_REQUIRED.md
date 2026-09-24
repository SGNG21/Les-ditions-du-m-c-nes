# Données client à fournir avant mise en production

Ce fichier centralise **toutes les informations manquantes ou non vérifiables** que
le site ne doit pas inventer. Tant qu'elles ne sont pas fournies, les emplacements
concernés affichent un marqueur « À COMPLÉTER » ou une valeur neutre.

> Règle appliquée : aucune donnée biographique, juridique ou bibliographique n'a été
> inventée. Les éléments incertains ont été retirés de l'affichage et listés ici.

---

## 1. Formulaire de contact — configuration d'envoi (Brevo)

L'envoi réel est implémenté (`/api/contact`, Serverless Function Vercel + API Brevo).
Il est **inactif tant que ces variables d'environnement ne sont pas définies** dans
Vercel → Settings → Environment Variables (jamais dans le code / le navigateur) :

| Variable | Rôle | Obligatoire |
|---|---|---|
| `BREVO_API_KEY` | Clé API transactionnelle Brevo | ✅ |
| `CONTACT_TO_EMAIL` | E-mail des Éditions du Mécène (réception des demandes) | ✅ |
| `CONTACT_FROM_EMAIL` | E-mail expéditeur **vérifié dans Brevo** (ex. `no-reply@les-editions-du-mecene.fr`) | ✅ |
| `CONTACT_FROM_NAME` | Nom expéditeur (défaut « Les Éditions du Mécène ») | optionnel |
| `CONTACT_TO_NAME` | Nom destinataire (défaut « Les Éditions du Mécène ») | optionnel |

Sans ces variables, le formulaire affiche un message honnête (« envoi non configuré »)
et **ne simule jamais un succès**.

---

## 2. Portrait de Patrice de Moncan

- Sur demande du client, la photo **hotlinkée** depuis `journaldunet.com` est **conservée**
  à titre provisoire (basse résolution ~450 px, hébergement tiers non maîtrisé — risque de
  rupture si le fichier distant disparaît). `referrerpolicy="no-referrer"` ajouté pour
  limiter les blocages de hotlink.
- **À fournir :** un portrait **HD**, libre de droits pour usage web, officiellement
  validé par le client (format portrait ~4:5, min. 800×1000 px).
  Emplacements à remplacer : `index.html` (Chapitre V) et `patrice-de-moncan.html`
  (repérés par `data-client-asset="portrait-patrice"`).

---

## 3. Page Patrice de Moncan — faits à confirmer

Éléments **retirés de l'affichage** car non vérifiables en interne (à confirmer/fournir) :

- [ ] **Date et lieu de naissance**
- [ ] **Formation / université / diplôme exact** (l'ancienne mention « diplômé
  d'histoire et de sciences économiques » a été retirée faute de source confirmée)
- [ ] **Années de publication exactes** des ouvrages et éditions
- [ ] **Nombre exact de notices BnF** (l'ancien « 39 notices » a été retiré)
- [ ] **Distinctions personnelles** vs distinctions **de l'ouvrage** : confirmer
  lesquelles récompensent l'auteur et lesquelles récompensent le livre, et les années
- [ ] **Bibliographie récente 2014–2026** (non renseignée, à fournir si souhaité)
- [ ] Détail confirmé de son **rôle éditorial personnel** (sélection des projets,
  choix iconographiques, formats, papier, fabrication) pour l'axe « éditeur / directeur »

Faits conservés car confirmables en interne : **fondateur et directeur des Éditions du
Mécène depuis 1987** ; **auteur d'ouvrages sur Paris, Haussmann, l'urbanisme, le
patrimoine et les passages couverts** (attestés par le catalogue de la maison).

---

## 4. Mentions légales (`mentions-legales.html`)

- [ ] **Raison sociale / nom d'exploitation**
- [ ] **Forme juridique** (SARL, EI, association…)
- [ ] **Capital social** (le cas échéant)
- [ ] **Adresse du siège** (à confirmer — actuellement 1 rue du Docteur Thoral, 89390 Ravières)
- [ ] **SIREN / SIRET**
- [ ] **N° TVA intracommunautaire** (le cas échéant)
- [ ] **Directeur / responsable de la publication**
- [ ] **E-mail de contact officiel**
- [ ] **Téléphone officiel** (à confirmer — 06 81 27 78 60 / 03 86 55 30 59)
- [ ] **Hébergeur** (nom, adresse, téléphone). Actuellement hébergé par **Vercel Inc.**,
  340 S Lemon Ave #4133, Walnut, CA 91789, USA — à confirmer/officialiser.

---

## 5. Politique de confidentialité (`politique-confidentialite.html`)

- [ ] **Responsable de traitement** (identité + coordonnées)
- [ ] **Finalité exacte** du traitement des données du formulaire
- [ ] **Base légale** (intérêt légitime / consentement)
- [ ] **Durée de conservation** des messages et coordonnées
- [ ] **Destinataires** des données (interne + sous-traitant e-mail : Brevo/Sendinblue)
- [ ] **Transferts hors UE** éventuels (hébergeur Vercel = USA)
- [ ] **Coordonnées DPO / contact RGPD** (si applicable)

> Remarque : le formulaire ne comporte **pas** de case de consentement marketing, car
> les données servent uniquement à répondre à la demande de contact. Si une utilisation
> marketing est prévue plus tard, ajouter un consentement **séparé et non pré-coché**.

---

## 6. Domaine / SEO

- Domaine canonique de production : **https://www.les-editions-du-mecene.fr**
  (centralisé dans `site.config.js` → variable `SITE_URL`).
- [ ] Confirmer que ce domaine **pointe bien vers ce déploiement Vercel** (sinon les
  balises canoniques seront incohérentes).
- Les previews Vercel sont automatiquement mises en `noindex` (via le build).
