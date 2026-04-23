import api from '../../shared/utils/axios';

export const getBackups = () => api.get('/backups');
export const runBackup = () => api.post('/backups');
export const downloadBackup = (filename) =>
  api.get(`/backups/${encodeURIComponent(filename)}/download`, { responseType: 'blob' });
