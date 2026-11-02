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
        await Promise.all(keys.filter((k) => k.startsWith('mq-') && k !== CACHE).map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    let url;
    try { url = new URL(req.url); } catch (e) { return; }
    if (url.origin !== self.location.origin) return;
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
