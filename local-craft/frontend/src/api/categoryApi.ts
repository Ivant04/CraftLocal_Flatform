import axiosClient from './axiosClient';

const categoryApi = {
  getAll: (params?: { type?: 'WORKSHOP' | 'PRODUCT' | 'BOTH' }) =>
    axiosClient.get('/categories', { params }),
};

export default categoryApi;

