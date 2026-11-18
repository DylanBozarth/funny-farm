import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type User = {
  id: string;
  email: string;
  displayName: string;
};

type AuthContextValue = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => void;
  updateDisplayName: (displayName: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * PLACEHOLDER AUTH: there is no backend yet, so any well-formed credentials
 * "work" and the session lives only in memory. Replace the bodies of
 * signIn/signUp/signOut with real API calls (and persist the token with
 * expo-secure-store) when the server exists.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    setUser({ id: 'local-user', email, displayName: email.split('@')[0] });
  }, []);

  const signUp = useCallback(async (email: string, _password: string, displayName: string) => {
    await new Promise((r) => setTimeout(r, 400));
    setUser({ id: 'local-user', email, displayName });
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const updateDisplayName = useCallback((displayName: string) => {
    setUser((u) => (u ? { ...u, displayName } : u));
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut, updateDisplayName }),
    [user, signIn, signUp, signOut, updateDisplayName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
