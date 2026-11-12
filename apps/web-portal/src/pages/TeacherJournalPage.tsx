import { CheckCircle2, Clock } from 'lucide-react';
import { Badge, Card } from '../components/atoms';
import {
  JournalAttendancePanel,
  JournalEntryFormCard,
  JournalScheduleRail,
  PortalTopbar,
} from '../components/organisms';

export function TeacherJournalPage() {
  return (
    <div className="space-y-5">
      <PortalTopbar
        kicker="KBM REAL-TIME • Tahun Ajaran 2026/2027 Ganjil • Sinkronisasi SIAKAD Siap"
        title="Jurnal Mengajar KBM & Presensi Kelas"
        subtitle="Input cepat jurnal mengajar harian, presensi real-time per jam tatap muka, dan sinkronisasi otomatis SIAKAD."
        rightSlot={
          <Card padding="sm" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163b8c] text-xs font-extrabold text-white shrink-0">
              BS
            </div>
            <div className="text-xs leading-tight">
              <div className="font-extrabold text-slate-900">Drs. Bambang Sudarmono, M.Si</div>
              <div className="text-[11px] text-slate-500">
                Guru Fisika Madya • Wali Kelas XI MIPA 1
              </div>
              <div className="text-[10px] font-bold text-[#163b8c] mt-0.5">
                Rabu, 11 Nov 2026, 09.12 WIB
              </div>
            </div>
          </Card>
        }
      />

      {/* Active Session Banner matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#0f2b6b] to-[#1d4ed8] px-5 py-4 text-white shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 shrink-0">
            <Clock className="h-5 w-5 text-blue-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
                SESI KBM SEDANG BERLANGSUNG
              </span>
              <Badge tone="navy" className="bg-white/15 border-white/20">
                Sisa Waktu: 63 Menit
              </Badge>
            </div>
            <div className="mt-0.5 text-sm sm:text-base font-extrabold">
              Jadwal Aktif Sekarang: Jam Ke-3 &amp; 4 (08.45 – 10.15 WIB) • Fisika • XI MIPA 1 • Ruang
              Lab Fisika 2
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Bel masuk telah berbunyi. RFID Gate mencatat 34 siswa telah berada di area laboratorium.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            document.getElementById('journal-attendance-panel')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#0f2b6b] shadow-xs hover:bg-blue-50 shrink-0 cursor-pointer"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Presensi</span>
        </button>
      </div>

      {/* 4 + 8 Split matching Screenshot 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4">
          <JournalScheduleRail />
        </div>
        <div id="journal-attendance-panel" className="lg:col-span-8 space-y-6">
          <JournalAttendancePanel />
          <JournalEntryFormCard />
        </div>
      </div>
    </div>
  );
}

