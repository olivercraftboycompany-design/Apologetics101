/* ==========================================================
   Apologetics 101 — site engine (v2, NEXUS look)
   You shouldn't need to edit this file.
   Add an article: make a new .js file (copy Questionyourfaith.js),
   call registerArticle({...}), and add a <script> line for it in
   index.html right under Questionyourfaith.js.
   ========================================================== */

(function () {
  "use strict";

  var ARTICLES = [];
  var SITE = "Apologetics 101";
  var RESERVED = ["", "articles", "answers", "bible", "quiz", "saved"];
  var state = { cat: "All", topic: "All", q: "" };

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
  function plain(s) { return String(s == null ? "" : s).replace(/\*\*?|\[|\]\([^)]*\)/g, ""); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function parseDate(iso) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(iso || "").trim());
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function formatDate(iso) {
    var d = parseDate(iso);
    if (!d) return esc(iso || "");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  function readingTime(article) {
    var words = JSON.stringify(article.content || []).split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)) + " min read";
  }
  function sorted() {
    return ARTICLES.slice().sort(function (a, b) {
      var da = parseDate(a.date), db = parseDate(b.date);
      return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });
  }
  function articleHref(a) { return "#/" + encodeURIComponent(a.slug); }
  function articleText(a) {
    return [a.title, a.summary, a.category, a.author].concat((a.content || []).map(function (b) {
      return [b.text, b.objection, b.response, b.title, b.reference, (b.items || []).join(" ")].join(" ");
    })).join(" ").toLowerCase();
  }
  function answerText(x) {
    return [x.q, x.short, x.topic, x.points.join(" "), x.honest].join(" ").toLowerCase();
  }

  /* ---------- Storage (bookmarks, quiz score) ---------- */
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function saved() { return load("a101.saved", []); }
  function isSaved(type, id) { return saved().some(function (s) { return s.type === type && s.id === id; }); }
  function toggleSaved(item) {
    var list = saved();
    var i = -1;
    list.forEach(function (s, n) { if (s.type === item.type && s.id === item.id) i = n; });
    if (i > -1) { list.splice(i, 1); toast("Removed from Saved"); }
    else { item.at = Date.now(); list.unshift(item); toast("Saved"); }
    save("a101.saved", list);
    updateSavedCount();
    return i === -1;
  }
  function updateSavedCount() {
    var n = saved().length;
    $all("[data-saved-count]").forEach(function (el) { el.textContent = n; el.classList.toggle("hidden", !n); });
  }

  /* ---------- Toast + share ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function copyText(text, msg) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(msg || "Copied"); } catch (e) { toast("Couldn't copy"); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast(msg || "Copied"); }, fallback);
    } else { fallback(); }
  }
  function share(title, text, url) {
    url = url || location.href;
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function () {});
    } else {
      copyText((text ? text + "\n" : "") + url, "Link copied");
    }
  }

  /* ---------- Verses ---------- */
  function verse(ref) { return (window.KJV || {})[ref]; }
  function verseOfDay() {
    var refs = window.VOTD_REFS || [];
    if (!refs.length) return null;
    var now = new Date();
    var day = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
    return verse(refs[day % refs.length]);
  }

  /* ---------- UI pieces ---------- */
  function card(inner, extra) {
    return '<div class="bento-card bg-zinc-900 border border-zinc-800/50 rounded-3xl p-6 shadow-sm ' + (extra || "") + '">' + inner + "</div>";
  }
  function cardTitle(icon, text, right) {
    return '<div class="flex items-center justify-between gap-3 mb-4">' +
      '<h3 class="text-lg font-semibold text-zinc-200 flex items-center gap-2"><i class="ph-fill ' + icon + ' text-blue-400"></i> ' + text + "</h3>" +
      (right || "") + "</div>";
  }
  function iconBtn(icon, label, attrs, active) {
    return '<button type="button" class="icon-btn ' + (active ? "is-on" : "") + '" aria-label="' + esc(label) + '" title="' + esc(label) + '" ' + (attrs || "") + '>' +
      '<i class="' + (active ? "ph-fill" : "ph") + " " + icon + '"></i></button>';
  }
  function chip(label, active, attrs) {
    return '<button type="button" class="chip ' + (active ? "chip-on" : "") + '" aria-pressed="' + !!active + '" ' + (attrs || "") + ">" + esc(label) + "</button>";
  }
  function emptyState(icon, title, text) {
    return '<div class="flex flex-col items-center text-center py-14 px-6 text-zinc-400">' +
      '<i class="ph ' + icon + ' text-5xl text-zinc-600 mb-3"></i>' +
      '<p class="text-zinc-200 font-semibold mb-1">' + title + "</p><p class=\"text-sm max-w-sm\">" + text + "</p></div>";
  }
  function verseCard(v, opts) {
    opts = opts || {};
    if (!v) return "";
    return '<figure class="verse">' +
      '<blockquote class="text-zinc-100 ' + (opts.big ? "text-xl md:text-2xl" : "text-base") + ' leading-relaxed font-medium">&ldquo;' + esc(v.text) + "&rdquo;</blockquote>" +
      '<figcaption class="mt-3 flex items-center justify-between gap-3 flex-wrap">' +
        '<span class="text-blue-400 font-semibold text-sm">' + esc(v.ref) + ' <span class="text-zinc-500 font-medium">KJV</span></span>' +
        '<span class="flex items-center gap-1">' +
          iconBtn("ph-copy", "Copy verse", 'data-copy-verse="' + esc(v.ref) + '"') +
          iconBtn("ph-bookmark-simple", "Save verse", 'data-save="verse" data-id="' + esc(v.ref) + '"', isSaved("verse", v.ref)) +
          iconBtn("ph-share-network", "Share verse", 'data-share-verse="' + esc(v.ref) + '"') +
        "</span>" +
      "</figcaption></figure>";
  }
  function articleCard(a) {
    return '<a href="' + articleHref(a) + '" class="bento-card group bg-zinc-900 border border-zinc-800/50 rounded-3xl p-6 flex flex-col gap-3 shadow-sm hover:border-blue-500/30">' +
      '<div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">' +
        (a.category ? '<span class="tag">' + esc(a.category) + "</span>" : "") +
        '<span class="text-zinc-500">' + formatDate(a.date) + "</span>" +
        '<span class="text-zinc-600 ml-auto normal-case font-medium tracking-normal flex items-center gap-1"><i class="ph ph-clock"></i>' + readingTime(a) + "</span>" +
      "</div>" +
      '<h3 class="text-xl font-bold text-zinc-100 tracking-tight group-hover:text-blue-300 smooth-transition">' + esc(a.title) + "</h3>" +
      (a.summary ? '<p class="text-zinc-400 text-sm leading-relaxed">' + inline(a.summary) + "</p>" : "") +
      '<span class="mt-auto pt-2 text-sm font-semibold text-blue-400 flex items-center gap-1">Read <i class="ph ph-arrow-right"></i></span>' +
    "</a>";
  }
  function answerRow(x) {
    return '<a href="#/answers/' + x.id + '" class="bento-card group bg-zinc-900 border border-zinc-800/50 rounded-3xl p-5 flex items-start gap-4 shadow-sm hover:border-blue-500/30">' +
      '<div class="icon-tile"><i class="ph-fill ' + x.icon + '"></i></div>' +
      '<div class="min-w-0"><p class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">' + esc(x.topic) + "</p>" +
      '<p class="text-zinc-100 font-semibold leading-snug group-hover:text-blue-300 smooth-transition">' + esc(x.q) + "</p></div>" +
      '<i class="ph ph-caret-right text-zinc-600 ml-auto mt-1 shrink-0"></i>' +
    "</a>";
  }
  function pageHead(icon, title, sub) {
    return '<div class="flex items-center gap-3"><div class="icon-tile icon-tile-lg"><i class="ph-fill ' + icon + '"></i></div>' +
      '<div><h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">' + title + "</h2>" +
      '<p class="text-zinc-400 text-sm">' + sub + "</p></div></div>";
  }

  /* ---------- Render one content block ---------- */
  function renderBlock(b) {
    switch (b.type) {
      case "p":  return "<p>" + inline(b.text) + "</p>";
      case "h2": return "<h2>" + inline(b.text) + "</h2>";
      case "h3": return "<h3>" + inline(b.text) + "</h3>";
      case "hr": return "<hr>";
      case "scripture":
        return '<blockquote class="scripture"><i class="ph-fill ph-book-open-text"></i><p>' + inline(b.text) + "</p>" +
               (b.reference ? "<cite>" + inline(b.reference) + "</cite>" : "") + "</blockquote>";
      case "quote":
        return '<blockquote class="pullquote"><i class="ph-fill ph-quotes"></i><p>' + inline(b.text) + "</p>" +
               (b.source ? "<cite>" + inline(b.source) + "</cite>" : "") + "</blockquote>";
      case "objection":
        return '<div class="objection">' +
               '<div class="ask"><span class="label"><i class="ph-fill ph-warning-circle"></i> Objection</span><p>' + inline(b.objection) + "</p></div>" +
               '<div class="answer"><span class="label"><i class="ph-fill ph-seal-check"></i> Response</span><p>' + inline(b.response) + "</p></div>" +
               "</div>";
      case "callout":
        return '<aside class="callout"><i class="ph-fill ph-lightbulb"></i><div>' +
               (b.title ? '<strong class="callout-title">' + inline(b.title) + "</strong>" : "") +
               "<p>" + inline(b.text) + "</p></div></aside>";
      case "ul":
      case "ol":
        return "<" + b.type + ">" +
               (b.items || []).map(function (i) { return "<li>" + inline(i) + "</li>"; }).join("") +
               "</" + b.type + ">";
      case "image":
        return '<figure class="figure"><img src="' + esc(b.src) + '" alt="' + esc(b.alt || "") + '" loading="lazy">' +
               (b.caption ? "<figcaption>" + inline(b.caption) + "</figcaption>" : "") + "</figure>";
      default:
        console.warn("Unknown block type:", b);
        return "";
    }
  }

  /* ---------- Views ---------- */
  var app;

  function viewHome() {
    var all = sorted();
    var answers = window.ANSWERS || [];
    var v = verseOfDay();
    var hero = verse("1 Peter 3:15");
    var best = load("a101.quizBest", null);
    var quizLen = (window.QUIZ || []).length;

    var stat = function (icon, value, label, href) {
      return '<a href="' + href + '" class="bento-card stat bg-zinc-900 border border-zinc-800/50 rounded-3xl p-5 flex flex-col gap-3 shadow-sm hover:border-blue-500/30">' +
        '<i class="ph-fill ' + icon + ' text-2xl text-blue-400"></i>' +
        '<div><div class="text-3xl font-bold tracking-tight text-zinc-50">' + value + "</div>" +
        '<div class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-1">' + label + "</div></div></a>";
    };

    var html =
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
        // Hero
        '<div class="bg-zinc-900 border border-zinc-800/50 rounded-3xl p-7 md:p-8 flex flex-col justify-between relative overflow-hidden lg:col-span-1 shadow-sm min-h-[360px]">' +
          '<div class="absolute -right-10 -bottom-12 opacity-[0.04] pointer-events-none"><i class="ph-fill ph-cross text-[260px]"></i></div>' +
          '<div class="relative z-10">' +
            '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-3">Know what you believe</p>' +
            '<h2 class="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-50 leading-none">Apologetics<br><span class="text-blue-400">101</span></h2>' +
            '<p class="text-zinc-400 mt-4 leading-relaxed">Plain-language answers to the big questions about faith, for anyone starting out.</p>' +
          "</div>" +
          (hero ? '<div class="relative z-10 mt-6 pt-5 border-t border-zinc-800/50">' +
            '<p class="text-zinc-300 text-sm leading-relaxed italic">&ldquo;Be ready always to give an answer to every man that asketh you a reason of the hope that is in you with meekness and fear.&rdquo;</p>' +
            '<p class="text-blue-400 text-xs font-semibold mt-2">1 Peter 3:15 KJV</p></div>' : "") +
        "</div>" +
        // Verse of the day
        '<div class="bg-zinc-900 border border-zinc-800/50 rounded-3xl p-6 md:p-8 lg:col-span-2 flex flex-col shadow-sm relative overflow-hidden">' +
          '<div class="absolute right-6 top-6 opacity-5 pointer-events-none"><i class="ph-fill ph-sun-horizon text-[180px]"></i></div>' +
          cardTitle("ph-sun-horizon", "Verse of the Day", '<span class="text-xs text-zinc-500 font-medium">' +
            new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) + "</span>") +
          '<div class="flex-1 flex flex-col justify-center relative z-10">' + verseCard(v, { big: true }) + "</div>" +
          '<a href="#/bible" class="relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"><i class="ph ph-magnifying-glass"></i> Look up any verse</a>' +
        "</div>" +
      "</div>" +

      // Stats
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
        stat("ph-books", all.length, all.length === 1 ? "Article" : "Articles", "#/articles") +
        stat("ph-chat-circle-dots", answers.length, "Answers", "#/answers") +
        stat("ph-bookmark-simple", '<span data-saved-num>' + saved().length + "</span>", "Saved", "#/saved") +
        stat("ph-trophy", best == null ? "&ndash;" : best + "/" + quizLen, "Quiz best", "#/quiz") +
      "</div>" +

      // Articles + answers
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
        '<div class="lg:col-span-1 flex flex-col gap-4">' +
          '<div class="flex items-center justify-between"><h3 class="section-label"><i class="ph-fill ph-books"></i> Latest Articles</h3>' +
          '<a href="#/articles" class="text-sm font-semibold text-blue-400 hover:text-blue-300">All</a></div>' +
          (all.length ? all.slice(0, 2).map(articleCard).join("") : card(emptyState("ph-books", "No articles yet", "Add one and it shows up here."))) +
        "</div>" +
        '<div class="lg:col-span-2 flex flex-col gap-4">' +
          '<div class="flex items-center justify-between"><h3 class="section-label"><i class="ph-fill ph-chat-circle-dots"></i> Objections &amp; Answers</h3>' +
          '<a href="#/answers" class="text-sm font-semibold text-blue-400 hover:text-blue-300">See all ' + answers.length + "</a></div>" +
          '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' + answers.slice(0, 6).map(answerRow).join("") + "</div>" +
        "</div>" +
      "</div>" +

      // Quiz CTA
      '<a href="#/quiz" class="quiz-cta bento-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 border border-blue-500/20">' +
        '<div class="icon-tile icon-tile-lg"><i class="ph-fill ph-exam"></i></div>' +
        '<div class="flex-1"><h3 class="text-xl font-bold text-zinc-50">Test yourself</h3>' +
        '<p class="text-zinc-300 text-sm mt-1">' + quizLen + ' questions on evidence, history and philosophy. Could you answer a skeptic?</p></div>' +
        '<span class="btn-primary self-start md:self-auto">Start quiz <i class="ph ph-arrow-right"></i></span>' +
      "</a>";

    app.innerHTML = html;
    document.title = SITE;
  }

  function viewArticles() {
    var all = sorted();
    var cats = ["All"];
    all.forEach(function (a) { if (a.category && cats.indexOf(a.category) === -1) cats.push(a.category); });
    if (cats.indexOf(state.cat) === -1) state.cat = "All";

    app.innerHTML =
      pageHead("ph-books", "Articles", all.length + (all.length === 1 ? " article" : " articles") + " so far") +
      '<div class="flex flex-col md:flex-row gap-3 md:items-center">' +
        searchField("articleSearch", "Search articles...", state.q) +
        '<div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1" role="group" aria-label="Filter by topic">' +
          cats.map(function (c) { return chip(c, c === state.cat, 'data-cat="' + esc(c) + '"'); }).join("") +
        "</div>" +
      "</div>" +
      '<div id="articleGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"></div>';

    function draw() {
      var q = state.q.trim().toLowerCase();
      var shown = all.filter(function (a) {
        return (state.cat === "All" || a.category === state.cat) && (!q || articleText(a).indexOf(q) > -1);
      });
      $("#articleGrid").innerHTML = shown.length ? shown.map(articleCard).join("") :
        '<div class="md:col-span-2 xl:col-span-3">' + card(emptyState("ph-magnifying-glass", "Nothing matches", "Try another word or topic.")) + "</div>";
    }
    draw();
    $("#articleSearch").addEventListener("input", function (e) { state.q = e.target.value; draw(); });
    $all("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.cat = b.getAttribute("data-cat");
        $all("[data-cat]").forEach(function (x) { var on = x === b; x.classList.toggle("chip-on", on); x.setAttribute("aria-pressed", on); });
        draw();
      });
    });
    document.title = "Articles | " + SITE;
  }

  function searchField(id, placeholder, value) {
    return '<div class="relative w-full md:w-80 shrink-0">' +
      '<i class="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>' +
      '<input type="search" id="' + id + '" value="' + esc(value || "") + '" placeholder="' + placeholder + '" autocomplete="off" class="field pl-11" aria-label="' + placeholder + '"></div>';
  }

  function viewAnswers() {
    var answers = window.ANSWERS || [];
    var topics = ["All"];
    answers.forEach(function (x) { if (topics.indexOf(x.topic) === -1) topics.push(x.topic); });
    if (topics.indexOf(state.topic) === -1) state.topic = "All";

    app.innerHTML =
      pageHead("ph-chat-circle-dots", "Objections &amp; Answers", "Short, fair answers to the questions skeptics actually ask") +
      '<div class="flex flex-col md:flex-row gap-3 md:items-center">' +
        searchField("answerSearch", "Search questions...", "") +
        '<div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1" role="group" aria-label="Filter by topic">' +
          topics.map(function (c) { return chip(c, c === state.topic, 'data-topic="' + esc(c) + '"'); }).join("") +
        "</div>" +
      "</div>" +
      '<div id="answerGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>';

    var q = "";
    function draw() {
      var shown = answers.filter(function (x) {
        return (state.topic === "All" || x.topic === state.topic) && (!q || answerText(x).indexOf(q) > -1);
      });
      $("#answerGrid").innerHTML = shown.length ? shown.map(answerRow).join("") :
        '<div class="md:col-span-2">' + card(emptyState("ph-magnifying-glass", "Nothing matches", "Try another word or topic.")) + "</div>";
    }
    draw();
    $("#answerSearch").addEventListener("input", function (e) { q = e.target.value.trim().toLowerCase(); draw(); });
    $all("[data-topic]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.topic = b.getAttribute("data-topic");
        $all("[data-topic]").forEach(function (x) { var on = x === b; x.classList.toggle("chip-on", on); x.setAttribute("aria-pressed", on); });
        draw();
      });
    });
    document.title = "Objections & Answers | " + SITE;
  }

  function viewAnswer(id) {
    var answers = window.ANSWERS || [];
    var idx = -1;
    answers.forEach(function (x, i) { if (x.id === id) idx = i; });
    if (idx === -1) return viewNotFound();
    var x = answers[idx], next = answers[(idx + 1) % answers.length];
    var on = isSaved("answer", x.id);

    app.innerHTML =
      '<article class="max-w-3xl w-full mx-auto flex flex-col gap-6">' +
        '<a class="back" href="#/answers"><i class="ph ph-arrow-left"></i> All answers</a>' +
        '<div class="bg-zinc-900 border border-zinc-800/50 rounded-3xl p-6 md:p-8 relative overflow-hidden">' +
          '<div class="absolute -right-10 -top-10 opacity-5 pointer-events-none"><i class="ph-fill ' + x.icon + ' text-[220px]"></i></div>' +
          '<div class="relative z-10">' +
            '<div class="flex items-center gap-2 mb-4"><span class="tag">' + esc(x.topic) + '</span>' +
            '<span class="ml-auto flex gap-1">' +
              iconBtn("ph-bookmark-simple", on ? "Remove from Saved" : "Save", 'data-save="answer" data-id="' + x.id + '"', on) +
              iconBtn("ph-share-network", "Share", 'data-share-page="1"') +
            "</span></div>" +
            '<p class="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1"><i class="ph-fill ph-warning-circle"></i> The objection</p>' +
            '<h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-50 leading-tight">' + esc(x.q) + "</h2>" +
          "</div>" +
        "</div>" +
        card('<p class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1"><i class="ph-fill ph-seal-check"></i> Short answer</p>' +
             '<p class="text-zinc-200 text-[17px] leading-relaxed">' + inline(x.short) + "</p>") +
        card(cardTitle("ph-list", "Key points") +
             '<ul class="points">' + x.points.map(function (pt) { return "<li>" + inline(pt) + "</li>"; }).join("") + "</ul>") +
        '<div class="callout"><i class="ph-fill ph-lightbulb"></i><div><strong class="callout-title">Being honest</strong><p>' + inline(x.honest) + "</p></div></div>" +
        card(cardTitle("ph-book-open-text", "Scripture (KJV)") +
             '<div class="flex flex-col gap-6">' + x.verses.map(function (r) { return verseCard(verse(r)); }).join('<div class="border-t border-zinc-800/50"></div>') + "</div>") +
        card(cardTitle("ph-books", "Go deeper") +
             '<ul class="sources">' + x.sources.map(function (s) { return "<li>" + inline(s) + "</li>"; }).join("") + "</ul>") +
        '<a href="#/answers/' + next.id + '" class="bento-card bg-zinc-900 border border-zinc-800/50 rounded-3xl p-5 flex items-center gap-4 hover:border-blue-500/30">' +
          '<div class="min-w-0"><p class="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Next question</p>' +
          '<p class="text-zinc-100 font-semibold mt-1">' + esc(next.q) + "</p></div>" +
          '<i class="ph ph-arrow-right text-blue-400 text-xl ml-auto shrink-0"></i></a>' +
      "</article>";
    document.title = plain(x.q) + " | " + SITE;
  }

  function viewArticle(slug) {
    var all = sorted();
    var idx = -1;
    all.forEach(function (a, i) { if (a.slug === slug) idx = i; });
    if (idx === -1) return viewNotFound();
    var a = all[idx], newer = all[idx - 1], older = all[idx + 1];
    var on = isSaved("article", a.slug);

    app.innerHTML =
      '<article class="max-w-3xl w-full mx-auto flex flex-col gap-6">' +
        '<a class="back" href="#/articles"><i class="ph ph-arrow-left"></i> All articles</a>' +
        '<header class="bg-zinc-900 border border-zinc-800/50 rounded-3xl p-6 md:p-8 relative overflow-hidden">' +
          '<div class="absolute -right-10 -top-10 opacity-5 pointer-events-none"><i class="ph-fill ph-book-open-text text-[220px]"></i></div>' +
          '<div class="relative z-10">' +
            '<div class="flex items-center gap-2 mb-4">' + (a.category ? '<span class="tag">' + esc(a.category) + "</span>" : "") +
            '<span class="ml-auto flex gap-1">' +
              iconBtn("ph-bookmark-simple", on ? "Remove from Saved" : "Save", 'data-save="article" data-id="' + esc(a.slug) + '"', on) +
              iconBtn("ph-share-network", "Share", 'data-share-page="1"') +
            "</span></div>" +
            '<h1 class="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50 leading-tight">' + esc(a.title) + "</h1>" +
            (a.summary ? '<p class="text-zinc-400 mt-3 text-lg leading-relaxed">' + inline(a.summary) + "</p>" : "") +
            '<div class="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-5 border-t border-zinc-800/50 text-sm text-zinc-400">' +
              (a.author ? '<span class="flex items-center gap-1.5"><i class="ph ph-user text-zinc-500"></i>' + esc(a.author) + "</span>" : "") +
              (a.date ? '<span class="flex items-center gap-1.5"><i class="ph ph-calendar-blank text-zinc-500"></i>' + formatDate(a.date) + "</span>" : "") +
              '<span class="flex items-center gap-1.5"><i class="ph ph-clock text-zinc-500"></i>' + readingTime(a) + "</span>" +
            "</div>" +
          "</div>" +
        "</header>" +
        '<div class="article-body bg-zinc-900 border border-zinc-800/50 rounded-3xl p-6 md:p-10">' +
          (a.content || []).map(renderBlock).join("") +
        "</div>" +
        '<nav class="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="More articles">' +
          (older ? '<a class="pager" href="' + articleHref(older) + '"><small><i class="ph ph-arrow-left"></i> Previous</small><strong>' + esc(older.title) + "</strong></a>" : "") +
          (newer ? '<a class="pager sm:text-right" href="' + articleHref(newer) + '"><small>Next <i class="ph ph-arrow-right"></i></small><strong>' + esc(newer.title) + "</strong></a>" : "") +
          '<a class="pager ' + (older || newer ? "" : "sm:col-span-2") + '" href="#/quiz"><small><i class="ph ph-exam"></i> Keep going</small><strong>Test yourself with the quiz</strong></a>' +
        "</nav>" +
      "</article>";
    document.title = a.title + " | " + SITE;
  }

  function viewNotFound() {
    app.innerHTML = '<div class="max-w-xl mx-auto w-full">' + card(emptyState("ph-compass", "Page not found",
      'That link doesn\'t match anything here. <a class="text-blue-400" href="#/">Go home</a>')) + "</div>";
    document.title = "Not found | " + SITE;
  }

  /* ----- Bible lookup ----- */
  var QUICK = ["John 3:16", "Romans 5:8", "1 Peter 3:15", "Hebrews 11:1", "Psalm 23", "John 1:1-5", "1 Corinthians 13:4-7", "Isaiah 53:5"];
  function viewBible() {
    var recent = load("a101.recent", []);
    app.innerHTML =
      pageHead("ph-book-open-text", "KJV Verse Lookup", "Type any reference, like John 3:16 or Psalm 23") +
      '<form id="bibleForm" class="flex gap-3" role="search">' +
        '<div class="relative flex-1"><i class="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>' +
        '<input id="bibleRef" type="search" class="field pl-11" placeholder="e.g. Romans 8:28" autocomplete="off" autocapitalize="words" aria-label="Bible reference" enterkeyhint="search"></div>' +
        '<button class="btn-primary shrink-0" type="submit">Look up</button>' +
      "</form>" +
      '<div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">' + QUICK.map(function (r) { return chip(r, false, 'data-quick="' + r + '"'); }).join("") + "</div>" +
      '<div id="bibleOut"></div>' +
      (recent.length ? '<div><h3 class="section-label mb-3"><i class="ph-fill ph-clock"></i> Recent</h3><div class="flex flex-wrap gap-2">' +
        recent.map(function (r) { return chip(r, false, 'data-quick="' + esc(r) + '"'); }).join("") + "</div></div>" : "");

    var out = $("#bibleOut");
    function show(ref) {
      ref = ref.trim();
      if (!ref) return;
      $("#bibleRef").value = ref;
      out.innerHTML = card('<div class="flex items-center gap-3 text-zinc-400"><div class="loader"></div> Looking up ' + esc(ref) + "...</div>");
      fetch("https://bible-api.com/" + encodeURIComponent(ref) + "?translation=kjv")
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || !res.j || !res.j.verses || !res.j.verses.length) throw new Error((res.j && res.j.error) || "not found");
          var j = res.j;
          var full = j.verses.map(function (v) { return v.text.replace(/\s+/g, " ").trim(); }).join(" ");
          var item = { ref: j.reference, text: full };
          lookedUp[j.reference] = item;
          out.innerHTML = card(
            cardTitle("ph-book-open-text", esc(j.reference) + ' <span class="text-zinc-500 text-sm font-medium">KJV</span>',
              '<span class="flex gap-1">' +
                iconBtn("ph-copy", "Copy", 'data-copy-verse="' + esc(j.reference) + '"') +
                iconBtn("ph-bookmark-simple", "Save", 'data-save="verse" data-id="' + esc(j.reference) + '"', isSaved("verse", j.reference)) +
                iconBtn("ph-share-network", "Share", 'data-share-verse="' + esc(j.reference) + '"') +
              "</span>") +
            '<div class="bible-text">' + j.verses.map(function (v) {
              return '<p><sup>' + v.verse + "</sup>" + esc(v.text.replace(/\s+/g, " ").trim()) + "</p>";
            }).join("") + "</div>" +
            '<p class="text-xs text-zinc-500 mt-4">King James Version, live from bible-api.com</p>');
          recent = [j.reference].concat(recent.filter(function (r) { return r !== j.reference; })).slice(0, 8);
          save("a101.recent", recent);
        })
        .catch(function (err) {
          var off = verse(ref);
          if (off) { out.innerHTML = card(cardTitle("ph-book-open-text", esc(off.ref)) + verseCard(off) + '<p class="text-xs text-zinc-500 mt-4">Offline copy. Couldn\'t reach the Bible service.</p>'); return; }
          console.warn("Verse lookup failed:", err && err.message);
          out.innerHTML = card('<div class="flex items-start gap-3"><i class="ph-fill ph-warning-circle text-2xl text-red-400"></i><div>' +
            '<p class="text-zinc-100 font-semibold">Couldn\'t find &ldquo;' + esc(ref) + "&rdquo;</p>" +
            '<p class="text-zinc-400 text-sm mt-1">Check the spelling (like &ldquo;1 John 4:8&rdquo;) or your connection, then try again.</p></div></div>');
        });
    }
    $("#bibleForm").addEventListener("submit", function (e) { e.preventDefault(); show($("#bibleRef").value); });
    $all("[data-quick]").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-quick")); }); });
    var pre = (location.hash.split("?q=")[1] || "");
    if (pre) show(decodeURIComponent(pre));
    document.title = "Verse Lookup | " + SITE;
  }
  var lookedUp = {};
  function anyVerse(ref) { return verse(ref) || lookedUp[ref] || (saved().filter(function (s) { return s.type === "verse" && s.id === ref; })[0] || {}).data; }

  /* ----- Quiz ----- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function viewQuiz() {
    var qs = shuffle(window.QUIZ || []);
    var i = 0, score = 0;
    document.title = "Test Yourself | " + SITE;

    function head() {
      return pageHead("ph-exam", "Test Yourself", qs.length + " questions. No pressure, just practice.");
    }
    function draw() {
      if (i >= qs.length) return done();
      var q = qs[i];
      app.innerHTML = head() +
        '<div class="max-w-2xl w-full mx-auto flex flex-col gap-4">' +
          '<div class="flex items-center justify-between text-sm text-zinc-400 font-medium"><span>Question ' + (i + 1) + " of " + qs.length + "</span>" +
          '<span class="flex items-center gap-1"><i class="ph-fill ph-check-circle text-emerald-400"></i> ' + score + "</span></div>" +
          '<div class="h-2 rounded-full bg-zinc-800 overflow-hidden"><div class="h-full bg-blue-500 rounded-full smooth-transition" style="width:' + (i / qs.length * 100) + '%"></div></div>' +
          card('<p class="text-xl font-semibold text-zinc-50 leading-snug mb-5">' + inline(q.q) + "</p>" +
            '<div class="flex flex-col gap-3">' + q.options.map(function (o, n) {
              return '<button type="button" class="option" data-opt="' + n + '"><span class="opt-letter">' + "ABCD"[n] + "</span><span>" + inline(o) + "</span></button>";
            }).join("") + "</div>" +
            '<div id="why" class="hidden"></div>') +
        "</div>";
      $all("[data-opt]").forEach(function (b) {
        b.addEventListener("click", function () {
          var pick = +b.getAttribute("data-opt");
          var right = pick === q.answer;
          if (right) score++;
          $all("[data-opt]").forEach(function (x) {
            x.disabled = true;
            var n = +x.getAttribute("data-opt");
            if (n === q.answer) x.classList.add("is-right");
            else if (n === pick) x.classList.add("is-wrong");
          });
          var why = $("#why");
          why.className = "mt-5 pt-5 border-t border-zinc-800/50";
          why.innerHTML = '<p class="font-semibold ' + (right ? "text-emerald-400" : "text-red-400") + ' flex items-center gap-2"><i class="ph-fill ' + (right ? "ph-check-circle" : "ph-x-circle") + '"></i>' + (right ? "Correct!" : "Not quite") + "</p>" +
            '<p class="text-zinc-300 text-sm mt-2 leading-relaxed">' + inline(q.why) + "</p>" +
            '<button type="button" id="nextQ" class="btn-primary mt-4">' + (i + 1 < qs.length ? "Next question" : "See results") + ' <i class="ph ph-arrow-right"></i></button>';
          $("#nextQ").addEventListener("click", function () { i++; draw(); window.scrollTo(0, 0); });
          $("#nextQ").focus();
        });
      });
    }
    function done() {
      var best = load("a101.quizBest", 0);
      var isBest = score > best || best == null;
      if (isBest) save("a101.quizBest", score);
      var pct = score / qs.length;
      var msg = pct === 1 ? "Perfect score. You're ready for any skeptic." : pct >= 0.75 ? "Strong work. You know your stuff." : pct >= 0.5 ? "Solid start. Read a few answers and try again." : "Good practice. The answers library will help a lot.";
      app.innerHTML = head() +
        '<div class="max-w-2xl w-full mx-auto">' + card(
          '<div class="flex flex-col items-center text-center py-6">' +
            '<i class="ph-fill ph-trophy text-6xl text-blue-400 mb-3"></i>' +
            '<div class="text-6xl font-bold tracking-tighter text-zinc-50">' + score + '<span class="text-zinc-500 text-3xl">/' + qs.length + "</span></div>" +
            (isBest && score ? '<p class="tag mt-3">New best</p>' : "") +
            '<p class="text-zinc-300 mt-3">' + msg + "</p>" +
            '<div class="flex flex-wrap gap-3 justify-center mt-6">' +
              '<button type="button" id="again" class="btn-primary"><i class="ph ph-arrow-clockwise"></i> Try again</button>' +
              '<a href="#/answers" class="btn-ghost"><i class="ph ph-chat-circle-dots"></i> Read answers</a>' +
              '<button type="button" id="shareScore" class="btn-ghost"><i class="ph ph-share-network"></i> Share</button>' +
            "</div></div>") + "</div>";
      $("#again").addEventListener("click", viewQuiz);
      $("#shareScore").addEventListener("click", function () {
        share(SITE, "I scored " + score + "/" + qs.length + " on the Apologetics 101 quiz. Can you beat it?", location.href.split("#")[0] + "#/quiz");
      });
    }
    draw();
  }

  /* ----- Saved ----- */
  function viewSaved() {
    var list = saved();
    var answers = window.ANSWERS || [];
    function row(s) {
      var icon, title, sub, href;
      if (s.type === "article") {
        var a = ARTICLES.filter(function (x) { return x.slug === s.id; })[0];
        if (!a) return "";
        icon = "ph-book-open-text"; title = a.title; sub = "Article"; href = articleHref(a);
      } else if (s.type === "answer") {
        var x = answers.filter(function (y) { return y.id === s.id; })[0];
        if (!x) return "";
        icon = x.icon; title = x.q; sub = "Answer &middot; " + esc(x.topic); href = "#/answers/" + x.id;
      } else {
        var v = s.data || verse(s.id);
        if (!v) return "";
        return card('<div class="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500"><i class="ph-fill ph-book-bookmark text-blue-400 text-base"></i> Verse</div>' + verseCard(v));
      }
      return '<a href="' + href + '" class="bento-card bg-zinc-900 border border-zinc-800/50 rounded-3xl p-5 flex items-center gap-4 hover:border-blue-500/30">' +
        '<div class="icon-tile"><i class="ph-fill ' + icon + '"></i></div>' +
        '<div class="min-w-0"><p class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">' + sub + "</p>" +
        '<p class="text-zinc-100 font-semibold leading-snug">' + esc(title) + "</p></div>" +
        '<i class="ph ph-caret-right text-zinc-600 ml-auto shrink-0"></i></a>';
    }
    app.innerHTML = pageHead("ph-bookmark-simple", "Saved", "Articles, answers and verses you bookmarked. Stored on this device.") +
      (list.length ? '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' + list.map(row).join("") + "</div>" :
        card(emptyState("ph-bookmark-simple", "Nothing saved yet", "Tap the bookmark on any article, answer or verse and it lands here.")));
    document.title = "Saved | " + SITE;
  }

  /* ---------- Global search (nav) ---------- */
  function setupSearch() {
    var input = $("#globalSearch"), box = $("#searchResults");
    if (!input) return;
    function hide() { box.classList.add("hidden"); box.classList.remove("flex"); }
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) return hide();
      var hits = [];
      sorted().forEach(function (a) { if (articleText(a).indexOf(q) > -1) hits.push({ icon: "ph-book-open-text", label: a.title, sub: "Article", href: articleHref(a) }); });
      (window.ANSWERS || []).forEach(function (x) { if (answerText(x).indexOf(q) > -1) hits.push({ icon: x.icon, label: x.q, sub: x.topic, href: "#/answers/" + x.id }); });
      if (/^\s*[1-3]?\s*[a-z]+\.?\s+\d+(:\d+(-\d+)?)?\s*$/i.test(input.value)) {
        hits.unshift({ icon: "ph-book-open-text", label: "Look up " + input.value.trim() + " (KJV)", sub: "Bible", href: "#/bible?q=" + encodeURIComponent(input.value.trim()) });
      }
      box.innerHTML = hits.length ? hits.slice(0, 8).map(function (h) {
        return '<a href="' + h.href + '" class="search-hit"><i class="ph-fill ' + h.icon + ' text-blue-400"></i><span class="min-w-0"><span class="block text-sm text-zinc-100 truncate">' + esc(h.label) + '</span><span class="block text-xs text-zinc-500">' + esc(h.sub) + "</span></span></a>";
      }).join("") : '<p class="px-3 py-2 text-sm text-zinc-400">No matches. Try &ldquo;evil&rdquo;, &ldquo;science&rdquo; or a verse like &ldquo;John 3:16&rdquo;.</p>';
      box.classList.remove("hidden"); box.classList.add("flex");
    });
    box.addEventListener("click", function (e) { if (e.target.closest("a")) { input.value = ""; hide(); input.blur(); } });
    document.addEventListener("click", function (e) { if (!e.target.closest("#searchWrap")) hide(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { hide(); input.blur(); }
      if (e.key === "Enter") { var first = box.querySelector("a"); if (first) { location.hash = first.getAttribute("href"); input.value = ""; hide(); input.blur(); } }
    });
  }

  /* ---------- Delegated buttons (save / copy / share) ---------- */
  function setupActions() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-save")) {
        var type = b.getAttribute("data-save"), id = b.getAttribute("data-id");
        var item = { type: type, id: id };
        if (type === "verse") item.data = anyVerse(id);
        var on = toggleSaved(item);
        $all('[data-save="' + type + '"][data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]').forEach(function (x) {
          x.classList.toggle("is-on", on);
          var i = x.querySelector("i"); i.classList.toggle("ph-fill", on); i.classList.toggle("ph", !on);
        });
        var num = $("[data-saved-num]"); if (num) num.textContent = saved().length;
      } else if (b.hasAttribute("data-copy-verse")) {
        var v = anyVerse(b.getAttribute("data-copy-verse"));
        if (v) copyText("\u201C" + v.text + "\u201D \u2014 " + v.ref + " (KJV)", "Verse copied");
      } else if (b.hasAttribute("data-share-verse")) {
        var sv = anyVerse(b.getAttribute("data-share-verse"));
        if (sv) share(sv.ref + " (KJV)", "\u201C" + sv.text + "\u201D \u2014 " + sv.ref + " (KJV)", location.href.split("#")[0]);
      } else if (b.hasAttribute("data-share-page")) {
        share(document.title, "", location.href);
      }
    });
  }

  /* ---------- Reading progress ---------- */
  function setupProgress() {
    var bar = $("#progress");
    var tick = false;
    function update() {
      tick = false;
      var reading = document.body.getAttribute("data-view") === "article" || document.body.getAttribute("data-view") === "answer";
      if (!reading) { bar.style.transform = "scaleX(0)"; return; }
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 1;
      bar.style.transform = "scaleX(" + pct + ")";
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    return update;
  }

  /* ---------- Router ---------- */
  var updateProgress = function () {};
  function route() {
    var raw = location.hash.replace(/^#\/?/, "").split("?")[0];
    var parts = raw.split("/");
    var first = decodeURIComponent(parts[0] || "");
    var view;
    if (!first) { view = "home"; viewHome(); }
    else if (first === "articles") { view = "articles"; viewArticles(); }
    else if (first === "answers" && parts[1]) { view = "answer"; viewAnswer(decodeURIComponent(parts[1])); }
    else if (first === "answers") { view = "answers"; viewAnswers(); }
    else if (first === "bible") { view = "bible"; viewBible(); }
    else if (first === "quiz") { view = "quiz"; viewQuiz(); }
    else if (first === "saved") { view = "saved"; viewSaved(); }
    else { view = "article"; viewArticle(decodeURIComponent(raw)); }
    document.body.setAttribute("data-view", view);
    var tab = view === "answer" ? "answers" : view === "article" ? "articles" : view;
    $all("[data-tab]").forEach(function (t) {
      var on = t.getAttribute("data-tab") === tab;
      t.classList.toggle("tab-on", on);
      if (on) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    updateProgress();
  }

  function start() {
    app = document.getElementById("app");
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
    setupSearch();
    setupActions();
    updateProgress = setupProgress();
    updateSavedCount();
    route();
  }

  /* Start after every article file has loaded (deferred scripts all run
     before DOMContentLoaded), so articles listed after site.js still show. */
  var started = false;
  function boot() { if (started) return; started = true; start(); }
  window.addEventListener("hashchange", route);
  if (document.readyState === "complete") boot();
  else {
    document.addEventListener("DOMContentLoaded", boot);
    window.addEventListener("load", boot);
  }
})();
