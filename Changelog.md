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