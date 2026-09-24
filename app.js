/* Les Éditions du Mécène — interactions V4 */
(function () {
  "use strict";

  var body = document.body;

  /* ---------- Preloader ---------- */
  var preloader = document.querySelector(".preloader");
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (preloader) preloader.classList.add("done");
    }, 420);
  });

  /* ---------- Page-wipe on internal navigation ---------- */
  var wipe = document.querySelector(".page-wipe");
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (a.target === "_blank") return;
    var url;
    try { url = new URL(href, window.location.href); } catch (e) { return; }
    if (url.origin !== window.location.origin) return;
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (wipe) wipe.classList.add("go");
      setTimeout(function () { window.location.href = href; }, 320);
    });
  });

  /* ---------- Scrolled topbar state ---------- */
  var topbar = document.querySelector(".topbar");
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 24);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu overlay ---------- */
  var menuTrigger = document.querySelector(".menu-trigger");
  var menuClose = document.querySelector(".menu-close");
  var menuOverlay = document.querySelector(".menu-overlay");
  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.add("open");
    body.classList.add("no-scroll");
  }
  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove("open");
    body.classList.remove("no-scroll");
  }
  if (menuTrigger) menuTrigger.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (menuOverlay) {
    menuOverlay.querySelectorAll(".menu-links a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Custom cursor ---------- */
  var cursor = document.querySelector(".cursor");
  if (cursor && matchMedia("(pointer:fine)").matches) {
    document.addEventListener("mousemove", function (e) {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    document.querySelectorAll("a, button, .filter, input, textarea, select").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("big"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("big"); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Catalogue filter ---------- */
  var filterRow = document.querySelector(".filter-row");
  if (filterRow) {
    var filters = filterRow.querySelectorAll(".filter");
    var items = document.querySelectorAll(".catalogue-item");
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        items.forEach(function (item) {
          var show = f === "all" || item.getAttribute("data-cat") === f;
          item.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------- Pré-remplissage contact depuis une fiche ouvrage (?ouvrage=Titre) ---------- */
  (function prefillFromBook() {
    var params = new URLSearchParams(window.location.search);
    var ouvrage = params.get("ouvrage");
    if (!ouvrage) return;
    var select = document.getElementById("projet");
    var message = document.getElementById("message");
    if (select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text === "Achat d’un ouvrage du catalogue") {
          select.selectedIndex = i;
          break;
        }
      }
    }
    if (message) {
      message.value = "Bonjour,\n\nJe souhaite en savoir plus sur l’ouvrage : " + ouvrage + ".\n\n";
      message.focus();
      if (message.setSelectionRange) message.setSelectionRange(message.value.length, message.value.length);
    }
  })();

  /* ---------- Book-river : clone accessible pour la boucle (une seule série sémantique) ---------- */
  document.querySelectorAll(".book-river .river-track").forEach(function (track) {
    // Ne cloner que les pistes réellement animées (les fiches "Autres ouvrages" sont en animation:none).
    if (/animation\s*:\s*none/.test(track.getAttribute("style") || "")) return;
    Array.prototype.slice.call(track.children).forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      if (clone.setAttribute) clone.setAttribute("tabindex", "-1");
      clone.querySelectorAll("a, button, [tabindex]").forEach(function (el) {
        el.setAttribute("tabindex", "-1");
      });
      track.appendChild(clone);
    });
  });

  /* ---------- Formulaire de contact — envoi réel via /api/contact (Brevo) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var tsField = form.querySelector("#f-ts");
    if (tsField) tsField.value = String(Date.now());
    var statusEl = form.querySelector("#form-status");
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn ? btn.textContent : "";
    var submitting = false;

    function setStatus(kind, msg) {
      if (!statusEl) return;
      statusEl.className = "form-status is-visible is-" + kind;
      statusEl.textContent = msg;
    }
    function fieldError(id, on) {
      var input = form.querySelector("#" + id);
      if (input && input.closest(".field")) input.closest(".field").classList.toggle("is-error", on);
    }
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim()); }

    function validate() {
      var ok = true;
      var eNom = !form.nom.value.trim(); fieldError("f-nom", eNom); if (eNom) ok = false;
      var eMail = !validEmail(form.email.value); fieldError("f-email", eMail); if (eMail) ok = false;
      var eMsg = form.message.value.trim().length < 10; fieldError("message", eMsg); if (eMsg) ok = false;
      return ok;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting) return; // anti double-soumission
      if (!validate()) {
        setStatus("error", "Merci de corriger les champs indiqués.");
        var firstErr = form.querySelector(".field.is-error input, .field.is-error textarea");
        if (firstErr) firstErr.focus();
        return;
      }
      submitting = true;
      if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours…"; }
      setStatus("loading", "Envoi en cours…");

      var payload = {
        societe: form.societe.value, fonction: form.fonction.value,
        nom: form.nom.value, telephone: form.telephone.value,
        email: form.email.value, projet: form.projet.value,
        message: form.message.value, company_url: form.company_url.value,
        ts: Number(tsField ? tsField.value : 0)
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      }).then(function (r) {
        if (r.ok && r.data && r.data.ok) {
          form.reset();
          if (tsField) tsField.value = String(Date.now());
          setStatus("success", "Message envoyé — merci. Nous revenons vers vous rapidement.");
        } else if (r.status === 503 || (r.data && r.data.error === "not_configured")) {
          setStatus("error", (r.data && r.data.message) || "L’envoi n’est pas encore configuré. Merci de nous appeler au 06 81 27 78 60.");
        } else if (r.status === 422 && r.data && r.data.fields) {
          var map = { nom: "f-nom", email: "f-email", message: "message" };
          Object.keys(r.data.fields).forEach(function (k) { if (map[k]) fieldError(map[k], true); });
          setStatus("error", "Merci de corriger les champs indiqués.");
        } else if (r.status === 429) {
          setStatus("error", "Trop de tentatives. Merci de réessayer dans quelques minutes.");
        } else {
          setStatus("error", "L’envoi a échoué. Merci de réessayer ou de nous appeler au 06 81 27 78 60.");
        }
      }).catch(function () {
        setStatus("error", "Connexion impossible. Vérifiez votre réseau ou appelez-nous au 06 81 27 78 60.");
      }).then(function () {
        submitting = false;
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
      });
    });

    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        var f = el.closest(".field"); if (f) f.classList.remove("is-error");
      });
    });
  }
})();
