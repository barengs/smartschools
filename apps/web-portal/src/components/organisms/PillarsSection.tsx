import {
  Activity,
  Award,
  BookOpen,
  Cpu,
  Database,
  Radio,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Badge, SectionHeading } from '../atoms';
import { PillarCard } from '../molecules';

export function PillarsSection() {
  return (
    <section className="py-14 bg-white border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="INFRASTRUKTUR SEKOLAH 4.0"
          title="4 Pilar Keunggulan Ekosistem Smart School"
          subtitle="Infrastruktur komputasi sekolah berkecepatan tinggi yang menjamin transparansi kurikulum, presensi, evaluasi capaian, hingga tata kelola finansial terpadu."
          rightSlot={
            <Badge tone="slate" icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}>
              ISO 27001 Certified System
            </Badge>
          }
        />

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <PillarCard
            icon={<Database className="h-5 w-5" />}
            title="SIAKAD & Buku Induk 360°"
            description="Single Source of Truth terintegrasi ke Dapodik, penjadwalan akademik & piket, penilaian E-Rapor bertanda tangan digital resmi (TTE BSrE)."
            footerLabel="Sinkronisasi Otomatis"
            footerIcon={<Activity className="h-4 w-4" />}
          />
          <PillarCard
            icon={<Radio className="h-5 w-5" />}
            title="Smart Attendance IoT"
            description="Gerbang otomatis RFID & UHF dengan respons cepat <3ms, verifikasi biometrik anti-titip-absen, dan notifikasi instan langsung ke WhatsApp wali murid."
            footerLabel="Latensi <3ms"
            footerIcon={<Cpu className="h-4 w-4" />}
          />
          <PillarCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Smart LMS & CBT Proctored"
            description="Bebas kecurangan dengan modul blok dinamis bertag TP, remedial adaptif berbasis ML, bank soal AKM, serta penguncian browser peserta ujian."
            footerLabel="AI Anti-Cheat Protection"
            footerIcon={<Award className="h-4 w-4" />}
          />
          <PillarCard
            icon={<Wallet className="h-5 w-5" />}
            title="Kantin Cashless & E-Finance"
            description="Pembayaran kantin higienis menggunakan Kartu Pelajar RFID/QR, pelacakan jajan harian, serta pembayaran SPP fleksibel via Virtual Account dan QRIS."
            footerLabel="100% Cashless Ledger"
            footerIcon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>
      </div>
    </section>
  );
}

