'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import {
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  setAdminSecret as storeAdminSecret,
  getAdminSecret,
  clearAdminSecret as eraseAdminSecret,
  registerAuthFailureHandler
} from '@/lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [adminSecret, setAdminSecretState] = useState('');
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      clearAccessToken();
      eraseAdminSecret();
      setUser(null);
      setToken(null);
      setAdminSecretState('');
    }
  }, []);

  // Restore session on initial app load
  useEffect(() => {
    registerAuthFailureHandler(() => {
      logout();
    });

    const initAuth = async () => {
      try {
        const storedAdminSecret = getAdminSecret();
        if (storedAdminSecret) {
          setAdminSecretState(storedAdminSecret);
        }

        // Attempt to refresh the access token via HttpOnly cookie
        const refreshRes = await authAPI.refreshToken();
        const newAccessToken = refreshRes?.data?.accessToken;

        if (newAccessToken) {
          setAccessToken(newAccessToken);
          setToken(newAccessToken);

          // Fetch full current user profile
          const meRes = await authAPI.getMe();
          if (meRes?.data?.user) {
            setUser(meRes.data.user);
          }
        }
      } catch (err) {
        // No valid session, reset auth state
        clearAccessToken();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { user: userData, accessToken } = res.data;
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    return res;
  };

  const updateAdminSecret = (secret) => {
    storeAdminSecret(secret);
    setAdminSecretState(secret);
  };

  const clearAdminSecret = () => {
    eraseAdminSecret();
    setAdminSecretState('');
  };

  const value = {
    user,
    token,
    adminSecret,
    loading,
    isAuthenticated: !!user,
    isUser: user?.role === 'user',
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateAdminSecret,
    clearAdminSecret,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
