import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiError, apiRequest } from '../../api/client';

export interface Period {
  id: string;
  name: string;
  semester: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  room_code: string | null;
  student_count: string;
}

export interface Student {
  id: string;
  nis: string | null;
  nisn: string | null;
  full_name: string;
  status: string;
}

interface SiakadState {
  periods: Period[];
  classrooms: Classroom[];
  students: Student[];
  selectedPeriodId: string;
  loading: boolean;
  message: string | null;
  error: string | null;
}

const initialState: SiakadState = {
  periods: [],
  classrooms: [],
  students: [],
  selectedPeriodId: '',
  loading: false,
  message: null,
  error: null,
};

export const fetchSiakadOverview = createAsyncThunk<
  { periods: Period[]; classrooms: Classroom[]; students: Student[] },
  void,
  { rejectValue: string }
>('siakad/fetchOverview', async (_, { rejectWithValue }) => {
  try {
    const [periods, classrooms, students] = await Promise.all([
      apiRequest<Period[]>('/api/v1/core/siakad/periods'),
      apiRequest<Classroom[]>('/api/v1/core/siakad/classrooms'),
      apiRequest<Student[]>('/api/v1/core/siakad/students'),
    ]);
    return { periods, classrooms, students };
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal memuat data SIAKAD');
  }
});

export const createAcademicPeriod = createAsyncThunk<
  string,
  {
    name: string;
    semester: 'ODD' | 'EVEN';
    startDate: string;
    endDate: string;
    isActive: boolean;
  },
  { rejectValue: string }
>('siakad/createPeriod', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await apiRequest('/api/v1/core/siakad/periods', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await dispatch(fetchSiakadOverview());
    return 'Tahun ajaran berhasil ditambahkan';
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal membuat tahun ajaran');
  }
});

export const activateAcademicPeriod = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('siakad/activatePeriod', async (id, { dispatch, rejectWithValue }) => {
  try {
    await apiRequest(`/api/v1/core/siakad/periods/${id}/activate`, { method: 'PATCH' });
    await dispatch(fetchSiakadOverview());
    return id;
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal mengaktifkan periode');
  }
});

export const createClassroom = createAsyncThunk<
  string,
  { academicPeriodId: string; name: string; gradeLevel: number },
  { rejectValue: string }
>('siakad/createClassroom', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await apiRequest('/api/v1/core/siakad/classrooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await dispatch(fetchSiakadOverview());
    return 'Rombongan belajar berhasil ditambahkan';
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal menambah rombel');
  }
});

export const checkDapodikExport = createAsyncThunk<string, void, { rejectValue: string }>(
  'siakad/checkDapodik',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiRequest<{ totalActiveStudents: number }>(
        '/api/v1/core/siakad/students/export/dapodik',
      );
      return `Siap ekspor Dapodik/EMIS untuk ${data.totalActiveStudents} siswa aktif`;
    } catch (err) {
      return rejectWithValue((err as ApiError).message ?? 'Gagal mengekspor Dapodik');
    }
  },
);

const siakadSlice = createSlice({
  name: 'siakad',
  initialState,
  reducers: {
    setSelectedPeriodId(state, action: PayloadAction<string>) {
      state.selectedPeriodId = action.payload;
    },
    clearSiakadNotice(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiakadOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiakadOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = action.payload.periods;
        state.classrooms = action.payload.classrooms;
        state.students = action.payload.students;
        if (action.payload.periods.length > 0 && !state.selectedPeriodId) {
          const active =
            action.payload.periods.find((item) => item.is_active) ?? action.payload.periods[0];
          state.selectedPeriodId = active.id;
        }
      })
      .addCase(fetchSiakadOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Gagal memuat data SIAKAD';
      })
      .addCase(createAcademicPeriod.fulfilled, (state, action) => {
        state.message = action.payload;
        state.error = null;
      })
      .addCase(createAcademicPeriod.rejected, (state, action) => {
        state.error = action.payload ?? 'Gagal membuat tahun ajaran';
      })
      .addCase(activateAcademicPeriod.fulfilled, (state, action) => {
        state.selectedPeriodId = action.payload;
        state.message = 'Tahun ajaran aktif diperbarui';
        state.error = null;
      })
      .addCase(createClassroom.fulfilled, (state, action) => {
        state.message = action.payload;
        state.error = null;
      })
      .addCase(createClassroom.rejected, (state, action) => {
        state.error = action.payload ?? 'Gagal menambah rombel';
      })
      .addCase(checkDapodikExport.fulfilled, (state, action) => {
        state.message = action.payload;
        state.error = null;
      })
      .addCase(checkDapodikExport.rejected, (state, action) => {
        state.error = action.payload ?? 'Gagal mengecek ekspor Dapodik';
      });
  },
});

export const { setSelectedPeriodId, clearSiakadNotice } = siakadSlice.actions;
export default siakadSlice.reducer;

