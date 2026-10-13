/* Apologetics101 service worker.
   - The whole site (pages, every article, fonts, icons) is saved on the first visit,
     so it all works offline straight away.
   - Site files are served from the device and refreshed quietly in the background,
     so edits you push show up on the next open.
   - Bump VERSION when you add or rename files (and add them to SHELL) so phones pick it up.
   - Verses looked up on the Bible page are kept on the device too. */
const VERSION = 'a101-v1';
const SHELL_CACHE = 'a101-shell-' + VERSION;
const VERSE_CACHE = 'a101-verses-v1';   // not versioned: keeps looked-up verses across updates
const VERSE_LIMIT = 400;

const SHELL = [
  "./",
  "index.html",
  "manifest.json",
  "pwa.js",
  "style.css",
  "tailwind.css",
  "site.js",
  "data.js",
  "kjv.js",
  "Questionyourfaith.js",
  "ResurrectionMinimalFacts.js",
  "DidGodCreateTheUniverse.js",
  "CanWeTrustTheNewTestament.js",
  "favicon.svg",
  "vendor/inter/inter.css",
  "vendor/inter/inter-0.woff2",
  "vendor/phosphor/regular.css",
  "vendor/phosphor/fill.css",
  "vendor/phosphor/Phosphor.woff2",
  "vendor/phosphor/Phosphor-Fill.woff2",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-192.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/shortcut-jesus.png",
  "icons/shortcut-science.png",
  "icons/shortcut-bible.png",
  "icons/shortcut-continue.png"
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL_CACHE);
    await c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if (k.startsWith('a101-') && k !== SHELL_CACHE && k !== VERSE_CACHE) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
  if (e.data && e.data.type === 'version' && e.ports[0]) e.ports[0].postMessage(VERSION);
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

// Pages: try the network (so updates win), fall back to the saved copy when offline or slow.
async function page(e) {
  const cache = await caches.open(SHELL_CACHE);
  const net = fetch(e.request).then(res => {
    if (res.ok) cache.put('./index.html', res.clone());
    return res;
  });
  try { return await Promise.race([net, timeout(4000)]); }
  catch {
    const hit = await cache.match('./index.html') || await cache.match('./');
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }
}

// Site files: answer from the device, refresh in the background.
async function asset(e) {
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(e.request, { ignoreSearch: true });
  const net = fetch(e.request).then(res => {
    if (res.ok) cache.put(e.request, res.clone());
    return res;
  });
  if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
  return net;
}

// Bible verses (bible-api.com): keep every verse he looks up; offline gets a friendly note.
async function verse(e) {
  const cache = await caches.open(VERSE_CACHE);
  const hit = await cache.match(e.request.url);
  if (hit) return hit;
  try {
    const res = await fetch(e.request.url, { mode: 'cors', credentials: 'omit' });
    if (res.ok) {
      await cache.put(e.request.url, res.clone());
      const keys = await cache.keys();
      if (keys.length > VERSE_LIMIT) for (const k of keys.slice(0, keys.length - VERSE_LIMIT)) await cache.delete(k);
    }
    return res;
  } catch {
    return new Response(JSON.stringify({ offline: true, error: "You're offline. Verses you've looked up before still work offline." }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'X-A101-Offline': '1' } });
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'bible-api.com') { e.respondWith(verse(e)); return; }
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') { e.respondWith(page(e)); return; }
  e.respondWith(asset(e));
});
