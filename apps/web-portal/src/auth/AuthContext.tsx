import React, { createContext, useContext, useMemo, useState } from 'react';
import { apiRequest, loadSession, saveSession, StoredSession } from '../api/client';

interface AuthContextValue {
  session: StoredSession | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => loadSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      async login(identifier: string, password: string) {
        const res = await apiRequest<StoredSession>(
          '/api/v1/core/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({ identifier, password }),
          },
          false,
        );
        saveSession(res);
        setSession(res);
      },
      async logout() {
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
        setSession(null);
      },
      hasAnyRole(roles: string[]) {
        if (!session) return false;
        if (session.user.roles.includes('SUPER_ADMIN')) return true;
        return roles.some((r) => session.user.roles.includes(r));
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
