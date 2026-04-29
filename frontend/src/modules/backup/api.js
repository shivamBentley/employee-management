import api from '../../shared/utils/axios';

export const getBackups = () => api.get('/backups');
export const runBackup = () => api.post('/backups');
export const downloadBackup = (filename) =>
  api.get(`/backups/${encodeURIComponent(filename)}/download`, { responseType: 'blob' });
export const restoreBackup = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/backups/restore', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
