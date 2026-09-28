import api from './api';

export const workshopService = {
  getAll: async (params) => {
    return await api.get('/workshops', { params });
  },

  getById: async (id) => {
    return await api.get(`/workshops/${id}`);
  },

  create: async (data) => {
    return await api.post('/workshops', data);
  },

  update: async (id, data) => {
    return await api.put(`/workshops/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/workshops/${id}`);
  }
};
