import { ArrowRight, CheckCircle2, FileText, Save, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { saveDraftTimestamp, setWizardStep } from '../../store/slices/ppdbPublicSlice';
import { Badge, Button, Card } from '../atoms';
import { DocChecklistItem } from '../molecules';

interface PpdbWizardSidebarProps {
  onFinalSubmit: () => void;
}

export function PpdbWizardSidebar({ onFinalSubmit }: PpdbWizardSidebarProps) {
  const dispatch = useAppDispatch();
  const { currentStep, draft, checklist, submitting, lastSavedAt, submitResult } = useAppSelector(
    (s) => s.ppdbPublic,
  );

  const initials = draft.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const completedCount = checklist.filter((c) => c.status !== 'REQUIRED').length;
  const hasIdentity = Boolean(draft.fullName.trim() && draft.username.trim());

  return (
    <div className="space-y-4 lg:sticky lg:top-20">
      {/* Applicant Profile Summary Card */}
      <Card padding="md">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded bg-[#0d6efd] text-white font-bold text-sm">
            <span>{initials || 'CS'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <Badge tone={submitResult ? 'emerald' : 'slate'} className="tabular-nums">
              {submitResult ? submitResult.registrationNumber : 'Draf Baru'}
            </Badge>
            <h3 className="mt-1 text-base font-bold text-[#212529] truncate">
              {draft.fullName || 'Calon Peserta Didik'}
            </h3>
            <p className="text-xs text-[#6c757d]">Calon Peserta Didik Baru</p>
            <div
              className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                hasIdentity ? 'text-[#198754]' : 'text-[#6c757d]'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{hasIdentity ? 'Data Diri Terisi' : 'Menunggu pengisian data'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-500">Nomor Induk Siswa (NISN)</div>
            <div className="font-bold text-slate-900 tabular-nums mt-0.5">
              {draft.nisn || '-'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500">Nomor Kependudukan (NIK)</div>
            <div className="font-bold text-slate-900 tabular-nums mt-0.5 truncate">
              {draft.nik || '-'}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-extrabold">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Duplicate Guard Aktif</span>
          </div>
          <p className="mt-0.5 text-[11px] text-emerald-800">
            NIK &amp; NISN Valid · Belum terdaftar di jalur lain.
          </p>
        </div>
      </Card>

      {/* Document Checklist Card */}
      <Card padding="md">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <FileText className="h-4 w-4 text-[#163b8c]" />
            <span>Brankas Berkas Wajib</span>
          </div>
          <span className="text-xs font-extrabold text-[#163b8c] tabular-nums">
            {completedCount} / {checklist.length} Siap
          </span>
        </div>

        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#163b8c] transition-all duration-300"
            style={{ width: `${(completedCount / checklist.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <DocChecklistItem
              key={item.code}
              item={item}
              onPreview={() => dispatch(setWizardStep(3))}
            />
          ))}
        </div>

        <div className="mt-5 space-y-2.5">
          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => dispatch(setWizardStep(currentStep + 1))}
            >
              Lanjutkan ke Langkah {currentStep + 1}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={onFinalSubmit}
            >
              {submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran E-PPDB'}
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            fullWidth
            leftIcon={<Save className="h-4 w-4" />}
            onClick={() => dispatch(saveDraftTimestamp())}
          >
            Simpan Draf Pendaftaran
          </Button>
        </div>

        <p className="mt-3 text-center text-[11px] text-slate-500">
          {lastSavedAt
            ? `Draf terakhir disimpan pada pukul ${lastSavedAt} WIB.`
            : 'Data Anda tersimpan otomatis di browser selama pengisian draf E-PPDB.'}
        </p>
      </Card>
    </div>
  );
}

