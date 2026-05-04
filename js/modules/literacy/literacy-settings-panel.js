// literacy-settings-panel.js — Literacy Quest settings side panel.
//
// Renders a slide-in panel (from the right, matching settings-panel.js style)
// containing all 9 accessibility/scaffold settings.
//
// Exports:
//   renderLiteracySettingsPanel(container)
//   openLiteracySettings()
//   closeLiteracySettings()

import {
    getLiteracySettings,
    saveLiteracySettings,
    applyLiteracySettings,
    resetLiteracySettings,
} from './literacy-settings.js';

// ─── RIT band options keyed by grade ─────────────────────────────────────────

const RIT_BANDS_BY_GRADE = {
    K:   ['121-130', '131-140', '141-150', '151-160', '161-170'],
    '1': ['141-150', '151-160', '161-170', '171-180', '181-190'],
    '2': ['151-160', '161-170', '171-180', '181-190', '191-200'],
    '3': ['161-170', '171-180', '181-190', '191-200', '201-210'],
    '4': ['171-180', '181-190', '191-200', '201-210', '211-220'],
    '5': ['181-190', '191-200', '201-210', '211-220', '221-230'],
};

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function _toggle(id, checked, onchange) {
    const c = checked ? ' checked' : '';
    return `
        <label class="lq-sp-toggle-label" for="${id}">
          <input type="checkbox" id="${id}" class="lq-sp-toggle-input"${c}
                 onchange="${_esc(onchange)}">
          <span class="lq-sp-toggle-track" aria-hidden="true"></span>
        </label>`;
}

function _ritOptions(grade, selected) {
    const bands = RIT_BANDS_BY_GRADE[grade] || RIT_BANDS_BY_GRADE['3'];
    return bands.map(b => {
        const sel = b === selected ? ' selected' : '';
        return `<option value="${b}"${sel}>${b}</option>`;
    }).join('');
}

// ─── Render ───────────────────────────────────────────────────────────────────

/**
 * Builds the panel HTML inside `container` and wires all controls.
 * Safe to call multiple times — re-renders on each open to reflect saved state.
 *
 * @param {HTMLElement} container
 */
export function renderLiteracySettingsPanel(container) {
    const s = getLiteracySettings();

    container.innerHTML = `
      <div class="lq-sp-inner" role="dialog" aria-modal="true"
           aria-label="Literacy Quest Settings">

        <!-- Header -->
        <div class="lq-sp-header">
          <h2 class="lq-sp-title">Literacy Settings</h2>
          <button class="lq-sp-close-btn" onclick="closeLiteracySettings()"
                  aria-label="Close settings">&#x2715;</button>
        </div>

        <div class="lq-sp-body">

          <!-- ── Section 1: ELL / SPED Differentiation ── -->
          <section class="lq-sp-section lq-sp-section--highlight">
            <h3 class="lq-sp-section-title">ELL / SPED Differentiation</h3>

            <div class="lq-sp-row">
              <div class="lq-sp-row-text">
                <span class="lq-sp-row-label">ELL Scaffolds</span>
                <span class="lq-sp-row-desc">L1 cognates (Arabic + Spanish), audio autoplay,
                  1.5x pacing, sentence frames</span>
              </div>
              ${_toggle('lqSpEll', s.ell_scaffold,
                `window._lqSpChange('ell_scaffold', this.checked)`)}
            </div>

            <div class="lq-sp-row">
              <div class="lq-sp-row-text">
                <span class="lq-sp-row-label">SPED Scaffolds</span>
                <span class="lq-sp-row-desc">Elkonin boxes, 5-8 item session cap,
                  3-attempt corrective feedback, 2x response time</span>
              </div>
              ${_toggle('lqSpSped', s.sped_scaffold,
                `window._lqSpChange('sped_scaffold', this.checked)`)}
            </div>
          </section>

          <!-- ── Section 2: Audio ── -->
          <section class="lq-sp-section">
            <h3 class="lq-sp-section-title">Audio</h3>

            <div class="lq-sp-row">
              <div class="lq-sp-row-text">
                <span class="lq-sp-row-label">Audio enabled</span>
                <span class="lq-sp-row-desc">Audio uses Web Speech API.
                  Recordings stay on this device only.</span>
              </div>
              ${_toggle('lqSpAudio', s.audio_enabled,
                `window._lqSpChange('audio_enabled', this.checked)`)}
            </div>
          </section>

          <!-- ── Section 3: Visual / Accessibility ── -->
          <section class="lq-sp-section">
            <h3 class="lq-sp-section-title">Visual</h3>

            <div class="lq-sp-row">
              <div class="lq-sp-row-text">
                <span class="lq-sp-row-label">High contrast mode</span>
              </div>
              ${_toggle('lqSpContrast', s.contrast_mode === 'high',
                `window._lqSpChange('contrast_mode', this.checked ? 'high' : 'default')`)}
            </div>

            <div class="lq-sp-row">
              <label class="lq-sp-row-text" for="lqSpFont">
                <span class="lq-sp-row-label">Font</span>
              </label>
              <select id="lqSpFont" class="lq-sp-select"
                      onchange="window._lqSpChange('font_face', this.value)">
                <option value="default"${s.font_face === 'default' ? ' selected' : ''}>Default</option>
                <option value="opendyslexic"${s.font_face === 'opendyslexic' ? ' selected' : ''}>OpenDyslexic</option>
              </select>
            </div>

            <div class="lq-sp-row">
              <label class="lq-sp-row-text" for="lqSpFontScale">
                <span class="lq-sp-row-label">Font size</span>
              </label>
              <select id="lqSpFontScale" class="lq-sp-select"
                      onchange="window._lqSpChange('font_scale', parseInt(this.value, 10))">
                <option value="100"${s.font_scale === 100 ? ' selected' : ''}>100%</option>
                <option value="125"${s.font_scale === 125 ? ' selected' : ''}>125%</option>
                <option value="150"${s.font_scale === 150 ? ' selected' : ''}>150%</option>
                <option value="200"${s.font_scale === 200 ? ' selected' : ''}>200%</option>
              </select>
            </div>

            <div class="lq-sp-row">
              <div class="lq-sp-row-text">
                <span class="lq-sp-row-label">Line reader</span>
                <span class="lq-sp-row-desc">Sliding mask for passage reading</span>
              </div>
              ${_toggle('lqSpLineReader', s.line_reader_enabled,
                `window._lqSpChange('line_reader_enabled', this.checked)`)}
            </div>

            <div class="lq-sp-row">
              <div class="lq-sp-row-text">
                <span class="lq-sp-row-label">Reduce motion</span>
                <span class="lq-sp-row-desc">Less animation</span>
              </div>
              ${_toggle('lqSpReduceMotion', s.reduce_motion,
                `window._lqSpChange('reduce_motion', this.checked)`)}
            </div>
          </section>

          <!-- ── Section 4: Defaults ── -->
          <section class="lq-sp-section">
            <h3 class="lq-sp-section-title">Defaults</h3>

            <div class="lq-sp-row">
              <label class="lq-sp-row-text" for="lqSpGrade">
                <span class="lq-sp-row-label">Last grade</span>
              </label>
              <select id="lqSpGrade" class="lq-sp-select"
                      onchange="window._lqSpGradeChange(this.value)">
                ${['K','1','2','3','4','5'].map(g =>
                  `<option value="${g}"${s.last_grade === g ? ' selected' : ''}>${g === 'K' ? 'K' : 'Grade ' + g}</option>`
                ).join('')}
              </select>
            </div>

            <div class="lq-sp-row">
              <label class="lq-sp-row-text" for="lqSpRit">
                <span class="lq-sp-row-label">Last RIT band</span>
              </label>
              <select id="lqSpRit" class="lq-sp-select"
                      onchange="window._lqSpChange('last_rit_band', this.value)">
                ${_ritOptions(s.last_grade, s.last_rit_band)}
              </select>
            </div>

            <div class="lq-sp-row">
              <label class="lq-sp-row-text" for="lqSpVariant">
                <span class="lq-sp-row-label">Last test variant</span>
              </label>
              <select id="lqSpVariant" class="lq-sp-select"
                      onchange="window._lqSpChange('last_test_variant', this.value)">
                <option value="reading-k2"${s.last_test_variant === 'reading-k2' ? ' selected' : ''}>Reading K-2</option>
                <option value="reading-2-5"${s.last_test_variant === 'reading-2-5' ? ' selected' : ''}>Reading 2-5</option>
                <option value="language-usage"${s.last_test_variant === 'language-usage' ? ' selected' : ''}>Language Usage 2-12</option>
              </select>
            </div>
          </section>

        </div><!-- /.lq-sp-body -->

        <!-- Footer -->
        <div class="lq-sp-footer">
          <button class="lq-sp-save-btn" onclick="window._lqSpSave()">Save</button>
          <button class="lq-sp-reset-link" onclick="window._lqSpReset()">Reset to defaults</button>
        </div>

      </div>
    `;

    // Wire runtime helpers onto window so inline handlers work.
    _wireHandlers();
}

// ─── Panel open / close ───────────────────────────────────────────────────────

export function openLiteracySettings() {
    let panel = document.getElementById('literacySettingsPanel');
    let overlay = document.getElementById('literacySettingsOverlay');

    if (!panel) {
        // Create panel and overlay on first call.
        overlay = document.createElement('div');
        overlay.id = 'literacySettingsOverlay';
        overlay.className = 'lq-sp-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.onclick = closeLiteracySettings;

        panel = document.createElement('div');
        panel.id = 'literacySettingsPanel';
        panel.className = 'lq-sp-panel';

        document.body.appendChild(overlay);
        document.body.appendChild(panel);
    }

    // Re-render each time so controls reflect the latest saved state.
    renderLiteracySettingsPanel(panel);

    overlay.classList.add('active');
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Trap focus on first focusable element.
    const first = panel.querySelector('button, [tabindex="0"], select, input');
    if (first) first.focus();
}

export function closeLiteracySettings() {
    const panel   = document.getElementById('literacySettingsPanel');
    const overlay = document.getElementById('literacySettingsOverlay');
    if (panel)   panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Runtime handler wiring ───────────────────────────────────────────────────

// Accumulate in-panel changes before the Save button is pressed.
// We write to a staging object rather than live-writing the cookie on every
// keystroke, except for contrast / font / scale which benefit from live preview.
let _staged = {};

function _wireHandlers() {
    _staged = { ...getLiteracySettings() };

    window._lqSpChange = function (key, value) {
        _staged[key] = value;
        // Live-preview visual accessibility settings immediately.
        const LIVE_PREVIEW_KEYS = ['contrast_mode', 'font_face', 'font_scale', 'reduce_motion'];
        if (LIVE_PREVIEW_KEYS.includes(key)) {
            applyLiteracySettings({ ...getLiteracySettings(), ..._staged });
        }
    };

    window._lqSpGradeChange = function (grade) {
        _staged.last_grade = grade;
        // Rebuild the RIT band dropdown for the selected grade.
        const ritSel = document.getElementById('lqSpRit');
        if (ritSel) {
            const currentBand = _staged.last_rit_band;
            const bands = RIT_BANDS_BY_GRADE[grade] || RIT_BANDS_BY_GRADE['3'];
            // Pick the first band in range as a sensible default if current is out of range.
            const newBand = bands.includes(currentBand) ? currentBand : bands[2] || bands[0];
            _staged.last_rit_band = newBand;
            ritSel.innerHTML = _ritOptions(grade, newBand);
        }
    };

    window._lqSpSave = function () {
        const saved = saveLiteracySettings(_staged);
        applyLiteracySettings(saved);
        closeLiteracySettings();
    };

    window._lqSpReset = function () {
        const fresh = resetLiteracySettings();
        _staged = { ...fresh };
        // Re-render the panel to show fresh defaults.
        const panel = document.getElementById('literacySettingsPanel');
        if (panel) renderLiteracySettingsPanel(panel);
    };
}
