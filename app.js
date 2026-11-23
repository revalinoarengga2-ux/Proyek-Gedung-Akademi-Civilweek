import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

window.__civilweekBooted=true;
const $ = (id) => document.getElementById(id);
const configured = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
let db = null, currentUser = null, profile = null, members = [], workItems = [], reports = [], progressRows = [], baselineRows = [];
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
function showPage(page){ document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden")); $("page-"+page).classList.remove("hidden"); document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===page)); if(page==="curve") drawCurves(); }
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));

function renderOrg(){
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
 $("progressWork").innerHTML='<option value="">Pilih pekerjaan</option>'+options;
}
async function loadMembers(){
 const {data,error}=await db.from("profiles").select("id,full_name,position,role,organization_group").order("full_name");
 if(error) console.warn(error); members=data||[]; renderMembers();
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
async function loadBaseline(){
 const {data,error}=await db.from("s_curve_baseline").select("*").order("period");
 if(error){console.warn(error);return;} baselineRows=data||[];
 $("baselineTable").innerHTML=activeBaseline().map(r=>`<tr><td>${esc(r.period)}</td><td>${fmtPct(r.planned_cumulative)}</td></tr>`).join("")||'<tr><td colspan="2" class="empty">Baseline periode belum diinput.</td></tr>';
 drawCurves();
}
function renderReports(){
 const allReports=[...virtualK3Reports,...reports].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 $("statReports").textContent=allReports.length;
 $("statOpen").textContent=allReports.filter(r=>!["Selesai","Ditutup"].includes(r.status)).length;
 $("reportsTable").innerHTML=allReports.length?allReports.map(r=>`<tr><td>${fmtDate(r.created_at)}</td><td>${esc(r.reporter_name)}</td><td>${esc(r.report_type)}</td><td>${esc(r.location)}</td><td><span class="pill ${r.status==="Selesai"?"success":"warn"}">${esc(r.status||"Baru")}</span></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Belum ada laporan.</td></tr>`;
 $("recentList").innerHTML=allReports.slice(0,6).map(r=>`<div class="activity"><span class="activity-dot"></span><div><b>${esc(r.report_type)} · ${esc(r.location)}</b><small>${esc(r.reporter_name)} · ${fmtDate(r.created_at)}</small><p>${esc(r.description||"").slice(0,110)}</p></div></div>`).join("")||'<div class="empty">Belum ada laporan.</div>';
 $("lastUpdated").textContent="Diperbarui "+new Date().toLocaleTimeString("id-ID");
}
function latestActual(workId){const rows=progressRows.filter(p=>p.work_item_id===workId).sort((a,b)=>a.period.localeCompare(b.period)||a.created_at.localeCompare(b.created_at));return rows.length?Number(rows[rows.length-1].actual_percent):0;}
function weightedActual(){return workItems.reduce((s,w)=>s+Number(w.weight_percent||0)*latestActual(w.id)/100,0);}
const schedule33=[0.20,2.96,7.14,10.37,12.68,16.14,18.37,20.0,22.0,24.01,27.0,31.72,35.81,39.3,44.7,50.4,55.83,62.3,72.05,74.75,79.11,82.4,86.1,89.8,93.2,96.5,98.1,99.0,99.4,99.7,99.85,99.95,100];
const baselinePeriod33=i=>"2026-CW"+String(i+1).padStart(2,"0");
const activeBaseline=()=>baselineRows.length?baselineRows:schedule33.map((v,i)=>({period:baselinePeriod33(i),planned_cumulative:v}));
function planValue(){const rows=activeBaseline();return Number(rows[rows.length-1]?.planned_cumulative||0);}
function updateStats(){
 const wt=workItems.reduce((s,w)=>s+Number(w.weight_percent||0),0);
 const a=weightedActual(),p=planValue();
 $("statPlan").textContent=fmtPct(p);$("statActual").textContent=fmtPct(a);
 $("weightTotal").textContent=fmtPct(wt)+(Math.abs(wt-100)>0.005?" ⚠ Periksa bobot":"");$("curvePlan").textContent=fmtPct(p);$("curveActual").textContent=fmtPct(a);$("curveDeviation").textContent=(a-p>=0?"+":"")+fmtPct(a-p);
}
function renderWorkTable(){
 $("workTable").innerHTML=workItems.map(w=>`<tr><td>${esc(w.name)}</td><td>${fmtPct(w.weight_percent)}</td><td><b>${fmtPct(latestActual(w.id))}</b></td></tr>`).join("")||'<tr><td colspan="3" class="empty">Belum ada daftar pekerjaan.</td></tr>';
 updateStats();
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
 const periods=[...new Set([...activeBaseline().map(x=>x.period),...progressRows.map(x=>x.period)])].sort();
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
 const actual=periods.map(p=>weightedActualAt(p));
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
async function refreshAll(){await Promise.all([loadMembers(),loadWork(),loadReports(),loadProgress(),loadBaseline()]);updateStats();drawCurves();}
async function uploadPhoto(file){
 if(!file)return null;
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_"),path=`${currentUser.id}/${Date.now()}-${safe}`;
 const {error}=await db.storage.from("report-attachments").upload(path,file,{upsert:false});
 if(error)throw error;return path;
}

$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!configured){msg("loginMessage","Konfigurasi Supabase belum diisi. Ikuti README.md terlebih dahulu.");return;}
 const {data,error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});
 if(error){msg("loginMessage",error.message);return;} await enterApp(data.user);
});
async function enterApp(user){
 currentUser=user;
 const {data,error}=await db.from("profiles").select("*").eq("id",user.id).single();
 if(error){msg("loginMessage","Akun belum memiliki profil personel. Minta administrator melengkapi tabel profiles.");await db.auth.signOut();return;}
 profile=data;$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("logoutBtn").classList.remove("hidden");
 $("userName").textContent=profile.full_name||user.email;$("userRole").textContent=profile.position||profile.role||"Personel";$("userInitial").textContent=(profile.full_name||"U")[0].toUpperCase();
 $("reportDate").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
 await refreshAll();setConnected(true,"Database online");
}
$("logoutBtn").addEventListener("click",async()=>{await db.auth.signOut();location.reload();});
$("refreshBtn").addEventListener("click",refreshAll);

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
$("baselineForm").addEventListener("submit",async e=>{
 e.preventDefault();try{
  const row={period:$("baselinePeriod").value.trim(),planned_cumulative:Number($("baselinePercent").value),created_by:currentUser.id};
  const {error}=await db.from("s_curve_baseline").upsert(row,{onConflict:"period"});if(error)throw error;
  msg("baselineMessage","Titik rencana berhasil disimpan.",true);$("baselineForm").reset();await loadBaseline();
 }catch(err){msg("baselineMessage",err.message);}
});
$("progressForm").addEventListener("submit",async e=>{
 e.preventDefault();try{
  const row={work_item_id:$("progressWork").value,period:$("progressPeriod").value,actual_percent:Number($("progressPercent").value),note:$("progressNote").value,entered_by:currentUser.id};
  const {error}=await db.from("work_progress").insert(row);if(error)throw error;
  msg("progressMessage","Realisasi berhasil disimpan.",true);$("progressForm").reset();await loadProgress();
 }catch(err){msg("progressMessage",err.message);}
});
$("addWorkBtn").addEventListener("click",async()=>{
 const name=prompt("Nama pekerjaan baru:");if(!name)return;
 const weight=Number(prompt("Bobot pekerjaan (%)","0"));if(!Number.isFinite(weight)||weight<0||weight>100){alert("Bobot tidak valid.");return;}
 const {error}=await db.from("work_items").insert({name,category:"Pekerjaan tambahan",weight_percent:weight,planned_percent:0,sort_order:workItems.length+1});
 if(error)alert(error.message);else await loadWork();
});

$("exportBtn").addEventListener("click",()=>{
 const rows=[["Tanggal","Pelapor","Jabatan","Jenis","Lokasi","Prioritas","Status","Uraian"],...reports.map(r=>[r.created_at,r.reporter_name,"",r.report_type,r.location,r.priority,r.status,r.description])];
 const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download="laporan-civilweek.csv";a.click();URL.revokeObjectURL(a.href);
});
renderOrg();
if(!configured){setConnected(false,"Belum dikonfigurasi");$("loginMessage").textContent="Hubungkan Supabase terlebih dahulu (lihat README.md).";$("loginMessage").className="form-message error";}
else{
 setConnected(false,"Menghubungkan…");
 db.auth.getSession().then(async({data,error})=>{if(error)throw error;if(data.session)await enterApp(data.session.user);else setConnected(true,"Siap masuk");}).catch(err=>{console.error("Supabase session:",err);setConnected(false,"Koneksi gagal: "+(err.message||"periksa jaringan"));});
 db.auth.onAuthStateChange((_event,session)=>{if(!session){$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");$("logoutBtn").classList.add("hidden");}});
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


const monitorConfigs=[{"id":"mag","unit":"mm","metric":"Deviasi jarak sengkang","base":3.1,"limit":5},{"id":"form","unit":"jam","metric":"Durasi siklus zona","base":21.4,"limit":24},{"id":"excavate","unit":"mm","metric":"Deformasi dinding","base":7.2,"limit":10}];
const monitorSamples={};let sampleTick=0;
function addMonitorSample(config){
 const id=config.id;const rows=monitorSamples[id]||[];
 const index=rows.length;
 const value=+(config.base+Math.sin(index*1.37+config.base)*config.base*.21+Math.cos(index*.47)*config.base*.07).toFixed(1);
 rows.push({time:new Date(),value});if(rows.length>24)rows.shift();monitorSamples[id]=rows;
 renderMonitor(config);
}
function renderMonitor(config){
 const rows=monitorSamples[config.id]||[],latest=rows.at(-1);if(!latest)return;
 const pass=latest.value<=config.limit;
 $("live-"+config.id).textContent=latest.value.toLocaleString("id-ID");
 $("state-"+config.id).textContent=pass?"Normal":"Waspada";
 $("state-"+config.id).style.color=pass?"#247d4c":"#b45309";
 $("count-"+config.id).textContent=rows.length;
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
setInterval(()=>{if(document.hidden)return;monitorConfigs.forEach(config=>addMonitorSample(config));},8000);



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
const virtualK3Reports=JSON.parse(sessionStorage.getItem("civilweek-k3-events")||"[]");
function addVirtualK3Report(w){
 const now=new Date(),row={id:"k3-"+now.getTime()+"-"+w.id,created_at:now.toISOString(),reporter_name:"Smart PPE (data virtual)",report_type:"Inspeksi K3",location:"Zona "+String.fromCharCode(65+w.zone),status:"Perlu pemeriksaan",description:"Pekerja "+ppeWorkerName(w)+": "+w.issue+" tidak terdeteksi. Temuan virtual, bukan insiden lapangan.",priority:"Tinggi"};
 virtualK3Reports.unshift(row);if(virtualK3Reports.length>80)virtualK3Reports.length=80;
 sessionStorage.setItem("civilweek-k3-events",JSON.stringify(virtualK3Reports));
 renderReports();
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
 const active=ppeWorkers.filter(w=>w.issue);
 document.getElementById("ppeAlertLog").innerHTML=active.length?active.map(w=>'<tr><td>'+ppeTime()+'</td><td>'+ppeZoneName(w.zone)+'</td><td>'+ppeWorkerName(w)+'</td><td>'+w.issue+' tidak terdeteksi</td><td><span class="pill warn">Perlu pemeriksaan</span></td></tr>').join(""):'<tr><td colspan="5">Tidak ada kejadian aktif</td></tr>';
 document.getElementById("cctvEvents").innerHTML=ppeEvents.length?ppeEvents.slice(0,35).map(e=>'<tr><td>'+e.time+'</td><td>CAM-'+String(e.zone+1).padStart(2,"0")+' / '+ppeZoneName(e.zone)+'</td><td>'+e.worker+' · '+e.issue+' tidak terdeteksi</td><td>'+e.confidence+'</td><td>'+e.status+'</td></tr>').join(""):'<tr><td colspan="5">Belum ada kejadian</td></tr>';
}
function ppeStats(){
 const active=ppeWorkers.filter(w=>w.issue);
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


/* Smart Pour Scheduling: stochastic, synthetic truck arrivals and pump utilization. */
const pourState={clock:0,capacity:35,queue:[],active:null,arrivals:0,completed:[],events:[],history:[],nextTruck:1};
const pourRand=(a,b)=>a+Math.random()*(b-a);
function pourLog(event,detail){
 pourState.events.unshift({time:new Date().toLocaleTimeString("id-ID"),event,detail});
 pourState.events= pourState.events.slice(0,100);
}
function pourArrive(){
 const truck={id:"TM-"+String(pourState.nextTruck++).padStart(3,"0"),arrival:pourState.clock,volume:+pourRand(5,9).toFixed(1),remaining:0,status:"Antre"};
 truck.remaining=truck.volume;
 pourState.queue.push(truck);pourState.arrivals++;
 pourLog("Truk terdeteksi",truck.id+" masuk area antre, muatan "+truck.volume+" m³");
}
function pourAdvance(){
 pourState.clock+=1;
 // Pump performance varies by operating conditions; one tick = 1 virtual minute.
 pourState.capacity=Math.max(18,Math.min(65,pourState.capacity+pourRand(-8,8)));
 if(Math.random()<.30)pourArrive();
 if(!pourState.active&&pourState.queue.length){
  pourState.active=pourState.queue.shift();pourState.active.wait=pourState.clock-pourState.active.arrival;
  pourState.active.status="Dipompa";pourLog("Mulai pengecoran",pourState.active.id+" menunggu "+pourState.active.wait+" menit");
 }
 if(pourState.active){
  pourState.active.remaining-=pourState.capacity/60;
  if(pourState.active.remaining<=0){
   const truck=pourState.active;truck.status="Selesai";pourState.completed.unshift(truck);
   pourLog("Truk selesai",truck.id+" selesai dipompa");pourState.active=null;
  }
 }
 const waits=pourState.queue.map(t=>pourState.clock-t.arrival);
 const avg=waits.length?waits.reduce((a,b)=>a+b,0)/waits.length:0;
 pourState.history.push({capacity:pourState.capacity,wait:avg,queue:pourState.queue.length});
 if(pourState.history.length>35)pourState.history.shift();
 pourRender();
}
function pourRender(){
 const s=pourState;
 document.getElementById("pourCapacity").textContent=s.capacity.toFixed(1);
 document.getElementById("pourArrivals").textContent=s.arrivals;
 document.getElementById("pourQueue").textContent=s.queue.length;
 const waits=s.queue.map(t=>s.clock-t.arrival);
 document.getElementById("pourWait").textContent=(waits.length?waits.reduce((a,b)=>a+b,0)/waits.length:0).toFixed(1);
 const visible=[...(s.active?[s.active]:[]),...s.queue].slice(0,9);
 document.getElementById("pourTruckScene").innerHTML=visible.map((t,i)=>'<div class="pour-truck" style="left:'+(9+i*10)+'%;top:'+(i%2?54:20)+'%"><span>🚚</span><small>'+t.id+'</small></div>').join("");
 const det=[...(s.active?[s.active]:[]),...s.queue,...s.completed].slice(0,20);
 document.getElementById("pourDetections").innerHTML=det.map(t=>'<tr><td>'+new Date().toLocaleTimeString("id-ID")+'</td><td>CAM-POUR</td><td>'+t.id+'</td><td>Truk mixer</td><td>'+(t.wait??(s.clock-t.arrival))+' menit</td><td>'+t.status+'</td></tr>').join("")||'<tr><td colspan="6">Menunggu kendaraan</td></tr>';
 document.getElementById("pourEvents").innerHTML=s.events.slice(0,25).map(e=>'<tr><td>'+e.time+'</td><td>'+e.event+'</td><td>'+e.detail+'</td></tr>').join("");
 const canvas=document.getElementById("pourOperationsChart"),ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height,p={l:40,r:40,t:20,b:35},hist=s.history;
 ctx.clearRect(0,0,w,h);ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
 const maxWait=Math.max(10,...hist.map(d=>d.wait))*1.25;
 const plot=(key,max,color)=>{ctx.beginPath();hist.forEach((d,i)=>{const x=p.l+(w-p.l-p.r)*(hist.length<2?.5:i/(hist.length-1)),y=p.t+(h-p.t-p.b)*(1-d[key]/max);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();};
 for(let i=0;i<5;i++){const y=p.t+(h-p.t-p.b)*i/4;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.strokeStyle="#e6e6e6";ctx.lineWidth=1;ctx.stroke();}
 if(hist.length){plot("capacity",70,"#d99500");plot("wait",maxWait,"#bf5252");}
 ctx.font="12px sans-serif";ctx.fillStyle="#d99500";ctx.fillText("Kapasitas (m³/jam)",p.l,13);ctx.fillStyle="#bf5252";ctx.fillText("Antrean (menit)",w-145,13);
}
if(document.getElementById("pourOperationsChart")){
 const count=8+Math.floor(Math.random()*12);
 for(let i=0;i<count;i++)pourAdvance();
 document.getElementById("pourStep").addEventListener("click",()=>{for(let i=0;i<1+Math.floor(Math.random()*4);i++)pourAdvance();});
 setInterval(()=>{if(document.hidden||!document.getElementById("pourAuto").checked)return;pourAdvance();},4000);
}
