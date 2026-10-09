// search-notice.js — the "Showing results for ..." line under every skill search box (critic r2 P-A).
// When the search corrects a misspelt word ('tme' -> 'time'), the box says so, so a correction is never
// silent. One document-level listener covers every box; nothing in the boxes' own code changes.

import { searchCorrection, onSkillSearchReady } from './skill-finder.js';

// The skill search boxes (student, quick skills, mixed skills, print add-skills, Skills Navigator,
// Quiz builder, Teacher library, Teacher sets, run-one, print picker).
const BOXES = '#skillSearchInput, #quickSkillSearchInput, #mixedSkillSearchInput, #addSkillsSearchInput, #soSearchInput, ' +
    '#qbSearchInput, #tvlSearch, #tvSkillSearch, #tvRunOne, input[data-pick]';

// An overlay notice WRAPS rather than truncating: the corrected word is always readable in full, however narrow
// the box (critic r5 U-F: the Navigator box is 160 px at Chromebook size). No ellipsis, ever.
const NOTICE_CSS = 'position:absolute;z-index:30;margin:0;padding:1px 8px;border-radius:6px;white-space:normal;overflow-wrap:anywhere;' +
    'font-size:0.85rem;line-height:1.35;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.15);';

// A notice that is the first row of its box's results list (the student box, the print picker). It sticks to
// the top of the list while the list scrolls, and it is re-docked whenever the list is rebuilt (critic r5 U-D).
const ROW_CSS = 'position:sticky;top:0;z-index:2;display:block;margin:0;font-size:0.9rem;line-height:1.35;pointer-events:none;' +
    'white-space:normal;overflow-wrap:anywhere;max-width:none;box-shadow:none;border-radius:0;';
const ROW_STUDENT = 'padding:8px 15px;border-bottom:1px solid var(--accent-cyan);background:var(--bg-card);color:var(--text-bright);';
const ROW_PICK = 'padding:8px 12px;border-bottom:1px solid var(--tv-border);background:var(--tv-surface);color:var(--tv-text);font-size:14px;';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The notices made so far, by id: a list rebuild (innerHTML) detaches a docked notice, so it is kept here.
const MADE = new Map();

const noticeId = (input) => `${input.id || 'mqPick' + (input.dataset.pick || '')}Fix`;

/** The notice element for a box, made on first use. An overlay notice is absolutely positioned just under the
 *  box, inside the box's own positioned ancestor, so it never adds a flex item, never reflows a filter row and
 *  never narrows the box (critic r3 U-A). No ancestor's style is changed. */
function noticeFor(input, make) {
    const id = noticeId(input);
    let el = MADE.get(id) || document.getElementById(id);
    if (!el && make) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'mq-search-fix';
        el.setAttribute('role', 'status');
        el.style.cssText = NOTICE_CSS;
        (input.offsetParent || document.body).appendChild(el);
    }
    if (el) MADE.set(id, el);
    return el;
}

/** The results list a box's notice is the first row of, or null for an overlay box. */
function listFor(input) {
    if (input.id === 'skillSearchInput') return document.getElementById('skillSearchResults');
    if (input.dataset && input.dataset.pick !== undefined && input.dataset.pick !== '') return document.getElementById(`tvPickRes${input.dataset.pick}`);
    return null;
}

/** The box a results list belongs to (the list may outlive or be rebuilt apart from its box). */
function boxFor(list) {
    if (list.id === 'skillSearchResults') return document.getElementById('skillSearchInput');
    const m = list.id.match(/^tvPickRes(\d+)$/);
    return m ? document.querySelector(`input[data-pick="${m[1]}"]`) : null;
}

// Every rebuild of a watched list (typing, "+", refocus, the standards/WRM warm-up, any innerHTML write)
// puts the notice back as its first row.
const WATCHED = new WeakSet();
function watch(list) {
    if (!list || WATCHED.has(list) || typeof MutationObserver === 'undefined') return;
    WATCHED.add(list);
    new MutationObserver(() => {
        try {
            const box = boxFor(list);
            if (!box) return;
            const el = MADE.get(noticeId(box));
            if (el && !el.hidden && list.firstChild === el) return;
            updateSearchNotice(box);
        } catch (e) { /* never break a search box */ }
    }).observe(list, { childList: true });
}

/** The first non-transparent background behind the box, so the line reads as part of its card. */
function cardColours(input) {
    for (let n = input.parentElement; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        const bg = cs.backgroundColor;
        if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return { bg, fg: cs.color };
    }
    return { bg: '#fff', fg: '#111' };
}

function place(input, el) {
    const host = input.offsetParent || document.body;
    if (el.parentElement !== host) host.appendChild(el);
    const isBody = host === document.body;
    const hr = host.getBoundingClientRect(), r = input.getBoundingClientRect();
    el.style.left = `${r.left - (isBody ? 0 : hr.left) + (isBody ? window.scrollX : host.scrollLeft) - (isBody ? 0 : host.clientLeft)}px`;
    el.style.top = `${r.bottom - (isBody ? 0 : hr.top) + (isBody ? window.scrollY : host.scrollTop) - (isBody ? 0 : host.clientTop) + 2}px`;
    // as wide as the room to the right of the box's left edge (never less than the box): a long word runs past a
    // narrow box instead of being cut off, and wraps to a second line only when even that room runs out (U-F)
    const right = Math.min(isBody ? window.innerWidth : hr.right - host.clientLeft, document.documentElement.clientWidth || window.innerWidth);
    el.style.maxWidth = `${Math.max(120, r.width, right - r.left - 8)}px`;
    el.style.overflow = 'visible';
    el.style.textOverflow = 'clip';
    const c = cardColours(input);
    el.style.background = c.bg;
    el.style.color = c.fg;
}

export function updateSearchNotice(input) {
    if (!input || !input.matches || !input.matches(BOXES)) return;
    const c = searchCorrection(input.value);
    const list = listFor(input);
    if (list) watch(list);
    const el = noticeFor(input, !!c);
    if (!el) return;
    if (!c) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    const html = `Showing results for <strong>${esc(c.to)}</strong>`;
    if (el.innerHTML !== html) el.innerHTML = html;
    // the student box and the print picker: the line is the results list's first row, so the list never hides
    // it and it never sits on the list's border (critic r4 U-B, r5 U-D)
    if (list) {
        el.style.cssText = ROW_CSS + (list.id === 'skillSearchResults' ? ROW_STUDENT : ROW_PICK);
        if (list.firstChild !== el) list.insertBefore(el, list.firstChild);
        return;
    }
    if (el.style.position !== 'absolute') el.style.cssText = NOTICE_CSS;
    place(input, el);
    // the Sets picker reserves the line permanently in teacher.css, so the Level row never moves (critic r5 U-E)
}

export function installSearchNotice() {
    if (typeof document === 'undefined' || installSearchNotice.done) return;
    installSearchNotice.done = true;
    document.addEventListener('input', (e) => { try { updateSearchNotice(e.target); } catch (err) { /* never break a search box */ } });
    // refocusing a box re-applies its notice (the student box rebuilds its list on focus)
    document.addEventListener('focusin', (e) => { try { updateSearchNotice(e.target); } catch (err) { /* ignore */ } });
    try { watch(document.getElementById('skillSearchResults')); } catch (e) { /* no student box */ }
    // a notice whose box has left the screen (view change) goes with it
    document.addEventListener('click', () => setTimeout(() => {
        for (const el of document.querySelectorAll('.mq-search-fix')) {
            const box = document.getElementById(el.id.replace(/Fix$/, '')) || document.querySelector(`input[data-pick="${el.id.replace(/^mqPick|Fix$/g, '')}"]`);
            if (!box || !box.offsetParent) el.hidden = true;
        }
    }, 0));
    onSkillSearchReady(() => { try { updateSearchNotice(document.activeElement); } catch (err) { /* ignore */ } });
}
