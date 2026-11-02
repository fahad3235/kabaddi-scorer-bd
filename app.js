/* Kabaddi Scorer BD — DOM wiring. All pure logic lives in logic.js. */
(function () {
  'use strict';
  const L = window.KabaddiLogic;
  const $ = (id) => document.getElementById(id);

  const I18N = {
    en: {
      tagline: "Live kabaddi scoreboard — Bangladesh's national game",
      setupTitle: 'Match Setup',
      teamA: 'Team A name',
      teamB: 'Team B name',
      halfLength: 'Half length',
      startMatch: 'Start Match',
      setupHint: 'Leave a name blank to use the default (Team A / Team B).',
      eventLog: 'Event Log',
      undo: '↩ Undo last event',
      noEvents: 'No events yet.',
      historyTitle: 'Finished Matches',
      noHistory: 'No finished matches yet. Finish a match and it will appear here.',
      thDate: 'Date', thMatch: 'Match', thScore: 'Score', thResult: 'Result', thHalf: 'Half',
      exportJson: 'Export JSON', importJson: 'Import JSON', eraseAll: 'Erase All History',
      eraseConfirm: 'Type DELETE to erase all finished-match history. This cannot be undone.',
      confirmErase: 'Erase Everything', cancel: 'Cancel',
      rulesTitle: 'Scoring rules (simplified standard kabaddi)',
      rule1: 'Raid point: +1 — raider touches an opponent or crosses the bonus line safely.',
      rule2: 'Bonus point: +1 — raider crosses the bonus line with a foot in the air.',
      rule3: 'Tackle point: +1 — defenders stop the raider.',
      rule4: 'Super tackle: +2 — a successful tackle when 3 or fewer defenders are on court.',
      rule5: 'All-out: +2 — awarded to the team that puts all opponents out.',
      rulesNote: 'This is a casual scorekeeper using simplified rules. It is NOT tournament-certified and carries no live match data.',
      startClock: 'Start Clock', pauseClock: 'Pause Clock', resetClock: 'Reset Clock',
      endHalf: 'End Half', start2nd: 'Start 2nd Half', newMatch: 'New Match',
      delete: 'Delete',
      phase: { '1st': '1st Half', ht: 'Half Time', '2nd': '2nd Half', ft: 'Full Time' },
      events: { raid: 'Raid', bonus: 'Bonus', tackle: 'Tackle', superTackle: 'Super Tackle', allOut: 'All-Out' },
      result: { A: 'Team A won', B: 'Team B won', tie: 'Tie' },
      fullTimeNote: 'Full time! This match has been saved to history.',
      halfTimeNote: 'Half time. Press "Start 2nd Half" when ready.',
      saved: 'Match saved to history.',
      importOk: 'Import successful.',
      importFail: 'Import rejected — history unchanged: ',
      eraseDone: 'All history erased.',
      undoEmpty: 'Nothing to undo.',
    },
    bn: {
      tagline: 'লাইভ কাবাডি স্কোরবোর্ড — বাংলাদেশের জাতীয় খেলা',
      setupTitle: 'ম্যাচ সেটআপ',
      teamA: 'দল A-এর নাম',
      teamB: 'দল B-এর নাম',
      halfLength: 'অর্ধের সময়',
      startMatch: 'ম্যাচ শুরু করুন',
      setupHint: 'নাম খালি রাখলে ডিফল্ট নাম (Team A / Team B) ব্যবহার হবে।',
      eventLog: 'ইভেন্ট লগ',
      undo: '↩ শেষ ইভেন্ট বাতিল করুন',
      noEvents: 'এখনো কোনো ইভেন্ট নেই।',
      historyTitle: 'সমাপ্ত ম্যাচসমূহ',
      noHistory: 'এখনো কোনো সমাপ্ত ম্যাচ নেই। ম্যাচ শেষ হলে এখানে দেখা যাবে।',
      thDate: 'তারিখ', thMatch: 'ম্যাচ', thScore: 'স্কোর', thResult: 'ফলাফল', thHalf: 'অর্ধ',
      exportJson: 'JSON এক্সপোর্ট', importJson: 'JSON ইমপোর্ট', eraseAll: 'সব ইতিহাস মুছুন',
      eraseConfirm: 'সব ইতিহাস মুছতে DELETE লিখুন। এটি ফেরানো যাবে না।',
      confirmErase: 'সব মুছুন', cancel: 'বাতিল',
      rulesTitle: 'স্কোরিং নিয়ম (সরলীকৃত প্রচলিত কাবাডি)',
      rule1: 'রেইড পয়েন্ট: +১ — রেইডার প্রতিপক্ষকে ছুঁয়ে নিরাপদে ফিরলে।',
      rule2: 'বোনাস পয়েন্ট: +১ — রেইডার বোনাস লাইন পেরোলে।',
      rule3: 'ট্যাকল পয়েন্ট: +১ — ডিফেন্ডাররা রেইডারকে থামালে।',
      rule4: 'সুপার ট্যাকল: +২ — কোর্টে ৩ বা তার কম ডিফেন্ডার থাকলে সফল ট্যাকল।',
      rule5: 'অল-আউট: +২ — সব প্রতিপক্ষকে আউট করলে।',
      rulesNote: 'এটি একটি সাধারণ স্কোরকিপার, সরলীকৃত নিয়ম ব্যবহার করে। এটি টুর্নামেন্ট-সার্টিফায়েড নয় এবং এতে কোনো লাইভ ম্যাচ ডেটা নেই।',
      startClock: 'ঘড়ি চালু করুন', pauseClock: 'ঘড়ি থামান', resetClock: 'ঘড়ি রিসেট',
      endHalf: 'অর্ধ শেষ করুন', start2nd: '২য় অর্ধ শুরু করুন', newMatch: 'নতুন ম্যাচ',
      delete: 'মুছুন',
      phase: { '1st': '১ম অর্ধ', ht: 'বিরতি', '2nd': '২য় অর্ধ', ft: 'পূর্ণ সময়' },
      events: { raid: 'রেইড', bonus: 'বোনাস', tackle: 'ট্যাকল', superTackle: 'সুপার ট্যাকল', allOut: 'অল-আউট' },
      result: { A: 'দল A জিতেছে', B: 'দল B জিতেছে', tie: 'ড্র' },
      fullTimeNote: 'পূর্ণ সময়! এই ম্যাচটি ইতিহাসে সংরক্ষিত হয়েছে।',
      halfTimeNote: 'বিরতি। প্রস্তুত হলে "২য় অর্ধ শুরু করুন" চাপুন।',
      saved: 'ম্যাচ ইতিহাসে সংরক্ষিত হয়েছে।',
      importOk: 'ইমপোর্ট সফল হয়েছে।',
      importFail: 'ইমপোর্ট বাতিল — ইতিহাস অপরিবর্তিত: ',
      eraseDone: 'সব ইতিহাস মুছে ফেলা হয়েছে।',
      undoEmpty: 'বাতিল করার মতো কিছু নেই।',
    },
  };

  let lang = localStorage.getItem('kabaddi-lang') || 'en';
  if (!I18N[lang]) lang = 'en';

  let match = null;
  let timerId = null;
  let savedThisMatch = false;
  let history = loadHistory();

  function loadHistory() {
    try {
      const raw = localStorage.getItem('kabaddi-history');
      if (!raw) return [];
      const parsed = L.parseHistoryImport(raw);
      return parsed.error ? [] : parsed.history;
    } catch (e) { return []; }
  }
  function persistHistory() {
    localStorage.setItem('kabaddi-history', JSON.stringify(history));
  }

  function t() { return I18N[lang]; }
  function digits(text) {
    return lang === 'bn' ? L.toBengaliDigits(text) : String(text);
  }
  function teamName(team) {
    return match ? (team === 'A' ? match.teamA : match.teamB) : team;
  }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t()[key] !== undefined) el.textContent = t()[key];
    });
    $('lang-toggle').textContent = lang === 'en' ? 'বাংলা' : 'English';
    document.documentElement.lang = lang;
    render();
  }

  function render() {
    if (!match) return;
    $('phase-badge').textContent = t().phase[match.phase];
    $('clock').textContent = digits(L.formatClock(match.clockSec));
    $('name-a').textContent = match.teamA;
    $('name-b').textContent = match.teamB;
    $('score-a').textContent = digits(match.scores.A);
    $('score-b').textContent = digits(match.scores.B);
    $('scoring-title-a').textContent = match.teamA;
    $('scoring-title-b').textContent = match.teamB;
    $('counts-a').textContent = countsText('A');
    $('counts-b').textContent = countsText('B');
    $('btn-clock-toggle').textContent = match.running ? t().pauseClock : t().startClock;
    $('btn-clock-toggle').disabled = match.phase === 'ht' || match.phase === 'ft';
    $('btn-end-half').disabled = match.phase === 'ht' || match.phase === 'ft';
    $('btn-start-2nd').hidden = match.phase !== 'ht';
    $('match-note').hidden = !(match.phase === 'ht' || match.phase === 'ft');
    $('match-note').textContent = match.phase === 'ht' ? t().halfTimeNote : t().fullTimeNote;
    document.querySelectorAll('.btn-row button').forEach((b) => {
      b.disabled = match.phase === 'ft';
    });
    renderLog();
  }

  function countsText(team) {
    const parts = [];
    for (const type of L.EVENT_TYPES) {
      const n = match.counts[team][type];
      if (n > 0) parts.push(t().events[type] + ' ' + digits(n));
    }
    return parts.join(' · ');
  }

  function renderLog() {
    const list = $('event-log');
    list.innerHTML = '';
    $('log-empty').hidden = match.log.length > 0;
    match.log.forEach((ev) => {
      const li = document.createElement('li');
      li.textContent = digits(L.formatClock(ev.clockSec)) + ' — ' + teamName(ev.team) +
        ': ' + t().events[ev.type] + ' (+' + digits(ev.points) + ')';
      list.appendChild(li);
    });
  }

  function renderHistory() {
    const empty = $('history-empty');
    const table = $('history-table');
    const body = $('history-body');
    body.innerHTML = '';
    empty.hidden = history.length > 0;
    table.hidden = history.length === 0;
    history.forEach((h, idx) => {
      const tr = document.createElement('tr');
      const resultKey = h.winner === 'tie' ? 'tie' : h.winner;
      const resultText = h.winner === 'A' ? h.teamA + ' won' :
        h.winner === 'B' ? h.teamB + ' won' : t().result.tie;
      const displayResult = lang === 'bn' ? t().result[resultKey] : resultText;
      tr.innerHTML = '<td>' + escapeHtml(new Date(h.date).toLocaleString()) + '</td>' +
        '<td>' + escapeHtml(h.teamA) + ' vs ' + escapeHtml(h.teamB) + '</td>' +
        '<td>' + digits(h.scoreA) + ' – ' + digits(h.scoreB) + '</td>' +
        '<td>' + escapeHtml(displayResult) + '</td>' +
        '<td>' + digits(h.halfLengthMin) + ' min</td>';
      const td = document.createElement('td');
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = t().delete;
      del.addEventListener('click', () => {
        history.splice(idx, 1);
        persistHistory();
        renderHistory();
      });
      td.appendChild(del);
      tr.appendChild(td);
      body.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function maybeSaveToHistory() {
    if (match.phase === 'ft' && !savedThisMatch) {
      history.push(L.finishMatchRecord(match));
      persistHistory();
      savedThisMatch = true;
      renderHistory();
    }
  }

  function buildScoringButtons() {
    document.querySelectorAll('.btn-row').forEach((row) => {
      const team = row.getAttribute('data-team');
      row.innerHTML = '';
      L.EVENT_TYPES.forEach((type) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = t().events[type] + ' +' + digits(L.EVENT_POINTS[type]);
        b.addEventListener('click', () => {
          const res = L.applyEvent(match, team, type);
          if (res.error) return;
          match = res.state;
          render();
        });
        row.appendChild(b);
      });
    });
  }

  /* ---- wiring ---- */
  $('lang-toggle').addEventListener('click', () => {
    lang = lang === 'en' ? 'bn' : 'en';
    localStorage.setItem('kabaddi-lang', lang);
    buildScoringButtons();
    applyLang();
    renderHistory();
  });

  $('btn-start-match').addEventListener('click', () => {
    const teamA = $('input-team-a').value;
    const teamB = $('input-team-b').value;
    const half = Number($('input-half').value);
    const errors = L.validateSetup(teamA, teamB, half);
    const errEl = $('setup-error');
    if (errors.length > 0) {
      errEl.textContent = errors.join(' — ');
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;
    const res = L.createMatch(teamA, teamB, half);
    match = res.match;
    savedThisMatch = false;
    stopTimer();
    $('setup-section').hidden = true;
    $('match-section').hidden = false;
    buildScoringButtons();
    render();
  });

  $('btn-clock-toggle').addEventListener('click', () => {
    if (!match) return;
    match.running = !match.running;
    if (match.running) {
      stopTimer();
      timerId = setInterval(() => {
        match = L.tick(match);
        if (!match.running) stopTimer();
        render();
        maybeSaveToHistory();
      }, 1000);
    } else {
      stopTimer();
    }
    render();
  });

  $('btn-clock-reset').addEventListener('click', () => {
    if (!match) return;
    stopTimer();
    match.clockSec = 0;
    match.running = false;
    render();
  });

  $('btn-end-half').addEventListener('click', () => {
    if (!match) return;
    stopTimer();
    match = L.endHalfEarly(match);
    render();
    maybeSaveToHistory();
  });

  $('btn-start-2nd').addEventListener('click', () => {
    if (!match) return;
    match = L.startSecondHalf(match);
    render();
  });

  $('btn-new-match').addEventListener('click', () => {
    stopTimer();
    match = null;
    $('match-section').hidden = true;
    $('setup-section').hidden = false;
  });

  $('btn-undo').addEventListener('click', () => {
    if (!match) return;
    const res = L.undoLastEvent(match);
    if (res.error) {
      $('match-note').hidden = false;
      $('match-note').textContent = t().undoEmpty;
      return;
    }
    match = res.state;
    render();
  });

  $('btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kabaddi-history.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('input-import').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = L.parseHistoryImport(String(reader.result));
      if (parsed.error) {
        $('history-msg').textContent = t().importFail + parsed.error;
      } else {
        history = parsed.history;
        persistHistory();
        renderHistory();
        $('history-msg').textContent = t().importOk;
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  $('btn-erase').addEventListener('click', () => {
    $('erase-box').hidden = false;
  });
  $('btn-erase-cancel').addEventListener('click', () => {
    $('erase-box').hidden = true;
    $('input-erase-confirm').value = '';
    $('btn-erase-confirm').disabled = true;
  });
  $('input-erase-confirm').addEventListener('input', (e) => {
    $('btn-erase-confirm').disabled = e.target.value !== 'DELETE';
  });
  $('btn-erase-confirm').addEventListener('click', () => {
    history = [];
    persistHistory();
    renderHistory();
    $('erase-box').hidden = true;
    $('input-erase-confirm').value = '';
    $('btn-erase-confirm').disabled = true;
    $('history-msg').textContent = t().eraseDone;
  });

  buildScoringButtons();
  applyLang();
  renderHistory();
})();
