import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      api.setApiKey(apiKey);
      validateUser();
    } else {
      setLoading(false);
    }
  }, []);

  const validateUser = async () => {
    try {
      const userData = await api.validateApiKey();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (apiKey) => {
    try {
      api.setApiKey(apiKey);
      const userData = await api.validateApiKey();
      setUser(userData);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      api.clearApiKey();
      return false;
    }
  };

  const logout = () => {
    api.clearApiKey();
    setUser(null);
    setError(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await api.validateApiKey();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
