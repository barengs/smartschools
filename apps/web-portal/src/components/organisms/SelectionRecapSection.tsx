import { Download } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  SELECTION_CANDIDATE_DIRECTORY,
  setLookupQuery,
  setLookupTrack,
  runSelectionLookup,
  setRecapPage,
  setRecapSearch,
  setRecapTab,
} from '../../store/slices/ppdbPublicSlice';
import { Badge, Button, Card, SectionHeading } from '../atoms';
import { PaginationBar, SearchFilterBar, StatCard } from '../molecules';

const QUOTA_CARDS = [
  { label: 'Zonasi Murni (50%)', value: '150 Kursi', sublabel: 'Passing Grade Jarak: 690 m' },
  { label: 'Prestasi Akademik (25%)', value: '75 Kursi', sublabel: 'Rata-rata Skor: 92.60' },
  { label: 'Afirmasi / KETM (15%)', value: '45 Kursi', sublabel: 'Terverifikasi DTKS Kemensos' },
  { label: 'Mutasi & Pendidik (10%)', value: '30 Kursi', sublabel: 'Surat Tugas Dinas Valid' },
];

export function SelectionRecapSection() {
  const dispatch = useAppDispatch();
  const { recapTab, recapSearch, recapPage, lookupQuery } = useAppSelector((s) => s.ppdbPublic);

  const filtered = SELECTION_CANDIDATE_DIRECTORY.filter((row) => {
    const matchesTab =
      recapTab === 'ACCEPTED'
        ? row.status === 'LULUS UTAMA'
        : row.status !== 'LULUS UTAMA';
    const q = recapSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      row.registrationNumber.toLowerCase().includes(q) ||
      row.fullName.toLowerCase().includes(q) ||
      row.previousSchool.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  const pageSize = 5;
  const paged = filtered.slice((recapPage - 1) * pageSize, recapPage * pageSize);

  return (
    <section className="space-y-5">
      <SectionHeading
        kicker="KETERBUKAAN DATA PUBLIK"
        title="Rekapitulasi Kuota & Hasil Seleksi Terbuka"
        rightSlot={
          <div className="text-xs font-semibold text-slate-600">
            Total Pendaftar Masuk: <strong className="text-slate-900">1.240 Berkas</strong> · Target
            Kursi Utama: <strong className="text-emerald-700">300 Siswa (100% Kuota)</strong>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUOTA_CARDS.map((q) => (
          <div key={q.label} className="relative">
            <StatCard value={q.value} label={q.label} sublabel={q.sublabel} />
            <span className="absolute top-3.5 right-3.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              100% Kuota
            </span>
          </div>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 p-4 bg-slate-50/70">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 self-start">
            <button
              type="button"
              onClick={() => dispatch(setRecapTab('ACCEPTED'))}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                recapTab === 'ACCEPTED'
                  ? 'bg-white text-[#163b8c] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Diterima (300)
            </button>
            <button
              type="button"
              onClick={() => dispatch(setRecapTab('WAITLIST'))}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                recapTab === 'WAITLIST'
                  ? 'bg-white text-[#163b8c] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Cadangan / Waiting List (24)
            </button>
          </div>

          <SearchFilterBar
            value={recapSearch}
            onChange={(val) => dispatch(setRecapSearch(val))}
            placeholder="Cari nama atau nomor..."
            rightSlot={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={() => window.print()}
              >
                Cetak / Ekspor
              </Button>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">No. Registrasi</th>
                <th className="px-4 py-3">Nama Calon Siswa</th>
                <th className="px-4 py-3">Sekolah Asal</th>
                <th className="px-4 py-3">Jalur</th>
                <th className="px-4 py-3">Skor Akhir</th>
                <th className="px-4 py-3">Status Kelulusan</th>
                <th className="px-4 py-3">Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paged.map((row) => {
                const isSelected = row.registrationNumber === lookupQuery;
                return (
                  <tr
                    key={row.registrationNumber}
                    onClick={() => {
                      dispatch(setLookupQuery(row.registrationNumber));
                      dispatch(setLookupTrack('ALL'));
                      dispatch(runSelectionLookup());
                    }}
                    className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${
                      isSelected ? 'bg-blue-50/70' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-slate-600 tabular-nums">
                      {String(row.rank).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#163b8c] tabular-nums">
                      {row.registrationNumber}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {row.fullName}
                      {isSelected && (
                        <span className="ml-2 text-[10px] font-semibold text-blue-700">
                          (Sedang Ditinjau)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.previousSchool}</td>
                    <td className="px-4 py-3">
                      <Badge tone="blue">{row.trackLabel}</Badge>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 tabular-nums">
                      {row.finalScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-slate-600">{row.originArea}</td>
                  </tr>
                );
              })}

              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada peserta sesuai kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar
          totalItems={filtered.length}
          pageSize={pageSize}
          currentPage={recapPage}
          onPageChange={(page) => dispatch(setRecapPage(page))}
        />
      </Card>
    </section>
  );
}

