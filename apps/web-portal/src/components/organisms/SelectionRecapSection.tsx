import { Download } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPublicSelectionResults,
  setLookupQuery,
  setLookupTrack,
  setRecapPage,
  setRecapSearch,
  setRecapTab,
} from '../../store/slices/ppdbPublicSlice';
import { Badge, Button, Card, SectionHeading } from '../atoms';
import { PaginationBar, SearchFilterBar } from '../molecules';

const TRACK_LABELS: Record<string, { label: string; cap: string }> = {
  ZONASI: { label: 'Zonasi Domisili (50%)', cap: '120 Kursi' },
  PRESTASI: { label: 'Prestasi Akademik (30%)', cap: '72 Kursi' },
  AFIRMASI: { label: 'Afirmasi KIP/PIP (15%)', cap: '36 Kursi' },
  MUTASI: { label: 'Mutasi Orang Tua (5%)', cap: '12 Kursi' },
};

export function SelectionRecapSection() {
  const dispatch = useAppDispatch();
  const {
    recapTab,
    recapSearch,
    recapPage,
    lookupQuery,
    recapItems,
    recapTotalAccepted,
    recapTotalWaitlist,
    recapTotalItems,
    trackRecap,
  } = useAppSelector((s) => s.ppdbPublic);

  const pageSize = 6;

  return (
    <section className="space-y-6">
      <SectionHeading
        kicker="Keterbukaan Data Publik"
        title="Rekapitulasi Kuota & Hasil Seleksi Terbuka"
        rightSlot={
          <div className="text-sm text-[#495057]">
            Diterima: <strong className="text-[#198754]">{recapTotalAccepted}</strong> · Cadangan:{' '}
            <strong className="text-[#212529]">{recapTotalWaitlist}</strong>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(['ZONASI', 'PRESTASI', 'AFIRMASI', 'MUTASI'] as const).map((code) => {
          const live = trackRecap.find((t) => t.code === code);
          const meta = TRACK_LABELS[code];
          return (
            <div
              key={code}
              className="rounded border border-[#dee2e6] bg-white p-4 flex flex-col justify-between"
            >
              <div className="text-xs font-medium text-[#6c757d]">{meta.label}</div>
              <div className="mt-1 text-xl font-bold text-[#212529]">{meta.cap}</div>
              <div className="mt-2 text-xs text-[#198754] font-semibold">
                {live ? `${live.acceptedCount} lulus dari ${live.totalCount} pendaftar` : 'Terverifikasi'}
              </div>
            </div>
          );
        })}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dee2e6] p-4 bg-[#f8f9fa]">
          <div className="inline-flex rounded-md border border-[#dee2e6] bg-white p-1 self-start">
            <button
              type="button"
              onClick={() => dispatch(setRecapTab('ACCEPTED'))}
              className={`rounded px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                recapTab === 'ACCEPTED'
                  ? 'bg-[#0d6efd] text-white'
                  : 'text-[#495057] hover:bg-[#f8f9fa]'
              }`}
            >
              Daftar Diterima ({recapTotalAccepted})
            </button>
            <button
              type="button"
              onClick={() => dispatch(setRecapTab('WAITLIST'))}
              className={`rounded px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                recapTab === 'WAITLIST'
                  ? 'bg-[#0d6efd] text-white'
                  : 'text-[#495057] hover:bg-[#f8f9fa]'
              }`}
            >
              Daftar Cadangan ({recapTotalWaitlist})
            </button>
          </div>

          <SearchFilterBar
            value={recapSearch}
            onChange={(val) => dispatch(setRecapSearch(val))}
            placeholder="Cari nama atau nomor registrasi..."
            rightSlot={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Cetak Tabel
              </Button>
            }
          />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#dee2e6] bg-[#f8f9fa] text-xs font-semibold uppercase text-[#495057]">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3 whitespace-nowrap">No. Registrasi</th>
                <th className="px-4 py-3">Nama Calon Siswa</th>
                <th className="px-4 py-3">Sekolah Asal</th>
                <th className="px-4 py-3">Jalur</th>
                <th className="px-4 py-3">Skor Akhir</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee2e6] bg-white">
              {recapItems.map((row) => {
                const isSelected = row.registrationNumber === lookupQuery;
                return (
                  <tr
                    key={row.registrationNumber}
                    onClick={() => {
                      dispatch(setLookupQuery(row.registrationNumber));
                      dispatch(setLookupTrack('ALL'));
                      dispatch(
                        fetchPublicSelectionResults({
                          highlight: row.registrationNumber,
                          q: recapSearch,
                          track: 'ALL',
                          tab: recapTab,
                          page: recapPage,
                          pageSize,
                        }),
                      );
                    }}
                    className={`cursor-pointer transition-colors hover:bg-[#f8f9fa] ${
                      isSelected ? 'bg-[#cfe2ff]/35' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-[#6c757d] tabular-nums">
                      {String(row.rank).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#0d6efd] whitespace-nowrap tabular-nums">
                      {row.registrationNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#212529]">
                      {row.fullName}
                      {isSelected && (
                        <span className="ml-2 text-xs font-medium text-[#0d6efd]">(Terpilih)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#495057]">{row.previousSchool}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone="blue">{row.trackLabel}</Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#212529] tabular-nums">
                      {row.finalScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        tone={
                          row.status === 'LULUS UTAMA'
                            ? 'emerald'
                            : row.status === 'CADANGAN PRIORITAS'
                              ? 'amber'
                              : 'slate'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#495057]">{row.originArea}</td>
                  </tr>
                );
              })}

              {recapItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#6c757d]">
                    Tidak ada peserta sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar
          totalItems={recapTotalItems}
          pageSize={pageSize}
          currentPage={recapPage}
          onPageChange={(page) => dispatch(setRecapPage(page))}
        />
      </Card>
    </section>
  );
}
