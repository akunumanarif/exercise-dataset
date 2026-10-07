# Dumbbell PPL

Static Progressive Web App untuk program latihan Push, Pull, Legs enam hari per minggu menggunakan dumbbell tanpa bench.

## Fitur

- Jadwal otomatis berdasarkan hari
- Navigasi seluruh program mingguan
- Ilustrasi posisi awal dan akhir setiap gerakan
- Panduan gerakan dalam Bahasa Indonesia
- Checklist set yang tersimpan per minggu di perangkat
- Timer istirahat 60 atau 90 detik
- Dapat diinstal dan digunakan offline
- Mobile-first, tanpa backend dan tanpa proses build

## Menjalankan secara lokal

Jalankan static server dari root repository, kemudian buka alamat yang ditampilkan:

```bash
python3 -m http.server 8000
```

Service worker tidak berjalan bila halaman dibuka langsung menggunakan protokol `file://`.

## Deploy ke GitHub Pages

1. Push perubahan ke branch `main`.
2. Buka **Settings → Pages** pada repository GitHub.
3. Pilih **Deploy from a branch**.
4. Pilih branch **main** dan folder **/(root)**.
5. Simpan dan tunggu deployment selesai.

Situs akan tersedia di `https://<username>.github.io/<nama-repository>/`. Semua path PWA dibuat relatif agar tetap bekerja pada GitHub Pages project site.

## Lisensi dan atribusi

Kode aplikasi mengikuti [LICENSE-CODE](LICENSE-CODE). Data latihan dan ilustrasi menggunakan RepDB Free Tier License di [LICENSE-DATA.md](LICENSE-DATA.md).

Exercise data by [RepDB](https://repdb.co).

Folder `premium-samples/` adalah materi evaluasi dan tidak digunakan oleh aplikasi produksi ini.
