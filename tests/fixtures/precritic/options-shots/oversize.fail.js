// ws-options-shots backtest fixture (critic-panel-r1 F4, clipping): models an oversize regression. Every 50 ms the panel
// sample's stage is drawn at scale 1, so a tall sample overflows its frame while still covering all of it (the old gate's
// "covers >= 90 %" escape passed exactly this).
setInterval(() => {
    const st = document.querySelector('#skillOptionsPopover .tv-sko-frame > .tvp-stage');
    if (st) st.style.transform = 'translate(-50%, -50%) scale(1)';
}, 50);
