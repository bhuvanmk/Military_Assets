import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            const userData = res.data;
            if (userData.role) {
              userData.role = userData.role.replace('ROLE_', '');
            }
            setUser(userData);
            setToken(storedToken);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            throw new Error('Failed session validation');
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { token: jwtToken, ...rawUserData } = res.data;
      const userData = {
        ...rawUserData,
        role: rawUserData.role ? rawUserData.role.replace('ROLE_', '') : ''
      };
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const adminLogin = async (credentials) => {
    const res = await authService.adminLogin(credentials);
    if (res.success && res.data) {
      const { token: jwtToken, ...rawUserData } = res.data;
      const userData = {
        ...rawUserData,
        role: rawUserData.role ? rawUserData.role.replace('ROLE_', '') : ''
      };
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Admin login failed');
  };

  const logout = async () => {
    const wasAdmin = user?.role?.replace('ROLE_', '') === 'ADMIN';
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (wasAdmin) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const currentRole = user.role?.replace('ROLE_', '');
    if (Array.isArray(roles)) {
      return roles.map((r) => r.replace('ROLE_', '')).includes(currentRole);
    }
    return currentRole === roles.replace('ROLE_', '');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        adminLogin,
        logout,
        loading,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
