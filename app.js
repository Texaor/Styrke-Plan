const $=x=>document.getElementById(x),K=d=>d.toISOString().slice(0,10),mo=["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"];let S=JSON.parse(localStorage.getItem("sp")||'{"done":{}}'),V=new Date(),sel=new Date();function save(){localStorage.setItem("sp",JSON.stringify(S))}function isoWeek(d){d=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));let y=new Date(Date.UTC(d.getUTCFullYear(),0,1));return Math.ceil((((d-y)/86400000)+1)/7)}function planWeek(d){let a=new Date("2026-09-09T12:00"),m=x=>{x=new Date(x);x.setDate(x.getDate()-((x.getDay()+6)%7));return x};return Math.max(1,2+Math.round((m(d)-m(a))/604800000))}const f=n=>String(n).replace(".",",");function W(d){let w=planWeek(d),day=d.getDay();if(day==1)return["Mandag · styrke + 44 min jogging",[["Magen","3×12"],["Rygghev","1×12–15"],["Benkpress smalt grep",`40×8 · 60×6 · 70×5 · 72,5×5 · 75×4 · ${f(75+1.25*w)} kg ×4`,"+1,25 kg/uke"],["Markløft vanlig",`60×8 · 80×6 · 100×5 · 120×5 · 120×5 · ${f(140+2.5*w)} kg ×3`,"+2,5 kg/uke"],["Jogging","44 min"]]];if(day==3)return["Onsdag · styrke + 36 min jogging",[["Magen","3×15"],["Rygghev","3×10–12"],["Hangups",w%2===0?`Vektuke · 4 sett × 3–5 reps · legg til ekstra vekt du klarer med ren teknikk`:`Repsuke · 4 · 4 · ${3+w} · ${3+w} reps`,"Annenhver uke: ekstra vekt / flere repetisjoner"],["Lattroing","4×8–10"],["Dips m vekt","0×6 · 0×6 · 10×5 · 10×5 · 10×5 · 10 kg ×5"],["Sittende hantelpress","18×8 · 20×6 · 22×5 · 22×5 · 22 kg ×5"],["Biceps","4×8"],["Triceps","4×8"],["Facepulls","4×10"],["Jogging","36 min"]]];if(day==5)return["Fredag · styrke + 44 min jogging",[["Magen","3×12"],["Rygghev","1×12–15"],["Knebøy nakke",`40×8 · 60×6 · 80×5 · 90×5 · 95×5 · ${f(100+2.5*w)} kg ×3`,"+2,5 kg/uke"],["Benkpress",`40×8 · 60×6 · 65×5 · 70×5 · 75×5 · ${f(80+1.25*w)} kg ×3`,"+1,25 kg/uke"],["Jogging","44 min"]]];return null}function show(d){let x=W(d),dn=!!S.done[K(d)];$("pw").textContent=`PLANUKE ${planWeek(d)} · ÅRSUKE ${isoWeek(d)}`;$("title").textContent=K(d)==K(new Date())?"Dagens økt":"Valgt dag";$("sub").textContent=x?(dn?"Fullført ✓":"Klar når du er"):"Hviledag";$("worktitle").textContent=x?x[0]:"Ingen planlagt trening";$("done").style.display=x?"":"none";$("done").textContent=dn?"Angre":"Fullfør økt";$("done").onclick=()=>{S.done[K(d)]=!dn;save();render()};$("work").innerHTML=x?x[1].map(i=>`<div class=ex><b>${i[0]}</b><div class=sets>${i[1]}</div>${i[2]?`<div class=prog>${i[2]}</div>`:""}</div>`).join(""):"<p>Restitusjonsdag.</p>";renderLogger(d);let n=new Date(d);n.setDate(n.getDate()+7),q=W(n);$("next").innerHTML=q?q[1].filter(i=>i[2]).map(i=>`<div class=ex><b>${i[0]}</b><div class=sets>${i[1]}</div></div>`).join(""):""}function cal(){let y=V.getFullYear(),m=V.getMonth(),days=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7,s="",tot=0,done=0;$("month").textContent=mo[m][0].toUpperCase()+mo[m].slice(1)+" "+y;for(let i=0;i<off;i++)s+="<button class=blank></button>";for(let i=1;i<=days;i++){let d=new Date(y,m,i),tr=!!W(d),dn=!!S.done[K(d)];tot+=tr;done+=tr&&dn;s+=`<button data-d="${K(d)}" class="${tr?"train ":""}${dn?"finished ":""}${K(d)==K(new Date())?"today":""}">${i}</button>`}$("cal").innerHTML=s;$("pct").textContent=tot?Math.round(done/tot*100)+"%":"0%";document.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{sel=new Date(b.dataset.d+"T12:00");show(sel)})}window.move=n=>{V=new Date(V.getFullYear(),V.getMonth()+n,1);cal()};
function mainLifts(d){
 let day=d.getDay(), w=planWeek(d);
 if(day===1)return [["Smal benk",75+1.25*w,4,1.25],["Markløft",140+2.5*w,3,2.5]];
 if(day===3)return [["Hangups",null,null,null]];
 if(day===5)return [["Knebøy",100+2.5*w,3,2.5],["Benkpress",80+1.25*w,3,1.25]];
 return [];
}
function renderLogger(d){
 S.logs=S.logs||{};
 let lifts=mainLifts(d), box=$("logger"), hist=$("history");
 if(!lifts.length){box.innerHTML="<p>Ingen hovedløft å logge denne dagen.</p>";hist.innerHTML="";return}
 box.innerHTML=lifts.map((x,i)=>{
   let id=K(d)+"|"+x[0], old=S.logs[id]||{}, suggestion="";
   if(x[0]==="Hangups"){
     let weighted=planWeek(d)%2===0;
     suggestion=weighted?"Vektuke: 3–5 reps med ekstra vekt. Øk først når alle sett er rene.":"Repsuke: prøv å slå forrige kroppsvektresultat.";
   } else {
     let last=Object.entries(S.logs).filter(([k,v])=>k.endsWith("|"+x[0])&&v.kg).sort((a,b)=>a[0].localeCompare(b[0])).pop();
     let sug=last?Number(last[1].kg)+x[3]:x[1];
     suggestion=`Forslag neste gang: ${f(sug)} kg × ${x[2]}`;
   }
   return `<div class=loghint>${x[0]} · ${suggestion}</div><div class=logrow><b>${x[0]}</b><input id="kg${i}" inputmode=decimal placeholder="kg" value="${old.kg||""}"><input id="rp${i}" inputmode=numeric placeholder="reps" value="${old.reps||""}"><button data-log="${i}">Lagre</button></div>`;
 }).join("");
 box.querySelectorAll("[data-log]").forEach(b=>b.onclick=()=>{
   let i=+b.dataset.log,x=lifts[i],id=K(d)+"|"+x[0];
   S.logs[id]={kg:$("kg"+i).value.replace(",","."),reps:$("rp"+i).value,date:K(d)};save();renderLogger(d);
 });
 let recent=Object.entries(S.logs).filter(([k])=>k.startsWith(K(d))).map(([k,v])=>`${k.split("|")[1]}: ${v.kg||"–"} kg × ${v.reps||"–"}`).join(" · ");
 hist.innerHTML=recent?`<div class=history>Lagret i dag: ${recent}</div>`:"";
}
function render(){let n=new Date();$("date").textContent=n.toLocaleDateString("no-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase();$("week").textContent=`Årsuke ${isoWeek(n)} · planuke ${planWeek(n)}`;cal();show(sel)}if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js");render();
// Appearance settings
(function(){
 const saved=localStorage.getItem("styrke-theme")||"violet";
 document.body.dataset.theme=saved;
 const dlg=document.getElementById("settings");
 document.getElementById("settingsBtn").onclick=()=>dlg.showModal();
 document.getElementById("closeSettings").onclick=()=>dlg.close();
 document.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{
   document.body.dataset.theme=b.dataset.theme;
   localStorage.setItem("styrke-theme",b.dataset.theme);
   dlg.close();
 });
})();
