// passage-render.js — Literacy Quest passage rendering engine.
//
// Wraps a Passage object (DATA_MODEL.md §4) as line-numbered,
// paragraph-numbered, sentence-numbered, word-tokenized HTML.
//
// Exports:
//   renderPassage(passage, container, options)
//   getTokensInGranularity(passage, granularity)
//
// Does NOT import from state.js or any game-control module.
// Audio calls reach out to window.speakQuestion / window.speakAnswerOption
// (attached by globals.js via hints-speech.js) so no direct import is needed.

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LINE_WRAP_APPROX_CHARS = 65;   // Approximate characters before a visual line wrap

// ---------------------------------------------------------------------------
// Tokenisation
// ---------------------------------------------------------------------------

/**
 * Tokenise a paragraph string into sentences, then words.
 * Returns a nested array: [ sentence[] ]  where sentence = word[].
 *
 * @param {string} paraText
 * @returns {Array<Array<string>>} sentences → words
 */
function tokeniseParaToSentences(paraText) {
    // Split on sentence-ending punctuation; keep the delimiter with the preceding text.
    const raw = paraText.match(/[^.!?]+[.!?]*/g) || [paraText];
    return raw
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s.split(/\s+/).filter(w => w.length > 0));
}

/**
 * Build the full flat token list from a passage.
 * Each token: { paragraph, sentence, word, text, globalIndex }
 *
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Passage} passage
 * @returns {Array<{paragraph:number, sentence:number, word:number, text:string, globalIndex:number}>}
 */
function buildTokenList(passage) {
    const tokens = [];
    let globalIndex = 0;
    const paragraphs = passage.paragraphs || [passage.text || ''];
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const sentences = tokeniseParaToSentences(paragraphs[pIdx]);
        for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
            const words = sentences[sIdx];
            for (let wIdx = 0; wIdx < words.length; wIdx++) {
                tokens.push({
                    paragraph: pIdx,
                    sentence: sIdx,
                    word: wIdx,
                    text: words[wIdx],
                    globalIndex: globalIndex++,
                });
            }
        }
    }
    return tokens;
}

// ---------------------------------------------------------------------------
// HTML building
// ---------------------------------------------------------------------------

/**
 * Escape a string for safe HTML insertion.
 * @param {string} str
 * @returns {string}
 */
function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Compute approximate visual line numbers for each paragraph.
 * Returns an object mapping paragraph index → { startLine, endLine }.
 *
 * Used for gutter line-number display (line numbers are per paragraph,
 * not per physical wrapped line, to keep things simple at phase 1).
 *
 * @param {string[]} paragraphs
 * @returns {Array<{startLine:number, lineCount:number}>}
 */
function computeLineNumbers(paragraphs) {
    let currentLine = 1;
    return (paragraphs || []).map(para => {
        const charCount = para.length;
        const lineCount = Math.max(1, Math.ceil(charCount / LINE_WRAP_APPROX_CHARS));
        const result = { startLine: currentLine, lineCount };
        currentLine += lineCount;
        return result;
    });
}

/**
 * Build the HTML for a single per-line audio button.
 * @param {string} text - The text to speak aloud
 * @param {number} lineNum - Line number label
 * @returns {string} HTML string
 */
function buildLineAudioBtn(text, lineNum) {
    const safeText = esc(text).replace(/'/g, "\\'");
    return `<button type="button" class="lq-line-audio-btn" aria-label="Listen to line ${lineNum}"` +
        ` onclick="if(window.speakQuestion){window.speakQuestion('${safeText}')}">&#128266;</button>`;
}

/**
 * Render a single paragraph as tokenized HTML.
 * Each word is wrapped in a `<span>` with data attributes.
 * Sentences are wrapped in `<span class="lq-passage-sentence">`.
 *
 * @param {string} paraText
 * @param {number} pIdx  - 0-based paragraph index
 * @param {{showLineNumbers:boolean, lineInfo:{startLine:number,lineCount:number}, audioControls:string}} opts
 * @returns {string} HTML string (no outer wrapper — caller adds <div data-paragraph>)
 */
function renderParagraphHtml(paraText, pIdx, opts) {
    const sentences = tokeniseParaToSentences(paraText);
    let html = '';

    for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
        const words = sentences[sIdx];
        let sentenceHtml = '';
        for (let wIdx = 0; wIdx < words.length; wIdx++) {
            const word = words[wIdx];
            sentenceHtml += `<span class="lq-passage-word"` +
                ` data-paragraph="${pIdx}"` +
                ` data-sentence="${pIdx}.${sIdx}"` +
                ` data-word="${pIdx}.${sIdx}.${wIdx}"` +
                `>${esc(word)}</span>`;
            // Add space between words (not after the last word in a sentence)
            if (wIdx < words.length - 1) sentenceHtml += ' ';
        }
        html += `<span class="lq-passage-sentence"` +
            ` data-paragraph="${pIdx}"` +
            ` data-sentence="${pIdx}.${sIdx}"` +
            `>${sentenceHtml}</span> `;
    }

    return html.trim();
}

// ---------------------------------------------------------------------------
// Line-reader mask
// ---------------------------------------------------------------------------

/**
 * Inject the line-reader overlay and attach mouse-tracking logic.
 * The mask covers the passage except for one visible "window" row.
 * @param {Element} container - The .lq-passage-container element
 */
function injectLineReaderMask(container) {
    if (!container) return;
    if (container.querySelector('.lq-line-reader-mask')) return;

    const mask = document.createElement('div');
    mask.className = 'lq-line-reader-mask';
    mask.setAttribute('aria-hidden', 'true');

    const window_ = document.createElement('div');
    window_.className = 'lq-line-reader-window';

    mask.appendChild(window_);
    container.appendChild(mask);
    container.classList.add('lq-line-reader-active');

    // Track pointer movement — update the reveal window position
    let windowHeight = 32;
    mask.addEventListener('pointermove', (e) => {
        const rect = mask.getBoundingClientRect();
        const relY = e.clientY - rect.top;
        const snapY = Math.floor(relY / windowHeight) * windowHeight;
        window_.style.top = `${snapY}px`;
        window_.style.height = `${windowHeight}px`;
    });

    mask.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? windowHeight : -windowHeight;
        const current = parseInt(window_.style.top || '0', 10);
        window_.style.top = `${Math.max(0, current + delta)}px`;
    }, { passive: false });
}

// ---------------------------------------------------------------------------
// Primary export
// ---------------------------------------------------------------------------

/**
 * Render a passage into a DOM container.
 *
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Passage} passage
 * @param {Element} container - DOM element to render into
 * @param {{
 *   showLineNumbers?: boolean,
 *   showParagraphNumbers?: boolean,
 *   audioControls?: 'none'|'top'|'per-line',
 *   granularity?: 'word'|'sentence'|'paragraph',
 *   lineReader?: boolean,
 * }} options
 */
export function renderPassage(passage, container, options = {}) {
    if (!container) {
        console.warn('[passage-render] renderPassage: container is null');
        return;
    }

    const {
        showLineNumbers = true,
        showParagraphNumbers = false,
        audioControls = 'top',
        lineReader = false,
    } = options;

    const paragraphs = passage.paragraphs || [passage.text || ''];
    const lineInfos = computeLineNumbers(paragraphs);
    const ttsText = passage.audio_text || passage.text || paragraphs.join(' ');

    // Build outer wrapper
    let html = `<div class="lq-passage-container" data-passage-id="${esc(passage.id || '')}"` +
        ` data-genre="${esc(passage.genre || '')}" data-lexile="${esc(String(passage.lexile || ''))}">`;

    // --- Passage header ---
    html += `<div class="lq-passage-header">`;
    if (audioControls === 'top') {
        const safeText = esc(ttsText).replace(/'/g, "\\'");
        html += `<button type="button" class="lq-passage-audio-btn" aria-label="Read passage aloud"` +
            ` onclick="if(window.speakQuestion){window.speakQuestion('${safeText}')}">` +
            `&#128266; Read passage</button>`;
    }
    if (passage.source_attribution) {
        html += `<span class="lq-passage-attribution">${esc(passage.source_attribution)}</span>`;
    }
    html += `</div>`;

    // --- Passage body ---
    html += `<div class="lq-passage-body">`;

    if (showLineNumbers) {
        html += `<div class="lq-passage-with-gutter">`;
        html += `<div class="lq-line-gutter" aria-hidden="true">`;
        // Emit one gutter label per approximate visual line
        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
            const info = lineInfos[pIdx];
            for (let ln = 0; ln < info.lineCount; ln++) {
                const lineNum = info.startLine + ln;
                // Only print every 5th line number
                const label = (lineNum % 5 === 0) ? String(lineNum) : ' ';
                html += `<div class="lq-gutter-line">${label}</div>`;
            }
        }
        html += `</div>`; // .lq-line-gutter

        html += `<div class="lq-passage-text">`;
    } else {
        html += `<div class="lq-passage-text">`;
    }

    // Render paragraphs
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const paraText = paragraphs[pIdx];
        const info = lineInfos[pIdx];
        const paraNum = pIdx + 1;

        let paraAttrs = `class="lq-passage-paragraph" data-paragraph="${pIdx}"`;
        if (showParagraphNumbers) {
            paraAttrs += ` data-para-label="${paraNum}"`;
        }

        html += `<div ${paraAttrs}>`;

        if (showParagraphNumbers) {
            html += `<span class="lq-para-num" aria-hidden="true">${paraNum}.</span> `;
        }

        html += renderParagraphHtml(paraText, pIdx, {
            showLineNumbers,
            lineInfo: info,
            audioControls,
        });

        if (audioControls === 'per-line') {
            // One audio button per approximate visual line
            const lineAudioHtml = buildLineAudioBtn(paraText, info.startLine);
            html += ` ${lineAudioHtml}`;
        }

        html += `</div>`; // .lq-passage-paragraph
    }

    html += `</div>`; // .lq-passage-text

    if (showLineNumbers) {
        html += `</div>`; // .lq-passage-with-gutter
    }

    html += `</div>`; // .lq-passage-body
    html += `</div>`; // .lq-passage-container

    container.innerHTML = html;

    // Line-reader mask injection (post-render DOM manipulation)
    if (lineReader) {
        const passageContainer = container.querySelector('.lq-passage-container');
        if (passageContainer) injectLineReaderMask(passageContainer);
    }
}

// ---------------------------------------------------------------------------
// Utility export
// ---------------------------------------------------------------------------

/**
 * Return a flat array of tokens from a passage at the requested granularity.
 * Used by hot-text-passage.js to build the selectable-text item widget.
 *
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Passage} passage
 * @param {"word"|"sentence"|"paragraph"} granularity
 * @returns {Array<{paragraph:number, sentence?:number, word?:number, text:string, globalIndex:number}>}
 */
export function getTokensInGranularity(passage, granularity) {
    if (granularity === 'paragraph') {
        const paragraphs = passage.paragraphs || [passage.text || ''];
        return paragraphs.map((text, idx) => ({
            paragraph: idx,
            text,
            globalIndex: idx,
        }));
    }

    if (granularity === 'sentence') {
        const paragraphs = passage.paragraphs || [passage.text || ''];
        const result = [];
        let globalIndex = 0;
        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
            const sentences = tokeniseParaToSentences(paragraphs[pIdx]);
            for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
                result.push({
                    paragraph: pIdx,
                    sentence: sIdx,
                    text: sentences[sIdx].join(' '),
                    globalIndex: globalIndex++,
                });
            }
        }
        return result;
    }

    // Default: word-level
    return buildTokenList(passage);
}
