/**
 * Serverless Function Vercel — suivi des contacts qui ont cliqué dans une campagne (accès réservé).
 *
 *   GET  /api/stats-suivi?campaign=<id>[&process=<id>]
 *        → liste des cliqueurs (nom, entreprise, téléphone, suivi). L'export Brevo est asynchrone :
 *          tant qu'il n'est pas prêt, la réponse vaut { pending: true, process } et la page relance.
 *   POST /api/stats-suivi  { email, appele, commentaire, telephone }
 *        → enregistre le suivi sur la fiche du contact dans Brevo.
 *
 * Le suivi est rangé dans des attributs Brevo (créés au premier enregistrement) :
 *   SUIVI_APPELE ("oui" ou vide), SUIVI_COMMENTAIRE, SUIVI_DATE ; le téléphone dans TELEPHONE.
 */
import { isAuthed } from "./_stats-auth.js";

const API = "https://api.brevo.com/v3";
const SUIVI_ATTRS = ["SUIVI_APPELE", "SUIVI_COMMENTAIRE", "SUIVI_DATE"];

function headers() {
  return { "api-key": process.env.BREVO_API_KEY, accept: "application/json", "content-type": "application/json" };
}

async function call(path, options = {}) {
  const r = await fetch(API + path, { ...options, headers: headers() });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    const err = new Error(`brevo_${r.status}`);
    err.detail = detail.slice(0, 200);
    throw err;
  }
  return r.status === 204 ? {} : r.json().catch(() => ({}));
}

/** Adresses e-mail d'un export CSV Brevo (séparateur et nom de colonne variables). */
function emailsFromCsv(text) {
  const lines = String(text).replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const sep = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
  const head = lines[0].split(sep).map((h) => h.replace(/"/g, "").trim().toLowerCase());
  const col = head.findIndex((h) => /e-?mail/.test(h));
  const found = new Set();
  for (const line of lines.slice(col >= 0 ? 1 : 0)) {
    const cells = line.split(sep).map((c) => c.replace(/"/g, "").trim());
    const v = col >= 0 ? cells[col] : cells.find((c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c));
    if (v && /@/.test(v)) found.add(v.toLowerCase());
  }
  return [...found];
}

async function contactRow(email) {
  try {
    const c = await call(`/contacts/${encodeURIComponent(email)}`);
    const a = c.attributes || {};
    return {
      email,
      name: [a.PRENOM, a.NOM].filter(Boolean).join(" "),
      company: a.ENTREPRISE || "",
      job: a.FONCTION || a.JOB_TITLE || "",
      phone: a.TELEPHONE || a.SMS || a.TEL || "",
      called: a.SUIVI_APPELE === "oui",
      comment: a.SUIVI_COMMENTAIRE || "",
      date: a.SUIVI_DATE || "",
    };
  } catch {
    return { email, name: "", company: "", job: "", phone: "", called: false, comment: "", date: "" };
  }
}

async function clickers(campaignId, processId) {
  let pid = processId;
  if (!pid) {
    const start = await call(`/emailCampaigns/${campaignId}/exportRecipients`, {
      method: "POST",
      body: JSON.stringify({ recipientsType: "clickers" }),
    });
    pid = start.processId;
  }
  // L'export prend quelques secondes : on attend un peu ici, la page relance si besoin.
  for (let i = 0; i < 6; i++) {
    const p = await call(`/processes/${pid}`);
    if (p.status === "completed" && p.export_url) {
      const csv = await (await fetch(p.export_url)).text();
      const emails = emailsFromCsv(csv).slice(0, 300);
      const rows = [];
      for (let k = 0; k < emails.length; k += 8) {
        rows.push(...(await Promise.all(emails.slice(k, k + 8).map(contactRow))));
      }
      return { list: rows };
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  return { pending: true, process: pid };
}

async function ensureAttributes() {
  for (const name of SUIVI_ATTRS) {
    try {
      await call(`/contacts/attributes/normal/${name}`, { method: "POST", body: JSON.stringify({ type: "text" }) });
    } catch {
      // déjà existant
    }
  }
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 8192) return null;
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  if (!isAuthed(req)) return res.status(401).json({ ok: false, error: "unauthorized" });
  if (!process.env.BREVO_API_KEY) return res.status(503).json({ ok: false, error: "not_configured" });

  if (req.method === "GET") {
    const id = Number(req.query?.campaign);
    if (!(id > 0)) return res.status(400).json({ ok: false, error: "campaign" });
    const pid = Number(req.query?.process) || 0;
    try {
      return res.status(200).json({ ok: true, ...(await clickers(id, pid)) });
    } catch (err) {
      console.warn("[suivi] export des cliqueurs:", err.message, err.detail || "");
      return res.status(502).json({ ok: false, error: err.message });
    }
  }

  if (req.method === "POST") {
    const data = await readBody(req);
    const email = String(data?.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(422).json({ ok: false, error: "email" });
    const attributes = {
      SUIVI_APPELE: data.appele ? "oui" : "",
      SUIVI_COMMENTAIRE: String(data.commentaire || "").slice(0, 1000),
      SUIVI_DATE: new Date().toISOString().slice(0, 10),
    };
    if (data.telephone !== undefined) attributes.TELEPHONE = String(data.telephone).slice(0, 40);
    try {
      await ensureAttributes();
      await call(`/contacts/${encodeURIComponent(email)}`, { method: "PUT", body: JSON.stringify({ attributes }) });
      return res.status(200).json({ ok: true, date: attributes.SUIVI_DATE });
    } catch (err) {
      console.warn("[suivi] enregistrement:", err.message, err.detail || "");
      return res.status(502).json({ ok: false, error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "method_not_allowed" });
}
