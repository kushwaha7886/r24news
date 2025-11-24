import { createContext } from 'react';
import api from '../utils/api';
import React, { useState, useEffect } from 'react';

const AuthContext = createContext(null);

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
      const response = await api.get('/users/current-user');
      const userData = response.data.data;
      // Ensure userType is set the same way as in login
      setUser({
        ...userData,
        userType: userData.role === 'admin' ? 'admin' : userData.role === 'editor' ? 'editor' : 'user'
      });
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
      // Store tokens only, user data will be fetched from /me endpoint
      console.log('AuthContext: Tokens stored in localStorage');

      setUser({ ...user, userType: user.role === 'admin' ? 'admin' : user.role === 'editor' ? 'editor' : 'user' });
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
AuthProvider.displayName = 'AuthProvider';
export default AuthContext;
