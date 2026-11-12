import { CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  EWS_RISK_ROWS,
  resolveEwsAlert,
  setEwsFilter,
  toggleEwsShowAll,
} from '../../store/slices/portalSlice';
import { Badge, Button, Card } from '../atoms';

export function EwsRiskTableCard() {
  const dispatch = useAppDispatch();
  const { ewsFilter, ewsShowAll, dashboardSummary } = useAppSelector((s) => s.portal);

  const liveRows =
    dashboardSummary?.ewsRows && dashboardSummary.ewsRows.length > 0
      ? dashboardSummary.ewsRows.map((r) => ({
          id: r.id,
          name: r.full_name,
          nisn: r.nisn ?? '-',
          className: r.classroom_name ?? 'Aktif',
          riskLevel: r.risk_level === 'CRITICAL' ? ('CRITICAL' as const) : ('MEDIUM' as const),
          riskScore: Number(r.attendance_risk_score),
          factors: [`Skor Kehadiran: ${r.attendance_risk_score}%`, `Skor Akademik: ${r.academic_drop_score}%`],
          recommendedAction: r.recommended_action,
          resolved: r.is_resolved_by_bk,
          isFromDb: true,
        }))
      : EWS_RISK_ROWS.map((r) => ({ ...r, resolved: false, isFromDb: false }));

  const filtered = liveRows.filter((row) =>
    ewsFilter === 'ALL' ? true : row.riskLevel === ewsFilter,
  );
  const displayed = ewsShowAll ? filtered : filtered.slice(0, 5);

  const criticalCount = liveRows.filter((r) => r.riskLevel === 'CRITICAL').length;
  const mediumCount = liveRows.filter((r) => r.riskLevel === 'MEDIUM').length;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dee2e6] bg-[#f8f9fa] px-5 py-3.5">
        <div>
          <h2 className="text-base font-bold text-[#212529]">Daftar Pemantauan Siswa (EWS)</h2>
          <p className="text-xs text-[#6c757d]">
            Indikator kehadiran, pelanggaran disiplin, dan penurunan akademik siswa
          </p>
        </div>

        <div className="inline-flex rounded-md border border-[#dee2e6] bg-white p-1 text-xs font-semibold self-start sm:self-auto">
          {(
            [
              { key: 'ALL', label: `Semua (${liveRows.length})` },
              { key: 'CRITICAL', label: `Kritis (${criticalCount})` },
              { key: 'MEDIUM', label: `Sedang (${mediumCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => dispatch(setEwsFilter(tab.key))}
              className={`rounded px-2.5 py-1 transition-colors cursor-pointer ${
                ewsFilter === tab.key
                  ? 'bg-[#0d6efd] text-white'
                  : 'text-[#495057] hover:bg-[#f8f9fa]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#dee2e6] bg-[#f8f9fa] text-xs font-semibold uppercase text-[#495057]">
              <th className="px-4 py-3">Identitas Siswa</th>
              <th className="px-4 py-3">Tingkat</th>
              <th className="px-4 py-3">Indikator Utama</th>
              <th className="px-4 py-3">Rekomendasi &amp; Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dee2e6] bg-white">
            {displayed.map((row) => {
              const isCritical = row.riskLevel === 'CRITICAL';
              return (
                <tr key={row.id} className="hover:bg-[#f8f9fa]">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#212529]">{row.name}</div>
                    <div className="text-xs text-[#6c757d] tabular-nums">
                      NISN {row.nisn} · {row.className}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge tone={row.resolved ? 'emerald' : isCritical ? 'rose' : 'amber'}>
                      {row.resolved ? 'SELESAI BK' : `${row.riskLevel} (${row.riskScore}%)`}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-[#212529]">{row.factors[0]}</div>
                    {row.factors[1] && (
                      <div className="text-xs text-[#6c757d] mt-0.5">{row.factors[1]}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-[#212529] mb-1.5">
                      {row.recommendedAction}
                    </div>
                    {row.isFromDb && !row.resolved ? (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        onClick={() => dispatch(resolveEwsAlert(row.id))}
                      >
                        Tandai Ditangani
                      </Button>
                    ) : (
                      <span className="text-xs text-[#198754] font-medium">
                        {row.resolved ? 'Sudah ditindaklanjuti' : 'Siap Ditinjau'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#dee2e6] bg-[#f8f9fa] px-5 py-3 text-sm">
        <span className="text-[#6c757d]">
          Menampilkan <strong>{displayed.length}</strong> dari <strong>{filtered.length}</strong> data
        </span>
        <button
          type="button"
          onClick={() => dispatch(toggleEwsShowAll())}
          className="font-semibold text-[#0d6efd] hover:underline cursor-pointer"
        >
          {ewsShowAll ? 'Tampilkan Ringkas' : 'Lihat Semua'}
        </button>
      </div>
    </Card>
  );
}
