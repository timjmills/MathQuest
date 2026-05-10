// Onboarding — first-time visitor coach-mark tour. Gated on
// localStorage 'mathquest_onboarded' flag. Shows up to 4 short steps and
// always sets the flag the moment the tour fires (so a stuck/off-screen
// popover can't keep resurrecting itself across sessions). Skippable at
// any step via Skip tour, the close ✕, the dark backdrop, or Escape.

const STEPS = [
    { sel: '.start-game-btn',        title: "Start your adventure!", body: "Tap this big orange button when you're ready to play." },
    { sel: '#quickSkillsGrid',       title: "Pick a skill",          body: "Tap a card to choose what to practice. You can select more than one!" },
    { sel: '.role-toggle-container', title: "Student or Teacher",    body: "Switch between modes here. Teachers see more options for setup and printing." },
    { sel: '#sfxToggle',             title: "Sound on or off",       body: "Turn sound effects on for celebrations, or off for quiet practice." }
];

let _idx = 0;
let _overlay = null;
let _escHandler = null;

export function isOnboarded() {
    try { return localStorage.getItem('mathquest_onboarded') === '1'; } catch { return true; }
}

export function setOnboarded() {
    try { localStorage.setItem('mathquest_onboarded', '1'); } catch {}
}

// Reset for QA / debug — exposed on window so a teacher can reset from the
// console. Not wired to any UI button by default.
export function resetOnboarding() {
    try { localStorage.removeItem('mathquest_onboarded'); } catch {}
}

export function startOnboarding() {
    _idx = 0;
    // Mark the user as "onboarded" the moment the tour starts. If the popover
    // ends up unreachable (e.g., target element off-screen, role-mode mismatch,
    // CSS bug), the flag is still set so a refresh kills it for good. The user
    // can manually re-trigger via window.startOnboarding() if they want.
    setOnboarded();
    _renderStep();
}

export function maybeShowOnboarding() {
    if (isOnboarded()) return;
    // Wait a beat so the home view + injected mascot have settled.
    setTimeout(() => startOnboarding(), 800);
}

// Returns true if the rect describes a visibly-onscreen, nonzero-sized box.
function _rectIsValid(rect) {
    if (!rect) return false;
    if (rect.width < 4 || rect.height < 4) return false;
    if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
    if (rect.right < 0 || rect.left > window.innerWidth) return false;
    return true;
}

function _renderStep() {
    if (_idx >= STEPS.length) { _close(); return; }
    const step = STEPS[_idx];
    const target = document.querySelector(step.sel);
    const rect = target ? target.getBoundingClientRect() : null;

    if (!_overlay) _buildOverlay();

    const hole = _overlay.querySelector('.mq-onb-hole');
    const card = _overlay.querySelector('.mq-onb-card');
    const cardW = 340;
    const cardH = 200;  // approximate; the card auto-grows but this is enough for placement math

    // Skip steps whose target is missing or hidden — but skip with a
    // bound on consecutive skips so we don't infinite-loop.
    if (!target || !_rectIsValid(rect)) {
        // Center the card and show it as a generic step rather than auto-skip.
        // This way the user can always reach Skip / Next / Got it even when
        // the target element is missing (e.g., hidden by role mode).
        hole.style.cssText = 'display:none;';
        const cardLeft = Math.max(16, Math.round((window.innerWidth - cardW) / 2));
        const cardTop = Math.max(16, Math.round((window.innerHeight - cardH) / 2));
        _applyCardStyle(card, cardLeft, cardTop, cardW);
    } else {
        // Highlight the target with the spotlight hole.
        const pad = 8;
        hole.style.cssText = `position:absolute;left:${rect.left - pad}px;top:${rect.top - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px;border-radius:14px;box-shadow:0 0 0 9999px rgba(43,40,64,0.55), 0 0 0 3px var(--mq-orange);transition:all 250ms cubic-bezier(0.34,1.56,0.64,1);pointer-events:none;display:block;`;

        // Try below the target first; if no room, try above; if still no room
        // (e.g., target is in a tiny viewport), fall back to centered.
        let cardLeft, cardTop;
        const roomBelow = window.innerHeight - (rect.bottom + 14);
        const roomAbove = rect.top - 14;
        const targetCenterX = rect.left + rect.width / 2;
        cardLeft = Math.max(16, Math.min(window.innerWidth - cardW - 16, Math.round(targetCenterX - cardW / 2)));

        if (roomBelow >= cardH) {
            cardTop = Math.round(rect.bottom + 14);
        } else if (roomAbove >= cardH) {
            cardTop = Math.round(rect.top - cardH - 14);
        } else {
            // No room above or below — center vertically.
            cardTop = Math.max(16, Math.round((window.innerHeight - cardH) / 2));
        }

        // Final clamp: never let any edge go off-screen.
        cardTop = Math.max(16, Math.min(window.innerHeight - cardH - 16, cardTop));
        cardLeft = Math.max(16, Math.min(window.innerWidth - cardW - 16, cardLeft));

        _applyCardStyle(card, cardLeft, cardTop, cardW);
    }

    card.querySelector('.mq-onb-title').textContent = step.title;
    card.querySelector('.mq-onb-body').textContent = step.body;
    card.querySelector('.mq-onb-counter').textContent = `${_idx + 1} of ${STEPS.length}`;

    const isLast = _idx === STEPS.length - 1;
    const nextBtn = card.querySelector('.mq-onb-next');
    if (nextBtn) nextBtn.textContent = isLast ? 'Got it!' : 'Next';
}

function _applyCardStyle(card, left, top, width) {
    card.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${width}px;background:var(--mq-paper);border:2px solid var(--mq-rule);border-radius:18px;padding:18px 22px;box-shadow:0 6px 0 0 var(--mq-rule), 0 16px 40px rgba(0,0,0,0.18);font-family:Nunito, sans-serif;`;
}

function _buildOverlay() {
    _overlay = document.createElement('div');
    _overlay.className = 'mq-onb-overlay';
    _overlay.innerHTML = `
        <div class="mq-onb-hole"></div>
        <div class="mq-onb-card">
            <button type="button" class="mq-onb-close" aria-label="Close tour" style="position:absolute;top:8px;right:10px;background:transparent;border:0;font-size:1.4rem;line-height:1;cursor:pointer;color:var(--mq-muted, #888);padding:4px 8px;border-radius:8px;font-weight:900;">×</button>
            <div class="mq-onb-counter" style="font-size:0.75rem;font-weight:800;color:var(--mq-purple);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px;padding-right:24px;"></div>
            <div class="mq-onb-title" style="font-size:1.2rem;font-weight:900;margin-bottom:6px;color:var(--mq-ink);letter-spacing:-0.01em;padding-right:24px;"></div>
            <div class="mq-onb-body" style="font-size:0.95rem;font-weight:700;color:var(--mq-ink-2);margin-bottom:14px;line-height:1.4;"></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="mq-onb-skip btn btn-secondary btn-sm">Skip tour</button>
                <button class="mq-onb-next btn btn-primary btn-sm">Next</button>
            </div>
        </div>
    `;
    _overlay.style.cssText = 'position:fixed;inset:0;z-index:10050;pointer-events:auto;';

    _overlay.querySelector('.mq-onb-close').addEventListener('click', () => _close());
    _overlay.querySelector('.mq-onb-skip').addEventListener('click', () => _close());
    _overlay.querySelector('.mq-onb-next').addEventListener('click', () => {
        _idx++;
        if (_idx >= STEPS.length) {
            _close();
        } else {
            _renderStep();
        }
    });

    // Backdrop click closes (only when click hits the overlay itself, not the card).
    _overlay.addEventListener('click', (e) => {
        if (e.target === _overlay) _close();
    });

    // Escape key closes.
    _escHandler = (e) => { if (e.key === 'Escape' || e.key === 'Esc') _close(); };
    document.addEventListener('keydown', _escHandler);

    document.body.appendChild(_overlay);
}

function _close() {
    // Flag is already set by startOnboarding(); this is just for cleanup.
    setOnboarded();
    if (_escHandler) {
        document.removeEventListener('keydown', _escHandler);
        _escHandler = null;
    }
    if (_overlay) {
        _overlay.style.transition = 'opacity 200ms ease';
        _overlay.style.opacity = '0';
        setTimeout(() => { _overlay?.remove(); _overlay = null; }, 220);
    }
}

if (typeof window !== 'undefined') {
    window.startOnboarding = startOnboarding;
    window.maybeShowOnboarding = maybeShowOnboarding;
    window.resetOnboarding = resetOnboarding;
}
