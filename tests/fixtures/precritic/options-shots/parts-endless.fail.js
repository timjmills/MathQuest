// ws-options-shots backtest fixture (critic-panel-r2 soft spot, the 12-part walk): models a sample whose Next arrow never
// ends. The old walk stopped reading at part 12 and passed; the walk now reads every part and FAILs [parts] past 40.
setInterval(() => {
    const b = document.querySelector('#skillOptionsPopover .tv-sko-part [data-sko-part="1"]');
    if (b) b.disabled = false;
}, 20);
