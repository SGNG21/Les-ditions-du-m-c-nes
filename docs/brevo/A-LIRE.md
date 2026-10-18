# Campagnes Brevo — Les Éditions du Mécène

Trois e-mails prêts à importer dans Brevo : **Campagnes → Créer une campagne → E-mail →
Éditeur de code HTML**, puis coller le contenu du fichier.

| Fichier | Objet | Texte d’aperçu | Lien (étiqueté) |
|---|---|---|---|
| 1-paris-avant-apres.html | Votre cadeau de fin d’année, à vos couleurs : Paris Avant-Après | Le Paris de Charles Marville vers 1860 et les mêmes lieux aujourd’hui : réédition 2026, personnalisée pour votre entreprise. | /lp-paris-avant-apres · utm_campaign=paris-avant-apres |
| 2-histoire-amoureuse-du-vin.html | Un cadeau d’affaires qui a du goût : Histoire Amoureuse du Vin | 70 personnalités et leurs vins préférés, de Bacchus à Brad Pitt : un livre personnalisé à vos couleurs. | /lp-histoire-amoureuse-du-vin · utm_campaign=histoire-vin |
| 3-site-livre-entreprise.html | Votre entreprise a une histoire. Éditons-la. | Depuis 1987, plus de 250 livres d’entreprise créés de A à Z. | /contact et /entreprises · utm_campaign=site |

- **Expéditeur** : Patrice de Moncan — adresse en @les-editions-du-mecene.com (domaine à authentifier dans Brevo : SPF, DKIM, DMARC dans la zone DNS OVH).
- **Personnalisation** : `{{ contact.PRENOM }}` (attribut PRENOM des contacts) ; sans prénom, « Madame, Monsieur ».
- **Obligatoire** : `{{ unsubscribe }}` (désinscription) et `{{ mirror }}` (version navigateur) sont déjà en place.
- **Images** : servies depuis https://www.les-editions-du-mecene.com/assets/… — elles s’affichent une fois le .com branché sur le nouveau site.
- Pour modifier un texte : `scripts/emails/generer_emails.py`, puis `python3 scripts/emails/generer_emails.py`.
