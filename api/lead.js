/**
 * Serverless Function Vercel — enregistrement des demandes des landing pages dans Brevo.
 *
 * Les landing pages envoient déjà la demande par e-mail (Formspree) ; cet appel, en complément,
 * range le prospect dans la liste Brevo des demandes entrantes avec sa provenance.
 */
import { addLead } from "./_lead.js";

const MAX_BODY = 20 * 1024;
const RATE = new Map();

function limited(ip) {
  const now = Date.now();
  const arr = (RATE.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now);
  RATE.set(ip, arr);
  return arr.length > 5;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) return null;
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ ok: false, error: "rate_limited" });
  const data = await readBody(req);
  if (!data) return res.status(400).json({ ok: false, error: "bad_request" });
  const email = (data.email || "").toString().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(422).json({ ok: false, error: "email" });
  const page = (data.page || "").toString().slice(0, 80);
  const campagne = (data.campagne || "").toString().slice(0, 200);
  const result = await addLead({
    email,
    nom: (data.nom || "").toString().slice(0, 120),
    societe: (data.entreprise || data.societe || "").toString().slice(0, 160),
    telephone: (data.telephone || "").toString().slice(0, 40),
    message: (data.message || "").toString(),
    source: [page, campagne].filter(Boolean).join(" — "),
  });
  return res.status(result.ok ? 200 : 202).json({ ok: result.ok });
}
