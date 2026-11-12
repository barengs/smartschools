import { ArrowRight, Building2, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button } from '../atoms';
import { StatCard } from '../molecules';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-b from-white to-slate-50/70 pt-10 pb-14 sm:pt-14 sm:pb-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-6">
            <Badge tone="blue" uppercase icon={<Building2 className="h-3.5 w-3.5" />}>
              NPSN: 20108923 • SEKOLAH PENGGERAK
            </Badge>

            <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Pendidikan Unggul, Berkarakter &amp; Terintegrasi Teknologi Modern
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 max-w-xl">
              Mewujudkan generasi berdaya saing global melalui ekosistem Smart Campus: Absensi Pintar
              IoT RFID, Sistem Akademik Single Source of Truth (SSOT), Pembelajaran Personalisasi
              Kurikulum Merdeka Fase E–F, serta Keamanan Data Terpadu.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => navigate('/ppdb')}
              >
                Daftar PPDB Gelombang 1 TA 2026/2027
              </Button>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<FileText className="h-4 w-4" />}
                onClick={() => {
                  const el = document.getElementById('biaya-ppdb');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Lihat Alur &amp; Biaya Pendidikan
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard value="A" label="Akreditasi Unggul BAN-SM" />
              <StatCard value="98.4%" label="Lulusan PTN & Kedinasan" />
              <StatCard value="1.280" label="Siswa Teregistrasi Aktif" />
              <StatCard value="100%" label="Cashless & RFID Campus" />
            </div>
          </div>

          {/* Right showcase card */}
          <div className="lg:col-span-6">
            <div className="relative pb-6">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#0f2b6b] via-[#1b46a6] to-[#0ea5e9] p-6 sm:p-8 text-white shadow-2xl shadow-blue-950/15 min-h-[340px] sm:min-h-[380px] flex flex-col justify-between">
                {/* Architectural campus graphic silhouette backdrop */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.45), transparent 45%), linear-gradient(120deg, transparent 45%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.18) 46%, transparent 46%)',
                  }}
                />

                <div className="relative flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    AI-ACTIVE SMART CAMPUS
                  </span>
                  <span className="rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold">
                    Bogor · Integrated Hub
                  </span>
                </div>

                {/* Stylized modern school facade illustration */}
                <div className="relative my-6 grid grid-cols-3 gap-2.5">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xs">
                    <div className="text-[10px] font-bold uppercase text-blue-100">IoT Gate RFID</div>
                    <div className="mt-1 text-lg font-extrabold tabular-nums">1.242 Tap</div>
                    <div className="text-[10px] text-emerald-300 font-semibold">Latensi 2.4 ms</div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xs">
                    <div className="text-[10px] font-bold uppercase text-blue-100">CBT Cluster</div>
                    <div className="mt-1 text-lg font-extrabold tabular-nums">1.000+ Node</div>
                    <div className="text-[10px] text-emerald-300 font-semibold">Exam Lock Aktif</div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xs">
                    <div className="text-[10px] font-bold uppercase text-blue-100">Cashless POS</div>
                    <div className="mt-1 text-lg font-extrabold tabular-nums">0% Error</div>
                    <div className="text-[10px] text-emerald-300 font-semibold">Atomic Ledger</div>
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Lingkungan Belajar Cerdas
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-blue-100">
                    Pemantauan KBM &amp; Keamanan Terpadu 24/7 dalam Satu Ekosistem Sekolah.
                  </p>
                </div>
              </div>

              {/* Floating bottom-left badge matching screenshot 1 */}
              <div className="relative sm:absolute sm:bottom-0 sm:left-4 mt-3 sm:mt-0 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163b8c] text-white shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                    <span>Keamanan Terintegrasi</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tap Kartu &amp; Notifikasi Orang Tua Real-Time via Mobile App
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

