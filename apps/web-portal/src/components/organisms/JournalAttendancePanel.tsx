import { AlertCircle, Check, HeartPulse, ShieldCheck, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  AttendanceCode,
  markAllStudentsPresent,
  setStudentAttendanceStatus,
} from '../../store/slices/portalSlice';
import { Badge, Button, Card } from '../atoms';

const STATUS_CODES: AttendanceCode[] = ['H', 'S', 'I', 'A'];

export function JournalAttendancePanel() {
  const dispatch = useAppDispatch();
  const students = useAppSelector((s) => s.portal.journalStudents);

  const countH = students.filter((s) => s.status === 'H').length;
  const countS = students.filter((s) => s.status === 'S').length;
  const countI = students.filter((s) => s.status === 'I').length;
  const countA = students.filter((s) => s.status === 'A').length;

  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-extrabold text-slate-900">Presensi Cepat Siswa</h2>
            <Badge tone="emerald">● RFID Auto-Sync</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sampel aktif XI MIPA 1 ({students.length} siswa ditampilkan · 36 terdaftar)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Check className="h-3.5 w-3.5 text-[#163b8c]" />}
          onClick={() => dispatch(markAllStudentsPresent())}
        >
          Semua Hadir
        </Button>
      </div>

      {/* 4 status counter cards matching Screenshot 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-800">Hadir Fisik</div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {30 + countH}
            </div>
          </div>
          <Users className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-800">Sakit (Dokter)</div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {countS}
            </div>
          </div>
          <HeartPulse className="h-5 w-5 text-amber-600" />
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-800">Dispensasi / Izin</div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {countI}
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-[#163b8c]" />
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-800">Tanpa Keterangan</div>
            <div className="text-2xl font-extrabold text-rose-700 tabular-nums mt-0.5">
              {countA}
            </div>
          </div>
          <AlertCircle className="h-5 w-5 text-rose-600" />
        </div>
      </div>

      {/* Student row list w/ H | S | I | A toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          <span>DAFTAR SISWA (DATA REAL-TIME GERBANG RFID)</span>
          <span>TOGGLE STATUS PRESENSI</span>
        </div>

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {students.map((st) => (
            <div
              key={st.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700">
                  {st.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {st.name}
                    </span>
                    <Badge tone={st.gateTone}>{st.gateTag}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    NISN: {st.nisn} · No. Absen {st.seatNo}
                    {st.subNote && (
                      <span className="text-slate-600 font-medium"> · {st.subNote}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 self-start sm:self-auto shrink-0">
                {STATUS_CODES.map((code) => {
                  const active = st.status === code;
                  const activeClasses =
                    code === 'H'
                      ? 'bg-emerald-600 text-white'
                      : code === 'S'
                        ? 'bg-amber-500 text-white'
                        : code === 'I'
                          ? 'bg-[#163b8c] text-white'
                          : 'bg-rose-600 text-white';
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        dispatch(setStudentAttendanceStatus({ id: st.id, status: code }))
                      }
                      className={`h-7 w-8 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                        active ? activeClasses : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

