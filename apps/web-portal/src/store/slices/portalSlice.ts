import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type EwsRiskFilter = 'ALL' | 'CRITICAL' | 'MEDIUM';
export type AttendanceCode = 'H' | 'S' | 'I' | 'A';
export type BukuIndukTab = 'ROMBEL' | 'RAPOR' | 'PRESENSI' | 'EBK' | 'EUKS';

export interface EwsStudentRiskItem {
  id: string;
  initials: string;
  name: string;
  nisn: string;
  className: string;
  riskLevel: 'CRITICAL' | 'MEDIUM';
  riskScore: number;
  factors: string[];
  recommendedAction: string;
}

export interface JournalSessionItem {
  id: string;
  timeRange: string;
  subject: string;
  className: string;
  room: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING' | 'PIKET';
  summary: string;
}

export interface ClassAttendanceStudent {
  id: string;
  initials: string;
  name: string;
  nisn: string;
  seatNo: string;
  gateTag: string;
  gateTone: 'emerald' | 'blue' | 'slate';
  subNote?: string;
  status: AttendanceCode;
}

export interface BukuIndukStudentRecord {
  nis: string;
  nisn: string;
  fullName: string;
  phase: string;
  className: string;
  status: 'Aktif' | 'Lulus' | 'Mutasi';
  kipPipStatus: string;
  bloodType: string;
  rfidUid: string;
  fatherName: string;
  fatherJob: string;
  motherName: string;
  motherJob: string;
  parentPhone: string;
  nikMatch: boolean;
  attendanceRate: string;
  sickDays: number;
  permitDays: number;
  alphaDays: number;
  homeroomNote: string;
  homeroomTeacher: string;
  geotagCoords: string;
  kkNumber: string;
  nik: string;
}

export const EWS_RISK_ROWS: EwsStudentRiskItem[] = [
  {
    id: 'ews-1',
    initials: 'RM',
    name: 'Rafi Maulana',
    nisn: '0087421990',
    className: 'XI MIPA 2',
    riskLevel: 'CRITICAL',
    riskScore: 91.4,
    factors: ['3 Hari Berturut-turut Alpha', 'Nilai Matematika Drop 32% (STS Harian)'],
    recommendedAction: 'Panggilan Konseling BK & Home Visit',
  },
  {
    id: 'ews-2',
    initials: 'AN',
    name: 'Annisa Nuraini',
    nisn: '0081294821',
    className: 'X-B',
    riskLevel: 'CRITICAL',
    riskScore: 88.7,
    factors: ['Tunggakan SPP > 2 Bulan', 'Aktivitas LMS Terhenti 6 Hari berturut'],
    recommendedAction: 'Klarifikasi Finansial & Beasiswa Lazis',
  },
  {
    id: 'ews-3',
    initials: 'BP',
    name: 'Bintang Pratama',
    nisn: '0079301248',
    className: 'XII IPS 1',
    riskLevel: 'CRITICAL',
    riskScore: 86.1,
    factors: ['Poin Pelanggaran Kedisiplinan 45', 'Terlambat Gerbang RFID > 4x Minggu ini'],
    recommendedAction: 'Panggilan Orang Tua & Pembinaan Wali',
  },
  {
    id: 'ews-4',
    initials: 'DK',
    name: 'Dinda Kirana',
    nisn: '0085521903',
    className: 'XI Bahasa 1',
    riskLevel: 'MEDIUM',
    riskScore: 64.2,
    factors: ['Tugas CBT Fisika Tidak Selesai (2x)', 'Penurunan waktu belajar mandiri di LMS'],
    recommendedAction: 'Pendampingan Guru Mata Pelajaran',
  },
  {
    id: 'ews-5',
    initials: 'FZ',
    name: 'Fauzan Zaidan',
    nisn: '0089901452',
    className: 'X-E',
    riskLevel: 'MEDIUM',
    riskScore: 58.0,
    factors: ['Gejala Sakit Berkala di UKS (3x)', 'Jam pelajaran ke-5 & ke-6 sering absen'],
    recommendedAction: 'Koordinasi Rekam Medis UKS & Ortu',
  },
];

export const JOURNAL_SESSIONS: JournalSessionItem[] = [
  {
    id: 'ses-1',
    timeRange: '07.15 - 08.45 WIB',
    subject: 'Fisika • Kelas X-A',
    className: 'X-A',
    room: 'Ruang Teori 102',
    status: 'COMPLETED',
    summary: 'Jurnal Terisi · 36/36 Hadir',
  },
  {
    id: 'ses-2',
    timeRange: '08.45 - 10.15 WIB (Kini)',
    subject: 'Fisika • XI MIPA 1',
    className: 'XI MIPA 1',
    room: 'Lab Fisika 2 • Jam Ke-3 & 4',
    status: 'ACTIVE',
    summary: 'Sesi Berlangsung · 34 Tap RFID',
  },
  {
    id: 'ses-3',
    timeRange: '10.30 - 12.00 WIB',
    subject: 'Fisika • XII MIPA 2',
    className: 'XII MIPA 2',
    room: 'Ruang Teori 204',
    status: 'UPCOMING',
    summary: 'Menunggu jam mulai',
  },
  {
    id: 'ses-4',
    timeRange: '13.00 - 14.30 WIB',
    subject: 'Guru Piket & Pengganti',
    className: 'Piket Harian',
    room: 'Ruang Guru & Lobi Akademik',
    status: 'PIKET',
    summary: 'Jadwal Piket Terjadwal',
  },
];

export const INITIAL_CLASS_STUDENTS: ClassAttendanceStudent[] = [
  {
    id: 'st-1',
    initials: 'AF',
    name: 'Ahmad Fauzan Pratama',
    nisn: '0089234101',
    seatNo: '01',
    gateTag: 'Tap 06:48',
    gateTone: 'emerald',
    status: 'H',
  },
  {
    id: 'st-2',
    initials: 'AR',
    name: 'Annisa Rahmawati',
    nisn: '0089234102',
    seatNo: '02',
    gateTag: 'MinIO Surat',
    gateTone: 'blue',
    subNote: 'Surat Dokter RSUD: Demam Tifoid (Hari ke-2)',
    status: 'S',
  },
  {
    id: 'st-3',
    initials: 'BD',
    name: 'Bagas Dimas Satria',
    nisn: '0089234103',
    seatNo: '03',
    gateTag: 'Kesiswaan',
    gateTone: 'blue',
    subNote: 'Dispensasi Lomba Robotik Nasional (UGM)',
    status: 'I',
  },
  {
    id: 'st-4',
    initials: 'CD',
    name: 'Cantika Dewi Larasati',
    nisn: '0089234104',
    seatNo: '04',
    gateTag: 'Tap 06:40',
    gateTone: 'emerald',
    status: 'H',
  },
  {
    id: 'st-5',
    initials: 'DW',
    name: 'Danu Wicaksono',
    nisn: '0089234105',
    seatNo: '05',
    gateTag: 'Tap 06:55',
    gateTone: 'emerald',
    status: 'H',
  },
  {
    id: 'st-6',
    initials: 'FN',
    name: 'Fania Nabila Siregar',
    nisn: '0089234106',
    seatNo: '06',
    gateTag: 'Tap 06:42',
    gateTone: 'emerald',
    status: 'H',
  },
];

export const BUKU_INDUK_RECORDS: BukuIndukStudentRecord[] = [
  {
    nis: '202610042',
    nisn: '0087462918',
    fullName: 'Muhammad Farhan',
    phase: 'Fase F (XI)',
    className: 'Kelas XI MIPA 1',
    status: 'Aktif',
    kipPipStatus: 'Penerima Aktif',
    bloodType: 'O Positif (Rhesus +)',
    rfidUid: '4A:7C:99:B2',
    fatherName: 'Hendra Pratama',
    fatherJob: 'Ayah Kandung (Wiraswasta)',
    motherName: 'Siti Aminah, S.Pd',
    motherJob: 'Ibu Kandung (Guru PNS)',
    parentPhone: '+62 812-7890-4421',
    nikMatch: true,
    attendanceRate: '98.2%',
    sickDays: 2,
    permitDays: 1,
    alphaDays: 0,
    homeroomNote:
      'Menunjukkan kepemimpinan tinggi dalam projek Penguatan Profil Pelajar Pancasila (P5), berinisiatif solutif saat diskusi tim, dan konsisten mempertahankan peringkat atas pada rumpun mata pelajaran sains.',
    homeroomTeacher: 'Dra. Hj. Ratna Juwita, NIP 197804122003122001',
    geotagCoords: '-6.2088, 106.8456',
    kkNumber: '3174091102120005',
    nik: '3174092204080003',
  },
  {
    nis: '202610043',
    nisn: '0098127364',
    fullName: 'Aisyah Azzahra Putri',
    phase: 'Fase E (X)',
    className: 'Kelas X-A',
    status: 'Aktif',
    kipPipStatus: 'Reguler Non-KIP',
    bloodType: 'A Positif',
    rfidUid: '9C:11:3B:7D',
    fatherName: 'Ahmad Subagyo, M.T',
    fatherJob: 'Ayah Kandung (Insinyur Sipil)',
    motherName: 'Nurhayati',
    motherJob: 'Ibu Kandung (Wirausaha)',
    parentPhone: '+62 813-4501-9921',
    nikMatch: true,
    attendanceRate: '99.1%',
    sickDays: 1,
    permitDays: 0,
    alphaDays: 0,
    homeroomNote:
      'Adaptif pada ekosistem Smart LMS dan aktif dalam tim Karya Ilmiah Remaja (KIR).',
    homeroomTeacher: 'Drs. Bambang Sudarmono, M.Si',
    geotagCoords: '-6.6021, 106.8143',
    kkNumber: '3271041102100001',
    nik: '3271045509100003',
  },
];

interface PortalState {
  academicYear: string;
  ewsFilter: EwsRiskFilter;
  ewsShowAll: boolean;
  journalActiveSessionId: string;
  journalSelectedTp: string;
  journalTopic: string;
  journalMethods: string[];
  journalNotes: string;
  journalSyncParent: boolean;
  journalDraftSavedAt: string | null;
  journalSubmittedNotice: string | null;
  journalStudents: ClassAttendanceStudent[];
  bukuIndukSearch: string;
  bukuIndukClassFilter: string;
  bukuIndukStatusFilter: string;
  bukuIndukActiveTab: BukuIndukTab;
}

const initialState: PortalState = {
  academicYear: 'TA 2026/2027 Ganjil',
  ewsFilter: 'ALL',
  ewsShowAll: false,
  journalActiveSessionId: 'ses-2',
  journalSelectedTp: 'TP 3.2 - Menganalisis Hukum Termodinamika dan Penerapannya pada Siklus Mesin Kalor',
  journalTopic: 'Siklus Carnot dan Efisiensi Mesin Termal',
  journalMethods: ['Praktikum Lab', 'Diskusi Kelompok'],
  journalNotes:
    'Praktikum berjalan tertib dan tepat waktu. Kelompok 3 menyelesaikan analisis data termal tercepat dan alat kalorimeter berfungsi optimal tanpa kendala.',
  journalSyncParent: true,
  journalDraftSavedAt: null,
  journalSubmittedNotice: null,
  journalStudents: INITIAL_CLASS_STUDENTS,
  bukuIndukSearch: '0087462918',
  bukuIndukClassFilter: 'ALL',
  bukuIndukStatusFilter: 'Aktif',
  bukuIndukActiveTab: 'RAPOR',
};

const portalSlice = createSlice({
  name: 'portal',
  initialState,
  reducers: {
    setAcademicYear(state, action: PayloadAction<string>) {
      state.academicYear = action.payload;
    },
    setEwsFilter(state, action: PayloadAction<EwsRiskFilter>) {
      state.ewsFilter = action.payload;
    },
    toggleEwsShowAll(state) {
      state.ewsShowAll = !state.ewsShowAll;
    },
    setJournalSession(state, action: PayloadAction<string>) {
      state.journalActiveSessionId = action.payload;
      state.journalSubmittedNotice = null;
    },
    setJournalSelectedTp(state, action: PayloadAction<string>) {
      state.journalSelectedTp = action.payload;
    },
    setJournalTopic(state, action: PayloadAction<string>) {
      state.journalTopic = action.payload;
    },
    toggleJournalMethod(state, action: PayloadAction<string>) {
      const idx = state.journalMethods.indexOf(action.payload);
      if (idx >= 0) {
        state.journalMethods.splice(idx, 1);
      } else {
        state.journalMethods.push(action.payload);
      }
    },
    setJournalNotes(state, action: PayloadAction<string>) {
      state.journalNotes = action.payload;
    },
    setJournalSyncParent(state, action: PayloadAction<boolean>) {
      state.journalSyncParent = action.payload;
    },
    setStudentAttendanceStatus(
      state,
      action: PayloadAction<{ id: string; status: AttendanceCode }>,
    ) {
      const target = state.journalStudents.find((s) => s.id === action.payload.id);
      if (target) {
        target.status = action.payload.status;
      }
    },
    markAllStudentsPresent(state) {
      state.journalStudents.forEach((s) => {
        s.status = 'H';
      });
    },
    saveJournalDraft(state) {
      state.journalDraftSavedAt = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    submitJournalRecord(state) {
      const presentCount = state.journalStudents.filter((s) => s.status === 'H').length;
      state.journalSubmittedNotice = `Jurnal KBM "${state.journalTopic}" & presensi (${presentCount}/${state.journalStudents.length} hadir) tersinkronisasi ke SIAKAD Pusat.`;
    },
    setBukuIndukSearch(state, action: PayloadAction<string>) {
      state.bukuIndukSearch = action.payload;
    },
    setBukuIndukClassFilter(state, action: PayloadAction<string>) {
      state.bukuIndukClassFilter = action.payload;
    },
    setBukuIndukStatusFilter(state, action: PayloadAction<string>) {
      state.bukuIndukStatusFilter = action.payload;
    },
    setBukuIndukActiveTab(state, action: PayloadAction<BukuIndukTab>) {
      state.bukuIndukActiveTab = action.payload;
    },
  },
});

export const {
  setAcademicYear,
  setEwsFilter,
  toggleEwsShowAll,
  setJournalSession,
  setJournalSelectedTp,
  setJournalTopic,
  toggleJournalMethod,
  setJournalNotes,
  setJournalSyncParent,
  setStudentAttendanceStatus,
  markAllStudentsPresent,
  saveJournalDraft,
  submitJournalRecord,
  setBukuIndukSearch,
  setBukuIndukClassFilter,
  setBukuIndukStatusFilter,
  setBukuIndukActiveTab,
} = portalSlice.actions;

export default portalSlice.reducer;

