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

  /* ---------- Contact form (client-side stub — branchement Brevo/Formspree à faire) ---------- */
  var form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button");
      var original = btn.textContent;
      btn.textContent = "Message envoyé — merci";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 3200);
      /* TODO Geo: brancher sur Brevo (API transactionnelle) ou endpoint /api/contact */
    });
  }
})();
