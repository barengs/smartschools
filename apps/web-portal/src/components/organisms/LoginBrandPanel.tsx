import { Database, Headphones, KeyRound, Lock } from 'lucide-react';
import { BrandLogo, Card } from '../atoms';
import { AuthFeatureItem } from '../molecules';

export function LoginBrandPanel() {
  return (
    <Card
      variant="navy"
      padding="lg"
      className="h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <BrandLogo variant="light" subtitle="Terintegrasi 360° Sistem Terpadu" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Online · TLS 1.3
          </span>
        </div>

        <div className="mt-6">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-100">
            UNIFIED IDENTITY PLATFORM
          </span>
          <h1 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            Pintu Masuk Terpadu Ekosistem Digital Smart School
          </h1>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-blue-100/90">
            Autentikasi terpusat berbasis Role-Based Access Control (RBAC). Identitas Anda akan
            secara otomatis menentukan otorisasi modul akademik, presensi, rapor, hingga finansial.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <AuthFeatureItem
            icon={<KeyRound className="h-4.5 w-4.5" />}
            title="Single Sign-On (SSO) RS256"
            description="Satu kali login untuk semua portal dengan token kriptografis asimetris yang aman."
          />
          <AuthFeatureItem
            icon={<Database className="h-4.5 w-4.5" />}
            title="Single Source of Truth (SSOT)"
            description="Tersinkronisasi otomatis dengan basis data Dapodik & EMIS Kemenag secara real-time."
          />
          <AuthFeatureItem
            icon={<Lock className="h-4.5 w-4.5" />}
            title="Enkripsi Data AES-256-GCM"
            description="Proteksi data pribadi siswa & staf terjamin dengan standar keamanan perbankan."
          />
        </div>
      </div>

      <div className="mt-8 border-t border-white/15 pt-4 text-xs text-blue-100">
        <div className="flex items-center gap-2 text-blue-200">
          <Headphones className="h-4 w-4 shrink-0" />
          <span>Kendala masuk akun? Hubungi TU / Helpdesk:</span>
        </div>
        <div className="mt-1 font-bold text-white pl-6">helpdesk@smartschool.sch.id</div>
      </div>
    </Card>
  );
}

