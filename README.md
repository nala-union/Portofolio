# Portofolio

Situs statis (HTML, CSS, JS) yang otomatis di-deploy ke GitHub Pages setiap push ke `main`.

## Aktifkan GitHub Pages (sekali saja)
Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Setelah itu, setiap push ke `main` akan men-deploy situs ke `https://nala-union.github.io/portofolio/`.

## Edit konten
- `index.html` — teks dan struktur. Kotak bergradasi (kolase hero dan gambar proyek) adalah placeholder;
  ganti dengan `<img src="assets/nama-file.jpg" alt="...">` sesuai komentar di dalam file.
- `style.css` — warna dan font (variabel di bagian atas)
- `script.js` — animasi: judul per kata, menu layar penuh, parallax, kartu proyek menumpuk,
  teks yang menyala saat di-scroll, label kursor, dan tombol magnetis
- `assets/` — gambar

Semua animasi otomatis nonaktif bila pengunjung memilih "kurangi gerakan" di perangkatnya.

## Palet
Soft White `#FFFFFF`, Soft Sage Green `#A3B18A`, Light Gray `#E5E7EB`, Charcoal `#333333`.
Font: The Seasons (judul, fallback Cormorant Garamond) dan Assistant (isi).
