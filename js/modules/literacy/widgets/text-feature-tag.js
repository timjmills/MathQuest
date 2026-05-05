// text-feature-tag.js — Tap a marked-up text feature region inside a mock article.
//
// The widget renders a small diagram-style passage where named text features
// (heading, caption, sidebar, bold word, glossary entry, etc.) are visible and
// tappable. The student answers "Which text feature shows X?" by tapping the
// region itself rather than picking from a label list — closer to tap-hotspot
// than mc-text, but the hotspots are CSS-classed regions inside a rich layout.
//
// Question contract:
//   q.stem:         string  — instruction (e.g., "Which text feature tells you what a word means?")
//   q.passage_html: string  — rich HTML for the mock article (regions carry .lq-tf-<id> classes)
//   q.features:     [{ id, label, region_class }]
//   q.correct_id:   string  — the feature.id that answers q.stem
//   q.k2_appropriate?: boolean
//   q.has_audio?:   boolean
//
// Interaction:
//   1. Student taps a region (or its label legend chip) — that feature.id becomes selected.
//   2. Student presses Submit. Correct iff selected_id === q.correct_id.
//   3. On wrong, the wrong region paints red (persistent), retry stays open.
//   4. On correct, the region paints green/locked and Submit disables.
//
// Exports:
//   renderTextFeatureTag(q, container)
//   checkTextFeatureTag(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _safeSpeak(text) {
    if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(text);
    }
}

export function renderTextFeatureTag(q, container) {
    if (!container || !q) return;

    const features = Array.isArray(q.features) ? q.features : [];
    const stem = q.stem || 'Which text feature answers the question?';
    const passageHtml = q.passage_html || '';
    const isK2 = !!q.k2_appropriate;

    const legendHtml = features.map(f => `
        <button type="button"
            class="lq-tf-legend-chip"
            data-id="${_esc(f.id)}"
            aria-label="Highlight ${_esc(f.label)}">
            <span class="lq-tf-legend-swatch lq-tf-legend-swatch--${_esc(f.id)}"></span>
            <span class="lq-tf-legend-label">${_esc(f.label)}</span>
        </button>`).join('');

    container.innerHTML = `
        <div class="lq-tf-host${isK2 ? ' lq-k2' : ''}" role="application"
            aria-label="Tap the text feature that answers the question">
            <p class="lq-tf-stem">${_esc(stem)}</p>
            <div class="lq-tf-passage-wrap">
                <div class="lq-tf-passage">${passageHtml}</div>
            </div>
            ${features.length ? `<div class="lq-tf-legend" role="group"
                aria-label="Text feature legend">${legendHtml}</div>` : ''}
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-tf-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-tf-host');
    const passage = host.querySelector('.lq-tf-passage');
    const submitBtn = host.querySelector('.lq-tf-submit');
    const feedbackZone = host.querySelector('.lq-feedback-zone');

    // Wire up region tappability — every feature has a CSS class on at least
    // one element inside passage_html. We make those elements role=button.
    const featureMap = {};
    features.forEach(f => { featureMap[f.id] = f; });

    let selectedId = null;
    let locked = false;

    function regionEls(featureId) {
        const f = featureMap[featureId];
        if (!f || !f.region_class) return [];
        return Array.from(passage.querySelectorAll('.' + f.region_class));
    }

    function allRegionEls() {
        const sels = features.map(f => '.' + f.region_class).filter(Boolean);
        if (!sels.length) return [];
        return Array.from(passage.querySelectorAll(sels.join(', ')));
    }

    // Initial setup — make every region tappable
    features.forEach(f => {
        regionEls(f.id).forEach(el => {
            el.classList.add('lq-tf-region');
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('data-feature-id', f.id);
            el.setAttribute('aria-label', f.label || f.id);
            el.setAttribute('aria-pressed', 'false');
        });
    });

    function clearSelection() {
        allRegionEls().forEach(el => {
            if (el.dataset.locked === '1') return;
            el.classList.remove('lq-tf-selected');
            el.setAttribute('aria-pressed', 'false');
        });
        host.querySelectorAll('.lq-tf-legend-chip').forEach(c => {
            c.classList.remove('lq-tf-legend-chip--active');
        });
    }

    function selectFeature(featureId) {
        if (locked) return;
        if (!featureMap[featureId]) return;
        clearSelection();
        selectedId = featureId;
        regionEls(featureId).forEach(el => {
            if (el.dataset.locked === '1') return;
            el.classList.add('lq-tf-selected');
            el.classList.remove('lq-tf-wrong-persistent');
            el.setAttribute('aria-pressed', 'true');
        });
        const chip = host.querySelector(`.lq-tf-legend-chip[data-id="${CSS.escape(featureId)}"]`);
        if (chip) chip.classList.add('lq-tf-legend-chip--active');
        submitBtn.disabled = false;
        const f = featureMap[featureId];
        if (f && f.label) _safeSpeak(f.label);
    }

    host.addEventListener('click', e => {
        if (locked) return;
        const chip = e.target.closest('.lq-tf-legend-chip');
        if (chip) { selectFeature(chip.dataset.id); return; }
        const region = e.target.closest('.lq-tf-region');
        if (region && passage.contains(region)) {
            selectFeature(region.dataset.featureId);
        }
    });

    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const chip = e.target.closest('.lq-tf-legend-chip');
        const region = e.target.closest('.lq-tf-region');
        if (chip || region) {
            e.preventDefault();
            const id = chip ? chip.dataset.id : region.dataset.featureId;
            selectFeature(id);
        }
    });

    if ((isK2 || (state && state.ttsEnabled)) && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;
        if (!selectedId) return;

        const isCorrect = selectedId === q.correct_id;
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(isCorrect);

        if (isCorrect) {
            regionEls(selectedId).forEach(el => {
                el.classList.remove('lq-tf-selected', 'lq-tf-wrong-persistent');
                el.classList.add('lq-tf-locked-correct');
                el.dataset.locked = '1';
            });
            allRegionEls().forEach(el => {
                if (el.dataset.locked !== '1') el.setAttribute('tabindex', '-1');
            });
            host.querySelectorAll('.lq-tf-legend-chip').forEach(c => { c.disabled = true; });
            feedbackZone.textContent = 'Correct!';
            submitBtn.disabled = true;
            locked = true;
        } else {
            regionEls(selectedId).forEach(el => {
                el.classList.remove('lq-tf-selected');
                el.classList.add('lq-tf-wrong-persistent');
                el.setAttribute('aria-pressed', 'false');
            });
            const chip = host.querySelector(`.lq-tf-legend-chip[data-id="${CSS.escape(selectedId)}"]`);
            if (chip) chip.classList.remove('lq-tf-legend-chip--active');
            feedbackZone.textContent = 'Not quite — try another text feature!';
            selectedId = null;
            submitBtn.disabled = true;
        }

        container._lqLastResult = { correct: isCorrect, submitted: selectedId, firstAttempt };
    });
}

export function checkTextFeatureTag(q, container) {
    if (!container) return { correct: false, submitted: null };
    if (container._lqLastResult) return container._lqLastResult;
    const host = container.querySelector('.lq-tf-host');
    if (!host) return { correct: false, submitted: null };
    const sel = host.querySelector('.lq-tf-region.lq-tf-selected, .lq-tf-region.lq-tf-locked-correct');
    const submitted = sel ? sel.dataset.featureId : null;
    return { correct: submitted != null && submitted === q.correct_id, submitted };
}
