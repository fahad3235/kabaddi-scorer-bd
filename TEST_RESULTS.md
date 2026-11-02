# TEST RESULTS — Kabaddi Scorer BD

Run date: 2026-11-02 (Asia/Dhaka). All results below are real outputs
from the commands shown. Nothing here is invented.

## 1. Node unit tests (mandatory)

Command (from the project directory):

```bash
node tests/logic.test.js
```

Result: **30/30 passed, 0 failed.**

Coverage:
- Each scoring event's points: raid +1, bonus +1, tackle +1,
  super tackle +2, all-out +2.
- Per-team counts by event type, tracked separately per team.
- Undo restores score, counts, and log exactly (deep equality
  against the pre-event snapshot); undo on an empty stack errors.
- Half transitions: clock reaching the 5-minute limit moves
  1st Half → Half Time; Start 2nd Half → 2nd Half; reaching the
  limit again → Full Time. Scoring is blocked at Full Time.
- Clock formatting: 0 → 00:00, 5 → 00:05, 65 → 01:05,
  600 → 10:00, 1199 → 19:59.
- Bengali digits: "0123456789" → "০১২৩৪৫৬৭৮৯",
  "12:05" → "১২:০৫".
- Winner/tie detection: 4–2 → A, 1–3 → B, 2–2 → tie.
- Setup validation: blank names default to Team A / Team B,
  identical names rejected, invalid half length rejected.
- Strict import: 1 valid record accepted; 10 malformed cases
  rejected with data intact (invalid JSON, non-array, non-object
  entry, bad date, empty team name, negative score, fractional
  score, winner mismatching scores, bad half length, unknown
  field).

## 2. Headless-Chrome smoke test (CDP, file:// URL)

Harness: `/tmp/kabaddi-smoke.mjs` (Node + raw CDP over WebSocket,
system chromium at `/opt/meta-chromium/chrome`). Note: this build
of Chromium refuses to start without Hatch WebGL domain policy
switches; the harness passes a policy file containing the header
line `hatch-webgl-allowed-domains-v1` plus its SHA-256. The app
itself uses no WebGL and makes zero network requests.

Result: **10/10 checks passed, 0 failed:**

1. PASS — page renders title
2. PASS — setup visible, match hidden initially
3. PASS — empty history message visible
4. PASS — start-match flow shows scoreboard
5. PASS — Raid +1 updates score visibly to 1 (score-a=1)
6. PASS — event log has 1 entry
7. PASS — BN toggle renders Bengali digit (score-a=১)
8. PASS — BN clock renders Bengali digits (clock=০০:০০)
9. PASS — 390px viewport: no horizontal overflow (scrollWidth=390)
10. PASS — zero console/page errors ([])

## 3. Hand-verified scoring scenario (exact numbers)

Scripted sequence on Team A (5-minute halves), verified by the
unit test "hand-verified scenario":

- Raid +1 → score 1
- Tackle +1 → score 2
- All-Out +2 → score 4

Final: Team A = 4, log length = 3. ✔

## 4. Static checks

- `grep` for external references (`http://`, `https://`) across
  `index.html`, `app.js`, `logic.js`: zero matches — the app makes
  no network requests.
- No secrets anywhere in the project (no keys, tokens, or
  credentials).

## 5. Repairs

No test failures occurred, so no repair cycles were needed
(0 of the allowed 2 per category used).

## 6. NOT RUN

Nothing. Both the Node unit suite and the headless-Chrome smoke
test ran to completion with the results above.
