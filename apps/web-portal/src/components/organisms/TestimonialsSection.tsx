import { SectionHeading } from '../atoms';
import { AchievementCard, TestimonialCard } from '../molecules';

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          kicker="BUKTI HASIL TERPERCAYA"
          title="Prestasi Siswa Terkini & Suara Wali Murid"
          subtitle="Rekam jejak prestasi akademik nasional dan kepuasan orang tua atas transparansi layanan digital."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <AchievementCard
              levelLabel="JUARA NASIONAL OSN-K"
              year="2025 / 2026"
              studentName="Alya Putri Kirana (Fase F - Kimia)"
              quote="Fasilitas lab kimia terpadu dan bimbingan intensif guru memacu semangat saya hingga lolos seleksi nasional ke tingkat provinsi dengan nilai eksperimen tertinggi."
              resultFooter="Diterima Fakultas Kedokteran Universitas Padjadjaran"
              initials="APK"
              accentTone="blue"
            />
            <AchievementCard
              levelLabel="JUARA II FIKSI NASIONAL"
              year="TA 2025 / 2026"
              studentName="Tim Robotik Nusantara - Autonomous Drone"
              quote="Pembelajaran berbasis riset & IoT di SmartSchool membekali kami menciptakan solusi sensor otonom pertanian modern hingga juara tingkat nasional."
              resultFooter="Penerima Beasiswa Prestasi Penuh ke Luar Negeri"
              initials="TRN"
              accentTone="emerald"
            />
          </div>

          <div className="space-y-5">
            <TestimonialCard
              quote="Keterbukaan kepada orang tua sangat membantu. Setiap pagi pas anak tap RFID absen di gerbang, notif langsung masuk ke HP saya. Transaksi kantin juga tidak pernah khawatir karena ada batas jajan harian dari Parent App."
              authorName="Dr. H. Dian Wahyudi, M.Sc"
              authorRole="Orang Tua Siswa Kelas XII · MIPA-1 (Alumni 2026)"
              initials="DW"
            />
            <TestimonialCard
              quote="Proses pendaftaran E-PPDB online sangat transparan. Berkas diunggah terpusat, skor zonasi terhitung jelas, dan setiap tahapan diverifikasi tanpa antre. Sangat profesional."
              authorName="Rizki Anggraini, S.E."
              authorRole="Wali Murid Kelas X Fase E"
              initials="RA"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

