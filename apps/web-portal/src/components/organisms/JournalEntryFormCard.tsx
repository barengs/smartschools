import { FormEvent } from 'react';
import { Check, NotebookPen, Save, Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  saveJournalDraft,
  setJournalNotes,
  setJournalSelectedTp,
  setJournalSyncParent,
  setJournalTopic,
  submitJournalRecord,
  toggleJournalMethod,
} from '../../store/slices/portalSlice';
import { Alert, Badge, Button, Card, Input, Select, Textarea } from '../atoms';
import { FormField } from '../molecules';

const LEARNING_METHODS = [
  'Praktikum Lab',
  'Diskusi Kelompok',
  'LMS Quiz',
  'Ceramah Interaktif',
  'Demonstrasi Alat Peraga',
];

export function JournalEntryFormCard() {
  const dispatch = useAppDispatch();
  const {
    journalSelectedTp,
    journalTopic,
    journalMethods,
    journalNotes,
    journalSyncParent,
    journalDraftSavedAt,
    journalSubmittedNotice,
  } = useAppSelector((s) => s.portal);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    dispatch(submitJournalRecord());
  }

  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163b8c] text-white">
            <NotebookPen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Form Jurnal Mengajar KBM</h2>
            <p className="text-[11px] text-slate-500">
              Estimasi pengisian &lt; 1 menit melalui Master Data terhubung
            </p>
          </div>
        </div>
        <Badge tone="emerald">
          {journalDraftSavedAt
            ? `Tersimpan Pukul ${journalDraftSavedAt}`
            : 'Tersimpan Otomatis (Local Draft)'}
        </Badge>
      </div>

      {journalSubmittedNotice && <Alert tone="success">{journalSubmittedNotice}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Capaian Pembelajaran / Tujuan Pembelajaran (TP)">
          <Select
            value={journalSelectedTp}
            onChange={(e) => dispatch(setJournalSelectedTp(e.target.value))}
          >
            <option value="TP 3.2 - Menganalisis Hukum Termodinamika dan Penerapannya pada Siklus Mesin Kalor">
              TP 3.2 - Menganalisis Hukum Termodinamika dan Penerapannya pada Siklus Mesin Kalor
            </option>
            <option value="TP 3.1 - Menjelaskan Persamaan Gas Ideal dan Teori Kinetik Gas">
              TP 3.1 - Menjelaskan Persamaan Gas Ideal dan Teori Kinetik Gas
            </option>
            <option value="TP 3.3 - Merancang Eksperimen Kalorimetri & Perpindahan Kalor">
              TP 3.3 - Merancang Eksperimen Kalorimetri &amp; Perpindahan Kalor
            </option>
          </Select>
        </FormField>

        <FormField label="Materi Pokok / Topik Pembelajaran Hari Ini" required>
          <Input
            value={journalTopic}
            onChange={(e) => dispatch(setJournalTopic(e.target.value))}
            required
          />
        </FormField>

        <FormField
          label="Metode & Aktivitas Pembelajaran (Klik untuk memilih)"
          rightSlot={<span>Pilih 1 atau lebih</span>}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {LEARNING_METHODS.map((method) => {
              const active = journalMethods.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => dispatch(toggleJournalMethod(method))}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'border-[#163b8c] bg-[#163b8c] text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  <span>{method}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="Catatan Khusus / Hambatan KBM (Opsional)"
          rightSlot={<span>Terekam di Portofolio Guru</span>}
        >
          <Textarea
            rows={3}
            value={journalNotes}
            onChange={(e) => dispatch(setJournalNotes(e.target.value))}
          />
        </FormField>

        <FormField
          label="Dokumentasi Foto KBM (Opsional Lampiran)"
          rightSlot={<span>Maks. 2 Foto • Auto-Kompres</span>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-700 p-4 text-white h-28 flex flex-col justify-end">
              <Badge tone="navy" className="self-start">
                Foto Lab Kalori.jpg
              </Badge>
              <div className="text-[11px] text-slate-200 mt-1">
                Dokumentasi Praktikum Kelompok 3 · Terlampir
              </div>
            </div>

            <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              <Upload className="h-5 w-5 text-[#163b8c]" />
              <span className="mt-1.5 text-xs font-bold">Pilih Berkas</span>
              <span className="text-[10px] text-slate-500">Format JPG, PNG (Maks 5MB)</span>
              <input type="file" accept="image/*" className="sr-only" />
            </label>
          </div>
        </FormField>

        <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={journalSyncParent}
            onChange={(e) => dispatch(setJournalSyncParent(e.target.checked))}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#163b8c]"
          />
          <div>
            <div className="font-bold text-slate-900">
              Sinkronkan presensi ke Parent App &amp; SIAKAD Pusat
            </div>
            <div className="text-[11px] text-slate-500">
              Notifikasi push otomatis dikirimkan ke aplikasi wali murid jika terdapat status
              Sakit/Izin/Alpha.
            </div>
          </div>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={() => dispatch(saveJournalDraft())}
          >
            Simpan Draf
          </Button>
          <Button type="submit" variant="primary" size="md" leftIcon={<Check className="h-4 w-4" />}>
            Kirim Jurnal
          </Button>
        </div>
      </form>
    </Card>
  );
}

