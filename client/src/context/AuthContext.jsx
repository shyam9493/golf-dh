import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BKEND_URL } from '../config.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  // Rehydrate the authenticated user when a token is available.
  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await axios.get(`${BKEND_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      if (err?.response?.status === 401) {
        // Only clear auth for invalid/expired tokens.
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      const response = await axios.post(`${BKEND_URL}/auth/register`, {
        email,
        password,
        full_name: fullName,
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('authToken', newToken);
      // Fetch user profile after signup
      await fetchUserProfile(newToken);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || 'Signup failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BKEND_URL}/auth/login`, {
        email,
        password,
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('authToken', newToken);
      // Fetch user profile after login
      await fetchUserProfile(newToken);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
