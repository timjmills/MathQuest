// search-notice.js — the "Showing results for ..." line under every skill search box (critic r2 P-A).
// When the search corrects a misspelt word ('tme' -> 'time'), the box says so, so a correction is never
// silent. One document-level listener covers every box; nothing in the boxes' own code changes.

import { searchCorrection, onSkillSearchReady } from './skill-finder.js';

// The skill search boxes (student, quick skills, mixed skills, print add-skills, Skills Navigator,
// Quiz builder, Teacher library, Teacher sets, run-one, print picker).
const BOXES = '#skillSearchInput, #quickSkillSearchInput, #mixedSkillSearchInput, #addSkillsSearchInput, #soSearchInput, ' +
    '#qbSearchInput, #tvlSearch, #tvSkillSearch, #tvRunOne, input[data-pick]';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** The notice element for a box, made on first use. It sits after the box's wrapper, so an absolutely
 *  positioned results dropdown inside the wrapper does not move. */
function noticeFor(input, make) {
    const id = `${input.id || 'mqPick' + (input.dataset.pick || '')}Fix`;
    let el = document.getElementById(id);
    if (!el && make) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'mq-search-fix';
        el.setAttribute('role', 'status');
        el.style.cssText = 'margin:4px 2px 0;font-size:0.9rem;line-height:1.3;color:var(--mq-ink, inherit);';
        (input.parentElement || input).insertAdjacentElement('afterend', el);
    }
    return el;
}

export function updateSearchNotice(input) {
    if (!input || !input.matches || !input.matches(BOXES)) return;
    const c = searchCorrection(input.value);
    const el = noticeFor(input, !!c);
    if (!el) return;
    if (!c) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    el.innerHTML = `Showing results for <strong>${esc(c.to)}</strong>`;
}

export function installSearchNotice() {
    if (typeof document === 'undefined' || installSearchNotice.done) return;
    installSearchNotice.done = true;
    document.addEventListener('input', (e) => { try { updateSearchNotice(e.target); } catch (err) { /* never break a search box */ } });
    onSkillSearchReady(() => { try { updateSearchNotice(document.activeElement); } catch (err) { /* ignore */ } });
}
