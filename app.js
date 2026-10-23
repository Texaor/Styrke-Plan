const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'styrkeplan-v6';
const BACKUP_KEY = 'styrkeplan-v6-raw-backup';

const DEFAULT_STATE = {
  done: {},
  logs: {},
  theme: 'violet',
  videoOn: true,
  schemaVersion: 2,
  progression: {
    'bench_narrow': {
      type: 'main_lift',
      topWeight: 80, topTargetReps: 3, topIncrement: 1.0, heavyStreak: 0, failStreak: 0,
      backoffWeight: 72.5, backoffSets: 3, backoffReps: 5, backoffIncrement: 1.0, backoffStreak: 0,
      lastSessionId: null
    },
    'deadlift': {
      type: 'main_lift',
      topWeight: 130, topTargetReps: 3, topIncrement: 2.5, heavyStreak: 0, failStreak: 0,
      backoffWeight: 115, backoffSets: 3, backoffReps: 5, backoffIncrement: 2.5, backoffStreak: 0,
      lastSessionId: null
    },
    'squat': {
      type: 'main_lift',
      topWeight: 100, topTargetReps: 3, topIncrement: 2.5, heavyStreak: 0, failStreak: 0,
      backoffWeight: 90, backoffSets: 3, backoffReps: 5, backoffIncrement: 2.5, backoffStreak: 0,
      lastSessionId: null
    },
    'bench_flat': {
      type: 'main_lift',
      topWeight: 82.5, topTargetReps: 3, topIncrement: 1.0, heavyStreak: 0, failStreak: 0,
      backoffWeight: 75, backoffSets: 3, backoffReps: 5, backoffIncrement: 1.0, backoffStreak: 0,
      lastSessionId: null
    },
    'pullups': {
      type: 'support_fixed',
      weight: 10, targetSets: 4, targetReps: 3, increment: 1.25, successStreak: 0, lastSessionId: null
    },
    'row_plate': {
      type: 'double_progression',
      weight: 25, targetSets: 4, minReps: 8, maxReps: 10, currentTargetReps: 8, increment: 2.5, lastSessionId: null
    },
    'dips': {
      type: 'support_fixed',
      weight: 10, targetSets: 4, targetReps: 5, increment: 1.25, successStreak: 0, lastSessionId: null
    },
    'ohp_db': {
      type: 'double_progression',
      weight: 20, targetSets: 3, minReps: 5, maxReps: 8, currentTargetReps: 5, increment: 2.0, lastSessionId: null
    },
    'biceps_db': {
      type: 'isolation',
      weight: 16, targetSets: 4, minReps: 8, maxReps: 12, currentTargetReps: 8, increment: 2.0, lastSessionId: null
    }
  }
};

function migrateStateIfNeeded() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  try {
    const parsed = JSON.parse(raw);
    if (!localStorage.getItem(BACKUP_KEY)) {
      localStorage.setItem(BACKUP_KEY, raw);
    }
    if (!parsed.progression) parsed.progression = JSON.parse(JSON.stringify(DEFAULT_STATE.progression));
    if (!parsed.schemaVersion) parsed.schemaVersion = 2;
    return parsed;
  } catch (e) {
    const backup = localStorage.getItem(BACKUP_KEY);
    return backup ? JSON.parse(backup) : JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

const state = migrateStateIfNeeded();
const months = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
const dayShortMon = ['Man','Tir','Ons','Tor','Fre','Lør','Søn'];
let view = new Date();
let selected = new Date();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pad(n) { return String(n).padStart(2,'0'); }
function keyOf(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function displayKg(n) { return Number.isInteger(n) ? String(n) : String(n).replace('.', ','); }
function roundToStep(n, step) { return Math.round(n / step) * step; }
function isTrainingDay(d) { const day = d.getDay(); return day === 1 || day === 3 || day === 5; }
function dayLabel(d) { return d.toLocaleDateString('no-NO', { weekday:'long', day:'numeric', month:'long', year:'numeric'}); }

function getWorkout(d) {
  const day = d.getDay();
  const prog = state.progression;

  if(day === 1) {
    return { type:'training', title:'Mandag · styrke + 44 min jogging', items:[
      ['Magen','3×12 (Fullført)'], ['Rygghev','1×12–15 (Fullført)'],
      ['Benkpress smalt grep', `Topp: ${displayKg(prog.bench_narrow.topWeight)} kg × ${prog.bench_narrow.topTargetReps} · Backoff: ${displayKg(prog.bench_narrow.backoffWeight)} kg × 3×5`, '1 toppsett + 3 backoff-sett'],
      ['Markløft vanlig', `Topp: ${displayKg(prog.deadlift.topWeight)} kg × ${prog.deadlift.topTargetReps} · Backoff: ${displayKg(prog.deadlift.backoffWeight)} kg × 3×5`, '1 toppsett + 3 backoff-sett'],
      ['Jogging','44 min']
    ]};
  }
  if(day === 3) {
    return { type:'training', title:'Onsdag · styrke + 36 min jogging', items:[
      ['Magen','3×15 (Fullført)'], ['Rygghev','3×10–12 (Fullført)'],
      ['Hangups (med vekt)', `4 sett × ${prog.pullups.targetReps} reps · ekstravekt: +${displayKg(prog.pullups.weight)} kg`, 'Ekstra vekt hver onsdag. Øk vekten når alle 4 sett når 5 reps.'],
      ['Sittende roing', `4 sett × ${prog.row_plate.currentTargetReps}–10 reps · vekt: ${displayKg(prog.row_plate.weight)} kg`, 'Dobbel progresjon: bygg reps til 10 før vektøkning.'],
      ['Dips med vekt', `2 oppvarmingssett + 4 sett × 5 reps · vekt: +${displayKg(prog.dips.weight)} kg`, 'Bygg opp til 5 reps, øk med 1,25 kg etter 2 godkjente økter.'],
      ['Sittende hantelpress', `Oppvarming + 3 sett × ${prog.ohp_db.currentTargetReps}–8 reps · ${displayKg(prog.ohp_db.weight)} kg per hantel`, 'Reps først til 8 reps, deretter +2 kg per hantel.'],
      ['Biceps', `4 sett × ${prog.biceps_db.currentTargetReps}–12 reps · ${displayKg(prog.biceps_db.weight)} kg per hantel`, 'Isolasjon: reps først til 12 reps.'],
      ['Triceps', '4 × 8–12 (Fri maskin/vekt)', 'Bestem vekt og gjennomføring selv.'],
      ['Facepulls', '4 × 10 (Kabel)', 'Bestem vekt og teknikk selv.'],
      ['Jogging','36 min']
    ]};
  }
  if(day === 5) {
    return { type:'training', title:'Fredag · styrke + 44 min jogging', items:[
      ['Magen','3×12 (Fullført)'], ['Rygghev','1×12–15 (Fullført)'],
      ['Knebøy nakke', `Topp: ${displayKg(prog.squat.topWeight)} kg × ${prog.squat.topTargetReps} · Backoff: ${displayKg(prog.squat.backoffWeight)} kg × 3×5`, '1 toppsett + 3 backoff-sett'],
      ['Benkpress', `Topp: ${displayKg(prog.bench_flat.topWeight)} kg × ${prog.bench_flat.topTargetReps} · Backoff: ${displayKg(prog.bench_flat.backoffWeight)} kg × 3×5`, '1 toppsett + 3 backoff-sett'],
      ['Jogging','44 min']
    ]};
  }
  return { type:'rest', title:'Hviledag', items:[] };
}

function getLoggerItems(d) {
  const day = d.getDay();
  if(day === 1) return ['bench_narrow', 'deadlift'];
  if(day === 3) return ['pullups', 'row_plate', 'dips', 'ohp_db', 'biceps_db'];
  if(day === 5) return ['squat', 'bench_flat'];
  return [];
}

const exerciseNames = {
  'bench_narrow': 'Benkpress smalt grep',
  'deadlift': 'Markløft vanlig',
  'squat': 'Knebøy nakke',
  'bench_flat': 'Benkpress',
  'pullups': 'Hangups med vekt',
  'row_plate': 'Sittende roing',
  'dips': 'Dips med vekt',
  'ohp_db': 'Sittende hantelpress',
  'biceps_db': 'Biceps hantel'
};

function renderMiniWeek() {
  const start = new Date(selected);
  const weekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekday);
  start.setHours(12,0,0,0);

  $('miniWeekTitle').textContent = `Ukeoversikt`;
  let doneCount = 0;
  const wrap = $('miniWeek');
  wrap.innerHTML = '';
  
  for(let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = keyOf(d);
    const div = document.createElement('button');
    div.className = 'mini-day ' + (isTrainingDay(d)?'train':'rest') + (k===keyOf(selected)?' selected':'') + (state.done[k]?' done':'');
    div.innerHTML = `<b>${dayShortMon[i]}</b><span>${d.getDate()}/${d.getMonth()+1}</span><span>${isTrainingDay(d)?(state.done[k]?'Fullført':'Økt'):'Fri'}</span>`;
    if(isTrainingDay(d) && state.done[k]) doneCount++;
    div.addEventListener('click', () => { selected = d; view = new Date(d.getFullYear(), d.getMonth(), 1, 12); render(); });
    wrap.appendChild(div);
  }
  $('weekProgress').textContent = `${doneCount}/3 fullført`;
}

function renderCalendar() {
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1, 12);
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const offset = (first.getDay()+6)%7;
  const cal = $('cal');
  $('monthTitle').textContent = `${months[month][0].toUpperCase()}${months[month].slice(1)} ${year}`;
  cal.innerHTML = '';
  
  for(let i = 0; i < offset; i++) {
    const blank = document.createElement('div');
    blank.className = 'blank';
    cal.appendChild(blank);
  }
  for(let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d, 12);
    const k = keyOf(date);
    const btn = document.createElement('button');
    btn.className = 'day-cell ' + (isTrainingDay(date) ? 'train' : 'rest');
    if(state.done[k]) btn.classList.add('done');
    if(k === keyOf(new Date())) btn.classList.add('today');
    if(k === keyOf(selected)) btn.classList.add('selected');
    const short = dayShortMon[(date.getDay()+6)%7];
    const marker = isTrainingDay(date) ? (state.done[k] ? 'FULLFØRT' : 'ØKT') : 'FRI';
    btn.innerHTML = `<span class="mini">${short}</span><span class="num">${d}</span><span class="marker">${marker}</span>`;
    btn.addEventListener('click', () => { selected = date; render(); });
    cal.appendChild(btn);
  }
  
  let trainingTotal = 0, doneTotal = 0;
  for(let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d, 12);
    if(isTrainingDay(dt)) {
      trainingTotal++;
      if(state.done[keyOf(dt)]) doneTotal++;
    }
  }
  $('monthPercent').textContent = trainingTotal ? `${Math.round((doneTotal/trainingTotal)*100)}%` : '0%';
}

function renderWorkout() {
  const date = selected;
  const workout = getWorkout(date);
  const isToday = keyOf(date) === keyOf(new Date());
  const done = !!state.done[keyOf(date)];
  
  $('selectedDayName').textContent = isToday ? 'DAGENS VALGTE DAG' : 'VALGT DAG';
  $('selectedDateTitle').textContent = dayLabel(date);
  $('selectedDateSub').textContent = workout.type === 'training' ? (done ? 'Økten er markert som fullført.' : 'Planlagt treningsdag.') : 'Dette er en hviledag i planen.';
  $('dayTypeTag').textContent = workout.type === 'training' ? (done ? 'Treningsdag · fullført' : 'Treningsdag') : 'Hviledag';
  $('workoutTitle').textContent = workout.title;
  $('workoutMeta').textContent = dayLabel(date);
  
  const toggle = $('toggleDone');
  if(workout.type === 'training') {
    toggle.classList.remove('hidden');
    toggle.textContent = done ? 'Angre fullført' : 'Fullfør økt';
    toggle.onclick = () => {
      if(state.done[keyOf(date)]) delete state.done[keyOf(date)];
      else state.done[keyOf(date)] = true;
      save();
      render();
    };
  } else {
    toggle.classList.add('hidden');
  }
  
  $('workoutList').innerHTML = workout.items.length ? workout.items.map(item => `<div class="exercise"><b>${item[0]}</b><div class="sets">${item[1]}</div>${item[2] ? `<div class="progress">${item[2]}</div>` : ''}</div>`).join('') : '<p>Fri dag. Restitusjon og mat.</p>';
  
  renderLogger(date);
}

function processProgression(exKey, data) {
  const ex = state.progression[exKey];
  if (!ex) return;
  
  const sessionId = `${keyOf(selected)}_${exKey}`;
  if (ex.lastSessionId === sessionId) return;
  ex.lastSessionId = sessionId;

  if (ex.type === 'main_lift') {
    const reps = Number(data.reps) || 0;
    const rating = data.rating || 'controlled';

    if (reps >= 5 && (rating === 'easy' || rating === 'controlled')) {
      ex.topWeight += ex.topIncrement;
      ex.topTargetReps = 3;
      ex.heavyStreak = 0;
      ex.failStreak = 0;
    } else if (reps === 3 && (rating === 'easy' || rating === 'controlled')) {
      if (ex.topTargetReps === 3) ex.topTargetReps = 4;
    } else if (reps === 4 && (rating === 'easy' || rating === 'controlled')) {
      if (ex.topTargetReps <= 4) ex.topTargetReps = 5;
    } else if (rating === 'limit' || reps === ex.topTargetReps - 1) {
      ex.heavyStreak++;
    } else if (rating === 'failed' || reps < ex.topTargetReps - 1) {
      ex.failStreak++;
      if (ex.failStreak >= 2) {
        ex.topWeight = Math.max(20, ex.topWeight - ex.topIncrement);
        ex.failStreak = 0;
      }
    }

    if (data.backoffCompleted && !data.backoffReduced) {
      ex.backoffStreak++;
      if (ex.backoffStreak >= 2) {
        ex.backoffWeight += ex.backoffIncrement;
        ex.backoffStreak = 0;
      }
    } else {
      ex.backoffStreak = 0;
    }
  } 
  else if (ex.type === 'support_fixed') {
    const reps = Number(data.reps) || 0;
    if (reps >= ex.targetReps && data.rating !== 'failed') {
      ex.successStreak++;
      if (ex.successStreak >= 2) {
        ex.weight += ex.increment;
        ex.successStreak = 0;
      }
    } else {
      ex.successStreak = 0;
    }
  }
  else if (ex.type === 'double_progression' || ex.type === 'isolation') {
    const reps = Number(data.reps) || 0;
    if (reps >= ex.maxReps) {
      ex.weight += ex.increment;
      ex.currentTargetReps = ex.minReps;
    } else if (reps >= ex.currentTargetReps && data.rating !== 'failed') {
      ex.currentTargetReps = Math.min(ex.maxReps, ex.currentTargetReps + 1);
    }
  }
  save();
}

function renderLogger(date) {
  if(!state.logs) state.logs = {};
  const liftKeys = getLoggerItems(date);
  const box = $('logger');
  const hist = $('history');
  
  if(!liftKeys.length) {
    box.innerHTML = '<p>Ingen hovedløft eller loggbare øvelser denne dagen.</p>';
    hist.innerHTML = '';
    return;
  }
  
  box.innerHTML = liftKeys.map((exKey) => {
    const name = exerciseNames[exKey] || exKey;
    const ex = state.progression[exKey];
    const id = `${keyOf(date)}|${exKey}`;
    const old = state.logs[id] || {};
    
    if (ex.type === 'main_lift') {
      return `
        <div class="log-card" style="background:rgba(255,255,255,.03); border:1px solid var(--line); border-radius:16px; padding:12px; margin-bottom:12px;">
          <div style="font-weight:700; margin-bottom:4px;">${name}</div>
          <div class="loghint">Toppsett mål: ${ex.topTargetReps} reps på ${displayKg(ex.topWeight)} kg</div>
          <div class="logrow" style="margin-top:6px;">
            <input id="kg_${exKey}" inputmode="decimal" placeholder="Topp vekt" value="${old.kg || ex.topWeight}">
            <input id="rp_${exKey}" inputmode="numeric" placeholder="Topp reps" value="${old.reps || ''}">
            <select id="rt_${exKey}" style="background:#0a101a; color:var(--text); border:1px solid var(--line); border-radius:12px; padding:8px;">
              <option value="easy">Lett</option>
              <option value="controlled" selected>Kontrollert</option>
              <option value="limit">På grensen</option>
              <option value="failed">Mislykket</option>
            </select>
            <button data-save-ex="${exKey}" class="primary">Lagre</button>
          </div>
          <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--line); font-size:0.85rem; color:var(--muted);">
            <div><b>Backoff-sett (3 × 5 på ${displayKg(ex.backoffWeight)} kg):</b></div>
            <div style="display:flex; gap:14px; margin-top:6px; align-items:center;">
              <label><input type="checkbox" id="bo_comp_${exKey}" checked> Fullførte 3×5</label>
              <label><input type="checkbox" id="bo_red_${exKey}"> Redusert vekt i dag</label>
            </div>
          </div>
        </div>
      `;
    }

    let infoText = '';
    if (ex.type === 'support_fixed') {
      infoText = `Mål: ${displayKg(ex.weight)} kg · ${ex.targetSets} × ${ex.targetReps} reps`;
    } else {
      infoText = `Mål: ${displayKg(ex.weight)} kg · ${ex.targetSets} × ${ex.currentTargetReps} reps (bygg mot ${ex.maxReps})`;
    }

    return `
      <div class="log-card" style="background:rgba(255,255,255,.03); border:1px solid var(--line); border-radius:16px; padding:12px; margin-bottom:12px;">
        <div style="font-weight:700; margin-bottom:4px;">${name}</div>
        <div class="loghint">${infoText}</div>
        <div class="logrow" style="margin-top:8px;">
          <input id="kg_${exKey}" inputmode="decimal" placeholder="Vekt (kg)" value="${old.kg || ex.weight || ''}">
          <input id="rp_${exKey}" inputmode="numeric" placeholder="Reps" value="${old.reps || ''}">
          <select id="rt_${exKey}" style="background:#0a101a; color:var(--text); border:1px solid var(--line); border-radius:12px; padding:8px;">
            <option value="easy">Lett</option>
            <option value="controlled" selected>Kontrollert</option>
            <option value="limit">På grensen</option>
            <option value="failed">Mislykket</option>
          </select>
          <button data-save-ex="${exKey}" class="primary">Lagre</button>
        </div>
      </div>
    `;
  }).join('');
  
  box.querySelectorAll('[data-save-ex]').forEach(btn => {
    btn.addEventListener('click', () => {
      const exKey = btn.dataset.saveEx;
      const kg = $(`kg_${exKey}`).value.replace(',','.');
      const reps = $(`rp_${exKey}`).value;
      const rating = $(`rt_${exKey}`).value;
      const id = `${keyOf(date)}|${exKey}`;
      
      state.logs[id] = { kg, reps, rating, date: keyOf(date) };

      let backoffCompleted = true;
      let backoffReduced = false;
      const compBox = $(`bo_comp_${exKey}`);
      const redBox = $(`bo_red_${exKey}`);
      if (compBox) backoffCompleted = compBox.checked;
      if (redBox) backoffReduced = redBox.checked;

      processProgression(exKey, { reps, rating, backoffCompleted, backoffReduced });
      alert(`Lagret ${exerciseNames[exKey] || exKey}! Progresjon oppdatert.`);
      render();
    });
  });
  
  const recent = Object.entries(state.logs).filter(([k]) => k.startsWith(keyOf(date))).map(([k,v]) => {
    const exKey = k.split('|')[1];
    return `${exerciseNames[exKey] || exKey}: ${v.kg || '–'} kg × ${v.reps || '–'}`;
  }).join(' · ');
  
  hist.innerHTML = recent ? `<div class="history">Lagret for ${dayLabel(date)}: ${recent}</div>` : '';
}

function openSettings() { $('settingsBackdrop').hidden = false; $('settingsPanel').hidden = false; highlightSelectedTheme(); }
function closeSettings() { $('settingsBackdrop').hidden = true; $('settingsPanel').hidden = true; }
function highlightSelectedTheme() { document.querySelectorAll('.theme-card').forEach(el => el.classList.toggle('selected-theme', el.dataset.theme === state.theme)); }
function applyTheme(theme) { state.theme = theme; document.body.dataset.theme = theme; save(); highlightSelectedTheme(); }
function applyVideoState() { const video = $('bgVideo'); if(video) video.style.display = state.videoOn ? '' : 'none'; }

function exportData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `styrkeplan-backup-${keyOf(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      Object.assign(state, imported);
      save();
      document.body.dataset.theme = state.theme || 'violet';
      applyVideoState();
      render();
      closeSettings();
      alert('Data importert vellykket.');
    } catch(e) {
      alert('Kunne ikke lese JSON-filen.');
    }
  };
  reader.readAsText(file);
}

function render() {
  const now = new Date();
  $('todayLine').textContent = now.toLocaleDateString('no-NO', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).toUpperCase();
  $('weekLine').textContent = `I dag: årsuke ${Math.ceil((now - new Date(now.getFullYear(),0,1))/604800000)}`;
  renderMiniWeek();
  renderCalendar();
  renderWorkout();
}

function initApp() {
  try {
    $('prevMonth').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()-1, 1, 12); renderCalendar(); });
    $('nextMonth').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()+1, 1, 12); renderCalendar(); });
    $('todayBtn').addEventListener('click', () => { selected = new Date(); view = new Date(selected.getFullYear(), selected.getMonth(), 1, 12); render(); });
    $('settingsBtn').addEventListener('click', openSettings);
    $('closeSettings').addEventListener('click', closeSettings);
    $('settingsBackdrop').addEventListener('click', closeSettings);

    document.querySelectorAll('.theme-card').forEach(btn => btn.addEventListener('click', () => applyTheme(btn.dataset.theme)));
    $('videoToggle').addEventListener('change', (e) => { state.videoOn = e.target.checked; save(); applyVideoState(); });

    $('exportBtn').addEventListener('click', exportData);
    $('importFile').addEventListener('change', (e) => { if(e.target.files && e.target.files[0]) importData(e.target.files[0]); e.target.value=''; });

    document.body.dataset.theme = state.theme || 'violet';
    applyVideoState();
    render();

    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?v=70').catch(() => {});
    }
  } catch (err) {
    console.error('Styrkeplan init feil:', err);
  }
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
