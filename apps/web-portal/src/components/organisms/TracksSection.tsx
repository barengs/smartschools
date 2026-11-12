import { Award, Briefcase, HeartHandshake, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { AdmissionTrack, selectAdmissionTrack } from '../../store/slices/ppdbPublicSlice';
import { Button, SectionHeading } from '../atoms';
import { TrackCard } from '../molecules';

function renderTrackIcon(code: AdmissionTrack) {
  switch (code) {
    case 'ZONASI':
      return <MapPin className="h-4 w-4" />;
    case 'PRESTASI':
      return <Award className="h-4 w-4" />;
    case 'AFIRMASI':
      return <HeartHandshake className="h-4 w-4" />;
    default:
      return <Briefcase className="h-4 w-4" />;
  }
}

export function TracksSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const overview = useAppSelector((s) => s.ppdbPublic.overview);

  const tracks = overview?.tracks ?? [
    {
      code: 'ZONASI' as const,
      title: 'Jalur Zonasi Domisili',
      quotaPercent: 50,
      capacity: 120,
      registered: 2,
      accepted: 1,
      description:
        'Seleksi berbasis jarak koordinat rumah ke gerbang sekolah (radius maksimal 1.500 meter) dengan validasi Kartu Keluarga.',
      requirements: [
        { label: 'Radius Maksimal', value: '1.500 Meter' },
        { label: 'Dokumen Utama', value: 'KK Minimal 1 Tahun' },
      ],
      ctaLabel: 'Daftar Jalur Zonasi',
    },
    {
      code: 'PRESTASI' as const,
      title: 'Jalur Prestasi Akademik',
      quotaPercent: 30,
      capacity: 72,
      registered: 2,
      accepted: 2,
      description:
        'Seleksi gabungan nilai rapor semester 1-5 serta sertifikat kejuaraan tingkat kota, provinsi, nasional, atau internasional.',
      requirements: [
        { label: 'Rata-rata Rapor', value: '>= 85.00' },
        { label: 'Sertifikat Lomba', value: 'Maks. 3 Tahun Terakhir' },
      ],
      ctaLabel: 'Daftar Jalur Prestasi',
      recommended: true,
    },
    {
      code: 'AFIRMASI' as const,
      title: 'Jalur Afirmasi KIP / PIP',
      quotaPercent: 15,
      capacity: 36,
      registered: 1,
      accepted: 1,
      description:
        'Kesempatan khusus bagi calon peserta didik pemegang kartu KIP, PKH, atau KKS aktif yang terdata pada DTKS Kemensos.',
      requirements: [
        { label: 'Validasi Data', value: 'DTKS / KIP / PKH' },
        { label: 'Keringanan Biaya', value: 'Gratis Dana Pengembangan' },
      ],
      ctaLabel: 'Daftar Jalur Afirmasi',
    },
    {
      code: 'MUTASI' as const,
      title: 'Perpindahan Tugas Orang Tua',
      quotaPercent: 5,
      capacity: 12,
      registered: 1,
      accepted: 0,
      description:
        'Untuk calon siswa yang mengikuti mutasi penugasan orang tua (ASN/TNI/POLRI/BUMN) atau putra-putri pendidik.',
      requirements: [
        { label: 'Surat Tugas', value: 'SK Mutasi < 1 Tahun' },
        { label: 'Penempatan', value: 'Domisili Baru' },
      ],
      ctaLabel: 'Daftar Jalur Mutasi',
    },
  ];

  function handleSelectTrack(track: AdmissionTrack) {
    dispatch(selectAdmissionTrack(track));
    navigate('/ppdb');
  }

  return (
    <section id="jalur-masuk" className="py-12 bg-white border-b border-[#dee2e6]">
      <div className="bs-container">
        <SectionHeading
          kicker="Penerimaan Peserta Didik Baru"
          title="Jalur Seleksi PPDB Tahun Ajaran 2026/2027"
          subtitle="Pilih jalur masuk yang sesuai dengan domisili, prestasi akademik, maupun kualifikasi keluarga."
          rightSlot={
            <Button variant="outline" size="sm" onClick={() => navigate('/status-seleksi')}>
              Cek Status Kelulusan
            </Button>
          }
        />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tracks.map((item) => {
            const remaining = Math.max(0, item.capacity - item.accepted);
            return (
              <TrackCard
                key={item.code}
                quotaLabel={`Kuota ${item.quotaPercent}% (${item.capacity} Kursi)`}
                title={item.title}
                description={item.description}
                icon={renderTrackIcon(item.code)}
                remainingText={`Tersedia ${remaining} kursi · ${item.registered} pendaftar`}
                specs={item.requirements}
                ctaLabel={item.ctaLabel}
                highlighted={item.recommended}
                onSelect={() => handleSelectTrack(item.code)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
