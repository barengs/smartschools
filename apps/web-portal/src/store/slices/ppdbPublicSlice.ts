import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiError, apiRequest } from '../../api/client';
import { calculateHaversineMeters } from '../../utils/format';

export type AdmissionTrack = 'ZONASI' | 'PRESTASI' | 'AFIRMASI' | 'MUTASI' | 'REGULER';

export interface PpdbDraftForm {
  fullName: string;
  username: string;
  password: string;
  email: string;
  nisn: string;
  nik: string;
  gender: 'MALE' | 'FEMALE';
  admissionTrack: AdmissionTrack;
  primarySchool: string;
  secondarySchool: string;
  latitude: string;
  longitude: string;
  streetAddress: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  postalCode: string;
  housingStatus: 'OWN_PARENT' | 'GUARDIAN' | 'RENT';
  previousSchoolNpsn: string;
  previousSchool: string;
  sklNumber: string;
  reportAverage: string;
  parentName: string;
  parentPhone: string;
  paymentMethod: 'VA_BNI' | 'QRIS' | 'VA_MANDIRI';
}

export interface PpdbDocCheckItem {
  code: 'KK' | 'AKTA' | 'SKL' | 'GEOTAG';
  title: string;
  fileName: string;
  status: 'UPLOADED' | 'REQUIRED' | 'VERIFIED';
}

export interface PpdbRegisterResponse {
  applicationId: string;
  registrationNumber: string;
  verificationStatus: string;
  invoiceId: string | null;
}

export interface SelectionCandidateRecord {
  rank: number;
  registrationNumber: string;
  nisn: string;
  nik: string;
  fullName: string;
  previousSchool: string;
  trackLabel: string;
  admissionTrack: AdmissionTrack;
  originArea: string;
  distanceMeters: number;
  placementScore: number;
  reportScore: number;
  finalScore: number;
  status: 'LULUS UTAMA' | 'CADANGAN PRIORITAS' | 'CADANGAN AKTIF';
  schoolAccepted: string;
  verifiedAt: string;
  notes: string;
}

export interface PpdbPublicState {
  currentStep: number;
  draft: PpdbDraftForm;
  checklist: PpdbDocCheckItem[];
  distanceMeters: number;
  lastSavedAt: string | null;
  submitting: boolean;
  submitError: string | null;
  submitResult: PpdbRegisterResponse | null;
  lookupQuery: string;
  lookupTrack: string;
  lookupResult: SelectionCandidateRecord | null;
  lookupSearched: boolean;
  recapTab: 'ACCEPTED' | 'WAITLIST';
  recapSearch: string;
  recapPage: number;
}

export const SCHOOL_GATE_COORDS = {
  lat: -6.59985,
  lng: 106.81142,
};

export const SELECTION_CANDIDATE_DIRECTORY: SelectionCandidateRecord[] = [
  {
    rank: 1,
    registrationNumber: 'PPDB-2026-0012',
    nisn: '0081122301',
    nik: '3271041205090001',
    fullName: 'Muhammad Fadhil Al-Ghifari',
    previousSchool: 'SMP Negeri 1 Bogor',
    trackLabel: 'Zonasi Murni',
    admissionTrack: 'ZONASI',
    originArea: 'Barat',
    distanceMeters: 215,
    placementScore: 91.5,
    reportScore: 94.2,
    finalScore: 96.4,
    status: 'LULUS UTAMA',
    schoolAccepted: 'SMA Negeri Nusantara Unggul',
    verifiedAt: '20 Nov 2026, 09:12 WIB',
    notes: 'Rekomendasi Zonasi Jarak Dekat',
  },
  {
    rank: 3,
    registrationNumber: 'PPDB-2026-0245',
    nisn: '0081122398',
    nik: '3271042108090004',
    fullName: 'Clara Salsabila Pramesti',
    previousSchool: 'SMP IT Al-Madinah',
    trackLabel: 'Prestasi Akademik',
    admissionTrack: 'PRESTASI',
    originArea: 'Barat',
    distanceMeters: 1850,
    placementScore: 93.0,
    reportScore: 95.8,
    finalScore: 95.4,
    status: 'LULUS UTAMA',
    schoolAccepted: 'SMA Negeri Nusantara Unggul',
    verifiedAt: '20 Nov 2026, 10:05 WIB',
    notes: 'Juara OSN Tingkat Provinsi',
  },
  {
    rank: 14,
    registrationNumber: 'PPDB-2026-0481',
    nisn: '0098127364',
    nik: '3271045509100003',
    fullName: 'Aisyah Azzahra Putri',
    previousSchool: 'SMP Negeri 1 Unggulan Kota Bogor',
    trackLabel: 'Zonasi Domisili Murni',
    admissionTrack: 'ZONASI',
    originArea: 'Luar Kota',
    distanceMeters: 412,
    placementScore: 88.0,
    reportScore: 91.45,
    finalScore: 93.24,
    status: 'LULUS UTAMA',
    schoolAccepted: 'SMA Negeri Nusantara Unggul',
    verifiedAt: '20 Nov 2026, 14:32 WIB',
    notes: 'Pilihan 1 (Utama) · Jalur Zonasi Domisili Murni',
  },
  {
    rank: 15,
    registrationNumber: 'PPDB-2026-0122',
    nisn: '0089821122',
    nik: '3271041504090007',
    fullName: 'Rizky Ramadhan Hakim',
    previousSchool: 'SMP Negeri 4 Cibinong',
    trackLabel: 'Zonasi Murni',
    admissionTrack: 'ZONASI',
    originArea: 'Barat',
    distanceMeters: 440,
    placementScore: 87.5,
    reportScore: 90.8,
    finalScore: 92.3,
    status: 'LULUS UTAMA',
    schoolAccepted: 'SMA Negeri Nusantara Unggul',
    verifiedAt: '20 Nov 2026, 15:10 WIB',
    notes: 'Berkas Lengkap & Terverifikasi',
  },
  {
    rank: 156,
    registrationNumber: 'PPDB-2026-3390',
    nisn: '0094418273',
    nik: '3271040301100009',
    fullName: 'Galang Pratama Dewa',
    previousSchool: 'SMP Negeri 2 Sukaraja',
    trackLabel: 'Zonasi Murni',
    admissionTrack: 'ZONASI',
    originArea: 'Barat',
    distanceMeters: 1420,
    placementScore: 76.0,
    reportScore: 82.4,
    finalScore: 79.44,
    status: 'CADANGAN PRIORITAS',
    schoolAccepted: 'Menunggu Pelimpahan Kuota Gelombang 1',
    verifiedAt: '21 Nov 2026, 08:40 WIB',
    notes: 'Urutan Cadangan #6 · Menunggu Konfirmasi Daftar Ulang',
  },
  {
    rank: 161,
    registrationNumber: 'PPDB-2026-4114',
    nisn: '0091283745',
    nik: '3271040911100002',
    fullName: 'Nabila Kayla Zhafira',
    previousSchool: 'SMP Bina Bangsa Mandiri',
    trackLabel: 'Zonasi Murni',
    admissionTrack: 'ZONASI',
    originArea: 'Timur',
    distanceMeters: 1490,
    placementScore: 74.5,
    reportScore: 81.2,
    finalScore: 76.45,
    status: 'CADANGAN AKTIF',
    schoolAccepted: 'Antrean Cadangan Aktif',
    verifiedAt: '21 Nov 2026, 09:15 WIB',
    notes: 'Urutan Cadangan #11',
  },
];

const INITIAL_LAT = '-6.602148';
const INITIAL_LNG = '106.814321';

const initialState: PpdbPublicState = {
  currentStep: 2,
  draft: {
    fullName: 'Aisyah Azzahra Putri',
    username: '',
    password: '',
    email: '',
    nisn: '0098127364',
    nik: '3271045509100003',
    gender: 'FEMALE',
    admissionTrack: 'ZONASI',
    primarySchool: 'SMA Nusantara Unggul (NPSN: 20108923) — Rutin',
    secondarySchool: 'SMA Negeri 3 Kota Madya (NPSN: 20108840)',
    latitude: INITIAL_LAT,
    longitude: INITIAL_LNG,
    streetAddress: 'Jl. Cempaka Putih Baru No. 14A, Blok B',
    rt: '004',
    rw: '009',
    village: 'Babakan Madang',
    district: 'Bogor Tengah',
    city: 'Kota Bogor',
    postalCode: '16128',
    housingStatus: 'OWN_PARENT',
    previousSchoolNpsn: '20219482',
    previousSchool: 'SMP Negeri 1 Unggulan Kota Bogor',
    sklNumber: 'SKL-SMP1/2026/05/8921-A',
    reportAverage: '91.45',
    parentName: '',
    parentPhone: '',
    paymentMethod: 'VA_BNI',
  },
  checklist: [
    {
      code: 'KK',
      title: 'Kartu Keluarga (KK) Asli',
      fileName: 'kk_aisyah.pdf (1.2 MB)',
      status: 'UPLOADED',
    },
    {
      code: 'AKTA',
      title: 'Akta Kelahiran Siswa',
      fileName: 'akta_aisyah.pdf (844 KB)',
      status: 'UPLOADED',
    },
    {
      code: 'SKL',
      title: 'SKL / Legalisir Rapor SMP',
      fileName: 'Perlu Unggah di Langkah 3 (Maks 2MB)',
      status: 'REQUIRED',
    },
    {
      code: 'GEOTAG',
      title: 'Bukti Geotagging GPS',
      fileName: 'Terverifikasi Otomatis via Peta',
      status: 'VERIFIED',
    },
  ],
  distanceMeters: calculateHaversineMeters(
    Number(INITIAL_LAT),
    Number(INITIAL_LNG),
    SCHOOL_GATE_COORDS.lat,
    SCHOOL_GATE_COORDS.lng,
  ),
  lastSavedAt: null,
  submitting: false,
  submitError: null,
  submitResult: null,
  lookupQuery: 'PPDB-2026-0481',
  lookupTrack: 'ZONASI',
  lookupResult: SELECTION_CANDIDATE_DIRECTORY[2],
  lookupSearched: true,
  recapTab: 'ACCEPTED',
  recapSearch: '',
  recapPage: 1,
};

export const submitPpdbRegistration = createAsyncThunk<
  PpdbRegisterResponse,
  PpdbDraftForm,
  { rejectValue: string }
>('ppdbPublic/submit', async (draft, { rejectWithValue }) => {
  try {
    return await apiRequest<PpdbRegisterResponse>(
      '/api/v1/core/ppdb/register',
      {
        method: 'POST',
        body: JSON.stringify({
          fullName: draft.fullName.trim(),
          username: draft.username.trim(),
          password: draft.password,
          email: draft.email.trim() || undefined,
          nisn: draft.nisn.trim() || undefined,
          gender: draft.gender,
          admissionTrack: draft.admissionTrack,
          previousSchool: draft.previousSchool.trim() || undefined,
          parentName: draft.parentName.trim(),
          parentPhone: draft.parentPhone.trim(),
          ppdbFeeAmount: 150000,
        }),
      },
      false,
    );
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal mengirim pendaftaran PPDB');
  }
});

const ppdbPublicSlice = createSlice({
  name: 'ppdbPublic',
  initialState,
  reducers: {
    setWizardStep(state, action: PayloadAction<number>) {
      state.currentStep = Math.max(1, Math.min(5, action.payload));
    },
    updateDraftField<K extends keyof PpdbDraftForm>(
      state: PpdbPublicState,
      action: PayloadAction<{ key: K; value: PpdbDraftForm[K] }>,
    ) {
      state.draft[action.payload.key] = action.payload.value;
      if (action.payload.key === 'latitude' || action.payload.key === 'longitude') {
        const lat = Number(state.draft.latitude);
        const lng = Number(state.draft.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          state.distanceMeters = calculateHaversineMeters(
            lat,
            lng,
            SCHOOL_GATE_COORDS.lat,
            SCHOOL_GATE_COORDS.lng,
          );
        }
      }
    },
    selectAdmissionTrack(state, action: PayloadAction<AdmissionTrack>) {
      state.draft.admissionTrack = action.payload;
      state.currentStep = 1;
    },
    markChecklistUploaded(
      state,
      action: PayloadAction<{ code: PpdbDocCheckItem['code']; fileName: string }>,
    ) {
      const target = state.checklist.find((item) => item.code === action.payload.code);
      if (target) {
        target.fileName = action.payload.fileName;
        target.status = 'UPLOADED';
      }
    },
    saveDraftTimestamp(state) {
      state.lastSavedAt = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
    resetSubmitError(state) {
      state.submitError = null;
    },
    setLookupQuery(state, action: PayloadAction<string>) {
      state.lookupQuery = action.payload;
    },
    setLookupTrack(state, action: PayloadAction<string>) {
      state.lookupTrack = action.payload;
    },
    runSelectionLookup(state) {
      const normalized = state.lookupQuery.trim().toLowerCase();
      state.lookupSearched = true;
      const found =
        SELECTION_CANDIDATE_DIRECTORY.find(
          (item) =>
            (item.registrationNumber.toLowerCase() === normalized ||
              item.nisn === state.lookupQuery.trim() ||
              item.fullName.toLowerCase().includes(normalized)) &&
            (state.lookupTrack === 'ALL' || item.admissionTrack === state.lookupTrack),
        ) ?? null;
      state.lookupResult = found;
    },
    setRecapTab(state, action: PayloadAction<'ACCEPTED' | 'WAITLIST'>) {
      state.recapTab = action.payload;
      state.recapPage = 1;
    },
    setRecapSearch(state, action: PayloadAction<string>) {
      state.recapSearch = action.payload;
      state.recapPage = 1;
    },
    setRecapPage(state, action: PayloadAction<number>) {
      state.recapPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPpdbRegistration.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitPpdbRegistration.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitResult = action.payload;
        state.currentStep = 5;
      })
      .addCase(submitPpdbRegistration.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload ?? 'Gagal mengirim pendaftaran E-PPDB';
      });
  },
});

export const {
  setWizardStep,
  updateDraftField,
  selectAdmissionTrack,
  markChecklistUploaded,
  saveDraftTimestamp,
  resetSubmitError,
  setLookupQuery,
  setLookupTrack,
  runSelectionLookup,
  setRecapTab,
  setRecapSearch,
  setRecapPage,
} = ppdbPublicSlice.actions;

export default ppdbPublicSlice.reducer;

