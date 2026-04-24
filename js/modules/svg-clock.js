import { randInt, shuffle, pick } from './utils.js';
import { CLOCK_COLORS } from './svg-base10.js';

// IXL-aligned design tokens (Round 4)
const _DT_COLORS = {
  bg: '#ffffff', axis: '#212121', grid: '#e6e8ec', text: '#212121',
  primary: '#1e88e5', primaryDark: '#1565c0',
  fill: ['#1e88e5','#43a047','#fb8c00','#8e24aa','#e53935','#00897b'],
  correct: '#2e7d32', wrong: '#c62828', neutral: '#9e9e9e',
};
const _DT_STROKE = { hair: 0.75, normal: 1.5, bold: 2.5 };
const _DT_FONT = '"Open Sans", "Inter", system-ui, -apple-system, sans-serif';
function _dtFill(i) { return _DT_COLORS.fill[i % _DT_COLORS.fill.length]; }

export function createAnalogClockSVG(hour, minute, options = {}) {
    const {
        size = 150,
        colorScheme = 'blue',
        showAllNumbers = true,
        showMinuteTicks = true,
        showHourTicks = true,
        forPrint = false,
        highlightTime = false
    } = options;

    // Legacy CLOCK_COLORS still used as fallback for forPrint face tint.
    const legacyColors = forPrint ? CLOCK_COLORS.gray : (CLOCK_COLORS[colorScheme] || CLOCK_COLORS.blue);
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) - 8;
    const numberRadius = radius - 18;
    const hourTickRadius = radius - 8;
    const minuteTickRadius = radius - 4;

    // Normalize hour to 12-hour format
    const displayHour = hour % 12 || 12;

    // Calculate hand angles (0 degrees = 12 o'clock, clockwise)
    // Hour hand moves 30 degrees per hour + 0.5 degrees per minute
    const hourAngle = (displayHour * 30) + (minute * 0.5) - 90;
    // Minute hand moves 6 degrees per minute
    const minuteAngle = (minute * 6) - 90;

    // Hand lengths
    const hourHandLength = radius * 0.5;
    const minuteHandLength = radius * 0.75;

    // Calculate hand end points
    const hourX = cx + hourHandLength * Math.cos(hourAngle * Math.PI / 180);
    const hourY = cy + hourHandLength * Math.sin(hourAngle * Math.PI / 180);
    const minuteX = cx + minuteHandLength * Math.cos(minuteAngle * Math.PI / 180);
    const minuteY = cy + minuteHandLength * Math.sin(minuteAngle * Math.PI / 180);

    // Responsive clock SVG: scale within viewport while preserving aspect ratio.
    // forPrint mode keeps absolute sizing for the worksheet generator.
    const sizeAttr = forPrint
        ? `width="${size}" height="${size}"`
        : `width="${size}" height="${size}" style="display:block;max-width:min(${size}px,42vh);max-height:42vh;height:auto;"`;
    let svg = `<svg ${sizeAttr} viewBox="0 0 ${size} ${size}">`;

    // Clock face — IXL: white background with normal-stroke axis outline.
    // forPrint preserves CLOCK_COLORS.gray face tint for ink-friendly output.
    const faceFill = forPrint ? legacyColors.face : _DT_COLORS.bg;
    svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${faceFill}" stroke="${_DT_COLORS.axis}" stroke-width="${_DT_STROKE.normal}"/>`;

    // Highlight ring if needed (legacy callers); now uses primary token color.
    if (highlightTime) {
        svg += `<circle cx="${cx}" cy="${cy}" r="${radius + 2}" fill="none" stroke="${_DT_COLORS.primary}" stroke-width="${_DT_STROKE.normal}" stroke-dasharray="5,3"/>`;
    }

    // Minute ticks — hairline (0.75) per token spec
    if (showMinuteTicks) {
        for (let i = 0; i < 60; i++) {
            if (i % 5 !== 0) { // Skip hour positions (drawn below as bold/normal)
                const angle = (i * 6 - 90) * Math.PI / 180;
                const x1 = cx + minuteTickRadius * Math.cos(angle);
                const y1 = cy + minuteTickRadius * Math.sin(angle);
                const x2 = cx + radius * Math.cos(angle);
                const y2 = cy + radius * Math.sin(angle);
                svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${_DT_COLORS.axis}" stroke-width="${_DT_STROKE.hair}"/>`;
            }
        }
    }

    // Hour (5-minute) ticks — bold-leaning normal stroke (1.5) per spec
    if (showHourTicks) {
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x1 = cx + hourTickRadius * Math.cos(angle);
            const y1 = cy + hourTickRadius * Math.sin(angle);
            const x2 = cx + radius * Math.cos(angle);
            const y2 = cy + radius * Math.sin(angle);
            svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${_DT_COLORS.axis}" stroke-width="${_DT_STROKE.normal}"/>`;
        }
    }

    // Numerals 1-12 — Open Sans token font, 14-16pt
    const numbers = showAllNumbers ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [12, 3, 6, 9];
    const fontSize = Math.max(14, Math.min(16, size / 8));
    numbers.forEach(num => {
        const angle = ((num % 12) * 30 - 90) * Math.PI / 180;
        const x = cx + numberRadius * Math.cos(angle);
        const y = cy + numberRadius * Math.sin(angle);
        svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
            font-size="${fontSize}" font-weight="700" fill="${_DT_COLORS.text}"
            font-family='${_DT_FONT}'>${num}</text>`;
    });

    // Hands — IXL uses ONE color for both hour and minute hands. Length and
    // weight differ; color does not. Both use _DT_COLORS.primary.
    svg += `<line x1="${cx}" y1="${cy}" x2="${hourX}" y2="${hourY}"
        stroke="${_DT_COLORS.primary}" stroke-width="${_DT_STROKE.bold + 1.5}" stroke-linecap="round"/>`;

    svg += `<line x1="${cx}" y1="${cy}" x2="${minuteX}" y2="${minuteY}"
        stroke="${_DT_COLORS.primary}" stroke-width="${_DT_STROKE.bold}" stroke-linecap="round"/>`;

    // Center pivot — axis color (small inset highlight for depth)
    svg += `<circle cx="${cx}" cy="${cy}" r="5" fill="${_DT_COLORS.text}"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="2" fill="${_DT_COLORS.bg}"/>`;

    svg += `</svg>`;
    return svg;
}

// Create digital clock display
export function createDigitalClockHTML(hour, minute, options = {}) {
    const {
        showAMPM = false,
        use24Hour = false,
        colorScheme = 'yellow',
        size = 'medium' // small, medium, large
    } = options;

    const colors = CLOCK_COLORS[colorScheme] || CLOCK_COLORS.yellow;
    let displayHour = hour;
    let ampm = '';

    if (!use24Hour) {
        ampm = hour >= 12 ? 'PM' : 'AM';
        displayHour = hour % 12 || 12;
    }

    const hourStr = displayHour.toString().padStart(2, '0');
    const minStr = minute.toString().padStart(2, '0');

    const sizes = {
        small: { width: '80px', height: '40px', fontSize: '1.2rem', ampmSize: '0.6rem' },
        medium: { width: '110px', height: '55px', fontSize: '1.6rem', ampmSize: '0.75rem' },
        large: { width: '140px', height: '70px', fontSize: '2rem', ampmSize: '0.9rem' }
    };
    const s = sizes[size] || sizes.medium;

    return `<div style="display:inline-flex;flex-direction:column;align-items:center;background:${colors.face};border:3px solid ${colors.border};border-radius:12px;padding:8px 12px;box-shadow:0 3px 10px rgba(0,0,0,0.15);">
        <div style="background:#222;border-radius:6px;padding:6px 12px;font-family:'JetBrains Mono',monospace;">
            <span style="font-size:${s.fontSize};font-weight:700;color:#7cfc00;text-shadow:0 0 8px #7cfc00;">${hourStr}:${minStr}</span>
            ${showAMPM ? `<span style="font-size:${s.ampmSize};color:#7cfc00;margin-left:4px;">${ampm}</span>` : ''}
        </div>
    </div>`;
}

// Time utility functions
export function addTime(hour, minute, addHours, addMinutes) {
    let totalMinutes = hour * 60 + minute + addHours * 60 + addMinutes;
    // Handle day overflow (keep within 24 hours)
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    return {
        hour: Math.floor(totalMinutes / 60),
        minute: totalMinutes % 60
    };
}

export function subtractTime(hour, minute, subHours, subMinutes) {
    return addTime(hour, minute, -subHours, -subMinutes);
}

export function getElapsedTime(startH, startM, endH, endM) {
    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;
    // Handle crossing midnight
    if (endTotal < startTotal) endTotal += 1440;
    const diff = endTotal - startTotal;
    return {
        hours: Math.floor(diff / 60),
        minutes: diff % 60
    };
}

export function formatTime(hour, minute, use12Hour = true) {
    if (use12Hour) {
        const displayHour = hour % 12 || 12;
        const minStr = minute.toString().padStart(2, '0');
        return `${displayHour}:${minStr}`;
    }
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function formatTimeWithAMPM(hour, minute) {
    const ampm = hour >= 12 ? 'P.M.' : 'A.M.';
    const displayHour = hour % 12 || 12;
    const minStr = minute.toString().padStart(2, '0');
    return `${displayHour}:${minStr} ${ampm}`;
}

export function timeToWords(hour, minute) {
    const hourWords = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
    const minuteWords = {
        0: "o'clock", 15: 'fifteen', 30: 'thirty', 45: 'forty-five',
        5: 'oh-five', 10: 'ten', 20: 'twenty', 25: 'twenty-five',
        35: 'thirty-five', 40: 'forty', 50: 'fifty', 55: 'fifty-five'
    };
    const displayHour = hour % 12 || 12;
    const hourWord = hourWords[displayHour];

    if (minute === 0) return `${hourWord} o'clock`;
    if (minuteWords[minute]) return `${hourWord} ${minuteWords[minute]}`;
    return `${hourWord} ${minute < 10 ? 'oh-' : ''}${numberToWords(minute)}`;
}

export function numberToWords(n) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
}

// Generate clock time distractors (common mistakes)
// GUARANTEES the correct answer is always one of the returned 4 options.
export function generateTimeDistractors(correctHour, correctMinute, type = 'read') {
    const correctStr = formatTime(correctHour, correctMinute);
    // Build a pool of WRONG answers only (never includes correctStr)
    const wrongPool = new Set();
    const addWrong = (str) => { if (str !== correctStr) wrongPool.add(str); };

    // Swapped hands (read minute hand as hour)
    const swappedHour = Math.floor(correctMinute / 5) || 12;
    addWrong(formatTime(swappedHour, correctMinute));

    // Off by one hour
    const plusOne = addTime(correctHour, correctMinute, 1, 0);
    const minusOne = addTime(correctHour, correctMinute, -1, 0);
    addWrong(formatTime(plusOne.hour, plusOne.minute));
    addWrong(formatTime(minusOne.hour, minusOne.minute));

    // Common minute mistakes
    if (correctMinute === 15) addWrong(formatTime(correctHour, 45));
    if (correctMinute === 45) addWrong(formatTime(correctHour, 15));
    if (correctMinute === 30) addWrong(formatTime(correctHour, 0));

    // Mirror minute (60 - minute)
    const mirrorMin = (60 - correctMinute) % 60;
    addWrong(formatTime(correctHour, mirrorMin));

    // Fill the wrong-answer pool to at least 3 with random times
    let attempts = 0;
    while (wrongPool.size < 3 && attempts < 30) {
        const randH = randInt(1, 12);
        const randM = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
        addWrong(formatTime(randH, randM));
        attempts++;
    }

    // Pick up to 3 wrong answers, then add the correct answer, then shuffle.
    // This GUARANTEES the correct answer is in the final returned array.
    const wrongs = shuffle([...wrongPool]).slice(0, 3);
    const final = shuffle([correctStr, ...wrongs]);

    // Defensive guard: if anything ever drops the correct answer, force it back in.
    if (!final.includes(correctStr)) {
        final[0] = correctStr;
    }

    return final;
}

// ===== CLOCK MAGNIFICATION FUNCTIONS =====

// Create a magnifiable clock wrapper
export function createMagnifiableClock(hour, minute, options = {}) {
    const clockSVG = createAnalogClockSVG(hour, minute, options);
    const size = options.size || 150;

    // Wrap the clock in a clickable container
    return `<div class="magnifiable-clock"
                onclick="magnifyClock(${hour}, ${minute}, '${options.colorScheme || 'blue'}')"
                style="display:inline-block;width:${size}px;height:${size}px;position:relative;"
                title="Click to enlarge">
        ${clockSVG}
    </div>`;
}

// Create a clock choice option with magnify button (for multiple choice)
export function createClockChoiceWithMagnify(hour, minute, colorScheme, answerValue, size = 130) {
    const clockSVG = createAnalogClockSVG(hour, minute, { size, colorScheme });
    const borderColor = colorScheme === 'blue' ? '#64b5f6' : colorScheme === 'purple' ? '#ce93d8' : '#81c784';

    return `<div class="clock-choice-container" style="position:relative;display:inline-block;">
        <div class="clock-option"
             style="cursor:pointer;padding:10px;border-radius:16px;border:4px solid ${borderColor};background:white;transition:all 0.2s;"
             onclick="selectClockOption(this, '${answerValue}')"
             data-time="${answerValue}">
            ${clockSVG}
        </div>
        <button class="clock-magnify-btn"
                onclick="event.stopPropagation(); magnifyClock(${hour}, ${minute}, '${colorScheme}')"
                style="position:absolute;top:-8px;right:-8px;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4cc9f0,#7209b7);border:2px solid white;color:white;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:10;"
                title="Enlarge clock">
            🔍
        </button>
    </div>`;
}

// Show magnified clock overlay
export function magnifyClock(hour, minute, colorScheme = 'blue') {
    // Create large clock (300px)
    const largeClock = createAnalogClockSVG(hour, minute, {
        size: 300,
        colorScheme: colorScheme,
        showAllNumbers: true,
        showMinuteTicks: true,
        showHourTicks: true
    });

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'clock-magnify-overlay';
    overlay.id = 'clockMagnifyOverlay';
    overlay.onclick = closeMagnifiedClock;

    overlay.innerHTML = `
        <div class="clock-magnify-container" onclick="event.stopPropagation()">
            <button class="clock-magnify-close" onclick="closeMagnifiedClock()" title="Close">×</button>
            ${largeClock}
            <div class="clock-magnify-hint">Click anywhere or press ESC to close</div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close on Escape key
    document.addEventListener('keydown', handleMagnifyEscape);
}

// Close magnified clock
export function closeMagnifiedClock() {
    const overlay = document.getElementById('clockMagnifyOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeIn 0.2s ease reverse';
        setTimeout(() => overlay.remove(), 150);
    }
    document.removeEventListener('keydown', handleMagnifyEscape);
}

// Handle Escape key to close
export function handleMagnifyEscape(e) {
    if (e.key === 'Escape') {
        closeMagnifiedClock();
    }
}

// Select a clock choice option (called from inline handler in template literal)
export function selectClockOption(element, answerValue) {
    // Use window.checkAnswer since it's registered globally by globals.js
    if (window.checkAnswer) {
        window.checkAnswer(answerValue, element);
    }
}

// ===== Geometry SVG Helper Functions =====

