/* Apologetics101 app bits: offline service worker, Install button,
   "Continue reading", offline/updated notices. Separate from site.js on purpose. */
(function () {
  var LAST_KEY = "a101.lastRead";
  var DISMISS_KEY = "a101.installDismissed";
  var $ = function (id) { return document.getElementById(id); };
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(msg, ms) {
    var t = $("toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, ms || 2600);
  }
  function isStandalone() {
    return matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: minimal-ui)").matches || navigator.standalone === true;
  }

  /* Home-screen shortcut "Continue reading" opens #/continue: swap it for the last article
     before the site's router runs (this file loads before the site starts). */
  if (/^#\/continue\/?$/.test(location.hash)) {
    var last0 = load(LAST_KEY, null);
    history.replaceState(null, "", location.pathname + location.search + (last0 ? "#/" + encodeURIComponent(last0.slug) : "#/articles"));
    if (last0 && last0.pct) window.__a101Resume = last0;
  }

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator) {
    var hadController = !!navigator.serviceWorker.controller;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js", { scope: "./", updateViaCache: "none" }).then(function (reg) {
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "visible") reg.update().catch(function () {});
        });
      }).catch(function (err) { console.warn("Offline mode not available:", err && err.message); });
    });
    var refreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || refreshed) return;
      refreshed = true;
      toast("Apologetics101 updated ✓");
    });
  }

  /* ---------- Install button ---------- */
  var deferred = null;
  var pill, pillBtn, pillClose;
  function dismissedRecently() { return Date.now() - Number(load(DISMISS_KEY, 0)) < 3 * 864e5; }
  function showInstall(on) {
    if (!pill) return;
    pill.hidden = !(on && !isStandalone() && !dismissedRecently());
  }
  function doInstall() {
    if (!deferred) { toast('Tap ⋮ in Chrome → "Install app"', 4500); return; }
    deferred.prompt();
    deferred.userChoice.then(function (c) { deferred = null; if (c && c.outcome === "accepted") showInstall(false); }).catch(function () {});
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; showInstall(true); });
  window.addEventListener("appinstalled", function () {
    deferred = null; showInstall(false);
    toast("Installed! Apologetics101 is on your home screen ✝️", 4000);
  });

  /* ---------- Continue reading ---------- */
  var current = null, lastSave = 0;
  function articleSlug() {
    if (document.body.getAttribute("data-view") !== "article") return null;
    if (/^Not found/.test(document.title)) return null;
    return decodeURIComponent(location.hash.replace(/^#\/?/, "").split("?")[0]);
  }
  function pct() {
    var h = document.documentElement.scrollHeight - innerHeight;
    return h > 0 ? Math.max(0, Math.min(100, Math.round(scrollY / h * 100))) : 0;
  }
  function remember(force) {
    if (!current) return;
    // Only measure while the article is still on screen (leaving scrolls to the top first).
    if (articleSlug() !== current.slug) return;
    var now = Date.now();
    if (!force && now - lastSave < 800) return;
    lastSave = now;
    current.pct = pct(); current.at = now;
    save(LAST_KEY, current);
  }
  function continueCard(last) {
    var done = last.pct >= 95;
    return '<a id="continueCard" href="#/' + esc(encodeURIComponent(last.slug)) + '" data-continue class="continue-card bento-card bg-zinc-900 border border-zinc-800/50 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:border-blue-500/30">' +
      '<span class="continue-ic"><i class="ph-fill ph-book-open"></i></span>' +
      '<span class="flex-1 min-w-0">' +
        '<span class="block text-xs font-semibold uppercase tracking-wider text-blue-400">' + (done ? "Read again" : "Continue reading") + "</span>" +
        '<span class="block text-zinc-100 font-semibold truncate mt-0.5">' + esc(last.title || last.slug) + "</span>" +
        '<span class="continue-bar" aria-hidden="true"><span style="width:' + (last.pct || 0) + '%"></span></span>' +
      "</span>" +
      '<i class="ph ph-caret-right text-xl text-zinc-500"></i></a>';
  }
  function onRender() {
    var app = $("app"); if (!app) return;
    var view = document.body.getAttribute("data-view");
    var slug = articleSlug();
    if (slug) {
      var h1 = app.querySelector("h1");
      if (!current || current.slug !== slug) {
        current = { slug: slug, title: h1 ? h1.textContent.trim() : document.title.split(" | ")[0], pct: 0, at: Date.now() };
        save(LAST_KEY, current);
      }
      if (window.__a101Resume && window.__a101Resume.slug === slug) {
        var r = window.__a101Resume; window.__a101Resume = null;
        setTimeout(function () {
          var h = document.documentElement.scrollHeight - innerHeight;
          if (r.pct > 2 && r.pct < 95) window.scrollTo(0, h * r.pct / 100);
        }, 60);
      }
    } else {
      if (current) remember(true);
      current = null;
    }
    if (view === "home" && !$("continueCard")) {
      var last = load(LAST_KEY, null);
      if (last && last.slug) {
        app.insertAdjacentHTML("afterbegin", continueCard(last));
        $("continueCard").addEventListener("click", function () { window.__a101Resume = last; });
      }
    }
  }
  addEventListener("scroll", function () { if (current) remember(false); }, { passive: true });
  addEventListener("pagehide", function () { remember(true); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") remember(true); });

  /* ---------- offline notice ---------- */
  addEventListener("offline", function () { toast("You're offline. All articles still work 👍", 3200); });
  addEventListener("online", function () { toast("Back online"); });

  function init() {
    pill = $("installPill"); pillBtn = $("installPillBtn"); pillClose = $("installPillClose");
    if (pillBtn) pillBtn.addEventListener("click", doInstall);
    if (pillClose) pillClose.addEventListener("click", function () { save(DISMISS_KEY, Date.now()); pill.hidden = true; });
    showInstall(!!deferred);
    var mq = matchMedia("(display-mode: standalone)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (isStandalone()) showInstall(false); });
    var app = $("app");
    if (app && window.MutationObserver) new MutationObserver(onRender).observe(app, { childList: true });
    onRender();
  }
  // site.js starts on DOMContentLoaded too; this listener is added after it, so the page is drawn first.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
