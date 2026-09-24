/**
 * Configuration centrale du site — source unique de vérité.
 * Utilisée par scripts/build.mjs pour générer canonical, OpenGraph,
 * JSON-LD, sitemap.xml et robots.txt. Ne plus hardcoder le domaine ailleurs.
 *
 * Le domaine de production est le domaine canonique officiel.
 * En preview/dev Vercel, on utilise l'URL Vercel courante + noindex,
 * pour ne pas créer une seconde version indexable du site.
 */

export const PRODUCTION_URL = "https://www.les-editions-du-mecene.fr";

export const SITE = {
  name: "Les Éditions du Mécène",
  productionUrl: PRODUCTION_URL,
  locale: "fr",
  // Coordonnées publiques déjà présentes dans le contenu du site.
  contact: {
    phones: ["+33681277860", "+33386553059"],
    address: {
      street: "1 rue du Docteur Thoral",
      postalCode: "89390",
      city: "Ravières",
      country: "FR",
    },
  },
};

/**
 * Résout l'URL canonique en fonction de l'environnement Vercel.
 * @param {NodeJS.ProcessEnv} env
 * @returns {{ siteUrl: string, isProduction: boolean, noindex: boolean }}
 */
export function resolveSiteUrl(env = process.env) {
  const vercelEnv = env.VERCEL_ENV; // "production" | "preview" | "development" | undefined
  const vercelUrl = env.VERCEL_URL; // ex: mon-projet-git-xxx.vercel.app (sans protocole)

  const isProduction = vercelEnv === "production";
  // Preview/development sur Vercel → URL de déploiement + noindex.
  // Build local (sans VERCEL_ENV) → domaine de prod, indexable (miroir local).
  const siteUrl = isProduction
    ? PRODUCTION_URL
    : vercelUrl
      ? `https://${vercelUrl}`
      : PRODUCTION_URL;

  // noindex sur toute preview/dev Vercel, jamais en production.
  const noindex = Boolean(vercelEnv) && vercelEnv !== "production";

  return { siteUrl, isProduction, noindex };
}

// Pages indexables pour la génération du sitemap (chemins servis).
export const SITEMAP_PAGES = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/maison.html", priority: "0.8", changefreq: "yearly" },
  { path: "/entreprises.html", priority: "0.9", changefreq: "yearly" },
  { path: "/catalogue.html", priority: "0.9", changefreq: "monthly" },
  { path: "/patrice-de-moncan.html", priority: "0.7", changefreq: "yearly" },
  { path: "/contact.html", priority: "0.8", changefreq: "yearly" },
  { path: "/ouvrage-haussmann.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-marville.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-guide-passages.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-jardins-haussmann.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-villes-utopiques.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-paris-incendie.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-elysee.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-noureev.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-operas-russes.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-objets-passion.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-strasbourg.html", priority: "0.6", changefreq: "yearly" },
  { path: "/ouvrage-vin.html", priority: "0.6", changefreq: "yearly" },
];
