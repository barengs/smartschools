import { FormEvent } from 'react';
import { Award, CheckCircle2, FileCheck2, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPublicSelectionResults,
  setLookupQuery,
  setLookupTrack,
} from '../../store/slices/ppdbPublicSlice';
import { Badge, Button, Card, Input, Select } from '../atoms';
import { FormField } from '../molecules';

export function SelectionLookupCard() {
  const dispatch = useAppDispatch();
  const { lookupQuery, lookupTrack, recapTab, resultsLoading } = useAppSelector(
    (s) => s.ppdbPublic,
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    dispatch(
      fetchPublicSelectionResults({
        highlight: lookupQuery,
        track: lookupTrack,
        tab: recapTab,
        page: 1,
        pageSize: 6,
      }),
    );
  }

  return (
    <Card padding="lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#dee2e6]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0d6efd] text-white shrink-0">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#212529]">
              Pengecekan Mandiri Status Kelulusan
            </h2>
            <p className="text-xs text-[#6c757d]">
              Terhubung langsung ke server database pendaftaran E-PPDB
            </p>
          </div>
        </div>
        <Badge tone="blue" icon={<Award className="h-3.5 w-3.5" />}>
          SK Kepsek No. 421/002-PPDB/2026
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
        <FormField label="Nomor Pendaftaran / NISN / Nama" required className="md:col-span-5">
          <Input
            value={lookupQuery}
            onChange={(e) => dispatch(setLookupQuery(e.target.value))}
            placeholder="Contoh: PPDB-2026-0191 atau Aisyah"
            leftIcon={<FileCheck2 className="h-4 w-4" />}
          />
        </FormField>

        <FormField label="Jalur Pendaftaran" className="md:col-span-4">
          <Select
            value={lookupTrack}
            onChange={(e) => dispatch(setLookupTrack(e.target.value))}
          >
            <option value="ALL">Semua Jalur Seleksi</option>
            <option value="ZONASI">Jalur Zonasi Domisili</option>
            <option value="PRESTASI">Jalur Prestasi Akademik</option>
            <option value="AFIRMASI">Jalur Afirmasi KIP / PKH</option>
            <option value="MUTASI">Jalur Mutasi / Anak Guru</option>
          </Select>
        </FormField>

        <div className="md:col-span-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={resultsLoading}
            leftIcon={<Search className="h-4 w-4" />}
          >
            Cek Status Seleksi
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#6c757d] border-t border-[#dee2e6] pt-3">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#198754]" />
          Koneksi Terenkripsi TLS
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#198754]" />
          Data Sinkronisasi Dapodik &amp; Dukcapil
        </span>
      </div>
    </Card>
  );
}
