import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiError, apiRequest } from '../../api/client';

export interface PpdbRow {
  id: string;
  registration_number: string;
  full_name: string;
  nis: string | null;
  admission_track: string;
  parent_name: string;
  parent_phone: string;
  verification_status: string;
  documents_jsonb: Array<{ documentType: string; fileName: string }>;
}

interface PpdbAdminState {
  rows: PpdbRow[];
  filterStatus: string;
  loading: boolean;
  message: string | null;
  error: string | null;
}

const initialState: PpdbAdminState = {
  rows: [],
  filterStatus: '',
  loading: false,
  message: null,
  error: null,
};

export const fetchPpdbApplications = createAsyncThunk<
  PpdbRow[],
  string | undefined,
  { rejectValue: string }
>('ppdbAdmin/fetchAll', async (status, { rejectWithValue }) => {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await apiRequest<PpdbRow[]>(`/api/v1/core/ppdb${query}`);
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal memuat data PPDB');
  }
});

export const verifyPpdbApplication = createAsyncThunk<
  string,
  { id: string; status: 'VERIFIED' | 'ACCEPTED' | 'REJECTED'; filterStatus: string },
  { rejectValue: string }
>('ppdbAdmin/verify', async ({ id, status, filterStatus }, { dispatch, rejectWithValue }) => {
  try {
    await apiRequest(`/api/v1/core/ppdb/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await dispatch(fetchPpdbApplications(filterStatus));
    return `Status diperbarui menjadi ${status}`;
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal memperbarui status');
  }
});

export const migratePpdbApplication = createAsyncThunk<
  string,
  { id: string; filterStatus: string },
  { rejectValue: string }
>('ppdbAdmin/migrate', async ({ id, filterStatus }, { dispatch, rejectWithValue }) => {
  try {
    const res = await apiRequest<{ nis: string; parentUsername: string }>(
      `/api/v1/core/ppdb/${id}/migrate`,
      {
        method: 'POST',
        body: JSON.stringify({ dailySpendingLimit: 25000 }),
      },
    );
    await dispatch(fetchPpdbApplications(filterStatus));
    return `One-Click Migration sukses! NIS: ${res.nis}, Akun Ortu: ${res.parentUsername}`;
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal migrasi siswa');
  }
});

const ppdbAdminSlice = createSlice({
  name: 'ppdbAdmin',
  initialState,
  reducers: {
    setFilterStatus(state, action: PayloadAction<string>) {
      state.filterStatus = action.payload;
    },
    clearPpdbAdminNotice(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPpdbApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPpdbApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload;
      })
      .addCase(fetchPpdbApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Gagal memuat data PPDB';
      })
      .addCase(verifyPpdbApplication.fulfilled, (state, action) => {
        state.message = action.payload;
        state.error = null;
      })
      .addCase(verifyPpdbApplication.rejected, (state, action) => {
        state.error = action.payload ?? 'Gagal memperbarui status';
      })
      .addCase(migratePpdbApplication.fulfilled, (state, action) => {
        state.message = action.payload;
        state.error = null;
      })
      .addCase(migratePpdbApplication.rejected, (state, action) => {
        state.error = action.payload ?? 'Gagal migrasi siswa';
      });
  },
});

export const { setFilterStatus, clearPpdbAdminNotice } = ppdbAdminSlice.actions;
export default ppdbAdminSlice.reducer;

