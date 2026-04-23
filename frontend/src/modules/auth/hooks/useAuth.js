import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import { login, logout, me } from '../api';

export function useAuth() {
  const { token, user, setAuth, clearAuth, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await login(email, password);
      setAuth(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      // ignore errors — still clear local state
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await me();
      setUser(data.user);
    } catch (_) {
      clearAuth();
    }
  };

  return { token, user, loading, error, handleLogin, handleLogout, refreshUser };
}
