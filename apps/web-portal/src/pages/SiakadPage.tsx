import { FormEvent, useEffect, useState } from 'react';
import { ApiError, apiRequest } from '../api/client';

interface Period {
  id: string;
  name: string;
  semester: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  room_code: string | null;
  student_count: string;
}

interface Student {
  id: string;
  nis: string | null;
  nisn: string | null;
  full_name: string;
  status: string;
}

export function SiakadPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [periodName, setPeriodName] = useState('');
  const [semester, setSemester] = useState<'ODD' | 'EVEN'>('ODD');
  const [startDate, setStartDate] = useState('2026-07-13');
  const [endDate, setEndDate] = useState('2026-12-18');
  const [roomName, setRoomName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(10);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    try {
      const [p, c, s] = await Promise.all([
        apiRequest<Period[]>('/api/v1/core/siakad/periods'),
        apiRequest<Classroom[]>('/api/v1/core/siakad/classrooms'),
        apiRequest<Student[]>('/api/v1/core/siakad/students'),
      ]);
      setPeriods(p);
      setClassrooms(c);
      setStudents(s);
      if (p.length > 0 && !selectedPeriodId) {
        const active = p.find((item) => item.is_active) ?? p[0];
        setSelectedPeriodId(active.id);
      }
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal memuat data SIAKAD');
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createPeriod(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest('/api/v1/core/siakad/periods', {
        method: 'POST',
        body: JSON.stringify({
          name: periodName,
          semester,
          startDate,
          endDate,
          isActive: periods.length === 0,
        }),
      });
      setPeriodName('');
      setMessage('Tahun ajaran ditambahkan');
      await loadAll();
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal membuat tahun ajaran');
    }
  }

  async function activatePeriod(id: string) {
    await apiRequest(`/api/v1/core/siakad/periods/${id}/activate`, { method: 'PATCH' });
    setSelectedPeriodId(id);
    await loadAll();
  }

  async function createClassroom(e: FormEvent) {
    e.preventDefault();
    if (!selectedPeriodId) {
      setError('Buat atau pilih Tahun Ajaran terlebih dahulu');
      return;
    }
    setError(null);
    try {
      await apiRequest('/api/v1/core/siakad/classrooms', {
        method: 'POST',
        body: JSON.stringify({
          academicPeriodId: selectedPeriodId,
          name: roomName,
          gradeLevel: Number(gradeLevel),
        }),
      });
      setRoomName('');
      setMessage('Rombel ditambahkan');
      await loadAll();
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal menambah rombel');
    }
  }

  async function exportDapodik() {
    try {
      const data = await apiRequest<{ totalActiveStudents: number }>(
        '/api/v1/core/siakad/students/export/dapodik',
      );
      setMessage(`Siap ekspor Dapodik/EMIS untuk ${data.totalActiveStudents} siswa aktif`);
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal mengekspor Dapodik');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>SIAKAD &amp; Buku Induk Digital</h1>
          <p className="muted">Kelola tahun ajaran, rombel, dan data induk siswa siap Dapodik.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={exportDapodik}>
          Cek Ekspor Dapodik/EMIS
        </button>
      </header>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <h3>Tahun Ajaran</h3>
        <form onSubmit={createPeriod} className="inline-form" style={{ marginBottom: 12 }}>
          <input
            placeholder="Misal: 2026/2027"
            value={periodName}
            onChange={(e) => setPeriodName(e.target.value)}
            required
          />
          <select value={semester} onChange={(e) => setSemester(e.target.value as 'ODD' | 'EVEN')}>
            <option value="ODD">Ganjil</option>
            <option value="EVEN">Genap</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button type="submit" className="btn-primary">
            Tambah Periode
          </button>
        </form>
        <div className="actions-cell">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              className={p.is_active ? 'btn-sm ok' : 'btn-sm'}
              onClick={() => activatePeriod(p.id)}
            >
              {p.name} ({p.semester}) {p.is_active ? '✓ Aktif' : 'Aktifkan'}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <h3>Rombongan Belajar (Rombel)</h3>
        <form onSubmit={createClassroom} className="inline-form" style={{ marginBottom: 12 }}>
          <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)}>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.semester})
              </option>
            ))}
          </select>
          <input
            placeholder="Nama Kelas (mis. X-IPA-1)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
          <input
            type="number"
            min={1}
            max={12}
            value={gradeLevel}
            onChange={(e) => setGradeLevel(Number(e.target.value))}
          />
          <button type="submit" className="btn-primary">
            Tambah Rombel
          </button>
        </form>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kelas</th>
                <th>Tingkat</th>
                <th>Jumlah Siswa</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>Kelas {c.grade_level}</td>
                  <td>{c.student_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NIS</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.nis ?? '-'}</td>
                <td>{s.nisn ?? '-'}</td>
                <td>
                  <strong>{s.full_name}</strong>
                </td>
                <td>
                  <span className={s.status === 'ACTIVE' ? 'status-chip ok' : 'status-chip'}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

