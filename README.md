# SIPAKAR — Sistem Informasi Pemantauan & Perbandingan Harga Komoditas Pangan di Pasar Lokal

![Arsitektur](https://img.shields.io/badge/Arsitektur-SPA%20MVC%20Modular-059669?style=flat-square)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20(ES6%20Modules)-f59e0b?style=flat-square)
![CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20CDN-0284c7?style=flat-square)
![Database](https://img.shields.io/badge/Database-Firebase%20Firestore%20%2F%20LocalStorage-dc2626?style=flat-square)
![Visualisasi](https://img.shields.io/badge/Grafik-Chart.js-7c3aed?style=flat-square)

---

## 1. Judul & Deskripsi Proyek

**SIPAKAR** (*Sistem Informasi Pemantauan & Perbandingan Harga Komoditas Pangan*) adalah aplikasi web modern berbasis *Single Page Application* (SPA) yang dirancang untuk mewujudkan transparansi harga bahan pangan pokok di pasar-pasar tradisional tingkat lokal, khususnya wilayah Priangan Timur (Kota Tasikmalaya dan Kabupaten Ciamis). Aplikasi ini membantu masyarakat umum mengetahui perbandingan harga harian pangan antar pasar terdekat secara akurat dan objektif sebelum berbelanja.

Selain menyediakan akses data terbuka bagi publik, SIPAKAR juga memfasilitasi kebutuhan pencatatan lapangan bagi petugas dinas pasar untuk menginput survei harga harian secara terstruktur dengan validasi kewajaran harga otomatis. Bagi administrator, sistem menyediakan modul pengelolaan data master pasar dan wilayah, rekapitulasi data harga untuk laporan dinas, serta pencatatan audit log aktivitas seluruh interaksi sistem secara transparan.

---

## 2. Fitur Utama Berdasarkan Role

Aplikasi SIPAKAR menerapkan pembagian hak akses pengguna (*Role-Based Access Control*) yang terbagi menjadi tiga peran utama:

### A. Masyarakat / Publik (Tanpa Login)
* **Katalog & Komparasi Harga Terkini:** Melihat tabel matriks harga komoditas pangan harian lintas pasar (Pasar Cikurubuk, Pasar Pancasila, Pasar Padayungan, dan Pasar Manis Ciamis) lengkap dengan indikator harga termurah, harga termahal, dan harga rata-rata.
* **Pencarian & Penyaringan Fleksibel:** Fitur pencarian cepat nama komoditas serta penyaringan (*filter*) berdasarkan kategori pangan (beras, bumbu, protein, minyak & gula, sayur) dan wilayah administratif.
* **Ringkasan Indikator Kunci (KPI Cards):** Menampilkan total komoditas terpantau, jumlah pasar aktif, tanggal pembaruan terakhir, dan jumlah komoditas yang mengalami lonjakan harga.
* **Laporan & Grafik Fluktuasi Harga:** Visualisasi grafik pergerakan tren harga harian berbasis *Chart.js* dengan rentang tanggal fleksibel (7 hari terakhir hingga rentang khusus) per komoditas di berbagai pasar.

### B. Petugas Lapangan (Wajib Login)
* **Autentikasi Petugas:** Masuk melalui modal login khusus petugas lapangan untuk mendapatkan akses input.
* **Form Input Harga Harian:** Memasukkan data survei harga komoditas per pasar tradisional dengan validasi kewajaran otomatis (rentang Rp 500 hingga Rp 500.000).
* **Pencatatan Waktu Otomatis (*Auto-Timestamp*):** Sistem secara otomatis merekam tanggal, jam, dan nama petugas pencatat saat harga diinput.
* **Riwayat Input Petugas:** Memantau tabel riwayat harga yang telah diinput sebelumnya lengkap dengan filter per pasar dan komoditas.

### C. Administrator Sistem (Wajib Login)
* **Manajemen Data Master (CRUD Penuh):** Mengelola 5 entitas master data sistem:
  * **Wilayah:** Kode wilayah dan nama wilayah administratif.
  * **Pasar Tradisional:** Nama pasar, relasi wilayah, dan alamat/lokasi.
  * **Kategori Pangan:** Klasifikasi kelompok bahan pokok.
  * **Satuan Ukuran:** Satuan standar transaksi (Kg, Liter, Ikat).
  * **Komoditas Pangan:** Nama komoditas terhubung dengan kategori dan satuannya.
* **Pencegahan Duplikasi & Validasi Relasi:** Memvalidasi keunikan nama pasar, wilayah, dan komoditas agar tidak terjadi redundansi data.
* **Rekapitulasi Harga Pasaran:** Tabel rekap komprehensif harga terendah, tertinggi, dan rata-rata yang dilengkapi fitur **Cetak Laporan (*Print Friendly*)** dan **Ekspor Data ke CSV**.
* **Log Aktivitas & Audit Trail:** Memantau rekam jejak digital mencakup histori login pengguna, transaksi input harga harian, serta manipulasi data master.

---

## 3. Arsitektur & Stack Teknologi

SIPAKAR dibangun menggunakan arsitektur **Single Page Application (SPA)** murni dengan pola **Model-View-Controller (MVC)** modular berbasis standar **ES6 Modules**, tanpa memerlukan *bundler* atau *compiler* rumit (seperti Webpack, Vite, atau Babel).

```
   ┌────────────────────────────────────────────────────────┐
   │                   Pengguna / Browser                   │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                 Router (js/router.js)                  │
   │            (Role Guard & State Management)             │
   └───────────┬────────────────────────────────┬───────────┘
               │                                │
               ▼                                ▼
   ┌───────────────────────┐        ┌───────────────────────┐
   │      Controllers      │        │         Views         │
   │  - AuthController     │◄──────►│  - KatalogView        │
   │  - DataController     │        │  - LaporanView        │
   │  - HargaController    │        │  - FormInputView      │
   │  - KatalogController  │        │  - KelolaDataView     │
   │  - LaporanController  │        │  - RekapLogView       │
   └───────────┬───────────┘        └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │        Models         │
   │  - UserModel (OOP)    │
   │  - HargaModel         │
   │  - MasterDataModel    │
   │  - LogModel           │
   └───────────┬───────────┘
               │
               ▼
   ┌────────────────────────────────────────────────────────┐
   │         DatabaseAdapter (config/firebase.js)           │
   │  - Cloud Mode: Firebase Firestore Cloud SDK           │
   │  - Local Mode: LocalStorage Engine (Default Offline)   │
   └────────────────────────────────────────────────────────┘
```

### Rincian Komponen MVC
1. **Model (`models/`):**
   * Mengatur struktur data dan transaksi persistensi.
   * Menerapkan paradigma *Object-Oriented Programming* (OOP) dengan hierarki pewarisan kelas: kelas abstrak `User` diturunkan menjadi `AdminUser`, `PetugasLapanganUser`, dan `MasyarakatUser`.
   * Menjembatani pembacaan dan penyimpanan koleksi `wilayah`, `pasar`, `kategori`, `satuan`, `komoditas`, `riwayat_harga`, dan `log_aktivitas`.
2. **View (`views/`):**
   * Bertanggung jawab menyusun antarmuka visual dinamis, rendering komponen HTML, serta menangani *event listener* interaksi pengguna.
   * Terdiri dari komponen modular seperti `NavbarView`, `ModalLoginView`, `KatalogView`, `LaporanView`, `FormInputView`, `KelolaDataView`, dan `RekapLogView`.
3. **Controller (`controllers/`):**
   * Memproses logika bisnis, validasi input, penerapan skenario alternatif/kegagalan (misalnya komoditas tidak ditemukan, data duplikat, atau input di luar batas wajar), serta mengorkestrasi interaksi antara Model dan View.
4. **Router & Role Guard (`js/router.js`):**
   * Mengontrol navigasi antar-tampilan halaman dan menjaga keamanan rute internal berdasarkan sesi peran pengguna yang tersimpan di `UserModel`.

### Stack Teknologi
* **Markup & Core Language:** Native HTML5, Modern Vanilla JavaScript (ES6 Modules: `import` / `export`).
* **Styling & Icons:** 
  * [Tailwind CSS CDN](https://cdn.tailwindcss.com) — framework CSS utility-first untuk desain responsif dan bersih.
  * [Lucide Icons](https://unpkg.com/lucide@latest) — library ikon vektor modern.
  * Custom CSS (`assets/css/style.css`) — konfigurasi font Plus Jakarta Sans, scrollbar kustom, animasi toast, dan styling cetak media print (`@media print`).
* **Visualisasi Data:** [Chart.js CDN](https://cdn.jsdelivr.net/npm/chart.js) — grafik multi-garis responsif untuk visualisasi fluktuasi harga.
* **Backend & Database:**
  * [Firebase App & Firestore SDK v10.12.2](https://firebase.google.com/docs/firestore) — database NoSQL dokumen berbasis cloud untuk sinkronisasi real-time.
  * *Dual-Engine Storage Adapter:* Dilengkapi adapter otomatis ke `localStorage` browser sehingga aplikasi dapat langsung diuji secara lokal tanpa ketergantungan konfigurasi awal.

---

## 4. Struktur Folder Proyek

```text
sipakar/
├── assets/
│   ├── css/
│   │   └── style.css            # Pengaturan font, scrollbar, toast animation, dan print view
│   └── img/
│       └── logo.svg              # Logo vektor resmi aplikasi SIPAKAR
├── config/
│   ├── firebase.js              # DatabaseAdapter: penghubung Firestore SDK & fallback LocalStorage
│   └── seeder.js                # Inisialisasi data dummy awal pasar, komoditas, & riwayat harga
├── controllers/
│   ├── AuthController.js        # Logika login, audit session, pemeriksaan peran pengguna
│   ├── DataController.js        # Operasi CRUD data master beserta validasi kelengkapan & duplikasi
│   ├── HargaController.js       # Validasi rentang harga wajar, pencatatan waktu, & simpan survei
│   ├── KatalogController.js     # Pengolahan matriks komparasi harga, pencarian, & perhitungan KPI
│   └── LaporanController.js     # Agregasi data deret waktu untuk grafik fluktuasi harga Chart.js
├── js/
│   ├── app.js                   # Entry point aplikasi, bootstrap seeder, & inisialisasi router
│   └── router.js                # Router internal & Role Guard hak akses halaman
├── models/
│   ├── HargaModel.js            # Abstraksi data riwayat transaksi harga komoditas
│   ├── LogModel.js              # Abstraksi pencatatan riwayat audit aktivitas sistem
│   ├── MasterDataModel.js       # Operasi data entitas wilayah, pasar, kategori, satuan, komoditas
│   └── UserModel.js             # Kelas OOP pengguna (User, Admin, Petugas, Masyarakat) & kredensial
├── views/
│   ├── components/
│   │   ├── ModalLoginView.js    # Modal dialog login interaktif & tombol uji akun demo cepat
│   │   └── NavbarView.js        # Navigasi atas responsif yang beradaptasi sesuai role pengguna
│   ├── FormInputView.js         # Tampilan formulir input harga harian & riwayat survei petugas
│   ├── KatalogView.js           # Tampilan katalog harga publik, pencarian, filter, & kartu KPI
│   ├── KelolaDataView.js        # Tampilan panel admin untuk manajemen data master (5 entitas)
│   ├── LaporanView.js           # Tampilan analisis grafik fluktuasi harga Chart.js & filter tanggal
│   └── RekapLogView.js          # Tampilan rekapitulasi pasaran (ekspor CSV/cetak) & log aktivitas
├── index.html                   # Halaman HTML tunggal sebagai wadah eksekusi SPA
├── package-lock.json            # Berkas penanda dependensi lock
└── README.md                    # Dokumentasi komprehensif sistem SIPAKAR
```

### Penjelasan Folder Utama:
* `assets/`: Menyimpan aset statis berupa berkas lembar gaya kustom (`css/`) dan logo grafis vektor (`img/`).
* `config/`: Berisi konfigurasi adapter basis data (`firebase.js`) dan skrip pembuat data awal (*seeder* otomatis).
* `controllers/`: Menyimpan modul pengendali alur bisnis, pemrosesan validasi, dan koordinasi pertukaran data.
* `js/`: Berisi skrip inisialisasi utama aplikasi (`app.js`) serta pengatur rute dan hak akses (`router.js`).
* `models/`: Berisi modul struktur data, definisi kelas objek pengguna, dan pemanggilan adapter basis data.
* `views/`: Berisi antarmuka pengguna berbasis komponen modular untuk masing-masing modul layar tampilan.

---

## 5. Prasyarat & Persiapan Lingkungan

Sebelum menjalankan aplikasi, pastikan lingkungan kerja memenuhi kebutuhan berikut:

1. **Peramban Web Modern (*Modern Web Browser*):**
   * Google Chrome (versi 80+), Microsoft Edge (versi 80+), Mozilla Firefox (versi 75+), atau Safari (versi 13.1+).
   * Peramban wajib mendukung fitur **ES6 Modules** (`import` / `export`) secara bawaan.
2. **Koneksi Jaringan Internet:**
   * Dibutuhkan saat pemuatan awal untuk mengunduh pustaka pihak ketiga via CDN (Tailwind CSS, Chart.js, Lucide Icons, dan modul Firebase jika mode cloud aktif).
3. **Web Server Lokal (Local HTTP Server):**
   * Karena aplikasi menggunakan arsitektur modular JavaScript (`<script type="module">`), peramban menerapkan kebijakan keamanan CORS yang **membatasi pemuatan modul langsung via protokol `file://`**.
   * Diperlukan server web lokal sederhana (misalnya ekstensi **VS Code Live Server** atau server CLI berbasis Python/Node.js).

---

## 6. Panduan Konfigurasi Firebase & Basis Data

SIPAKAR dirancang secara cerdas dengan fitur **Dual-Engine Storage Adapter**:
* **Mode Default (Offline / LocalStorage):** Nilai `USE_FIREBASE = false`. Aplikasi langsung menggunakan *LocalStorage* terstruktur tanpa membutuhkan konfigurasi Firebase apa pun. Sangat praktis untuk presentasi lokal dan pengujian cepat.
* **Mode Cloud (Firebase Firestore):** Nilai `USE_FIREBASE = true`. Mengaktifkan sinkronisasi cloud real-time menggunakan layanan resmi Google Cloud Firestore.

### A. Menyiapkan Proyek di Firebase Console
Jika ingin menghubungkan ke Google Firebase Firestore:
1. Buka [Firebase Console](https://console.firebase.google.com/) dan masuk menggunakan akun Google Anda.
2. Klik **Add project** (Tambah Proyek), beri nama proyek (misal: `sipakar-app`), lalu ikuti panduan hingga selesai.
3. Pada panel sebelah kiri, pilih **Build** > **Firestore Database**, lalu klik **Create database**.
4. Pilih lokasi server database terdekat (misal: `asia-southeast2` Jakarta), lalu pilih aturan awal **Start in test mode** untuk keperluan pengembangan.
5. Daftarkan aplikasi web dengan mengklik ikon **Web (`</>`)** di halaman Overview Proyek. Masukkan nama aplikasi web, lalu Anda akan mendapatkan objek konfigurasi `firebaseConfig`.

### B. Pengisian Kunci Konfigurasi pada `config/firebase.js`
Buka berkas `config/firebase.js` dan sesuaikan nilainya:

```javascript
// Ubah menjadi true untuk mengaktifkan koneksi cloud
const USE_FIREBASE = true;

// Masukkan kredensial proyek Firebase Anda
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "sipakar-app.firebaseapp.com",
  projectId: "sipakar-app",
  storageBucket: "sipakar-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### C. Menjalankan Skrip Seeder Awal (`config/seeder.js`)
SIPAKAR dilengkapi skrip *auto-seeding* cerdas yang otomatis berjalan saat aplikasi dibuka pertama kali (`app.js`):
1. **Pengecekan Otomatis:** Jika koleksi `komoditas` masih kosong, fungsi `seedInitialData(false)` akan langsung mengisi:
   * 2 Wilayah: Kota Tasikmalaya dan Kabupaten Ciamis.
   * 4 Pasar Tradisional: Pasar Cikurubuk, Pasar Pancasila, Pasar Padayungan, dan Pasar Manis Ciamis.
   * 5 Kategori Pangan & 3 Satuan Ukuran standar.
   * 10 Komoditas Bahan Pokok (Beras Medium, Beras Premium, Cabai Merah, Cabai Rawit, Bawang Merah, Bawang Putih, Daging Ayam, Telur Ayam, Minyak Goreng, Gula Pasir).
   * Data historis pergerakan harga selama **7 hari terakhir (H-6 s.d. hari ini)** untuk 4 pasar sehingga grafik dan tabel langsung terisi lengkap.
   * Log inisialisasi sistem perdana.
2. **Cara Reset Data Dummy:**
   * Jika menggunakan **LocalStorage**: Buka *Developer Tools* browser (F12) > tab *Application* > *Local Storage* > klik kanan pada domain dan pilih *Clear*, atau jalankan perintah `localStorage.clear()` di konsol, lalu *refresh* halaman.
   * Jika ingin memaksakan reset melalui kode: Panggil `seedInitialData(true)` pada konsol peramban.

---

## 7. Cara Menjalankan Aplikasi

Ikuti langkah-langkah mudah berikut untuk menjalankan SIPAKAR pada komputer lokal Anda:

### Metode 1: Menggunakan VS Code Live Server (Direkomendasikan)
1. Buka folder proyek `sipakar` di **Visual Studio Code**.
2. Pastikan ekstensi **Live Server** (oleh *Ritwick Dey*) telah terpasang melalui menu *Extensions* (`Ctrl + Shift + X`).
3. Buka file `index.html`.
4. Klik kanan di area kode `index.html` dan pilih opsi **"Open with Live Server"**, atau klik tombol **"Go Live"** pada bilah status di pojok kanan bawah jendela VS Code.
5. Peramban default Anda akan otomatis terbuka di alamat `http://127.0.0.1:5500/` atau `http://localhost:5500/`.

### Metode 2: Menggunakan Terminal / Command Line
Jika Anda tidak menggunakan VS Code, gunakan server HTTP bawaan bahasa pemrograman yang ada pada komputer:

* **Menggunakan Python 3:**
  ```powershell
  # Buka terminal di dalam direktori proyek sipakar
  python -m http.server 5500
  ```
  Lalu buka peramban di `http://localhost:5500`.

* **Menggunakan Node.js:**
  ```powershell
  # Menjalankan server instan menggunakan npx
  npx serve .
  ```

### Kredensial Akun Pengujian (Demo Accounts)
Untuk menguji fitur yang membutuhkan otentikasi peran, sistem telah menyediakan akun demo terdaftar (tersedia juga tombol jalan pintas isi otomatis pada modal login):

| Peran (*Role*) | Username | Password | Hak Akses Halaman |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Akses penuh seluruh sistem, kelola data master, rekap, & log |
| **Petugas Lapangan** | `petugas` | `petugas123` | Akses katalog, laporan fluktuasi, dan input survei harga harian |
| **Masyarakat** | *(Tanpa Login)* | *(Tanpa Login)* | Akses publik katalog harga dan laporan grafik fluktuasi harga |

---

## 8. Tabel Alur Rute & Hak Akses

Aplikasi menggunakan sistem navigasi dinamis berbasis *State Routing* dan *Role Guard* pada `js/router.js`:

| State / ID Rute | Representasi Hash / Navigasi | Fungsi Halaman / Tampilan | Hak Akses (*Allowed Roles*) | Mekanisme & Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `katalog` | `#/` atau `#/katalog` | Katalog harga bahan pokok harian, matriks perbandingan harga antar pasar, pencarian, dan indikator KPI | Publik (Masyarakat), Petugas, Admin | Halaman utama default (*landing page*). Dapat diakses tanpa login. |
| `laporan` | `#/laporan` | Visualisasi grafik tren fluktuasi harga (Chart.js) dan tabel historis berdasarkan rentang tanggal | Publik (Masyarakat), Petugas, Admin | Dapat diakses bebas oleh masyarakat untuk analisis tren harga. |
| `input-harga` | `#/petugas/input` atau `#/input-harga` | Formulir survei input harga harian komoditas per pasar dan tabel riwayat input petugas | Petugas Lapangan, Admin | Dilindungi *Role Guard*. Pengguna non-petugas dialihkan otomatis ke katalog. |
| `kelola-data` | `#/admin/kelola-data` | Panel manajemen data master (CRUD Wilayah, Pasar, Kategori, Satuan, dan Komoditas) | Admin Sistem | Khusus Administrator. Mencegah duplikasi data master melalui controller. |
| `rekap` | `#/admin/rekap` | Ringkasan matriks pasaran administratif dengan tombol Ekspor CSV dan Cetak Laporan (*Print*) | Admin Sistem | Menghasilkan berkas `.csv` dan tata letak cetak ramah kertas (*print friendly*). |
| `log` | `#/admin/log` | Tampilan rekap jejak audit log aktivitas autentikasi, input harga, dan perubahan data master | Admin Sistem | Memantau seluruh aktivitas pengguna secara berurutan (*chronological audit trail*). |
| *Modal Login* | *(Modal Overlay)* | Dialog otentikasi kredensial pengguna internal dan tombol uji coba akun demo cepat | Publik (Belum Login) | Dipicu melalui tombol "Login Petugas / Admin" pada bilah navigasi atas. |

---

## 9. Catatan Keamanan & Batasan Sistem

Aplikasi ini dirancang sebagai purwarupa fungsional untuk tugas Rekayasa Perangkat Lunak (RPL). Harap perhatikan catatan teknis dan rekomendasi keamanan berikut:

### 1. Validasi Input & Hak Akses di Sisi Klien (*Client-Side Validation*)
* Seluruh pemeriksaan validasi — seperti batasan kewajaran harga (`Rp 500 – Rp 500.000` pada `HargaController.js`), keunikan data master pada `DataController.js`, dan pembatasan rute pada `router.js` — diproses pada lapisan peramban (*client-side*).
* Penyimpanan sesi aktif pengguna menggunakan objek `localStorage` melalui `UserModel.js`.

### 2. Batasan Penyimpanan Mode Offline (LocalStorage)
* Pada mode bawaan (`USE_FIREBASE = false`), data yang diinputkan hanya tersimpan di dalam penyimpanan lokal peramban (*browser storage*) masing-masing pengguna dan tidak tersinkronisasi antar perangkat yang berbeda.

### 3. Rekomendasi Keamanan Lingkungan Produksi (*Production Security Rules*)
Jika aplikasi hendak dideploy ke lingkungan produksi menggunakan Google Cloud Firestore, **wajib** menambahkan aturan keamanan (*Firestore Security Rules*) pada konsol Firebase untuk mencegah manipulasi data sepihak dari konsol peramban:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Publik diperbolehkan membaca data katalog, pasar, komoditas, dan riwayat
    match /{document=**} {
      allow read: if true;
    }
    
    // Penginputan riwayat harga hanya boleh dilakukan oleh akun terotentikasi (Petugas/Admin)
    match /riwayat_harga/{hargaId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Data master dan audit log hanya boleh dimodifikasi oleh Admin
    match /wilayah/{id} { allow write: if request.auth != null && request.auth.token.role == 'admin'; }
    match /pasar/{id} { allow write: if request.auth != null && request.auth.token.role == 'admin'; }
    match /kategori/{id} { allow write: if request.auth != null && request.auth.token.role == 'admin'; }
    match /satuan/{id} { allow write: if request.auth != null && request.auth.token.role == 'admin'; }
    match /komoditas/{id} { allow write: if request.auth != null && request.auth.token.role == 'admin'; }
    match /log_aktivitas/{logId} { allow create: if true; allow update, delete: if false; }
  }
}
```

---

## 10. Kontribusi & Anggota Tim

Proyek **SIPAKAR** ini dikembangkan sebagai pemenuhan Tugas Besar Ujian Akhir Semester (UAS) Mata Kuliah **Rekayasa Perangkat Lunak (RPL)** — Program Studi Informatika, Fakultas Teknik, Universitas Siliwangi (UNSIL).

### Tim Pengembang (Kelompok Kelas CD Informatika):

* **[Nama Anggota 1 - NIM]** — *Project Manager & Fullstack Developer*
* **[Nama Anggota 2 - NIM]** — *Frontend UI/UX & Chart Visualizer*
* **[Nama Anggota 3 - NIM]** — *System Analyst & MVC Architecture Designer*
* **[Nama Anggota 4 - NIM]** — *Database Engineer & Technical Writer*

---

&copy; 2024 SIPAKAR Team &bull; Jurusan Informatika Universitas Siliwangi.
