import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUser = async () => {
    try {
      if (!api.getAccessToken()) {
        // Try refreshing first
        try {
          const refreshRes = await api.post('/auth/refresh', {});
          api.setAccessToken(refreshRes.accessToken);
          setUser(refreshRes.user);
        } catch {
          setUser(null);
        }
      } else {
        const res = await api.get('/auth/me');
        setUser(res.user);
      }
    } catch (err) {
      setUser(null);
      api.setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();

    const handleUnauthorized = () => {
      setUser(null);
      api.setAccessToken(null);
    };

    window.addEventListener('coffer:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('coffer:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      api.setAccessToken(res.accessToken);
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password, displayName, currency = '$ USD') => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password, displayName, currency });
      api.setAccessToken(res.accessToken);
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      api.setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
