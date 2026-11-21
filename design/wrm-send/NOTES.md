# WRM lesson page: "What to send" + "Add to a set" (mock, lane lf-partopts)

Route `#wrm/PK/CC1/compareamounts` (Lesson 7 Compare amounts), teacher mode, 3 skills ticked
(1 that teaches, 1 to do first, 1 that goes with it). Mock only: no product code changed.

Files
- `current-1280.png`: the real page today, 3 skills ticked, action card in view.
- `mock-1280.png` (1280x1000), `mock-820.png` (820x1180): the mock, drawn into the live page with its own
  classes (`tv-card`, `tv-btn`, `ts-seg`, `tv-h3`, `tv-cap`, `#tvToast`) and CSS variables. No new colours.
- `mock.html`: a static copy of the mocked page (scripts removed; `<base href="../../">` loads the real CSS).

What each part shows
1. **What to send** segmented control at the top of the action card: This lesson | These 3 skills |
   Lesson + 3 skills (pressed = `aria-pressed`, the app's existing pressed style). A caption under it repeats
   what goes: "Sends: Lesson 7 Compare amounts and its 3 ticked skills."
2. **Every action label names its payload**: "Print lesson + 3 skills", "Share lesson + 3 skills",
   "Add lesson + 3 skills to tray". The separate "Print lesson" button folds into the choice.
3. **Add to a set** (new action beside Add to tray) opens a small popover from My sets
   (`savedSets`/`writeSets`, `mq_teacher_sets`): existing sets, then "New set…", with the summary
   "Adds: Lesson 7 Compare amounts + 3 skills".
4. **Toast** in the app's `#tvToast`: "Added to tray: Lesson 7 Compare amounts + 3 skills".
5. All action buttons and segments are at least 48 px tall; no sideways scroll at 1280 or 820.

Open choices for the lead
1. **Default segment**: Lesson + N skills (mock) or follow the ticks (no ticks -> This lesson). And is
   "This lesson" disabled for lessons with no made lesson (no Print lesson today)?
2. **Set item shape**: a set today holds skills only. A lesson in a set needs a new item kind
   (`{kind:'lesson', key}`) beside skills; old sets must still read. Store the lesson once, or one group per lesson?
3. **Share a lesson**: what does a pupil link carry for "This lesson" alone (the lesson's practice skills,
   or the lesson page)? Until decided, Share could be disabled for "This lesson".

## Signed: owner, 2026-11-21 (A34)

Accepted recommendations (the three open choices above):
1. **Default segment follows the ticks**: Lesson + N skills when skills are ticked, This lesson when none are. "This lesson"
   is disabled, with its reason on the button ("This lesson has no lesson to print yet: send its skills."), for a lesson
   the app cannot make; "Lesson + N skills" is disabled with it (there is no lesson to send beside the skills).
2. **Set item shape**: a lesson in a set is its own ADDITIVE entry `{kind:'lesson', key, name}` in the optional field
   `entries`, stored once (adding the same lesson again does not repeat it); skills stay ordinary skill entries. Old sets
   (no `entries`) read unchanged. Set links (`encodeSetParam`) gain the optional field `e`; a set without lessons encodes
   byte-for-byte as before, and old links decode unchanged.
3. **Share with "This lesson"** = "Share lesson practice": the lesson's "Skills that teach" set, with their options.

Additions (owner, A34):
- Every action label names what goes ("Print lesson + 3 skills", "Share lesson + 3 skills", "Add lesson + 3 skills to
  tray"); the separate Print lesson button folds into the choice. A caption under the choice says what goes.
- **Add to a set** opens a popover: the existing sets, then "New set…", and the summary "Adds: ‹lesson› + N skills".
- Toasts name what went ("Added to tray: Lesson 7: Compare amounts + 3 skills").
- The tray bar on a lesson page says what it holds and where it came from ("Tray: 5 skills from earlier (not this
  lesson)"), with a one-tap **Clear tray**.
- The What-to-send card stays visible: sticky on scroll at >= 1024 px, in flow at 820 (the lesson panel scrolls there).
  It must not cover other content badly (gate: at most half the visible height).
- Anything that lists or plays sets (Home "Your skill sets", My sets) tolerates and shows the lesson entry.
- 48 px targets, the current teacher look, no new colour literals.

What each choice sends (as built):
| | Print | Share | Add to tray | Add to a set |
|---|---|---|---|---|
| This lesson | the made lesson's own document | the lesson's teaching skills | the lesson's group (its teaching skills, marked as the lesson) | the lesson entry |
| These N skills | the Print sheet on only the N ticked skills | the N skills | the N skills as the lesson's group | the N skills |
| Lesson + N skills | the lesson's document, then the Print sheet on the N skills | teaching skills and the N skills, each once | both, as the lesson's group | the lesson entry + the N skills |

Checks (ws-teacher-wrm, `--send [what|set|tray]` runs only these): SEND-WHAT, SET-LESSON, TRAY-SOURCE-LABEL.
