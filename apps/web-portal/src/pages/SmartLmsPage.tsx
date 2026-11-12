import { useState } from 'react';
import { BookOpen, BrainCircuit, Layers, PlayCircle, Sparkles } from 'lucide-react';
import { Alert, Badge, Button, Card } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

const MODULE_BLOCKS = [
  { id: 'blk-1', order: 1, type: 'TEXT_LATEX', title: 'Konsep Mesin Carnot & Siklus Reversibel', tp: 'TP 3.2', bloom: 'C2 Memahami', dropoutRate: '4% Drop-off (Optimal)' },
  { id: 'blk-2', order: 2, type: 'INTERACTIVE_VIDEO', title: 'Simulasi Video Efisiensi Termal MinIO + Checkpoint Quiz', tp: 'TP 3.2', bloom: 'C3 Menerapkan', dropoutRate: '28% Rewatch di Menit 04:12' },
  { id: 'blk-3', order: 3, type: 'FORMATIVE_QUIZ', title: 'Kuis Adaptif Cabang Remedial vs Pengayaan HOTS', tp: 'TP 3.2', bloom: 'C4 Menganalisis', dropoutRate: 'Trigger LmsAdaptivePathTriggered' },
];

export function SmartLmsPage() {
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="PEMBELAJARAN / DYNAMIC COURSE & ML ANALYTICS"
        title="Smart LMS — Block-Based Composer & Mastery Radar ML"
        subtitle="Penyusunan modul dinamis berbasis blok JSONB (TP & Bloom C1–C6), jalur adaptif remedial/pengayaan otomatis, & analitik pembelajaran ML Python."
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() =>
              setAiNotice(
                'Pipeline Service C (POST /internal/ai/lms/analyze-content) selesai mengkalibrasi bottleneck materi & memperbarui Mastery Radar 36 siswa.',
              )
            }
          >
            Analisis Materi ML (Service C)
          </Button>
        }
      />

      {aiNotice && <Alert tone="info">{aiNotice}</Alert>}

      <ModuleWorkspaceShell
        banner={{
          tone: 'blue',
          tag: 'Knowledge Tracing Aktif',
          message: 'Sinkronisasi kelas otomatis dari teaching_assignments · Telemetri video drop-off & skor kuis mengalir ke lms_learning_events.',
        }}
        kpis={[
          { label: 'Modul Dinamis Terbit', value: '64 Modul', sublabel: 'Template MGMP & Silabus ATP', icon: <Layers className="h-4 w-4" /> },
          { label: 'Rata-rata Mastery TP Kelas', value: '84.6%', sublabel: 'Bayesian Knowledge Tracing', icon: <BrainCircuit className="h-4 w-4" /> },
          { label: 'Jalur Remedial Adaptif', value: '5 Siswa', sublabel: 'Otomatis terbuka via Redis Stream', icon: <BookOpen className="h-4 w-4" /> },
          { label: 'Video MinIO HTTP Range', value: '99.4% Lancar', sublabel: 'Checkpoint Quiz Aktif', icon: <PlayCircle className="h-4 w-4" /> },
        ]}
        tabs={[
          {
            key: 'composer',
            label: 'Block-Based Module Composer',
            badge: '3 Blok',
            content: (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">Struktur Blok Dinamis: Fisika Termodinamika (XI MIPA 1)</h3>
                  <Badge tone="emerald">Conditional Release Aktif</Badge>
                </div>
                {MODULE_BLOCKS.map((b) => (
                  <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone="navy">Blok #{b.order}</Badge>
                        <code className="text-[11px] font-bold text-[#163b8c]">{b.type}</code>
                        <Badge tone="blue">{b.tp} · {b.bloom}</Badge>
                      </div>
                      <div className="mt-1.5 text-sm font-extrabold text-slate-900">{b.title}</div>
                    </div>
                    <Badge tone={b.dropoutRate.includes('28%') ? 'amber' : 'emerald'}>{b.dropoutRate}</Badge>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'mastery',
            label: 'ML Mastery Radar & Klaster',
            content: (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Peta Penguasaan Tujuan Pembelajaran (Service C ML)</h3>
                <ProgressMeter label="TP 3.1 — Teori Kinetik Gas" rightTop="91% Tuntas" percentage={91} tone="emerald" />
                <ProgressMeter label="TP 3.2 — Siklus Carnot (Deteksi Bottleneck)" rightTop="74% Tuntas" percentage={74} tone="amber" leftBottom="Disarankan pengulangan animasi efisiensi termal" />
                <ProgressMeter label="TP 3.3 — Eksperimen Kalorimetri" rightTop="88% Tuntas" percentage={88} tone="blue" />
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Klaster Ritme Belajar (K-Means)</h3>
            {[
              { cluster: 'Fast Mastery (Pengayaan HOTS)', count: '14 Siswa', tone: 'emerald' as const },
              { cluster: 'Steady Visual Learner', count: '17 Siswa', tone: 'blue' as const },
              { cluster: 'Need Scaffold / Remedial', count: '5 Siswa', tone: 'amber' as const },
            ].map((c) => (
              <div key={c.cluster} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs">
                <span className="font-bold text-slate-800">{c.cluster}</span>
                <Badge tone={c.tone}>{c.count}</Badge>
              </div>
            ))}
          </Card>
        }
      />
    </div>
  );
}
