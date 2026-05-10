// word-problem-icons.js — small line-art SVG icons for word problems.
//
// Replaces the old BW_ICONS table of generic Unicode glyphs (●, ○, ★, ■, ▲,
// ◆) which rendered every "different" item as the same circle/square/triangle.
// The Pictures vs No Pictures toggle is now meaningful: each named item gets
// a visually distinct illustration.
//
// Each illustration is a simple line-art SVG at viewBox 0 0 24 24, designed
// to read clearly at sizes from 18 to 48px. Stroke uses currentColor (or the
// caller-provided color) so the icon picks up the surrounding text color.
//
// Public API:
//   getWordProblemIcon(name, size = 24, color = 'currentColor')
//     → returns an inline SVG markup string. Unknown names get a generic
//       circle with the first letter of the name inside.

// ---------------------------------------------------------------
// Icon definitions. Each entry is the INNER markup of the SVG —
// the wrapper <svg> element is added by getWordProblemIcon().
// stroke + fill use the CSS variable `currentColor` token at the
// inner-markup level so callers can re-tint via outer color.
// ---------------------------------------------------------------
const _BASE_ATTRS = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

const _ICON_MARKUP = {
    apple:
        // body (oval-ish), leaf, stem
        `<path d="M12 7c-2.5 0-5 1.5-5 5.5S9 20 12 20s5-3 5-7.5S14.5 7 12 7z" ${_BASE_ATTRS}/>` +
        `<path d="M12 7v-2" ${_BASE_ATTRS}/>` +
        `<path d="M12 5c1.5 0 3-1 3.5-2.5C14 3 12 4 12 5z" fill="currentColor" stroke="currentColor" stroke-linejoin="round"/>`,
    cookie:
        // round disc with chocolate-chip dots
        `<circle cx="12" cy="12" r="8" ${_BASE_ATTRS}/>` +
        `<circle cx="9" cy="10" r="1" fill="currentColor"/>` +
        `<circle cx="14" cy="9" r="1" fill="currentColor"/>` +
        `<circle cx="15" cy="14" r="1" fill="currentColor"/>` +
        `<circle cx="10" cy="15" r="1" fill="currentColor"/>`,
    orange:
        // citrus circle with segment lines
        `<circle cx="12" cy="12" r="8" ${_BASE_ATTRS}/>` +
        `<line x1="12" y1="4" x2="12" y2="20" ${_BASE_ATTRS}/>` +
        `<line x1="4" y1="12" x2="20" y2="12" ${_BASE_ATTRS}/>` +
        `<line x1="6.3" y1="6.3" x2="17.7" y2="17.7" ${_BASE_ATTRS}/>` +
        `<line x1="17.7" y1="6.3" x2="6.3" y2="17.7" ${_BASE_ATTRS}/>`,
    banana:
        // crescent with tip stems
        `<path d="M5 7c2 8 8 12 14 11-1-2-4-3-6-6S8 6 5 7z" ${_BASE_ATTRS}/>` +
        `<line x1="5" y1="7" x2="4" y2="5" ${_BASE_ATTRS}/>` +
        `<line x1="19" y1="18" x2="20" y2="20" ${_BASE_ATTRS}/>`,
    grape:
        // cluster of small filled circles
        `<circle cx="12" cy="6" r="2" fill="currentColor"/>` +
        `<circle cx="9" cy="9" r="2" fill="currentColor"/>` +
        `<circle cx="15" cy="9" r="2" fill="currentColor"/>` +
        `<circle cx="7" cy="13" r="2" fill="currentColor"/>` +
        `<circle cx="12" cy="13" r="2" fill="currentColor"/>` +
        `<circle cx="17" cy="13" r="2" fill="currentColor"/>` +
        `<circle cx="10" cy="17" r="2" fill="currentColor"/>` +
        `<circle cx="14" cy="17" r="2" fill="currentColor"/>` +
        `<line x1="12" y1="4" x2="12" y2="2" ${_BASE_ATTRS}/>`,
    muffin:
        // wrapper base + dome top
        `<path d="M6 14h12v2c0 2-2 4-6 4s-6-2-6-4v-2z" ${_BASE_ATTRS}/>` +
        `<path d="M5 14c0-4 3-7 7-7s7 3 7 7" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="16" x2="9" y2="20" ${_BASE_ATTRS}/>` +
        `<line x1="15" y1="16" x2="15" y2="20" ${_BASE_ATTRS}/>`,
    cherry:
        // two small circles + curved stems
        `<circle cx="9" cy="17" r="3" ${_BASE_ATTRS}/>` +
        `<circle cx="16" cy="16" r="3" ${_BASE_ATTRS}/>` +
        `<path d="M9 14c0-4 2-8 6-9" ${_BASE_ATTRS}/>` +
        `<path d="M16 13c0-3 2-6 4-7" ${_BASE_ATTRS}/>`,
    pencil:
        // long body with point + eraser
        `<path d="M5 19l3 1 12-12-4-4L4 16l1 3z" ${_BASE_ATTRS}/>` +
        `<line x1="14" y1="6" x2="18" y2="10" ${_BASE_ATTRS}/>` +
        `<path d="M16 4l4 4-2 2-4-4z" fill="currentColor" stroke="currentColor" stroke-linejoin="round"/>`,
    book:
        // rectangle with spine + page lines
        `<rect x="5" y="5" width="14" height="14" rx="1" ${_BASE_ATTRS}/>` +
        `<line x1="12" y1="5" x2="12" y2="19" ${_BASE_ATTRS}/>` +
        `<line x1="7" y1="9" x2="10" y2="9" ${_BASE_ATTRS}/>` +
        `<line x1="14" y1="9" x2="17" y2="9" ${_BASE_ATTRS}/>` +
        `<line x1="7" y1="13" x2="10" y2="13" ${_BASE_ATTRS}/>` +
        `<line x1="14" y1="13" x2="17" y2="13" ${_BASE_ATTRS}/>`,
    marker:
        // capped marker barrel
        `<rect x="6" y="4" width="6" height="4" rx="1" fill="currentColor" stroke="currentColor"/>` +
        `<rect x="5" y="8" width="8" height="12" rx="1" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="12" x2="9" y2="16" ${_BASE_ATTRS}/>` +
        `<line x1="13" y1="13" x2="20" y2="13" ${_BASE_ATTRS}/>`,
    eraser:
        // rounded rectangle with two color bands
        `<rect x="4" y="9" width="16" height="8" rx="2" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="9" x2="9" y2="17" ${_BASE_ATTRS}/>` +
        `<rect x="4" y="9" width="5" height="8" rx="2" fill="currentColor" stroke="currentColor"/>`,
    notebook:
        // spiral-bound rectangle
        `<rect x="6" y="4" width="13" height="16" rx="1" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="3" x2="9" y2="6" ${_BASE_ATTRS}/>` +
        `<line x1="12" y1="3" x2="12" y2="6" ${_BASE_ATTRS}/>` +
        `<line x1="15" y1="3" x2="15" y2="6" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="10" x2="16" y2="10" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="14" x2="16" y2="14" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="17" x2="14" y2="17" ${_BASE_ATTRS}/>`,
    crayon:
        // pointed cylinder with paper wrap
        `<polygon points="9,3 15,3 15,9 12,5 9,9" fill="currentColor" stroke="currentColor" stroke-linejoin="round"/>` +
        `<rect x="9" y="9" width="6" height="11" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="13" x2="15" y2="13" ${_BASE_ATTRS}/>` +
        `<line x1="9" y1="16" x2="15" y2="16" ${_BASE_ATTRS}/>`,
    sticker:
        // notched (sunburst) star outline
        `<path d="M12 3l2 3 3-1-1 3 3 2-3 2 1 3-3-1-2 3-2-3-3 1 1-3-3-2 3-2-1-3 3 1z" ${_BASE_ATTRS}/>` +
        `<circle cx="12" cy="12" r="2" ${_BASE_ATTRS}/>`,
    marble:
        // circle with highlight crescent
        `<circle cx="12" cy="12" r="8" ${_BASE_ATTRS}/>` +
        `<path d="M8 9c0-2 2-4 4-4" ${_BASE_ATTRS}/>` +
        `<circle cx="9" cy="9" r="1" fill="currentColor"/>`,
    card:
        // playing-card rectangle with center suit dot
        `<rect x="6" y="3" width="12" height="18" rx="2" ${_BASE_ATTRS}/>` +
        `<text x="9" y="8" font-size="4" fill="currentColor" text-anchor="middle" font-family="serif">A</text>` +
        `<circle cx="12" cy="13" r="2" fill="currentColor"/>` +
        `<text x="15" y="20" font-size="4" fill="currentColor" text-anchor="middle" font-family="serif">A</text>`,
    coin:
        // disc with concentric ring + $ inside
        `<circle cx="12" cy="12" r="9" ${_BASE_ATTRS}/>` +
        `<circle cx="12" cy="12" r="6.5" ${_BASE_ATTRS}/>` +
        `<text x="12" y="15" font-size="7" font-weight="700" fill="currentColor" text-anchor="middle" font-family="sans-serif">$</text>`,
    ball:
        // basketball/soccer style — circle with curved seam
        `<circle cx="12" cy="12" r="8" ${_BASE_ATTRS}/>` +
        `<path d="M4 12c4-2 12-2 16 0" ${_BASE_ATTRS}/>` +
        `<path d="M12 4c-2 4-2 12 0 16" ${_BASE_ATTRS}/>`,
    star:
        // 5-point star
        `<polygon points="12,3 14.5,9.5 21.5,9.5 16,13.5 18.5,20 12,16 5.5,20 8,13.5 2.5,9.5 9.5,9.5" ${_BASE_ATTRS}/>`,
    balloon:
        // oval with knot tail
        `<ellipse cx="12" cy="9" rx="5" ry="6" ${_BASE_ATTRS}/>` +
        `<polygon points="11,15 13,15 12,17" fill="currentColor"/>` +
        `<path d="M12 17c-1 1 1 2 0 3" ${_BASE_ATTRS}/>`,
    tree:
        // triangle stack on small trunk
        `<polygon points="12,3 6,11 18,11" ${_BASE_ATTRS}/>` +
        `<polygon points="12,8 5,16 19,16" ${_BASE_ATTRS}/>` +
        `<rect x="10.5" y="16" width="3" height="4" ${_BASE_ATTRS}/>`,
    leaf:
        // simple leaf with center vein
        `<path d="M5 19c0-8 6-14 14-14-1 8-6 13-14 14z" ${_BASE_ATTRS}/>` +
        `<line x1="5" y1="19" x2="16" y2="8" ${_BASE_ATTRS}/>`,
    flower:
        // 5-petal flower with center
        `<circle cx="12" cy="6" r="2.5" ${_BASE_ATTRS}/>` +
        `<circle cx="6.5" cy="10" r="2.5" ${_BASE_ATTRS}/>` +
        `<circle cx="17.5" cy="10" r="2.5" ${_BASE_ATTRS}/>` +
        `<circle cx="9" cy="16" r="2.5" ${_BASE_ATTRS}/>` +
        `<circle cx="15" cy="16" r="2.5" ${_BASE_ATTRS}/>` +
        `<circle cx="12" cy="12" r="2" fill="currentColor"/>`,
    seed:
        // small oval
        `<ellipse cx="12" cy="12" rx="3" ry="6" ${_BASE_ATTRS}/>` +
        `<line x1="12" y1="9" x2="12" y2="15" ${_BASE_ATTRS}/>`,
    butterfly:
        // symmetric wing pair + body
        `<path d="M12 6c-3-3-7-2-7 2s3 6 7 6" ${_BASE_ATTRS}/>` +
        `<path d="M12 6c3-3 7-2 7 2s-3 6-7 6" ${_BASE_ATTRS}/>` +
        `<path d="M12 14c-3 0-6 1-6 4 0 1 2 1 6-2" ${_BASE_ATTRS}/>` +
        `<path d="M12 14c3 0 6 1 6 4 0 1-2 1-6-2" ${_BASE_ATTRS}/>` +
        `<line x1="12" y1="6" x2="12" y2="18" ${_BASE_ATTRS}/>`,
    note:
        // eighth-note symbol
        `<ellipse cx="9" cy="17" rx="3" ry="2" fill="currentColor"/>` +
        `<line x1="12" y1="17" x2="12" y2="5" ${_BASE_ATTRS}/>` +
        `<path d="M12 5c4 1 6 4 5 7" ${_BASE_ATTRS}/>`,
    photo:
        // framed photo with mountain + sun
        `<rect x="4" y="6" width="16" height="13" rx="1" ${_BASE_ATTRS}/>` +
        `<circle cx="8" cy="10" r="1.5" ${_BASE_ATTRS}/>` +
        `<polyline points="4,17 9,13 13,16 20,10" ${_BASE_ATTRS}/>`,
    video:
        // play triangle in rounded square
        `<rect x="4" y="6" width="16" height="13" rx="2" ${_BASE_ATTRS}/>` +
        `<polygon points="10,10 16,12.5 10,15" fill="currentColor"/>`,
};

// ---------------------------------------------------------------
// Alias map: alternate names (singular + plural) → canonical icon name.
// ---------------------------------------------------------------
const _ALIASES = {
    apple: 'apple', apples: 'apple',
    cookie: 'cookie', cookies: 'cookie',
    orange: 'orange', oranges: 'orange',
    banana: 'banana', bananas: 'banana',
    grape: 'grape', grapes: 'grape',
    muffin: 'muffin', muffins: 'muffin',
    cherry: 'cherry', cherries: 'cherry',
    pencil: 'pencil', pencils: 'pencil',
    book: 'book', books: 'book',
    marker: 'marker', markers: 'marker',
    eraser: 'eraser', erasers: 'eraser',
    notebook: 'notebook', notebooks: 'notebook',
    crayon: 'crayon', crayons: 'crayon',
    sticker: 'sticker', stickers: 'sticker',
    marble: 'marble', marbles: 'marble',
    card: 'card', cards: 'card',
    coin: 'coin', coins: 'coin',
    ball: 'ball', balls: 'ball',
    star: 'star', stars: 'star',
    balloon: 'balloon', balloons: 'balloon',
    tree: 'tree', trees: 'tree',
    leaf: 'leaf', leaves: 'leaf',
    flower: 'flower', flowers: 'flower',
    seed: 'seed', seeds: 'seed',
    butterfly: 'butterfly', butterflies: 'butterfly',
    note: 'note', notes: 'note',
    photo: 'photo', photos: 'photo',
    video: 'video', videos: 'video',
    // Legacy aliases that the old BW_ICONS table supported. Map them onto
    // the closest distinct illustration so callers using "presents",
    // "tickets", "blocks", "pages" continue to render.
    present: 'sticker', presents: 'sticker',
    ticket: 'card', tickets: 'card',
    block: 'book', blocks: 'book',
    page: 'notebook', pages: 'notebook',
};

// ---------------------------------------------------------------
// Fallback: generic "thing" circle with first letter of the name.
// ---------------------------------------------------------------
function _fallbackMarkup(name) {
    const letter = (typeof name === 'string' && name.length > 0)
        ? name.charAt(0).toUpperCase()
        : '?';
    return `<circle cx="12" cy="12" r="9" ${_BASE_ATTRS}/>` +
        `<text x="12" y="16" font-size="11" font-weight="700" fill="currentColor" text-anchor="middle" font-family="sans-serif">${letter}</text>`;
}

// ---------------------------------------------------------------
// Public: getWordProblemIcon(name, size = 24, color = 'currentColor')
// Returns an inline SVG markup string for the named item.
// ---------------------------------------------------------------
export function getWordProblemIcon(name, size = 24, color = 'currentColor') {
    const lookupName = (typeof name === 'string' ? name : '').toLowerCase().trim();
    const canonical = _ALIASES[lookupName] || lookupName;
    const inner = _ICON_MARKUP[canonical] || _fallbackMarkup(name);
    // Wrap with sized SVG. role="img" + <title> for screen-reader users.
    const titleId = `wpi-${Math.random().toString(36).slice(2, 9)}`;
    const labelText = canonical && _ICON_MARKUP[canonical] ? canonical : (lookupName || 'item');
    return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${titleId}" ` +
        `viewBox="0 0 24 24" width="${size}" height="${size}" ` +
        `style="display:inline-block;vertical-align:middle;color:${color};">` +
        `<title id="${titleId}">${labelText}</title>${inner}</svg>`;
}

export default getWordProblemIcon;
