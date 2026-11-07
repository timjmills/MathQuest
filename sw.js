/* Math Quest service worker (Chromebook load fix, 2026-11-02).
 *
 * Every script and stylesheet URL carries a content hash (?v=..., tests/scripts/ws-stamp-assets.cjs), so a stamped
 * URL never changes content: it is served cache-first and kept. After a pupil's first visit the ~270 startup modules
 * come from the device instead of the school Wi-Fi, and a deploy re-downloads only the files whose hash changed.
 * Pages (index.html) and every unstamped request go to the network as before, so a deploy is seen at once.
 * Any failure here falls through to a plain network fetch: the worker can make loading faster, never break it.
 */
'use strict';
const CACHE = 'mq-stamped-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith('mq-') && k !== CACHE && k !== 'mq-page-v1').map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

// The page itself (2026-11-02, owner: school Chromebooks got ERR_CONNECTION_RESET on the student link): network
// first, always, so a deploy is seen at once; the last good copy is kept and served ONLY when the network fails
// (reset, timeout, offline). The query string is ignored for the copy, so every ?c= link opens from it.
const PAGE_CACHE = 'mq-page-v1';
const PAGE_KEY = 'mq-page-index';
async function pageFromNetworkOrCopy(req) {
    try {
        const res = await fetch(req);
        if (res && res.ok && res.type === 'basic') {
            try { const c = await caches.open(PAGE_CACHE); await c.put(PAGE_KEY, res.clone()); } catch (e) { /* ignore */ }
        }
        return res;
    } catch (err) {
        try {
            const c = await caches.open(PAGE_CACHE);
            const copy = await c.match(PAGE_KEY);
            if (copy) return copy;
        } catch (e) { /* fall through */ }
        throw err;
    }
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    let url;
    try { url = new URL(req.url); } catch (e) { return; }
    if (url.origin !== self.location.origin) return;
    if (req.mode === 'navigate' && (url.pathname === '/' || url.pathname === '/index.html')) {
        event.respondWith(pageFromNetworkOrCopy(req));
        return;
    }
    if (!/^[0-9a-f]{6,}$/.test(url.searchParams.get('v') || '')) return;
    if (!/\.(js|css)$/.test(url.pathname)) return;
    event.respondWith((async () => {
        try {
            const cache = await caches.open(CACHE);
            const hit = await cache.match(req, { ignoreVary: true });
            if (hit) return hit;
            const res = await fetch(req);
            if (res && res.ok && res.type === 'basic') {
                try { await cache.put(req, res.clone()); } catch (e) { /* quota: serve without caching */ }
            }
            return res;
        } catch (e) {
            return fetch(req);
        }
    })());
});
