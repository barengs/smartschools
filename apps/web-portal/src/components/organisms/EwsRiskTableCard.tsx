import { useAppDispatch, useAppSelector } from '../../store';
import { EWS_RISK_ROWS, setEwsFilter, toggleEwsShowAll } from '../../store/slices/portalSlice';
import { Badge, Card } from '../atoms';

export function EwsRiskTableCard() {
  const dispatch = useAppDispatch();
  const { ewsFilter, ewsShowAll } = useAppSelector((s) => s.portal);

  const filtered = EWS_RISK_ROWS.filter((row) =>
    ewsFilter === 'ALL' ? true : row.riskLevel === ewsFilter,
  );
  const displayed = ewsShowAll ? filtered : filtered.slice(0, 5);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-extrabold text-slate-900">EWS AI Student Risk Alert</h2>
            <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#163b8c]">
              finance_analytics.ews_risk
            </code>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Dihasilkan oleh Service AI Python berdasarkan 18 parameter akademik, kehadiran, &amp;
            finansial.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-bold self-start sm:self-auto">
          <span className="px-2 text-slate-500 hidden sm:inline">Filter Tingkat:</span>
          {(
            [
              { key: 'ALL', label: 'Semua (14)' },
              { key: 'CRITICAL', label: 'Kritis (3)' },
              { key: 'MEDIUM', label: 'Sedang (11)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => dispatch(setEwsFilter(tab.key))}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                ewsFilter === tab.key
                  ? 'bg-white text-[#163b8c] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Identitas Siswa</th>
              <th className="px-4 py-3">Tingkat Risiko</th>
              <th className="px-4 py-3">Faktor Penyebab Utama</th>
              <th className="px-5 py-3">Rekomendasi Tindakan AI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {displayed.map((row) => {
              const isCritical = row.riskLevel === 'CRITICAL';
              return (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-xs font-extrabold text-[#163b8c]">
                        {row.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{row.name}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          NISN {row.nisn} · <strong className="text-slate-700">{row.className}</strong>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge tone={isCritical ? 'rose' : 'amber'}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isCritical ? 'bg-rose-600' : 'bg-amber-600'
                        }`}
                      />
                      <span className="tabular-nums">
                        {row.riskLevel} ({row.riskScore.toFixed(1)}%)
                      </span>
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="font-bold text-slate-800">{row.factors[0]}</div>
                    {row.factors[1] && (
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isCritical ? 'text-rose-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {row.factors[1]}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <div
                      className={`inline-block rounded-xl border px-3 py-1.5 text-[11px] font-bold leading-snug ${
                        isCritical
                          ? 'border-rose-200 bg-rose-50/70 text-rose-800'
                          : 'border-blue-200 bg-blue-50/70 text-[#163b8c]'
                      }`}
                    >
                      {row.recommendedAction}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs">
        <span className="text-slate-500">
          Menampilkan <strong>{displayed.length}</strong> dari <strong>14</strong> antrean risiko
          aktif
        </span>
        <button
          type="button"
          onClick={() => dispatch(toggleEwsShowAll())}
          className="font-extrabold text-[#163b8c] hover:underline cursor-pointer"
        >
          {ewsShowAll ? 'Tampilkan Ringkas' : 'Lihat Semua (14) →'}
        </button>
      </div>
    </Card>
  );
}

