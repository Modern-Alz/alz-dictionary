import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiSignup, apiLogin, apiLogout, apiGetMe, apiUpdateMe,
  getAccessToken, clearTokens,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [ready, setReady] = useState(false);

  // On mount — restore session from stored token
  useEffect(() => {
    async function restore() {
      if (!getAccessToken()) { setReady(true); return; }
      try {
        const { user } = await apiGetMe();
        setUser(user);
      } catch {
        clearTokens();
      } finally {
        setReady(true);
      }
    }
    restore();
  }, []);

  const signup = useCallback(async (payload) => {
    const user = await apiSignup(payload);
    setUser(user);
    return user;
  }, []);

  const login = useCallback(async (email, password) => {
    const user = await apiLogin(email, password);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { user } = await apiUpdateMe(updates);
    setUser(user);
    return user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
