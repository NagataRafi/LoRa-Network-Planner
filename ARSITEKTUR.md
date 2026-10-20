# ARSITEKTUR.md: Arsitektur Aplikasi

Dokumen ini menjelaskan struktur teknis. Isinya adalah rencana awal. AI wajib memperbaruinya jika struktur kode berubah.

## 1. Gambaran Umum
Aplikasi statis sisi klien. Semua perhitungan dan penyimpanan terjadi di browser pengguna. Satu-satunya akses jaringan adalah memuat Leaflet (CDN) dan tile peta OpenStreetMap.

## 2. Struktur File dan Tanggung Jawab
```
LoRaPlanner/
├── index.html          Kerangka halaman, memuat CSS dan semua skrip
├── css/style.css       Tampilan
├── js/
│   ├── lora.js         Logika murni. DILARANG menyentuh DOM atau Leaflet
│   ├── store.js        State, localStorage, impor/ekspor. DILARANG menyentuh DOM atau Leaflet
│   ├── mapview.js      Satu-satunya modul yang memakai Leaflet
│   ├── panels.js       Form parameter, daftar perangkat, tabel hasil (DOM)
│   └── app.js          Inisialisasi dan penghubung modul
├── tests/lora.test.js  Tes otomatis untuk lora.js (node --test)
└── PRD.md, AGENTS.md, TUJUAN.md, ARSITEKTUR.md, CHANGELOG.md
```
Skrip dimuat berurutan: lora.js, store.js, mapview.js, panels.js, app.js. Setiap modul mengekspos satu objek global: `LoRa`, `Store`, `MapView`, `Panels`. Khusus `lora.js` juga diekspor lewat `module.exports` agar bisa dites di Node.

## 3. Aturan Ketergantungan
```
app.js ──> Panels, MapView, Store, LoRa
Panels ──> Store, LoRa
MapView ──> Store, LoRa
Store ──> (tidak bergantung modul lain)
LoRa ──> (tidak bergantung modul lain)
```
Panah berarti "boleh memanggil". Tidak boleh ada arah sebaliknya.

## 4. Alur Data Satu Arah
```
Aksi pengguna (klik peta, geser marker, ubah form)
        │
        ▼
 Store.update(...)  ──> simpan ke localStorage
        │
        ▼
 Store memberi tahu pelanggan (subscribe)
        │
        ▼
 LoRa.analyze(state)  ──> hasil per node dan jari-jari per gateway
        │
        ├──> MapView.render(state, hasil)   marker, garis, lingkaran
        └──> Panels.render(state, hasil)    form, tabel, ringkasan
```
Perubahan state hanya lewat `Store`. Modul lain tidak boleh mengubah state atau tampilan modul lain secara langsung.

## 5. Fungsi Utama (Rencana)
- `LoRa`: `distanceKm`, `pathLoss`, `sensitivity`, `linkResult`, `statusOf`, `maxRangeKm`, `recommendSf`, `analyze`
- `Store`: `get`, `update`, `addDevice`, `moveDevice`, `removeDevice`, `reset`, `subscribe`, `exportJson`, `importJson`
- `MapView`: `init`, `setMode`, `render`
- `Panels`: `init`, `render`, `exportCsv`

## 6. Model Data
Lihat bagian 4 `PRD.md`. Kunci `localStorage`: `lora-planner-v1`. Jika format data berubah, naikkan versi kunci dan catat di `CHANGELOG.md`.

## 7. Keputusan Teknis
- Skrip klasik (bukan ES module) agar `index.html` bisa dibuka langsung dari file.
- Logika dipisah dari tampilan agar bisa diuji di Node tanpa browser.
- Satu sumber kebenaran (`Store`) dan alur satu arah untuk menghindari state yang tidak sinkron antara peta dan tabel.
- Leaflet dipakai sebagai satu-satunya library, dikurung di `mapview.js`.

## 8. Cara Menguji
- Otomatis: `node --test tests/` dari folder proyek.
- Manual: buka `index.html`, ulangi skenario angka uji di bagian 8 `PRD.md` dengan menaruh perangkat di peta.

## 9. Status Implementasi
- Tahap 1 selesai (2026-10-20): `js/lora.js` dan `tests/lora.test.js` dibuat. Delapan fungsi `LoRa` aktif dan lulus 11 angka uji PRD bagian 8 lewat `node --test`.
- Tahap 2 selesai (2026-10-20): `index.html`, `css/style.css`, `js/store.js`, `js/mapview.js`, `js/app.js` dibuat. Peta Leaflet, tiga mode toolbar, marker draggable + popup Hapus, simpan localStorage, Reset berkonfirmasi. Tag `<script>` `panels.js` belum ada karena `js/panels.js` dibuat di Tahap 3.
- Belum ada: `js/panels.js` (Tahap 3), impor/ekspor (Tahap 4), sfOtomatis aktif di `analyze` (Tahap 5).
- Perbarui bagian ini setiap tahap selesai.