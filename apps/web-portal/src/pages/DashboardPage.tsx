import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  ShieldAlert,
  Users,
  Wallet,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { Badge, Button, Card } from '../components/atoms';
import {
  EwsRiskTableCard,
  ExecutiveRightRail,
  HighSpeedTelemetryCard,
  PortalTopbar,
} from '../components/organisms';

interface HealthStatus {
  status: string;
  dependencies: {
    postgres: string;
    redis: string;
  };
}

export function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  function checkHealth() {
    setSyncing(true);
    apiRequest<HealthStatus>('/api/v1/core/health', {}, false)
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setSyncing(false));
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6">
      <PortalTopbar
        kicker="KECERDASAN BUATAN TERINTEGRASI • Model v4.2 Prediktif Python Aktif"
        title="Executive Dashboard & Early Warning System (EWS)"
        subtitle="Pemantauan real-time operasional sekolah, analisis prediktif AI Python, & metrik SSOT"
        rightSlot={
          <>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-[#163b8c]" />
              <span>Semester Ganjil 2026/2027 (Hari Ini: 24 Okt)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              loading={syncing}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={checkHealth}
            >
              Sinkron
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={() => window.print()}
            >
              Ekspor PDF
            </Button>
          </>
        }
      />

      {/* Critical Alert Banner matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-rose-950">
                Peringatan Dini: 3 Siswa Terindikasi Anomali Berkelanjutan (Kritis)
              </span>
              <Badge tone="rose">Tindakan Diperlukan</Badge>
              {health && (
                <Badge tone="emerald">
                  Core ERP: {health.status.toUpperCase()} ({health.dependencies.postgres}/
                  {health.dependencies.redis})
                </Badge>
              )}
            </div>
            <p className="text-rose-800 mt-0.5">
              Model Python C-Service mendeteksi kombinasi absensi berturut-turut, anomali saldo
              cashless kantin, dan penurunan skor formatif drastis dalam kurun 72 jam.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            document.getElementById('ews-risk-section')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="bg-rose-600 hover:bg-rose-700 shrink-0"
        >
          Investigasi
        </Button>
      </div>

      {/* 4 KPI Top Cards matching Screenshot 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600">Kehadiran Tap RFID Hari Ini</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#163b8c]">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            1.248 <span className="text-sm font-semibold text-slate-400">/ 1.280</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-[97.5%] rounded-full bg-emerald-600" />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <Badge tone="emerald">97.5% Normal Pagi</Badge>
            <span className="font-bold text-slate-500 tabular-nums">MQTT &lt;2.8ms</span>
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600">Siswa Dalam Pengawasan EWS</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            14 <span className="text-sm font-semibold text-slate-500">Siswa Terdeteksi</span>
          </div>
          <div className="flex items-center gap-1.5 pt-2 flex-wrap">
            <Badge tone="rose">3 Kritis</Badge>
            <Badge tone="amber">11 Sedang</Badge>
            <span className="text-[11px] font-bold text-slate-500 ml-auto">Peringatan AI</span>
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600">Realisasi SPP &amp; Keuangan</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">Rp 482,5 jt</div>
          <div className="text-[11px] text-slate-500">Target: Rp 512,0 jt</div>
          <div className="flex items-center justify-between text-[11px]">
            <Badge tone="emerald">94.2% Surplus Aman</Badge>
            <span className="font-bold text-emerald-700">+3.8% MoM</span>
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600">Keterlaksanaan KBM Hari Ini</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#163b8c]">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            42 <span className="text-sm font-semibold text-slate-400">/ 44 Kelas Aktif</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-[95.4%] rounded-full bg-[#163b8c]" />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <Badge tone="blue">95.4% Efektivitas</Badge>
            <span className="text-slate-500 font-medium">2 Guru Izin (1 Terisi Piket)</span>
          </div>
        </Card>
      </div>

      {/* Main 8 + 4 Dashboard Workspace matching Screenshot 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div id="ews-risk-section" className="lg:col-span-8 space-y-6">
          <EwsRiskTableCard />
          <HighSpeedTelemetryCard />
        </div>

        <div className="lg:col-span-4">
          <ExecutiveRightRail />
        </div>
      </div>
    </div>
  );
}
