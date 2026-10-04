# Daawim

Aplikasi habit tracker Islami: shalat, tilawah, murojaah, baca buku, hafalan matan, plus tracker haidh & hutang puasa (mode Muslimah). Satu kode untuk Android dan iOS (Expo). Semua data tersimpan di HP, tanpa server dan tanpa login.

## Panduan dari nol (untuk pemula)

### 1. Siapkan laptop (sekali saja)
1. Install **Node.js LTS**: https://nodejs.org
2. Install **Git**: https://git-scm.com
3. Install **VS Code** (editor): https://code.visualstudio.com

### 2. Ambil kode & install
```bash
git clone https://github.com/achmedabimanyu-ui/Daawim-apk.git
cd Daawim-apk
git checkout claude/beautiful-cori-z509zh
npm install
```

### 3. Coba langsung di HP (paling cepat)
1. Di HP, install **Expo Go** (Play Store / App Store).
2. Di laptop jalankan:
   ```bash
   npx expo start
   ```
3. Scan QR code yang muncul:
   - Android: scan dari aplikasi Expo Go.
   - iPhone: scan pakai aplikasi Kamera.
4. Laptop dan HP harus di Wi-Fi yang sama. Kalau tidak bisa, jalankan `npx expo start --tunnel`.

Setiap kali kamu mengubah kode, aplikasi di HP langsung ter-update.

> Lihat di browser saja: `npx expo start --web` (beberapa fitur seperti lokasi/haptic terbatas di web).

### 4. Bikin file APK (Android) yang bisa di-install
Build dilakukan di cloud Expo (EAS), tidak perlu Android Studio.
```bash
npm install -g eas-cli
eas login            # buat akun gratis di https://expo.dev
eas build:configure  # sekali saja
eas build -p android --profile preview
```
Tunggu ±10–20 menit, lalu buka link yang diberikan dan download file `.apk` ke HP.

### 5. iOS (iPhone)
- Untuk mencoba: pakai **Expo Go** (langkah 3).
- Untuk install sebagai aplikasi sendiri / App Store: butuh **Apple Developer Account** (USD 99/tahun), lalu:
  ```bash
  eas build -p ios --profile production
  eas submit -p ios
  ```

## Fitur
- **Beranda**: streak harian (api animasi), habit hari ini, jadwal shalat + hitung mundur, ringkasan produktivitas, hutang puasa (Muslimah), hikmah harian, tombol Lihat Rekapan.
- **Habit**: pilih tanggal 7 hari terakhir, catat habit, kalender streak bulanan, kelola/aktifkan habit, tambah habit custom (target, satuan, jadwal hari, kategori custom).
- **Rekapan**: harian / pekanan / bulanan, grafik, habit paling konsisten & sering terlewat, perbandingan dengan bulan lalu.
- **Haidh** (Muslimah): catat mulai/selesai, prediksi periode berikutnya, rata-rata siklus, pengaturan siklus, hutang puasa. Hari haidh dihitung sebagai *hari udzur* (biru) sehingga streak tidak putus, dan shalat tidak masuk target pada hari itu.
- **Pengaturan**: profil + foto, Muslim/Muslimah, bahasa (Indonesia / English / العربية dengan tampilan kanan-ke-kiri), tema terang/gelap, warna aksen, target harian streak, metode perhitungan shalat & madzhab Ashar, ekspor/impor/reset data.

## Struktur folder
```
src/
  app/            # layar (setiap file = 1 halaman, Expo Router)
    (tabs)/       # Beranda, Habit, Haidh, Pengaturan
    habit/[id].tsx  # tambah/edit habit
    insights.tsx  # Rekapan
    onboarding.tsx
  components/     # komponen UI (tombol 3D, api streak, kalender, dll)
  lib/            # logika: streak, jadwal shalat, terjemahan, tema
  store/app.ts    # penyimpanan data lokal di HP
```

## Tips mengubah sendiri
- Teks/terjemahan: `src/lib/i18n.ts`
- Habit bawaan & kutipan hikmah: `src/lib/defaults.ts`
- Warna: `src/lib/theme.ts`
- Cek error sebelum build: `npx tsc --noEmit`
