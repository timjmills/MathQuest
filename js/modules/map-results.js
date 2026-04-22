// MAP Test Practice — results report and Ready-to-Learn (Phase 3 implementation).

import { state } from './state.js';
import { showView } from './navigation.js';

const DOMAINS_ORDER = ['OA', 'NO', 'MD', 'G'];
const DOMAIN_LABELS = {
    OA: 'Operations & Algebra',
    NO: 'Number & Operations',
    MD: 'Measurement & Data',
    G: 'Geometry',
};

function escapeHTML(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function renderMapResults() {
    const r = state.lastMapResult;

    const ritEl = document.getElementById('mapFinalRit');
    const seEl = document.getElementById('mapFinalSE');
    const perDom = document.getElementById('mapPerDomain');
    const rtl = document.getElementById('mapReadyToLearn');

    if (!r) {
        if (ritEl) ritEl.textContent = '--';
        if (seEl) seEl.textContent = '± --';
        if (perDom) perDom.innerHTML = '';
        if (rtl) rtl.innerHTML = '';
        return;
    }

    if (ritEl) ritEl.textContent = String(r.finalRit);
    if (seEl) seEl.textContent = `± ${r.se}`;

    if (perDom) {
        perDom.innerHTML = DOMAINS_ORDER.map(d => {
            const p = r.perDomain[d];
            if (!p) {
                return `<div class="rit-domain-card">
                    <div class="dname">${escapeHTML(DOMAIN_LABELS[d])}</div>
                    <div class="drit">—</div>
                    <div class="dsub">No items</div>
                </div>`;
            }
            return `<div class="rit-domain-card">
                <div class="dname">${escapeHTML(DOMAIN_LABELS[d])}</div>
                <div class="drit">${p.rit}</div>
                <div class="dsub">${p.correct}/${p.items} correct</div>
            </div>`;
        }).join('');
    }

    // Ready-to-Learn placeholder (Phase 8 will populate skill cards)
    if (rtl) {
        rtl.innerHTML = `
            <div class="ready-col reinforce">
                <h4>Reinforce</h4>
                <div>Skills below your band — for review.</div>
            </div>
            <div class="ready-col develop">
                <h4>Develop</h4>
                <div>Your sweet spot — keep practicing.</div>
            </div>
            <div class="ready-col introduce">
                <h4>Introduce</h4>
                <div>Stretch goals for next time.</div>
            </div>
        `;
    }
}

export function printMapSession() {
    const r = state.lastMapResult;
    if (!r || !r.history || !r.history.length) {
        alert('No MAP session results to print.');
        return;
    }
    // Stub for now — Phase 8 will wire to printMapSessionAsWorksheet
    alert(`Print-as-worksheet coming soon. (Session: ${r.items} items, RIT ${r.finalRit})`);
}

export function restartMapSession() {
    showView('mapSelectorView');
}
