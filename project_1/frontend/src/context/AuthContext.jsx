import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    let userData;

    // Directly authenticate accountant account via accountant backend
    if (username.toLowerCase().includes('accountant')) {
      const accountantRes = await api.post('/accountant/auth/login', { username, password });
      const { token, user: actUser } = accountantRes.data.data;
      userData = { username: actUser.username, role: actUser.role, fullName: actUser.fullName };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, role, fullName } = response.data;
      userData = { username, role, fullName };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (primaryErr) {
      // If primary auth fails, try accountant module auth endpoint
      try {
        const accountantRes = await api.post('/accountant/auth/login', { username, password });
        const { token, user: actUser } = accountantRes.data.data;
        userData = { username: actUser.username, role: actUser.role, fullName: actUser.fullName };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      } catch (secErr) {
        throw primaryErr;
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAccountant = user?.role === 'ACCOUNTANT';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAccountant, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
