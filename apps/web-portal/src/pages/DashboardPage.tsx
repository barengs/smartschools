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
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDashboardSummary } from '../store/slices/portalSlice';
import { formatRupiah } from '../utils/format';

interface HealthStatus {
  status: string;
  dependencies: {
    postgres: string;
    redis: string;
  };
}

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const summary = useAppSelector((s) => s.portal.dashboardSummary);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function refreshAll() {
    setSyncing(true);
    try {
      const [h] = await Promise.all([
        apiRequest<HealthStatus>('/api/v1/core/health', {}, false).catch(() => null),
        dispatch(fetchDashboardSummary()),
      ]);
      setHealth(h);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const activeStudents = summary?.kpis.activeStudents ?? 6;
  const presentToday = summary?.kpis.presentToday ?? activeStudents;
  const attendanceRate = summary?.kpis.attendanceRate ?? 100;
  const criticalCount = summary?.kpis.unresolvedCriticalEws ?? 3;
  const mediumCount = summary?.kpis.unresolvedMediumEws ?? 2;
  const totalEws = criticalCount + mediumCount;
  const totalClassrooms = summary?.kpis.totalClassrooms ?? 5;
  const totalPpdb = summary?.kpis.totalPpdbApplicants ?? 6;
  const paidAmount = summary?.kpis.paidInvoiceAmount ?? 0;
  const collectionRate = summary?.kpis.collectionRate ?? 100;

  return (
    <div className="space-y-6">
      <PortalTopbar
        kicker={`Sistem Manajemen Sekolah • ${summary?.period ?? 'TA 2026/2027 Ganjil'}`}
        title="Executive Dashboard & Early Warning System (EWS)"
        subtitle="Ringkasan data operasional sekolah, pemantauan kehadiran, keuangan SPP, dan deteksi risiko siswa langsung dari PostgreSQL."
        rightSlot={
          <>
            <div className="inline-flex items-center gap-2 rounded-md border border-[#dee2e6] bg-white px-3 py-1.5 text-sm font-medium text-[#212529]">
              <Calendar className="h-4 w-4 text-[#0d6efd]" />
              <span>{summary?.period ?? 'TA 2026/2027 Ganjil'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              loading={syncing}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={refreshAll}
            >
              Sinkronisasi Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Cetak Laporan
            </Button>
          </>
        }
      />

      {/* Bootstrap Alert Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-[#f1aeb5] bg-[#f8d7da] px-4 py-3 text-sm text-[#58151c]">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-[#dc3545] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold">
                Peringatan Dini: {criticalCount} Siswa Memerlukan Tindak Lanjut Konseling (Kritis)
              </span>
              {health && (
                <Badge tone="emerald">
                  Core API: {health.status.toUpperCase()} ({health.dependencies.postgres})
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-[#58151c]">
              Pemantauan keterlambatan, kehadiran, dan indikator risiko akademik tersinkron dengan
              data Guru BK.
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() =>
            document.getElementById('ews-risk-section')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="shrink-0"
        >
          Lihat Daftar EWS
        </Button>
      </div>

      {/* Bootstrap-style KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="md" className="border-t-4 border-t-[#0d6efd] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#495057]">Kehadiran Siswa Hari Ini</span>
            <Activity className="h-4 w-4 text-[#0d6efd]" />
          </div>
          <div className="text-2xl font-bold text-[#212529] tabular-nums">
            {presentToday}{' '}
            <span className="text-sm font-normal text-[#6c757d]">/ {activeStudents} Siswa</span>
          </div>
          <div className="h-2 w-full rounded bg-[#e9ecef] overflow-hidden">
            <div
              className="h-full bg-[#198754]"
              style={{ width: `${Math.min(100, attendanceRate)}%` }}
            />
          </div>
          <div className="text-xs font-medium text-[#198754]">{attendanceRate}% Hadir Hari Ini</div>
        </Card>

        <Card padding="md" className="border-t-4 border-t-[#dc3545] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#495057]">Antrean Pengawasan EWS</span>
            <AlertTriangle className="h-4 w-4 text-[#dc3545]" />
          </div>
          <div className="text-2xl font-bold text-[#212529] tabular-nums">
            {totalEws} <span className="text-sm font-normal text-[#6c757d]">Siswa Aktif</span>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Badge tone="rose">{criticalCount} Kritis</Badge>
            <Badge tone="amber">{mediumCount} Sedang</Badge>
          </div>
        </Card>

        <Card padding="md" className="border-t-4 border-t-[#198754] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#495057]">Realisasi Keuangan SPP</span>
            <Wallet className="h-4 w-4 text-[#198754]" />
          </div>
          <div className="text-2xl font-bold text-[#212529] tabular-nums">
            {formatRupiah(paidAmount)}
          </div>
          <div className="flex items-center justify-between text-xs text-[#6c757d]">
            <span>Tingkat Pelunasan</span>
            <strong className="text-[#198754]">{collectionRate}%</strong>
          </div>
        </Card>

        <Card padding="md" className="border-t-4 border-t-[#0dcaf0] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#495057]">Rombel &amp; Pendaftar PPDB</span>
            <Users className="h-4 w-4 text-[#0a58ca]" />
          </div>
          <div className="text-2xl font-bold text-[#212529] tabular-nums">
            {totalClassrooms} <span className="text-sm font-normal text-[#6c757d]">Kelas Aktif</span>
          </div>
          <div className="text-xs font-medium text-[#0a58ca]">
            {totalPpdb} Berkas PPDB Masuk
          </div>
        </Card>
      </div>

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
