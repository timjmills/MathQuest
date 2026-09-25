// js/modules/sheet/cells/panes/hand-art.js
// The counting HAND of the `fingers` pane, built from Tabler Icons' outline hands.
//
// Source: Tabler Icons v3.48.0, outline set — `hand-finger`, `hand-two-fingers`,
// `hand-three-fingers`, `hand-stop` (https://tabler.io/icons, npm `@tabler/icons`).
// Licence: MIT. The notice below is reproduced as the licence requires.
//
//   MIT License
//   Copyright (c) 2020-2026 Paweł Kuna
//   Permission is hereby granted, free of charge, to any person obtaining a copy of this
//   software and associated documentation files (the "Software"), to deal in the Software
//   without restriction, including without limitation the rights to use, copy, modify, merge,
//   publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
//   to whom the Software is furnished to do so, subject to the following conditions:
//   The above copyright notice and this permission notice shall be included in all copies or
//   substantial portions of the Software.
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
//   INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
//   PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
//   FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
//   DEALINGS IN THE SOFTWARE.
//
// What was taken and what was changed. Tabler draws a hand on a 24-unit grid: four fingers
// 3 units wide at x = 8, 11, 14, 17 (index next to the thumb), each a raised capsule or a short
// knuckle bump, a palm rounded at r = 6, and a thumb swept out to the left. Its set has no
// four-finger hand, and its thumb is out in every icon, which would count as one more finger. So
// the four fingers are taken PER FINGER from those icons (raised tops and knuckle bumps, exactly
// as Tabler draws them; the folded index bump in Tabler's own proportions), the thumb is Tabler's
// `hand-stop` thumb when it is up (5) and a knuckle bump on the palm's side when it is folded
// (1-4), and a wrist cuff is added under the palm. The path data is vendored here: pages print
// offline, nothing is fetched at run time.
//
// Counting order (owner ruling 2026-09-25): INDEX FIRST — 1 index, 2 + middle, 3 + ring,
// 4 + little, 5 + thumb.
//
// Pure module (SCC-01).

import { SW, INK, n2 } from './kit.js';

/** mm per Tabler unit: a finger is 3 units, so 2 mm makes it 6 mm wide (RP-5, touch-countable). */
export const HAND_UNIT_MM = 2;
/** The drawn box of one hand, in Tabler units (the same for every count, so hands line up). */
const X0 = 3, X1 = 21, Y0 = 1.3, Y1 = 24.6;

// Tabler's finger tops (y of the tip) when raised (hand-stop / hand-two-fingers) and folded
// (hand-finger's knuckle bumps; the index bump is ours, in the same proportions).
const UP = [4, 2, 4, 6];            // index, middle, ring, little
const DOWN = [9.3, 8, 9, 10];
const BASE = [13, 12, 12, 12];       // where each finger's left side leaves the palm

/** One finger k (0 = index) as Tabler draws it: left side up, a 1.5-unit round tip, right side down. */
function fingerPath(k, raised) {
    const xl = 8 + 3 * k, xr = xl + 3, top = raised ? UP[k] : DOWN[k];
    const cy = top + 1.5;
    return `M${xl} ${BASE[k]}V${n2(cy)}A1.5 1.5 0 0 1 ${xr} ${n2(cy)}V12`;
}

// The palm: Tabler's right side and r = 6 heel, then either Tabler's `hand-stop` thumb (up) or a
// knuckle bump on the side of the palm (folded), closing on the index finger's base at (8, 13).
const PALM_THUMB_UP = 'M20 12V16A6 6 0 0 1 14 22H12.208A6 6 0 0 1 7.196 19.3a69.74 69.74 0 0 1 -.196 -.3'
    + 'c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28L8 13';
const PALM_THUMB_DOWN = 'M20 12V16A6 6 0 0 1 14 22A6 6 0 0 1 8 16A1.75 1.75 0 0 1 8 12.5';
// The wrist cuff: a rounded band over the heel (white, so the heel's curve stops at it).
const CUFF = { x: 9.6, y: 20.8, w: 8.8, h: 3.5, r: 1.3 };

/**
 * One hand with `up` fingers raised (0-5), in mm. `mirror` flips it so the thumb is on the right
 * (the left hand of a pair: thumbs point to the middle, as when a child holds both hands up).
 */
export function tablerHand(c, up, mirror = false) {
    const s = HAND_UNIT_MM;
    const ink = c && c.grey ? '#949494' : INK;
    const sw = n2(SW.rule / s);   // 2.25 pt, the heaviest line of the closed set (INK-10)
    const line = `fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
    let g = '';
    for (let k = 0; k < 4; k++) {
        const raised = up > k;
        g += `<path data-ws-finger="${raised ? 'up' : 'down'}" data-ws-mm="${n2(3 * s)}" d="${fingerPath(k, raised)}" ${line}/>`;
    }
    const thumbUp = up >= 5;
    g += `<path data-ws-finger="${thumbUp ? 'up' : 'down'}" data-ws-thumb="1" data-ws-mm="${n2(3 * s)}" d="${thumbUp ? PALM_THUMB_UP : PALM_THUMB_DOWN}" ${line}/>`;
    g += `<rect x="${CUFF.x}" y="${CUFF.y}" width="${CUFF.w}" height="${CUFF.h}" rx="${CUFF.r}" fill="#fff" stroke="${ink}" stroke-width="${sw}"/>`;
    const w = (X1 - X0) * s, h = (Y1 - Y0) * s;
    // Unit box -> mm, optionally mirrored about the hand's own box.
    const t = mirror
        ? `translate(${n2(w + X0 * s)} ${n2(-Y0 * s)}) scale(${-s} ${s})`
        : `translate(${n2(-X0 * s)} ${n2(-Y0 * s)}) scale(${s})`;
    return { w, h, body: `<g data-ws-hand="${up}" transform="${t}">${g}</g>` };
}
