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