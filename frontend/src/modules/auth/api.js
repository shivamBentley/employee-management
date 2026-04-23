import api from '../../shared/utils/axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const logout = () => api.delete('/auth/logout');

export const me = () => api.get('/auth/me');
