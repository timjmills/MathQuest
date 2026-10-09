// search-notice.js — the "Showing results for ..." line under every skill search box (critic r2 P-A).
// When the search corrects a misspelt word ('tme' -> 'time'), the box says so, so a correction is never
// silent. One document-level listener covers every box; nothing in the boxes' own code changes.

import { searchCorrection, onSkillSearchReady } from './skill-finder.js';

// The skill search boxes (student, quick skills, mixed skills, print add-skills, Skills Navigator,
// Quiz builder, Teacher library, Teacher sets, run-one, print picker).
const BOXES = '#skillSearchInput, #quickSkillSearchInput, #mixedSkillSearchInput, #addSkillsSearchInput, #soSearchInput, ' +
    '#qbSearchInput, #tvlSearch, #tvSkillSearch, #tvRunOne, input[data-pick]';

const NOTICE_CSS = 'position:absolute;z-index:30;margin:0;padding:1px 8px;border-radius:6px;white-space:nowrap;' +
    'font-size:0.85rem;line-height:1.35;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.15);';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** The notice element for a box, made on first use. It is absolutely positioned just under the box,
 *  inside the box's own positioned ancestor, so it never adds a flex item, never reflows a filter row and
 *  never narrows the box (critic r3 U-A). No ancestor's style is changed. */
function noticeFor(input, make) {
    const id = `${input.id || 'mqPick' + (input.dataset.pick || '')}Fix`;
    let el = document.getElementById(id);
    if (!el && make) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'mq-search-fix';
        el.setAttribute('role', 'status');
        el.style.cssText = NOTICE_CSS;
        (input.offsetParent || document.body).appendChild(el);
    }
    return el;
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
    const host = el.parentElement;
    if (!host) return;
    if (el.parentElement !== (input.offsetParent || document.body)) (input.offsetParent || document.body).appendChild(el);
    const hr = el.parentElement.getBoundingClientRect(), r = input.getBoundingClientRect();
    const par = el.parentElement;
    const isBody = par === document.body;
    el.style.left = `${r.left - (isBody ? 0 : hr.left) + (isBody ? window.scrollX : par.scrollLeft) - (isBody ? 0 : par.clientLeft)}px`;
    el.style.top = `${r.bottom - (isBody ? 0 : hr.top) + (isBody ? window.scrollY : par.scrollTop) - (isBody ? 0 : par.clientTop) + 2}px`;
    el.style.maxWidth = `${Math.max(120, r.width)}px`;
    el.style.overflow = 'hidden';
    el.style.textOverflow = 'ellipsis';
    const c = cardColours(input);
    el.style.background = c.bg;
    el.style.color = c.fg;
}

export function updateSearchNotice(input) {
    if (!input || !input.matches || !input.matches(BOXES)) return;
    const c = searchCorrection(input.value);
    const el = noticeFor(input, !!c);
    if (!el) return;
    if (!c) {
        el.hidden = true; el.textContent = '';
        if (input.id === 'tvSkillSearch') input.parentElement.style.marginBottom = '';
        return;
    }
    el.hidden = false;
    el.innerHTML = `Showing results for <strong>${esc(c.to)}</strong>`;
    // the student box: the line is the results dropdown's first row, so the dropdown never hides it (critic r4 U-B)
    const drop = input.id === 'skillSearchInput' && document.getElementById('skillSearchResults');
    if (drop && getComputedStyle(drop).display !== 'none') {
        el.style.cssText = 'position:static;margin:0;padding:8px 15px;font-size:0.9rem;line-height:1.35;pointer-events:none;' +
            'border-bottom:1px solid var(--accent-cyan);background:var(--bg-card);color:var(--text-bright);white-space:normal;';
        drop.insertBefore(el, drop.firstChild);
        return;
    }
    if (drop) el.style.cssText = NOTICE_CSS + 'z-index:1001;';
    else if (el.style.position === 'static') el.style.cssText = NOTICE_CSS;
    place(input, el);
    // the Sets picker: reserve a line under the box so the notice never covers the Level label (critic r4 U-C)
    if (input.id === 'tvSkillSearch') input.parentElement.style.marginBottom = `${el.offsetHeight + 4}px`;
}

export function installSearchNotice() {
    if (typeof document === 'undefined' || installSearchNotice.done) return;
    installSearchNotice.done = true;
    document.addEventListener('input', (e) => { try { updateSearchNotice(e.target); } catch (err) { /* never break a search box */ } });
    // a notice whose box has left the screen (view change) goes with it
    document.addEventListener('click', () => setTimeout(() => {
        for (const el of document.querySelectorAll('.mq-search-fix')) {
            const box = document.getElementById(el.id.replace(/Fix$/, '')) || document.querySelector(`input[data-pick="${el.id.replace(/^mqPick|Fix$/g, '')}"]`);
            if (!box || !box.offsetParent) el.hidden = true;
        }
    }, 0));
    onSkillSearchReady(() => { try { updateSearchNotice(document.activeElement); } catch (err) { /* ignore */ } });
}
