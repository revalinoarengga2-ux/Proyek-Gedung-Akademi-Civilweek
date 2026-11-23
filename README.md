# Innovation & K3 Control

Dashboard statis untuk pemantauan empat inovasi konstruksi dan K3:
- MAG-CAGE
- Rapid Cycle Formwork
- Safe Excavate
- Smart Pour Scheduling
- Monitoring K3 umum
- Pelaporan manual temuan / near miss / insiden

## Fitur
- Form inspeksi terpisah untuk setiap inovasi dan K3.
- Dashboard ringkasan, aktivitas terbaru, dan cakupan inspeksi.
- Pelaporan manual untuk kondisi tidak aman, tindakan tidak aman, near miss, insiden, kerusakan alat, dan kendala metode.
- Rekap seluruh laporan dan ekspor CSV.
- Penyimpanan lokal pada browser (`localStorage`).

## Upload ke GitHub Pages
Upload `index.html`, `.nojekyll`, dan `README.md` ke root repository. Buka Settings → Pages, pilih Deploy from a branch, branch `main`, folder `/ (root)`, lalu Save.

## Catatan penting
Data hanya tersimpan pada browser/perangkat yang digunakan dan tidak tersinkron otomatis antar pengguna/perangkat. Lampiran foto/dokumen pada form saat ini dicatat sebagai nama file/referensi, belum diunggah ke server. Untuk penggunaan operasional bersama, hubungkan dashboard ke database/backend dan atur hak akses. Nilai teknis harus mengacu pada gambar kerja, spesifikasi, dan prosedur proyek.
