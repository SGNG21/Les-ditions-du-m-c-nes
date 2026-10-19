/**
 * Build statique + injection SEO centralisée.
 *
 * - Copie l'ensemble du site statique vers dist/
 * - Remplace le token {{SITE_URL}} par l'URL canonique résolue (site.config.js)
 * - Injecte <meta name="robots" content="noindex,nofollow"> sur les previews Vercel
 * - Génère dist/sitemap.xml et dist/robots.txt depuis la configuration
 *
 * Aucune dépendance externe (modules Node natifs uniquement).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSiteUrl, SITEMAP_PAGES } from "../site.config.js";
import { buildLivres, renderCatalogueSections } from "./livres.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

// Fichiers/dossiers à ne PAS copier dans dist (sources de build, méta-projet).
const EXCLUDE = new Set([
  ".git",
  ".github",
  "node_modules",
  "dist",
  "scripts",
  "api",
  "site.config.js",
  "data",
  "docs",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "vercel.json",
  ".gitignore",
  ".prettierignore",
  ".prettierrc",
  ".vercelignore",
]);

// Extensions traitées comme texte (substitution de token).
const TEXT_EXT = new Set([".html", ".xml", ".txt", ".webmanifest", ".json"]);

const { siteUrl, isProduction, noindex } = resolveSiteUrl(process.env);

function shouldExclude(name) {
  if (EXCLUDE.has(name)) return true;
  if (name.endsWith(".md")) return true; // README, CLIENT_DATA_REQUIRED, etc.
  return false;
}

/** URL propre (cleanUrls) : https://…/page.html → https://…/page, index.html → / */
function cleanUrl(url) {
  return url.replace(/\/index\.html$/, "/").replace(/\.html(?=$|[#?])/, "");
}

function transformHtml(content, rel = "") {
  let out = content.split("{{SITE_URL}}").join(siteUrl);
  // Adresses absolues (canonical, og:url, JSON-LD) sans « .html », comme les sert Vercel.
  const abs = new RegExp(siteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/[A-Za-z0-9_./-]*\\.html", "g");
  out = out.replace(abs, cleanUrl);
  // Mesure d'audience Cloudflare Web Analytics (sans cookie), sauf e-mails (assets/) et espace statistiques.
  if (!rel.startsWith("assets/") && rel !== "stats.html" && !out.includes("cloudflareinsights.com")) {
    out = out.replace(/<\/head>/i, `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "eb8227dfc72848e3b61179a9887bd3c4"}'></script></head>`);
  }
  if (noindex) {
    // Injecte le noindex juste après le charset (présent sur toutes les pages).
    out = out.replace(
      /(<meta charset="utf-8">)/i,
      '$1<meta name="robots" content="noindex,nofollow">'
    );
  }
  return out;
}

async function copyDir(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.relative(ROOT, path.join(srcDir, entry.name));
    // N'exclure qu'au premier niveau (les noms génériques comme "api" côté racine).
    if (srcDir === ROOT && shouldExclude(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === ".html") {
        const content = await fs.readFile(srcPath, "utf8");
        await fs.writeFile(destPath, transformHtml(content, rel));
      } else if (TEXT_EXT.has(ext)) {
        const content = await fs.readFile(srcPath, "utf8");
        await fs.writeFile(destPath, content.split("{{SITE_URL}}").join(siteUrl));
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP_PAGES.map((p) => {
    const loc = cleanUrl(`${siteUrl}${p.path}`);
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobots() {
  if (noindex) {
    // Preview/dev : on interdit toute indexation.
    return `User-agent: *\nDisallow: /\n`;
  }
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

async function main() {
  await fs.rm(DIST, { recursive: true, force: true });
  await copyDir(ROOT, DIST);
  const nLivres = await buildLivres(DIST, transformHtml);
  // Catalogue : tous les livres de data/livres.json, répartis par catégorie.
  const catPath = path.join(DIST, "catalogue.html");
  const cat = await fs.readFile(catPath, "utf8");
  const start = cat.indexOf('<div class="filter-row">');
  const end = cat.indexOf("<!--CATALOGUE-ALL-->");
  if (start > -1 && end > start) {
    const block = cat.slice(start, end);
    const featuredHtml = block.slice(block.indexOf('<a class="catalogue-item'));
    const featured = [...featuredHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const after = cat.indexOf("</div>", end + "<!--CATALOGUE-ALL-->".length) + "</div>".length;
    await fs.writeFile(catPath, cat.slice(0, start) + renderCatalogueSections(featuredHtml, featured) + cat.slice(after));
  }
  console.log(`[build] ${nLivres} pages livres générées.`);
  await fs.writeFile(path.join(DIST, "sitemap.xml"), buildSitemap());
  await fs.writeFile(path.join(DIST, "robots.txt"), buildRobots());

  console.log("[build] Terminé.");
  console.log(`[build] VERCEL_ENV = ${process.env.VERCEL_ENV || "(local)"}`);
  console.log(`[build] SITE_URL   = ${siteUrl}`);
  console.log(`[build] production = ${isProduction} | noindex = ${noindex}`);
}

main().catch((err) => {
  console.error("[build] ÉCHEC:", err);
  process.exit(1);
});
