import { SectionHeading } from '../atoms';
import { AchievementCard, TestimonialCard } from '../molecules';

export function TestimonialsSection() {
  return (
    <section className="py-12 bg-white border-b border-[#dee2e6]">
      <div className="bs-container">
        <SectionHeading
          kicker="Prestasi & Testimoni"
          title="Prestasi Siswa & Tanggapan Wali Murid"
          subtitle="Dokumentasi pencapaian siswa serta pengalaman orang tua menggunakan portal akademik sekolah."
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
          <div className="flex flex-col gap-5">
            <AchievementCard
              levelLabel="Juara Nasional OSN-K"
              year="2025 / 2026"
              studentName="Alya Putri Kirana (Fase F - Kimia)"
              quote="Fasilitas laboratorium kimia dan bimbingan intensif guru memacu saya hingga meraih medali tingkat nasional."
              resultFooter="Diterima Fakultas Kedokteran Universitas Padjadjaran"
              initials="APK"
              imageUrl="/images/achievement-kimia.jpg"
              accentTone="blue"
            />
            <AchievementCard
              levelLabel="Juara II FIKSI Nasional"
              year="2025 / 2026"
              studentName="Tim Robotik Nusantara - Autonomous Drone"
              quote="Pembelajaran riset terapan dan dukungan bengkel robotik membantu kami menyelesaikan purwarupa drone pertanian."
              resultFooter="Penerima Beasiswa Prestasi Pendidikan Tinggi"
              initials="TRN"
              imageUrl="/images/achievement-robotik.jpg"
              accentTone="emerald"
            />
          </div>

          <div className="flex flex-col gap-5">
            <TestimonialCard
              quote="Keterbukaan informasi ke orang tua sangat membantu. Setiap pagi saat anak tap kartu di gerbang sekolah, notifikasi langsung masuk ke ponsel saya. Riwayat belanja kantin juga tercatat rapi."
              authorName="Dr. H. Dian Wahyudi, M.Sc"
              authorRole="Orang Tua Siswa Kelas XII MIPA-1"
              initials="DW"
            />
            <TestimonialCard
              quote="Proses pendaftaran E-PPDB online sangat jelas dan mudah dipahami. Berkas diunggah melalui portal, perhitungan zonasi transparan, dan verifikasi berjalan tepat waktu."
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
