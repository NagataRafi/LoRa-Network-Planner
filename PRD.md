# PRD: Perencana Jaringan LoRa di Peta (LoRa Network Planner)

## 1. Ringkasan
Aplikasi web statis untuk merencanakan jaringan LoRa/LoRaWAN di atas peta. Pengguna menaruh gateway dan node di peta, lalu aplikasi menghitung link budget setiap node ke gateway terbaiknya, menampilkan garis link berwarna sesuai status, lingkaran cakupan gateway, tabel hasil, dan rekomendasi Spreading Factor (SF).

Ini adalah proyek tingkat lanjut dari Kalkulator Link Budget LoRa/RF. Perbedaannya: banyak file terpisah, peta interaktif, penyimpanan data, impor/ekspor, dan pengujian otomatis. Pengerjaan dibagi per tahap (bagian 5).

Pengguna: mahasiswa Teknik Telekomunikasi yang merancang jaringan IoT/LoRa (misalnya monitoring gardu, cuaca, atau pertanian).

## 2. Batasan Teknis
- Aplikasi sisi klien saja. Tidak ada backend dan tidak ada database server.
- Library eksternal yang boleh dipakai hanya **Leaflet 1.9.4** (CSS dan JS dari CDN unpkg). Tidak boleh ada library lain dan tidak ada `npm install`.
- Peta memakai tile OpenStreetMap. Wajib menampilkan atribusi "© OpenStreetMap contributors". Aplikasi hanya untuk pemakaian ringan.
- Skrip memakai `<script>` klasik (bukan ES module), supaya `index.html` bisa dibuka langsung dengan klik dua kali.
- Pengujian memakai Node bawaan: `node --test tests/` (Node 18 atau lebih baru). Tidak memerlukan `package.json` dan tidak memerlukan instalasi paket.
- Marker memakai `L.circleMarker` dan `L.divIcon` sederhana, bukan ikon gambar bawaan Leaflet.
- Bahasa antarmuka: Bahasa Indonesia. Tampilan nyaman di laptop dan masih bisa dipakai di HP.
- Kode sesingkat dan sesederhana mungkin. Jangan menambah fitur atau file di luar dokumen ini.
- Jika internet mati, peta kosong tetapi perhitungan dan tabel tetap berjalan.

## 3. Struktur File
```
LoRaPlanner/
├── index.html
├── css/style.css
├── js/
│   ├── lora.js       Logika perhitungan murni (tanpa DOM, tanpa Leaflet)
│   ├── store.js      State, localStorage, impor/ekspor (tanpa Leaflet)
│   ├── mapview.js    Semua hal tentang Leaflet: marker, garis, lingkaran
│   ├── panels.js     Form parameter, daftar perangkat, tabel hasil
│   └── app.js        Inisialisasi dan penghubung semua modul
├── tests/lora.test.js
└── PRD.md, AGENTS.md, TUJUAN.md, ARSITEKTUR.md, CHANGELOG.md
```
Urutan `<script>` di `index.html`: lora.js, store.js, mapview.js, panels.js, app.js. `lora.js` harus bisa dipakai di browser (objek global `LoRa`) dan di Node (`module.exports`) dengan pola pengecekan `typeof module`.

## 4. Model Data
State tunggal (satu-satunya sumber kebenaran), disimpan di `Store` dan di `localStorage` kunci `lora-planner-v1`.

```json
{
  "global": {
    "fMHz": 923, "sf": 12, "bwKHz": 125, "nfDb": 6,
    "env": "ruangBebas", "marginTargetDb": 10, "sfOtomatis": false
  },
  "devices": [
    { "id": "gw1", "type": "gateway", "name": "GW-1", "lat": -7.2575, "lng": 112.7521,
      "gainDbi": 3, "lossDb": 1 },
    { "id": "n1", "type": "node", "name": "Node-1", "lat": -7.2475, "lng": 112.7621,
      "ptxDbm": 14, "gainDbi": 3, "lossDb": 1 }
  ]
}
```
- Node memakai `ptxDbm`, `gainDbi`, `lossDb` sebagai sisi pemancar (uplink). Gateway memakai `gainDbi`, `lossDb` sebagai sisi penerima.
- Lingkungan dan path loss exponent n: ruangBebas = 2, pinggiranKota = 2.7, perkotaan = 3.2, padat = 3.8.
- Nilai awal perangkat baru: node Ptx 14 dBm, gain 3 dBi, rugi 1 dB. Gateway gain 3 dBi, rugi 1 dB.
- Pusat peta awal: -7.2575, 112.7521, zoom 13.

## 5. Rumus (di `lora.js`)
Semua logaritma adalah log basis 10. Arah link: uplink (node ke gateway).

1. Jarak: rumus haversine dengan R = 6371 km, hasil dalam km.
2. Path loss model log-distance dengan referensi 1 meter: `PL(d) = 20*log(f_MHz) - 27.55 + 10*n*log(d_meter)`. Untuk n = 2 hasilnya sama dengan FSPL standar.
3. RSSI: `RSSI = Ptx + Gtx - Ltx - PL(d) + Grx - Lrx`
4. Sensitivitas: `S = -174 + 10*log(BW_Hz) + NF + SNR_req`. SNR_req per SF: SF7 = -7.5, SF8 = -10, SF9 = -12.5, SF10 = -15, SF11 = -17.5, SF12 = -20 (dB).
5. Fade margin: `FM = RSSI - S`
6. Status: FM >= 20 Sangat baik (hijau tua), 10 <= FM < 20 Baik (hijau), 0 <= FM < 10 Marginal (kuning), FM < 0 Putus (merah).
7. Gateway terbaik untuk sebuah node adalah gateway dengan RSSI tertinggi.
8. Jari-jari cakupan gateway (km): `PL_max = Ptx + Gtx - Ltx + Grx - Lrx - S - margin_target`, lalu `d_max_m = 10 ^ ((PL_max - (20*log(f_MHz) - 27.55)) / (10*n))`. Parameter node yang dipakai adalah nilai awal node (Ptx 14, Gtx 3, Ltx 1) dan parameter gateway yang bersangkutan.
9. SF rekomendasi: SF terkecil (7 sampai 12) yang menghasilkan FM >= margin target. Jika tidak ada, tampilkan "Tidak ada" dan pakai SF12 sebagai acuan peringatan.

Fungsi yang diekspor `lora.js`: `distanceKm`, `pathLoss`, `sensitivity`, `linkResult`, `statusOf`, `maxRangeKm`, `recommendSf`, `analyze(state)`. Fungsi `analyze(state)` mengembalikan hasil per node dan jari-jari per gateway tanpa mengubah state.

## 6. Tahap Pengerjaan
Kerjakan satu tahap per sesi. Jangan mulai tahap berikutnya sebelum semua kriteria tahap sebelumnya terpenuhi dan pengguna menyetujui.

### Tahap 1: Logika murni dan tes
- Buat `js/lora.js` dan `tests/lora.test.js`.
- Kriteria: `node --test tests/` lolos untuk semua angka uji di bagian 8.

### Tahap 2: Peta dan perangkat
- Buat `index.html`, `css/style.css`, `js/store.js`, `js/mapview.js`, `js/app.js`.
- Tampilkan peta Leaflet. Toolbar berisi tiga mode: Pilih/Geser, Tambah Gateway, Tambah Node. Klik di peta pada mode tambah akan menambah perangkat. Marker bisa digeser dan dihapus (klik marker lalu tombol Hapus).
- Gateway ditampilkan sebagai kotak biru, node sebagai lingkaran oranye, dengan label nama.
- State tersimpan otomatis di `localStorage` dan dimuat lagi saat halaman dibuka. Ada tombol Reset (dengan konfirmasi).
- Pola alur: perubahan state lewat `Store`, modul lain berlangganan (`Store.subscribe`) dan merender ulang. Jangan mengubah DOM atau peta langsung dari tempat lain.

### Tahap 3: Analisis visual dan panel parameter
- Buat `js/panels.js`. Panel parameter global: frekuensi (preset 433, 868, 915, 923 MHz dan input bebas), SF, BW (125/250/500), NF, lingkungan, margin target.
- Klik perangkat membuka form edit: nama, dan parameter (Ptx, gain, rugi).
- Peta: garis dari tiap node ke gateway terbaik berwarna sesuai status (putus-putus merah jika Putus). Lingkaran cakupan tiap gateway (transparan). Popup pada garis berisi jarak, path loss, RSSI, sensitivitas, FM.
- Tabel hasil: Node, Gateway terbaik, Jarak (km), RSSI (dBm), FM (dB), Status, SF rekomendasi (diisi "-" sampai Tahap 5).
- Ringkasan: jumlah gateway, jumlah node, jumlah node terhubung (FM >= 0), persentase terhubung, rata-rata FM node terhubung.
- Legenda warna status di peta.
- Semua hasil dihitung ulang otomatis saat parameter atau posisi berubah.

### Tahap 4: Impor dan ekspor
- Ekspor state ke berkas JSON dan impor dari berkas JSON (dengan validasi struktur; berkas rusak ditolak dengan pesan jelas dan state lama tidak berubah).
- Ekspor tabel hasil ke CSV (pemisah koma, header kolom, angka 2 desimal).

### Tahap 5: SF rekomendasi dan penyempurnaan
- Isi kolom SF rekomendasi di tabel.
- Opsi `sfOtomatis`: jika aktif, tiap node dihitung dengan SF rekomendasinya (jika tidak ada, SF12).
- Tampilan responsif dan pesan kesalahan yang rapi.

## 7. Validasi dan Penanganan Error
- Frekuensi, BW, dan jarak harus angka lebih besar dari 0. Nilai tidak valid ditandai merah dan perhitungan tidak dijalankan sampai diperbaiki.
- Jika tidak ada gateway, node ditampilkan dengan status "Tanpa gateway" (abu-abu) dan tidak dihitung.
- Jika jarak node ke gateway kurang dari 1 meter, pakai 1 meter.
- Impor JSON yang tidak valid tidak boleh merusak state.
- `localStorage` yang tidak bisa dibaca atau rusak: mulai dengan state awal tanpa error.
- Angka ditampilkan dengan 2 desimal.

## 8. Angka Uji
Semua uji memakai `fMHz = 923`, BW 125, NF 6, node Ptx 14 / Gtx 3 / Ltx 1, gateway Grx 3 / Lrx 1, kecuali disebut lain. Toleransi 0.03 untuk dB dan dBm.

1. Haversine: titik (0, 0) ke (0.01, 0) menghasilkan 1.112 km (toleransi 0.002).
2. Sensitivitas: SF7 = -124.53, SF8 = -127.03, SF9 = -129.53, SF10 = -132.03, SF11 = -134.53, SF12 = -137.03 dBm.
3. Path loss n = 2, d = 1 km: 91.75 dB. RSSI = -73.75 dBm. FM pada SF12 = 63.28 dB.
4. Path loss n = 2, d = 1.11195 km (jarak uji 1): 92.68 dB. RSSI = -74.68 dBm.
5. n = 3.2, d = 1 km: path loss 127.75 dB, RSSI -109.75 dBm. FM SF12 = 27.28 (Sangat baik). FM SF7 = 14.78 (Baik).
6. n = 3.8, d = 1 km: path loss 145.75 dB, RSSI -127.75 dBm. FM SF12 = 9.28 (Marginal).
7. Status: FM 20.0 Sangat baik, 19.99 Baik, 10.0 Baik, 9.99 Marginal, 0.0 Marginal, -0.01 Putus.
8. Jari-jari cakupan, SF12, margin target 10, n = 3.2: 3.47 km (toleransi 0.02 km).
9. SF rekomendasi (margin target 10): kasus 5 menghasilkan SF7. Kasus 6 menghasilkan "Tidak ada".
10. Gateway terbaik: node di (0, 0), gateway A di (0, 0.01), gateway B di (0, 0.02). Hasilnya gateway A.
11. Tanpa gateway: `analyze` tidak error dan node berstatus "Tanpa gateway".

## 9. Di Luar Cakupan
Zona Fresnel, profil ketinggian medan, tinggi antena, model propagasi lain (Okumura-Hata dan sebagainya), perhitungan airtime/duty cycle, downlink, penjadwalan kanal, akun pengguna, server, dan database.

## 10. Catatan
- Model log-distance dengan n tetap hanyalah estimasi kasar. Hasil nyata bergantung pada medan, bangunan, dan tinggi antena.
- Preset frekuensi hanya contoh. Pengguna wajib memeriksa regulasi frekuensi dan daya di wilayahnya.
- Lingkaran cakupan mengasumsikan lingkungan seragam di semua arah.

## 11. Cara Kerja untuk AI
Ikuti `AGENTS.md`. Mulai setiap tahap di mode Plan, minta persetujuan, lalu pindah ke mode Build.