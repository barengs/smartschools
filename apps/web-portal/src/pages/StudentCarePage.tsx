import { Award, GraduationCap, HeartPulse, Lock, ShieldAlert, Users } from 'lucide-react';
import { Badge, Card } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

export function StudentCarePage() {
  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="LAYANAN KESISWAAN TERPADU"
        title="Layanan Kesiswaan: E-BK, E-UKS, Ekskul/OSIS, & Alumni Tracer"
        subtitle="Tata tertib poin disiplin/prestasi, konseling terenkripsi AES-256-GCM, rekam medis & stok obat UKS, dispensasi SIAKAD, beasiswa KIP, & Tracer Study."
      />

      <ModuleWorkspaceShell
        banner={{
          tone: 'emerald',
          tag: 'Privasi AES-256-GCM Aktif',
          message: 'Catatan psikologis E-BK (counseling_records) dan diagnosis E-UKS dienkripsi tingkat aplikasi khusus petugas berwenang.',
        }}
        kpis={[
          { label: 'Sesi Konseling E-BK', value: '18 Sesi', sublabel: '3 Rujukan dari Alert EWS Python', icon: <Lock className="h-4 w-4 text-[#163b8c]" /> },
          { label: 'Kunjungan & Screening UKS', value: '6 Kunjungan', sublabel: 'Alergi sinkron ke Buku Induk', icon: <HeartPulse className="h-4 w-4 text-rose-600" /> },
          { label: 'Ekskul & Dispensasi Lomba', value: '22 Ekskul', sublabel: 'Auto-sinkron izin absen SIAKAD', icon: <Award className="h-4 w-4" /> },
          { label: 'Alumni & Tracer Study', value: '86.4%', sublabel: 'Response Rate Angkatan 2025/2026', icon: <GraduationCap className="h-4 w-4 text-emerald-600" /> },
        ]}
        tabs={[
          {
            key: 'ebk',
            label: 'E-BK: Poin Tata Tertib & Konseling',
            badge: 'AES-256',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Monitoring Poin Disiplin, Prestasi &amp; Eskalasi SP</h3>
                {[
                  { student: 'Bintang Pratama (XII IPS 1)', type: 'Pelanggaran Kedisiplinan', points: '+45 Poin Pelanggaran', action: 'Eskalasi Panggilan Orang Tua (SP1)', tone: 'rose' as const },
                  { student: 'Muhammad Farhan (XI MIPA 1)', type: 'Prestasi OSN Provinsi', points: '+45 Poin Prestasi', action: 'Tersinkron ke Transkrip & E-Rapor', tone: 'emerald' as const },
                ].map((r) => (
                  <div key={r.student} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-slate-200 p-3.5">
                    <div>
                      <div className="font-extrabold text-slate-900">{r.student}</div>
                      <div className="text-slate-600 mt-0.5">{r.type} · Tindak lanjut: <strong>{r.action}</strong></div>
                    </div>
                    <Badge tone={r.tone}>{r.points}</Badge>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'euks',
            label: 'E-UKS & Inventaris Obat',
            content: (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-extrabold text-slate-900">Rekam Kunjungan UKS &amp; Screening Berkala</h3>
                <p>Golongan darah &amp; catatan alergi obat/makanan otomatis tersinkron ke profil Buku Induk 360°. Notifikasi darurat terkirim ke Parent App bila siswa dirujuk pulang.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card padding="sm"><div className="font-bold text-slate-900">Screening IMT, Gigi &amp; Mata Kelas X</div><div className="mt-0.5">Selesai untuk 318 / 320 siswa</div></Card>
                  <Card padding="sm"><div className="font-bold text-amber-700">Stok Obat P3K: Paracetamol 500mg</div><div className="mt-0.5">Sisa 24 strip · Exp Mar 2027</div></Card>
                </div>
              </div>
            ),
          },
          {
            key: 'ekskul',
            label: 'Ekskul, OSIS & Dispensasi SIAKAD',
            content: (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-extrabold text-slate-900">Dispensasi Resmi Lomba &amp; Proposal OSIS</h3>
                <p>Dispensasi lomba (mis. Robotik Nasional UGM a.n. Bagas Dimas Satria) otomatis mengubah status absen per jam pelajaran guru menjadi Izin Resmi.</p>
              </div>
            ),
          },
          {
            key: 'alumni',
            label: 'Beasiswa KIP & Alumni Tracer',
            content: (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-extrabold text-slate-900">Penerima KIP/PIP &amp; Direktori Alumni Ber-QR</h3>
                <p>Lulusan berstatus <code>GRADUATED</code> otomatis masuk Direktori Alumni untuk survei Tracer Study PTN/BKK dan pengajuan legalisir ijazah QR.</p>
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#163b8c]" />
              <span>Indeks Kesejahteraan Siswa</span>
            </h3>
            <ProgressMeter label="Partisipasi Ekskul Aktif" rightTop="94%" percentage={94} tone="emerald" />
            <ProgressMeter label="Penerima Beasiswa/KIP Terverifikasi" rightTop="100% Diskon E-Finance" percentage={100} tone="blue" />
            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <Users className="h-4 w-4 text-[#163b8c]" />
              <span>3 Guru BK &amp; 2 Petugas UKS Aktif</span>
            </div>
          </Card>
        }
      />
    </div>
  );
}
