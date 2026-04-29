import api from '../../shared/utils/axios';

export const getStats = () => api.get('/dashboard/stats');
export const downloadPdf = () => api.get('/reports/pdf', { responseType: 'blob' });
export const downloadExcel = () => api.get('/reports/excel', { responseType: 'blob' });
export const seedDemoData = () => api.post('/demo/seed');
export const resetDemoData = () => api.post('/demo/reset');
export const getLeaveSummary = (params) => api.get('/dashboard/leave-summary', { params });
