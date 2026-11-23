# Civilweek Project Monitoring — GitHub + Supabase

Website monitoring proyek berbasis mobile dengan database online terpusat. Tampilan dibuat mengikuti referensi Civilweek (putih, emas, abu-abu) dan memuat:
- Login akun proyek (Supabase Auth)
- Input laporan lapangan dari HP
- Penyimpanan laporan dan foto ke database/storage Supabase
- Dashboard ringkasan dan tabel laporan
- Kurva S rencana vs realisasi serta input realisasi per pekerjaan
- Daftar pekerjaan awal berdasarkan gambar Kurva S yang diberikan
- Dropdown personel/jabatan dari tabel `profiles`
- Panel CCTV dan log Smart PPE yang siap dihubungkan ke sistem video analytics

## Penting sebelum digunakan
File ini adalah **starter project siap dikembangkan/deploy**, bukan sistem yang sudah tersambung ke akun database atau kamera milik proyek. Agar semua perangkat berbagi data, administrator proyek harus membuat project Supabase dan mengisi kredensialnya. Tidak ada kredensial database atau akses CCTV yang diberikan dalam permintaan.

## 1. Buat database Supabase
1. Buka https://supabase.com/ lalu buat project baru.
2. Masuk ke **SQL Editor**.
3. Buka file `supabase/schema.sql`, salin seluruh isinya, lalu jalankan.
4. Buka **Project Settings → API**. Salin Project URL dan anon/publishable key.
5. Edit `src/config.js`:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = anon/publishable key
6. Jangan pernah menggunakan `service_role` key di website/browser atau menyimpannya di repository GitHub publik.

## 2. Buat akun personel
1. Buka Supabase → Authentication → Users → Add user.
2. Buat email dan password untuk masing-masing personel (pekerja, mandor, pelaksana, pengawas, manajer).
3. Salin UUID user tersebut.
4. Di SQL Editor jalankan contoh berikut, sesuaikan data orangnya:

```sql
insert into public.profiles(id,full_name,position,role,organization_group)
values
('UUID_USER','Nama Pekerja','Pekerja','worker','Lapangan'),
('UUID_USER_LAIN','Nama Pengawas','Supervisor','supervisor','Pengawasan');
```

Role yang tersedia:
- `admin`: administrator sistem
- `manager`: manajer proyek / pengelola baseline dan pekerjaan
- `supervisor`: pengawas / verifikasi laporan dan input progres
- `staff`: staf proyek
- `worker`: pekerja lapangan

Nama dan jabatan dropdown berasal dari `profiles`. Daftar nama pada struktur organisasi di UI adalah referensi visual; akun aktual harus dimasukkan ke tabel `profiles` agar bisa login dan dipilih di form.

## 3. Isi baseline Kurva S
Daftar pekerjaan dan bobot awal di-seed dari gambar. Nilai rencana per periode belum diisi otomatis karena gambar yang diterima tidak memberikan tabel data mingguan yang bisa diimpor dengan presisi penuh. Isi titik baseline kumulatif pada tab Kurva S melalui form **Input Baseline Kurva S** (periode ISO seperti `2026-W48` dan rencana kumulatif proyek 0–100%). Untuk menetapkan rencana penyelesaian per pekerjaan, isi `planned_percent` berdasarkan baseline resmi:

```sql
update public.work_items
set planned_percent = 25
where name = 'Pekerjaan Pondasi Dalam';
```

`planned_percent` merupakan persentase rencana penyelesaian pekerjaan tersebut (0–100), bukan bobot. Nilai rencana kumulatif proyek dihitung dengan `bobot × planned_percent`. Untuk kurva mingguan/bulanan yang akurat, perlu ditambahkan baseline per periode dari workbook sumber.

## 4. Deploy ke GitHub Pages
1. Buat repository baru di GitHub.
2. Upload seluruh isi folder ini (jangan hanya file ZIP).
3. Buka Settings → Pages.
4. Pada Build and deployment pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/ (root)`, lalu Save.
6. Buka URL GitHub Pages yang diberikan GitHub.

Website menggunakan CDN untuk Supabase JS sehingga tidak memerlukan proses build.

## 5. CCTV & Smart PPE
Halaman CCTV menyediakan input URL stream browser-compatible (HLS/MP4/WebRTC gateway) dan tabel event. RTSP biasanya tidak bisa diputar langsung oleh browser. Alur produksi yang disarankan:
1. CCTV/NVR → gateway aman (mis. MediaMTX / layanan WebRTC/HLS).
2. Gateway → server AI video analytics (deteksi helm, rompi, zona terlarang, crossing line, dan tracking pergerakan).
3. Server AI mengirim event ke tabel `cctv_events` melalui backend/server function yang menyimpan secret dengan aman.
4. Dashboard membaca event dari Supabase.

**Jangan** menaruh password CCTV/NVR atau service-role key di JavaScript frontend. Deteksi AI belum aktif sampai kamera, gateway, model AI, dan server event diintegrasikan.

## 6. Catatan keamanan & operasional
- Aktifkan MFA untuk akun administrator/pengelola bila tersedia.
- Gunakan HTTPS pada kamera dan batasi akses berdasarkan jaringan/akun.
- Kebijakan RLS pada `schema.sql` membatasi penulisan berdasarkan akun/role. Tinjau ulang kebijakan sebelum digunakan untuk data proyek sungguhan.
- Foto tersimpan pada bucket privat `report-attachments`.
- Sebelum operasional, uji dengan akun per role dan lakukan backup database.
- Kurva S yang tampil pada starter ini merupakan ringkasan berbobot dari nilai rencana dan realisasi terakhir; bukan replika penuh kurva mingguan pada gambar. Lengkapi baseline periode untuk grafik resmi proyek.

## Struktur folder
```
civilweek-monitoring-github/
├── index.html
├── README.md
├── src/
│   ├── app.js
│   ├── config.js
│   └── style.css
└── supabase/
    └── schema.sql
```
