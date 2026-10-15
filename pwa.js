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

/* Download-the-Android-app pill: only in Android browsers, never inside the app itself. Dismiss is remembered. */
;(function () {
  var KEY = 'a101_apk_pill_dismissed', HREF = 'https://oliver-apps.sites.tab.bot/apks/Apologetics101.apk';
  try {
    var ua = navigator.userAgent || '';
    if (!/Android/i.test(ua) || /OliverApp\//.test(ua) || window.AndroidApp || window.__isAndroidApp) return;
    if (location.hostname === 'appassets.androidplatform.net') return;
    if (localStorage.getItem(KEY) === '1') return;
  } catch (e) { return; }
  function show() {
    if (!document.body || document.getElementById('apk-pill')) return;
    var w = document.createElement('div');
    w.id = 'apk-pill';
    w.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483000;' +
      'display:flex;align-items:center;max-width:calc(100vw - 24px);box-sizing:border-box;background:#18181b;color:#fafafa;border:1px solid rgba(82,82,91,.6);' +
      'border-radius:999px;box-shadow:0 6px 22px rgba(0,0,0,.35);font:600 12px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:0 2px 0 0;';
    var a = document.createElement('a');
    a.href = HREF;
    a.rel = 'noopener';
    a.style.cssText = 'display:flex;align-items:center;gap:7px;padding:8px 4px 8px 12px;color:inherit;text-decoration:none;white-space:nowrap;overflow:hidden;min-width:0;';
    a.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><path fill="#3ddc84" d="M17.6 9.48l1.84-3.18a.63.63 0 0 0-1.09-.63l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.63.63 0 0 0-1.09.63L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>' +
      '<span style="overflow:hidden;text-overflow:ellipsis">Download the full release app for Android</span>';
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.style.cssText = 'flex:none;width:30px;height:30px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:inherit;opacity:.65;cursor:pointer;display:flex;align-items:center;justify-content:center;';
    x.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z"/></svg>';
    x.onclick = function (e) { e.preventDefault(); try { localStorage.setItem(KEY, '1'); } catch (er) {} if (w.parentNode) w.parentNode.removeChild(w); };
    w.appendChild(a);
    w.appendChild(x);
    document.body.appendChild(w);
    place();
    setTimeout(place, 1500);
    window.addEventListener('resize', place);
  }
  /* Sit above anything already pinned to the bottom of the screen (tab bars, players, round + buttons). */
  function place() {
    var w = document.getElementById('apk-pill');
    if (!w) return;
    var h = window.innerHeight, top = h, els = document.body.getElementsByTagName('*');
    for (var i = 0; i < els.length && i < 6000; i++) {
      var el = els[i];
      if (el === w || w.contains(el)) continue;
      var cs = window.getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24 || r.height > h * 0.4) continue;
      if (r.bottom >= h - 40 && r.bottom <= h + 2 && r.top > h * 0.5 && r.top < top) top = r.top;
    }
    w.style.bottom = top < h ? 'calc(' + Math.round(h - top + 10) + 'px + env(safe-area-inset-bottom,0px))' : 'calc(16px + env(safe-area-inset-bottom,0px))';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
})();
