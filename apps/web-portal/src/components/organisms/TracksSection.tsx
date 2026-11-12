import { Award, Briefcase, HeartHandshake, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { AdmissionTrack, selectAdmissionTrack } from '../../store/slices/ppdbPublicSlice';
import { SectionHeading } from '../atoms';
import { TrackCard } from '../molecules';

interface TrackConfig {
  track: AdmissionTrack;
  quotaLabel: string;
  title: string;
  description: string;
  icon: 'map' | 'award' | 'heart' | 'briefcase';
  specs: Array<{ label: string; value: string }>;
  ctaLabel: string;
  highlighted?: boolean;
}

const TRACKS: TrackConfig[] = [
  {
    track: 'ZONASI',
    quotaLabel: 'Kuota 50%',
    title: 'Jalur Zonasi',
    description:
      'Seleksi berbasis jarak domisili Kartu Keluarga menuju koordinat gerbang utama sekolah dengan algoritma Geotagging GPS/Haversine.',
    icon: 'map',
    specs: [
      { label: 'Radius Efektif', value: '± 1.500 Meter' },
      { label: 'Masa Domisili', value: '1 Tahun Penuh' },
    ],
    ctaLabel: 'Pilih Jalur Zonasi',
  },
  {
    track: 'PRESTASI',
    quotaLabel: 'Kuota 30%',
    title: 'Jalur Prestasi',
    description:
      'Seleksi gabungan nilai rapor semester 1–5 ditambah sertifikat kejuaraan resmi tingkat kabupaten, provinsi, nasional, atau internasional.',
    icon: 'award',
    specs: [
      { label: 'Minimal Nilai Rapor', value: 'Rata-rata ≥ 85.0' },
      { label: 'Tingkat Kejuaraan', value: 'Kota / Prov / Nas' },
    ],
    ctaLabel: 'Pilih Jalur Prestasi',
    highlighted: true,
  },
  {
    track: 'AFIRMASI',
    quotaLabel: 'Kuota 15%',
    title: 'Jalur Afirmasi KIP/PIP',
    description:
      'Dikhususkan bagi peserta didik pemegang kartu jaminan sosial aktif (KIP, PKH, atau KKS terverifikasi Kemensos RI & Dukcapil).',
    icon: 'heart',
    specs: [
      { label: 'Basis Verifikasi', value: 'DTKS & KIP/PKH' },
      { label: 'Subsidi Biaya', value: 'Gratis / Bebas SPP' },
    ],
    ctaLabel: 'Pilih Jalur Afirmasi',
  },
  {
    track: 'MUTASI',
    quotaLabel: 'Kuota 5%',
    title: 'Pindah Tugas / Anak Guru',
    description:
      'Jalur khusus calon siswa yang mengikuti perpindahan tugas dinas orang tua (ASN/TNI/POLRI/BUMN) atau putra/putri tenaga pendidik aktif.',
    icon: 'briefcase',
    specs: [
      { label: 'Legalitas Baku', value: 'SK Tugas Resmi' },
      { label: 'Penempatan Kerja', value: 'Negeri & Swasta' },
    ],
    ctaLabel: 'Pilih Jalur Mutasi',
  },
];

function renderTrackIcon(icon: TrackConfig['icon']) {
  switch (icon) {
    case 'map':
      return <MapPin className="h-4 w-4" />;
    case 'award':
      return <Award className="h-4 w-4" />;
    case 'heart':
      return <HeartHandshake className="h-4 w-4" />;
    case 'briefcase':
      return <Briefcase className="h-4 w-4" />;
  }
}

export function TracksSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function handleSelectTrack(track: AdmissionTrack) {
    dispatch(selectAdmissionTrack(track));
    navigate('/ppdb');
  }

  return (
    <section id="jalur-masuk" className="py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          kicker="TARIF & KUOTA TERBUKA"
          title="Jalur Penerimaan Peserta Didik Baru (PPDB) 2026/2027"
          subtitle="Pendaftaran berbasis kuota transparan dan validasi geospasial akurat menggunakan algoritma pemetaan digital radius Haversine."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((item) => (
            <TrackCard
              key={item.track}
              quotaLabel={item.quotaLabel}
              title={item.title}
              description={item.description}
              icon={renderTrackIcon(item.icon)}
              specs={item.specs}
              ctaLabel={item.ctaLabel}
              highlighted={item.highlighted}
              onSelect={() => handleSelectTrack(item.track)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

