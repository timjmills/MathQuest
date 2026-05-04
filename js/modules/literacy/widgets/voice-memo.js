// voice-memo.js — Local-only self-monitoring voice recorder widget.
//
// Per PHASE_0_DECISIONS.md "Voice Memo amended" + "Voice Memo minimum-duration thresholds".
// The student records themselves reading/speaking, plays back, and self-assesses.
// No transcript, no scoring, no server upload, no persistence beyond the current card.
//
// Question contract:
//   q.task_text:               string   — what to read/say (displayed prominently)
//   q.voice_memo_min_seconds?: number   — minimum recording duration (default per task_type)
//   q.voice_memo_max_seconds?: number   — hard cap (default 30)
//   q.task_type?:              string   — 'articulation'|'sentence'|'paragraph'|'passage'
//                                         (drives default min_seconds when q.voice_memo_min_seconds absent)
//
// Exports:
//   renderVoiceMemo(q, container)  — mounts widget inside container
//   checkVoiceMemo(q, container)   — returns { correct: true, submitted: 'voice-memo-completed' }
//
// Container cleanup:
//   container._lqCleanup()  — revokes the blob URL + clears refs; called by dispatcher on advance.

import { state } from '../../state.js';

// ─── min-duration defaults by task_type ────────────────────────────────────

const MIN_SECONDS_BY_TYPE = {
    articulation:  3,
    phoneme:       2,
    sight_word:    3,
    sentence:      5,
    sentence_long: 7,
    paragraph:     10,
    paragraph_full:15,
    passage:       25,
};

function _resolveMinSeconds(q) {
    if (typeof q.voice_memo_min_seconds === 'number') return q.voice_memo_min_seconds;
    return MIN_SECONDS_BY_TYPE[q.task_type] || 3;
}

function _resolveMaxSeconds(q) {
    return (typeof q.voice_memo_max_seconds === 'number') ? q.voice_memo_max_seconds : 30;
}

// ─── safe TTS helper ────────────────────────────────────────────────────────

function _safeSpeak(text) {
    try {
        if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
            window.speakAnswerOption(text);
        }
    } catch (_) { /* no-op */ }
}

// ─── duration formatter ─────────────────────────────────────────────────────

function _fmtSeconds(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
}

// ─── render ─────────────────────────────────────────────────────────────────

export function renderVoiceMemo(q, container) {
    if (!container || !q) return;

    const minSec   = _resolveMinSeconds(q);
    const maxSec   = _resolveMaxSeconds(q);
    const taskText = q.task_text || '';

    // ── shared mutable state for this card instance ──
    let mediaRecorder  = null;
    let audioChunks    = [];
    let blobUrl        = null;
    let recordedBlob   = null;
    let recStartTime   = null;
    let recDuration    = 0;      // seconds of the completed recording
    let tickInterval   = null;
    let tooFastCount   = 0;
    let audioEl        = null;

    // ── cleanup hook for dispatcher (called on card advance) ──
    container._lqCleanup = () => {
        _revokeBlob();
        _stopTick();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            try { mediaRecorder.stop(); } catch (_) { /* ignore */ }
        }
        if (audioEl) {
            audioEl.pause();
            audioEl.src = '';
        }
    };

    function _revokeBlob() {
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
            blobUrl = null;
        }
        recordedBlob = null;
    }

    function _stopTick() {
        if (tickInterval) {
            clearInterval(tickInterval);
            tickInterval = null;
        }
    }

    // ── build DOM ──────────────────────────────────────────────────────────

    container.innerHTML = `
        <div class="lq-vm-card" role="application" aria-label="Voice memo recorder">
            <div class="lq-vm-task-text" aria-live="off">${taskText}</div>

            <div class="lq-vm-recorder-area">
                <button type="button"
                        id="lq-vm-mic-btn"
                        class="lq-vm-mic-btn lq-vm-idle"
                        aria-label="Start recording"
                        title="Press Space to start or stop recording">
                    <span class="lq-vm-mic-icon" aria-hidden="true">&#127908;</span>
                    <span class="lq-vm-mic-label">Tap to record</span>
                </button>

                <div class="lq-vm-duration-display"
                     aria-live="polite"
                     aria-atomic="true"
                     id="lq-vm-duration">
                    <!-- e.g. "0:05 / 0:30" while recording -->
                </div>

                <p class="lq-vm-privacy-notice" aria-label="Privacy notice">
                    &#128274; Recording stays on your device only &mdash; not uploaded, not saved.
                </p>
            </div>

            <div class="lq-vm-playback-area" id="lq-vm-playback" hidden>
                <div class="lq-vm-playback-controls">
                    <button type="button" class="lq-vm-play-btn" id="lq-vm-play-btn"
                            aria-label="Play recording">
                        &#9654; Play
                    </button>
                    <button type="button" class="lq-vm-rerecord-btn" id="lq-vm-rerecord-btn"
                            aria-label="Re-record">
                        &#128260; Re-record
                    </button>
                </div>
                <span class="lq-vm-rec-duration-label" id="lq-vm-rec-label"></span>
            </div>

            <div class="lq-vm-continue-area" id="lq-vm-continue" hidden>
                <button type="button" class="lq-vm-continue-btn" id="lq-vm-continue-btn"
                        aria-label="Continue to next question">
                    Continue &#8594;
                </button>
            </div>

            <!-- Too-fast modal -->
            <div class="lq-vm-modal-overlay" id="lq-vm-modal" role="dialog"
                 aria-modal="true" aria-labelledby="lq-vm-modal-title" hidden>
                <div class="lq-vm-modal-box">
                    <p class="lq-vm-modal-title" id="lq-vm-modal-title">
                        &#128514; Whoops, too fast!
                    </p>
                    <p class="lq-vm-modal-body" id="lq-vm-modal-body">
                        Try reading more slowly so you can hear yourself clearly.
                    </p>
                    <button type="button" class="lq-vm-modal-btn" id="lq-vm-modal-try-again">
                        Try again
                    </button>
                </div>
            </div>

            <div class="lq-vm-status-announce"
                 aria-live="assertive"
                 aria-atomic="true"
                 style="position:absolute;left:-9999px;height:1px;overflow:hidden;"
                 id="lq-vm-sr-announce"></div>
        </div>`;

    // ── element refs ────────────────────────────────────────────────────────

    const micBtn       = container.querySelector('#lq-vm-mic-btn');
    const durationEl   = container.querySelector('#lq-vm-duration');
    const playbackArea = container.querySelector('#lq-vm-playback');
    const playBtn      = container.querySelector('#lq-vm-play-btn');
    const rerecordBtn  = container.querySelector('#lq-vm-rerecord-btn');
    const recLabel     = container.querySelector('#lq-vm-rec-label');
    const continueArea = container.querySelector('#lq-vm-continue');
    const continueBtn  = container.querySelector('#lq-vm-continue-btn');
    const modal        = container.querySelector('#lq-vm-modal');
    const modalBody    = container.querySelector('#lq-vm-modal-body');
    const modalTryBtn  = container.querySelector('#lq-vm-modal-try-again');
    const srAnnounce   = container.querySelector('#lq-vm-sr-announce');

    // ── screen reader helper ─────────────────────────────────────────────────

    function _announce(text) {
        srAnnounce.textContent = '';
        requestAnimationFrame(() => { srAnnounce.textContent = text; });
    }

    // ── state machine ────────────────────────────────────────────────────────
    // States: idle → recording → ready → playing

    function _enterIdle() {
        micBtn.className = 'lq-vm-mic-btn lq-vm-idle';
        micBtn.setAttribute('aria-label', 'Start recording');
        micBtn.querySelector('.lq-vm-mic-label').textContent = 'Tap to record';
        durationEl.textContent = '';
        playbackArea.hidden = true;
        continueArea.hidden = true;
        _revokeBlob();
        if (audioEl) { audioEl.pause(); audioEl.src = ''; }
        _announce('Ready to record. Tap the microphone button to start.');
    }

    function _enterRecording() {
        micBtn.className = 'lq-vm-mic-btn lq-vm-recording';
        micBtn.setAttribute('aria-label', 'Stop recording');
        micBtn.querySelector('.lq-vm-mic-label').textContent = 'Recording…';
        playbackArea.hidden = true;
        continueArea.hidden = true;
        _announce('Recording started.');

        // Live counter
        let elapsed = 0;
        durationEl.textContent = `${_fmtSeconds(0)} / ${_fmtSeconds(maxSec)}`;
        tickInterval = setInterval(() => {
            elapsed++;
            durationEl.textContent = `${_fmtSeconds(elapsed)} / ${_fmtSeconds(maxSec)}`;
            // Auto-stop at hard cap
            if (elapsed >= maxSec) {
                _stopRecording();
            }
        }, 1000);
    }

    function _enterReady() {
        micBtn.className = 'lq-vm-mic-btn lq-vm-idle';
        micBtn.setAttribute('aria-label', 'Start recording');
        micBtn.querySelector('.lq-vm-mic-label').textContent = 'Tap to record';
        durationEl.textContent = '';
        playbackArea.hidden  = false;
        continueArea.hidden  = false;
        recLabel.textContent = `Recorded: ${_fmtSeconds(recDuration)}`;
        _announce(`Recording complete — ${_fmtSeconds(recDuration)}. You can play it back or continue.`);
    }

    // ── mic permission + start recording ─────────────────────────────────────

    async function _startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunks = [];
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = e => {
                if (e.data && e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                // Stop all tracks to release the mic indicator
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                recordedBlob = blob;
                blobUrl = URL.createObjectURL(blob);
                _onRecordingComplete();
            };

            recStartTime = Date.now();
            mediaRecorder.start(200); // collect chunks every 200ms
            _enterRecording();
        } catch (err) {
            _announce('Microphone access denied. Please allow microphone permission and try again.');
            durationEl.textContent = 'Microphone access denied. Please check your browser permissions.';
        }
    }

    function _stopRecording() {
        _stopTick();
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            recDuration = Math.round((Date.now() - recStartTime) / 1000);
            mediaRecorder.stop(); // fires onstop → _onRecordingComplete
        }
    }

    function _onRecordingComplete() {
        if (recDuration < minSec) {
            // Too fast — show modal, discard recording
            _revokeBlob();
            tooFastCount++;
            _showTooFastModal();
        } else {
            // Good — wire up audio element for playback
            audioEl = new Audio(blobUrl);
            audioEl.onended = () => {
                playBtn.innerHTML = '&#9654; Play';
                playBtn.setAttribute('aria-label', 'Play recording');
                _announce('Playback finished.');
            };
            _enterReady();
        }
    }

    // ── too-fast modal ────────────────────────────────────────────────────────

    function _showTooFastModal() {
        let bodyText = 'Try reading more slowly so you can hear yourself clearly.';
        if (tooFastCount >= 3) {
            bodyText = 'Take a deep breath. Read each word slowly. You don\'t need to rush.';
        }
        modalBody.textContent = bodyText;
        modal.hidden = false;
        modalTryBtn.focus();
        _announce(`Whoops, too fast! ${bodyText}`);
    }

    modalTryBtn.addEventListener('click', () => {
        modal.hidden = true;
        _enterIdle();
        micBtn.focus();
    });

    // ── mic button click / Space ─────────────────────────────────────────────

    function _onMicToggle() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            _stopRecording();
        } else {
            _startRecording();
        }
    }

    micBtn.addEventListener('click', _onMicToggle);

    // Space key anywhere in the card toggles recording
    container.addEventListener('keydown', e => {
        if (e.key === ' ' && document.activeElement !== continueBtn
                          && document.activeElement !== playBtn
                          && document.activeElement !== rerecordBtn
                          && document.activeElement !== modalTryBtn) {
            e.preventDefault();
            _onMicToggle();
        }
    });

    // ── playback controls ────────────────────────────────────────────────────

    playBtn.addEventListener('click', () => {
        if (!audioEl) return;
        if (!audioEl.paused) {
            audioEl.pause();
            playBtn.innerHTML = '&#9654; Play';
            playBtn.setAttribute('aria-label', 'Play recording');
            _announce('Playback paused.');
        } else {
            audioEl.play();
            playBtn.innerHTML = '&#9646;&#9646; Pause';
            playBtn.setAttribute('aria-label', 'Pause recording');
            _announce('Playing back your recording.');
        }
    });

    rerecordBtn.addEventListener('click', () => {
        if (audioEl) { audioEl.pause(); audioEl.src = ''; audioEl = null; }
        _enterIdle();
        micBtn.focus();
    });

    // ── continue button ───────────────────────────────────────────────────────
    // The dispatcher (or game-control) handles the actual advance; this just
    // stores the result so checkVoiceMemo() returns the completed marker.

    continueBtn.addEventListener('click', () => {
        container._lqVoiceMemoCompleted = true;
        // Optionally revoke now — dispatcher will also call _lqCleanup on advance
        _revokeBlob();
        _announce('Moving to the next question.');
        // If there is a global nextLiteracyQuestion, call it.
        if (typeof window.nextLiteracyQuestion === 'function') {
            window.nextLiteracyQuestion();
        }
    });

    // ── init ──────────────────────────────────────────────────────────────────

    _enterIdle();

    // Warn if MediaRecorder not available (very old browsers / non-HTTPS)
    if (!window.MediaRecorder || !navigator.mediaDevices) {
        micBtn.disabled = true;
        durationEl.textContent = 'Voice recording is not available in this browser.';
        _announce('Voice recording is not supported in this browser.');
    }

    // Apply inline layout styles (scoped to this widget only; no CSS file coupling)
    _injectStyles();
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkVoiceMemo(q, container) {
    // Voice memo is purely metacognitive — no correct/incorrect grading.
    // Returns correct:true so the session flow can advance without blocking.
    return {
        correct: true,
        submitted: 'voice-memo-completed',
        feedback: 'Self-assessment recording complete.',
    };
}

// ─── scoped inline styles ────────────────────────────────────────────────────

let _stylesInjected = false;

function _injectStyles() {
    if (_stylesInjected) return;
    _stylesInjected = true;

    const css = `
/* voice-memo widget */
.lq-vm-card {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
    padding: 0 8px 24px;
    font-family: Arial, sans-serif;
    box-sizing: border-box;
}
.lq-vm-task-text {
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 1.5;
    background: #f0f4ff;
    border-left: 4px solid #1565c0;
    padding: 14px 18px;
    border-radius: 6px;
    margin-bottom: 28px;
    color: #1a1a2e;
}
.lq-vm-recorder-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}
.lq-vm-mic-btn {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0.78rem;
    font-weight: 600;
    transition: transform 0.15s, box-shadow 0.15s;
    background: #e53935;
    color: #fff;
    box-shadow: 0 4px 12px rgba(229,57,53,0.35);
    min-width: 60px;
    min-height: 60px;
}
.lq-vm-mic-btn:hover:not(:disabled) { transform: scale(1.06); }
.lq-vm-mic-btn:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }
.lq-vm-mic-icon { font-size: 2rem; line-height: 1; }
@keyframes lq-vm-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(229,57,53,0.6); }
    70%  { box-shadow: 0 0 0 16px rgba(229,57,53,0); }
    100% { box-shadow: 0 0 0 0 rgba(229,57,53,0); }
}
.lq-vm-recording {
    animation: lq-vm-pulse 1s ease-in-out infinite;
    background: #c62828;
}
.lq-vm-duration-display {
    font-size: 1.1rem;
    font-weight: 700;
    color: #c62828;
    min-height: 1.4em;
    letter-spacing: 0.04em;
}
.lq-vm-privacy-notice {
    font-size: 0.78rem;
    color: #555;
    margin: 2px 0 0;
    text-align: center;
}
/* playback */
.lq-vm-playback-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
}
.lq-vm-playback-controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}
.lq-vm-play-btn,
.lq-vm-rerecord-btn,
.lq-vm-continue-btn {
    min-height: 48px;
    min-width: 120px;
    padding: 10px 20px;
    border-radius: 8px;
    border: 2px solid;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.15s, color 0.15s;
}
.lq-vm-play-btn {
    background: #1565c0;
    color: #fff;
    border-color: #1565c0;
}
.lq-vm-play-btn:hover { background: #0d47a1; }
.lq-vm-rerecord-btn {
    background: #fff;
    color: #555;
    border-color: #999;
}
.lq-vm-rerecord-btn:hover { background: #f5f5f5; }
.lq-vm-rec-duration-label {
    font-size: 0.85rem;
    color: #777;
}
/* continue */
.lq-vm-continue-area {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}
.lq-vm-continue-btn {
    background: #2e7d32;
    color: #fff;
    border-color: #2e7d32;
    min-width: 160px;
}
.lq-vm-continue-btn:hover { background: #1b5e20; }
/* too-fast modal */
.lq-vm-modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    z-index: 100;
}
.lq-vm-modal-overlay[hidden] { display: none; }
.lq-vm-modal-box {
    background: #fff;
    border-radius: 12px;
    padding: 28px 32px;
    max-width: 340px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.lq-vm-modal-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 10px;
    color: #e53935;
}
.lq-vm-modal-body {
    font-size: 1rem;
    color: #333;
    margin: 0 0 20px;
    line-height: 1.5;
}
.lq-vm-modal-btn {
    background: #1565c0;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 28px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 48px;
    min-width: 120px;
}
.lq-vm-modal-btn:hover { background: #0d47a1; }
`;

    const style = document.createElement('style');
    style.id = 'lq-vm-styles';
    style.textContent = css;
    document.head.appendChild(style);
}
