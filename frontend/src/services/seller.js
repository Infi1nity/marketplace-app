import api from './api';

export const sellerApi = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProducts: (params) => api.get('/seller/products', { params }),
  createProduct: (data) => api.post('/seller/products', data),
  updateProduct: (id, data) => api.put(`/seller/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
  getOrders: (params) => api.get('/seller/orders', { params }),
  updateProfile: (data) => api.put('/seller/profile', data),
  uploadImage: (formData) => api.post('/seller/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};