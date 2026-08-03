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

    let idleTimer;
    const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (user) {
        idleTimer = setTimeout(() => {
          console.warn('[COFFER SECURITY] Session expired due to user inactivity.');
          logout();
        }, IDLE_TIMEOUT_MS);
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetIdleTimer));
    resetIdleTimer();

    window.addEventListener('coffer:unauthorized', handleUnauthorized);
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
      window.removeEventListener('coffer:unauthorized', handleUnauthorized);
    };
  }, [user]);

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

  const demoLogin = async () => {
    setError(null);
    try {
      const res = await api.post('/auth/demo-login', {});
      api.setAccessToken(res.accessToken);
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
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
        demoLogin,
        logout,
        setUser,
        updateUserProfile,
        refreshSession: checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
