import { createContext, useContext, useState, useEffect } from 'react';
import { oidcService } from '../services/oidcService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (oidcService.isConfigured()) {
      window.location.href = oidcService.getLogoutUrl();
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isVendor = user?.role === 'VENDOR';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isVendor, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}