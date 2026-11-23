import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

window.__civilweekBooted=true;
const $ = (id) => document.getElementById(id);
const configured = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
let isGuest=false;
let db = null, currentUser = null, profile = null, members = [], workItems = [], reports = [], progressRows = [], baselineRows = [], weeklyProgress = [];
if (configured) db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const org = [
  ["President Director","Prof. Dr. Techn. Ir. Danang Parikesit, M.Sc.(Eng.), IPU., APEC.Eng., QGRP.","manager"],
  ["Project Manager","Ir. Taqia Rahman, S.T., M.Sc., Ph.D., IPM.","manager"],
  ["Quality Control Manager","Dr. Toriq Arif Ghuzdewan, S.T., M.Sc.","manager"],
  ["Project Finance Manager","Putri Paramita Agritansia, S.E., M.Acc.","manager"],
  ["Project Engineering Manager","Muhamad Fauzi Darmawan, S.T., M.Eng.","manager"],
  ["Project Control","Ir. Galih Irsyad, S.T., M.Eng., Ph.D.","manager"],
  ["Quantity & Cost","Franciska Laura, S.M., M.M.","staff"],
  ["Scheduler","Anggito Wahyu, S.T.","staff"],
  ["BIM","Hanif Nahrufiraus, S.T.","staff"],
  ["Drafter","Fristo Wijaya, S.T.","staff"],
  ["MP Engineer","Angga Pukein Ginting, S.T.","staff"],
  ["Project Construction Manager","Prof. Ir. Ali Awaludin, S.T., M.Eng., Ph.D., IPU., ACPE.","manager"],
  ["Mekanik","Raditya Prabaswara, S.T.","staff"],
  ["Staff Gudang","Zahran Razzag, S.T.","staff"],
  ["Surveyor","Satria Chandra, S.T.","staff"],
  ["Supervisor","Sulthon Aqil, S.T.","supervisor"],
  ["Mandor","Mandor Proyek","worker"],
  ["Kepala Tukang","Kepala Tukang","worker"],
  ["Tukang","Tukang","worker"],
  ["Pekerja","Pekerja","worker"],
  ["HSEM","Ir. Nurul Alvia Istiqomah, S.T., M.Sc., Ph.D.","manager"],
  ["Safety Officer","Radja Michael, S.T.","supervisor"],
  ["Environmental Officer","Rokhim Trisna, S.T.","staff"]
];

const defaultWork = [
 ["Pekerjaan Persiapan dan Umum","Pekerjaan Persiapan Umum",1.45],
 ["Pekerjaan Penerapan Rencana Kesehatan dan Keselamatan","Pekerjaan Persiapan Umum",0.12],
 ["Pekerjaan Pondasi Dalam","Pekerjaan Struktur Bawah",6.92],
 ["Pekerjaan Dinding Penahan Tanah","Pekerjaan Struktur Bawah",4.62],
 ["Pekerjaan Struktur Bawah Lantai Mesin Lift & GWT","Pekerjaan Struktur Bawah",7.44],
 ["Pekerjaan Struktur Bawah Lantai Semi Basement","Pekerjaan Struktur Bawah",4.26],
 ["Pekerjaan Lantai Mesin Lift & GWT","Pekerjaan Struktur Atas",2.86],
 ["Pekerjaan Lantai Semi Basement","Pekerjaan Struktur Atas",6.12],
 ["Pekerjaan Lantai 1","Pekerjaan Struktur Atas",4.69],
 ["Pekerjaan Lantai 2","Pekerjaan Struktur Atas",3.83],
 ["Pekerjaan Lantai 3","Pekerjaan Struktur Atas",3.80],
 ["Pekerjaan Lantai 4","Pekerjaan Struktur Atas",3.71],
 ["Pekerjaan Lantai 5","Pekerjaan Struktur Atas",3.62],
 ["Pekerjaan Lantai 6","Pekerjaan Struktur Atas",3.78],
 ["Pekerjaan Lantai 7","Pekerjaan Struktur Atas",4.30],
 ["Pekerjaan Lantai Atap","Pekerjaan Struktur Atas",1.43],
 ["Pekerjaan Lantai Top Atap","Pekerjaan Struktur Atas",1.18],
 ["Pekerjaan Lantai Semi Basement (Arsitektur)","Pekerjaan Arsitektur",1.65],
 ["Pekerjaan Lantai 1 (Arsitektur)","Pekerjaan Arsitektur",5.34],
 ["Pekerjaan Lantai 2 (Arsitektur)","Pekerjaan Arsitektur",3.98],
 ["Pekerjaan Lantai 3 (Arsitektur)","Pekerjaan Arsitektur",4.22],
 ["Pekerjaan Lantai 4 (Arsitektur)","Pekerjaan Arsitektur",4.48],
 ["Pekerjaan Lantai 5 (Arsitektur)","Pekerjaan Arsitektur",4.12],
 ["Pekerjaan Lantai 6 (Arsitektur)","Pekerjaan Arsitektur",4.05],
 ["Pekerjaan Lantai 7 (Arsitektur)","Pekerjaan Arsitektur",4.08],
 ["Pekerjaan Lantai Atap dan Ruang Mesin","Pekerjaan Arsitektur",1.87],
 ["Pekerjaan Facade","Pekerjaan Arsitektur",0.37],
 ["Pekerjaan Jalan Utama","Pekerjaan Infrastruktur",0.30],
 ["Pekerjaan Hardstanding","Pekerjaan Infrastruktur",0.19],
 ["Pekerjaan Saluran","Pekerjaan Infrastruktur",0.18],
 ["Pekerjaan Pagar","Pekerjaan Infrastruktur",0.20],
 ["Pekerjaan Sumur Resapan","Pekerjaan Infrastruktur",0.25],
 ["Pekerjaan Landscape","Pekerjaan Infrastruktur",0.20],
 ["Pekerjaan Gardu PLN","Pekerjaan Infrastruktur",0.42]
];

function msg(id, text, ok=false){ $(id).textContent=text; $(id).className="form-message "+(ok?"success":"error"); }
function setConnected(ok, text){ $("connection").textContent=text; $("connection").className="pill "+(ok?"success":"warn"); }
function fmtDate(v){ return v ? new Date(v).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"}) : "—"; }
function fmtPct(v){ return `${Number(v||0).toFixed(2)}%`; }
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function showPage(page){ if(isGuest&&page==="reports")return; document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden")); $("page-"+page).classList.remove("hidden"); document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===page)); if(page==="curve") drawCurves(); }
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));

function renderProjectResponsibles(){
 const names=new Map();
 org.forEach(([position,name])=>{if(!["worker"].includes(org.find(x=>x[0]===position&&x[1]===name)?.[2]))names.set(name,position);});
 members.forEach(m=>{if(m.full_name&&m.role!=="worker")names.set(m.full_name,m.position||m.role||"Personel proyek");});
 for(const id of ["lpsOwner","constraintOwner"]){
  const el=$(id);if(!el)return;const previous=el.value;
  el.innerHTML='<option value="">Pilih penanggung jawab</option>'+[...names].map(([name,position])=>'<option value="'+esc(name)+'">'+esc(name)+' — '+esc(position)+'</option>').join("")+'<option value="Pekerja">Pekerja</option>';
  if([...el.options].some(o=>o.value===previous))el.value=previous;
 }
}
function renderOrg(){
 renderProjectResponsibles();
 $("orgGrid").innerHTML = org.map(([role,name])=>`<div class="org-card"><b>${esc(role)}</b><span>${esc(name)}</span></div>`).join("");
}
function renderMembers(){
 const options = members.length ? members.map(m=>`<option value="${esc(m.id)}" ${m.id===currentUser?.id?"selected":""}>${esc(m.full_name)} — ${esc(m.position||m.role||"Personel")}</option>`).join("") :
 `<option value="${esc(currentUser?.id||"")}">${esc(profile?.full_name||currentUser?.email||"Akun aktif")}</option>`;
 $("reporter").innerHTML=`<option value="">Pilih nama</option>${options}`;
 $("reportRole").value=profile?.position||profile?.role||"";
}
function renderWorkOptions(){
 const options=workItems.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join("");
 $("workItem").innerHTML='<option value="">Pilih pekerjaan</option>'+options;

}
async function loadMembers(){
 const {data,error}=await db.from("profiles").select("id,full_name,position,role,organization_group").order("full_name");
 if(error) console.warn(error); members=data||[]; renderMembers();renderProjectResponsibles();
}
async function loadWork(){
 const {data,error}=await db.from("work_items").select("*").order("sort_order");
 if(error){ console.error("Gagal memuat pekerjaan",error); workItems=[]; renderWorkOptions(); renderWorkTable(); const note=$("workLoadStatus"); if(note) note.textContent="Gagal mengambil pekerjaan: "+error.message+" (kode "+(error.code||"-")+")"; return; } workItems=data||[]; renderWorkOptions(); renderWorkTable(); const note=$("workLoadStatus"); if(note) note.textContent=`${workItems.length} pekerjaan berhasil dimuat dari Supabase.`;
}
async function loadReports(){
 const {data,error}=await db.from("progress_reports").select("id,created_at,reporter_name,report_type,location,status,description,priority").order("created_at",{ascending:false}).limit(100);
 if(error){console.warn(error);return;} reports=data||[]; renderReports();
}
async function loadProgress(){
 const {data,error}=await db.from("work_progress").select("id,work_item_id,period,actual_percent,created_at").order("period");
 if(error){console.warn(error);return;} progressRows=data||[]; renderWorkTable(); drawCurves(); updateStats();
}
async function loadBaseline(){drawCurves();}
async function loadWeeklyProgress(){
 const {data,error}=await db.from("project_weekly_progress").select("period,actual_cumulative,updated_at").order("period");
 if(error){console.warn("Gagal memuat realisasi mingguan",error);return;}
 weeklyProgress=data||[];updateStats();drawCurves();renderWeeklyCurveTable();
}
const checklistKey="civilweek-checklist-v2";
const checklistIds=["mag","form","excavate","pour","cctv"];
let checklistState={};
try{const saved=JSON.parse(localStorage.getItem(checklistKey)||"{}");if(saved&&typeof saved==="object")checklistState=saved;}catch(e){console.warn("Checklist storage:",e);}
function persistChecklists(){try{localStorage.setItem(checklistKey,JSON.stringify(checklistState));return true;}catch(e){return false;}}
function checklistEntries(){
 return checklistIds.flatMap(id=>(checklistState[id]?.history||[]).map((r,i)=>({
  id:"check-"+id+"-"+i,created_at:r.created_at,reporter_name:r.actor||"Pengguna Civilweek",
  report_type:"Checklist "+({mag:"MAG-CAGE",form:"Rapid-Cycle Formwork",excavate:"Safe-Excavate",pour:"Smart Pour Scheduling",cctv:"Smart PPE"}[id]),
  location:"Monitoring inovasi",status:r.complete?"Checklist lengkap":"Checklist "+r.done+"/4",
  priority:"Normal",description:(r.action==="reset"?"Reset tahapan · ":"Pemeriksaan tahapan · ")+r.done+"/4 selesai"+(r.note?" · "+r.note:"")+". Catatan checklist, bukan persetujuan teknis."
 })));
}
function renderChecklist(id){
 const root=document.querySelector('[data-checklist="'+id+'"]');if(!root)return;
 const saved=checklistState[id]||{},flags=Array.isArray(saved.flags)?saved.flags:[];
 root.querySelectorAll('input[type="checkbox"]').forEach((input,i)=>{input.checked=!!flags[i];input.disabled=isGuest;});
 const done=flags.filter(Boolean).length;
 $("check-progress-"+id).textContent=done+" / 4 tahap · "+Math.round(done/4*100)+"%";
 $("check-fill-"+id).style.width=done/4*100+"%";
 $("check-note-"+id).value=saved.note||"";$("check-note-"+id).disabled=isGuest;
 document.querySelectorAll('[data-check-save="'+id+'"],[data-check-reset="'+id+'"]').forEach(b=>b.disabled=isGuest);
 $("check-log-"+id).innerHTML=(saved.history||[]).slice(-4).reverse().map(r=>'<div>'+esc(new Date(r.created_at).toLocaleString("id-ID"))+' · '+esc(r.action==="reset"?"Reset":"Disimpan")+' · '+r.done+'/4 tahap · '+esc(r.note||"Tanpa catatan")+'</div>').join("")||'<div>Belum ada riwayat pemeriksaan.</div>';
}
function saveChecklist(id,reset=false){
 if(isGuest)return;
 const root=document.querySelector('[data-checklist="'+id+'"]');if(!root)return;
 const flags=reset?[false,false,false,false]:Array.from(root.querySelectorAll('input')).map(el=>el.checked);
 const note=reset?"":$("check-note-"+id).value.trim(),done=flags.filter(Boolean).length;
 const previous=checklistState[id]||{};
 const history=[...(previous.history||[]),{created_at:new Date().toISOString(),actor:profile?.full_name||currentUser?.email||"Pengguna",done,complete:done===4,note,action:reset?"reset":"save"}].slice(-40);
 checklistState[id]={flags,note,history};
 const persisted=persistChecklists();renderChecklist(id);
 $("check-message-"+id).textContent=(persisted?"Tersimpan di browser ini. ":"Tersimpan sementara di sesi ini. ")+done+"/4 tahap selesai; bukan persetujuan teknis.";
 renderReports();
}
checklistIds.forEach(id=>{
 document.querySelector('[data-check-save="'+id+'"]')?.addEventListener("click",()=>saveChecklist(id));
 document.querySelector('[data-check-reset="'+id+'"]')?.addEventListener("click",()=>{if(confirm("Reset semua tahapan checklist ini?"))saveChecklist(id,true);});
 document.querySelector('[data-checklist="'+id+'"]')?.addEventListener("change",()=>{
  const done=Array.from(document.querySelectorAll('[data-checklist="'+id+'"] input:checked')).length;
  $("check-progress-"+id).textContent=done+" / 4 tahap · "+done*25+"% (belum disimpan)";
  $("check-fill-"+id).style.width=done*25+"%";
 });
 renderChecklist(id);
});
const lpsKey="civilweek-lps-weekly-v1";
let lpsRecords=[];
try{const parsed=JSON.parse(localStorage.getItem(lpsKey)||"[]");if(Array.isArray(parsed))lpsRecords=parsed.slice(-200);}catch(e){console.warn("LPS:",e);}
function renderLps(){
 const evaluated=lpsRecords.filter(r=>r.status!=="Rencana"),done=evaluated.filter(r=>r.status==="Selesai").length;
 $("lpsPpc").textContent=evaluated.length?Math.round(done/evaluated.length*100)+"%":"—";
 $("lpsTotal").textContent=lpsRecords.length;
 $("lpsConstraints").textContent=lpsRecords.filter(r=>r.constraint&&r.status!=="Selesai").length;
 const weekFilter=$("lpsFilterWeek").value,statusFilter=$("lpsFilterStatus").value;
 $("lpsTable").innerHTML=lpsRecords.filter(r=>(weekFilter==="all"||String(r.week)===weekFilter)&&(statusFilter==="all"||r.status===statusFilter)).slice().reverse().map(r=>'<tr><td>Minggu '+r.week+'</td><td>'+esc(r.task)+'</td><td>'+esc(r.owner)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.constraint||"—")+'</td><td>'+(isGuest?"Viewer":'<button class="btn btn-outline btn-small" data-lps-id="'+esc(r.id)+'" type="button">Ubah status</button>')+'</td></tr>').join("")||'<tr><td colspan="6">Belum ada rencana mingguan.</td></tr>';
 $("lpsForm").querySelectorAll("input,select,button").forEach(el=>el.disabled=isGuest);
 renderLpsExtras();
}
const constraintKey="civilweek-constraints-v1";let constraintRecords=[];
try{const v=JSON.parse(localStorage.getItem(constraintKey)||"[]");if(Array.isArray(v))constraintRecords=v.slice(-200);}catch(e){console.warn("Constraints:",e);}
function persistConstraints(){try{localStorage.setItem(constraintKey,JSON.stringify(constraintRecords));return true;}catch(e){return false;}}
function renderLpsExtras(){
 const weeks=[...new Set(lpsRecords.map(r=>r.week))].sort((a,b)=>a-b);
 $("lpsWeeklyPpc").innerHTML=weeks.map(week=>{const evaluated=lpsRecords.filter(r=>r.week===week&&r.status!=="Rencana");const done=evaluated.filter(r=>r.status==="Selesai").length;const pct=evaluated.length?Math.round(done/evaluated.length*100):0;return '<div><b>Minggu '+week+'</b> · '+(evaluated.length?pct+"% ("+done+"/"+evaluated.length+")":"Belum dievaluasi")+'<div class="lps-mini-track"><span style="width:'+pct+'%"></span></div></div>';}).join("")||"Belum ada evaluasi mingguan.";
 const causes=new Map();lpsRecords.filter(r=>r.status==="Belum selesai").forEach(r=>{const key=(r.constraint||"Penyebab belum dicatat").trim();causes.set(key,(causes.get(key)||0)+1);});
 $("lpsRootCauses").innerHTML=[...causes].sort((a,b)=>b[1]-a[1]).map(([k,n])=>'<div>'+esc(k)+' <b>('+n+')</b></div>').join("")||"Belum ada pekerjaan berstatus belum selesai.";
 $("constraintTable").innerHTML=constraintRecords.slice().reverse().map(r=>'<tr><td>Minggu '+r.week+'</td><td>'+esc(r.category)+'</td><td>'+esc(r.description)+'<small> · '+esc(r.task)+'</small></td><td>'+esc(r.owner)+'</td><td>'+esc(r.deadline)+'</td><td>'+esc(r.status)+'</td><td>'+(isGuest?"Viewer":'<button class="btn btn-outline btn-small" data-constraint-id="'+esc(r.id)+'" type="button">'+(r.status==="Terbuka"?"Tandai selesai":"Buka kembali")+'</button>')+'</td></tr>').join("")||'<tr><td colspan="7">Belum ada constraint tercatat.</td></tr>';
 $("constraintForm").querySelectorAll("input,select,button").forEach(el=>el.disabled=isGuest);
 $("lpsConstraints").textContent=constraintRecords.filter(r=>r.status==="Terbuka").length+lpsRecords.filter(r=>r.constraint&&r.status!=="Selesai").length;
}
$("lpsFilterWeek").addEventListener("change",renderLps);$("lpsFilterStatus").addEventListener("change",renderLps);
$("constraintForm").addEventListener("submit",e=>{e.preventDefault();if(isGuest)return;
 constraintRecords.push({id:String(Date.now())+"-"+Math.random().toString(36).slice(2,7),created_at:new Date().toISOString(),week:Number($("constraintWeek").value),task:$("constraintTask").value.trim(),category:$("constraintCategory").value,description:$("constraintDescription").value.trim(),owner:$("constraintOwner").value.trim(),deadline:$("constraintDeadline").value,status:"Terbuka"});
 constraintRecords=constraintRecords.slice(-200);const ok=persistConstraints();renderLps();renderReports();$("constraintForm").reset();$("constraintMessage").textContent=ok?"Constraint berhasil dicatat di browser ini.":"Penyimpanan browser tidak tersedia.";
});
$("constraintTable").addEventListener("click",e=>{const b=e.target.closest("[data-constraint-id]");if(!b||isGuest)return;const r=constraintRecords.find(x=>x.id===b.dataset.constraintId);if(!r)return;r.status=r.status==="Terbuka"?"Selesai":"Terbuka";r.created_at=new Date().toISOString();persistConstraints();renderLps();renderReports();});
function constraintReportEntries(){return constraintRecords.map(r=>({id:"constraint-"+r.id,created_at:r.created_at,reporter_name:r.owner,report_type:"Constraint · Look-Ahead",location:"Minggu "+r.week,status:r.status,priority:"Menengah",description:r.category+" · "+r.task+" · "+r.description+" · Target: "+r.deadline}));}
function persistLps(){try{localStorage.setItem(lpsKey,JSON.stringify(lpsRecords));return true;}catch(e){return false;}}
$("lpsForm")?.addEventListener("submit",e=>{
 e.preventDefault();if(isGuest)return;
 const task=$("lpsTask").value.trim(),owner=$("lpsOwner").value.trim();if(!task||!owner)return;
 lpsRecords.push({id:String(Date.now())+"-"+Math.random().toString(36).slice(2,7),created_at:new Date().toISOString(),week:Number($("lpsWeek").value),task,owner,status:$("lpsStatus").value,constraint:$("lpsConstraint").value.trim(),due:$("lpsDue").value});
 lpsRecords=lpsRecords.slice(-200);const ok=persistLps();renderLps();renderReports();$("lpsForm").reset();$("lpsMessage").textContent=ok?"Rencana tersimpan di browser ini.":"Gagal menyimpan permanen; data hanya ada selama sesi.";
});
$("lpsTable")?.addEventListener("click",e=>{
 const b=e.target.closest("[data-lps-id]");if(!b||isGuest)return;
 const row=lpsRecords.find(r=>r.id===b.dataset.lpsId);if(!row)return;
 row.status=row.status==="Rencana"?"Selesai":row.status==="Selesai"?"Belum selesai":"Rencana";
 row.created_at=new Date().toISOString();persistLps();renderLps();renderReports();
});
function lpsReportEntries(){return lpsRecords.map(r=>({id:"lps-"+r.id,created_at:r.created_at,reporter_name:r.owner,report_type:"Rencana Mingguan · LPS",location:"Minggu "+r.week,status:r.status,priority:"Normal",description:r.task+(r.constraint?" · Constraint: "+r.constraint:"")+(r.due?" · Target: "+r.due:"")}));}
renderLps();
function innovationReports(){
 const entries=[];
 for(const [kind,label] of [["form","Rapid-Cycle Formwork"],["pour","Smart Pour Scheduling"]]){
  (manualRecords?.[kind]||[]).forEach((r,i)=>{
   const when=r.created_at||r.time||"";
   const detail=kind==="form"?("Durasi "+r.hours+" jam, "+r.ready+" modul siap, "+r.crew+" regu, reuse "+r.reuse+" kali"):("Kapasitas pompa "+r.capacity+" m³/jam, "+r.arrivals+" truk tiba, "+r.queue+" truk antre, tunggu "+r.wait+" menit");
   entries.push({id:"manual-"+kind+"-"+i,created_at:when,reporter_name:"Input manual inovasi (browser ini)",report_type:label,location:r.zone||"Proyek",status:"Catatan operasional",priority:"Normal",description:detail+(r.note?" · "+r.note:"")});
  });
 }
 for(const config of monitorConfigs){
  (monitorSamples[config.id]||[]).filter(r=>r.value>config.limit).slice(-12).forEach((r,i)=>entries.push({id:"virtual-"+config.id+"-"+i,created_at:r.time.toISOString(),reporter_name:config.id==="mag"?"Sensor virtual MAG-CAGE":"Sensor virtual Safe-Excavate",report_type:config.id==="mag"?"Peringatan MAG-CAGE":"Peringatan Safe-Excavate",location:"Monitoring inovasi",status:"Simulasi · Waspada",priority:"Menengah",description:config.metric+" "+r.value+" "+config.unit+" melampaui ambang demo "+config.limit+" "+config.unit+". Bukan hasil sensor lapangan."}));
 }
 return entries;
}
const activityResetKey="civilweek-activity-reset-cutoff-v1";
let activityResetCutoff=localStorage.getItem(activityResetKey)||"";
function resetLocalActivity(){
 if(isGuest)return;
 const approved=confirm("RESET SEMUA DATA LOKAL?\\n\\nIni menghapus catatan manual inovasi, LPS, constraint, keuangan, risiko, mutu, keputusan owner, checklist lama, dan riwayat K3 virtual pada browser ini. Data Supabase, akun, dan Kurva S resmi TIDAK dihapus. Simulasi virtual akan mulai lagi setelah halaman dimuat ulang.");
 if(!approved)return;
 const verify=prompt('Ketik RESET untuk mengonfirmasi penghapusan semua data lokal:');
 if(verify!=="RESET"){alert("Reset dibatalkan. Tidak ada data yang dihapus.");return;}
 const localKeys=["civilweek-manual-innovation-v1","civilweek-lps-weekly-v1","civilweek-constraints-v1","civilweek-checklist-v2","civilweek-activity-reset-cutoff-v1","civilweek-control-v1-finance","civilweek-control-v1-risk","civilweek-control-v1-quality","civilweek-control-v1-decision"];
 const sessionKeys=["civilweek-k3-events"];
 try{
  localKeys.forEach(k=>localStorage.removeItem(k));
  sessionKeys.forEach(k=>sessionStorage.removeItem(k));
 }catch(e){alert("Reset gagal: penyimpanan browser tidak dapat diakses. "+e.message);return;}
 alert("Data lokal berhasil direset. Halaman akan dimuat ulang. Data Supabase tetap aman.");
 window.location.reload();
}
$("resetRecentBtn").addEventListener("click",resetLocalActivity);
$("resetReportsBtn").addEventListener("click",resetLocalActivity);
function localAfterReset(rows){return activityResetCutoff?rows.filter(r=>String(r.created_at||"")>activityResetCutoff):rows;}
function localDateTime(id){
 const value=$(id).value;
 if(!value)throw Error("Tanggal dan waktu wajib diisi.");
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))throw Error("Tanggal atau waktu tidak valid.");
 if(date.getTime()>Date.now()+60000)throw Error("Tanggal dan waktu tidak boleh berada di masa depan.");
 return date;
}
function defaultManualDateTimes(){
 const now=new Date(),local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
 for(const id of ["formDateTimeInput","pourDateTimeInput"])if($(id)&&!$(id).value)$(id).value=local;
}
function allVisibleReports(){
 return [...localAfterReset(virtualK3Reports),...localAfterReset(innovationReports()),...localAfterReset(lpsReportEntries()),...localAfterReset(constraintReportEntries()),...reports].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
}
function renderReports(){
 if(isGuest)return;const allReports=allVisibleReports();
 $("statReports").textContent=allReports.length;
 $("statOpen").textContent=allReports.filter(r=>!["Selesai","Ditutup","Catatan operasional"].includes(r.status)&&!String(r.status||"").startsWith("Simulasi")).length;
 $("reportsTable").innerHTML=allReports.length?allReports.map(r=>`<tr><td>${fmtDate(r.created_at)}</td><td>${esc(r.reporter_name)}</td><td>${esc(r.report_type)}</td><td>${esc(r.location)}</td><td><span class="pill ${r.status==="Selesai"?"success":"warn"}">${esc(r.status||"Baru")}</span></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Belum ada laporan.</td></tr>`;
 $("recentList").innerHTML=allReports.slice(0,6).map(r=>`<div class="activity"><span class="activity-dot"></span><div><b>${esc(r.report_type)} · ${esc(r.location)}</b><small>${esc(r.reporter_name)} · ${fmtDate(r.created_at)}</small><p>${esc(r.description||"").slice(0,110)}</p></div></div>`).join("")||'<div class="empty">Belum ada laporan.</div>';
 $("lastUpdated").textContent="Diperbarui "+new Date().toLocaleTimeString("id-ID");renderOwnerOverview();
}
function latestActual(workId){const rows=progressRows.filter(p=>p.work_item_id===workId).sort((a,b)=>a.period.localeCompare(b.period)||a.created_at.localeCompare(b.created_at));return rows.length?Number(rows[rows.length-1].actual_percent):0;}
function weightedActual(){return workItems.reduce((s,w)=>s+Number(w.weight_percent||0)*latestActual(w.id)/100,0);}
const schedule33=[0.20,2.96,7.14,10.37,12.68,16.14,18.37,20.0,22.0,24.01,27.0,31.72,35.81,39.3,44.7,50.4,55.83,62.3,72.05,74.75,79.11,82.4,86.1,89.8,93.2,96.5,98.1,99.0,99.4,99.7,99.85,99.95,100];
const baselinePeriod33=i=>"2026-CW"+String(i+1).padStart(2,"0");
const activeBaseline=()=>schedule33.map((v,i)=>({period:baselinePeriod33(i),planned_cumulative:v}));
function planValue(){const rows=activeBaseline();return Number(rows[rows.length-1]?.planned_cumulative||0);}
function latestScheduleSnapshot(){
 const baseline=activeBaseline(),planMap=new Map(baseline.map(x=>[x.period,Number(x.planned_cumulative)]));
 const valid=weeklyProgress.filter(r=>planMap.has(r.period)&&Number.isFinite(Number(r.actual_cumulative))).slice().sort((a,b)=>a.period.localeCompare(b.period));
 const latest=valid.at(-1);if(!latest)return null;
 const week=baseline.findIndex(r=>r.period===latest.period)+1;
 const actual=Number(latest.actual_cumulative),planned=planMap.get(latest.period);
 return {week,actual,planned,deviation:actual-planned};
}
function renderOwnerOverview(){
 const x=latestScheduleSnapshot(),reportsCount=reports.length;
 $("ownerDataStatus").textContent=x?"DATA MINGGU "+x.week:"BELUM ADA REALISASI";
 $("ownerActual").textContent=x?fmtPct(x.actual):"—";
 $("ownerPlanned").textContent=x?fmtPct(x.planned):"—";
 $("ownerDeviation").textContent=x?(x.deviation>=0?"+":"")+x.deviation.toFixed(2)+" poin":"—";
 $("ownerWeek").textContent=x?"Evaluasi minggu "+x.week+" dari 33":"Belum ada periode evaluasi";
 $("ownerProgressNote").textContent=x?"Berdasarkan input kumulatif":"Belum ada laporan mingguan";
 $("ownerProgressBar").style.width=x?Math.max(0,Math.min(100,x.actual))+"%":"0%";
 $("ownerProgressCaption").textContent=x?"Realisasi fisik terlapor "+fmtPct(x.actual):"Belum ada progres fisik terlapor";
 const status=!x?"Belum tersedia":x.deviation<-.005?"Di bawah rencana":x.deviation>.005?"Di atas rencana":"Sesuai rencana";
 $("ownerSchedule").textContent=status;
 $("ownerScheduleHint").textContent=x?"Dibandingkan dengan minggu "+x.week:"Memerlukan realisasi mingguan";
 $("ownerConclusion").textContent=!x?"Belum tersedia laporan realisasi kumulatif. Status jadwal proyek belum bisa dinilai.":x.deviation<-.005?"Pada minggu "+x.week+", realisasi "+fmtPct(x.actual)+" tertinggal "+Math.abs(x.deviation).toFixed(2)+" poin dari rencana "+fmtPct(x.planned)+". Perlu pembahasan pemulihan jadwal.":x.deviation>.005?"Pada minggu "+x.week+", realisasi "+fmtPct(x.actual)+" lebih tinggi "+x.deviation.toFixed(2)+" poin dari rencana "+fmtPct(x.planned)+". Pastikan mutu dan keselamatan tetap terkendali.":"Pada minggu "+x.week+", realisasi "+fmtPct(x.actual)+" sesuai rencana "+fmtPct(x.planned)+". Lanjutkan pengawasan pekerjaan berikutnya.";
 const openConstraints=constraintRecords.filter(r=>r.status!=="Selesai").length;
 const openLps=lpsRecords.filter(r=>r.status==="Belum selesai").length;
 const pending=reports.filter(r=>!["Selesai","Ditutup"].includes(r.status)).length;
 $("ownerActions").textContent=(x&&x.deviation<-.005?"Prioritaskan penyebab keterlambatan dan susun rencana pemulihan. ":"")+(openConstraints?openConstraints+" kendala lokal belum ditutup. ":"")+(openLps?openLps+" komitmen kerja mingguan belum selesai. ":"")+(pending?pending+" laporan resmi masih memerlukan tindak lanjut. ":"")+(openConstraints+openLps+pending===0?"Belum ada kendala aktif yang tercatat dalam data yang tersedia. Tetap lakukan verifikasi lapangan.":"");
 $("ownerLocalNote").textContent="Laporan resmi yang dimuat: "+reportsCount+". LPS dan constraint tersimpan lokal di browser ini; data virtual bukan kejadian lapangan.";
}
function updateStats(){
 const x=latestScheduleSnapshot(),a=x?x.actual:null,p=x?x.planned:null;
 $("statPlan").textContent=p===null?"—":fmtPct(p);$("statActual").textContent=a===null?"—":fmtPct(a);
 $("curvePlan").textContent=p===null?"—":fmtPct(p);$("curveActual").textContent=a===null?"—":fmtPct(a);
 $("curveDeviation").textContent=x?(x.deviation>=0?"+":"")+x.deviation.toFixed(2)+" poin":"—";
 renderOwnerOverview();
}
function renderWorkTable(){ $("workTable").innerHTML=workItems.map(w=>`<tr><td>${esc(w.name)}</td><td>${fmtPct(w.weight_percent)}</td></tr>`).join("")||'<tr><td colspan="2">Belum ada pekerjaan.</td></tr>';updateStats(); }
function curvePerformance(){
 const baseline=activeBaseline(),planMap=new Map(baseline.map(x=>[x.period,Number(x.planned_cumulative)]));
 const actualRows=weeklyProgress.filter(r=>planMap.has(r.period)&&Number.isFinite(Number(r.actual_cumulative))).sort((a,b)=>a.period.localeCompare(b.period));
 const latest=actualRows.at(-1);
 if(!latest){$("curveSpi").textContent="—";$("curveScheduleStatus").textContent="Belum ada data";$("curveEvalWeek").textContent="—";$("curveAnalysis").textContent="Belum ada realisasi kumulatif yang diinput. Analisis jadwal belum dapat dilakukan.";return;}
 const week=baseline.findIndex(x=>x.period===latest.period)+1,plan=planMap.get(latest.period),actual=Number(latest.actual_cumulative),delta=actual-plan,spi=plan>0?actual/plan:null;
 const status=Math.abs(delta)<.005?"Sesuai rencana":delta<0?"Terlambat":"Lebih cepat";
 $("curveSpi").textContent=spi===null?"—":spi.toFixed(2);$("curveScheduleStatus").textContent=status;$("curveEvalWeek").textContent="Minggu "+week;
 $("curveAnalysis").textContent="Minggu "+week+": rencana kumulatif "+plan.toFixed(2)+"%, realisasi "+actual.toFixed(2)+"%, deviasi "+(delta>=0?"+":"")+delta.toFixed(2)+"% (selisih poin persentase). "+(delta<-.005?"Progres berada di bawah rencana; perlu evaluasi penyebab dan tindakan korektif.":delta>.005?"Progres berada di atas rencana; periksa keberlanjutan sumber daya dan mutu.":"Realisasi sesuai dengan rencana pada minggu evaluasi.")+" Analisis tidak menggantikan verifikasi lapangan.";
}
function renderWeeklyCurveTable(){
 const el=$("weeklyCurveTable");if(!el)return;
 const map=new Map(weeklyProgress.map(r=>[r.period,Number(r.actual_cumulative)]));
 el.innerHTML=activeBaseline().map((r,i)=>{
 const planned=Number(r.planned_cumulative),actual=map.get(r.period),has=map.has(r.period),delta=has?actual-planned:null;
 const status=!has?"Belum dilaporkan":Math.abs(delta)<.005?"Sesuai":delta<0?"Terlambat":"Lebih cepat";
 return `<tr><td>Minggu ${i+1}</td><td>${fmtPct(planned)}</td><td><b>${has?fmtPct(actual):"—"}</b></td><td>${has?(delta>=0?"+":"")+delta.toFixed(2)+"%":"—"}</td><td>${status}</td></tr>`;
 }).join("");
 curvePerformance();
}
function weightedActualAt(period){
 return workItems.reduce((sum,w)=>{
  const rows=progressRows.filter(p=>p.work_item_id===w.id && p.period<=period);
  if(!rows.length)return sum;
  const last=rows.sort((a,b)=>a.period.localeCompare(b.period)||a.created_at.localeCompare(b.created_at))[rows.length-1];
  return sum+Number(w.weight_percent||0)*Number(last.actual_percent||0)/100;
 },0);
}
function drawOne(canvasId){
 const c=$(canvasId); if(!c)return; const dpr=window.devicePixelRatio||1, width=c.clientWidth||700, height=Number(c.getAttribute("height"))||260;
 c.width=width*dpr;c.height=height*dpr;const ctx=c.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
 const pad={l:44,r:18,t:18,b:38},cw=width-pad.l-pad.r,ch=height-pad.t-pad.b;
 ctx.font="11px DM Sans";ctx.strokeStyle="#e9e5dc";ctx.fillStyle="#777";
 for(let i=0;i<=5;i++){let y=pad.t+ch*i/5;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.fillText(`${100-i*20}%`,4,y+4);}
 const periods=activeBaseline().map(x=>x.period);
 if(!periods.length){
  const demo=[0,1,3,6,10,16,23,32,42,52,63,73,81,88,93,97,100];
  ctx.font="bold 12px DM Sans";ctx.fillStyle="#8a5a00";ctx.textAlign="center";
  ctx.fillText("SIMULASI RENCANA • BUKAN BASELINE RESMI",width/2,12);
  ctx.beginPath();demo.forEach((v,i)=>{const x=pad.l+cw*i/(demo.length-1),y=pad.t+ch*(1-v/100);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  ctx.strokeStyle="#d99400";ctx.lineWidth=3;ctx.stroke();
  ctx.font="11px DM Sans";ctx.fillStyle="#777";
  [0,4,8,12,16].forEach(i=>ctx.fillText("M"+i,pad.l+cw*i/16,height-9));
  ctx.textAlign="left";return;
 }
 const planMap=new Map(activeBaseline().map(x=>[x.period,Number(x.planned_cumulative)]));
 const plan=periods.map(p=>planMap.has(p)?planMap.get(p):null);
 const actualMap=new Map(weeklyProgress.map(r=>[r.period,Number(r.actual_cumulative)]));
 const actual=periods.map(p=>actualMap.has(p)?actualMap.get(p):null);
 function line(vals,color){
  ctx.beginPath();let started=false;
  vals.forEach((v,i)=>{if(v===null||v===undefined){started=false;return;}let x=pad.l+(periods.length===1?cw/2:cw*i/(periods.length-1)),y=pad.t+ch*(1-v/100);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);});
  ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();
  vals.forEach((v,i)=>{if(v===null||v===undefined)return;let x=pad.l+(periods.length===1?cw/2:cw*i/(periods.length-1)),y=pad.t+ch*(1-v/100);ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});
 }
 line(plan,"#d99400");line(actual,"#263b59");
 const step=Math.max(1,Math.ceil(periods.length/6));
 periods.forEach((t,i)=>{if(i%step===0||i===periods.length-1){let x=pad.l+(periods.length===1?cw/2:cw*i/(periods.length-1));ctx.save();ctx.translate(x,height-8);ctx.rotate(-.25);ctx.fillStyle="#777";ctx.fillText(t,-12,0);ctx.restore();}});
}
function drawCurves(){drawOne("miniCurve");drawOne("mainCurve");}
async function refreshAll(){await Promise.all([loadMembers(),loadWork(),loadReports(),loadProgress(),loadBaseline(),loadWeeklyProgress()]);updateStats();drawCurves();renderWeeklyCurveTable();}
async function uploadPhoto(file){
 if(!file)return null;
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_"),path=`${currentUser.id}/${Date.now()}-${safe}`;
 const {error}=await db.storage.from("report-attachments").upload(path,file,{upsert:false});
 if(error)throw error;return path;
}

$("guestLoginBtn").addEventListener("click",()=>{
 isGuest=true;currentUser=null;profile=null;checklistIds.forEach(renderChecklist);renderLps();members=[];reports=[];weeklyProgress=[];progressRows=[];
 workItems=defaultWork.map(([name,category,weight_percent],i)=>({id:"demo-"+i,name,category,weight_percent}));
 $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("logoutBtn").classList.remove("hidden");
 $("guestBanner").classList.remove("hidden");$("formManualInput").querySelectorAll("input,select,button").forEach(el=>el.disabled=true);$("pourManualInput").querySelectorAll("input,select,button").forEach(el=>el.disabled=true);$("userName").textContent="Guest";$("userRole").textContent="Viewer · Demo";$("userInitial").textContent="G";
 document.querySelector('[data-page="reports"]').classList.add("hidden");
 $("addWorkBtn").classList.add("hidden");$("resetRecentBtn").disabled=true;$("resetReportsBtn").disabled=true;$("progressForm").closest("article").classList.add("hidden");
 $("refreshBtn").textContent="↻ Perbarui Tampilan";
 renderWorkTable();renderWeeklyCurveTable();updateStats();drawCurves();renderOrg();
 $("statReports").textContent="—";$("statOpen").textContent="—";$("recentList").innerHTML='<div class="empty">Laporan internal hanya tersedia bagi akun proyek.</div>';
 $("lastUpdated").textContent="Data demo";setConnected(true,"Guest · Viewer");showPage("dashboard");
});
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!configured){msg("loginMessage","Konfigurasi Supabase belum diisi. Ikuti README.md terlebih dahulu.");return;}
 const {data,error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});
 if(error){msg("loginMessage",error.message);return;} await enterApp(data.user);
});
async function enterApp(user){
 isGuest=false;currentUser=user;checklistIds.forEach(renderChecklist);renderLps();
 const {data,error}=await db.from("profiles").select("*").eq("id",user.id).single();
 if(error){msg("loginMessage","Akun belum memiliki profil personel. Minta administrator melengkapi tabel profiles.");await db.auth.signOut();return;}
 profile=data;$("guestBanner").classList.add("hidden");$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("logoutBtn").classList.remove("hidden");
 $("userName").textContent=profile.full_name||user.email;$("userRole").textContent=profile.position||profile.role||"Personel";$("userInitial").textContent=(profile.full_name||"U")[0].toUpperCase();
 $("reportDate").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
 await refreshAll();setConnected(true,"Database online");
}
$("logoutBtn").addEventListener("click",async()=>{if(!isGuest&&db)await db.auth.signOut();location.reload();});
$("refreshBtn").addEventListener("click",()=>{if(isGuest){drawOne("miniCurve");return;}refreshAll();});

$("reportForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!db)return;
 try{
  const reporter=members.find(m=>m.id===$("reporter").value)||profile;
  const attachment=await uploadPhoto($("reportPhoto").files[0]);
  const row={reporter_id:currentUser.id,reporter_name:reporter?.full_name||profile.full_name,reporter_position:reporter?.position||profile.position,report_type:$("reportType").value,work_item_id:$("workItem").value||null,location:$("reportLocation").value,priority:$("priority").value,due_date:$("dueDate").value||null,description:$("description").value,action_taken:$("actionTaken").value,attachment_path:attachment,reported_at:new Date($("reportDate").value).toISOString(),status:"Baru"};
  const {error}=await db.from("progress_reports").insert(row);if(error)throw error;
  msg("reportMessage","Laporan berhasil dikirim ke database pusat.",true);$("reportForm").reset();$("reportDate").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);await loadReports();
 }catch(err){msg("reportMessage",err.message||"Gagal mengirim laporan.");}
});
$("progressForm").addEventListener("submit",async e=>{
 e.preventDefault();
 try{
  const period=$("progressPeriod").value,actual=Number($("progressPercent").value);
  if(!/^2026-CW(0[1-9]|[12][0-9]|3[0-3])$/.test(period)||!Number.isFinite(actual)||actual<0||actual>100)throw Error("Pilih minggu 1–33 dan nilai 0–100%.");
  const existing=weeklyProgress.find(r=>r.period===period);
  const row={period,actual_cumulative:actual,note:$("progressNote").value,entered_by:currentUser.id,updated_at:new Date().toISOString()};
  const result=existing?await db.from("project_weekly_progress").update(row).eq("period",period):await db.from("project_weekly_progress").insert(row);
  if(result.error)throw result.error;
  msg("progressMessage","Realisasi kumulatif berhasil disimpan.",true);
  $("progressForm").reset();await loadWeeklyProgress();
 }catch(err){msg("progressMessage",err.message||"Gagal menyimpan realisasi.");}
});
$("addWorkBtn").addEventListener("click",async()=>{
 const name=prompt("Nama pekerjaan baru:");if(!name)return;
 const weight=Number(prompt("Bobot pekerjaan (%)","0"));if(!Number.isFinite(weight)||weight<0||weight>100){alert("Bobot tidak valid.");return;}
 const {error}=await db.from("work_items").insert({name,category:"Pekerjaan tambahan",weight_percent:weight,planned_percent:0,sort_order:workItems.length+1});
 if(error)alert(error.message);else await loadWork();
});

function exportableReports(){
 if(isGuest)throw Error("Guest tidak dapat mengakses laporan proyek.");
 return allVisibleReports();
}
function reportExportRows(){
 return exportableReports().map(r=>[fmtDate(r.created_at),r.reporter_name||"",r.report_type||"",r.location||"",r.priority||"",r.status||"",r.description||""]);
}
const reportColumns=["Tanggal","Pelapor","Jenis","Lokasi","Prioritas","Status","Uraian"];
function safeCsvCell(value){
 let s=String(value??"");if(/^[\\s]*[=+@-]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
function downloadReportCsv(){
 const rows=[reportColumns,...reportExportRows()];
 const csv="\uFEFF"+rows.map(row=>row.map(safeCsvCell).join(",")).join("\r\n");
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="laporan-civilweek-"+new Date().toISOString().slice(0,10)+".csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function printReportPdf(){
 const rows=reportExportRows();
 const css='body{font-family:Arial,sans-serif;color:#222;margin:25px}h1{font-size:22px}p{font-size:12px}table{border-collapse:collapse;width:100%;font-size:10px}td,th{border:1px solid #bbb;padding:7px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#f4e4b4}tr{break-inside:avoid}@page{size:A4 landscape;margin:12mm}';
 const body='<h1>Laporan Proyek Civilweek</h1><p>Dicetak: '+esc(new Date().toLocaleString("id-ID"))+' · Total '+rows.length+' laporan</p><table><thead><tr>'+reportColumns.map(c=>'<th>'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+esc(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table>';
 const w=window.open("","_blank");if(!w){alert("Izinkan pop-up untuk mencetak laporan.");return;}
 w.document.open();w.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Civilweek</title><style>'+css+'</style></head><body>'+body+'</body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),400);
}
$("reportCsvBtn").addEventListener("click",()=>{try{downloadReportCsv();}catch(e){alert(e.message);}});
$("reportPdfBtn").addEventListener("click",()=>{try{printReportPdf();}catch(e){alert(e.message);}});
renderOrg();
if(!configured){setConnected(false,"Belum dikonfigurasi");$("loginMessage").textContent="Hubungkan Supabase terlebih dahulu (lihat README.md).";$("loginMessage").className="form-message error";}
else{
 setConnected(false,"Menghubungkan…");
 db.auth.getSession().then(async({data,error})=>{if(error)throw error;if(data.session)await enterApp(data.session.user);else setConnected(true,"Siap masuk");}).catch(err=>{console.error("Supabase session:",err);setConnected(false,"Koneksi gagal: "+(err.message||"periksa jaringan"));});
 db.auth.onAuthStateChange((_event,session)=>{if(!session&&!isGuest){$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");$("logoutBtn").classList.add("hidden");}});
}
window.addEventListener("resize",()=>{if(!$("page-curve").classList.contains("hidden"))drawCurves();if(!$("page-dashboard").classList.contains("hidden"))drawOne("miniCurve");});


const innovationDemoSteps={
mag:["Pasang jig magnetik","Atur posisi sengkang","Periksa jarak dan selimut","Lepas jig sebelum pengecoran"],
form:["Siapkan Zona 1","Pindahkan regu ke Zona 2","Gunakan modul Zona 3","Periksa syarat bongkar dan reuse"],
excavate:["Galian tahap 1 dan penahan","Galian tahap 2 dan instrumentasi","Galian tahap 3 dan pengendalian air","Evaluasi batas geoteknik"],
pour:["Hitung kapasitas pompa dan truk","Atur slot kedatangan T1","Atur slot kedatangan T2","Evaluasi suplai dan potensi antrean"]
};
function updateInnovationDemo(id,value){
 const index=Math.max(0,Math.min(3,Number(value)||0)),steps=innovationDemoSteps[id];if(!steps)return;
 const slider=$("slider-"+id);if(slider)slider.value=index;
 $("metric-"+id).textContent="Tahap "+(index+1)+" / 4";
 $("step-"+id).textContent=steps[index];
 for(let i=0;i<3;i++){const check=$("check-"+id+"-"+i);check.textContent=i<index?"✓":"○";check.classList.toggle("done",i<index);}
 const scene=document.querySelector('[data-innovation="'+id+'"] .scene-object');if(scene)scene.style.transform="translateX("+(index*3)+"%)";
}
Object.keys(innovationDemoSteps).forEach(id=>{
 $("slider-"+id)?.addEventListener("input",e=>updateInnovationDemo(id,e.target.value));
 document.querySelector('[data-demo-next="'+id+'"]')?.addEventListener("click",()=>updateInnovationDemo(id,(Number($("slider-"+id).value)+1)%4));
 document.querySelector('[data-demo-reset="'+id+'"]')?.addEventListener("click",()=>updateInnovationDemo(id,0));
});


const monitorConfigs=[{"id":"mag","unit":"mm","metric":"Deviasi jarak sengkang","base":3.1,"limit":5},{"id":"excavate","unit":"mm","metric":"Deformasi dinding","base":7.2,"limit":10}];
const monitorSamples={};let sampleTick=0;
function monitorSecondary(id){
 const rand=(a,b)=>+(a+Math.random()*(b-a)).toFixed(1);
 if(id==="mag")return {cover:rand(27,43),magnet:rand(110,260),sensors:Math.floor(4+Math.random()*5)};
 if(id==="form")return {ready:Math.floor(4+Math.random()*11),reuse:Math.floor(1+Math.random()*9),crew:Math.floor(2+Math.random()*5)};
 return {settlement:rand(1.5,13.5),water:rand(.8,4.2),sensors:Math.floor(4+Math.random()*7)};
}
function monitorExtra(config,rows){
 const id=config.id,latest=rows.at(-1),v=latest.extra;
 const bindings=id==="mag"?[["magCover",v.cover],["magMagnet",v.magnet],["magSensors",v.sensors]]:id==="form"?[["formReady",v.ready],["formReuse",v.reuse],["formCrew",v.crew]]:[["excSettlement",v.settlement],["excWater",v.water],["excSensors",v.sensors]];
 bindings.forEach(([key,val])=>{const el=$(key);if(el)el.textContent=val;});
 const descriptions=id==="mag"?r=>[["Sensor jarak sengkang",r.value.toFixed(1)+" mm",r.value>5?"Waspada":"Normal"],["Sensor selimut beton",r.extra.cover+" mm","Terpantau"],["Sensor jig magnetik",r.extra.magnet+" N","Terpantau"]]:id==="form"?r=>[["Siklus bekisting",r.value.toFixed(1)+" jam",r.value>24?"Waspada":"Normal"],["Kesiapan modul",r.extra.ready+" modul","Terpantau"],["Pemakaian ulang",r.extra.reuse+" kali","Terpantau"]]:r=>[["Sensor deformasi",r.value.toFixed(1)+" mm",r.value>10?"Waspada":"Normal"],["Sensor penurunan",r.extra.settlement+" mm",r.extra.settlement>10?"Waspada":"Normal"],["Piezometer virtual",r.extra.water+" m","Terpantau"]];
 const el=$("sensorLog-"+id);
 if(el)el.innerHTML=rows.slice(-7).reverse().flatMap(r=>descriptions(r).map(d=>'<tr><td>'+r.time.toLocaleTimeString("id-ID")+'</td><td>'+d[0]+'</td><td>'+d[1]+'</td><td>'+d[2]+'</td></tr>')).join("");
}
function addMonitorSample(config){
 const id=config.id;const rows=monitorSamples[id]||[];
 const index=rows.length;
 const value=+(config.base*(.58+Math.random()*.85)+(Math.random()-.5)*config.base*.18).toFixed(1);
 rows.push({time:new Date(),value,extra:monitorSecondary(id)});if(rows.length>24)rows.shift();monitorSamples[id]=rows;
 renderMonitor(config);
}
function renderMonitor(config){
 const rows=monitorSamples[config.id]||[],latest=rows.at(-1);if(!latest)return;
 const pass=latest.value<=config.limit;
 $("live-"+config.id).textContent=latest.value.toLocaleString("id-ID");
 $("state-"+config.id).textContent=pass?"Normal":"Waspada";
 $("state-"+config.id).style.color=pass?"#247d4c":"#b45309";
 $("count-"+config.id).textContent=rows.length;monitorExtra(config,rows);setInnovationOverview(config.id,latest.value.toFixed(1)+" "+config.unit+(pass?" · Normal":" · Waspada"));
 $("history-"+config.id).innerHTML=rows.slice(-8).reverse().map(r=>'<tr><td>'+r.time.toLocaleTimeString("id-ID")+'</td><td>'+r.value.toFixed(1)+' '+config.unit+'</td><td>'+config.limit+' '+config.unit+'</td><td>'+(r.value<=config.limit?"Normal":"Waspada")+'</td></tr>').join("");
 const canvas=$("chart-"+config.id),ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height,p={l:42,r:18,t:20,b:32};
 ctx.clearRect(0,0,w,h);ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
 const max=Math.max(config.limit*1.45,...rows.map(r=>r.value))*1.05;
 for(let i=0;i<=4;i++){let y=p.t+(h-p.t-p.b)*i/4;ctx.strokeStyle="#e7e4dc";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();ctx.fillStyle="#777";ctx.font="12px sans-serif";ctx.fillText((max*(1-i/4)).toFixed(1),3,y+4);}
 const yy=v=>p.t+(h-p.t-p.b)*(1-v/max),xx=i=>p.l+(w-p.l-p.r)*(rows.length===1?.5:i/(rows.length-1));
 ctx.strokeStyle="#c65c20";ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(p.l,yy(config.limit));ctx.lineTo(w-p.r,yy(config.limit));ctx.stroke();ctx.setLineDash([]);
 ctx.strokeStyle="#eda900";ctx.lineWidth=3;ctx.beginPath();rows.forEach((r,i)=>i?ctx.lineTo(xx(i),yy(r.value)):ctx.moveTo(xx(i),yy(r.value)));ctx.stroke();
 rows.forEach((r,i)=>{ctx.fillStyle=r.value>config.limit?"#c65c20":"#e9a500";ctx.beginPath();ctx.arc(xx(i),yy(r.value),3,0,Math.PI*2);ctx.fill();});
 ctx.fillStyle="#777";ctx.fillText("Pembacaan simulasi →",w-170,h-9);
}
monitorConfigs.forEach(config=>{
 monitorSamples[config.id]=[];
 for(let i=0;i<10;i++)addMonitorSample(config);
 document.querySelector('[data-sample="'+config.id+'"]')?.addEventListener("click",()=>addMonitorSample(config));
});
setInterval(()=>{if(document.hidden)return;monitorConfigs.forEach(config=>addMonitorSample(config));if(!isGuest&&currentUser)renderReports();},8000);



/* Digital twin K3 — synthetic demo, never physical CCTV or real AI inference. */
const ppeZones=Array.from({length:12},(_,i)=>"Zona "+String.fromCharCode(65+i));
const ppeIssues=["Helm","Rompi","Sepatu safety","Sarung tangan"];
const ppeGrid=document.getElementById("ppeCameraGrid"),ppeFilter=document.getElementById("ppeZoneFilter");
let ppeWorkers=[],ppeRunning=true,ppeCycle=0,ppeEvents=[],ppeLastIssues=new Map(),ppeNextId=1,ppeRandomSeed=(Date.now()>>>0);
function ppeRandom(){ppeRandomSeed=(Math.imul(1664525,ppeRandomSeed)+1013904223)>>>0;return ppeRandomSeed/4294967296;}
const ppeInt=(lo,hi)=>lo+Math.floor(ppeRandom()*(hi-lo+1));
const ppeTime=()=>new Date().toLocaleTimeString("id-ID");
const ppeZoneName=z=>"Zona "+String.fromCharCode(65+z);
const ppeWorkerName=w=>"P"+String(w.id).padStart(3,"0");
function ppeCreateWorker(zone,slot){
 const id=ppeNextId++;
 return {id,zone,x:6+(slot%5)*18+ppeRandom()*5,depth:slot%2,dir:ppeRandom()<.5?-1:1,speed:.22+ppeRandom()*.9,phase:ppeRandom()*6.28,issue:ppeRandom()<.14?ppeIssues[ppeInt(0,3)]:null};
}
let innovationReportsReady=false;
const virtualK3Reports=JSON.parse(sessionStorage.getItem("civilweek-k3-events")||"[]");
function addVirtualK3Report(w){
 const now=new Date(),row={id:"k3-"+now.getTime()+"-"+w.id,created_at:now.toISOString(),reporter_name:"Smart PPE (data virtual)",report_type:"Inspeksi K3",location:"Zona "+String.fromCharCode(65+w.zone),status:"Perlu pemeriksaan",description:"Pekerja "+ppeWorkerName(w)+": "+w.issue+" tidak terdeteksi. Temuan virtual, bukan insiden lapangan.",priority:"Tinggi"};
 virtualK3Reports.unshift(row);if(virtualK3Reports.length>80)virtualK3Reports.length=80;
 sessionStorage.setItem("civilweek-k3-events",JSON.stringify(virtualK3Reports));
 if(innovationReportsReady)renderReports();
}
function ppeRecord(w){
 const key=w.id,old=ppeLastIssues.get(key)||null;
 if(old===w.issue)return;
 ppeLastIssues.set(key,w.issue);
 if(!w.issue)return;
 addVirtualK3Report(w);
 ppeEvents.unshift({time:ppeTime(),zone:w.zone,worker:ppeWorkerName(w),issue:w.issue,confidence:(89+w.id%10)+"%",status:"Perlu pemeriksaan"});
 if(ppeEvents.length>100)ppeEvents.length=100;
}
function ppeRenderEvents(){
 document.getElementById("cctvEvents").innerHTML=ppeEvents.length?ppeEvents.slice(0,50).map(e=>'<tr><td>'+e.time+'</td><td>CAM-'+String(e.zone+1).padStart(2,"0")+' / '+ppeZoneName(e.zone)+'</td><td>'+e.worker+' · '+e.issue+' tidak terdeteksi</td><td>'+e.confidence+'</td><td>'+e.status+'</td></tr>').join(""):'<tr><td colspan="5">Belum ada kejadian</td></tr>';
}
function setInnovationOverviewSafePpe(total,issues){const el=$("overview-cctv");if(el)el.textContent=total+" pekerja · "+issues+" pelanggaran virtual";}
function ppeStats(){
 const active=ppeWorkers.filter(w=>w.issue);
 setInnovationOverviewSafePpe(ppeWorkers.length,active.length);
 document.getElementById("ppeWorkerCount").textContent=ppeWorkers.length;
 document.getElementById("ppeCompliant").textContent=(ppeWorkers.length-active.length)+" / "+ppeWorkers.length;
 document.getElementById("ppeAlerts").textContent=active.length;
 document.getElementById("ppeHelmets").textContent=ppeWorkers.filter(w=>w.issue!=="Helm").length;
 document.getElementById("ppeVests").textContent=ppeWorkers.filter(w=>w.issue!=="Rompi").length;
 document.getElementById("ppeShoes").textContent=ppeWorkers.filter(w=>w.issue!=="Sepatu safety").length;
 document.getElementById("ppeIncidentCount").textContent=ppeEvents.length;
 ppeRenderEvents();
 ppeGrid.querySelectorAll(".ppe-cam").forEach(el=>{
  const z=Number(el.dataset.ppeZone),n=ppeWorkers.filter(w=>w.zone===z&&w.issue).length;
  const status=el.querySelector(".ppe-cam-foot strong");status.textContent=n?n+" peringatan":"APD lengkap";status.classList.toggle("has-alert",n>0);
 });
}
function ppePersonHTML(w){
 const label=ppeWorkerName(w);
 return '<div class="ppe-person'+(w.issue?' bad':'')+'" id="ppe-worker-'+w.id+'" style="left:'+w.x+'%;bottom:'+(w.depth?5:25)+'%;transform:scale('+(w.depth?1.0:.78)+')"><span class="ppe-detection"></span><span class="ppe-id">'+label+'</span><svg viewBox="0 0 40 66" aria-hidden="true"><circle cx="20" cy="13" r="9" fill="#d7a67b"/><path d="M10 12 Q20 -4 30 12Z" fill="'+(w.issue==="Helm"?"#a16c52":"#ffbd19")+'"/><path d="M11 24 L29 24 L33 46 L8 46Z" fill="'+(w.issue==="Rompi"?"#4b7a9d":"#eab523")+'"/><path d="M15 46 L13 63 M26 46 L29 63" stroke="#33404b" stroke-width="6"/><path d="M10 29 L4 43 M30 29 L36 43" stroke="#c78d63" stroke-width="5"/></svg><span class="ppe-shadow"></span>'+(w.issue?'<span class="ppe-issue">Tanpa '+w.issue+'</span>':'')+'</div>';
}
function ppeBuild(){
 ppeGrid.innerHTML=ppeZones.map((name,z)=>'<article class="ppe-cam" data-ppe-zone="'+z+'"><div class="ppe-cam-top"><b>CAM-'+String(z+1).padStart(2,"0")+' · '+ppeZoneName(z)+'</b><span>● DATA VIRTUAL</span></div><div class="ppe-viewport"><div class="ppe-structure"></div><div class="ppe-work-ground"></div>'+ppeWorkers.filter(w=>w.zone===z).map(ppePersonHTML).join("")+'</div><div class="ppe-cam-foot"><span>'+name+' · '+ppeWorkers.filter(w=>w.zone===z).length+' pekerja</span><strong>APD lengkap</strong></div></article>').join("");
 ppeFilterApply();ppeStats();
}
function ppeFilterApply(){ppeGrid.querySelectorAll(".ppe-cam").forEach(el=>{el.style.display=ppeFilter.value==="all"||el.dataset.ppeZone===ppeFilter.value?"":"none";});}
function ppeMove(){
 ppeCycle++;
 ppeWorkers.forEach(w=>{
  w.x+=w.dir*w.speed;
  if(w.x>91){w.x=91;w.dir=-1;}else if(w.x<3){w.x=3;w.dir=1;}
  const el=document.getElementById("ppe-worker-"+w.id);
  if(el){el.style.left=w.x+"%";el.style.transform="scale("+(w.depth?1:.78)+") translateY("+Math.abs(Math.sin(ppeCycle*.85+w.phase))*-2+"px)";el.querySelector("svg").style.transform="scaleX("+w.dir+")";}
 });
 if(ppeCycle%55===0){ppeRebalance();ppeBuild();}
 if(ppeCycle%10===0){
  const w=ppeWorkers[ppeInt(0,ppeWorkers.length-1)];
  w.issue=w.issue?null:ppeIssues[ppeInt(0,3)];
  ppeRecord(w);
  const el=document.getElementById("ppe-worker-"+w.id);
  if(el){el.classList.toggle("bad",!!w.issue);const issue=el.querySelector(".ppe-issue");if(issue)issue.remove();if(w.issue)el.insertAdjacentHTML("beforeend",'<span class="ppe-issue">Tanpa '+w.issue+'</span>');}
  ppeStats();
 }
}
function ppeRebalance(){
 for(let z=0;z<ppeZones.length;z++){
  const members=ppeWorkers.filter(w=>w.zone===z),delta=ppeInt(-2,2),target=Math.max(2,Math.min(16,members.length+delta));
  if(target>members.length){for(let n=members.length;n<target;n++){const w=ppeCreateWorker(z,n);ppeWorkers.push(w);ppeRecord(w);}}
  else if(target<members.length){const removed=members.slice(target);const ids=new Set(removed.map(w=>w.id));ppeWorkers=ppeWorkers.filter(w=>!ids.has(w.id));removed.forEach(w=>ppeLastIssues.delete(w.id));}
 }
}
if(ppeGrid&&ppeFilter){
 ppeZones.forEach((name,z)=>ppeFilter.add(new Option(name,String(z))));
 ppeWorkers=ppeZones.flatMap((_,z)=>Array.from({length:ppeInt(3,13)},(_,slot)=>ppeCreateWorker(z,slot)));
 ppeWorkers.forEach(ppeRecord);
 ppeBuild();
 ppeFilter.addEventListener("change",ppeFilterApply);
 document.getElementById("ppeAnimate").addEventListener("change",e=>ppeRunning=e.target.checked);
 document.getElementById("ppeRefresh").addEventListener("click",()=>{
  ppeRebalance(); ppeWorkers.forEach(w=>{if(ppeRandom()<.15){w.issue=ppeRandom()<.55?ppeIssues[ppeInt(0,3)]:null;ppeRecord(w);}});
  ppeBuild();
 });
 setInterval(()=>{if(!ppeRunning||document.hidden)return;ppeMove();},180);
}



/* Manual operational records: local browser storage, no synthetic truck arrivals. */

const manualStoreKey="civilweek-manual-innovation-v1";
let manualRecords={form:[],pour:[]};
try{const saved=JSON.parse(localStorage.getItem(manualStoreKey)||"{}");for(const id of ["form","pour"])if(Array.isArray(saved[id]))manualRecords[id]=saved[id].slice(-60);}catch(e){console.warn("Catatan manual tidak dapat dibaca",e);}
function persistManual(){try{localStorage.setItem(manualStoreKey,JSON.stringify(manualRecords));return true;}catch(e){console.warn(e);return false;}}
function setInnovationOverview(id,value){const el=$("overview-"+id);if(el)el.textContent=value;}
function manualPlot(canvasId,values,limit){
 const canvas=$(canvasId);if(!canvas)return;const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height,p={l:42,r:20,t:20,b:32};ctx.clearRect(0,0,w,h);ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
 const max=Math.max(limit*1.3,...values,1);ctx.strokeStyle="#ece5d7";for(let i=0;i<5;i++){const y=p.t+(h-p.t-p.b)*i/4;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();ctx.fillStyle="#777";ctx.font="12px sans-serif";ctx.fillText((max*(1-i/4)).toFixed(1),3,y+4);}
 if(!values.length){ctx.fillStyle="#777";ctx.fillText("Belum ada catatan manual",w/2-80,h/2);return;}
 ctx.strokeStyle="#d6a02b";ctx.lineWidth=3;ctx.beginPath();values.forEach((v,i)=>{const x=p.l+(w-p.l-p.r)*(values.length===1?.5:i/(values.length-1)),y=p.t+(h-p.t-p.b)*(1-v/max);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
}
function renderFormManual(){
 const rows=manualRecords.form,latest=rows.at(-1);$("live-form").textContent=latest?latest.hours.toFixed(1):"—";$("state-form").textContent=latest?(latest.hours<=24?"Sesuai target":"Melebihi target"):"Belum diinput";$("count-form").textContent=rows.length;
 for(const [id,key] of [["formReady","ready"],["formReuse","reuse"],["formCrew","crew"]])$(id).textContent=latest?latest[key]:"—";
 const log=rows.slice(-8).reverse().map(r=>'<tr><td>'+esc(r.time)+'</td><td>'+esc(r.zone)+'</td><td>'+r.hours.toFixed(1)+' jam</td><td>'+(r.hours<=24?"Sesuai target":"Melebihi target")+'</td></tr>').join("");
 $("history-form").innerHTML=log||'<tr><td colspan="4">Belum ada input manual</td></tr>';
 $("sensorLog-form").innerHTML=rows.slice(-7).reverse().map(r=>'<tr><td>'+esc(r.time)+'</td><td>'+esc(r.zone)+'</td><td>'+r.ready+' modul · '+r.crew+' regu</td><td>'+esc(r.note||"Tercatat")+'</td></tr>').join("")||'<tr><td colspan="4">Belum ada input</td></tr>';
 manualPlot("chart-form",rows.map(r=>r.hours),24);setInnovationOverview("form",latest?latest.hours.toFixed(1)+" jam · "+latest.zone:"Belum ada input");
}
function renderPourManual(){
 const rows=manualRecords.pour,latest=rows.at(-1);
 for(const [id,key] of [["pourCapacity","capacity"],["pourArrivals","arrivals"],["pourQueue","queue"],["pourWait","wait"]])$(id).textContent=latest?latest[key]:"—";
 $("pourDetections").innerHTML=rows.slice(-15).reverse().map(r=>'<tr><td>'+esc(r.time)+'</td><td>Input manual</td><td>'+r.arrivals+' truk</td><td>'+esc(r.zone)+'</td><td>'+r.wait+' menit</td><td>'+r.queue+' antre</td></tr>').join("")||'<tr><td colspan="6">Belum ada input</td></tr>';
 $("pourEvents").innerHTML=rows.slice(-20).reverse().map(r=>'<tr><td>'+esc(r.time)+'</td><td>Catatan pengecoran</td><td>'+esc(r.zone+' · '+(r.note||"Input manual"))+'</td></tr>').join("")||'<tr><td colspan="3">Belum ada input</td></tr>';
 manualPlot("pourOperationsChart",rows.map(r=>r.capacity),60);
 setInnovationOverview("pour",latest?latest.queue+" truk antre · "+latest.capacity+" m³/jam":"Belum ada input");
}
function manualValues(ids){return ids.map(id=>{const n=Number($(id).value);if(!$(id).value.trim()||!Number.isFinite(n)||n<0)throw Error("Lengkapi seluruh angka dengan nilai positif atau nol.");return n;});}
$("formManualInput")?.addEventListener("submit",e=>{
 e.preventDefault();if(isGuest){$("formManualMessage").textContent="Guest hanya dapat melihat, tidak bisa menginput.";return;}
 try{const eventTime=localDateTime("formDateTimeInput");const [hours,ready,reuse,crew]=manualValues(["formHoursInput","formReadyInput","formReuseInput","formCrewInput"]);if([ready,reuse,crew].some(n=>!Number.isInteger(n)))throw Error("Jumlah modul, reuse, dan regu harus bilangan bulat.");
 manualRecords.form.push({time:eventTime.toLocaleString("id-ID"),created_at:eventTime.toISOString(),zone:$("formZone").value,hours,ready,reuse,crew,note:$("formNoteInput").value});manualRecords.form=manualRecords.form.slice(-60);const saved=persistManual();renderFormManual();renderReports();$("formManualInput").reset();defaultManualDateTimes();$("formManualMessage").textContent=saved?"Tersimpan pada browser ini.":"Catatan hanya tersimpan selama sesi (penyimpanan browser tidak tersedia).";}catch(err){$("formManualMessage").textContent=err.message;}
});
$("pourManualInput")?.addEventListener("submit",e=>{
 e.preventDefault();if(isGuest){$("pourManualMessage").textContent="Guest hanya dapat melihat, tidak bisa menginput.";return;}
 try{const eventTime=localDateTime("pourDateTimeInput");const [capacity,arrivals,queue,wait]=manualValues(["pourCapacityInput","pourArrivalsInput","pourQueueInput","pourWaitInput"]);if(!Number.isInteger(arrivals)||!Number.isInteger(queue)||queue>arrivals)throw Error("Jumlah truk harus bulat dan antrean tidak boleh melebihi kedatangan.");
 manualRecords.pour.push({time:eventTime.toLocaleString("id-ID"),created_at:eventTime.toISOString(),capacity,arrivals,queue,wait,zone:$("pourZoneInput").value,note:$("pourNoteInput").value});manualRecords.pour=manualRecords.pour.slice(-60);const saved=persistManual();renderPourManual();renderReports();$("pourManualInput").reset();defaultManualDateTimes();$("pourManualMessage").textContent=saved?"Tersimpan pada browser ini.":"Catatan hanya tersimpan selama sesi (penyimpanan browser tidak tersedia).";}catch(err){$("pourManualMessage").textContent=err.message;}
});
document.querySelectorAll("[data-open-innovation]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.openInnovation)));
defaultManualDateTimes();renderFormManual();renderPourManual();innovationReportsReady=true;renderReports();
setInnovationOverview("cctv","Deteksi APD virtual");
