import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Lock,
  Send,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { BukuIndukStudentRecord } from '../../store/slices/portalSlice';
import { Alert, Badge, Button, Card } from '../atoms';

interface BukuIndukProfileRailProps {
  student: BukuIndukStudentRecord;
}

const LEGAL_FILES = [
  { name: 'Kartu_Keluarga_3174xxxx.pdf', meta: '1.2 MB • Dukcapil QR Valid' },
  { name: 'Akta_Kelahiran_Farhan.pdf', meta: '840 KB • Terverifikasi TU' },
  { name: 'Ijazah_SMP_2024.pdf', meta: '2.4 MB • Legalisir Sekolah Asal' },
  { name: 'Pas_Foto_Resmi_3x4.jpg', meta: '420 KB • Resolusi Cetak' },
];

export function BukuIndukProfileRail({ student }: BukuIndukProfileRailProps) {
  const [railNotice, setRailNotice] = useState<string | null>(null);

  const initials = student.fullName
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('');

  return (
    <div className="space-y-5">
      {/* Main Student Profile Card */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded bg-gradient-to-br from-[#0f2b6b] to-blue-600 text-base font-extrabold text-white shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge tone="emerald">{student.status}</Badge>
              <Badge tone="blue">{student.phase}</Badge>
            </div>
            <h2 className="mt-1 text-base font-extrabold text-slate-900 truncate">
              {student.fullName}
            </h2>
            <div className="text-[11px] text-slate-600 tabular-nums space-y-0.5 mt-0.5">
              <div>
                NIS: <strong>{student.nis}</strong>
              </div>
              <div>
                NISN: <strong>{student.nisn}</strong>
              </div>
              <div>
                Rombel: <strong>{student.className}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold text-slate-500">KIP / PIP</div>
            <div className="font-extrabold text-slate-900 mt-0.5">{student.kipPipStatus}</div>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold text-slate-500">Gol. Darah</div>
            <div className="font-extrabold text-slate-900 mt-0.5">{student.bloodType}</div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <CreditCard className="h-4 w-4 text-[#163b8c] shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-500">Smart RFID Card</div>
              <div className="font-extrabold text-slate-900 tabular-nums truncate">
                UID: {student.rfidUid} (Aktif)
              </div>
            </div>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            DATA ORANG TUA &amp; KONTAK VALID
          </div>

          <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-xs">
            <div>
              <div className="font-bold text-slate-900">{student.fatherName}</div>
              <div className="text-[11px] text-slate-500">{student.fatherJob}</div>
            </div>
            {student.nikMatch && <Badge tone="emerald">NIK Match</Badge>}
          </div>

          <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-xs">
            <div>
              <div className="font-bold text-slate-900">{student.motherName}</div>
              <div className="text-[11px] text-slate-500">{student.motherJob}</div>
            </div>
            {student.nikMatch && <Badge tone="emerald">NIK Match</Badge>}
          </div>

          <div className="flex items-center justify-between rounded border border-blue-100 bg-blue-50/50 px-3 py-2 text-xs">
            <div>
              <div className="font-bold text-slate-900 tabular-nums">{student.parentPhone}</div>
              <div className="text-[10px] font-semibold text-emerald-700">
                WhatsApp Wali Terverifikasi
              </div>
            </div>
            <Send className="h-3.5 w-3.5 text-[#163b8c]" />
          </div>
        </div>
      </Card>

      {/* Brankas Legalitas MinIO */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Lock className="h-4 w-4 text-[#163b8c]" />
            <span>Brankas Legalitas (MinIO)</span>
          </div>
          <Badge tone="emerald">4 Berkas Sah</Badge>
        </div>
        <p className="text-[11px] text-slate-500">
          Dokumen terenkripsi SHA-256 tersimpan aman pada storage internal sekolah.
        </p>

        {railNotice && <Alert tone="info">{railNotice}</Alert>}

        <div className="space-y-2">
          {LEGAL_FILES.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="h-4 w-4 text-rose-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{file.meta}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setRailNotice(`Membuat MinIO Presigned URL 15 menit untuk ${file.name}.`)
                }
                className="text-slate-400 hover:text-[#163b8c] cursor-pointer"
                aria-label={`Preview ${file.name}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          leftIcon={<Upload className="h-3.5 w-3.5" />}
          onClick={() =>
            setRailNotice('Pilih dokumen baru untuk versioning arsip legalitas Buku Induk.')
          }
        >
          Unggah Arsip
        </Button>
      </Card>

      {/* Quick Admin Services */}
      <Card padding="md" className="space-y-2.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          LAYANAN ADMINISTRASI KILAT
        </div>
        {[
          'Surat Ket. Aktif (PDF QR)',
          'Ajukan Ubah Data Biodata',
          'Cetak Kartu Pelajar RFID/QR',
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setRailNotice(`Memproses permintaan: ${label} untuk ${student.fullName}.`)}
            className="flex w-full items-center justify-between rounded border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#163b8c] transition-colors cursor-pointer"
          >
            <span>{label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        ))}
      </Card>
    </div>
  );
}

