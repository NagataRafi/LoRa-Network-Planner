# LoRa Network Planner

Perencana jaringan LoRa/LoRaWAN interaktif di atas peta: taruh gateway dan node, lihat kualitas link, cakupan, dan rekomendasi Spreading Factor dalam hitungan detik.

[![Lisensi MIT](https://img.shields.io/badge/Lisensi-MIT-green)](LICENSE)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-yellow)
![Leaflet 1.9.4](https://img.shields.io/badge/Leaflet-1.9.4-2c7bb9)
![Tanpa backend](https://img.shields.io/badge/tanpa-backend-blueviolet)
![Tanpa build](https://img.shields.io/badge/tanpa-build-blueviolet)

## Ringkasan

Merancang jaringan IoT/LoRa biasanya butuh alat berat dan banyak asumsi. Aplikasi ini menjawab satu kebutuhan spesifik: **estimasi cepat** apakah suatu konfigurasi layak, dan di mana sebaiknya gateway diletakkan. Pengguna menaruh gateway dan node di peta, lalu aplikasi menghitung link budget setiap node ke gateway terbaiknya, menampilkan garis link berwarna sesuai status, lingkaran cakupan, tabel hasil, dan rekomendasi Spreading Factor.

Dibuat untuk mahasiswa Teknik Telekomunikasi dan siapa pun yang merancang jaringan IoT sederhana — monitoring gardu, cuaca, pertanian, dan sejenisnya. Berjalan sepenuhnya di browser: tidak ada backend, tidak ada database, tidak ada instalasi paket.

## Fitur

- Peta OpenStreetMap interaktif dengan Leaflet 1.9.4.
- Tambah gateway (kotak biru) dan node (lingkaran oranye) dengan sekali klik di peta; marker bisa digeser, diberi nama, diedit parameter Ptx/gain/rugi, dan dihapus.
- Link budget uplink tiap node ke gateway terbaiknya (RSSI tertinggi): jarak, path loss, RSSI, sensitivitas, dan fade margin.
- Garis link berwarna sesuai status — hijau tua sampai merah, putus-putus merah bila putus — dengan popup detail, plus lingkaran cakupan transparan tiap gateway dan legenda warna.
- Parameter global: frekuensi (preset 433/868/915/923 MHz atau bebas), SF7–SF12, bandwidth 125/250/500 kHz, noise figure, lingkungan (n = 2 / 2,7 / 3,2 / 3,8), dan margin target.
- Tabel hasil dan ringkasan: jumlah gateway, jumlah node, node terhubung, persentase terhubung, serta rata-rata fade margin node terhubung.
- Rekomendasi SF (SF terkecil yang lolos margin target) dan opsi **SF otomatis** yang menghitung tiap node dengan SF rekomendasinya.
- Simpan otomatis di `localStorage`, ekspor/impor berkas JSON dengan validasi struktur, dan ekspor tabel hasil ke CSV.
- Tata letak nyaman di laptop dan tetap bisa dipakai di layar kecil.

## Cara Menjalankan

Aplikasi harus dibuka lewat **server lokal**, bukan diklik dua kali dari `file://`. Tile OpenStreetMap menolak permintaan tanpa header Referer (galat 403 "Access blocked: App is not following the tile usage policy"), dan browser tidak mengirim Referer dari `file://`.

```bash
git clone https://github.com/NagataRafi/LoRa-Network-Planner.git
cd LoRa-Network-Planner
python -m http.server 8000
```

Lalu buka <http://localhost:8000>. Alternatif lain: ekstensi **Live Server** di VS Code. Tidak perlu `npm install` — satu-satunya pustaka eksternal (Leaflet) dimuat dari CDN.

## Cara Menjalankan Tes

```bash
node --test tests/
```

Membutuhkan Node.js 18 atau lebih baru. Tanpa `package.json` dan tanpa instalasi paket. Catatan: pada Node 24 untuk Windows, argumen direktori `tests/` kadang gagal dikenali; bila itu terjadi pakai `node --test` atau `node --test "tests/*"`.

## Cara Pakai Singkat

1. Pilih mode **Tambah Gateway** atau **Tambah Node**, lalu klik posisi di peta. Ulangi untuk perangkat lain.
2. Atur parameter global (frekuensi, SF, BW, lingkungan, margin target). Klik marker untuk mengubah nama, Ptx, gain, dan rugi.
3. Baca tabel hasil dan ringkasan di panel kiri; garis di peta menunjukkan link tiap node. Gunakan **Ekspor JSON**/**Ekspor CSV** untuk menyimpan hasil, **Impor JSON** untuk memuatnya kembali.

## Rumus dan Model

Semua logaritma log basis 10, arah link uplink (node ke gateway), dihitung di `js/lora.js`.

- **Jarak**: haversine dengan jari-jari bumi R = 6371 km.
- **Path loss** model log-distance dengan referensi 1 meter: `PL(d) = 20·log10(f_MHz) − 27,55 + 10·n·log10(d_meter)`, dengan n = 2 (ruang bebas), 2,7 (pinggiran kota), 3,2 (perkotaan), atau 3,8 (padat).
- **RSSI**: `RSSI = Ptx + Gtx − Ltx − PL + Grx − Lrx`.
- **Sensitivitas** LoRa: `S = −174 + 10·log10(BW_Hz) + NF + SNR_req`. SNR_req per SF: SF7 = −7,5 dB sampai SF12 = −20 dB.
- **Fade margin**: `FM = RSSI − S`. Status: FM ≥ 20 dB Sangat baik, 10–20 dB Baik, 0–10 dB Marginal, < 0 dB Putus.
- **Gateway terbaik** untuk sebuah node adalah gateway dengan RSSI tertinggi. **Jari-jari cakupan** gateway dihitung dari margin target dengan parameter daya bawaan node (Ptx 14 dBm, gain 3 dBi, rugi 1 dB). **SF rekomendasi** adalah SF terkecil (7–12) yang menghasilkan FM ≥ margin target; bila tidak ada, "Tidak ada".

## Struktur Proyek

```
LoRa-Network-Planner/
├── index.html          Kerangka halaman, memuat CSS dan semua skrip
├── css/style.css       Tampilan
├── js/
│   ├── lora.js         Logika perhitungan murni (tanpa DOM, tanpa Leaflet)
│   ├── store.js        State, localStorage, impor/ekspor JSON
│   ├── mapview.js      Semua hal tentang Leaflet: marker, garis, lingkaran
│   ├── panels.js       Form parameter, form perangkat, tabel hasil, ringkasan
│   └── app.js          Inisialisasi dan penghubung semua modul
├── tests/lora.test.js  Tes otomatis (node --test)
├── Changelog.md       Riwayat perubahan
├── LICENSE            Lisensi MIT
├── opencode.json      Konfigurasi editor OpenCode
└── README.md
```

## Batasan

- Model log-distance dengan n tetap hanyalah estimasi kasar. Hasil nyata bergantung pada medan, bangunan, dan tinggi antena.
- Preset frekuensi hanya contoh. Pengguna wajib memeriksa regulasi frekuensi dan daya di wilayahnya masing-masing.
- Lingkaran cakupan mengasumsikan lingkungan yang seragam di semua arah.

## Atribusi

- Peta OpenStreetMap — data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), dipakai sesuai [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
- [Leaflet 1.9.4](https://leafletjs.com/) — lisensi BSD-2-Clause, dimuat dari CDN unpkg.

## Lisensi

Proyek ini berlisensi [MIT](LICENSE).
