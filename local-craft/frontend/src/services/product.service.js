import api from './api';

export const productService = {
  getAll: async (params) => {
    return await api.get('/products', { params });
  },

  getById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  create: async (data) => {
    return await api.post('/products', data);
  },

  update: async (id, data) => {
    return await api.put(`/products/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/products/${id}`);
  }
};
