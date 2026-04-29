import api from '../../shared/utils/axios';

export const getLeaves = (params) => api.get('/leaves', { params });
export const applyLeave = (data) => api.post('/leaves', data);
export const updateLeave = (id, data) => api.put(`/leaves/${id}`, data);
export const approveLeave = (id) => api.put(`/leaves/${id}/approve`);
export const rejectLeave = (id) => api.put(`/leaves/${id}/reject`);
export const cancelLeave = (id) => api.delete(`/leaves/${id}`);
export const getLeaveBalances = (params) => api.get('/leave-balances', { params });
export const getMonthlyUsage = (params) => api.get('/leave-balances/monthly', { params });
export const calculateDays = (params) => api.get('/leave-balances/calculate', { params });
