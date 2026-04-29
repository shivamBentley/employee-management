import api from '../../shared/utils/axios';

export const getLeaveGroups = () => api.get('/leave-groups');
export const getLeaveGroup = (id) => api.get(`/leave-groups/${id}`);
export const createLeaveGroup = (data) => api.post('/leave-groups', data);
export const updateLeaveGroup = (id, data) => api.put(`/leave-groups/${id}`, data);
export const deleteLeaveGroup = (id) => api.delete(`/leave-groups/${id}`);
