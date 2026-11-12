import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiError, apiRequest } from '../../api/client';

export interface Invoice {
  id: string;
  invoice_number: string;
  student_name: string;
  nis: string | null;
  billing_type: string;
  amount: string;
  due_date: string;
  status: string;
  va_number: string | null;
}

export interface FinanceSummary {
  totals: {
    total_billed: string;
    total_paid: string;
    total_unpaid: string;
    invoice_count: string;
  };
}

interface FinanceState {
  invoices: Invoice[];
  summary: FinanceSummary | null;
  loading: boolean;
  message: string | null;
  error: string | null;
}

const initialState: FinanceState = {
  invoices: [],
  summary: null,
  loading: false,
  message: null,
  error: null,
};

export const fetchFinanceOverview = createAsyncThunk<
  { invoices: Invoice[]; summary: FinanceSummary },
  void,
  { rejectValue: string }
>('finance/fetchOverview', async (_, { rejectWithValue }) => {
  try {
    const [invoices, summary] = await Promise.all([
      apiRequest<Invoice[]>('/api/v1/core/finance/invoices'),
      apiRequest<FinanceSummary>('/api/v1/core/finance/summary'),
    ]);
    return { invoices, summary };
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal memuat data keuangan');
  }
});

export const generateBulkSppInvoices = createAsyncThunk<
  string,
  { amount: number; dueDate: string },
  { rejectValue: string }
>('finance/generateBulkSpp', async ({ amount, dueDate }, { dispatch, rejectWithValue }) => {
  try {
    const res = await apiRequest<{ generatedCount: number }>(
      '/api/v1/core/finance/invoices/bulk-spp',
      {
        method: 'POST',
        body: JSON.stringify({ amount, dueDate }),
      },
    );
    await dispatch(fetchFinanceOverview());
    return `Berhasil menerbitkan ${res.generatedCount} tagihan SPP`;
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal menerbitkan tagihan SPP');
  }
});

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearFinanceNotice(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanceOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinanceOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.invoices;
        state.summary = action.payload.summary;
      })
      .addCase(fetchFinanceOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Gagal memuat data keuangan';
      })
      .addCase(generateBulkSppInvoices.fulfilled, (state, action) => {
        state.message = action.payload;
        state.error = null;
      })
      .addCase(generateBulkSppInvoices.rejected, (state, action) => {
        state.error = action.payload ?? 'Gagal menerbitkan tagihan SPP';
      });
  },
});

export const { clearFinanceNotice } = financeSlice.actions;
export default financeSlice.reducer;

