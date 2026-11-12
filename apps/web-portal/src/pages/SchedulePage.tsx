import { useState } from 'react';
import { Bell, CalendarDays, Cpu, Play, UserCheck } from 'lucide-react';
import { Alert, Badge, Button, Card } from '../components/atoms';
import { ProgressMeter } from '../components/molecules';
import { ModuleWorkspaceShell, PortalTopbar } from '../components/organisms';

const TIMETABLE_ROWS = [
  { slot: '07:15 – 08:45', mon: 'Matematika (XI MIPA 1)', tue: 'Fisika (Lab 2)', wed: 'Fisika (X-A)', thu: 'Bahasa Indonesia', fri: 'Projek P5' },
  { slot: '08:45 – 10:15', mon: 'Fisika (XI MIPA 1)', tue: 'Kimia (Lab Kimia)', wed: 'Fisika (XI MIPA 1)', thu: 'Informatika (Lab)', fri: 'Ekstrakurikuler' },
  { slot: '10:30 – 12:00', mon: 'Bahasa Inggris', tue: 'Sejarah', wed: 'Fisika (XII MIPA 2)', thu: 'Matematika Lanjut', fri: 'Sholat Jumat / Bina Karakter' },
];

export function SchedulePage() {
  const [solverMsg, setSolverMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PortalTopbar
        breadcrumbs="AKADEMIK & DATA / PENJADWALAN PINTAR"
        title="Jadwal Pelajaran OR-Tools & Guru Piket"
        subtitle="Penyusunan jadwal 0 bentrok via Google OR-Tools CP-SAT Python, manajemen piket harian, dan sinkronisasi Automated IP Bell Rust."
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play className="h-3.5 w-3.5" />}
            onClick={() =>
              setSolverMsg(
                'Job POST /internal/ai/schedules/generate dikirim ke Service C (Python OR-Tools). 0 bentrok tervalidasi dan jadwal IP Bell diperbarui.',
              )
            }
          >
            Susun Jadwal Otomatis (OR-Tools)
          </Button>
        }
      />

      {solverMsg && <Alert tone="success">{solverMsg}</Alert>}

      <ModuleWorkspaceShell
        banner={{
          tone: 'emerald',
          tag: 'OR-Tools CP-SAT Active',
          message: 'Seluruh 44 rombel & 68 GTK tersusun dengan 0 bentrok ruang lab maupun jam mengajar.',
        }}
        kpis={[
          { label: 'Total Rombel Terjadwal', value: '44 Rombel', sublabel: '100% Terisi Tanpa Bentrok', icon: <CalendarDays className="h-4 w-4" /> },
          { label: 'Validasi Solver Python', value: '0 Bentrok', sublabel: 'Hard & Soft Constraints OK', icon: <Cpu className="h-4 w-4" /> },
          { label: 'Guru Piket & Pengganti', value: '2 Kelas', sublabel: '1 Guru Izin · Terisi Piket', icon: <UserCheck className="h-4 w-4" /> },
          { label: 'Sinkronisasi IP Bell Rust', value: 'Aktif (MQTT)', sublabel: 'Bel Otomatis 14 Zona Sekolah', icon: <Bell className="h-4 w-4" /> },
        ]}
        tabs={[
          {
            key: 'matrix',
            label: 'Matriks Jadwal Pelajaran',
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">Matriks Jadwal Kelas XI MIPA 1</h3>
                  <Badge tone="blue">Drag &amp; Drop Anti-Bentrok</Badge>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500">
                        <th className="px-4 py-3">Jam Bel</th>
                        <th className="px-4 py-3">Senin</th>
                        <th className="px-4 py-3">Selasa</th>
                        <th className="px-4 py-3">Rabu</th>
                        <th className="px-4 py-3">Kamis</th>
                        <th className="px-4 py-3">Jumat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {TIMETABLE_ROWS.map((r) => (
                        <tr key={r.slot}>
                          <td className="px-4 py-3 font-extrabold text-[#163b8c] tabular-nums">{r.slot}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{r.mon}</td>
                          <td className="px-4 py-3 text-slate-700">{r.tue}</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">{r.wed}</td>
                          <td className="px-4 py-3 text-slate-700">{r.thu}</td>
                          <td className="px-4 py-3 text-slate-600">{r.fri}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ),
          },
          {
            key: 'piket',
            label: 'Guru Pengganti & Piket',
            badge: '2',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Penugasan Guru Piket Harian</h3>
                {[
                  { classRoom: 'X-IPS-2', absent: 'Dra. Sri Lestari (Cuti)', sub: 'Rina Kusuma, S.Pd (Terisi)', status: 'TERGANTIKAN' },
                  { classRoom: 'XII-IPA-3', absent: 'Budi Santoso, M.Pd (Dinas)', sub: 'Drs. Bambang Sudarmono (Piket Siaga)', status: 'SIAGA' },
                ].map((p) => (
                  <div key={p.classRoom} className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
                    <div>
                      <div className="font-extrabold text-slate-900">{p.classRoom} · {p.absent}</div>
                      <div className="text-slate-600 mt-0.5">Pengganti: <strong>{p.sub}</strong></div>
                    </div>
                    <Badge tone="emerald">{p.status}</Badge>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'bell',
            label: 'Jadwal Automated IP Bell',
            content: (
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-extrabold text-slate-900">Topik MQTT Retained Broker EMQX → Service B (Rust)</h3>
                <p className="text-slate-600">
                  Perubahan pada tabel <code>academic_lms.schedules</code> otomatis dipublikasikan melalui event <code>ScheduleGenerated</code> untuk memperbarui slot bel hari reguler &amp; variasi Jumat.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card padding="sm"><div className="font-bold">06:55 WIB</div><div className="text-slate-500">Bel Persiapan Masuk &amp; Tap Gerbang</div></Card>
                  <Card padding="sm"><div className="font-bold">10:15 WIB</div><div className="text-slate-500">Bel Istirahat I (POS Kantin Aktif)</div></Card>
                  <Card padding="sm"><div className="font-bold">15:15 WIB</div><div className="text-slate-500">Bel Kepulangan &amp; Tap Out</div></Card>
                </div>
              </div>
            ),
          },
        ]}
        rightRail={
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Keterpenuhan Beban JP Sertifikasi</h3>
            <ProgressMeter label="Rumpun MIPA (Min. 24 JP)" rightTop="100% Terpenuhi" percentage={100} tone="emerald" />
            <ProgressMeter label="Rumpun Bahasa & Humaniora" rightTop="96% Terpenuhi" percentage={96} tone="blue" />
            <ProgressMeter label="Laboratorium & Bengkel Vokasi" rightTop="84% Utilisasi" percentage={84} tone="teal" />
          </Card>
        }
      />
    </div>
  );
}
