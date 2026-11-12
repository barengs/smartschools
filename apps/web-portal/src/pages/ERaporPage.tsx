import { useState } from 'react';
import { Award, CheckCircle2, FileBadge2, Lock, Unlock } from 'lucide-react';
import { Alert, Badge, Button, Card } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

export function ERaporPage() {
  const [locked, setLocked] = useState(true);
  const [tteNotice, setTteNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="AKADEMIK & DATA / PENILAIAN & SERTIFIKASI"
        title="E-Rapor Digital Kurikulum Merdeka & TTE BSrE"
        subtitle="Auto-sync nilai CBT & Smart LMS, mekanisme remedial KKTP, Projek P5, Lock/Unlock Waka Kurikulum, serta cetak PDF ber-TTE & QR."
        rightSlot={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              onClick={() => setLocked((prev) => !prev)}
            >
              {locked ? 'Buka Kunci Nilai (Waka)' : 'Kunci Final Nilai'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileBadge2 className="h-3.5 w-3.5" />}
              onClick={() =>
                setTteNotice(
                  'Batch tanda tangan elektronik BSrE & QR Verifikasi untuk 36 E-Rapor XI MIPA 1 selesai diterbitkan ke MinIO.',
                )
              }
            >
              Terbitkan E-Rapor TTE
            </Button>
          </>
        }
      />

      {tteNotice && <Alert tone="success">{tteNotice}</Alert>}

      <ModuleWorkspaceShell
        banner={{
          tone: locked ? 'emerald' : 'amber',
          tag: locked ? 'Nilai Terkunci Waka' : 'Mode Edit Guru Aktif',
          message:
            'Nilai ujian CBT (CbtExamSubmitted) dan rubrik Smart LMS tersinkron otomatis ke deskripsi capaian TP tanpa input ulang.',
        }}
        kpis={[
          { label: 'Ketuntasan Nilai Mapel', value: '98.6%', sublabel: '43 / 44 Mapel Terverifikasi', icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
          { label: 'Siswa Remedial KKTP', value: '12 Siswa', sublabel: 'Terjadwal Remedial Otomatis LMS', icon: <Award className="h-4 w-4" /> },
          { label: 'Rapor P5 & Sikap', value: '100% Siap', sublabel: '3 Tema Projek P5 Terekap', icon: <FileBadge2 className="h-4 w-4" /> },
          { label: 'Status Bridge RDM/e-Rapor', value: 'Siap Ekspor', sublabel: 'Format Kemendikbud & Kemenag', icon: <Lock className="h-4 w-4" /> },
        ]}
        tabs={[
          {
            key: 'leger',
            label: 'Leger & Progres Nilai Kelas',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Rekap Leger &amp; Deskripsi Capaian TP Otomatis</h3>
                <div className="overflow-x-auto rounded border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500">
                        <th className="px-4 py-3">NISN &amp; Nama Siswa</th>
                        <th className="px-3 py-3 text-center">LMS + Formatif</th>
                        <th className="px-3 py-3 text-center">Rust CBT</th>
                        <th className="px-3 py-3 text-center">Nilai Akhir</th>
                        <th className="px-3 py-3 text-center">S / I / A</th>
                        <th className="px-4 py-3">Status E-Rapor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {[
                        { name: 'Muhammad Farhan', nisn: '0087462918', form: 95, cbt: 96, fin: 95.5, sia: '2 / 1 / 0', status: 'TTE Sah' },
                        { name: 'Ahmad Fauzan Pratama', nisn: '0089234101', form: 90, cbt: 89, fin: 89.5, sia: '0 / 0 / 0', status: 'TTE Sah' },
                        { name: 'Rafi Maulana', nisn: '0087421990', form: 72, cbt: 68, fin: 70.0, sia: '1 / 0 / 3', status: 'Remedial KKTP' },
                      ].map((row) => (
                        <tr key={row.nisn}>
                          <td className="px-4 py-3"><div className="font-bold text-slate-900">{row.name}</div><div className="text-[11px] text-slate-500 tabular-nums">{row.nisn}</div></td>
                          <td className="px-3 py-3 text-center font-bold tabular-nums">{row.form}</td>
                          <td className="px-3 py-3 text-center font-bold tabular-nums">{row.cbt}</td>
                          <td className="px-3 py-3 text-center font-extrabold text-[#163b8c] tabular-nums">{row.fin.toFixed(1)}</td>
                          <td className="px-3 py-3 text-center tabular-nums">{row.sia}</td>
                          <td className="px-4 py-3"><Badge tone={row.status === 'TTE Sah' ? 'emerald' : 'amber'}>{row.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ),
          },
          {
            key: 'p5',
            label: 'Penilaian Projek P5 & Ekskul',
            content: (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-extrabold text-slate-900">Dimensi Profil Pelajar Pancasila (MB / SB / BSH / SAB)</h3>
                <p>Terintegrasi langsung dengan kehadiran kegiatan ekskul dari modul Kesiswaan dan bank sertifikat prestasi.</p>
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Kesiapan Rilis Wali Kelas</h3>
            <ProgressMeter label="Input Nilai Guru Mapel" rightTop="100%" percentage={100} tone="emerald" />
            <ProgressMeter label="Validasi Deskripsi TP" rightTop="96%" percentage={96} tone="blue" />
            <ProgressMeter label="Tanda Tangan TTE BSrE" rightTop="91%" percentage={91} tone="teal" />
          </Card>
        }
      />
    </div>
  );
}
