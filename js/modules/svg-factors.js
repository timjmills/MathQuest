import { LINK_COLORS } from './svg-base10.js';

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

export function getFactorPairs(n) {
    const pairs = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            pairs.push([i, n / i]);
        }
    }
    return pairs;
}

// Create factor links SVG — IXL-aligned single-color link diagram.
// (Was a Math Monks rainbow; collapsed to single primary hue for the
// professional-curriculum aesthetic. Print mode keeps darker primary.)
export function createFactorLinksSVG(number, options = {}) {
    const {
        width = 260,
        height = 170,
        forPrint = false,
        showAnswers = false,
        maxPairs = 6
    } = options;

    const pairs = getFactorPairs(number);
    const numPairs = Math.min(pairs.length, maxPairs);

    // Single-color link palette (was LINK_COLORS.pastel/print rainbow).
    const linkColor = forPrint ? _DT_COLORS.primaryDark : _DT_COLORS.primary;

    // Determine the widest factor label so boxes/text never clip the digits.
    let maxDigits = 1;
    for (let i = 0; i < numPairs; i++) {
        maxDigits = Math.max(maxDigits, String(pairs[i][1]).length);
    }
    const digitBump = Math.max(0, maxDigits - 2) * 7; // extra px per digit > 2

    // Calculate dimensions dynamically based on numPairs and label width.
    const boxSize = (forPrint ? 18 : Math.max(14, Math.min(18, width / 10))) + digitBump;
    const minInnerRadius = forPrint ? 18 : 12; // Minimum radius for innermost arc
    const strokeWidth = forPrint ? 12 : Math.max(5, Math.min(10, width / 28));

    // Calculate outer radius and spacing to fit all arcs
    const maxOuterRadius = (width - boxSize * 2 - 10) / 2;
    const availableSpace = maxOuterRadius - minInnerRadius;
    const arcSpacing = numPairs > 1 ? Math.min(availableSpace / (numPairs - 1), strokeWidth + 4) : 0;
    const outerRadius = minInnerRadius + (numPairs - 1) * arcSpacing;

    const centerX = width / 2;
    const baseY = height - boxSize - 4;

    let arcs = '';
    let boxes = '';

    // Draw link arcs from outside (first pair) to inside (last pair)
    // Single-color per token spec; print gets a subtle dark outline for ink.
    for (let i = 0; i < numPairs; i++) {
        const radius = outerRadius - (i * arcSpacing);

        // Arc path (semicircle)
        const startX = centerX - radius;
        const endX = centerX + radius;

        // Print: thin dark halo behind the colored link for ink contrast.
        if (forPrint) {
            arcs += `<path d="M ${startX} ${baseY} A ${radius} ${radius} 0 0 1 ${endX} ${baseY}"
                     fill="none" stroke="${_DT_COLORS.axis}" stroke-width="${strokeWidth + 2}"
                     stroke-linecap="round"/>`;
        }
        arcs += `<path d="M ${startX} ${baseY} A ${radius} ${radius} 0 0 1 ${endX} ${baseY}"
                 fill="none" stroke="${linkColor}" stroke-width="${strokeWidth}"
                 stroke-linecap="round"/>`;

        // Factor boxes at the ends of each arc
        const leftBoxX = startX - boxSize/2;
        const rightBoxX = endX - boxSize/2;
        const boxY = baseY + 2;

        const pair = pairs[i];
        const leftVal = showAnswers ? pair[0] : '';
        const rightVal = showAnswers ? pair[1] : '';

        // Left box — hairline divisions, normal outline per token spec
        boxes += `<rect x="${leftBoxX}" y="${boxY}" width="${boxSize}" height="${boxSize}"
                  fill="${_DT_COLORS.bg}" stroke="${_DT_COLORS.axis}" stroke-width="${_DT_STROKE.normal}" rx="2"/>`;
        if (showAnswers) {
            boxes += `<text x="${leftBoxX + boxSize/2}" y="${boxY + boxSize/2 + 4}"
                      text-anchor="middle" dominant-baseline="middle"
                      font-size="${Math.max(8, Math.min(boxSize * 0.55, boxSize * 1.6 / Math.max(1, maxDigits)))}"
                      font-weight="600" fill="${_DT_COLORS.text}"
                      font-family='${_DT_FONT}'>${leftVal}</text>`;
        }

        // Right box
        boxes += `<rect x="${rightBoxX}" y="${boxY}" width="${boxSize}" height="${boxSize}"
                  fill="${_DT_COLORS.bg}" stroke="${_DT_COLORS.axis}" stroke-width="${_DT_STROKE.normal}" rx="2"/>`;
        if (showAnswers) {
            boxes += `<text x="${rightBoxX + boxSize/2}" y="${boxY + boxSize/2 + 4}"
                      text-anchor="middle" dominant-baseline="middle"
                      font-size="${Math.max(8, Math.min(boxSize * 0.55, boxSize * 1.6 / Math.max(1, maxDigits)))}"
                      font-weight="600" fill="${_DT_COLORS.text}"
                      font-family='${_DT_FONT}'>${rightVal}</text>`;
        }
    }

    // Number box at top center — widen to fit digit count of the factored number.
    const numStr = String(number);
    const baseW = forPrint ? 40 : Math.max(28, width / 5);
    const numBoxWidth = baseW + Math.max(0, numStr.length - 2) * (forPrint ? 8 : 6);
    const numBoxHeight = forPrint ? 24 : Math.max(16, height / 6);
    const numBoxX = centerX - numBoxWidth/2;
    const numBoxY = Math.max(2, baseY - outerRadius - numBoxHeight/2 - 2);

    // The "T-chart" / number-box outline uses normal stroke per spec.
    const numberBox = `
        <rect x="${numBoxX}" y="${numBoxY}" width="${numBoxWidth}" height="${numBoxHeight}"
              fill="${_DT_COLORS.bg}" stroke="${_DT_COLORS.axis}" stroke-width="${_DT_STROKE.normal}" rx="4"/>
        <text x="${centerX}" y="${numBoxY + numBoxHeight/2 + 5}"
              text-anchor="middle" dominant-baseline="middle"
              font-size="${forPrint ? 14 : Math.max(10, numBoxHeight * 0.6)}"
              font-weight="700" fill="${_DT_COLORS.text}"
              font-family='${_DT_FONT}'>${number}</text>
    `;

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${arcs}
        ${boxes}
        ${numberBox}
    </svg>`;
}

// Create analog clock SVG
