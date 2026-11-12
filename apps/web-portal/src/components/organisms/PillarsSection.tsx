import { Activity, Award, BookOpen, Cpu, Database, Radio, ShieldCheck, Wallet } from 'lucide-react';
import { Badge, SectionHeading } from '../atoms';
import { PillarCard } from '../molecules';

export function PillarsSection() {
  return (
    <section className="py-12 bg-[#f8f9fa] border-b border-[#dee2e6]">
      <div className="bs-container">
        <SectionHeading
          kicker="Layanan Akademik & Manajemen"
          title="4 Pilar Utama Ekosistem SmartSchool"
          subtitle="Sistem informasi sekolah yang menjamin keterbukaan kurikulum, kehadiran, asesmen, dan administrasi keuangan."
          rightSlot={
            <Badge tone="emerald" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Standar ISO 27001
            </Badge>
          }
        />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <PillarCard
            icon={<Database className="h-5 w-5" />}
            title="SIAKAD & Buku Induk 360°"
            description="Single Source of Truth terintegrasi Dapodik, penjadwalan akademik, serta E-Rapor bertanda tangan elektronik resmi."
            footerLabel="Sinkronisasi Otomatis"
            footerIcon={<Activity className="h-4 w-4" />}
          />
          <PillarCard
            icon={<Radio className="h-5 w-5" />}
            title="Presensi Gerbang IoT RFID"
            description="Gerbang absensi otomatis berbasis kartu pelajar dengan laporan kehadiran langsung ke aplikasi dan WhatsApp wali murid."
            footerLabel="Notifikasi Real-Time"
            footerIcon={<Cpu className="h-4 w-4" />}
          />
          <PillarCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Smart LMS & Ujian CBT"
            description="Pembelajaran Kurikulum Merdeka berbasis capaian pembelajaran, bank soal AKM, dan ujian komputer terproteksi."
            footerLabel="Evaluasi Terukur"
            footerIcon={<Award className="h-4 w-4" />}
          />
          <PillarCard
            icon={<Wallet className="h-5 w-5" />}
            title="Kantin Cashless & E-Finance"
            description="Pembayaran SPP melalui Virtual Account/QRIS serta kontrol batas transaksi harian kantin memakai kartu pelajar."
            footerLabel="Transaksi Tercatat"
            footerIcon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>
      </div>
    </section>
  );
}
