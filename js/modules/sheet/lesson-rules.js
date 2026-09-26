// js/modules/sheet/lesson-rules.js
// THE LESSON RULES the engine enforces and the lesson gate checks (design/LESSON_RULES.md). Every
// rule here was taught by a critic round (lessons r1-r4): what an item's case is, when two items
// are the same item (a turnaround included) or near twins, and the packet-wide check that the
// host runs on every lesson it builds (`lesson.check` on buildSheet's result) and that
// tests/scripts/ws-lesson-check.cjs fails on.
//
// Items are PLAIN here ({part, skill, text, ans, ops, kind, n, place}), so the host, the gate
// and a unit test all read the same rules. Pure module (SCC-01): no window, no DOM, no state.

/* ================================================================================ items */

const plain = (t) => String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * An item's identity across a packet (LR-5): two items are the same item when this key is the
 * same. A sum or product is the same numbers turned round (1 + 9 = 9 + 1); anything else is its
 * words and its answer (a count of 6 squares twice is a repeat, a different count is not).
 */
export function itemKey(text, ans, n) {
    const t = plain(text);
    const m = /^(\d+)\s*([+×x*])\s*(\d+)\s*=\s*\?$/.exec(t);
    if (m) {
        const [a, b] = [Number(m[1]), Number(m[3])].sort((x, y) => x - y);
        return `${m[2] === '+' ? '+' : '×'}${a},${b}`;
    }
    // (`n`: the number a place-value or rounding item is about - "Which place is the underlined
    // one?" is a different item for 78 and for 42.)
    return `${t}|${ans !== null && typeof ans === 'object' ? JSON.stringify(ans) : String(ans ?? '')}|${n ?? ''}`;
}

/** The operation of a plain item: '+', '-', 'round' or ''. */
export function opOfItem(it) {
    const t = plain(it && it.text);
    if (it && it.kind === 'round') return 'round';
    if (/^\d+\s*[−-]\s*\d+\s*=/.test(t)) return '-';
    if (/^\d+\s*\+\s*\d+\s*=/.test(t)) return '+';
    return '';
}

/** Two subtractions a pupil would do the same way (51 - 44 and 53 - 45; 27 - 19 and 77 - 19): LR-6. */
export function nearTwins(x, y) {
    const [a1, b1] = x, [a2, b2] = y;
    if (b1 === b2) return true;                                       // the same number taken away
    return Math.abs(a1 - a2) <= 3 && Math.abs(b1 - b2) <= 3;          // both numbers within 3
}

/* ================================================================================ cases */

/**
 * The CASES of a lesson family (LR-1): every item of the family is in one or more of them, and a
 * lesson declares the ones it teaches (`cases` in lessons/prereqs.js). The chart draws an example
 * of every declared case, and the packet deals no item of an undeclared case.
 */
export const CASE_FAMILIES = Object.freeze({
    '+': {
        bigFirst: (a, b) => a > b,
        bigSecond: (a, b) => a < b,
        double: (a, b) => a === b,
    },
    '-': {
        twoPlace: (a, b) => b >= 10,
        onePlace: (a, b) => b < 10,
        zeroOnes: (a) => a % 10 === 0,
        underTen: (a, b) => a - b < 10,
        threePlace: (a) => a >= 100,
    },
    round: {
        roundUp: (n, P) => Math.floor(((n % P) * 10) / P) > 5,
        roundDown: (n, P) => { const r = Math.floor(((n % P) * 10) / P); return r >= 1 && r <= 4; },
        endsFive: (n, P) => Math.floor(((n % P) * 10) / P) === 5,
        toHundred: (n, P) => P === 10 && n >= 95 && n <= 99,
        alreadyTen: (n, P) => n % P === 0,
    },
});

/** The cases a plain item is in (its family's names), or [] for an item of no family. */
export function casesOf(it) {
    const op = opOfItem(it);
    const fam = CASE_FAMILIES[op];
    if (!fam) return [];
    if (op === 'round') {
        const n = Number(it.n), P = Number(it.place) || 10;
        if (!Number.isFinite(n)) return [];
        return Object.keys(fam).filter((k) => fam[k](n, P));
    }
    const ops = (it.ops || []).map(Number);
    if (ops.length < 2) return [];
    return Object.keys(fam).filter((k) => fam[k](ops[0], ops[1]));
}

/* ======================================================================= the packet check */

/**
 * The rules one built lesson packet must keep (LR-1 ... LR-9), from its placed items. Returns
 * [{rule, msg}] - empty when the packet keeps every rule.
 *
 * @param {Object} o
 * @param {{skill, cases?, caps?}} o.lesson      the lesson skill key and its declared cases / caps
 * @param {Array} o.placed                        every placed item of the packet, chart examples
 *                                                included ({part: 'chart'|'teach'|'practice'|'mixed', ...})
 * @param {string[]} o.chartCases                 the declared cases the chart draws (from its examples)
 * @param {string} [o.sizePrinted] [o.packetSize]   LR-10
 */
export function packetViolations({ lesson, placed, chartCases = [], sizePrinted, packetSize }) {
    const out = [];
    const bad = (rule, msg) => out.push({ rule, msg });
    const declared = (lesson && Array.isArray(lesson.cases)) ? lesson.cases : null;
    const caps = (lesson && lesson.caps) || {};
    const own = (it) => it.skill === lesson.skill;
    // LR-1: the chart draws every declared case.
    if (declared) for (const c of declared) if (!chartCases.includes(c)) bad('LR-1', `the chart draws no ${c} example`);
    // LR-2: the packet deals only declared cases (the lesson skill's items).
    if (declared) {
        for (const it of placed.filter(own)) {
            const extra = casesOf(it).filter((c) => !declared.includes(c));
            if (extra.length) bad('LR-2', `${it.part}: ${plain(it.text)} is ${extra.join(', ')}, a case the lesson does not teach`);
        }
    }
    // LR-5: no item twice in the packet, turnarounds included (chart examples, Warm-up, Guided,
    // Independent, Practice, Mixed).
    // An exact repeat anywhere, or any repeat of a chart example (turned round too: its answer is
    // printed on the chart), or a turnaround on one page, fails; a turnaround on ANOTHER page is
    // reported `soft` - a small skill (add 1-3 within 10: 21 facts) cannot fill a packet without it.
    const exact = new Map();
    const pair = new Map();
    for (const it of placed) {
        const ek = `${plain(it.text)}|${String(it.ans ?? '')}|${it.n ?? ''}`;
        const pk = itemKey(it.text, it.ans, it.n);
        if (exact.has(ek)) bad('LR-5', `${plain(it.text)} is on ${exact.get(ek)} and ${it.part}`);
        else if (pair.has(pk)) {
            const first = pair.get(pk);
            if (first === 'chart' || first === it.part) bad('LR-5', `${plain(it.text)} turns round an item on ${first} (${it.part})`);
            else out.push({ rule: 'LR-5', soft: true, msg: `${plain(it.text)} turns round an item on ${first} (${it.part})` });
        }
        if (!exact.has(ek)) exact.set(ek, it.part);
        if (!pair.has(pk)) pair.set(pk, it.part);
    }
    // LR-6 / LR-7: per page, no near twins or repeated number taken away; the caps on rare cases.
    const pages = new Map();
    for (const it of placed.filter((x) => own(x) && x.part !== 'chart')) {
        const k = `${it.part}${it.page ? `#${it.page}` : ''}`;
        if (!pages.has(k)) pages.set(k, []);
        pages.get(k).push(it);
    }
    for (const [pg, its] of pages) {
        const subs = its.filter((it) => opOfItem(it) === '-' && (it.ops || []).length >= 2).map((it) => ({ it, o: it.ops.map(Number) }));
        for (let i = 0; i < subs.length; i++) for (let j = i + 1; j < subs.length; j++) {
            if (nearTwins(subs[i].o, subs[j].o)) bad('LR-6', `${pg}: ${plain(subs[i].it.text)} and ${plain(subs[j].it.text)} are near twins`);
        }
        const ans = subs.map((s) => s.o[0] - s.o[1]);
        if (new Set(ans).size < ans.length) bad('LR-6', `${pg}: two answers alike`);
        for (const [c, max] of Object.entries(caps)) {
            const n = its.filter((it) => casesOf(it).includes(c)).length;
            if (n > max) bad('LR-7', `${pg}: ${n} ${c} items (at most ${max} a page)`);
        }
    }
    // LR-8: Mixed - the lesson skill fills at least half the page.
    const mixed = placed.filter((it) => it.part === 'mixed');
    if (mixed.length && mixed.filter(own).length * 2 < mixed.length) bad('LR-8', `mixed: the lesson skill holds ${mixed.filter(own).length} of ${mixed.length}`);
    // LR-10: the packet prints at its one designed size, whatever size was asked.
    if (packetSize && sizePrinted !== packetSize) bad('LR-10', `the packet printed at ${sizePrinted}, not its size ${packetSize}`);
    return out;
}

export default { itemKey, opOfItem, nearTwins, CASE_FAMILIES, casesOf, packetViolations };
