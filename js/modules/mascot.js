// Mascot — owl-rocket character ported from the duo redesign handoff.
// Renders an SVG, injects a card into the home view, and provides a brief
// celebration overlay used on streak milestones.

export function getMascotSVG(size = 110) {
    return `
<svg class="mq-mascot-svg" viewBox="0 0 140 160" width="${size}" height="${Math.round(size * 160/140)}" aria-hidden="true">
  <defs>
    <linearGradient id="mq-mascot-body" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#9F86F2"/>
      <stop offset="1" stop-color="#7C5CE6"/>
    </linearGradient>
    <linearGradient id="mq-mascot-belly" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#FFE7B5"/>
      <stop offset="1" stop-color="#FFCFA8"/>
    </linearGradient>
  </defs>
  <ellipse cx="70" cy="148" rx="36" ry="6" fill="rgba(0,0,0,0.12)"/>
  <ellipse cx="56" cy="142" rx="9" ry="5" fill="#FF8A3D"/>
  <ellipse cx="84" cy="142" rx="9" ry="5" fill="#FF8A3D"/>
  <path d="M25 88 C25 50, 45 28, 70 28 C95 28, 115 50, 115 88 C115 122, 95 138, 70 138 C45 138, 25 122, 25 88 Z" fill="url(#mq-mascot-body)"/>
  <ellipse cx="70" cy="100" rx="28" ry="32" fill="url(#mq-mascot-belly)"/>
  <path d="M28 90 C20 100, 22 118, 38 124 L38 90 Z" fill="#5E3FCC"/>
  <path d="M112 90 C120 100, 118 118, 102 124 L102 90 Z" fill="#5E3FCC"/>
  <circle cx="56" cy="72" r="14" fill="white"/>
  <circle cx="84" cy="72" r="14" fill="white"/>
  <circle cx="58" cy="74" r="6" fill="#2B2840"/>
  <circle cx="86" cy="74" r="6" fill="#2B2840"/>
  <circle cx="60" cy="72" r="2" fill="white"/>
  <circle cx="88" cy="72" r="2" fill="white"/>
  <path d="M64 86 L70 95 L76 86 Z" fill="#FF8A3D" stroke="#E5722B" stroke-width="1"/>
  <path d="M70 28 C66 18, 72 12, 70 6 C68 12, 74 18, 70 28" fill="#FFD66B"/>
  <circle cx="70" cy="6" r="3" fill="#FFD66B"/>
  <ellipse cx="46" cy="88" rx="5" ry="3" fill="#FFB7C2" opacity="0.7"/>
  <ellipse cx="94" cy="88" rx="5" ry="3" fill="#FFB7C2" opacity="0.7"/>
</svg>`;
}

const MASCOT_LINES = [
    "Ready for today's quest? Let's go!",
    "Math powers up — let's stack some XP!",
    "I believe in you. One question at a time!",
    "Streaks build heroes. Keep going!",
    "Brain warmups — pick your mode!"
];

const CHEER_LINES = [
    "Nice work!",
    "On fire!",
    "Boom — correct!",
    "Keep it up!",
    "Yes! That's the way."
];

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function findChooseModeSection() {
    // Match by section-title text — emoji-tolerant so "🎮 Choose Mode" or "Choose Mode" both work
    const titles = document.querySelectorAll('#homeView .section .section-title');
    for (const t of titles) {
        if (/choose\s*mode/i.test(t.textContent || '')) return t.closest('.section');
    }
    return null;
}

export function injectHomeMascot() {
    if (document.getElementById('mqHomeMascot')) return;
    const section = findChooseModeSection();
    if (!section) return; // Defensive: bail if Choose Mode section is absent
    const modeCards = section.querySelector('.mode-cards');
    if (!modeCards) return;

    const card = document.createElement('div');
    card.id = 'mqHomeMascot';
    card.className = 'mq-mascot-card';
    card.innerHTML = `
        <div class="mq-mascot-bubble">${pick(MASCOT_LINES)}</div>
        <div class="mq-mascot-stage">${getMascotSVG(110)}</div>
    `;

    // Wrap the existing .mode-cards alongside the mascot in a flex row.
    // Mascot first → renders on the LEFT of the mode cards.
    const row = document.createElement('div');
    row.className = 'choose-mode-row';
    modeCards.parentNode.insertBefore(row, modeCards);
    row.appendChild(card);
    row.appendChild(modeCards);
}

let cheerLock = false;
export function flashMascotCheer(message) {
    if (cheerLock) return;
    cheerLock = true;
    const msg = message || pick(CHEER_LINES);
    const overlay = document.createElement('div');
    overlay.className = 'mq-mascot-cheer';
    overlay.innerHTML = `
        <div class="mq-mascot-cheer-bubble">${msg}</div>
        <div class="mq-mascot-cheer-figure">${getMascotSVG(140)}</div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('on'));
    setTimeout(() => {
        overlay.classList.remove('on');
        setTimeout(() => { overlay.remove(); cheerLock = false; }, 240);
    }, 900);
}

if (typeof window !== 'undefined') {
    window.getMascotSVG = getMascotSVG;
    window.injectHomeMascot = injectHomeMascot;
    window.flashMascotCheer = flashMascotCheer;
}
