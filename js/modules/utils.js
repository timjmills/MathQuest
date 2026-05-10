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

// ========================================
// DIVERSE STUDENT NAMES + WORD-PROBLEM NOUN POOLS
// Centralized so word-problem generators across modules share one diverse roster.
// ========================================
export const STUDENT_NAMES = [
    "Maya","Liam","Ava","Noah","Mia","Eli","Zoe","Owen",      // existing roster
    "Sara","James","Lily","Ben","Emma","Olivia","Ethan","Sophia","Mason","Lucas",
    "Maria","Sofia","Aisha","Noor","Amir","Diego","Carlos","Layla",  // diverse additions
    "Kai","Jin","Hana","Ravi","Priya","Arjun","Zara","Yuki",
    "Amari","Jamal","Tariq","Imani","Rosa","Marcus","Kenji","Aaliyah"
];

export const WORD_PROBLEM_NOUNS = {
    food: ["apples","cookies","oranges","grapes","muffins","bananas","cherries","berries","sandwiches","pretzels","crackers"],
    school: ["pencils","stickers","books","markers","erasers","notebooks","crayons"],
    hobbies: ["marbles","cards","stamps","coins","rocks","seashells"],
    sports: ["soccer balls","basketballs","tennis balls","laps","goals","points"],
    nature: ["leaves","seeds","flowers","trees","butterflies","ladybugs"],
    music: ["songs","albums","beats","notes","records"],
    tech: ["videos","photos","emails","texts","games","apps"]
};

export function pickName(rng) {
    const r = (rng != null) ? rng : Math.random;
    const i = Math.floor(r() * STUDENT_NAMES.length);
    return STUDENT_NAMES[i];
}

export function pickTwoNames(rng) {
    const r = (rng != null) ? rng : Math.random;
    const a = pickName(r);
    let b = pickName(r);
    let tries = 0;
    while (b === a && tries < 5) { b = pickName(r); tries++; }
    return [a, b];
}

export function pickNoun(category) {
    if (category && WORD_PROBLEM_NOUNS[category]) {
        const list = WORD_PROBLEM_NOUNS[category];
        return list[Math.floor(Math.random() * list.length)];
    }
    // Random category
    const cats = Object.keys(WORD_PROBLEM_NOUNS);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const list = WORD_PROBLEM_NOUNS[cat];
    return list[Math.floor(Math.random() * list.length)];
}
