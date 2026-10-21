# CHANGELOG.md: Catatan Setiap Update

Aturan: entri terbaru ditulis di **paling atas** (di bawah garis pemisah ini). Jangan menghapus entri lama. AI wajib menambah entri setiap selesai melakukan perubahan.

## Format Entri
```
## [versi] - YYYY-MM-DD HH:MM (WIB)
- Penanggung jawab: <peran AI atau nama pengguna>
- Tahap: <Tahap PRD yang dikerjakan, atau "dokumen">
- Ringkasan: <1 kalimat>
- Perubahan:
  - <apa yang ditambah/diubah/dihapus>
- File terdampak: <daftar file>
- Pengujian: <apa yang dicek dan hasilnya, atau "belum diuji">
- Catatan: <opsional: masalah, keputusan, langkah berikutnya>
```

---

## [0.5.3] - 2026-10-21 10:26 (WIB)
- Penanggung jawab: Pengembang Web (Frontend) dan Penanggung Jawab Teknis, atas perintah pemilik proyek
- Tahap: dokumen (finalisasi repo)
- Ringkasan: Menambah `README.md` berbahasa Indonesia untuk publikasi repo; `LICENSE` (MIT) ikut masuk repo untuk pertama kalinya.
- Perubahan:
  - Menambah `README.md`: header dengan badge shields.io, ringkasan, fitur sesuai kode, cara menjalankan lewat server lokal, cara menjalankan tes, cara pakai singkat, rumus dari `js/lora.js`, struktur proyek, batasan, atribusi OSM dan Leaflet, lisensi MIT
  - `LICENSE` (MIT, Copyright 2026 Muhammad Rafi Nagata Afendi) berhenti berupa file lokal dan di-commit ke repo tanpa perubahan isi
- File terdampak: README.md, LICENSE (baru terlacak)
- Pengujian: tidak berlaku (dokumen). Isi README diverifikasi manual terhadap kode: `index.html`, `css/style.css`, `js/*.js`, `tests/lora.test.js`.
- Catatan: `docs/screenshot.png` tidak ada, jadi README tidak merujuk gambar. Belum di-commit; menunggu persetujuan pesan commit.

## [0.5.2] - 2026-10-21 10:04 (WIB)
- Penanggung jawab: Pengembang Web (Frontend) dan Penanggung Jawab Teknis, atas perintah pemilik proyek
- Tahap: perbaikan (di luar 5 tahap, permintaan pengguna)
- Ringkasan: Tile OSM ditolak 403 dari `file://` karena tanpa header Referer; aplikasi kini dinyatakan berjalan lewat server lokal dan tile gagal menampilkan pesan.
- Perubahan:
  - Mengubah `js/mapview.js`: handler `tileerror` pada tile layer, satu pesan singkat di halaman "Peta gagal dimuat. Jalankan aplikasi lewat server lokal (http://localhost), bukan file://, dan periksa internet."
  - Mengubah `css/style.css`: gaya `.pesan-tile`
  - Mengubah `PRD.md` bagian 2 dan 10: aplikasi dijalankan lewat server lokal (Live Server atau `python -m http.server`), bukan klik dua kali, karena tile OpenStreetMap butuh header Referer
  - Mengubah `ARSITEKTUR.md` bagian 7: keputusan teknis server lokal, sama alasannya
- File terdampak: js/mapview.js, css/style.css, PRD.md, ARSITEKTUR.md
- Pengujian: `node --test tests/` dijalankan, hasil dicatat di bawah. Logika perhitungan tidak disentuh.
- Catatan: Perubahan `PRD.md` dan `ARSITEKTUR.md` atas persetujuan eksplisit pemilik proyek. Belum di-commit; menunggu uji browser.

## [0.5.1] - 2026-10-21 09:52 (WIB)
- Penanggung jawab: Pemilik proyek (pengguna), dieksekusi oleh Pengembang Web (Frontend) dan Penanggung Jawab Teknis
- Tahap: dokumen (chore)
- Ringkasan: Keempat dokumen internal (PRD.md, Tujuan.md, ARSITEKTUR.md, Agents.md) dihentikan pelacakannya; Changelog.md tetap terlacak dan ikut dipush.
- Perubahan:
  - Menambah ke `.gitignore`: `/PRD.md`, `/Tujuan.md`, `/ARSITEKTUR.md`, `/Agents.md`
  - Menjalankan `git rm --cached` untuk keempat file (file tetap ada di disk, tidak dihapus)
- File terdampak: .gitignore, Changelog.md; PRD.md, Tujuan.md, ARSITEKTUR.md, Agents.md berhenti terlacak
- Pengujian: tidak berlaku
- Catatan: Keempat file tetap dibaca AI di awal setiap sesi sesuai bagian 2 `Agents.md`. Riwayat commit lama yang memuat keempat file tetap ada di GitHub.

## [0.5.0] - 2026-10-21 09:45 (WIB)
- Penanggung jawab: Pengembang Web (Frontend) dan Penanggung Jawab Teknis
- Tahap: Tahap 5 (SF rekomendasi dan penyempurnaan)
- Ringkasan: Kolom SF rekomendasi terisi di tabel dan CSV, opsi SF otomatis per node aktif, pesan kesalahan parameter tampil di panel.
- Perubahan:
  - Mengubah `js/lora.js`: `analyze` menghormati `global.sfOtomatis` — tiap node dihitung dengan SF rekomendasinya, fallback SF12 jika "Tidak ada"; `recommendSf` memakai helper `withSf`
  - Mengubah `js/panels.js`: kolom SF rekomendasi terisi (`sfRecommend`), checkbox `chk-sf-auto`, `renderPesan` untuk parameter tidak valid, CSV ikut membawa SF rekomendasi
  - Mengubah `index.html`: checkbox "SF otomatis", elemen `pesan-error`
  - Mengubah `css/style.css`: gaya `.cek` dan `.pesan`
- File terdampak: js/lora.js, js/panels.js, index.html, css/style.css
- Pengujian: `node --check` lulus; `node --test tests/*` → 11/11 lulus (angka uji tidak diubah); pemeriksaan Node khusus sfOtomatis → 4/4 lolos (mati pakai SF12, aktif pakai SF7, fallback SF12 saat "Tidak ada", sfRecommend tetap dihitung).
- Catatan: Semua 5 tahap PRD selesai. Pemeriksaan sfOtomatis memakai skrip sementara di Temp, bukan berkas tes proyek. Langkah berikutnya: commit Tahap 5, lalu uji manual di browser oleh pemilik proyek.

## [0.4.0] - 2026-10-21 09:37 (WIB)
- Penanggung jawab: Pengembang Web (Frontend) dan Penanggung Jawab Teknis
- Tahap: Tahap 4 (impor dan ekspor)
- Ringkasan: Ekspor/impor berkas JSON dengan validasi struktur dan ekspor tabel hasil ke CSV.
- Perubahan:
  - Mengubah `js/store.js`: menambah `exportJson()` (string JSON state) dan `importJson(text)` dengan `validasiImpor` (struktur, tipe, angka, id kembar); impor gagal tidak mengubah state lama
  - Mengubah `js/panels.js`: tombol Ekspor JSON, Impor JSON (pemilih berkas tersembunyi + FileReader, pesan gagal jelas), Ekspor CSV (pemisah koma, header kolom, angka 2 desimal, kutip teks berisi koma), fungsi `exportCsv`
  - Mengubah `index.html`: tiga tombol aksi di toolbar
  - Mengubah `css/style.css`: gaya `.aksi`
- File terdampak: js/store.js, js/panels.js, index.html, css/style.css
- Pengujian: `node --check` lulus; pemeriksaan Node khusus `importJson` → 9/9 lolos (valid diterima, JSON rusak ditolak, state lama utuh, devices bukan daftar, id kembar, Ptx bukan angka, tipe tak dikenal, global hilang, ekspor-impor ulang); `node --test tests/*` → 11/11 lulus.
- Catatan: Pemeriksaan `importJson` dijalankan lewat skrip sementara di Temp, bukan berkas tes proyek (struktur file PRD hanya mengizinkan `tests/lora.test.js`). Langkah berikutnya: Tahap 5 (SF rekomendasi dan penyempurnaan), menunggu persetujuan pengguna.

## [0.3.0] - 2026-10-21 00:10 (WIB)
- Penanggung jawab: Pengembang Web (Frontend) dan Penanggung Jawab Teknis
- Tahap: Tahap 3 (analisis visual dan panel parameter)
- Ringkasan: Panel parameter global, form edit perangkat, garis link berwarna sesuai status, lingkaran cakupan, legenda, tabel hasil, dan ringkasan.
- Perubahan:
  - Menambah `js/panels.js` (`init`, `render`, `selectDevice`): form frekuensi (preset 433/868/915/923 + bebas), SF, BW, NF, lingkungan, margin target; form edit nama/Ptx/gain/rugi; tabel hasil (kolom SF rekomendasi diisi "-" sampai Tahap 5); ringkasan gateway/node/terhubung/persentase/rata-rata FM
  - Mengubah `index.html`: layout panel kiri + peta kanan, markup form global, tabel hasil, tag `panels.js`
  - Mengubah `css/style.css`: gaya panel, input tidak valid (merah), tabel, legenda, responsif <= 900px
  - Mengubah `js/mapview.js`: tiga layer group (lingkaran, garis, marker), garis node→gateway terbaik berwarna sesuai status (putus-putus merah untuk Putus), popup garis (jarak, path loss, RSSI, sensitivitas, FM), lingkaran cakupan transparan, legenda status, callback `onSelect`/`onDeselect`
  - Mengubah `js/store.js`: menambah `updateDevice(id, patch)`
  - Mengubah `js/app.js`: hitung `LoRa.analyze(state)` lalu teruskan ke `MapView.render` dan `Panels.render`; parameter tidak valid → hasil null, perhitungan berhenti
- File terdampak: index.html, css/style.css, js/panels.js, js/mapview.js, js/store.js, js/app.js
- Pengujian: `node --check` 4 file JS lulus; `node --test tests/*` → 11/11 lulus. Uji manual browser belum dilakukan.
- Catatan: `Store.updateDevice` baru (tidak ada di daftar fungsi ARSITEKTUR lama) karena Tahap 3 perlu edit perangkat; `ARSITEKTUR.md` bagian 5 ikut diperbarui. Langkah berikutnya: Tahap 4 (impor/ekspor), menunggu persetujuan pengguna.

## [0.2.0] - 2026-10-20 23:54 (WIB)
- Penanggung jawab: Pengembang Web (Frontend) dan Penanggung Jawab Teknis
- Tahap: Tahap 2 (peta dan perangkat)
- Ringkasan: Peta Leaflet, tiga mode toolbar, tambah/geser/hapus marker, simpan otomatis ke localStorage, dan tombol Reset berkonfirmasi.
- Perubahan:
  - Menambah `index.html` (Leaflet 1.9.4 CDN, toolbar, div peta; tag `panels.js` menyusul Tahap 3)
  - Menambah `css/style.css` (toolbar, marker kotak biru/lingkaran oranye, label nama, responsif dasar)
  - Menambah `js/store.js` (`get`, `update`, `addDevice`, `moveDevice`, `removeDevice`, `reset`, `subscribe`; localStorage `lora-planner-v1`, gagal baca → state awal)
  - Menambah `js/mapview.js` (`init`, `setMode`, `render`; tile OSM atribusi "© OpenStreetMap contributors", marker `L.divIcon` draggable, label tooltip permanen, popup tombol Hapus)
  - Menambah `js/app.js` (pasang mode toolbar, tombol Reset dengan konfirmasi, `Store.subscribe` → `MapView.render`)
- File terdampak: index.html, css/style.css, js/store.js, js/mapview.js, js/app.js
- Pengujian: `node --check` pada 4 file JS lulus tanpa galat; `node --test tests/*` → 11/11 lulus. Uji manual browser (klik peta, geser, hapus, reset) belum dilakukan.
- Catatan: Leaflet CDN gagal dimuat → peta menampilkan pesan, modul lain tetap jalan. Garis link, lingkaran cakupan, dan panel parameter masuk Tahap 3. Langkah berikutnya: Tahap 3, menunggu persetujuan pengguna.

## [0.1.0] - 2026-10-20 23:47 (WIB)
- Penanggung jawab: Pengembang Web (Frontend) dan Penanggung Jawab Teknis
- Tahap: Tahap 1 (logika murni dan tes)
- Ringkasan: `js/lora.js` berisi 8 fungsi perhitungan beserta konstanta, diuji 11 angka uji PRD bagian 8, semua lulus.
- Perubahan:
  - Menambah `js/lora.js`: `distanceKm`, `pathLoss`, `sensitivity`, `linkResult`, `statusOf`, `maxRangeKm`, `recommendSf`, `analyze`, plus `SNR_REQ`, `ENV_N`, `NODE_DEFAULT`
  - Menambah `tests/lora.test.js`: 11 tes sesuai angka uji PRD bagian 8
- File terdampak: js/lora.js, tests/lora.test.js
- Pengujian: `node --test tests/lora.test.js` → 11/11 lulus. `node --test` tanpa argumen → 183 lulus, 0 gagal (11 tes proyek ikut lulus). Catatan: perintah `node --test tests/` gagal di Node v24.15.0 Windows dengan galat `Cannot find module '...\tests'` (argumen direktori tidak dikenal), bukan karena kode tes.
- Catatan: `sfOtomatis` belum diaktifkan di `analyze` (Tahap 5). Langkah berikutnya: Tahap 2 (peta dan perangkat), menunggu persetujuan pengguna.

## [0.0.0] - 2026-10-20 22:20 (WIB)
- Penanggung jawab: Pemilik proyek (pengguna), dibantu penyusunan dokumen oleh Claude
- Tahap: dokumen
- Ringkasan: Penyusunan dokumen awal proyek, belum ada kode.
- Perubahan:
  - Menambah `PRD.md` (5 tahap), `AGENTS.md`, `TUJUAN.md`, `ARSITEKTUR.md`, `CHANGELOG.md`
- File terdampak: PRD.md, AGENTS.md, TUJUAN.md, ARSITEKTUR.md, CHANGELOG.md
- Pengujian: tidak berlaku
- Catatan: Langkah berikutnya: Tahap 1 (logika murni dan tes), mulai dari mode Plan.