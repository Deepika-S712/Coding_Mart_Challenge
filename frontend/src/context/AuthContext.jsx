import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cms_faculty_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cms_faculty_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('cms_faculty_token');
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res.success && res.data && res.data.role === 'FACULTY') {
            setUser(res.data);
            localStorage.setItem('cms_faculty_user', JSON.stringify(res.data));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password, remember = false) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data) {
      const { accessToken, user: userData } = res.data;
      if (userData.role !== 'FACULTY') {
        throw new Error('Access denied: Unauthorized role');
      }
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('cms_faculty_token', accessToken);
      localStorage.setItem('cms_faculty_user', JSON.stringify(userData));
      if (remember) {
        localStorage.setItem('cms_remember_email', email);
      } else {
        localStorage.removeItem('cms_remember_email');
      }
      return userData;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout().catch(() => {});
      }
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('cms_faculty_token');
      localStorage.removeItem('cms_faculty_user');
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user && user.role === 'FACULTY',
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
