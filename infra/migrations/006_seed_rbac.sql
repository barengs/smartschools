-- 006_seed_rbac.sql
-- Seed default school RBAC roles & core permissions

INSERT INTO iam_master.roles (code, name, description) VALUES
    ('SUPER_ADMIN', 'Super Administrator', 'Akses penuh konfigurasi sistem & manajemen pengguna'),
    ('KEPALA_SEKOLAH', 'Kepala Sekolah / Yayasan', 'Akses Executive Dashboard, EWS, dan supervisi seluruh modul'),
    ('WAKA_KURIKULUM', 'Wakil Kepala Kurikulum', 'Manajemen tahun ajaran, rombel, jadwal otomatis, dan E-Rapor'),
    ('STAF_TU', 'Staf Tata Usaha', 'Pengelolaan E-PPDB, Buku Induk, dan administrasi surat siswa'),
    ('BENDAHARA', 'Bendahara Sekolah', 'Manajemen E-Finance, tagihan SPP, pembayaran, dan laporan BOS'),
    ('GURU', 'Guru Mata Pelajaran', 'Jurnal mengajar, absensi kelas, LMS, bank soal, dan input nilai'),
    ('GURU_BK', 'Guru Bimbingan Konseling', 'Akses terenkripsi E-BK, poin disiplin/prestasi, dan tindak lanjut EWS'),
    ('PETUGAS_UKS', 'Petugas UKS', 'Pencatatan kunjungan kesehatan siswa dan catatan alergi'),
    ('PUSTAKAWAN', 'Pustakawan', 'Pengelolaan katalog OPAC, e-book, dan sirkulasi perpustakaan'),
    ('SISWA', 'Siswa', 'Akses LMS, ujian CBT, Kartu Pelajar Digital, jadwal, dan pemesanan BK'),
    ('ORANG_TUA', 'Orang Tua / Wali', 'Pantau kehadiran, izin digital, bayar SPP, top-up & limit jajan kantin'),
    ('KASIR_KANTIN', 'Kasir Kantin / Koperasi', 'Akses terminal POS Cashless untuk transaksi kartu pelajar')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam_master.permissions (code, module, description) VALUES
    ('iam.users.manage', 'iam', 'Mengelola akun pengguna dan penetapan role'),
    ('ppdb.manage', 'ppdb', 'Verifikasi pendaftar dan One-Click Migration ke Buku Induk'),
    ('siakad.manage', 'siakad', 'Mengelola buku induk, rombel, mapel, dan jadwal'),
    ('finance.manage', 'finance', 'Menerbitkan tagihan SPP dan melihat laporan keuangan'),
    ('lms.teach', 'lms', 'Mengelola materi, tugas, dan bank soal CBT'),
    ('cbt.take', 'cbt', 'Mengikuti sesi ujian CBT'),
    ('pos.transact', 'pos', 'Memproses transaksi pembayaran cashless kantin'),
    ('ews.view', 'analytics', 'Melihat skor risiko Early Warning System dan Dashboard Eksekutif')
ON CONFLICT (code) DO NOTHING;

