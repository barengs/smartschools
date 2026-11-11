# Blueprint Pengembangan Modul E-PPDB & Buku Induk Digital
## Ekosistem Smart School Terintegrasi (Ekstensi Blueprint v1.1)

**Tanggal:** 11 November 2026  
**Dokumen Induk:** [ARSITEKTUR_PENGEMBANGAN_SMARTSCHOOL.md](ARSITEKTUR_PENGEMBANGAN_SMARTSCHOOL.md)  
**Write Owner Utama:** Service A — Core ERP (`services/core-erp`, Node.js/NestJS)  
**Integrasi Lintas Layanan:** Service B (Rust/Axum — CBT Placement Test, RFID, Wallet) & Service C (Python/FastAPI — Auto-Placement & Analitik)

---

## 1. Tujuan & Posisi dalam Arsitektur SSOT

Modul **E-PPDB** dan **Buku Induk Digital** adalah gerbang hulu siklus hidup data peserta didik di dalam ekosistem Smart School. Seluruh data yang masuk saat pendaftaran calon siswa harus mengalir secara atomik—tanpa input ulang (*zero re-entry*)—menjadi arsip legal sekolah permanen (**Buku Induk**), siap sinkron **Dapodik/EMIS**, serta langsung mengaktifkan layanan operasional harian (LMS, CBT, Presensi RFID, Dompet Kantin Cashless, dan Parent Super-App).

```text
[Portal E-PPDB Publik] ──► [Verifikasi & Revisi Berkas] ──► [Seleksi / CBT Placement (Rust)]
                                                                       │
                                                                       ▼
[Alumni & Tracer Study] ◄── [Buku Induk Digital (SSOT)] ◄── [One-Click / Batch Migration]
        ▲                              │
        │                              ├──► SIAKAD, Rombel, E-Rapor TTE
        │                              ├──► LMS & CBT (Rust)
        │                              ├──► Kartu Pelajar RFID/QR + Dompet Kantin (Rust)
        │                              └──► E-BK, E-UKS, E-Library, Dapodik/EMIS Export
```

---

## 2. Gap Analysis: Implementasi Saat Ini vs Target Produksi

Berdasarkan kode yang telah dibangun pada Fase 1:

| Komponen | Sudah Tersedia Saat Ini | Celah (Gap) Menuju Blueprint Produksi |
| :--- | :--- | :--- |
| **Database E-PPDB** (`007_ppdb_applications.sql`) | Tabel `academic_lms.ppdb_applications` (registrasi, jalur, dokumen JSONB, status verifikasi, relasi `invoice_id`, `migrated_at`). | Belum ada tabel konfigurasi **gelombang/kuota**, **skor seleksi/jarak zonasi**, **status verifikasi per dokumen**, **waiting list**, dan **daftar ulang**. |
| **Database Buku Induk** (`002_iam_master.sql`, `003_academic_lms.sql`) | Tabel `iam_master.students`, `parents`, `student_parent_relations`, `identity_cards`, dan `classroom_members`. | Belum mencakup atribut lengkap standar **Dapodik/EMIS** (tempat lahir, agama, alamat rinci + koordinat, data terpisah Ayah/Ibu/Wali, asal sekolah/no. ijazah sebelumnya, status KIP/PIP), **histori rombel lintas tahun**, **mutasi masuk/keluar**, **kelulusan/alumni**, dan **pengajuan ubah data**. |
| **Backend E-PPDB** (`ppdb.service.ts`) | Registrasi publik + invoice opsional, presign & attach dokumen MinIO, verifikasi status global, **One-Click Migration** tunggal (NIS acak, akun orang tua, wallet, kartu RFID/QR, rombel). | Belum ada manajemen gelombang/kuota otomatis, verifikasi & revisi per dokumen, kalkulator skor zonasi/prestasi, integrasi hasil *Placement Test* Rust CBT, pengumuman terjadwal, *batch migration*, serta generator NIS berurutan. |
| **Backend & UI Buku Induk** (`siakad.service.ts`, `SiakadPage.tsx`) | Daftar & update dasar `students`, manajemen periode/rombel/mapel, dan endpoint JSON `exportDapodikReady()`. | Belum ada halaman detail **Lembar Buku Induk Siswa**, cetak PDF Buku Induk & Surat Keterangan ber-QR/TTE, alur mutasi/kenaikan kelas/kelulusan massal, impor Excel massal, dan *pre-flight validator* Dapodik/EMIS. |

---

## 3. Blueprint Fitur Modul E-PPDB

### 3.1 Konfigurasi Periode, Gelombang, Jalur, & Kuota
1. **Multi-Periode & Multi-Gelombang**: Dukungan pembukaan beberapa gelombang (Inden, Gelombang 1, Gelombang 2) dengan tanggal buka-tutup otomatis per fase (*Pendaftaran → Verifikasi → Tes Seleksi → Pengumuman → Daftar Ulang*).
2. **Daya Tampung & Kuota per Jalur**: Pengaturan kuota total per jenjang/jurusan dan persentase/jumlah per jalur (`ZONASI`, `PRESTASI`, `AFIRMASI`, `MUTASI`, `REGULER`, plus opsi jalur yayasan seperti *Tahfidz/Boarding/Beasiswa*).
3. **Matriks Dokumen Dinamis per Jalur**: Aturan wajib/opsional dokumen berbeda tiap jalur (mis. Zonasi wajib KK + koordinat domisili; Prestasi wajib piagam/sertifikat + rapor; Afirmasi wajib KIP/PKH/DTKS; Mutasi wajib surat pindah tugas orang tua).
4. **Konfigurasi Biaya & Beasiswa Pendaftaran**: Pengaturan biaya formulir dan daftar ulang (gratis/berbayar), dukungan kode voucher/keringanan (anak guru, yatim, prestasi), serta tenggat kadaluarsa tagihan.

### 3.2 Portal Pendaftaran Publik & Multi-Step Wizard
1. **Formulir Multi-Langkah + Save Draft**: Pengisian bertahap (Data Siswa → Data Orang Tua/Wali → Asal Sekolah & Jalur → Lokasi Zonasi → Unggah Berkas → Pembayaran) dengan fitur simpan sementara (*draft*) dan lanjutkan nanti.
2. **Pendaftaran Kolektif / Jalur Mitra**: Kemampuan Staf TU atau sekolah pengumpan (*feeder school*) mendaftarkan calon siswa secara kolektif.
3. **Peta Zonasi & Kalkulator Jarak Otomatis**: Pemilih titik koordinat rumah (*map picker*) dengan validasi radius dan perhitungan jarak Haversine otomatis terhadap koordinat sekolah.
4. **Unggah Berkas Aman (MinIO Presigned URL)**: Validasi ukuran & format file (`PDF`, `JPG`, `PNG`), kompresi pratinjau, dan penandaan kelengkapan berkas secara *real-time*.
5. **Duplicate Prevention Guard**: Pencegahan pendaftaran ganda menggunakan `NIK` / `NISN` pada tahun ajaran yang sama.

### 3.3 Pembayaran Formulir & Daftar Ulang (Integrasi E-Finance)
1. **Tagihan Otomatis (`PPDB_FEE` & `DAFTAR_ULANG_FEE`)**: Terbit di `finance_analytics.invoices` dengan VA/QRIS.
2. **Status Pembayaran Real-Time**: Webhook lunas (`InvoicePaid`) otomatis membuka kunci cetak Kartu Peserta Seleksi atau konfirmasi daftar ulang.
3. **Skema Cicilan & Keringanan Daftar Ulang**: Opsi pembayaran bertahap bagi calon siswa yang diterima serta pencatatan beasiswa/potongan biaya masuk.

### 3.4 Desk Verifikasi Berkas & Revisi Mandiri
1. **Split-View Verification Desk**: Panel Staf TU menampilkan data isian berdampingan dengan *document viewer* MinIO (tanpa perlu mengunduh file satu per satu).
2. **Status Verifikasi Granular per Dokumen**: Setiap berkas memiliki status (`PENDING`, `APPROVED`, `NEED_REVISION`, `REJECTED`) beserta catatan verifikator.
3. **Alur Revisi Tanpa Daftar Ulang**: Jika status aplikasi `NEED_REVISION`, pendaftar menerima notifikasi WhatsApp/Email/FCM beserta alasan spesifik dan dapat mengunggah ulang hanya dokumen yang ditolak.

### 3.5 Seleksi, Pembobotan Skor, & CBT Placement Test
1. **Mesin Pembobotan Jalur**:
   - *Zonasi*: Peringkat berdasarkan jarak terdekat, usia, dan waktu daftar (*tie-breaker*).
   - *Prestasi*: Kalkulasi otomatis rata-rata nilai rapor + bobot kejuaraan (tingkat Kecamatan/Kota/Provinsi/Nasional/Internasional).
2. **Placement Test & Tes Potensi (Service B — Rust CBT Engine)**:
   - Panitia menjadwalkan sesi ujian seleksi bagi pendaftar berstatus `VERIFIED`.
   - Siswa mengerjakan tes dengan nomor peserta PPDB melalui mesin CBT Rust yang tahan beban serentak; hasil `CbtExamSubmitted` otomatis masuk sebagai komponen nilai seleksi.
3. **Penilaian Non-CBT**: Input nilai wawancara orang tua/siswa, tes baca Al-Qur'an, atau observasi psikologi.
4. **Papan Peringkat & Simulasi Kuota**: Perankingan otomatis, penentuan status `ACCEPTED`, `WAITLISTED` (cadangan), atau `REJECTED`, serta pelimpahan sisa kuota antar jalur.

### 3.6 Pengumuman, Daftar Ulang, & Waiting List Otomatis
1. **Pengumuman Terjadwal (*Embargo Release*)**: Hasil kelulusan terkunci hingga waktu pengumuman resmi tiba, lalu tampil serentak di portal pendaftar beserta cetak **Surat Keterangan Lulus (SKL PPDB)** ber-QR verifikasi.
2. **Konfirmasi Daftar Ulang**: Pengisian ukuran seragam, persetujuan tata tertib bermeterai digital/unggah scan, dan pelunasan biaya masuk.
3. **Promosi Otomatis Cadangan (*Waiting List*)**: Jika pendaftar diterima mengundurkan diri atau melewati batas waktu daftar ulang, panitia dapat mempromosikan peringkat teratas dari `WAITLISTED`.

### 3.7 One-Click & Batch Migration ke Buku Induk
1. **Generator NIS Terstruktur**: Format NIS dapat dikonfigurasi (mis. `[YY][KodeJenjang][Urut4Digit]`) dan dijamin unik tanpa tabrakan.
2. **Migrasi Tunggal & Massal (Transaksi ACID)**:
   - Memindahkan data biodata, keluarga, alamat, dan riwayat sekolah asal ke tabel inti **Buku Induk**.
   - Mengubah status siswa `CANDIDATE` → `ACTIVE` dan mengaktifkan flag *wajib ganti password* saat login pertama.
   - Membentuk akun `ORANG_TUA` terpisah untuk Ayah/Ibu/Wali (menghindari duplikasi akun jika memiliki lebih dari 1 anak di sekolah yang sama).
   - Menginisialisasi `high_speed_ops.wallets` (dompet kantin) dan `iam_master.identity_cards` (kartu pelajar QR/RFID).
   - Menempatkan siswa ke rombel awal secara manual atau otomatis (*balanced grouping* berdasarkan skor *Placement Test* & gender).
   - Membekukan dokumen PPDB menjadi **Arsip Permanen Awal Buku Induk**.

### 3.8 Dashboard Panitia, Analitik, & Audit Trail
- Funnel konversi real-time (`DRAFT` → `SUBMITTED` → `VERIFIED` → `ACCEPTED` → `RE_REGISTERED` → `MIGRATED`).
- Peta sebaran asal sekolah (*feeder school*) dan grafik pemenuhan kuota per jalur/gelombang.
- Audit log lengkap untuk setiap aksi verifikasi, perubahan skor, perubahan status kelulusan, dan migrasi.

---

## 4. Blueprint Fitur Modul Buku Induk Digital

Di Indonesia, **Buku Induk Siswa** adalah arsip resmi sepanjang hayat siswa di sekolah yang wajib akurat secara administratif, legal, dan siap sinkron ke sistem nasional (**Dapodik Kemendikbudristek** / **EMIS Kemenag**).

### 4.1 Profil Induk Standar Dapodik / EMIS & Kependudukan
1. **Identitas Utama & Nomor Registrasi**:
   - `NIS` (Nomor Induk Siswa permanen sekolah), `NISN` (10 digit), `NIK` (16 digit), Nomor Kartu Keluarga (`NO_KK`), Nomor Registrasi Akta Kelahiran.
   - Nama lengkap sesuai akta, nama panggilan, tempat & tanggal lahir, jenis kelamin, agama, kewarganegaraan, status anak (kandung/tiri/angkat), anak ke-berapa, jumlah saudara, bahasa rumah, serta jenis kebutuhan khusus (inklusi/disabilitas).
2. **Alamat Domisili & Mobilitas**:
   - Alamat jalan, RT/RW, Dusun, Kelurahan/Desa, Kecamatan, Kab/Kota, Provinsi, Kode Pos, Lintang/Bujur.
   - Jenis tinggal (bersama orang tua, wali, kos, asrama/pesantren), moda transportasi, jarak ke sekolah (km), waktu tempuh (menit).
3. **Data Keluarga Terstruktur (Ayah, Ibu, Wali)**:
   - Pencatatan terpisah untuk **Ayah Kandung**, **Ibu Kandung** (krusial untuk validasi Dapodik/NISN), dan **Wali** (jika ada): Nama lengkap, NIK, tahun lahir, pendidikan terakhir, pekerjaan, rentang penghasilan bulanan, nomor HP/WA aktif, status hidup/meninggal, serta flag kontak utama & akses Parent Super-App.
   - Mendukung **1 Akun Orang Tua untuk Banyak Anak (Multi-Child Parent Link)**.
4. **Data Periodik Fisik, Kesehatan, & Kesejahteraan**:
   - Tinggi badan, berat badan, lingkar kepala (diperbarui per semester), golongan darah, riwayat penyakit, catatan alergi (terintegrasi langsung dengan modul **E-UKS**).
   - Kepemilikan kartu bantuan sosial: `KIP`, `KKS`, `PKH`, dan status kelayakan `PIP` beserta histori beasiswa.

### 4.2 Riwayat Pendidikan Awal & Brankas Arsip Legalitas
1. **Asal Pendidikan Sebelumnya**: Nama & NPSN sekolah asal, alamat sekolah asal, tanggal & nomor surat diterima, nomor seri Ijazah/SKHUN/SKL sebelumnya, dan status masuk (`SISWA_BARU` vs `PINDAHAN`).
2. **Brankas Arsip Dokumen Siswa (MinIO Private Bucket)**:
   - Menyimpan pas foto berkala (saat masuk & saat lulus/ijazah), Akta Kelahiran, Kartu Keluarga, KTP Orang Tua, Ijazah sebelumnya, Surat Pindah, Sertifikat Prestasi, dan Ijazah kelulusan.
   - Dilengkapi *document versioning*, tanggal kedaluwarsa (jika relevan), dan kontrol akses berbasis RBAC (*audit log* siapa yang melihat/mengunduh berkas kependudukan).

### 4.3 Manajemen NIS & Siklus Kartu Identitas (RFID / QR)
1. **Validasi & Penguncian Identitas**: Peringatan otomatis untuk NIK/NISN ganda atau format tidak valid.
2. **Manajemen Kartu Pelajar (`identity_cards`)**:
   - Cetak Kartu Pelajar fisik (desain depan-belakang dengan QR/Barcode & foto) serta Kartu Pelajar Digital di Student App.
   - Alur **Kartu Hilang / Penggantian RFID**: Staf TU memblokir `rfid_uid` lama (`LOST`/`BLOCKED`), menerbitkan `rfid_uid` baru, dan otomatis menginvalidasi cache Redis `iam:rfid:{rfid_uid}` agar kartu lama langsung ditolak di gerbang dan POS Kantin.

### 4.4 Rekam Jejak Pendidikan Lintas Tahun (Student 360° Timeline)
Satu halaman **Lembar Buku Induk Digital** menyatukan seluruh rekam jejak siswa selama bersekolah:
1. **Riwayat Penempatan Rombel**: Histori kelas per semester/tahun ajaran beserta nama Wali Kelas dan status akhir periode (`NAIK_KELAS`, `TINGGAL_KELAS`, `LULUS`, `PINDAH`).
2. **Transkrip Nilai & Arsip E-Rapor**: Matriks nilai rata-rata/akhir seluruh mata pelajaran lintas semester + tautan unduh PDF **E-Rapor ber-TTE**.
3. **Rekam Kehadiran & Skor Risiko EWS**: Ringkasan total Hadir, Terlambat, Sakit, Izin, Alfa per semester dari `high_speed_ops.attendances` dan tren skor risiko dari **Service C (EWS)**.
4. **Rekam Prestasi, Ekstrakurikuler, & Ringkasan Kedisiplinan**: Penghargaan lomba, keaktifan ekstrakurikuler, serta total poin prestasi/pelanggaran (catatan detail konseling **E-BK** tetap terenkripsi AES-256 dan hanya terbuka untuk `GURU_BK`).

### 4.5 Siklus Mutasi, Kenaikan Kelas, & Kelulusan Massal
1. **Mutasi Masuk (Siswa Pindahan)**:
   - Pendaftaran khusus siswa pindahan di tengah semester/tahun ajaran dengan unggah Surat Pindah sekolah asal, validasi rapor sebelumnya, pembuatan NIS baru, dan penempatan rombel aktif.
2. **Mutasi Keluar (Pindah Sekolah / Mengundurkan Diri / DO)**:
   - Mencatat tanggal keluar, alasan, sekolah tujuan, nomor surat pindah resmi.
   - Otomatis mengubah status siswa ke `TRANSFERRED` / `DROPPED`, mengeluarkan siswa dari rombel aktif periode berjalan, menonaktifkan `identity_cards` RFID/QR, dan memicu proses **penutupan/settlement saldo dompet kantin** jika masih tersisa.
   - Data historis di Buku Induk **tidak pernah dihapus** (*immutable archive*).
3. **Kenaikan Kelas Massal (*Batch Grade Promotion*)**:
   - Wizard akhir tahun ajaran bagi Waka Kurikulum / Staf TU: memetakan rombel asal (mis. `VII-A` → `VIII-A`) atau mengacak ulang komposisi kelas, sambil menyimpan riwayat kelas lama secara utuh.
4. **Kelulusan Massal & Transisi Alumni**:
   - Penetapan kelulusan massal tingkat akhir, pencatatan tanggal lulus, nomor SKL, nomor seri Ijazah, transkrip nilai akhir, perubahan status ke `GRADUATED`, penonaktifan RFID akses harian, dan pengaktifan akses portal **Alumni Tracer Study**.

### 4.6 Perubahan Data Mandiri (Self-Service Request + Approval TU)
- Orang tua/siswa dapat mengajukan koreksi biodata atau perpanjangan dokumen (mis. pindah domisili, pembaruan KK, ganti nomor HP) melalui Web/Parent App disertai unggahan bukti dukung.
- Perubahan data non-krusial (no. HP darurat, tinggi/berat badan) dapat diproses cepat, sedangkan perubahan **identitas legal** (Nama, NIK, NISN, Tempat/Tanggal Lahir, Nama Ibu Kandung) masuk antrean persetujuan **Staf TU / Operator Dapodik** dan tercatat di *change log*.

### 4.7 Generator Surat Resmi & Cetak Buku Induk
1. **Cetak Lembar Buku Induk Siswa (PDF)**: Output PDF berformat standar Buku Induk sekolah (per siswa atau kompilasi satu angkatan) yang memuat pas foto, biodata lengkap, data keluarga, riwayat mutasi, dan ringkasan nilai rapor tiap semester.
2. **Generator Surat Otomatis Ber-QR & TTE**:
   - Surat Keterangan Siswa Aktif (terhubung ke **Self-Service Kiosk** sekolah).
   - Surat Keterangan Kelakuan Baik.
   - Surat Keterangan Pindah / Mutasi Sekolah.
   - Surat Keterangan Lulus (SKL).
   - Setiap surat memiliki nomor urut otomatis dan QR Code verifikasi publik anti-pemalsuan.

### 4.8 Sinkronisasi Dapodik / EMIS & Impor-Ekspor Massal
1. **Wizard Impor Massal (Excel / CSV Template)**: Untuk onboarding awal data siswa lama tanpa PPDB, lengkap dengan validasi tipe data, deteksi duplikat NIK/NISN, dan laporan baris error.
2. **Pre-Flight Completeness Validator**: Dasbor kelengkapan data Buku Induk (menampilkan persentase kelengkapan dan daftar siswa dengan NIK/NISN kosong, akta belum diunggah, atau data ibu kandung belum lengkap).
3. **Ekspor Siap Dapodik / EMIS (`XLSX` / `CSV` / `JSON`)**: Pemetaan kolom sesuai template resmi Peserta Didik Dapodik/EMIS, termasuk filter per tingkat/rombel/status mutasi.

---

## 5. Rancangan Ekstensi Skema Database (`infra/migrations/`)

Penambahan tabel berikut tetap mematuhi aturan **Single Migration Authority** dan **Write Ownership** (ditulis oleh Service A Node.js):

| Skema | Tabel Baru / Ekstensi | Fungsi Utama |
| :--- | :--- | :--- |
| `academic_lms` | `ppdb_waves` | Periode gelombang pendaftaran, tanggal mulai-selesai setiap fase, biaya formulir & daftar ulang. |
| `academic_lms` | `ppdb_quotas` | Kuota daya tampung per `wave_id`, jenjang/jurusan, dan `admission_track`. |
| `academic_lms` | `ppdb_application_documents` | Status verifikasi granular per dokumen (`PENDING`, `APPROVED`, `NEED_REVISION`, `REJECTED`), catatan reviewer, dan `object_key` MinIO. |
| `academic_lms` | `ppdb_scores` | Skor komponen seleksi (jarak zonasi Haversine, nilai rapor, poin prestasi, nilai CBT Placement dari Rust, wawancara, total bobot, peringkat). |
| `iam_master` | `student_profiles` *(1:1 `students`)* | Atribut lengkap Dapodik/EMIS: tempat lahir, agama, nomor KK, no. akta, anak ke, jumlah saudara, alamat rinci + koordinat, transportasi, status KIP/PIP/PKH, data sekolah asal, nomor ijazah masuk & lulus. |
| `iam_master` | `parents` *(ekstensi)* & `student_parent_relations` | Penambahan NIK, tahun lahir, pendidikan terakhir, pekerjaan, rentang penghasilan, status hidup (`ALIVE`/`DECEASED`) agar data Ayah, Ibu, dan Wali sesuai standar Dapodik. |
| `academic_lms` | `student_enrollments` *(evolusi/riwayat rombel)* | Riwayat penempatan rombel per `academic_period_id` dengan `enrollment_status` (`ACTIVE`, `PROMOTED`, `RETAINED`, `GRADUATED`, `TRANSFERRED`). |
| `iam_master` | `student_mutations` | Log resmi mutasi masuk, mutasi keluar, kelulusan, dan pengunduran diri (`mutation_type`, nomor surat, sekolah asal/tujuan, tanggal efektif, alasan, file surat PDF). |
| `iam_master` | `student_data_change_requests` | Antrean pengajuan perubahan biodata dari orang tua/siswa beserta bukti dukung dan status persetujuan Staf TU. |
| `academic_lms` | `official_letters` | Registrasi nomor surat otomatis, jenis surat, QR verification token, TTE hash, dan tautan PDF di MinIO. |

---

## 6. Kontrak Event, Integrasi Antar-Layanan, & RBAC

### 6.1 Redis Streams Events Tambahan
Melengkapi `contracts/events.schema.json`:
- `PpdbDocumentRevisionRequested` → Worker notifikasi mengirim WA/Email berisi daftar berkas yang perlu diperbaiki.
- `PpdbResultPublished` → Notifikasi hasil seleksi & tautan SKL PPDB.
- `StudentMigrated` *(sudah ada, diperluas)* → Trigger pembuatan/invalidasi cache RFID di Service B (Rust) dan pengelompokan awal.
- `StudentCardReplaced` → Service B (Rust) menghapus cache `iam:rfid:{old_uid}` dan mengaktifkan `iam:rfid:{new_uid}`.
- `StudentMutatedOut` / `StudentGraduated` → Service B (Rust) memblokir akses RFID gerbang dan menandai dompet siap *settlement*.

### 6.2 Matriks Akses (RBAC)

| Peran | Hak Akses E-PPDB | Hak Akses Buku Induk |
| :--- | :--- | :--- |
| `SUPER_ADMIN` / `STAF_TU` | Konfigurasi gelombang/kuota, verifikasi berkas, input nilai wawancara, cetak SKL, migrasi 1-klik & batch. | CRUD lengkap Buku Induk, impor/ekspor Dapodik/EMIS, mutasi, cetak Buku Induk & surat, approval ubah data. |
| `KEPALA_SEKOLAH` | Monitoring dashboard funnel, persetujuan kuota/kelulusan final, tanda tangan SKL (TTE). | Read-only Buku Induk 360°, statistik kelengkapan, persetujuan/TTE surat & ijazah. |
| `WAKA_KURIKULUM` | Penempatan rombel awal & pengaturan tes peminatan. | Kenaikan kelas massal, penempatan rombel, transkrip nilai lintas semester. |
| `BENDAHARA` | Pengaturan tarif formulir/daftar ulang, pemberian keringanan/beasiswa, rekonsiliasi bayar. | Cek status tagihan & settlement saldo dompet siswa mutasi/lulus. |
| `GURU` / `WALI_KELAS` | — | Read-only biodata dasar & data kontak orang tua siswa di kelas ampuannya. |
| `ORANG_TUA` / `SISWA` | Pendaftaran, unggah/revisi berkas, bayar formulir, ikut CBT Placement, daftar ulang. | Lihat profil Buku Induk pribadi, unduh surat aktif/E-Rapor, ajukan permohonan ubah data. |

---

## 7. Peta Jalan Eksekusi Bertahap (Dari MVP Saat Ini)

1. **Tahap 1 — Penguatan Skema & Biodata Dapodik (Sprint A)**:
   - Tambah migrasi SQL untuk `student_profiles`, ekstensi `parents`, `ppdb_waves`, `ppdb_quotas`, dan `ppdb_application_documents`.
   - Perbarui form E-PPDB Publik menjadi *Multi-Step Wizard* + penyimpanan *Draft*.
2. **Tahap 2 — Seleksi Cerdas, Revisi Berkas, & Generator NIS (Sprint B)**:
   - Implementasi verifikasi granular per dokumen + alur revisi mandiri.
   - Integrasi skor jarak zonasi, poin prestasi, dan hasil *Placement Test* dari **Service B (Rust CBT)**.
   - Implementasi generator NIS berurutan, *Waiting List*, dan *Batch Migration*.
3. **Tahap 3 — Buku Induk 360°, Mutasi, & Cetak Legalitas (Sprint C)**:
   - Bangun halaman **Lembar Buku Induk 360°** di Web Portal (`SiakadPage` → sub-modul terdedikasi) lengkap dengan riwayat rombel, nilai, presensi, dan dokumen arsip.
   - Implementasi alur Mutasi Masuk/Keluar, Kenaikan Kelas Massal, Kelulusan Massal, serta generator PDF Buku Induk & Surat Keterangan ber-QR/TTE.
4. **Tahap 4 — Impor Massal, Validator Dapodik/EMIS, & Self-Service (Sprint D)**:
   - Fitur impor Excel/CSV siswa lama, *Pre-Flight Completeness Validator* Dapodik/EMIS, ekspor XLSX siap unggah, serta pengajuan ubah data mandiri dari Parent App.

