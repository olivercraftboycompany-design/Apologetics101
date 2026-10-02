/* ==========================================================
   Appolegetics 101 — site engine
   You shouldn't need to edit this file.
   Articles are added in the /articles folder.
   ========================================================== */

(function () {
  "use strict";

  var ARTICLES = [];
  var activeCategory = "All";

  /* ---------- Register an article ---------- */
  window.registerArticle = function (article) {
    if (!article || !article.slug) {
      console.warn("Article is missing a slug:", article);
      return;
    }
    ARTICLES.push(article);
  };

  /* ---------- Content helpers (used inside article files) ----------
     Inline formatting works in all text:
       **bold**   *italic*   [link text](https://example.com)
  ------------------------------------------------------------------ */
  window.p          = function (text)            { return { type: "p", text: text }; };
  window.h2         = function (text)            { return { type: "h2", text: text }; };
  window.h3         = function (text)            { return { type: "h3", text: text }; };
  window.scripture  = function (text, reference) { return { type: "scripture", text: text, reference: reference }; };
  window.quote      = function (text, source)    { return { type: "quote", text: text, source: source }; };
  window.objection  = function (objection, response) { return { type: "objection", objection: objection, response: response }; };
  window.callout    = function (title, text)     { return { type: "callout", title: title, text: text }; };
  window.bullets    = function (items)           { return { type: "ul", items: items }; };
  window.numbered   = function (items)           { return { type: "ol", items: items }; };
  window.image      = function (src, alt, caption) { return { type: "image", src: src, alt: alt, caption: caption }; };
  window.divider    = function ()                { return { type: "hr" }; };

  /* ---------- Utilities ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function inline(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function readingTime(article) {
    var words = JSON.stringify(article.content || []).split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)) + " min read";
  }

  function sorted() {
    return ARTICLES.slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }

  /* ---------- Render one content block ---------- */
  function renderBlock(b) {
    switch (b.type) {
      case "p":  return "<p>" + inline(b.text) + "</p>";
      case "h2": return "<h2>" + inline(b.text) + "</h2>";
      case "h3": return "<h3>" + inline(b.text) + "</h3>";
      case "hr": return "<hr>";

      case "scripture":
        return '<blockquote class="scripture"><p>' + inline(b.text) + "</p>" +
               (b.reference ? "<cite>" + inline(b.reference) + "</cite>" : "") +
               "</blockquote>";

      case "quote":
        return '<blockquote class="pullquote"><p>' + inline(b.text) + "</p>" +
               (b.source ? "<cite>" + inline(b.source) + "</cite>" : "") +
               "</blockquote>";

      case "objection":
        return '<div class="objection">' +
               '<div class="ask"><span class="label">Objection</span><p>' + inline(b.objection) + "</p></div>" +
               '<div class="answer"><span class="label">Response</span><p>' + inline(b.response) + "</p></div>" +
               "</div>";

      case "callout":
        return '<aside class="callout">' +
               (b.title ? '<strong class="callout-title">' + inline(b.title) + "</strong>" : "") +
               "<p>" + inline(b.text) + "</p></aside>";

      case "ul":
      case "ol":
        return "<" + b.type + ">" +
               (b.items || []).map(function (i) { return "<li>" + inline(i) + "</li>"; }).join("") +
               "</" + b.type + ">";

      case "image":
        return '<figure class="figure"><img src="' + esc(b.src) + '" alt="' + esc(b.alt || "") + '" loading="lazy">' +
               (b.caption ? "<figcaption>" + inline(b.caption) + "</figcaption>" : "") +
               "</figure>";

      default:
        console.warn("Unknown block type:", b);
        return "";
    }
  }

  /* ---------- Views ---------- */
  var app = document.getElementById("app");

  function renderHome() {
    var all = sorted();
    var cats = ["All"];
    all.forEach(function (a) {
      if (a.category && cats.indexOf(a.category) === -1) cats.push(a.category);
    });
    if (cats.indexOf(activeCategory) === -1) activeCategory = "All";

    var shown = all.filter(function (a) {
      return activeCategory === "All" || a.category === activeCategory;
    });

    var html =
      '<section class="hero">' +
        '<h1>Appolegetics <span class="course-num">101</span></h1>' +
        "<p>Plain-language answers to the big questions about faith, for anyone starting out.</p>" +
      "</section>" +
      '<section class="listing" aria-label="Articles">';

    if (cats.length > 2) {
      html += '<div class="filters" role="group" aria-label="Filter by topic">' +
        cats.map(function (c) {
          return '<button type="button" data-cat="' + esc(c) + '" aria-pressed="' + (c === activeCategory) + '">' + esc(c) + "</button>";
        }).join("") + "</div>";
    } else {
      html += '<div class="filters" style="padding:0;border-bottom-width:2px"></div>';
    }

    if (!shown.length) {
      html += '<p class="empty">No articles yet. Add one in the articles folder and list it in index.html.</p>';
    } else {
      html += '<ul class="article-list">' + shown.map(function (a) {
        return '<li class="article-row"><a href="#/' + esc(a.slug) + '">' +
          '<div class="meta">' +
            (a.category ? '<span class="cat">' + esc(a.category) + "</span>" : "") +
            "<span>" + formatDate(a.date) + "</span>" +
          "</div>" +
          "<div><h2>" + esc(a.title) + "</h2>" +
          (a.summary ? "<p>" + inline(a.summary) + "</p>" : "") +
          "</div></a></li>";
      }).join("") + "</ul>";
    }

    html += "</section>";
    app.innerHTML = html;
    document.title = "Appolegetics 101";

    var filters = app.querySelectorAll(".filters button");
    Array.prototype.forEach.call(filters, function (btn) {
      btn.addEventListener("click", function () {
        activeCategory = btn.getAttribute("data-cat");
        renderHome();
        var again = app.querySelector('.filters button[aria-pressed="true"]');
        if (again) again.focus();
      });
    });
  }

  function renderArticle(slug) {
    var all = sorted();
    var idx = -1;
    all.forEach(function (a, i) { if (a.slug === slug) idx = i; });

    if (idx === -1) {
      app.innerHTML =
        '<div class="article"><div class="article-head">' +
        '<a class="back" href="#/">&larr; All articles</a>' +
        "<h1>Article not found</h1>" +
        '<p class="summary">That link doesn\'t match any article. Head back to the list and pick one.</p>' +
        "</div></div>";
      document.title = "Not found | Appolegetics 101";
      return;
    }

    var a = all[idx];
    var newer = all[idx - 1];
    var older = all[idx + 1];

    var html =
      '<article class="article">' +
        '<header class="article-head">' +
          '<a class="back" href="#/">&larr; All articles</a>' +
          (a.category ? '<div class="cat">' + esc(a.category) + "</div>" : "") +
          "<h1>" + esc(a.title) + "</h1>" +
          (a.summary ? '<p class="summary">' + inline(a.summary) + "</p>" : "") +
          '<div class="byline">' +
            (a.author ? "<span>By " + esc(a.author) + "</span>" : "") +
            (a.date ? "<span>" + formatDate(a.date) + "</span>" : "") +
            "<span>" + readingTime(a) + "</span>" +
          "</div>" +
        "</header>" +
        '<div class="article-body">' +
          (a.content || []).map(renderBlock).join("") +
        "</div>" +
        '<nav class="article-foot" aria-label="More articles">' +
          (older ? '<a class="prev" href="#/' + esc(older.slug) + '"><small>&larr; Previous</small><strong>' + esc(older.title) + "</strong></a>" : "<span></span>") +
          (newer ? '<a class="next" href="#/' + esc(newer.slug) + '"><small>Next &rarr;</small><strong>' + esc(newer.title) + "</strong></a>" : "") +
        "</nav>" +
      "</article>";

    app.innerHTML = html;
    document.title = a.title + " | Appolegetics 101";
  }

  /* ---------- Router ---------- */
  function route() {
    var slug = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    if (slug) renderArticle(slug); else renderHome();
    window.scrollTo(0, 0);
  }

  function start() {
    var count = document.getElementById("article-count");
    if (count) count.textContent = ARTICLES.length + (ARTICLES.length === 1 ? " article" : " articles");
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
    route();
  }

  window.addEventListener("hashchange", route);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
