Lane: fixture
Branch: fixture-precritic-clean

## Critic r2 (fixture): FAIL
| r1 | Status | Evidence |
|---|---|---|
| F2 screen train | **OPEN** | npr / fgr card-1280 and worksheet-1280 |

## Fixes after critic r2 (fixture)
- F2 fixed: the count-row train no longer wraps on the card or worksheet.

## Precritic r10 (fixture gate table)
| Gate | npr |
|---|---|
| print-lint kit independent S / M / L | PASS |
| ws-print-lint --roles reason-it,error-analysis,test,true-false | PASS |
| screen-slots, chromebook-fit | PASS |

Clean for the critic (every gate green): independent, test, error-analysis, true-or-false, reason-it and the card / worksheet on patterns:number_patterns_rule.
NOT clean: the lesson pages.
