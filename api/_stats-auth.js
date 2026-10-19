/**
 * Accès à l'espace statistiques : un mot de passe unique (variable STATS_PASSWORD),
 * échangé contre un cookie HttpOnly signé, valable 30 jours.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE = "mecene_stats";
export const MAX_AGE = 30 * 24 * 3600;

export function sessionToken() {
  const pwd = process.env.STATS_PASSWORD;
  if (!pwd) return null;
  return createHmac("sha256", pwd).update("mecene-stats-v1").digest("hex");
}

export function sameSecret(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function isAuthed(req) {
  const expected = sessionToken();
  if (!expected) return false;
  const raw = req.headers.cookie || "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  return !!m && sameSecret(m[1], expected);
}
