/**
 * Enregistre un prospect entrant dans Brevo (liste « Mécène — Formulaire Landing »),
 * avec l'origine de la demande dans l'attribut SOURCE_CAMPAGNE.
 *
 * Variables d'environnement :
 *   - BREVO_API_KEY          : clé API Brevo (obligatoire)
 *   - BREVO_LEADS_LIST_ID    : (optionnel) id de la liste, défaut 8
 *
 * Ne lève jamais d'exception : un échec d'enregistrement ne doit pas faire échouer le formulaire.
 */
export async function addLead({ email, nom = "", societe = "", fonction = "", telephone = "", message = "", source = "" }) {
  const key = process.env.BREVO_API_KEY;
  if (!key || !email) return { ok: false, reason: "not_configured" };
  const listId = Number(process.env.BREVO_LEADS_LIST_ID || 8);
  const [prenom, ...reste] = String(nom).trim().split(/\s+/);
  const attributes = {
    PRENOM: reste.length ? prenom : "",
    NOM: reste.length ? reste.join(" ") : prenom || "",
    ENTREPRISE: societe,
    JOB_TITLE: fonction,
    TELEPHONE: telephone,
    MESSAGE: String(message).slice(0, 1000),
    SOURCE_CAMPAGNE: source || "site",
  };
  for (const k of Object.keys(attributes)) if (!attributes[k]) delete attributes[k];
  try {
    const r = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ email: String(email).trim(), attributes, listIds: [listId], updateEnabled: true }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      console.warn("[lead] Brevo a refusé le contact:", r.status, detail.slice(0, 200));
      return { ok: false, reason: `brevo_${r.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.warn("[lead] enregistrement impossible:", err.message);
    return { ok: false, reason: "network" };
  }
}
