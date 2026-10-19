/**
 * Serverless Function Vercel — connexion / déconnexion de l'espace statistiques.
 *
 *   POST   { password }  → pose le cookie de session si le mot de passe est bon
 *   DELETE               → supprime le cookie
 *
 * Variable d'environnement : STATS_PASSWORD (obligatoire).
 */
import { COOKIE, MAX_AGE, sessionToken, sameSecret } from "./_stats-auth.js";

const RATE = new Map();

function limited(ip) {
  const now = Date.now();
  const arr = (RATE.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  arr.push(now);
  RATE.set(ip, arr);
  return arr.length > 10;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 2048) return null;
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", `${COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const token = sessionToken();
  if (!token) return res.status(503).json({ ok: false, error: "not_configured" });
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ ok: false, error: "rate_limited" });
  const data = await readBody(req);
  if (!data || !sameSecret(String(data.password || ""), process.env.STATS_PASSWORD)) {
    return res.status(401).json({ ok: false, error: "bad_password" });
  }
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`);
  return res.status(200).json({ ok: true });
}
