// Pure utility functions with no dependencies

export function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export function shuffle(array) { for (let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];} return array; }

export function pick(array) { return array[randInt(0, array.length - 1)]; }

export function buildNumericOptions(correct) {
    const opts = new Set([correct]);
    const spread = Math.max(5, Math.round(Math.abs(correct) * 0.2) || 5);
    let buildAttempts = 0;
    while (opts.size < 4 && buildAttempts < 50) {
        buildAttempts++;
        let delta = randInt(1, spread);
        if (Math.random() < 0.5) delta *= -1;
        const candidate = correct + delta;
        if (candidate >= 0) opts.add(candidate);
    }
    let fallback = 1;
    while (opts.size < 4) {
        opts.add(correct + fallback);
        fallback++;
    }
    return shuffle([...opts]);
}

export function simplifyFraction(n, d) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const g = gcd(Math.abs(n), Math.abs(d));
    return `${n / g}/${d / g}`;
}

export function normalizeText(str) {
    return str.toString().trim().replace(/\s+/g, "").toLowerCase();
}

export function fracText(num, den) {
    return `${num}/${den}`;
}

export function fractionToPercent(n, d) { return Math.round((n / d) * 100) + "%"; }
