/**
 * Serverless Function Vercel — traitement du formulaire de contact.
 *
 * Envoi RÉEL via l'API transactionnelle Brevo. La clé API n'est JAMAIS
 * exposée au navigateur : elle est lue côté serveur dans les variables
 * d'environnement Vercel.
 *
 * Variables d'environnement attendues (à définir dans Vercel → Settings → Environment Variables) :
 *   - BREVO_API_KEY       : clé API Brevo (obligatoire pour l'envoi réel)
 *   - CONTACT_TO_EMAIL    : e-mail des Éditions du Mécène (destinataire des notifications)
 *   - CONTACT_FROM_EMAIL  : e-mail expéditeur vérifié dans Brevo (ex: no-reply@les-editions-du-mecene.fr)
 *   - CONTACT_FROM_NAME   : (optionnel) nom expéditeur, défaut "Les Éditions du Mécène"
 *   - CONTACT_TO_NAME     : (optionnel) nom destinataire, défaut "Les Éditions du Mécène"
 *
 * Comportement sans configuration : renvoie HTTP 503 { error: "not_configured" }.
 * Aucun faux succès n'est jamais renvoyé.
 */

const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const rateStore = new Map(); // clé: IP -> [timestamps] (best-effort, mémoire d'instance)
const MAX_BODY = 20 * 1024; // 20 Ko

function rateLimited(ip) {
  const now = Date.now();
  const arr = (rateStore.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  arr.push(now);
  rateStore.set(ip, arr);
  return arr.length > RATE_LIMIT.max;
}

function isEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function esc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error("payload_too_large");
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

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }

  let data;
  try {
    data = await readBody(req);
  } catch {
    return res.status(413).json({ ok: false, error: "payload_too_large" });
  }
  if (!data) return res.status(400).json({ ok: false, error: "invalid_body" });

  // Honeypot : champ invisible qui ne doit jamais être rempli par un humain.
  if (data.company_url) {
    return res.status(200).json({ ok: true, discarded: true });
  }
  // Anti-bot temporel : soumission < 2s après chargement = suspect.
  const elapsed = Date.now() - Number(data.ts || 0);
  if (Number.isFinite(elapsed) && data.ts && elapsed < 2000) {
    return res.status(200).json({ ok: true, discarded: true });
  }

  // Validation serveur des champs obligatoires.
  const nom = (data.nom || "").toString().trim();
  const email = (data.email || "").toString().trim();
  const message = (data.message || "").toString().trim();
  const errors = {};
  if (nom.length < 2) errors.nom = "requis";
  if (!isEmail(email)) errors.email = "invalide";
  if (message.length < 10) errors.message = "trop court";
  if (Object.keys(errors).length) {
    return res.status(422).json({ ok: false, error: "validation", fields: errors });
  }

  const societe = (data.societe || "").toString().trim();
  const fonction = (data.fonction || "").toString().trim();
  const telephone = (data.telephone || "").toString().trim();
  const projet = (data.projet || "").toString().trim();

  const { BREVO_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  const CONTACT_FROM_NAME = process.env.CONTACT_FROM_NAME || "Les Éditions du Mécène";
  const CONTACT_TO_NAME = process.env.CONTACT_TO_NAME || "Les Éditions du Mécène";

  // Pas de credentials → on le dit honnêtement, on NE simule PAS un succès.
  if (!BREVO_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return res.status(503).json({
      ok: false,
      error: "not_configured",
      message:
        "Le formulaire n'est pas encore connecté au service d'envoi. Merci de nous écrire ou de nous appeler directement.",
    });
  }

  const summaryHtml = `
    <h2>Nouvelle demande de contact — site Les Éditions du Mécène</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td><b>Nom</b></td><td>${esc(nom)}</td></tr>
      <tr><td><b>Société</b></td><td>${esc(societe) || "—"}</td></tr>
      <tr><td><b>Fonction</b></td><td>${esc(fonction) || "—"}</td></tr>
      <tr><td><b>E-mail</b></td><td>${esc(email)}</td></tr>
      <tr><td><b>Téléphone</b></td><td>${esc(telephone) || "—"}</td></tr>
      <tr><td><b>Type de projet</b></td><td>${esc(projet) || "—"}</td></tr>
      <tr><td valign="top"><b>Message</b></td><td>${esc(message).replace(/\n/g, "<br>")}</td></tr>
    </table>`;

  async function brevoSend(payload) {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      throw new Error(`brevo_${r.status}:${detail.slice(0, 200)}`);
    }
    return r.json().catch(() => ({}));
  }

  try {
    // 1) Notification interne à la maison.
    await brevoSend({
      sender: { email: CONTACT_FROM_EMAIL, name: CONTACT_FROM_NAME },
      to: [{ email: CONTACT_TO_EMAIL, name: CONTACT_TO_NAME }],
      replyTo: { email, name: nom },
      subject: `Nouvelle demande — ${projet || "Contact"} — ${nom}`,
      htmlContent: summaryHtml,
    });

    // 2) Accusé de réception sobre au prospect (non bloquant).
    try {
      await brevoSend({
        sender: { email: CONTACT_FROM_EMAIL, name: CONTACT_FROM_NAME },
        to: [{ email, name: nom }],
        subject: "Votre demande — Les Éditions du Mécène",
        htmlContent: `<p>Bonjour ${esc(nom)},</p>
          <p>Nous avons bien reçu votre message et reviendrons vers vous rapidement.</p>
          <p>Bien à vous,<br>Les Éditions du Mécène</p>`,
      });
    } catch (ackErr) {
      console.warn("[contact] accusé de réception non envoyé:", ackErr.message);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[contact] échec envoi Brevo:", err.message);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
}
