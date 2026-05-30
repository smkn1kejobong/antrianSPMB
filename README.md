# SPMB 2026 - Sistem Antrian & Verifikasi Berkas

Sistem ini dibangun dengan **Google Apps Script** dan **Google Spreadsheet** untuk mengelola antrean pendaftaran, verifikasi berkas, pencarian peserta, dan cetak form.

## 📂 Struktur Proyek

- `Kode.gs`  
  Backend Apps Script. Mengatur routing halaman, membaca/mengubah `Settings`, menulis data ke `DataAntrian`, membaca `DataJurusan`, serta menyediakan API untuk pencarian dan batch print.

- `Index.html`  
  Halaman utama pendaftaran antrian. Menampilkan formulir calon peserta, pilihan jurusan, nomor antrian, loket, sesi, dan preview cetak/verifikasi.

- `Admin.html`  
  Panel konfigurasi untuk mengatur `namaSekolah`, `footerTeks`, `tanggalMulai`, `kuotaHarian`, dan `jumlahOperator`.

- `SearchByNISN.html`  
  Halaman pencarian data antrian berdasarkan NISN, dengan tampilan form verifikasi yang bisa dicetak.

- `BatchPrint.html`  
  Halaman daftar seluruh antrian, dengan preview per peserta, cetak per peserta, cetak semua, dan paginasi.

---

## 📊 Struktur Spreadsheet yang Diperlukan

### 1. `Settings`

Sheet ini digunakan oleh `Admin.html` dan `Kode.gs`.

| A              | B                                  |
| -------------- | ---------------------------------- |
| tanggalMulai   | 2026-06-01                         |
| kuotaHarian    | 100                                |
| jumlahOperator | 4                                  |
| namaSekolah    | SMK Negeri 2 Purwodadi             |
| footerTeks     | SPMB 2026 - SMK Negeri 2 Purwodadi |

> `Settings` harus ada dan diisi dengan benar. Jika sheet ini tidak ditemukan, aplikasi akan gagal.

### 2. `DataJurusan`

Digunakan oleh `Index.html` untuk mengisi pilihan jurusan.

- Isi daftar jurusan mulai dari baris 2 di kolom B.
- Setiap baris satu jurusan.
- Jika sheet ini tidak ada, halaman pendaftaran akan error.

Contoh:

| B |
| --- |
| Teknik Otomotif |
| Teknik Komputer dan Jaringan |
| Teknik Elektronika |

### 3. `DataAntrian`

Sheet ini menyimpan semua data peserta yang mendaftar.

Header wajib minimal:

| Timestamp | NISN | NoHP | Nama | Asal | Tanggal | Nomor | KeyDate | Loket | Sesi | Jurusan1 | Jurusan2 | Jenis Kelamin | Tgl Lahir | NIK | Agama | Tempat Lahir | Alamat | Email | No KK | Penerima KIP | Nama Ortu | No HP Ortu | Konfirmasi |

> Data akan terisi otomatis dari `Index.html` saat peserta menyelesaikan pendaftaran.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Buat Spreadsheet dan Sheet

Buat spreadsheet baru di Google Drive dan pastikan sheet berikut tersedia:
- `Settings`
- `DataJurusan`
- `DataAntrian`

### 2. Upload file ke Google Apps Script

Di spreadsheet:
1. Buka **Extensions > Apps Script**
2. Upload/masukkan file:
   - `Kode.gs`
   - `Index.html`
   - `Admin.html`
   - `SearchByNISN.html`
   - `BatchPrint.html`

### 3. Konfigurasi Spreadsheet ID

Di `Kode.gs`, ganti:

```javascript
SpreadsheetApp.openById("SPREADSHEET_ID")
```

Dengan ID spreadsheet Anda.

Contoh URL spreadsheet:

```text
https://docs.google.com/spreadsheets/d/1ABCDEF123456789/edit
```

### 4. Deploy Web App

1. Klik **Deploy > New deployment**
2. Pilih **Web app**
3. Atur:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Klik **Deploy**
5. Salin URL deployment

---

## 🧭 Akses Halaman Aplikasi

- Halaman pendaftaran: `https://.../exec`
- Halaman admin: `https://.../exec?page=admin`
- Halaman pencarian NISN: `https://.../exec?page=searchbynisn`
- Halaman batch print: `https://.../exec?page=batchprint`

---

## 📝 Cara Pakai Tiap Halaman

### Halaman utama (`Index.html`)

Peserta mengisi formulir pendaftaran dengan data seperti:
- Nama lengkap
- NISN (10 digit)
- Pilihan jurusan utama dan alternatif
- Jenis kelamin
- Tempat dan tanggal lahir
- NIK
- Agama
- Alamat
- Email
- Nomor HP
- Sekolah asal
- No KK
- Status penerima KIP
- Nama orang tua/wali
- No HP orang tua/wali
- Konfirmasi persetujuan

Setelah submit, sistem:
- memvalidasi NISN unik
- menentukan nomor antrian harian
- membagi ke loket operator
- menetapkan sesi berdasarkan urutan
- menyiapkan preview cetak form verifikasi

### Panel admin (`Admin.html`)

Digunakan untuk mengubah:
- `namaSekolah`
- `footerTeks`
- `tanggalMulai`
- `kuotaHarian`
- `jumlahOperator`

Perubahan disimpan ke sheet `Settings`.

### Cari NISN (`SearchByNISN.html`)

Masukkan NISN peserta untuk menampilkan data antrian dan form verifikasi.
Halaman ini menampilkan kembali detail seperti jurusan, sekolah asal, loket, dan sesi.

### Batch print (`BatchPrint.html`)

Menampilkan daftar peserta yang sudah tercatat.
Fitur yang tersedia:
- preview data per peserta
- cetak per peserta
- cetak semua
- paginasi daftar

---

## ⚠️ Catatan Penting

- `Settings` harus selalu ada dan valid.
- `DataJurusan` diperlukan untuk halaman pendaftaran.
- `DataAntrian` adalah sumber data utama untuk semua pencarian dan cetak.
- `Admin.html` hanya mengubah `Settings`, bukan data antrean.
- NISN tidak boleh terdaftar dua kali.
- Tanggal mulai, kuota harian, dan jumlah operator memengaruhi perhitungan nomor antrian, sesi, dan pembagian loket.

---

## 💻 Teknologi yang Digunakan

- Google Apps Script
- Google Spreadsheet
- HTML, CSS, JavaScript
- Google Web App
