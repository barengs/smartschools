import { FormEvent, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Alert, Badge, Button, Card, Input, Select } from '../components/atoms';
import { PortalTopbar } from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import {
  activateAcademicPeriod,
  checkDapodikExport,
  createAcademicPeriod,
  createClassroom,
  fetchSiakadOverview,
  setSelectedPeriodId,
} from '../store/slices/siakadSlice';

export function SiakadPage() {
  const dispatch = useAppDispatch();
  const { periods, classrooms, students, selectedPeriodId, message, error } = useAppSelector(
    (s) => s.siakad,
  );

  const [periodName, setPeriodName] = useState('');
  const [semester, setSemester] = useState<'ODD' | 'EVEN'>('ODD');
  const [startDate, setStartDate] = useState('2026-07-13');
  const [endDate, setEndDate] = useState('2026-12-18');
  const [roomName, setRoomName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(10);

  useEffect(() => {
    dispatch(fetchSiakadOverview());
  }, [dispatch]);

  async function handleCreatePeriod(e: FormEvent) {
    e.preventDefault();
    const res = await dispatch(
      createAcademicPeriod({
        name: periodName,
        semester,
        startDate,
        endDate,
        isActive: periods.length === 0,
      }),
    );
    if (createAcademicPeriod.fulfilled.match(res)) {
      setPeriodName('');
    }
  }

  async function handleCreateClassroom(e: FormEvent) {
    e.preventDefault();
    if (!selectedPeriodId) return;
    const res = await dispatch(
      createClassroom({
        academicPeriodId: selectedPeriodId,
        name: roomName,
        gradeLevel: Number(gradeLevel),
      }),
    );
    if (createClassroom.fulfilled.match(res)) {
      setRoomName('');
    }
  }

  return (
    <div className="space-y-6">
      <PortalTopbar
        title="SIAKAD & Buku Induk Digital"
        subtitle="Kelola tahun ajaran, rombel, dan data induk siswa siap Dapodik/EMIS."
        rightSlot={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={() => dispatch(checkDapodikExport())}
          >
            Cek Ekspor Dapodik/EMIS
          </Button>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Tahun Ajaran</h2>
        <form onSubmit={handleCreatePeriod} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <Input
            placeholder="Misal: 2026/2027"
            value={periodName}
            onChange={(e) => setPeriodName(e.target.value)}
            required
          />
          <Select
            value={semester}
            onChange={(e) => setSemester(e.target.value as 'ODD' | 'EVEN')}
          >
            <option value="ODD">Ganjil</option>
            <option value="EVEN">Genap</option>
          </Select>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button type="submit" variant="primary" size="md">
            Tambah Periode
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {periods.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={p.is_active ? 'emerald' : 'outline'}
              onClick={() => dispatch(activateAcademicPeriod(p.id))}
            >
              {p.name} ({p.semester}) {p.is_active ? '✓ Aktif' : 'Aktifkan'}
            </Button>
          ))}
        </div>
      </Card>

      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Rombongan Belajar (Rombel)</h2>
        <form onSubmit={handleCreateClassroom} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            value={selectedPeriodId}
            onChange={(e) => dispatch(setSelectedPeriodId(e.target.value))}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.semester})
              </option>
            ))}
          </Select>
          <Input
            placeholder="Nama Kelas (mis. X-IPA-1)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
          <Input
            type="number"
            min={1}
            max={12}
            value={gradeLevel}
            onChange={(e) => setGradeLevel(Number(e.target.value))}
          />
          <Button type="submit" variant="primary" size="md">
            Tambah Rombel
          </Button>
        </form>

        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2.5">Kelas</th>
                <th className="px-4 py-2.5">Tingkat</th>
                <th className="px-4 py-2.5">Jumlah Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {classrooms.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{c.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">Kelas {c.grade_level}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums">{c.student_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-600">
          Daftar Siswa Buku Induk ({students.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">NISN</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 tabular-nums">{s.nis ?? '-'}</td>
                  <td className="px-4 py-3 tabular-nums">{s.nisn ?? '-'}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{s.full_name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.status === 'ACTIVE' ? 'emerald' : 'slate'}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
