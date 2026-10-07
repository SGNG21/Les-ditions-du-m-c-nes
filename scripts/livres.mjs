/**
 * Pages livres générées au build depuis data/livres.json.
 *
 * Chaque couverture du site renvoie vers une page dédiée : livre-<slug>.html.
 * Les livres qui ont déjà une page éditoriale (champ "page", ex. ouvrage-vin.html)
 * ne sont pas générés : leurs couvertures pointent vers cette page.
 *
 * Le gabarit (en-tête, menu, pied de page) est repris d'une page ouvrage existante,
 * pour rester synchronisé avec le reste du site.
 */
import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

export function loadLivres() {
  return JSON.parse(readFileSync(path.join(ROOT, "data", "livres.json"), "utf8"));
}

/** Fiche sans description sourcée : non indexée tant qu'elle n'est pas enrichie. */
export function isThin(b) {
  return !b.description;
}

export function livreHref(b) {
  return b.page || `livre-${b.slug}.html`;
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const CATEGORIES = {
  entreprise: "Livre d’entreprise",
  musee: "Musées & institutions",
  catalogue: "Catalogue de la maison",
  auteur: "Debra Finerman",
};

const ANCRES = { entreprise: "realisations", musee: "musees", catalogue: "autres-livres" };

function fallbackText(b) {
  const t = `« ${b.titre} »`;
  if (b.categorie === "musee" && b.client)
    return `${t} fait partie des ouvrages réalisés par Les Éditions du Mécène pour ${b.client}, au service des musées et des grandes institutions culturelles.`;
  if (b.client)
    return `${t} fait partie des livres réalisés par Les Éditions du Mécène pour ${b.client}. Comme chaque ouvrage de la maison, il a été conçu en étroite collaboration avec son commanditaire, du texte à l’impression.`;
  return `${t} fait partie du catalogue des Éditions du Mécène, maison d’édition indépendante fondée en 1987 par Patrice de Moncan.`;
}

function firstSentence(text) {
  const m = String(text).match(/^(.{60,260}?[.!?])(\s|$)/);
  return m ? m[1] : text;
}

function related(b, all) {
  const pool = all.filter((x) => x.slug !== b.slug);
  const sameClient = b.client
    ? pool.filter((x) => x.client && x.client === b.client)
    : [];
  const sameCat = pool.filter((x) => x.categorie === b.categorie && !sameClient.includes(x));
  const i = all.indexOf(b);
  // Sélection stable : voisins dans le catalogue, à défaut de même client.
  const rotated = sameCat.slice(i % Math.max(sameCat.length, 1)).concat(sameCat);
  return [...sameClient, ...rotated].slice(0, 4);
}

function renderMain(b, all) {
  const cat = CATEGORIES[b.categorie] || "Catalogue";
  const desc = b.description || fallbackText(b);
  const intro = b.client ? `Un livre réalisé pour ${b.client}.` : firstSentence(desc);
  const specs = [];
  if (b.client) {
    const links = (b.liens_client || [])
      .map(
        (l) =>
          `<a class="spec-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.nom)} ↗</a>`
      )
      .join(" ");
    specs.push(["Commanditaire", `${esc(b.client)}${links ? `<br>${links}` : ""}`]);
  }
  if (b.auteurs) specs.push(["Auteurs", esc(b.auteurs)]);
  if (b.annee) specs.push(["Année", esc(b.annee)]);
  if (b.pages) specs.push(["Pages", `${esc(b.pages)} pages`]);
  if (b.isbn) specs.push(["ISBN", esc(b.isbn)]);
  if (b.prix?.length) specs.push(["Distinctions", b.prix.map(esc).join("<br>")]);
  specs.push(["Éditeur", "Les Éditions du Mécène"]);

  const press = (b.presse || []).length
    ? `<section class="chapter dark livre-press"><div class="chapter-no">Références</div><div class="wrap"><div class="chapter-head"><h2 class="reveal">Ils en <em>parlent.</em></h2><p class="copy reveal delay">Articles, notices et pages de référence consacrés à cet ouvrage. Liens externes, ouverts dans un nouvel onglet.</p></div><div class="press-list">${b.presse
        .map(
          (p) =>
            `<a class="press-item" href="${esc(p.url)}" target="_blank" rel="noopener"><small>${esc(p.source)}</small><span>${esc(p.titre)}</span></a>`
        )
        .join("")}</div></div></section>`
    : "";

  const voir = b.voir_aussi
    ? ` <a class="button button-ghost" href="${esc(b.voir_aussi)}">${esc(b.voir_aussi_label || "Voir l’ouvrage de référence")}</a>`
    : "";

  const rel = related(b, all)
    .map(
      (x) =>
        `<a class="river-item" href="${esc(livreHref(x))}"><div class="river-cover"><img decoding="async" loading="lazy" width="${x.w}" height="${x.h}" src="${esc(x.src)}" alt="${esc(x.titre)}"></div><h4>${esc(x.titre)}</h4><p>${esc(x.client || CATEGORIES[x.categorie] || "")}</p></a>`
    )
    .join("");

  return `<main>
<section class="pagehero livre-hero"><div class="folio">${esc(cat)} · Ouvrage</div><div class="wrap">
<div class="kicker"><a href="${b.categorie === "auteur" ? "debra-finerman.html#livres" : `entreprises.html#${ANCRES[b.categorie] || "realisations"}`}">${esc(cat)}</a></div>
<h1>${esc(b.titre)}</h1>
<p class="intro">${esc(intro)}</p>
</div></section>
<section class="chapter paper"><div class="wrap book-detail">
<div class="book-detail-cover reveal"><img decoding="async" width="${b.w}" height="${b.h}" src="${esc(b.src)}" alt="${esc(b.titre)}${b.client ? ` — livre réalisé pour ${esc(b.client)}` : ""}"></div>
<div class="book-detail-copy reveal delay">
<div class="eyebrow">${esc(b.client || cat)}</div>
<h2 class="livre-title">${esc(b.titre)}</h2>
<div class="book-specs">
${specs.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join("\n")}
</div>
<p class="copy">${esc(desc)}</p>${b.description_courte ? `<p class="copy">${esc(b.description_courte)}</p>` : ""}
${b.achat ? `<a class="button" href="contact.html?ouvrage=${encodeURIComponent(b.achat)}#contact-form">Commander ce livre</a>` : `<a class="button" href="contact.html?ouvrage=${encodeURIComponent(b.titre)}#contact-form">Créer un livre comme celui-ci</a>`}${voir}
</div></div></section>
${press}
<section class="chapter"><div class="chapter-no">Autres ouvrages</div><div class="wrap chapter-head">
<h2 class="reveal">Poursuivre la <em>lecture.</em></h2>
<p class="copy reveal delay">D’autres livres créés par la maison. <a class="text-link" href="entreprises.html#realisations">Toutes les réalisations</a></p>
</div><div class="wrap livre-related">${rel}</div></section>
</main>`;
}

function renderHead(b, desc) {
  const url = `{{SITE_URL}}/livre-${b.slug}.html`;
  const title = `${b.titre} — Les Éditions du Mécène`;
  const book = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${url}#livre`,
    name: b.titre,
    url,
    image: `{{SITE_URL}}/${b.src}`,
    inLanguage: "fr",
    publisher: { "@type": "Organization", name: "Les Éditions du Mécène", url: "{{SITE_URL}}/" },
  };
  if (b.auteurs) book.author = b.auteurs.split(/,\s*/).map((name) => ({ "@type": "Person", name }));
  if (b.annee) book.datePublished = b.annee;
  if (b.isbn) book.isbn = b.isbn;
  if (b.pages && /^\d+$/.test(b.pages)) book.numberOfPages = Number(b.pages);
  if (b.prix?.length) book.award = b.prix;
  if (b.presse?.length)
    book.subjectOf = b.presse.map((p) => ({
      "@type": "CreativeWork",
      name: p.titre,
      url: p.url,
      publisher: { "@type": "Organization", name: p.source },
    }));
  if (b.client) book.sponsor = { "@type": "Organization", name: b.client, ...(b.liens_client?.[0] ? { url: b.liens_client[0].url } : {}) };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "{{SITE_URL}}/index.html" },
      { "@type": "ListItem", position: 2, name: "Éditions d’entreprise", item: "{{SITE_URL}}/entreprises.html" },
      { "@type": "ListItem", position: 3, name: b.titre, item: url },
    ],
  };
  const d = esc(desc.length > 300 ? desc.slice(0, 297).replace(/\s\S*$/, "") + "…" : desc);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${d}">${isThin(b) ? '\n<meta name="robots" content="noindex,follow">' : ""}
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#11110f"><link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="assets/favicon-32.png" sizes="32x32"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<title>${esc(title)}</title>
<meta property="og:type" content="book">
<meta property="og:site_name" content="Les Éditions du Mécène">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="{{SITE_URL}}/${esc(b.src)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">${JSON.stringify(book)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>`;
}

/** Écrit les pages livre-*.html dans destDir, en appliquant transform (substitution SITE_URL…). */
export async function buildLivres(destDir, transform = (s) => s) {
  const all = loadLivres();
  const tpl = await fs.readFile(path.join(ROOT, "ouvrage-strasbourg.html"), "utf8");
  const bodyStart = tpl.slice(tpl.indexOf("</head>") + "</head>".length, tpl.indexOf("<main>"));
  const bodyEnd = tpl.slice(tpl.indexOf("</main>") + "</main>".length);
  let n = 0;
  for (const b of all) {
    if (b.page) continue;
    const desc = b.description || fallbackText(b);
    const html = renderHead(b, desc) + bodyStart + renderMain(b, all) + bodyEnd;
    await fs.writeFile(path.join(destDir, `livre-${b.slug}.html`), transform(html));
    n++;
  }
  return n;
}
