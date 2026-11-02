# Kabaddi Scorer BD 🏆

A live kabaddi scoreboard web app for casual matches. Kabaddi is
Bangladesh's national game, and this app lets anyone keep score for a
friendly match on a phone or laptop — no account, no install, no
internet needed.

## Problem

Casual kabaddi games in school fields, clubs, and neighbourhood
tournaments have no simple scorekeeper. Paper scores get lost, and
general scoreboard apps don't know kabaddi's scoring events (raid,
bonus, tackle, super tackle, all-out) or its two-half match structure.

## Features

1. **Match setup** — two team-name inputs (blank defaults to
   "Team A" / "Team B"), half-length choice (20 / 15 / 10 / 5
   minutes), inline validation (names must differ, max 30 chars).
2. **Live scoreboard** — big scores, team names, half indicator
   (1st Half / Half Time / 2nd Half / Full Time), running mm:ss
   clock with start/pause, reset, and End Half. The clock
   auto-advances: end of half 1 → Half Time, end of half 2 →
   Full Time. A finished match is auto-saved to history.
3. **Kabaddi scoring buttons per team** — Raid +1, Bonus +1,
   Tackle +1, Super Tackle +2, All-Out +2, with per-team counts by
   event type.
4. **Chronological event log** — each event stamped with the clock
   time, plus Undo last event (restores scores, counts, and log
   exactly).
5. **Finished-match history** — persisted in `localStorage` (date,
   teams, final score, winner/tie, half length), with per-row
   delete, JSON export, strict JSON import (malformed data is
   rejected with existing data intact), and a typed-`DELETE`
   erase-all confirmation.
6. **English / বাংলা toggle** — persisted in `localStorage`;
   scores and clock render in Bengali digits (০১২৩৪৫৬৭৮৯) when
   Bengali is active.
7. **Empty states everywhere** — empty history message, "no events
   yet" message, and inline validation errors (never alerts).
8. **Ships empty** — no demo match, no fabricated data. The first
   match you see is one you create.

## Scoring rules (simplified standard kabaddi)

- **Raid point (+1):** the raider touches an opponent or crosses
  the bonus line and returns safely.
- **Bonus point (+1):** the raider crosses the bonus line with a
  foot in the air.
- **Tackle point (+1):** defenders stop the raider.
- **Super tackle (+2):** a successful tackle when 3 or fewer
  defenders are on court.
- **All-out (+2):** awarded to the team that puts all opponents
  out.

These are simplified rules for casual scorekeeping. The app does not
track players on court, so it trusts the scorekeeper to judge when a
tackle qualifies as a super tackle — it does not verify defender
counts itself.

## Stack

Vanilla HTML, CSS, and JavaScript. Zero network requests, no build
step, no dependencies, no secrets. All pure scoring, clock,
validation, and import logic lives in `logic.js`, written to work
both in the browser (`window.KabaddiLogic`) and in Node
(`module.exports`); `app.js` only wires the DOM.

## How to run locally

Just open `index.html` in any modern browser. No server, no install.

## Testing

```bash
node tests/logic.test.js   # unit tests for logic.js (plain node:assert)
```

Headless-Chrome smoke test (CDP, `file://` URL): page renders,
start-match flow works, Raid +1 updates the score visibly, the
EN/বাংলা toggle renders Bengali digits, 390 px viewport has no
horizontal overflow, zero console/page errors. See `TEST_RESULTS.md`
for the real commands and counts.

## Limitations

- Simplified rules only; not tournament-certified and not a
  substitute for an official scorer.
- No player-level tracking (no raider/defender rosters, no
  defender counts — super-tackle eligibility is the scorekeeper's
  call).
- No live data, no accounts, no sync: history lives only in the
  browser's `localStorage` on one device.
- The clock is a simple second ticker, not a precision match timer.

## Status

Complete MVP. Unit tests and headless-Chrome smoke test green —
see `TEST_RESULTS.md`.
