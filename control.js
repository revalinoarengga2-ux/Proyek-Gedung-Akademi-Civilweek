
(()=>{'use strict';
const $=id=>document.getElementById(id),types=['finance','risk','quality','decision'],prefix='civilweek-control-v1-';
const read=t=>{try{let a=JSON.parse(localStorage.getItem(prefix+t)||'[]');return Array.isArray(a)?a:[]}catch{return []}};
let data=Object.fromEntries(types.map(t=>[t,read(t)]));
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const guest=()=>$('guestBanner')&&!$('guestBanner').classList.contains('hidden');
const sum=type=>data.finance.filter(r=>r.type===type).reduce((a,r)=>a+Number(r.amount||0),0);
const has=type=>data.finance.some(r=>r.type===type);
const rabItems=[["Persiapan dan umum",877901539.9267293],["Penerapan SMKK / RK3K",72674022],["Struktur gedung",37865504442.99578],["Arsitektur gedung",20681025735.79622],["Jalan utama",179444596.1852774],["Hardstanding",115712730.4548716],["Saluran",106323950.21249798],["Pagar",121314553.8563314],["Sumur resapan",152112722.47414184],["Gardu PLN",120960063.40651713],["Lansekap",253748219.06578073]];
const rabTotal=67206860000;
const rabPreTax=60546722576.374146;
function populateOrg(){
 const people=window.civilweekOrganization||[];
 const options=[...new Map(people.filter(row=>row[2]!=='worker').map(row=>[row[1],row[0]])).entries()];
 for(const select of document.querySelectorAll('.control-org-select')){
  const previous=select.value;
  select.innerHTML='<option value="">Pilih PIC dari organisasi</option>'+options.map(([name,position])=>'<option value="'+safe(name)+'">'+safe(name)+' — '+safe(position)+'</option>').join('')+'<option value="Pekerja">Pekerja</option>';
  if([...select.options].some(o=>o.value===previous))select.value=previous;
 }
}
populateOrg();
function render(){
 for(const t of types){
  const tbody=$('control-'+t+'-rows');if(!tbody)continue;
  const keys=t==='finance'?['date','item','category','type','amount','note']:t==='risk'?['date','risk','score','owner','mitigation','status']:t==='quality'?['date','work','result','finding','owner','status']:['date','subject','request','owner','due','status'];
  tbody.innerHTML=data[t].map(r=>'<tr>'+keys.map(k=>'<td>'+safe(k==='amount'?money(Number(r.amount)):k==='score'?Number(r.likelihood)*Number(r.impact):r[k])+'</td>').join('')+'</tr>').join('')||'<tr><td colspan="6">Belum ada data yang dicatat.</td></tr>';
 }
 $('financeBudget').textContent=money(rabTotal);
 $('financeActual').textContent=has('Realisasi biaya')?money(sum('Realisasi biaya')):'Belum tersedia';
 $('financeBalance').textContent=has('Realisasi biaya')?money(rabTotal-sum('Realisasi biaya')):'Belum tersedia';
 const active=data.risk.filter(r=>r.status!=='Ditutup'),issues=data.quality.filter(r=>r.result==='Tidak sesuai'&&r.status!=='Ditutup'),decisions=data.decision.filter(r=>!['Diputuskan','Ditutup'].includes(r.status));
 $('riskCount').textContent=active.length;$('riskHigh').textContent=active.filter(r=>Number(r.likelihood)*Number(r.impact)>=15).length;
 $('qualityOpen').textContent=issues.length;$('decisionOpen').textContent=decisions.length;
}
for(const t of types){
 const form=$('control-'+t+'-form');if(!form)continue;
 const date=form.querySelector('[name="date"]');
 if(date)date.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
 form.addEventListener('submit',e=>{
  e.preventDefault();if(guest()){alert('Mode tamu tidak dapat menginput.');return;}
  if(!form.reportValidity())return;
  const r=Object.fromEntries(new FormData(form));
  if(t==='finance'){r.amount=Number(r.amount);if(!Number.isFinite(r.amount)||r.amount<0){alert('Nominal tidak valid.');return;}}
  if(t==='finance'&&!String(r.item||'').trim()){alert('Isi uraian pekerjaan.');return;}r.created_at=new Date().toISOString();
  data[t].push(r);
  try{localStorage.setItem(prefix+t,JSON.stringify(data[t]));}catch(err){data[t].pop();alert('Gagal menyimpan: '+err.message);return;}
  form.reset();if(date)date.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);render();
 });
}
$('generateExecutivePdf')?.addEventListener('click',()=>{
 const week=$('execWeek').value,risks=data.risk.filter(r=>r.status!=='Ditutup'),quality=data.quality.filter(r=>r.result==='Tidak sesuai'&&r.status!=='Ditutup'),decisions=data.decision.filter(r=>!['Diputuskan','Ditutup'].includes(r.status));
 const heading=(s)=>'<h2>'+safe(s)+'</h2>';
 const body='<h1>CIVILWEEK · LAPORAN EKSEKUTIF MINGGUAN</h1><p>Minggu '+safe(week)+' dari 33 · Dicetak '+safe(new Date().toLocaleString('id-ID'))+'</p><p class="warning">Laporan bersumber dari data lokal browser, belum termasuk data Supabase. Angka belum diverifikasi oleh tim proyek. Jangan gunakan sebagai dokumen pengesahan sebelum ditinjau.</p>'+
 heading('1. Keuangan')+'<p>Anggaran tercatat: <b>'+money(rabTotal)+'</b><br>Realisasi biaya tercatat: <b>'+(has('Realisasi biaya')?money(sum('Realisasi biaya')):'Belum tersedia')+'</b><br>Selisih: <b>'+(has('Realisasi biaya')?money(rabTotal-sum('Realisasi biaya')):'Belum tersedia')+'</b></p><p>Catatan: penjumlahan input manual, bukan nilai kontrak resmi.</p>'+
 heading('2. Risiko dan Mutu')+'<p>Risiko aktif: '+risks.length+' · Risiko tinggi (skor ≥15): '+risks.filter(r=>Number(r.likelihood)*Number(r.impact)>=15).length+' · Temuan mutu belum ditutup: '+quality.length+'</p>'+
 heading('3. Last Planner & Look Ahead')+(()=>{
 const lps=JSON.parse(localStorage.getItem('civilweek-lps-weekly-v1')||'[]'),constraints=JSON.parse(localStorage.getItem('civilweek-constraints-v1')||'[]');
 const current=lps.filter(r=>String(r.week)===String(week)),assessed=current.filter(r=>r.status!=='Rencana'),done=assessed.filter(r=>r.status==='Selesai').length;
 const lookahead=constraints.filter(r=>Number(r.week)>=Number(week)&&Number(r.week)<=Number(week)+6&&r.status!=='Selesai');
 return '<p>Komitmen minggu '+safe(week)+': '+current.length+' · PPC: '+(assessed.length?Math.round(done/assessed.length*100)+'%':'Belum tersedia')+' · Hambatan Look Ahead aktif: '+lookahead.length+'</p>'+
 '<table><tr><th>Pekerjaan</th><th>PIC</th><th>Status</th><th>Kendala</th></tr>'+current.map(r=>'<tr><td>'+safe(r.task)+'</td><td>'+safe(r.owner)+'</td><td>'+safe(r.status)+'</td><td>'+safe(r.constraint||'—')+'</td></tr>').join('')+'</table>'+
 '<h3>Hambatan Look Ahead (hingga 6 minggu ke depan)</h3><table><tr><th>Minggu</th><th>Hambatan</th><th>PIC</th><th>Target</th></tr>'+lookahead.map(r=>'<tr><td>'+safe(r.week)+'</td><td>'+safe(r.description||r.task||'—')+'</td><td>'+safe(r.owner)+'</td><td>'+safe(r.deadline||'—')+'</td></tr>').join('')+'</table>';
})()+heading('4. Keputusan yang Dibutuhkan Owner')+'<p>Keputusan tertunda: '+decisions.length+'</p><table><tr><th>Topik</th><th>Permintaan</th><th>PIC</th><th>Tenggat</th></tr>'+decisions.map(r=>'<tr><td>'+safe(r.subject)+'</td><td>'+safe(r.request)+'</td><td>'+safe(r.owner)+'</td><td>'+safe(r.due)+'</td></tr>').join('')+'</table>'+
 heading('5. Kesimpulan Manajer Proyek')+'<p>'+safe($('execSummary').value.trim()||'Belum diisi.')+'</p>'+heading('6. Tindak Lanjut')+'<p>'+safe($('execActions').value.trim()||'Belum diisi.')+'</p><small>Perlu verifikasi dan persetujuan pejabat proyek sebelum didistribusikan.</small>';
 const win=window.open('','_blank');if(!win){alert('Izinkan pop-up untuk membuka laporan.');return;}
 win.document.open();win.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Eksekutif Civilweek</title><style>body{font:14px Arial,sans-serif;color:#29313c;line-height:1.6;margin:30px}h1{font-size:23px;border-bottom:3px solid #d5a128;padding-bottom:10px}h2{font-size:17px;margin-top:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}.warning{padding:12px;background:#fff3d9;border-left:4px solid #d5a128}@page{size:A4;margin:17mm}</style></head><body>'+body+'</body></html>');win.document.close();win.focus();setTimeout(()=>win.print(),450);
});
render();
})();