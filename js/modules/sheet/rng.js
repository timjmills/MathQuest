// js/modules/sheet/rng.js
// The kit's only source of randomness.
//
// SCC-01: the kit MUST NOT call `Math.random`. Every number a sheet shows comes from a seeded
// mulberry32 stream, so a rebuild of the same sheet gives the same sheet - which is what makes
// a Form A / Form B pair, an answer key and a reprint trustworthy.
//
// Pure module: no `window`, no DOM.

/** mulberry32. Same stream as the approved mock-up pack and the test harness. */
export function rng(seed) {
    let a = seed >>> 0;
    return () => {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/** An integer in [lo, hi]. */
export const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

/** One of the items. */
export const pick = (r, arr) => arr[int(r, 0, arr.length - 1)];

/** Fisher-Yates on a copy, under the seeded stream. */
export function shuffle(r, arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = int(r, 0, i);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * A stable 32-bit seed from any set of strings and numbers (FNV-1a).
 * Used so "the same sheet" means the same skill, form letter and item index, never a clock.
 */
export function deriveSeed(...parts) {
    let h = 0x811c9dc5;
    for (const part of parts) {
        const s = String(part);
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        h ^= 0x2c;
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
