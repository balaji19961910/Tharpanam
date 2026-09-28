/* js/app.js — bootstrap + hash router (spec §7.2, §9). */
window.Thar = window.Thar || {};
(function (T) {
  T.ui = T.ui || {};

  // ---- Shared UI helpers ----
  T.ui.t = function (key, vars) { return T.i18n.t(key, vars); };
  T.ui.tr = function (text) { return T.translit.toScript(text, T.store.get().ui.script || "iast"); };
  T.ui.esc = function (s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  var SECTIONS = ["profile", "occasion", "karunya", "script", "recital", "abhivadaye", "print"];
  var RENDERERS = {
    profile: T.ui.renderProfile, occasion: T.ui.renderOccasion, karunya: T.ui.renderKarunya,
    script: T.ui.renderPreview, recital: T.ui.renderRecital, abhivadaye: T.ui.renderAbhivadaye,
    print: T.ui.renderPrint
  };

  function currentSection() {
    var h = (window.location.hash || "#profile").replace("#", "");
    return SECTIONS.indexOf(h) !== -1 ? h : "profile";
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
  }

  function updateNavActive(section) {
    var inBar = false;
    document.querySelectorAll(".side-nav a, .tab-bar a, .more-sheet a").forEach(function (a) {
      var on = a.getAttribute("href") === "#" + section;
      a.classList.toggle("active", on);
      if (on && a.parentNode.id === "tab-bar") inBar = true;
    });
    // Sections without their own tab (karunya, abhivadaye, print) light up "More".
    document.getElementById("tab-more").classList.toggle("active", !inBar);
  }

  // Phone "More" sheet: every section, so nothing is out of reach on a small screen.
  function setMoreOpen(open) {
    document.getElementById("more-sheet").classList.toggle("hidden", !open);
    document.getElementById("tab-more").setAttribute("aria-expanded", String(open));
  }

  // Static shell text (nav, tab bar, labels) lives in index.html; re-translate it on every
  // render so a language switch updates the whole page in place.
  function applyStaticI18n() {
    var lang = T.i18n.lang;
    document.documentElement.lang = lang;
    document.title = T.ui.t("app.title");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = T.ui.t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", T.ui.t(el.getAttribute("data-i18n-aria")));
    });
  }

  function renderTopbar() {
    var ui = T.store.get().ui;
    applyStaticI18n();
    document.getElementById("app-title").textContent = T.ui.t("app.title");
    var occSel = document.getElementById("occasion-chip");
    occSel.innerHTML = ["amavasya", "mahalaya", "mahalaya_amavasya"].map(function (k) {
      return '<option value="' + k + '"' + (k === ui.occasion ? " selected" : "") + ">" + T.ui.esc(T.ui.t("occasion." + k)) + "</option>";
    }).join("");
    document.getElementById("date-chip").value = ui.datetime || "";
    document.getElementById("lang-picker").value = ui.lang || "en";
    document.getElementById("script-picker").value = ui.script || "iast";
  }

  var lastSection = null;
  function render() {
    var section = currentSection();
    updateNavActive(section);
    if (section !== "recital") T.ui.recitalStop && T.ui.recitalStop();
    if (section !== lastSection) { window.scrollTo(0, 0); lastSection = section; }
    var main = document.getElementById("main");
    var fn = RENDERERS[section];
    if (fn) fn(main, {});

    // Live preview split-pane (desktop only; CSS hides it on narrow screens).
    var live = document.getElementById("live-preview");
    if (section !== "script" && section !== "recital" && section !== "print" && T.store.get().profile) {
      live.innerHTML = "<h3>" + T.ui.t("nav.script") + "</h3>";
      var wrap = document.createElement("div");
      live.appendChild(wrap);
      try { T.ui.renderPreview(wrap, { compact: true }); } catch (e) { wrap.innerHTML = "<p>—</p>"; }
    } else {
      live.innerHTML = "";
    }
    renderTopbar();
  }

  function wireTopbar() {
    document.getElementById("tab-more").addEventListener("click", function () {
      setMoreOpen(document.getElementById("more-sheet").classList.contains("hidden"));
    });
    document.getElementById("more-sheet").addEventListener("click", function () { setMoreOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMoreOpen(false); });
    document.getElementById("occasion-chip").addEventListener("change", function (e) {
      T.store.setUI({ occasion: e.target.value });
    });
    document.getElementById("date-chip").addEventListener("change", function (e) {
      if (e.target.value) T.ui.recomputePanchang({ useNow: false, datetime: e.target.value });
    });
    document.getElementById("lang-picker").addEventListener("change", function (e) {
      T.i18n.setLang(e.target.value);
      T.store.setUI({ lang: e.target.value });
    });
    document.getElementById("script-picker").addEventListener("change", function (e) {
      T.store.setUI({ script: e.target.value });
    });
    document.getElementById("theme-toggle").addEventListener("click", function () {
      var cur = T.store.get().ui.theme || "auto";
      var next = cur === "dark" ? "light" : (cur === "light" ? "auto" : "dark");
      applyTheme(next);
      T.store.setUI({ theme: next });
    });
  }

  function init() {
    T.store.load();
    var s = T.store.get();
    if (!s.profile) T.store.setProfile(JSON.parse(JSON.stringify(T.data.emptyProfile)));
    // "Use current time" (the default) refreshes the moment and panchang on every visit.
    T.ui.recomputePanchang();
    T.i18n.setLang(s.ui.lang || "en");
    applyTheme(s.ui.theme || "auto");

    wireTopbar();
    T.store.subscribe(render);
    window.addEventListener("hashchange", render);
    if (!window.location.hash) window.location.hash = "#profile";
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.Thar);
