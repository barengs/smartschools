import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../atoms';
import { StepCard } from '../molecules';

const PPDB_STEPS = [
  {
    stepNumber: 1,
    title: 'Buat Akun & Isi Formulir',
    description:
      'Registrasi akun SSO menggunakan NIK dan NISN aktif, lengkapi biodata calon siswa, serta pilih jalur seleksi.',
  },
  {
    stepNumber: 2,
    title: 'Unggah Berkas & Geotag',
    description:
      'Upload scan KK, Akta, Rapor, & tandai titik pin rumah untuk kalkulasi jarak Haversine secara otomatis.',
  },
  {
    stepNumber: 3,
    title: 'Verifikasi Dokumen Panitia',
    description:
      'Pemeriksaan validitas berkas oleh panitia secara desk split-view; revisi berkas diunggah ulang tanpa daftar ulang.',
  },
  {
    stepNumber: 4,
    title: 'CBT Placement Test',
    description:
      'Pelaksanaan tes diagnostik literasi, numerasi, dan penjurusan dalam mesin ujian anti-kecurangan Rust CBT.',
  },
  {
    stepNumber: 5,
    title: 'Hasil & Daftar Ulang',
    description:
      'Pengumuman kelulusan, pembayaran daftar ulang VA/QRIS, & One-Click Migration ke Buku Induk siswa aktif.',
  },
];

export function StepsSection() {
  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="LANGKAH MUDAH & TRANSPARAN"
          title="Alur 5 Langkah Pendaftaran E-PPDB"
          subtitle="Seluruh tahapan seleksi dipantau secara real-time melalui Dashboard Calon Siswa tanpa tatap muka langsung."
          rightSlot={
            <Link
              to="/status-seleksi"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#163b8c] hover:underline"
            >
              <span>Pantau Status Seleksi</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PPDB_STEPS.map((step) => (
            <StepCard
              key={step.stepNumber}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

