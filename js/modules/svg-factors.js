import { LINK_COLORS } from './svg-base10.js';

export function getFactorPairs(n) {
    const pairs = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            pairs.push([i, n / i]);
        }
    }
    return pairs;
}

// Create factor links SVG - matches the Math Monks rainbow style
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
    const colors = forPrint ? LINK_COLORS.print : LINK_COLORS.pastel;
    
    // Calculate dimensions dynamically based on numPairs
    const boxSize = forPrint ? 18 : Math.max(14, Math.min(18, width / 10));
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
    for (let i = 0; i < numPairs; i++) {
        const radius = outerRadius - (i * arcSpacing);
        const color = colors[i % colors.length];
        
        // Arc path (semicircle)
        const startX = centerX - radius;
        const endX = centerX + radius;
        
        // Draw arc with border for print clarity
        if (forPrint) {
            // Dark outline for print
            arcs += `<path d="M ${startX} ${baseY} A ${radius} ${radius} 0 0 1 ${endX} ${baseY}" 
                     fill="none" stroke="#333" stroke-width="${strokeWidth + 2}" 
                     stroke-linecap="round"/>`;
        }
        arcs += `<path d="M ${startX} ${baseY} A ${radius} ${radius} 0 0 1 ${endX} ${baseY}" 
                 fill="none" stroke="${color}" stroke-width="${strokeWidth}" 
                 stroke-linecap="round"/>`;
        
        // Factor boxes at the ends of each arc
        const leftBoxX = startX - boxSize/2;
        const rightBoxX = endX - boxSize/2;
        const boxY = baseY + 2;
        
        const pair = pairs[i];
        const leftVal = showAnswers ? pair[0] : '';
        const rightVal = showAnswers ? pair[1] : '';
        
        // Left box
        boxes += `<rect x="${leftBoxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" 
                  fill="white" stroke="#333" stroke-width="1.5" rx="2"/>`;
        if (showAnswers) {
            boxes += `<text x="${leftBoxX + boxSize/2}" y="${boxY + boxSize/2 + 4}" 
                      text-anchor="middle" font-size="${Math.max(8, boxSize * 0.55)}" font-weight="600" fill="#333">${leftVal}</text>`;
        }
        
        // Right box
        boxes += `<rect x="${rightBoxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" 
                  fill="white" stroke="#333" stroke-width="1.5" rx="2"/>`;
        if (showAnswers) {
            boxes += `<text x="${rightBoxX + boxSize/2}" y="${boxY + boxSize/2 + 4}" 
                      text-anchor="middle" font-size="${Math.max(8, boxSize * 0.55)}" font-weight="600" fill="#333">${rightVal}</text>`;
        }
    }
    
    // Number box at top center
    const numBoxWidth = forPrint ? 40 : Math.max(28, width / 5);
    const numBoxHeight = forPrint ? 24 : Math.max(16, height / 6);
    const numBoxX = centerX - numBoxWidth/2;
    const numBoxY = Math.max(2, baseY - outerRadius - numBoxHeight/2 - 2);
    
    const numberBox = `
        <rect x="${numBoxX}" y="${numBoxY}" width="${numBoxWidth}" height="${numBoxHeight}" 
              fill="white" stroke="#333" stroke-width="2" rx="4"/>
        <text x="${centerX}" y="${numBoxY + numBoxHeight/2 + 5}" 
              text-anchor="middle" font-size="${forPrint ? 14 : Math.max(10, numBoxHeight * 0.6)}" font-weight="700" fill="#333">${number}</text>
    `;
    
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${arcs}
        ${boxes}
        ${numberBox}
    </svg>`;
}

// Create analog clock SVG
