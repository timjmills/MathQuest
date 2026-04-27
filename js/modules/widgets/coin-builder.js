// coin-builder widget — interactive coin-decomposition answer type used by
// the `make_change_least_coins` skill. Renders a palette of value-coin
// buttons (1¢, 5¢, 10¢, 25¢, $1) plus an answer area where the student's
// selections accumulate. Clicking a palette coin ADDS one to the answer
// area; clicking a coin in the answer area REMOVES it. A live total is
// displayed alongside the target. The Submit button is enabled once the
// student has placed at least one coin.
//
// Question contract:
//   q.measurementData.target    cents the student must reach (required)
//   q.measurementData.minCoins  greedy fewest-coins count (required)
//
// Validation (performed by the integrator):
//   correct ⇔ sum(coins) === target  AND  coins.length === minCoins
//
// Pure module — no globals attached, no DOM mutation outside `container`.

const COIN_VALUES = [100, 25, 10, 5, 1];
const COIN_STYLES = {
    1:   { fill: '#b87333', stroke: '#7a4a1f', text: '#fff', sizeRel: 0.62 },
    5:   { fill: '#bfc4c9', stroke: '#7e858d', text: '#222', sizeRel: 0.72 },
    10:  { fill: '#cfd4d9', stroke: '#8a9097', text: '#222', sizeRel: 0.80 },
    25:  { fill: '#dde1e5', stroke: '#9aa0a6', text: '#222', sizeRel: 0.92 },
    100: { fill: '#e8c547', stroke: '#a78a1e', text: '#3a2d00', sizeRel: 1.0 }
};

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _coinLabel(v) {
    return v === 100 ? '$1' : `${v}¢`;
}

// Coin SVG — same visual treatment as gen-measurement.renderValueCoin so
// the widget feels native to the print/screen palette.
function _coinSvg(v, sizePx) {
    const s = COIN_STYLES[v] || COIN_STYLES[1];
    const px = sizePx || Math.round(s.sizeRel * 64);
    return `<svg viewBox="0 0 64 64" role="img" aria-label="coin worth ${v} cents" style="width:${px}px;height:${px}px;display:block;">
        <circle cx="32" cy="32" r="30" fill="${s.fill}" stroke="${s.stroke}" stroke-width="3"/>
        <text x="32" y="40" text-anchor="middle" font-size="26" font-family="Arial, sans-serif" font-weight="700" fill="${s.text}">${_esc(_coinLabel(v))}</text>
    </svg>`;
}

let _state = {
    selectedCoins: [],   // sorted high → low for display
    target: 0,
    minCoins: 0,
    container: null,
    locked: false,
};

function _sumCoins(arr) {
    let s = 0; for (const v of arr) s += v; return s;
}

function _formatCents(c) {
    return `${c}¢`;
}

function _refresh() {
    if (!_state.container) return;
    const root = _state.container.querySelector('.coinb-host');
    if (!root) return;

    const total = _sumCoins(_state.selectedCoins);
    const target = _state.target;

    // Total / target readout
    const totalEl = root.querySelector('.coinb-total-value');
    if (totalEl) {
        totalEl.textContent = _formatCents(total);
        totalEl.classList.toggle('match', total === target);
        totalEl.classList.toggle('over', total > target);
    }
    const countEl = root.querySelector('.coinb-count-value');
    if (countEl) countEl.textContent = String(_state.selectedCoins.length);

    // Answer area — render one removable coin per entry
    const answerEl = root.querySelector('.coinb-answer-area');
    if (answerEl) {
        if (_state.selectedCoins.length === 0) {
            answerEl.innerHTML = `<div class="coinb-empty">Click coins below to build your answer.</div>`;
        } else {
            // Already sorted high-to-low for stable display order.
            const sorted = _state.selectedCoins.slice().sort((a, b) => b - a);
            answerEl.innerHTML = sorted.map((v, i) => {
                const s = COIN_STYLES[v] || COIN_STYLES[1];
                const px = Math.max(48, Math.round(s.sizeRel * 64));
                return `<button type="button" class="coinb-coin coinb-answer-coin" data-value="${v}" data-idx="${i}"
                            aria-label="Remove ${_coinLabel(v)} coin" title="Click to remove">
                            ${_coinSvg(v, px)}
                        </button>`;
            }).join('');
        }
    }

    // Submit button enabled once at least one coin placed and not locked
    const submit = root.querySelector('.coinb-submit');
    if (submit) {
        submit.disabled = _state.locked || _state.selectedCoins.length === 0;
    }
}

function _onPaletteClick(e) {
    if (_state.locked) return;
    const btn = e.target.closest('.coinb-palette-coin');
    if (!btn) return;
    const v = parseInt(btn.dataset.value, 10);
    if (!Number.isFinite(v)) return;
    _state.selectedCoins.push(v);
    _refresh();
}

function _onAnswerClick(e) {
    if (_state.locked) return;
    const btn = e.target.closest('.coinb-answer-coin');
    if (!btn) return;
    const v = parseInt(btn.dataset.value, 10);
    if (!Number.isFinite(v)) return;
    // Remove the first occurrence of this value from the (sorted) list.
    // We store insertion order in _state.selectedCoins but render sorted —
    // removing any one of a value is equivalent, so just splice the first.
    const idx = _state.selectedCoins.indexOf(v);
    if (idx >= 0) {
        _state.selectedCoins.splice(idx, 1);
        _refresh();
    }
}

export function renderCoinBuilder(q, container) {
    if (!container || !q) return;
    const md = q.measurementData || {};
    const target = (typeof md.target === 'number' && md.target > 0) ? md.target : 0;
    const minCoins = (typeof md.minCoins === 'number' && md.minCoins > 0) ? md.minCoins : 1;

    _state = {
        selectedCoins: [],
        target,
        minCoins,
        container,
        locked: false,
    };

    // Palette: large coins in descending value, big tap targets.
    const paletteHtml = COIN_VALUES.map(v => {
        const s = COIN_STYLES[v] || COIN_STYLES[1];
        // Tap target: minimum 56px, scales with coin sizeRel.
        const px = Math.max(56, Math.round(s.sizeRel * 70));
        return `<button type="button" class="coinb-coin coinb-palette-coin" data-value="${v}"
                    aria-label="Add ${_coinLabel(v)} coin" title="Click to add ${_coinLabel(v)}">
                    ${_coinSvg(v, px)}
                    <span class="coinb-palette-label">${_esc(_coinLabel(v))}</span>
                </button>`;
    }).join('');

    container.innerHTML = `
        <div class="coinb-host" role="application" aria-label="Coin builder">
            <div class="coinb-target-row">
                <div class="coinb-target">
                    <div class="coinb-target-label">Target</div>
                    <div class="coinb-target-value">${_formatCents(target)}</div>
                </div>
                <div class="coinb-readout">
                    <div class="coinb-readout-row">
                        <span class="coinb-readout-label">Total:</span>
                        <span class="coinb-total-value">0¢</span>
                    </div>
                    <div class="coinb-readout-row coinb-count-row">
                        <span class="coinb-readout-label">Coins:</span>
                        <span class="coinb-count-value">0</span>
                    </div>
                </div>
            </div>

            <div class="coinb-answer-section">
                <div class="coinb-section-title">Your coins</div>
                <div class="coinb-answer-area" aria-live="polite"></div>
            </div>

            <div class="coinb-palette-section">
                <div class="coinb-section-title">Tap a coin to add</div>
                <div class="coinb-palette">${paletteHtml}</div>
            </div>

            <button type="button" class="coinb-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const root = container.querySelector('.coinb-host');
    const palette = root.querySelector('.coinb-palette');
    const answer = root.querySelector('.coinb-answer-area');
    const submit = root.querySelector('.coinb-submit');

    palette.addEventListener('click', _onPaletteClick);
    answer.addEventListener('click', _onAnswerClick);
    submit.addEventListener('click', () => {
        if (submit.disabled || _state.locked) return;
        _state.locked = true;
        submit.disabled = true;
        // Disable palette/answer interaction during the post-submit window.
        root.querySelectorAll('.coinb-coin').forEach(b => { b.disabled = true; });
        try { onCoinBuilderSubmit(q, _state.selectedCoins.slice()); }
        catch (err) { console.error('onCoinBuilderSubmit failed:', err); }
    });

    // Expose flash helper for the integrator.
    root._coinbFlash = function (correct) {
        const cls = correct ? 'correct-flash' : 'wrong-flash';
        root.querySelectorAll('.coinb-answer-coin').forEach(b => b.classList.add(cls));
        const totalEl = root.querySelector('.coinb-total-value');
        if (totalEl) totalEl.classList.add(cls);
    };

    _refresh();
}

export function getCoinBuilderState() {
    return _state.selectedCoins.slice();
}

// Default no-op stub. The integrator (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onCoinBuilderSubmit = function (_q, _coins) { /* noop */ };

export function setOnCoinBuilderSubmit(fn) {
    if (typeof fn === 'function') onCoinBuilderSubmit = fn;
}

export function checkCoinBuilder(q, coins) {
    if (!q || !q.measurementData) return false;
    if (!Array.isArray(coins)) return false;
    const target = q.measurementData.target;
    const minCoins = q.measurementData.minCoins;
    const sum = _sumCoins(coins);
    return sum === target && coins.length === minCoins;
}
