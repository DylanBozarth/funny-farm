import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as api from '@/api/auth';

import { loadToken, saveToken } from './session-storage';

export type User = api.User;

type AuthContextValue = {
  user: User | null;
  /** True until the saved session has been checked with the server. */
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On launch, restore the saved token and confirm the server still accepts it.
  useEffect(() => {
    (async () => {
      const saved = await loadToken();
      if (saved) {
        try {
          const { user } = await api.getMe(saved);
          setUser(user);
          setToken(saved);
        } catch (e) {
          // Rejected token (e.g. server restarted): forget it. Network errors keep it for next launch.
          if (e instanceof api.ApiError && e.status === 401) await saveToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const { token, user } = await api.login(username, password);
    await saveToken(token);
    setToken(token);
    setUser(user);
  }, []);

  const signOut = useCallback(async () => {
    const current = token;
    setUser(null);
    setToken(null);
    await saveToken(null);
    if (current) await api.logout(current).catch(() => {}); // server-side invalidation is best-effort
  }, [token]);

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
