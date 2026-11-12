import { Check, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setWizardStep } from '../../store/slices/ppdbPublicSlice';
import { Badge } from '../atoms';

const WIZARD_STEPS = [
  { step: 1, title: 'Jalur & Data Diri' },
  { step: 2, title: 'Zonasi & Asal Sekolah' },
  { step: 3, title: 'Unggah Berkas MinIO' },
  { step: 4, title: 'Pembayaran VA/QRIS' },
  { step: 5, title: 'Cetak Kartu Ujian' },
];

export function PpdbWizardStepper() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((s) => s.ppdbPublic.currentStep);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#163b8c]">
            E-PPDB MANDIRI TERPADU 2026/2027 • Sistem Geotagging Presisi
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Formulir Pendaftaran Siswa Baru
          </h1>
        </div>

        <Badge tone="blue" icon={<Clock className="h-3.5 w-3.5" />}>
          Batas Pengisian Form · <strong className="tabular-nums">23 Jam : 42 Menit tersisa</strong>
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 rounded border border-slate-200 bg-white p-2.5 shadow-2xs">
        {WIZARD_STEPS.map((item) => {
          const isCompleted = item.step < currentStep;
          const isActive = item.step === currentStep;

          return (
            <button
              key={item.step}
              type="button"
              onClick={() => dispatch(setWizardStep(item.step))}
              className={`flex items-center gap-2.5 rounded px-3 py-2 text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 border border-[#163b8c]/30 text-[#163b8c]'
                  : isCompleted
                    ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-800'
                    : 'hover:bg-slate-50 text-slate-500 border border-transparent'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums ${
                  isActive
                    ? 'bg-[#163b8c] text-white'
                    : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : item.step}
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wider">
                  LANGKAH {item.step} {isActive ? '(AKTIF)' : ''}
                </div>
                <div className="text-xs font-bold truncate">{item.title}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

