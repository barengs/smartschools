import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPublicSelectionResults,
  SelectionCandidateRecord,
  setLookupQuery,
  setLookupTrack,
  setRecapPage,
  setRecapSearch,
  setRecapTab,
} from '../../store/slices/ppdbPublicSlice';
import { Badge, Button, Card, SectionHeading } from '../atoms';
import { DataTable, PaginationBar, SearchFilterBar } from '../molecules';

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

  const columns = useMemo<ColumnDef<SelectionCandidateRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'rank',
        header: 'No',
        cell: ({ row }) => (
          <span className="font-semibold text-[#6c757d] tabular-nums">
            {String(row.original.rank).padStart(2, '0')}
          </span>
        ),
      },
      {
        accessorKey: 'registrationNumber',
        header: 'No. Registrasi',
        cell: ({ row }) => (
          <span className="font-semibold text-[#0d6efd] whitespace-nowrap tabular-nums">
            {row.original.registrationNumber}
          </span>
        ),
      },
      {
        accessorKey: 'fullName',
        header: 'Nama Calon Siswa',
        cell: ({ row }) => {
          const isSelected = row.original.registrationNumber === lookupQuery;
          return (
            <span className="font-semibold text-[#212529]">
              {row.original.fullName}
              {isSelected && (
                <span className="ml-2 text-xs font-medium text-[#0d6efd]">(Terpilih)</span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: 'previousSchool',
        header: 'Sekolah Asal',
        cell: ({ row }) => <span className="text-[#495057]">{row.original.previousSchool}</span>,
      },
      {
        accessorKey: 'trackLabel',
        header: 'Jalur',
        cell: ({ row }) => <Badge tone="blue">{row.original.trackLabel}</Badge>,
      },
      {
        accessorKey: 'finalScore',
        header: 'Skor Akhir',
        cell: ({ row }) => (
          <span className="font-bold text-[#212529] tabular-nums">
            {row.original.finalScore.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            tone={
              row.original.status === 'LULUS UTAMA'
                ? 'emerald'
                : row.original.status === 'CADANGAN PRIORITAS'
                  ? 'amber'
                  : 'slate'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'originArea',
        header: 'Area',
        cell: ({ row }) => <span className="text-[#495057]">{row.original.originArea}</span>,
      },
    ],
    [lookupQuery],
  );

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
          <div className="inline-flex rounded border border-[#dee2e6] bg-white p-1 self-start">
            <button
              type="button"
              onClick={() => dispatch(setRecapTab('ACCEPTED'))}
              className={`rounded-sm px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
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
              className={`rounded-sm px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
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
                onClick={() => {
                  toast.info('Membuka dialog cetak tabel hasil seleksi...');
                  window.print();
                }}
              >
                Cetak Tabel
              </Button>
            }
          />
        </div>

        <DataTable
          data={recapItems}
          columns={columns}
          emptyMessage="Tidak ada peserta sesuai kriteria pencarian."
          getRowClassName={(row) =>
            row.registrationNumber === lookupQuery ? 'bg-[#cfe2ff]/35' : ''
          }
          onRowClick={(row) => {
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
            toast.info(`Menampilkan rincian skor ${row.fullName}`);
          }}
        />

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
