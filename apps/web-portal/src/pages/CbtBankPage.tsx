import { useState } from 'react';
import { Cpu, FileSpreadsheet, Lock, ShieldCheck, Zap } from 'lucide-react';
import { Alert, Badge, Button, Card } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

export function CbtBankPage() {
  const [prewarmStatus, setPrewarmStatus] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="PEMBELAJARAN / CBT ENGINE RUST & KALIBRASI IRT"
        title="Bank Soal AKM & Monitor Ujian CBT Anti-Down"
        subtitle="Penyusunan soal AKM (PG Kompleks, Menjodohkan, Esai), Pre-Warming Redis H-15 menit via Service B (Rust), Exam Lock, & Kalibrasi Butir Soal IRT."
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Zap className="h-3.5 w-3.5" />}
            onClick={() =>
              setPrewarmStatus(
                'POST /internal/engine/cbt/sts-fisika-xi/prewarm dieksekusi Rust: 40 soal terenkripsi & termuat ke Redis cbt:exam:*:payload.',
              )
            }
          >
            Trigger Pre-Warm Redis H-15m
          </Button>
        }
      />

      {prewarmStatus && <Alert tone="success">{prewarmStatus}</Alert>}

      <ModuleWorkspaceShell
        banner={{
          tone: 'emerald',
          tag: 'Rust Axum CBT Ready',
          message: 'Kapasitas teruji >= 1.000 peserta serentak dengan utilisasi CPU 14% · Exam Browser Lock & deteksi pindah tab aktif.',
        }}
        kpis={[
          { label: 'Bank Soal AKM Terkurasi', value: '1.840 Butir', sublabel: 'PG Kompleks, Menjodohkan, Esai', icon: <FileSpreadsheet className="h-4 w-4" /> },
          { label: 'Peserta CBT Aktif', value: '1.042 Siswa', sublabel: 'WebSocket Heartbeat < 5ms', icon: <Cpu className="h-4 w-4" /> },
          { label: 'Auto-Grading Selesai', value: '0.4 ms/siswa', sublabel: 'Auto-sync ke E-Rapor & PPDB', icon: <ShieldCheck className="h-4 w-4" /> },
          { label: 'Pelanggaran Exam Lock', value: '2 Peringatan', sublabel: 'Tercatat cheat_violation_count', icon: <Lock className="h-4 w-4 text-rose-600" /> },
        ]}
        tabs={[
          {
            key: 'sessions',
            label: 'Sesi Ujian & Placement Test',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Daftar Paket Ujian CBT Terjadwal</h3>
                {[
                  { code: 'CBT-STS-FIS11', title: 'STS Ganjil Fisika Kelas XI', participants: '216 Siswa', lock: 'Exam Browser Lock', state: 'PRE-WARMED' },
                  { code: 'CBT-PPDB-2026', title: 'Placement Test E-PPDB Gelombang 1', participants: '420 Peserta', lock: 'QR Token + Acak Soal', state: 'AKTIF' },
                ].map((ex) => (
                  <div key={ex.code} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-slate-200 p-3.5">
                    <div>
                      <div className="font-extrabold text-slate-900">{ex.title}</div>
                      <div className="text-slate-500 mt-0.5">{ex.code} · {ex.participants} · {ex.lock}</div>
                    </div>
                    <Badge tone="emerald">{ex.state}</Badge>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'irt',
            label: 'Kalibrasi IRT Soal (ML Python)',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Evaluasi Kualitas Butir Soal (lms_item_calibration)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card padding="sm"><div className="font-bold">Butir #07 (Termodinamika)</div><div className="text-slate-500 mt-0.5">p-value: 0.62 (Sedang) · Daya Pembeda: 0.48 (Baik)</div></Card>
                  <Card padding="sm"><div className="font-bold text-amber-700">Butir #19 (Pengecoh Opsi D Lemah)</div><div className="text-slate-500 mt-0.5">0% siswa memilih opsi D · Disarankan revisi</div></Card>
                </div>
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Kesehatan Klaster CBT Rust</h3>
            <ProgressMeter label="Flush Jawaban Redis → PostgreSQL" rightTop="100% Aman" percentage={100} tone="emerald" />
            <ProgressMeter label="Utilisasi CPU Node CBT" rightTop="14%" percentage={14} tone="blue" />
          </Card>
        }
      />
    </div>
  );
}
