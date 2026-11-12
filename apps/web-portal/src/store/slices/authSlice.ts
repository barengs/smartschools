import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiError, apiRequest, loadSession, saveSession, StoredSession } from '../../api/client';

export interface AuthState {
  session: StoredSession | null;
  loading: boolean;
  error: string | null;
  rememberSession: boolean;
}

const initialState: AuthState = {
  session: loadSession(),
  loading: false,
  error: null,
  rememberSession: true,
};

export const loginUser = createAsyncThunk<
  StoredSession,
  { identifier: string; password: string; rememberSession?: boolean },
  { rejectValue: string }
>('auth/loginUser', async ({ identifier, password }, { rejectWithValue }) => {
  try {
    const res = await apiRequest<StoredSession>(
      '/api/v1/core/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      },
      false,
    );
    saveSession(res);
    return res;
  } catch (err) {
    const apiErr = err as ApiError;
    return rejectWithValue(apiErr.message ?? 'Gagal login SSO');
  }
});

export const logoutUser = createAsyncThunk<void, void>('auth/logoutUser', async () => {
  const current = loadSession();
  if (current?.refreshToken) {
    await apiRequest(
      '/api/v1/core/auth/logout',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      },
      false,
    ).catch(() => undefined);
  }
  saveSession(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRememberSession(state, action: PayloadAction<boolean>) {
      state.rememberSession = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    hydrateSession(state) {
      state.session = loadSession();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Gagal login SSO';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.session = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setRememberSession, clearAuthError, hydrateSession } = authSlice.actions;

export function hasAnyRole(session: StoredSession | null, roles: string[]): boolean {
  if (!session) return false;
  if (session.user.roles.includes('SUPER_ADMIN')) return true;
  return roles.some((r) => session.user.roles.includes(r));
}

export default authSlice.reducer;

