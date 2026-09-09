
const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'styrkeplan-v6';
const DEFAULT_STATE = {done:{}, logs:{}, theme:'violet', videoOn:true};
const state = Object.assign({}, DEFAULT_STATE, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
const months = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
const dayShortMon = ['Man','Tir','Ons','Tor','Fre','Lør','Søn'];
let view = new Date();
let selected = new Date();
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function pad(n){ return String(n).padStart(2,'0'); }
function keyOf(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function displayKg(n){ return Number.isInteger(n) ? String(n) : String(n).replace('.', ','); }
function startOfWeek(d){ const x = new Date(d); const weekday = (x.getDay()+6)%7; x.setDate(x.getDate()-weekday); x.setHours(12,0,0,0); return x; }
function isoWeek(d){ let x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); x.setUTCDate(x.getUTCDate() + 4 - (x.getUTCDay() || 7)); const y = new Date(Date.UTC(x.getUTCFullYear(),0,1)); return Math.ceil((((x-y)/86400000)+1)/7); }
function planWeek(d){ const anchor = new Date('2026-09-09T12:00:00'); const diffWeeks = Math.round((startOfWeek(d) - startOfWeek(anchor)) / 604800000); return Math.max(1, 2 + diffWeeks); }
function add(base, inc, week){ return base + inc*week; }
function dayLabel(d){ return d.toLocaleDateString('no-NO', { weekday:'long', day:'numeric', month:'long', year:'numeric'}); }
function isTrainingDay(d){ const day = d.getDay(); return day === 1 || day === 3 || day === 5; }
function getWorkout(d){ const week = planWeek(d); const day = d.getDay(); if(day === 1){ return { type:'training', title:'Mandag · styrke + 44 min jogging', items:[ ['Magen','3×12'], ['Rygghev','1×12–15'], ['Benkpress smalt grep',`40×8 · 60×6 · 70×5 · 72,5×5 · 75×4 · ${displayKg(add(75,1.25,week))} kg ×4`,'+1,25 kg/uke på siste arbeidssett'], ['Markløft vanlig',`60×8 · 80×6 · 100×5 · 120×5 · 120×5 · ${displayKg(add(140,2.5,week))} kg ×3`,'+2,5 kg/uke på siste arbeidssett'], ['Jogging','44 min'] ]}; } if(day === 3){ const hangups = week % 2 === 0 ? ['Hangups', 'Vektuke · 4 sett × 3–5 reps · bruk ekstra vekt du klarer med ren teknikk', 'Annenhver uke: færre reps + ekstra vekt'] : ['Hangups', `Repsuke · 4 · 4 · ${3+week} · ${3+week} reps`, 'Annenhver uke: flere repetisjoner']; return { type:'training', title:'Onsdag · styrke + 36 min jogging', items:[ ['Magen','3×15'], ['Rygghev','3×10–12'], hangups, ['Lattroing','4×8–10'], ['Dips med vekt','0×6 · 0×6 · 10×5 · 10×5 · 10×5 · 10 kg ×5'], ['Sittende hantelpress','18×8 · 20×6 · 22×5 · 22×5 · 22 kg ×5'], ['Biceps','4×8'], ['Triceps','4×8'], ['Facepulls','4×10'], ['Jogging','36 min'] ]}; } if(day === 5){ return { type:'training', title:'Fredag · styrke + 44 min jogging', items:[ ['Magen','3×12'], ['Rygghev','1×12–15'], ['Knebøy nakke',`40×8 · 60×6 · 80×5 · 90×5 · 95×5 · ${displayKg(add(100,2.5,week))} kg ×3`,'+2,5 kg/uke på siste arbeidssett'], ['Benkpress',`40×8 · 60×6 · 65×5 · 70×5 · 75×5 · ${displayKg(add(80,1.25,week))} kg ×3`,'+1,25 kg/uke på siste arbeidssett'], ['Jogging','44 min'] ]}; } return { type:'rest', title:'Hviledag', items:[] }; }
function mainLifts(d){ const week = planWeek(d); const day = d.getDay(); if(day === 1) return [['Smal benk', add(75,1.25,week), 4, 1.25], ['Markløft', add(140,2.5,week), 3, 2.5]]; if(day === 3) return [['Hangups', null, null, null]]; if(day === 5) return [['Knebøy', add(100,2.5,week), 3, 2.5], ['Benkpress', add(80,1.25,week), 3, 1.25]]; return []; }
function getMonthStats(year, month){ const days = new Date(year, month+1, 0).getDate(); let training = 0, done = 0; for(let d=1; d<=days; d++){ const date = new Date(year, month, d, 12); if(isTrainingDay(date)){ training++; if(state.done[keyOf(date)]) done++; } } return {training, done}; }
function renderMiniWeek(){ const start = startOfWeek(selected); $('miniWeekTitle').textContent = `Uke ${isoWeek(selected)} · planuke ${planWeek(selected)}`; let doneCount = 0; const wrap = $('miniWeek'); wrap.innerHTML = ''; for(let i=0;i<7;i++){ const d = new Date(start); d.setDate(start.getDate()+i); const div = document.createElement('button'); div.className = 'mini-day ' + (isTrainingDay(d)?'train':'rest') + (keyOf(d)===keyOf(selected)?' selected':'') + (state.done[keyOf(d)]?' done':''); div.innerHTML = `<b>${dayShortMon[i]}</b><span>${d.getDate()}/${d.getMonth()+1}</span><span>${isTrainingDay(d)?(state.done[keyOf(d)]?'Fullført':'Økt'):'Fri'}</span>`; if(isTrainingDay(d)&&state.done[keyOf(d)]) doneCount++; div.addEventListener('click',()=>{ selected = d; view = new Date(d.getFullYear(), d.getMonth(), 1, 12); render();}); wrap.appendChild(div); } $('weekProgress').textContent = `${doneCount}/3 fullført`; }
function renderCalendar(){ const year = view.getFullYear(); const month = view.getMonth(); const first = new Date(year, month, 1, 12); const daysInMonth = new Date(year, month+1, 0).getDate(); const offset = (first.getDay()+6)%7; const cal = $('cal'); $('monthTitle').textContent = `${months[month][0].toUpperCase()}${months[month].slice(1)} ${year}`; cal.innerHTML = ''; for(let i=0;i<offset;i++){ const blank = document.createElement('div'); blank.className = 'blank'; cal.appendChild(blank); } for(let d=1; d<=daysInMonth; d++){ const date = new Date(year, month, d, 12); const btn = document.createElement('button'); btn.className = 'day-cell ' + (isTrainingDay(date) ? 'train' : 'rest'); if(state.done[keyOf(date)]) btn.classList.add('done'); if(keyOf(date) === keyOf(new Date())) btn.classList.add('today'); if(keyOf(date) === keyOf(selected)) btn.classList.add('selected'); const short = dayShortMon[(date.getDay()+6)%7]; const marker = isTrainingDay(date) ? (state.done[keyOf(date)] ? 'FULLFØRT' : 'ØKT') : 'FRI'; btn.innerHTML = `<span class="mini">${short}</span><span class="num">${d}</span><span class="marker">${marker}</span>`; btn.addEventListener('click', ()=>{ selected = date; render(); }); cal.appendChild(btn); } const stats = getMonthStats(year, month); $('monthPercent').textContent = stats.training ? `${Math.round((stats.done/stats.training)*100)}%` : '0%'; }
function renderWorkout(){ const date = selected; const workout = getWorkout(date); const isToday = keyOf(date) === keyOf(new Date()); const done = !!state.done[keyOf(date)]; $('selectedDayName').textContent = isToday ? 'DAGENS VALGTE DAG' : 'VALGT DAG'; $('selectedDateTitle').textContent = dayLabel(date); $('selectedDateSub').textContent = workout.type === 'training' ? (done ? 'Økten er markert som fullført.' : 'Planlagt treningsdag.') : 'Dette er en hviledag i planen.'; $('planWeekTag').textContent = `Planuke ${planWeek(date)} · Årsuke ${isoWeek(date)}`; $('dayTypeTag').textContent = workout.type === 'training' ? (done ? 'Treningsdag · fullført' : 'Treningsdag') : 'Hviledag'; $('workoutTitle').textContent = workout.title; $('workoutMeta').textContent = dayLabel(date); const toggle = $('toggleDone'); if(workout.type === 'training'){ toggle.classList.remove('hidden'); toggle.textContent = done ? 'Angre fullført' : 'Fullfør økt'; toggle.onclick = ()=>{ if(state.done[keyOf(date)]) delete state.done[keyOf(date)]; else state.done[keyOf(date)] = true; save(); render(); }; } else { toggle.classList.add('hidden'); } $('workoutList').innerHTML = workout.items.length ? workout.items.map(item => `<div class="exercise"><b>${item[0]}</b><div class="sets">${item[1]}</div>${item[2] ? `<div class="progress">${item[2]}</div>` : ''}</div>`).join('') : '<p>Fri dag. Bruk den til mat, søvn og restitusjon.</p>'; const next = new Date(date); next.setDate(next.getDate()+7); const nextWorkout = getWorkout(next); $('nextWeek').innerHTML = nextWorkout.items.filter(item=>item[2]).map(item => `<div class="exercise"><b>${item[0]}</b><div class="sets">${item[1]}</div></div>`).join('') || '<p>Ingen automatisk progresjon på denne dagen.</p>'; renderLogger(date); }
function renderLogger(date){ if(!state.logs) state.logs = {}; const lifts = mainLifts(date); const box = $('logger'); const hist = $('history'); if(!lifts.length){ box.innerHTML = '<p>Ingen hovedløft å logge denne dagen.</p>'; hist.innerHTML = ''; return; } box.innerHTML = lifts.map((lift, idx)=>{ const [name, baseKg, reps, increment] = lift; const id = `${keyOf(date)}|${name}`; const old = state.logs[id] || {}; let suggestion = ''; if(name === 'Hangups'){ const weighted = planWeek(date)%2===0; suggestion = weighted ? 'Vektuke: 3–5 reps med ekstra vekt. Øk først når alle settene er rene.' : 'Repsuke: prøv å slå forrige kroppsvektresultat med god teknikk.'; } else { const previous = Object.entries(state.logs).filter(([k,v]) => k.endsWith(`|${name}`) && v.kg).sort((a,b)=>a[0].localeCompare(b[0])).pop(); const goal = previous ? Number(previous[1].kg) + increment : baseKg; suggestion = `Forslag neste gang: ${displayKg(goal)} kg × ${reps}`; } return `<div class="loghint">${name} · ${suggestion}</div><div class="logrow"><b>${name}</b><input id="kg${idx}" inputmode="decimal" placeholder="kg" value="${old.kg || ''}"><input id="rp${idx}" inputmode="numeric" placeholder="reps" value="${old.reps || ''}"><button data-log="${idx}" class="ghost">Lagre</button></div>`; }).join(''); box.querySelectorAll('[data-log]').forEach(btn => btn.addEventListener('click', ()=>{ const idx = Number(btn.dataset.log); const [name] = lifts[idx]; const id = `${keyOf(date)}|${name}`; state.logs[id] = { kg: $(`kg${idx}`).value.replace(',','.'), reps: $(`rp${idx}`).value, date: keyOf(date)}; save(); renderLogger(date); })); const recent = Object.entries(state.logs).filter(([k])=>k.startsWith(keyOf(date))).map(([k,v]) => `${k.split('|')[1]}: ${v.kg || '–'} kg × ${v.reps || '–'}`).join(' · '); hist.innerHTML = recent ? `<div class="history">Lagret for ${dayLabel(date)}: ${recent}</div>` : ''; }
function openSettings(){ var b=$('settingsBackdrop'), p=$('settingsPanel'); if(b) b.hidden=false; if(p) p.hidden=false; $('videoToggle').checked=!!state.videoOn; highlightSelectedTheme(); }
function closeSettings(){ var b=$('settingsBackdrop'), p=$('settingsPanel'); if(b) b.hidden=true; if(p) p.hidden=true; }
function highlightSelectedTheme(){ document.querySelectorAll('.theme-card').forEach(el => el.classList.toggle('selected-theme', el.dataset.theme === state.theme)); }
function applyTheme(theme){ state.theme = theme; document.body.dataset.theme = theme; save(); highlightSelectedTheme(); }
function applyVideoState(){ const video = $('bgVideo'); if(!video) return; video.style.display = state.videoOn ? '' : 'none'; }
function exportData(){ const data = JSON.stringify(state, null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `styrkeplan-backup-${keyOf(new Date())}.json`; a.click(); URL.revokeObjectURL(url); }
function importData(file){ const reader = new FileReader(); reader.onload = ()=>{ try{ const imported = JSON.parse(reader.result); Object.assign(state, DEFAULT_STATE, imported); save(); document.body.dataset.theme = state.theme || 'violet'; applyVideoState(); render(); closeSettings(); alert('Data importert.'); }catch(e){ alert('Kunne ikke lese filen.'); } }; reader.readAsText(file); }
function render(){ const now = new Date(); $('todayLine').textContent = now.toLocaleDateString('no-NO', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).toUpperCase(); $('weekLine').textContent = `I dag: årsuke ${isoWeek(now)} · planuke ${planWeek(now)}`; renderMiniWeek(); renderCalendar(); renderWorkout(); }

function initApp(){
  try{
    $('prevMonth').addEventListener('click', function(){ view = new Date(view.getFullYear(), view.getMonth()-1, 1, 12); renderCalendar(); });
    $('nextMonth').addEventListener('click', function(){ view = new Date(view.getFullYear(), view.getMonth()+1, 1, 12); renderCalendar(); });
    $('todayBtn').addEventListener('click', function(){ selected = new Date(); view = new Date(selected.getFullYear(), selected.getMonth(), 1, 12); render(); });
    $('settingsBtn').addEventListener('click', openSettings);
    $('closeSettings').addEventListener('click', closeSettings);
    $('settingsBackdrop').addEventListener('click', closeSettings);

    document.querySelectorAll('.theme-card').forEach(function(btn){
      btn.addEventListener('click', function(){ applyTheme(btn.dataset.theme); });
    });

    $('videoToggle').addEventListener('change', function(e){
      state.videoOn = e.target.checked;
      save();
      applyVideoState();
    });

    $('exportBtn').addEventListener('click', exportData);
    $('importFile').addEventListener('change', function(e){
      if(e.target.files && e.target.files[0]) importData(e.target.files[0]);
      e.target.value='';
    });

    document.body.dataset.theme = state.theme || 'violet';

    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      state.videoOn = false;
    }

    applyVideoState();
    render();

    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js?v=61').then(function(reg){
        if(reg.update) reg.update();
      }).catch(function(){});
    }
  }catch(err){
    console.error('Styrkeplan init error:', err);
    var line = $('weekLine');
    if(line) line.textContent = 'Kunne ikke starte appen. Oppdater siden.';
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initApp);
}else{
  initApp();
}
