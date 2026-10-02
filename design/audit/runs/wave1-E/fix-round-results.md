Fix round results (2026-10-02), commands and outputs.

- `node tests/scripts/ws-load-check.cjs`: practice 5 answers submitted through submitAnswer(), score 0 -> 5; worksheet 3 cards, Score: 3/3; endGame session history 1 -> 2; 2 local requests, 0 external; `ws-load-check: OK`
- `node tests/scripts/ws-load-check.cjs --self-test`: probe fetch FAILED as it must (exit 1); probe hang FAILED as it must (exit 1); no probe OK; `ws-load-check --self-test: OK`
- `--slow-cdn 8000`: this tree 8496 ms, 8585 ms; 9fb3af7~1 (`--root`, `--ready-only`) 17956 ms, 17977 ms
- D4 browser check (dispatch resize): flag at once 0, after 250 ms 1
- D5 check (`--skills addition:add --hosts worksheet --no-live --wait-timeout 1`): `Error: addition:add worksheet: layout flag data-mq-laid-out=1 and fonts loaded not reached in 1 ms (flag=0, fonts=loading) [...]`, `ws-screen-answer: FAIL`, exit 1
- stress: see stress-ws-screen-answer.log (10/10)
