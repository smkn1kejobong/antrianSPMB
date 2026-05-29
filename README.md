# ?? SPMB 2026 - Sistem Antrian & Verifikasi Berkas

Sistem ini dibangun dengan **Google Apps Script** dan **Google Spreadsheet** untuk mengelola antrian pendaftaran, pencarian peserta, panel admin, dan cetak verifikasi.

## ?? Komponen Aplikasi

- `Kode.gs`  
  Backend Apps Script. Mengatur routing halaman, membaca/mengubah `Settings`, menulis data ke `DataAntrian`, serta menyediakan pencarian dan batch print.

- `Index.html`  
  Halaman utama untuk calon peserta. Menangani form pendaftaran antrian, nomor antrian, loket, sesi, dan preview cetak.

- `Admin.html`  
  Panel konfigurasi untuk mengatur nama sekolah, footer, tanggal mulai, kuota harian, dan jumlah operator.

- `SearchByNISN.html`  
  Halaman pencarian berdasarkan NISN untuk menampilkan data antrian dan mencetak ulang form.

- `BatchPrint.html`  
  Halaman daftar antrian dengan preview per peserta, cetak per peserta, cetak semua, dan paginasi.

---

## ?? Struktur Spreadsheet

Buat spreadsheet baru, lalu buat dua sheet berikut:

### 1. `Settings`

Isi nilai di kolom B sesuai berikut:

| A              | B                                  |
| -------------- | ---------------------------------- |
| tanggalMulai   | 2026-06-01                         |
| kuotaHarian    | 100                                |
| jumlahOperator | 4                                  |
| namaSekolah    | SMK Negeri 2 Purwodadi             |
| footerTeks     | SPMB 2026 - SMK Negeri 2 Purwodadi |

### 2. `DataAntrian`

Header wajib:

| Timestamp | NISN | NoHP | Nama | Asal | Tanggal | Nomor | KeyDate | Loket | Sesi |

Data akan otomatis ditambahkan saat peserta mengambil nomor antrian.

---

## ?? Cara Menjalankan Aplikasi

### 1. Buat Spreadsheet dan Sheet

Buat spreadsheet baru di Google Drive dan pastikan sheet `Settings` serta `DataAntrian` tersedia.

### 2. Upload Project ke Google Apps Script

Di spreadsheet:

1. Buka **Extensions ? Apps Script**
2. Upload file berikut ke project:
   - `Kode.gs`
   - `Index.html`
   - `Admin.html`
   - `SearchByNISN.html`
   - `BatchPrint.html`

### 3. Ganti Spreadsheet ID

Di `Kode.gs`, ganti nilai:

```javascript
SpreadsheetApp.openById("SPREADSHEET_ID")
```

Dengan ID spreadsheet Anda.

Contoh ID dari URL spreadsheet:

```text
https://docs.google.com/spreadsheets/d/1ABCDEF123456789/edit
```

ID yang dipakai: `1ABCDEF123456789`

### 4. Deploy Web App

1. Klik **Deploy ? New deployment**
2. Pilih **Web app**
3. Atur:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Klik **Deploy**
5. Salin URL deployment

---

## ??? Cara Penggunaan

### Halaman utama antrian

Buka URL deployment untuk membuka halaman antrean.

Form peserta akan:
- menerima `NISN`, `NoHP`, `Nama`, dan `Asal Sekolah`
- menyimpan data ke `DataAntrian`
- menghitung nomor antrian berdasarkan kuota harian
- menentukan operator/loket berdasarkan jumlah operator
- menampilkan nomor antrian, loket, dan sesi
- menampilkan preview cetak form verifikasi

### Admin panel

Tambah parameter `page=admin` pada URL deployment:

```text
?page=admin
```

Contoh:

```text
https://script.google.com/macros/s/AKfycbxxxx/exec?page=admin
```

Panel ini digunakan untuk mengubah konfigurasi sekolah dan kuota harian.

### Cari data berdasarkan NISN

Tambah parameter `page=searchbynisn` pada URL deployment:

```text
?page=searchbynisn
```

Masukkan NISN untuk mencari peserta yang sudah tercatat.

### Batch print

Tambah parameter `page=batchprint` pada URL deployment:

```text
?page=batchprint
```

Halaman ini menampilkan seluruh data antrian dan mendukung:
- preview per peserta
- cetak per peserta
- cetak semua
- paginasi daftar

---

## ?? Alur Data

1. Peserta mengisi formulir di `Index.html`
2. `Kode.gs` menjalankan `daftarAntrian()`
3. Data disimpan ke sheet `DataAntrian`
4. Nomor antrian, loket, dan sesi dikembalikan ke halaman
5. Data dapat dicari melalui `SearchByNISN.html`
6. `BatchPrint.html` menampilkan dan mencetak data dari `DataAntrian`

---

## ?? Catatan Penting

- `Settings` harus selalu terisi dengan nilai valid agar perhitungan kuota dan operator berjalan.
- `DataAntrian` adalah sumber data utama untuk pencarian, preview, dan cetak.
- `Admin.html` hanya mengubah `Settings`, bukan data antrean.
- Pastikan antrian sudah tercatat sebelum melakukan pencarian atau batch print.

---

## ? Contoh URL Aplikasi

```text
https://script.google.com/macros/s/AKfycbxxxx/exec
https://script.google.com/macros/s/AKfycbxxxx/exec?page=admin
https://script.google.com/macros/s/AKfycbxxxx/exec?page=searchbynisn
https://script.google.com/macros/s/AKfycbxxxx/exec?page=batchprint
```

---

## ?? Teknologi yang Digunakan

- Google Apps Script
- Google Spreadsheet
- HTML, CSS, JavaScript
- Google Web App
