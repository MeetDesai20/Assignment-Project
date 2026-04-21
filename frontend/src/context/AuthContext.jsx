import React, { createContext, useState, useContext, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { storage } from '../utils/helpers';
import { notifyError, notifyInfo, notifySuccess } from '../utils/toast';

/**
 * Authentication Context
 * Manages user authentication state
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get('user'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistAuth = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);

    if (nextUser) {
      storage.set('user', nextUser);
    } else {
      storage.remove('user');
    }

    if (nextToken) {
      localStorage.setItem('token', nextToken);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const extractAuthPayload = useCallback((response) => {
    const payload = response.data?.data ?? response.data ?? {};
    return {
      user: payload.user ?? payload,
      token: payload.token ?? response.data?.token ?? null,
    };
  }, []);

  const signup = useCallback(
    async (email, password, fullName) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post('/auth/signup', {
          email,
          password,
          fullName,
        });
        const { user, token } = extractAuthPayload(response);
        persistAuth(user, token);
        notifySuccess('Signup successful');
        return { success: true, user };
      } catch (err) {
        const message = err.response?.data?.message || 'Signup failed';
        setError(message);
        notifyError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post('/auth/login', {
          email,
          password,
        });
        const { user, token } = extractAuthPayload(response);
        persistAuth(user, token);
        notifySuccess('Login successful');
        return { success: true, user };
      } catch (err) {
        const message = err.response?.data?.message || 'Login failed';
        setError(message);
        notifyError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    persistAuth(null, null);
    notifyInfo('Logged out');
  }, [persistAuth]);

  const checkAuth = useCallback(async () => {
    const currentToken = localStorage.getItem('token');

    if (!currentToken) {
      persistAuth(null, null);
      setLoading(false);
      return { success: false };
    }

    setLoading(true);
    try {
      const response = await apiClient.get('/auth/me');
      const payload = response.data?.data ?? response.data ?? null;
      if (payload) {
        persistAuth(payload, currentToken);
      } else {
        persistAuth(null, null);
      }
      return { success: true };
    } catch (err) {
      persistAuth(null, null);
      return { success: false, error: err.response?.data?.message || 'Session expired' };
    } finally {
      setLoading(false);
    }
  }, [persistAuth]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    signup,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
