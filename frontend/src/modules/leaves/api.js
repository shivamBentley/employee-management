import api from '../../shared/utils/axios';

export const getLeaves = () => api.get('/leaves');
export const applyLeave = (data) => api.post('/leaves', data);
export const approveLeave = (id) => api.put(`/leaves/${id}/approve`);
export const rejectLeave = (id) => api.put(`/leaves/${id}/reject`);
export const cancelLeave = (id) => api.delete(`/leaves/${id}`);
