// Worked-example preview — fires once per skill per session before the
// student's first attempt. Shows a sample problem + step-by-step solution
// with a "Got it, let me try!" CTA to dismiss.

const _shownThisSession = new Set();

export function shouldShowPreview(skillId) {
    if (!skillId) return false;
    if (_shownThisSession.has(skillId)) return false;
    return true;
}

export function markPreviewShown(skillId) {
    if (skillId) _shownThisSession.add(skillId);
}

export function clearPreviewShown() {
    _shownThisSession.clear();
}

// Render an inline preview card in front of the question. Uses the existing
// solution-display generator if available; otherwise builds a minimal example.
export function showWorkedPreview(skillId, sampleQuestion) {
    if (!sampleQuestion) return;
    markPreviewShown(skillId);
    const overlay = document.createElement('div');
    overlay.className = 'mq-worked-preview-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(43,40,64,0.55);display:flex;align-items:center;justify-content:center;z-index:10040;animation:mqOnbFadeIn 220ms ease;';
    const stepsHTML = _buildSteps(sampleQuestion);
    overlay.innerHTML = `
        <div class="mq-worked-preview-card" style="background:var(--mq-paper);border:2px solid var(--mq-rule);border-radius:22px;padding:24px 28px;max-width:520px;width:90%;box-shadow:0 6px 0 0 var(--mq-rule), 0 16px 40px rgba(0,0,0,0.18);">
            <div style="font-size:0.8rem;font-weight:800;color:var(--mq-purple);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px;">Show me how</div>
            <h3 style="font-size:1.3rem;font-weight:900;color:var(--mq-ink);letter-spacing:-0.01em;margin-bottom:10px;">${sampleQuestion.skillLabel || 'New skill'}</h3>
            <div style="font-size:1rem;font-weight:700;color:var(--mq-ink-2);line-height:1.5;margin-bottom:12px;">Here's a worked example before you try:</div>
            <div style="background:var(--mq-purple-soft);border:2px solid var(--mq-purple-l);border-radius:14px;padding:14px 16px;margin-bottom:16px;font-weight:700;color:var(--mq-ink);">
                <div style="font-size:0.78rem;font-weight:800;color:var(--mq-purple);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">Sample Problem</div>
                <div style="font-size:1.1rem;font-weight:900;margin-bottom:8px;">${sampleQuestion.text || ''}</div>
                ${stepsHTML}
                <div style="margin-top:10px;font-size:1rem;font-weight:900;color:var(--mq-correct-ink, #1F6B4D);">Answer: ${sampleQuestion.ans !== undefined ? String(sampleQuestion.ans) : '?'}</div>
            </div>
            <button class="btn btn-primary" id="mqWorkedDismiss" style="width:100%;padding:14px;">Got it, let me try!</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#mqWorkedDismiss').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function _buildSteps(q) {
    // Try the solution generator first
    if (typeof window !== 'undefined' && typeof window.generateSolutionSteps === 'function') {
        try {
            const steps = window.generateSolutionSteps(q);
            if (Array.isArray(steps) && steps.length) {
                return `<ol style="margin:8px 0 4px 18px;padding:0;font-weight:700;color:var(--mq-ink-2);font-size:0.95rem;line-height:1.55;">${steps.slice(0, 4).map(s => `<li style="margin:3px 0;">${s}</li>`).join('')}</ol>`;
            }
        } catch (e) {}
    }
    // Fallback: hint + answer
    if (q.hint) return `<div style="font-size:0.95rem;font-weight:700;color:var(--mq-ink-2);">${q.hint}</div>`;
    return '';
}

if (typeof window !== 'undefined') {
    window.shouldShowPreview = shouldShowPreview;
    window.markPreviewShown = markPreviewShown;
    window.clearPreviewShown = clearPreviewShown;
    window.showWorkedPreview = showWorkedPreview;
}
