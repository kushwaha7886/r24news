import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user data
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const userType = localStorage.getItem('userType');
      if (userType === 'editor') {
        // For editors, we don't have a current-user endpoint, so we'll use the stored user data
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        if (storedUser) {
          setUser({ ...storedUser, userType: 'editor' });
        } else {
          throw new Error('No stored editor data');
        }
      } else {
        const response = await api.get('/users/current-user');
        setUser({ ...response.data.data, userType: 'user' });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting user login...');
      const userResponse = await api.post('/users/login', { email, password });
      console.log('AuthContext: User login response received:', userResponse.data);

      const { user, accessToken, refreshToken } = userResponse.data.data;

      if (!accessToken || !refreshToken) {
        console.error('AuthContext: Missing tokens in user response');
        return { success: false, error: 'Invalid response from server' };
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userType', user.role === 'editor' ? 'editor' : 'user');
      console.log('AuthContext: Tokens stored in localStorage');

      setUser({ ...user, userType: user.role === 'editor' ? 'editor' : 'user' });
      console.log('AuthContext: User state updated:', user);

      return { success: true };
    } catch (userError) {
      console.error('AuthContext: Login failed');
      const errorMessage = userError.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


