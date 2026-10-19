/**
 * Serverless Function Vercel — données de l'espace statistiques (accès réservé).
 *
 *   GET /api/stats?days=7|30|90
 *   GET /api/stats?campaign=<id>   → détail d'une campagne (clics par lien)
 *
 * Réunit :
 *   - la fréquentation du site (Cloudflare Web Analytics, API GraphQL) ;
 *   - les campagnes e-mail envoyées (Brevo) ;
 *   - les dernières demandes reçues (liste Brevo « Mécène — Formulaire Landing »).
 *
 * Variables d'environnement :
 *   - STATS_PASSWORD        : mot de passe de l'espace (obligatoire)
 *   - CF_API_TOKEN          : jeton Cloudflare avec la permission « Account Analytics : Read »
 *   - CF_ACCOUNT_ID         : identifiant du compte Cloudflare
 *   - BREVO_API_KEY         : clé API Brevo
 *   - BREVO_LEADS_LIST_ID   : (optionnel) liste des demandes, défaut 8
 * Chaque bloc renvoie { error } s'il n'est pas configuré, sans bloquer les autres.
 */
import { isAuthed } from "./_stats-auth.js";

const HOST = "www.les-editions-du-mecene.com";

async function cloudflare(days) {
  const token = process.env.CF_API_TOKEN;
  const account = process.env.CF_ACCOUNT_ID;
  if (!token || !account) return { error: "not_configured" };
  const until = new Date();
  const since = new Date(until.getTime() - days * 86400000);
  const filter = `{requestHost: "${HOST}", datetime_geq: "${since.toISOString()}", datetime_leq: "${until.toISOString()}"}`;
  const group = (alias, limit, order, dims) =>
    `${alias}: rumPageloadEventsAdaptiveGroups(limit: ${limit}, filter: ${filter}${order ? `, orderBy: [${order}]` : ""}) { count sum { visits }${dims ? ` dimensions { ${dims} }` : ""} }`;
  const query = `{ viewer { accounts(filter: {accountTag: "${account}"}) {
    ${group("total", 1, "", "")}
    ${group("days", 100, "date_ASC", "date")}
    ${group("pages", 15, "count_DESC", "requestPath")}
    ${group("sources", 10, "count_DESC", "refererHost")}
    ${group("devices", 5, "count_DESC", "deviceType")}
    ${group("countries", 8, "count_DESC", "countryName")}
  } } }`;
  try {
    const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const json = await r.json();
    if (json.errors && json.errors.length) {
      console.warn("[stats] Cloudflare:", JSON.stringify(json.errors).slice(0, 300));
      return { error: "cloudflare_error" };
    }
    const acc = json.data?.viewer?.accounts?.[0] || {};
    const rows = (list, key) =>
      (list || []).map((g) => ({ label: key ? g.dimensions?.[key] || "" : "", views: g.count, visits: g.sum?.visits || 0 }));
    const total = acc.total?.[0];
    return {
      views: total?.count || 0,
      visits: total?.sum?.visits || 0,
      days: rows(acc.days, "date"),
      pages: rows(acc.pages, "requestPath"),
      sources: rows(acc.sources, "refererHost"),
      devices: rows(acc.devices, "deviceType"),
      countries: rows(acc.countries, "countryName"),
    };
  } catch (err) {
    console.warn("[stats] Cloudflare injoignable:", err.message);
    return { error: "network" };
  }
}

// Brevo met à jour les chiffres par liste (campaignStats) avant les totaux globaux : on les additionne.
function campaignTotals(c) {
  const lists = c.campaignStats || [];
  if (!lists.length) return c.statistics?.globalStats || {};
  return lists.reduce((t, x) => {
    for (const k of ["sent", "delivered", "uniqueViews", "uniqueClicks", "hardBounces", "softBounces", "unsubscriptions"]) t[k] = (t[k] || 0) + (x[k] || 0);
    return t;
  }, {});
}

async function brevo(path) {
  const r = await fetch(`https://api.brevo.com/v3${path}`, {
    headers: { "api-key": process.env.BREVO_API_KEY, accept: "application/json" },
  });
  if (!r.ok) throw new Error(`brevo_${r.status}`);
  return r.json();
}

async function campaigns() {
  if (!process.env.BREVO_API_KEY) return { error: "not_configured" };
  try {
    const data = await brevo("/emailCampaigns?status=sent&statistics=globalStats&excludeHtmlContent=true&limit=20&sort=desc");
    return {
      list: (data.campaigns || []).map((c) => {
        const s = campaignTotals(c);
        return {
          id: c.id,
          name: c.name,
          sentDate: c.sentDate || "",
          sent: s.sent || 0,
          delivered: s.delivered || 0,
          opens: s.uniqueViews || 0,
          clicks: s.uniqueClicks || 0,
          bounces: (s.hardBounces || 0) + (s.softBounces || 0),
          unsubscriptions: s.unsubscriptions || 0,
        };
      }),
    };
  } catch (err) {
    console.warn("[stats] Brevo campagnes:", err.message);
    return { error: err.message };
  }
}

async function campaignDetail(id) {
  if (!process.env.BREVO_API_KEY) return { error: "not_configured" };
  try {
    const base = `/emailCampaigns/${id}?excludeHtmlContent=true&statistics=`;
    const [g, l] = await Promise.all([brevo(base + "globalStats"), brevo(base + "linksStats")]);
    const s = campaignTotals(g);
    const links = Object.entries(l.statistics?.linksStats || {}).map(([url, clicks]) => {
      let path = url, content = "", campaign = "";
      try {
        const u = new URL(url);
        path = u.pathname;
        content = u.searchParams.get("utm_content") || "";
        campaign = u.searchParams.get("utm_campaign") || "";
      } catch {}
      return { url, path, content, campaign, clicks };
    });
    return {
      id: g.id,
      name: g.name,
      subject: g.subject,
      sentDate: g.sentDate || "",
      sent: s.sent || 0,
      delivered: s.delivered || 0,
      opens: s.uniqueViews || 0,
      clicks: s.uniqueClicks || 0,
      hardBounces: s.hardBounces || 0,
      softBounces: s.softBounces || 0,
      unsubscriptions: s.unsubscriptions || 0,
      utmCampaign: links.map((x) => x.campaign).find(Boolean) || "",
      links: links.sort((a, b) => b.clicks - a.clicks),
    };
  } catch (err) {
    console.warn("[stats] Brevo campagne:", err.message);
    return { error: err.message };
  }
}

async function leads() {
  if (!process.env.BREVO_API_KEY) return { error: "not_configured" };
  const listId = Number(process.env.BREVO_LEADS_LIST_ID || 8);
  try {
    const data = await brevo(`/contacts/lists/${listId}/contacts?limit=50&sort=desc`);
    return {
      total: data.count || 0,
      list: (data.contacts || []).map((c) => {
        const a = c.attributes || {};
        return {
          date: c.createdAt || "",
          email: c.email || "",
          name: [a.PRENOM, a.NOM].filter(Boolean).join(" "),
          company: a.ENTREPRISE || "",
          phone: a.TELEPHONE || "",
          source: a.SOURCE_CAMPAGNE || "",
        };
      }),
    };
  } catch (err) {
    console.warn("[stats] Brevo demandes:", err.message);
    return { error: err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  if (!isAuthed(req)) return res.status(401).json({ ok: false, error: "unauthorized" });
  const id = Number(req.query?.campaign);
  if (id > 0) return res.status(200).json({ ok: true, campaign: await campaignDetail(id) });
  const days = [7, 30, 90].includes(Number(req.query?.days)) ? Number(req.query.days) : 30;
  const [site, mail, demandes] = await Promise.all([cloudflare(days), campaigns(), leads()]);
  return res.status(200).json({ ok: true, days, site, campaigns: mail, leads: demandes });
}
