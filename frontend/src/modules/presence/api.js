import api from '../../shared/utils/axios';

export const getPresence = () => api.get('/presence');
export const updateStatus = (status) => api.put('/presence/status', { status });
