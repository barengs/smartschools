import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge, Button, Card, Input, Select } from '../components/atoms';
import { DataTable } from '../components/molecules';
import { PortalTopbar } from '../components/organisms';
import { useAppDispatch, useAppSelector } from '../store';
import {
  activateAcademicPeriod,
  checkDapodikExport,
  Classroom,
  createAcademicPeriod,
  createClassroom,
  fetchSiakadOverview,
  setSelectedPeriodId,
  Student,
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

  useEffect(() => {
    if (message) toast.success(message);
  }, [message]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const classroomColumns = useMemo<ColumnDef<Classroom, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Kelas',
        cell: ({ row }) => <span className="font-bold text-[#212529]">{row.original.name}</span>,
      },
      {
        accessorKey: 'grade_level',
        header: 'Tingkat',
        cell: ({ row }) => <span className="text-[#495057]">Kelas {row.original.grade_level}</span>,
      },
      {
        accessorKey: 'student_count',
        header: 'Jumlah Siswa',
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{row.original.student_count}</span>
        ),
      },
    ],
    [],
  );

  const studentColumns = useMemo<ColumnDef<Student, unknown>[]>(
    () => [
      {
        accessorKey: 'nis',
        header: 'NIS',
        cell: ({ row }) => <span className="tabular-nums">{row.original.nis ?? '-'}</span>,
      },
      {
        accessorKey: 'nisn',
        header: 'NISN',
        cell: ({ row }) => <span className="tabular-nums">{row.original.nisn ?? '-'}</span>,
      },
      {
        accessorKey: 'full_name',
        header: 'Nama Siswa',
        cell: ({ row }) => (
          <span className="font-bold text-[#212529]">{row.original.full_name}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={row.original.status === 'ACTIVE' ? 'emerald' : 'slate'}>
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [],
  );

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

        <div className="overflow-hidden rounded border border-[#dee2e6]">
          <DataTable
            data={classrooms}
            columns={classroomColumns}
            compact
            emptyMessage="Belum ada data rombel."
          />
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-[#dee2e6] bg-[#f8f9fa] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#495057]">
          Daftar Siswa Buku Induk ({students.length})
        </div>
        <DataTable
          data={students}
          columns={studentColumns}
          emptyMessage="Belum ada data siswa."
        />
      </Card>
    </div>
  );
}
