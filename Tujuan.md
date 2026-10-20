# TUJUAN.md: Tujuan Proyek

## Nama Proyek
Perencana Jaringan LoRa di Peta (LoRa Network Planner)

## Latar Belakang
Proyek ini adalah kelanjutan dari Kalkulator Link Budget LoRa/RF. Tujuannya menguji kemampuan AI coding agent (OpenCode, model gratis) pada proyek yang lebih besar: banyak file, peta interaktif, penyimpanan data, dan pengujian otomatis. Topiknya dari bidang Teknik Telekomunikasi sehingga hasilnya bisa diverifikasi dengan rumus yang jelas.

## Tujuan Utama
1. Membuat aplikasi web untuk merencanakan jaringan LoRa di peta: tempatkan gateway dan node, lihat kualitas link, cakupan, dan rekomendasi SF.
2. Melatih alur kerja bertahap dengan AI: dokumen terstruktur, satu tahap per sesi, pengujian otomatis, dan catatan perubahan yang bisa ditelusuri.
3. Menghasilkan aplikasi yang berjalan langsung di browser tanpa server dan tanpa instalasi paket.

## Pengguna
Mahasiswa Teknik Telekomunikasi yang merancang jaringan IoT/LoRa dan memerlukan estimasi cepat posisi gateway dan kelayakan link.

## Ukuran Keberhasilan
- Semua angka uji di bagian 8 `PRD.md` lolos lewat `node --test tests/`.
- Kelima tahap di `PRD.md` selesai, masing-masing disetujui pemilik proyek.
- Data perencanaan bisa disimpan, diekspor, dan diimpor kembali tanpa kehilangan informasi.
- Setiap perubahan tercatat di `CHANGELOG.md` dan `ARSITEKTUR.md` selalu sesuai dengan kode.

## Bukan Tujuan
Model propagasi yang sangat akurat, data medan, perhitungan airtime/duty cycle, server, akun pengguna, dan database.

## Dokumen Terkait
- `PRD.md`: kebutuhan, rumus, tahap, dan angka uji
- `ARSITEKTUR.md`: struktur teknis
- `CHANGELOG.md`: riwayat perubahan
- `AGENTS.md`: aturan kerja AI