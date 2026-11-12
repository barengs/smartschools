import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../atoms';
import { StepCard } from '../molecules';

const PPDB_STEPS = [
  {
    stepNumber: 1,
    title: 'Registrasi Akun & Biodata',
    description:
      'Buat akun calon siswa memakai NIK dan NISN aktif, lengkapi data pribadi serta pilih jalur pendaftaran.',
  },
  {
    stepNumber: 2,
    title: 'Unggah Berkas & Geotagging',
    description:
      'Unggah pindaian Kartu Keluarga, Akta Lahir, rapor, dan tentukan koordinat rumah di peta.',
  },
  {
    stepNumber: 3,
    title: 'Verifikasi Panitia PPDB',
    description:
      'Tim verifikator memeriksa kelengkapan dokumen secara daring. Jika ada kekurangan, revisi dikirim melalui portal.',
  },
  {
    stepNumber: 4,
    title: 'Tes Penempatan (CBT)',
    description:
      'Peserta mengikuti asesmen literasi dan numerasi terjadwal sebagai bagian dari pemetaan kelas.',
  },
  {
    stepNumber: 5,
    title: 'Pengumuman & Daftar Ulang',
    description:
      'Cek kelulusan melalui portal, selesaikan administrasi VA/QRIS, dan data otomatis masuk ke Buku Induk.',
  },
];

export function StepsSection() {
  return (
    <section className="py-12 bg-[#f8f9fa] border-b border-[#dee2e6]">
      <div className="bs-container">
        <SectionHeading
          kicker="Tahapan Seleksi"
          title="Alur 5 Langkah Pendaftaran E-PPDB"
          subtitle="Seluruh proses pendaftaran dilakukan secara daring dan dapat dipantau secara langsung."
          rightSlot={
            <Link
              to="/status-seleksi"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#0d6efd] hover:underline"
            >
              <span>Pantau Status Berkas</span>
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
