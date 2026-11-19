// ws-options-shots backtest fixture (critic-panel-r2 F1, inner clipping): models a table clipped INSIDE the stage. Every
// 50 ms the box around the sample's table is set to overflow: hidden at 200 px, so the stage box sits inside the frame
// (the old [inside] test passes) while columns of the chart are cut off by a box within it.
setInterval(() => {
    const t = document.querySelector('#skillOptionsPopover .tv-sko-frame > .tvp-stage table');
    if (t && t.parentElement) { t.parentElement.style.overflow = 'hidden'; t.parentElement.style.maxWidth = '200px'; }
}, 50);
