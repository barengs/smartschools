import { FormEvent, useEffect, useState } from 'react';
import { ApiError, apiRequest } from '../api/client';

interface UserRow {
  id: string;
  username: string;
  email: string | null;
  is_active: boolean;
  roles: string[];
}

interface RoleRow {
  id: string;
  code: string;
  name: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleCode, setRoleCode] = useState('GURU');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [u, r] = await Promise.all([
        apiRequest<UserRow[]>('/api/v1/core/users'),
        apiRequest<RoleRow[]>('/api/v1/core/roles'),
      ]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal memuat daftar pengguna');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
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
      setUsername('');
      setEmail('');
      setPassword('');
      setMessage('Pengguna berhasil dibuat');
      await load();
    } catch (err) {
      setError((err as ApiError).message ?? 'Gagal membuat pengguna');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manajemen Pengguna &amp; RBAC SSO</h1>
      </header>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Tambah Akun Baru</h3>
        <form onSubmit={handleCreate} className="inline-form">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email (opsional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (min 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <select value={roleCode} onChange={(e) => setRoleCode(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.code}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Tambah User
          </button>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Peran (RBAC)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.username}</strong>
                </td>
                <td>{u.email ?? '-'}</td>
                <td>{u.roles.join(', ')}</td>
                <td>{u.is_active ? 'Aktif' : 'Nonaktif'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
