import api from '../../shared/utils/axios';

export const getEmployees = () => api.get('/users');
export const getEmployee = (id) => api.get(`/users/${id}`);
export const createEmployee = (data) => api.post('/users', data);
export const updateEmployee = (id, data) => api.post(`/users/${id}?_method=PUT`, data);
export const deleteEmployee = (id) => api.delete(`/users/${id}`);
export const getMe = () => api.get('/me');
export const updateMe = (data) => api.post('/me', data);
export const changePassword = (data) => api.put('/me/password', data);
export const getMyLeaveStats = (params) => api.get('/me/leave-stats', { params });
export const getEmployeeLeaveStats = (id, params) => api.get(`/users/${id}/leave-stats`, { params });
