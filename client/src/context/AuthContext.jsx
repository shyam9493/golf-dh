import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BKEND_URL } from '../config.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Optionally fetch user profile
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await axios.get(`${BKEND_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // Token may be invalid, clear it
      localStorage.removeItem('authToken');
      setToken(null);
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
