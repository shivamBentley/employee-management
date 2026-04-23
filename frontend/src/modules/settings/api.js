import api from '../../shared/utils/axios';

export const getSettings = () => api.get('/settings');
export const updateSettings = (settings) => api.put('/settings', { settings });
