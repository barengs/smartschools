import { CheckCircle2, Download, QrCode, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  BukuIndukStudentRecord,
  BukuIndukTab,
  setBukuIndukActiveTab,
} from '../../store/slices/portalSlice';
import { Badge, Button, Card } from '../atoms';

interface BukuIndukDetailTabsProps {
  student: BukuIndukStudentRecord;
}

const TABS: Array<{ key: BukuIndukTab; label: string }> = [
  { key: 'ROMBEL', label: 'Riwayat Rombel & KBM' },
  { key: 'RAPOR', label: 'Transkrip & E-Rapor TTE' },
  { key: 'PRESENSI', label: 'Presensi & EWS' },
  { key: 'EBK', label: 'E-BK & Tata Tertib' },
  { key: 'EUKS', label: 'E-UKS & Kesehatan' },
];

const RAPOR_ROWS = [
  {
    subject: 'Matematika Tingkat Lanjut',
    teacher: 'Drs. Bambang Sudiro, M.Sc',
    tp: 'Sangat mahir menerapkan prinsip kalkulus diferensial & integral...',
    formatif: 94,
    sumatif: 96,
    grade: 'A',
  },
  {
    subject: 'Fisika Terapan & Lab',
    teacher: 'Ir. Rahmat Hidayat, M.T',
    tp: 'Menunjukkan penguasaan mendalam hukum termodinamika & mesin kalor...',
    formatif: 98,
    sumatif: 95,
    grade: 'A',
  },
  {
    subject: 'Bahasa Indonesia Akademik',
    teacher: 'Dra. Endang Purwanti',
    tp: 'Kritis menyusun esai argumentatif bertema pembangunan berkelanjutan...',
    formatif: 88,
    sumatif: 90,
    grade: 'A',
  },
  {
    subject: 'Informatika & Pemrograman',
    teacher: 'Ahmad Fauzi, S.Kom',
    tp: 'Mampu merancang struktur data graf dan algoritma pemrosesan paralel...',
    formatif: 92,
    sumatif: 94,
    grade: 'A',
  },
  {
    subject: 'Pendidikan Pancasila',
    teacher: 'Wahyu Kusuma, M.Pd',
    tp: 'Aktif menginisiasi gotong royong kebinekaan dalam projek P5...',
    formatif: 87,
    sumatif: 89,
    grade: 'B+',
  },
];

export function BukuIndukDetailTabs({ student }: BukuIndukDetailTabsProps) {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.portal.bukuIndukActiveTab);

  return (
    <div className="space-y-5">
      {/* Navigation Tab Strip */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => dispatch(setBukuIndukActiveTab(t.key))}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                active
                  ? 'bg-[#163b8c] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 4 Attendance & Discipline KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm">
          <div className="text-[11px] font-semibold text-slate-500">Persentase Kehadiran</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {student.attendanceRate}
            </span>
            <span className="text-xs font-bold text-emerald-700">Tinggi</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-[98%] rounded-full bg-emerald-600" />
          </div>
        </Card>

        <Card padding="sm">
          <div className="text-[11px] font-semibold text-slate-500">Sakit (S)</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {student.sickDays}
            </span>
            <span className="text-xs text-slate-500">Hari</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Surat Dokter Valid</div>
        </Card>

        <Card padding="sm">
          <div className="text-[11px] font-semibold text-slate-500">Izin Resmi (I)</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {student.permitDays}
            </span>
            <span className="text-xs text-slate-500">Hari</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Olimpiade Sains Prov.</div>
        </Card>

        <Card padding="sm">
          <div className="text-[11px] font-semibold text-slate-500">Tanpa Keterangan (A)</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {student.alphaDays}
            </span>
            <span className="text-xs font-bold text-slate-600">Nol</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
            Pelanggaran Disiplin Terjaga
          </div>
        </Card>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'RAPOR' && (
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900">
                  Capaian Pembelajaran &amp; E-Rapor TTE
                </h3>
                <Badge tone="blue">T.A 2026/2027 Ganjil</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Penilaian formatif, sumatif akhir materi, dan sertifikasi tanda tangan digital Balai
                Sertifikasi Elektronik (BSrE).
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={() => window.print()}
            >
              Unduh PDF
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Mata Pelajaran &amp; Pendidik</th>
                  <th className="px-4 py-3">Capaian Pembelajaran Utama (TP)</th>
                  <th className="px-3 py-3 text-center">Formatif</th>
                  <th className="px-3 py-3 text-center">Sumatif</th>
                  <th className="px-3 py-3 text-center">Predikat</th>
                  <th className="px-4 py-3 text-right">TTE BSrE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {RAPOR_ROWS.map((row) => (
                  <tr key={row.subject} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="font-extrabold text-slate-900">{row.subject}</div>
                      <div className="text-[11px] text-slate-500">{row.teacher}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs">{row.tp}</td>
                    <td className="px-3 py-3.5 text-center font-extrabold text-slate-900 tabular-nums">
                      {row.formatif}
                    </td>
                    <td className="px-3 py-3.5 text-center font-extrabold text-slate-900 tabular-nums">
                      {row.sumatif}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <Badge tone={row.grade === 'A' ? 'emerald' : 'blue'}>{row.grade}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>TTE Sah BSrE</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Homeroom note + QR Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-4">
            <div className="text-xs">
              <div className="font-extrabold text-slate-800">
                Catatan Resmi Wali Kelas ({student.className})
              </div>
              <p className="mt-1 italic text-slate-600 max-w-2xl leading-relaxed">
                &ldquo;{student.homeroomNote}&rdquo;
              </p>
              <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
                — {student.homeroomTeacher}
              </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#163b8c]">
              <QrCode className="h-7 w-7" />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'ROMBEL' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Timeline Riwayat Rombel &amp; Kenaikan Kelas Lintas Semester
          </h3>
          <div className="space-y-2.5 text-xs">
            {[
              { period: 'TA 2026/2027 Ganjil', rombel: student.className, status: 'AKTIF BERJALAN', wali: student.homeroomTeacher },
              { period: 'TA 2025/2026 Genap', rombel: 'Kelas X MIPA 1', status: 'NAIK KELAS', wali: 'Drs. Bambang Sudarmono, M.Si' },
              { period: 'TA 2025/2026 Ganjil', rombel: 'Kelas X MIPA 1', status: 'MIGRASI E-PPDB', wali: 'Drs. Bambang Sudarmono, M.Si' },
            ].map((hist) => (
              <div key={hist.period} className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
                <div>
                  <div className="font-extrabold text-slate-900">{hist.period} · {hist.rombel}</div>
                  <div className="text-slate-500 mt-0.5">Wali Kelas: {hist.wali}</div>
                </div>
                <Badge tone="emerald">{hist.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'PRESENSI' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Rekam Presensi Gerbang RFID &amp; Status Skor EWS Python
          </h3>
          <p className="text-xs text-slate-600">
            Skor Risiko EWS Terkini: <strong className="text-emerald-700">LOW (8.4%)</strong> ·
            Rata-rata kedatangan pagi: <strong>06:44 WIB</strong> · Nol anomali alfa beruntun.
          </p>
        </Card>
      )}

      {activeTab === 'EBK' && (
        <Card padding="lg" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Poin Prestasi, Kedisiplinan &amp; Catatan Konseling E-BK
            </h3>
            <Badge tone="blue">Enkripsi AES-256-GCM</Badge>
          </div>
          <p className="text-xs text-slate-600">
            Poin Prestasi: <strong className="text-emerald-700">+45 Poin</strong> (Finalis OSN
            Provinsi) · Poin Pelanggaran: <strong>0 Poin</strong> · Catatan konseling privat hanya
            dapat didekripsi oleh Guru BK berwenang.
          </p>
        </Card>
      )}

      {activeTab === 'EUKS' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Rekam Kesehatan Berkala &amp; Alergi E-UKS
          </h3>
          <p className="text-xs text-slate-600">
            Golongan Darah: <strong>{student.bloodType}</strong> · Riwayat Alergi: Tidak ada alergi
            obat/makanan tercatat · Hasil Screening Berkala (TB 171 cm / BB 62 kg / IMT Normal).
          </p>
        </Card>
      )}

      {/* Pre-Flight Validator Dapodik 2026 matching Screenshot 3 */}
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Pre-Flight Validator Dapodik 2026
              </h3>
              <p className="text-[11px] text-slate-500">
                Pemeriksaan integritas dan kelayakan data kependudukan sebelum disinkronisasi ke
                server pusat.
              </p>
            </div>
          </div>
          <Badge tone="emerald">✓ 100% Siap Sinkronisasi</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { title: 'NIK Valid Dukcapil', value: student.nik, sub: 'Format 16 Digit Sah' },
            { title: 'Nomor Kartu Keluarga', value: student.kkNumber, sub: 'Kepala Kel. Match' },
            { title: 'Nama Ibu Kandung', value: student.motherName, sub: 'Tanpa Gelar (Sesuai Akta)' },
            { title: 'Geotagging Titik Rumah', value: student.geotagCoords, sub: 'Radius Zonasi Valid' },
          ].map((chk) => (
            <div key={chk.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-600">
                <span>{chk.title}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </div>
              <div className="mt-1 font-extrabold text-slate-900 tabular-nums truncate">
                {chk.value}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{chk.sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

