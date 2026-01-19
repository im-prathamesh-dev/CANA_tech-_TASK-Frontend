import api from './api';

export const userService = {
  getAll: () => {
    return api.get('/users');
  },

  getById: (id) => {
    return api.get(`/users/${id}`);
  },

  update: (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  delete: (id) => {
    return api.delete(`/users/${id}`);
  },
};
