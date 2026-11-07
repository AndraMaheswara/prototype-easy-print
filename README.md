# EasyPrint · Prototype

Clickable prototype of EasyPrint, the ordering & order-management system for
Restu Ibu Print & Fotocopy. 44 screens. Plain static site: no build step, no dependencies.

```
index.html      all screens + popups + data
styles.css      design tokens, components, layout
script.js       router, popups, toasts, filters, account menu, mobile switch
assets/fonts    Inter + Selawik (Segoe UI look-alike), subset woff2
assets/img      logo, photo and background images
```

## Deploy to Vercel
- Drag & drop: vercel.com → Add New → Project → drag this folder → Deploy.
- GitHub: push the folder → import in Vercel → Framework Preset **Other**, no build command, output `./`.
- CLI: `npm i -g vercel` then `vercel` inside this folder.

## What's inside
**Original Figma screens (18)** — shown pixel-exact, now with fixes: dates match order numbers,
one product name (EasyPrint), full nav on the landing page, mail icon on login, visible
"Bahan kritis" icon, separate customer/admin notifications.

**New screens (26)**
- Pelanggan: Katalog Layanan (filter + search), Detail Layanan (price table, estimate),
  Buat Pesanan step 1 & 3, Pesanan Berhasil, Pesanan Saya (status tabs + empty state),
  Pesanan Saya kosong, Tracking Ditolak (+ re-upload), Profil + account menu, Notifikasi pelanggan.
- Akun & publik: Lupa password → Cek email → Atur ulang password, Cek Pesanan tanpa login + hasil, 404.
- Admin: Detail & Verifikasi Pesanan, popup Tolak, Struk kasir (printable).
- Owner: Supplier & Pasokan (+ purchase order), Riwayat Stok, Kelola Pengguna; popups for
  Tambah/Edit Bahan, Tambah/Edit Layanan (BOM), Penyesuaian Stok, Hapus, Supplier, PO, Pengguna.
- Mobile (auto when the window is < 760px wide): Login, Dashboard, Katalog, Pesanan Saya, Tracking.

## Using it
- **☰ Layar** (bottom-right) jumps to any screen, grouped by role.
- Login demo roles: Pelanggan / Admin / Owner.
- Forms accept typing; nothing is validated or saved. Buttons show a confirmation toast.
- Clicking an empty spot on an original design screen flashes everything clickable.
- Each screen has its own URL, e.g. `/#katalog`, `/#admin-detail`, `/#supplier`.

All prices, names and numbers in the new screens are **example data**.
