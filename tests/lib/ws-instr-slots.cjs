// The INSTR-SLOTS rules (lane lf-algebra after patterns critic r3, R3-1 / R3-2 / R3-3 / R3-6 / R3-7; lead ruling 2026-11-20: a
// GENERAL check, every lane inherits it through ws-precritic). One class: a page's instruction and Steps must match its slots.
//
// instrSlotsInPage(html) runs IN THE BROWSER (page.evaluate): it parses a pupil page's HTML and returns its findings.
//
// THE VOCABULARY (keep it small; WORKSHEET_DESIGN_STANDARD section 6 owns the slot shapes):
//   slot kind     data-ws-shape values                                  verbs that NAME it (a verb at the start of a sentence,
//                                                                        or after "then" / "and" / a comma)
//   write         line box box-unknown boxes fraction mixed time unit    Write, Fill (in); COVERED also by the task verbs a slot
//                 unit-open open stacked across cell circle ring ...     of numbers answers: Solve, Answer, Find, Work out, Add,
//                 (every shape not below)                               Subtract, Multiply, Divide, Count, Complete, Finish,
//                                                                        Continue, Extend, Record, Label, Round, Order, Compare
//   check         check                                                 Tick, Check the / a / one / each / every / all / yes /
//                                                                        no / true / false / box / sentence / statement
//   choice        choice                                                Circle, Ring, Underline, Choose
//   draw          draw                                                  Draw, Shade, Colour / Color, Join, Match, Plot, Mark
// Rules (each finding names its page and its unit: a band with slots, or the page outside bands):
//   KIND-UNNAMED   an empty slot kind in the unit that no verb of the unit's instruction / Steps covers
//                  ("Read the pattern. Check the sentence that is true." over blank number tiles, R3-3)
//   VERB-ABSENT    a slot verb (Write / Circle / Tick-Check / Draw) in the instruction or Steps whose kind no slot on the page
//                  has ("Circle one." over tick boxes R3-1; Steps "Write the numbers." over printed tiles R3-2)
//   SCREEN-VERB    a screen-only verb (Drag, Drop, Tap, Type, Click, Select, Press, Swipe) printed on paper (R3-6, H7)
//   ONE-PLACE      a legacy cell with two or more answer places among: the kit's stamped Answer line, ".slot" boxes, "?"
//                  boxes, its own "Answer:" line, "____" blanks (R3-6, VQ-2 one answer place per answer)
//   SLOT-NAME      a cell names its slots ("Term 4", "Term 10 has [ ]") and the instruction names some of them but not all
//                  ("Draw Term 4. Write how many it has." over a Term 10 slot, R3-7)
// Instruction texts: .ws-instrline, [data-ws-instruction], a band strip's span (not Say:, Rule:, the quad score), Steps
// (.ws-steps li, .mq-lstrip li), anchor-chart step heads (.mq-chead), legacy prompts (.p-prompt). A filled slot (a model,
// a chart panel) counts as present for VERB-ABSENT but needs no verb. The footer (data-ws-teacher) is never read.
'use strict';

function instrSlotsInPage(html) {
    const WRITE_COVER = /\b(write|fill|solve|answer|find|work out|add|subtract|multiply|divide|count|complete|finish|continue|extend|record|label|round|order|compare|make|show)\b/i;
    const CHECK_COVER = /\b(tick|check (?:the (?:box|true|false|sentence|statement|one|right|correct)|a box|one|yes|no|true|false|the boxes))\b/i;
    const CHOICE_COVER = /\b(circle|ring|underline|choose)\b/i;
    const DRAW_COVER = /\b(draw|shade|colou?r|join|match|plot|mark)\b/i;
    const lead = '(?:^|[.!?:;]\\s*|,\\s*|\\bthen\\s+|\\band\\s+)';
    const VERBS = {
        write: new RegExp(`${lead}(write|fill in|fill)\\b`, 'i'),
        choice: new RegExp(`${lead}(circle|ring)\\b`, 'i'),
        check: new RegExp(`${lead}(tick|check (?:the (?:box|true|false|sentence|statement|one|right|correct)|a box|one|yes|no|true|false|the boxes))\\b`, 'i'),
        draw: new RegExp(`${lead}(draw|shade|colou?r)\\b`, 'i'),
    };
    const SCREEN = /\b(drag|drop|tap|type|click|select|press|swipe)\b/i;
    const kindOf = (shape) => (shape === 'check' ? 'check' : shape === 'choice' ? 'choice' : shape === 'draw' ? 'draw' : 'write');
    const covers = (kind, t) => (kind === 'write' ? WRITE_COVER : kind === 'check' ? CHECK_COVER : kind === 'choice' ? CHOICE_COVER : DRAW_COVER).test(t);
    const root = document.createElement('div');
    root.innerHTML = String(html || '');
    root.querySelectorAll('style, script, [data-ws-teacher]').forEach((e) => e.remove());
    // text nodes joined with a space: a Steps number ("1") and its words ("Count.") are two elements, never "1Count."
    const txt = (e) => { if (!e || !e.nodeType) return String((e && e.textContent) || '').trim(); const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); const out = []; for (let n = w.nextNode(); n; n = w.nextNode()) out.push(n.textContent); return out.join(' ').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(); };
    const INSTR = '.ws-instrline, [data-ws-instruction], .ws-strip > span, .ws-steps li, .mq-lstrip li, .mq-chead, .p-prompt, [data-ws-prompt]';
    const isInstr = (e) => !e.closest('.ws-strip--say, .mq-cchant, .ws-sayframe') && !e.classList.contains('mq-quadscore')
        && !(e.parentElement && e.parentElement.classList.contains('ws-strip') && /^Rule:?$/i.test(txt(e.parentElement.querySelector('b') || { textContent: '' })));
    const findings = [];
    const pages = [...root.querySelectorAll('[data-ws-page]')];
    const units = pages.length ? pages : [root];
    units.forEach((page, pi) => {
        const pno = page.getAttribute && page.getAttribute('data-ws-page') || String(pi + 1);
        // (a Say: band's frame is said aloud, not a written answer place)
        const allSlots = [...page.querySelectorAll('[data-ws-shape]')].filter((s) => !s.closest('.ws-strip--say, [data-ws-band="say"], .ws-sayframe'));
        const filled = (s) => txt(s) !== '' || !!s.querySelector('svg circle, svg path');
        const instrs = [...page.querySelectorAll(INSTR)].filter(isInstr).filter((e) => !e.parentElement.closest(INSTR));
        const bandOf = (e) => { let b = e.closest('.ws-band'); while (b && !allSlots.some((s) => b.contains(s))) b = b.parentElement && b.parentElement.closest('.ws-band'); return b || null; };
        // units: each band with slots; the rest of the page
        const groups = new Map();
        const g = (b) => { if (!groups.has(b)) groups.set(b, { slots: [], texts: [] }); return groups.get(b); };
        for (const s of allSlots) g(bandOf(s)).slots.push(s);
        const wide = [];
        for (const e of instrs) { const b = bandOf(e); if (b && groups.has(b)) groups.get(b).texts.push(txt(e)); else wide.push(txt(e)); }
        // SCREEN-VERB: anything the pupil reads
        const seen = new Set();
        // (every block of text the pupil reads: a prompt "Drag the numbers <em>(by 20s)</em>" is one block, not its leaves)
        for (const el of page.querySelectorAll('div, p, li, span, b, em, td, th')) {
            if ([...el.children].some((c) => /^(DIV|P|LI|TD|TH)$/.test(c.tagName))) continue;
            const t = txt(el);
            const m = SCREEN.exec(t);
            if (m && !seen.has(t) && ![...seen].some((x) => x.includes(t) || t.includes(x))) { seen.add(t); findings.push({ rule: 'SCREEN-VERB', page: pno, msg: `"${t.slice(0, 80)}" prints the screen verb "${m[1]}" on paper (H7)` }); }
        }
        const pageKinds = new Set(allSlots.map((s) => kindOf(s.getAttribute('data-ws-shape'))));
        // VERB-ABSENT on the page-wide texts (Steps bands, a page instruction): judged against every slot on the page
        // (a page with no tagged slot - legacy cells only - is not judged here: there is nothing to read the verbs against)
        for (const t of allSlots.length ? wide : []) for (const [kind, re] of Object.entries(VERBS)) {
            const m = re.exec(t);
            if (m && !pageKinds.has(kind)) findings.push({ rule: 'VERB-ABSENT', page: pno, msg: `"${t.slice(0, 80)}" says "${m[1]}" but the page has no ${kind} slot (${[...pageKinds].join(', ') || 'none'})` });
        }
        for (const [band, u] of groups) {
            const where = band ? `band "${txt(band.querySelector('.ws-strip > b') || { textContent: '' }) || txt(band.querySelector('.ws-strip > span') || { textContent: '' }).slice(0, 30) || 'band'}"` : 'page';
            const own = u.texts;
            const all = own.concat(wide).join(' ');
            const kinds = new Set(u.slots.map((s) => kindOf(s.getAttribute('data-ws-shape'))));
            const empty = new Set(u.slots.filter((s) => !filled(s)).map((s) => kindOf(s.getAttribute('data-ws-shape'))));
            for (const k of empty) if (!covers(k, all)) findings.push({ rule: 'KIND-UNNAMED', page: pno, msg: `${where}: ${k} slot(s) (${[...new Set(u.slots.filter((s) => kindOf(s.getAttribute('data-ws-shape')) === k).map((s) => s.getAttribute('data-ws-shape')))].join(', ')}) but no instruction verb names them: "${all.slice(0, 120)}"` });
            for (const t of own) for (const [kind, re] of Object.entries(VERBS)) {
                const m = re.exec(t);
                if (m && !kinds.has(kind)) findings.push({ rule: 'VERB-ABSENT', page: pno, msg: `${where}: "${t.slice(0, 80)}" says "${m[1]}" but the band has no ${kind} slot (${[...kinds].join(', ')})` });
            }
            // SLOT-NAME: per cell, the label just before each empty slot
            const cells = new Set(u.slots.map((s) => s.closest('.ws-cell')).filter(Boolean));
            const named = all.match(/\b([A-Z][a-z]+) (\d+)\b/g) || [];
            for (const cell of cells) {
                const names = [];
                const walker = document.createTreeWalker(cell, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
                let last = '';
                for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                    if (n.nodeType === 3) { if (!n.parentElement.closest('[data-ws-shape]')) { const t = n.textContent.replace(/ /g, ' ').trim(); if (t) last = `${last} ${t}`.trim().slice(-40); } continue; }
                    if (n.hasAttribute('data-ws-shape') && !n.parentElement.closest('[data-ws-shape]')) {
                        const m = /\b([A-Z][a-z]+) (\d+)(?: has| is)?\s*:?$/.exec(last);
                        if (m && !filled(n)) names.push(`${m[1]} ${m[2]}`);
                        last = '';
                    }
                }
                for (const nm of [...new Set(names)]) {
                    const word = nm.split(' ')[0];
                    if (!named.some((x) => x.startsWith(`${word} `))) continue;   // the instruction names no "Term N": not judged
                    if (new RegExp(`\\b(each|every|all) ${word}s?\\b`, 'i').test(all)) continue;   // "Write how many each term has"
                    if (!named.includes(nm)) findings.push({ rule: 'SLOT-NAME', page: pno, msg: `${where}: a slot for "${nm}" that the instruction never names (it names ${[...new Set(named)].join(', ')}): "${all.slice(0, 100)}"` });
                }
            }
        }
        // ONE-PLACE: a legacy cell's own answer places beside the stamped Answer line
        for (const leg of page.querySelectorAll('.ws-legacy')) {
            const body = leg.cloneNode(true);
            const places = [];
            if (body.querySelector('.ws-legacy-answer')) places.push('the stamped Answer line');
            body.querySelectorAll('.ws-legacy-answer').forEach((e) => e.remove());
            if (body.querySelector('.slot, .slots')) places.push('numbered .slot boxes');
            if ([...body.querySelectorAll('span, div')].some((e) => !e.children.length && txt(e) === '?' && /border/.test(e.getAttribute('style') || ''))) places.push('"?" boxes');
            if (/Answer\s*:/i.test(txt(body))) places.push('its own "Answer:" line');
            if (/_{3,}/.test(txt(body))) places.push('"____" blanks');
            if (places.length > 1) findings.push({ rule: 'ONE-PLACE', page: pno, msg: `a legacy cell ("${txt(body).slice(0, 50)}") has ${places.join(' + ')}: ${places.length} answer places for one answer (VQ-2)` });
        }
    });
    return findings;
}

module.exports = { instrSlotsInPage };
