import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiError, apiRequest } from '../../api/client';

export interface UserRow {
  id: string;
  username: string;
  email: string | null;
  is_active: boolean;
  roles: string[];
}

export interface RoleRow {
  id: string;
  code: string;
  name: string;
}

interface UsersState {
  users: UserRow[];
  roles: RoleRow[];
  loading: boolean;
  message: string | null;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  roles: [],
  loading: false,
  message: null,
  error: null,
};

export const fetchUsersAndRoles = createAsyncThunk<
  { users: UserRow[]; roles: RoleRow[] },
  void,
  { rejectValue: string }
>('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [users, roles] = await Promise.all([
      apiRequest<UserRow[]>('/api/v1/core/users'),
      apiRequest<RoleRow[]>('/api/v1/core/roles'),
    ]);
    return { users, roles };
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal memuat daftar pengguna');
  }
});

export const createUserAccount = createAsyncThunk<
  string,
  { username: string; email?: string; password: string; roleCode: string },
  { rejectValue: string }
>('users/create', async ({ username, email, password, roleCode }, { dispatch, rejectWithValue }) => {
  try {
    await apiRequest('/api/v1/core/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email: email || undefined,
        password,
        roleCodes: [roleCode],
      }),
    });
    await dispatch(fetchUsersAndRoles());
    return `Akun ${username} berhasil dibuat`;
  } catch (err) {
    return rejectWithValue((err as ApiError).message ?? 'Gagal membuat pengguna');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersNotice(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersAndRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersAndRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.roles = action.payload.roles;
      })
      .addCase(fetchUsersAndRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Gagal memuat daftar pengguna';
      })
      .addCase(createUserAccount.fulfilled, (state, action) => {
        state.message = action.payload;
        state.error = null;
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.error = action.payload ?? 'Gagal membuat pengguna';
      });
  },
});

export const { clearUsersNotice } = usersSlice.actions;
export default usersSlice.reducer;

