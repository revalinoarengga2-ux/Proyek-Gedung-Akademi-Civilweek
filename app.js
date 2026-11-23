import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

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
 if(error) console.warn(error); workItems=data||[]; renderWorkOptions(); renderWorkTable();
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
 $("baselineTable").innerHTML=baselineRows.map(r=>`<tr><td>${esc(r.period)}</td><td>${fmtPct(r.planned_cumulative)}</td></tr>`).join("")||'<tr><td colspan="2" class="empty">Baseline periode belum diinput.</td></tr>';
 drawCurves();
}
function renderReports(){
 $("statReports").textContent=reports.length;
 $("statOpen").textContent=reports.filter(r=>!["Selesai","Ditutup"].includes(r.status)).length;
 $("reportsTable").innerHTML=reports.length?reports.map(r=>`<tr><td>${fmtDate(r.created_at)}</td><td>${esc(r.reporter_name)}</td><td>${esc(r.report_type)}</td><td>${esc(r.location)}</td><td><span class="pill ${r.status==="Selesai"?"success":"warn"}">${esc(r.status||"Baru")}</span></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Belum ada laporan.</td></tr>`;
 $("recentList").innerHTML=reports.slice(0,6).map(r=>`<div class="activity"><span class="activity-dot"></span><div><b>${esc(r.report_type)} · ${esc(r.location)}</b><small>${esc(r.reporter_name)} · ${fmtDate(r.created_at)}</small><p>${esc(r.description||"").slice(0,110)}</p></div></div>`).join("")||'<div class="empty">Belum ada laporan.</div>';
 $("lastUpdated").textContent="Diperbarui "+new Date().toLocaleTimeString("id-ID");
}
function latestActual(workId){const rows=progressRows.filter(p=>p.work_item_id===workId);return rows.length?Number(rows[rows.length-1].actual_percent):0;}
function weightedActual(){return workItems.reduce((s,w)=>s+Number(w.weight_percent||0)*latestActual(w.id)/100,0);}
function planValue(){return baselineRows.length?Number(baselineRows[baselineRows.length-1].planned_cumulative):workItems.reduce((s,w)=>s+Number(w.weight_percent||0)*Number(w.planned_percent||0)/100,0);}
function updateStats(){
 const wt=workItems.reduce((s,w)=>s+Number(w.weight_percent||0),0);
 const a=weightedActual(),p=planValue();
 $("statPlan").textContent=fmtPct(p);$("statActual").textContent=fmtPct(a);
 $("weightTotal").textContent=fmtPct(wt);$("curvePlan").textContent=fmtPct(p);$("curveActual").textContent=fmtPct(a);$("curveDeviation").textContent=(a-p>=0?"+":"")+fmtPct(a-p);
}
function renderWorkTable(){
 $("workTable").innerHTML=workItems.map(w=>`<tr><td>${esc(w.name)}</td><td>${fmtPct(w.weight_percent)}</td><td>${fmtPct(w.planned_percent)}</td><td><b>${fmtPct(latestActual(w.id))}</b></td></tr>`).join("")||'<tr><td colspan="4" class="empty">Belum ada daftar pekerjaan.</td></tr>';
 updateStats();
}
function weightedActualAt(period){
 return workItems.reduce((sum,w)=>{
  const rows=progressRows.filter(p=>p.work_item_id===w.id && p.period<=period);
  if(!rows.length)return sum;
  const last=rows[rows.length-1];
  return sum+Number(w.weight_percent||0)*Number(last.actual_percent||0)/100;
 },0);
}
function drawOne(canvasId){
 const c=$(canvasId); if(!c)return; const dpr=window.devicePixelRatio||1, width=c.clientWidth||700, height=Number(c.getAttribute("height"))||260;
 c.width=width*dpr;c.height=height*dpr;const ctx=c.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
 const pad={l:44,r:18,t:18,b:38},cw=width-pad.l-pad.r,ch=height-pad.t-pad.b;
 ctx.font="11px DM Sans";ctx.strokeStyle="#e9e5dc";ctx.fillStyle="#777";
 for(let i=0;i<=5;i++){let y=pad.t+ch*i/5;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.fillText(`${100-i*20}%`,4,y+4);}
 const periods=[...new Set([...baselineRows.map(x=>x.period),...progressRows.map(x=>x.period)])].sort();
 if(!periods.length){ctx.fillStyle="#999";ctx.textAlign="center";ctx.fillText("Input baseline dan realisasi untuk membentuk Kurva S",width/2,height/2);ctx.textAlign="left";return;}
 const planMap=new Map(baselineRows.map(x=>[x.period,Number(x.planned_cumulative)]));
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
$("connectCamera").addEventListener("click",()=>{
 const url=$("cameraUrl").value.trim();if(!url)return alert("Masukkan URL stream kamera terlebih dahulu.");
 $("cameraVideo").src=url;$("cameraVideo").classList.add("visible");$("cameraPlaceholder").classList.add("hidden");
 $("cameraVideo").play().catch(()=>alert("Stream tidak dapat diputar. Pastikan URL HLS/MP4/WebRTC gateway dan izin akses kamera sudah benar."));
});
$("exportBtn").addEventListener("click",()=>{
 const rows=[["Tanggal","Pelapor","Jabatan","Jenis","Lokasi","Prioritas","Status","Uraian"],...reports.map(r=>[r.created_at,r.reporter_name,"",r.report_type,r.location,r.priority,r.status,r.description])];
 const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download="laporan-civilweek.csv";a.click();URL.revokeObjectURL(a.href);
});
renderOrg();
if(!configured){setConnected(false,"Belum dikonfigurasi");$("loginMessage").textContent="Hubungkan Supabase terlebih dahulu (lihat README.md).";$("loginMessage").className="form-message error";}
else{
 setConnected(false,"Menghubungkan…");
 db.auth.getSession().then(async({data})=>{if(data.session)await enterApp(data.session.user);else setConnected(true,"Siap masuk");});
 db.auth.onAuthStateChange((_event,session)=>{if(!session){$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");$("logoutBtn").classList.add("hidden");}});
}
window.addEventListener("resize",()=>{if(!$("page-curve").classList.contains("hidden"))drawCurves();if(!$("page-dashboard").classList.contains("hidden"))drawOne("miniCurve");});
