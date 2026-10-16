# Owner requests 2026-10-16 (Lane D, area models) — queued for the round after r11

1. **Multiplication box method, pupil writes the edge numbers.** `multiplication:area_model_mult` and
   `multiplication:area_model_mult_hard` get an option "Numbers around the box": **Given** (default, today's
   sheet) / **Pupil writes them** (the expanded parts on the edges, e.g. 30 | 6 and 4, become boxes the
   pupil fills before the partial products and the total).
2. **Division area model, the same edge option.** `division:area_model_div_2by1` and
   `division:area_model_div_3by1` get the same "Numbers around the box" option (the divisor and the
   quotient's parts on the edges become boxes).
3. **Division area model, how the original problem is shown.** Option "Show the problem as":
   **division sign** 84 ÷ 4 (default, today) / **long division** (the long-division bracket, as in the
   long-division skills) / **fraction** (84 over 4).

Rules for all three: options live on the skill (`js/modules/skill-options.js`) and travel into every
page role; defaults keep today's output so share codes and saved sheets are unchanged; print page,
answer key (key ink #C2410C for the edge answers) and screen hosts (card, online worksheet, quiz with
edge input boxes and answer checking) all honour them; research reference sites first (CLAUDE.md);
critic >= 8 on every page type and host.
