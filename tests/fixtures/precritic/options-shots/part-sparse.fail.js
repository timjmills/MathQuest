// ws-options-shots backtest fixture (critic-panel-r2 soft spot, the 0.03 % part ink): models a part that is one small
// digit in an otherwise empty box. On part 2 the stage is replaced by a 380 x 260 cell holding "7": its frame holds a few
// hundredths of a per cent of ink (the old part floor passed it), its own box far under the 0.5 % floor.
setInterval(() => {
    const n = document.querySelector('#skillOptionsPopover .tv-sko-part-n');
    const st = document.querySelector('#skillOptionsPopover .tv-sko-frame > .tvp-stage');
    if (n && st && /^2 of/.test(n.textContent) && !st.dataset.fx) {
        st.dataset.fx = '1';
        st.innerHTML = '<div class="tvp-cell" style="width:380px;height:260px;font-size:14px;line-height:1">7</div>';
    }
}, 30);
