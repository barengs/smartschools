import { FormEvent } from 'react';
import { Award, CheckCircle2, Clock, FileCheck2, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  runSelectionLookup,
  setLookupQuery,
  setLookupTrack,
} from '../../store/slices/ppdbPublicSlice';
import { Badge, Button, Card, Input, Select } from '../atoms';
import { FormField } from '../molecules';

export function SelectionLookupCard() {
  const dispatch = useAppDispatch();
  const { lookupQuery, lookupTrack } = useAppSelector((s) => s.ppdbPublic);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    dispatch(runSelectionLookup());
  }

  return (
    <Card padding="lg" className="border-slate-200/90 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163b8c] text-white">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Pengecekan Mandiri Status Kelulusan
            </h2>
            <p className="text-[11px] text-slate-500">
              Sistem Verifikasi Real-Time terhubung ke Server E-PPDB Pusat
            </p>
          </div>
        </div>
        <Badge tone="blue" icon={<Award className="h-3.5 w-3.5" />}>
          SK Penetapan Kepsek No. 421/002-SMAN/PPDB/2026
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
        <FormField label="Nomor Pendaftaran / NISN" required className="md:col-span-5">
          <Input
            value={lookupQuery}
            onChange={(e) => dispatch(setLookupQuery(e.target.value))}
            placeholder="Contoh: PPDB-2026-0481 atau 0098127364"
            leftIcon={<FileCheck2 className="h-4 w-4" />}
          />
        </FormField>

        <FormField label="Jalur Pendaftaran" className="md:col-span-4">
          <Select
            value={lookupTrack}
            onChange={(e) => dispatch(setLookupTrack(e.target.value))}
          >
            <option value="ZONASI">Jalur Zonasi Domisili Murni</option>
            <option value="PRESTASI">Jalur Prestasi Akademik &amp; Non-Akademik</option>
            <option value="AFIRMASI">Jalur Afirmasi KIP / PKH</option>
            <option value="MUTASI">Jalur Mutasi / Anak Guru</option>
            <option value="ALL">Semua Jalur Seleksi</option>
          </Select>
        </FormField>

        <div className="md:col-span-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Search className="h-4 w-4" />}
          >
            Cek Status Hasil Seleksi
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Sistem Enkripsi Sertifikat SSL 256-Bit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Data Sinkronisasi Dapodik Kemendikbud
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#163b8c]" />
          Update Terakhir: 22 November 2026, 08:00 WIB
        </span>
      </div>
    </Card>
  );
}

