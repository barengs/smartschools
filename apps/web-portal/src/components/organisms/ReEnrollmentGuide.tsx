import { Clock } from 'lucide-react';
import { Alert, Badge, SectionHeading } from '../atoms';
import { StepCard } from '../molecules';

const RE_ENROLLMENT_STEPS = [
  {
    stepNumber: 1,
    title: 'Konfirmasi Daftar Ulang Daring',
    description:
      'Login ke Portal SSO Siswa, unggah Surat Pernyataan Wajib Orang Tua bermeterai, dan verifikasi keabsahan data KK/Akta asli.',
    badgeText: 'Daring (Online)',
    badgeTone: 'emerald' as const,
    metaTop: 'Periode: 24 – 28 Nov 2026',
    metaBottom: 'Akses 24 Jam via Dashboard SSO',
  },
  {
    stepNumber: 2,
    title: 'Pengukuran Seragam & Smart Card',
    description:
      'Hadir ke Sekolah/Kampus untuk fitting seragam khusus, cetak foto biometrik, dan aktivasi Kartu Pelajar RFID SmartSchool.',
    badgeText: 'Luring (Kampus)',
    badgeTone: 'blue' as const,
    metaTop: 'Jadwal: 29 Nov – 01 Des 2026',
    metaBottom: 'Sesuai Sesi Nomor Antrean QR',
  },
  {
    stepNumber: 3,
    title: 'Penyelesaian Administrasi',
    description:
      'Pelunasan biaya perlengkapan praktikum, aktivitas kelas, dan sumbangan sukarela melalui Virtual Account bank mitra & QRIS.',
    badgeText: 'VA / QRIS Terpadu',
    badgeTone: 'emerald' as const,
    metaTop: 'Batas: 03 Desember 2026',
    metaBottom: 'Bebas Biaya untuk Jalur KIP/PIP/Afirmasi',
  },
  {
    stepNumber: 4,
    title: 'MPLS Ramah & Terpadu',
    description:
      'Mengikuti pengenalan ekosistem belajar murid baru bersama Masa Pengenalan Lingkungan Sekolah bebas perpeloncoan berbasis STEAM.',
    badgeText: 'Orientasi Siswa',
    badgeTone: 'slate' as const,
    metaTop: 'Mulai: 08 Desember 2026',
    metaBottom: 'Kampus Terpadu SMA Nusantara',
  },
];

export function ReEnrollmentGuide() {
  return (
    <section className="space-y-5">
      <SectionHeading
        kicker="TAHAPAN PASCA KELULUSAN"
        title="Panduan Langkah Lanjutan Daftar Ulang"
        subtitle="Ikuti prosedur administratif terpadu secara runtut untuk meresmikan kursi calon peserta didik pada Tahun Ajaran 2026/2027."
        rightSlot={
          <Badge tone="slate" icon={<Clock className="h-3.5 w-3.5 text-[#163b8c]" />}>
            Waktu Proses: 3 Hari Kerja
          </Badge>
        }
      />

      <Alert tone="warning" title="Peringatan Batas Waktu Penting!">
        <strong>Batas Akhir Konfirmasi Daftar Ulang: Jumat, 28 November 2026 pukul 16:00 WIB.</strong>{' '}
        Calon peserta didik yang tidak melakukan konfirmasi daftar ulang secara daring dan
        pengunggahan berkas pakta integritas sampai batas waktu tersebut dinyatakan{' '}
        <strong>mengundurkan diri</strong> secara otomatis, dan kursinya akan langsung dialihkan ke
        pendaftar pada <strong>antrean cadangan (Waiting List)</strong>.
      </Alert>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RE_ENROLLMENT_STEPS.map((step) => (
          <StepCard key={step.stepNumber} {...step} />
        ))}
      </div>
    </section>
  );
}

