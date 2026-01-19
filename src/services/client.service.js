import api from './api';

export const clientService = {
  getAll: () => {
    return api.get('/clients');
  },

  getById: (id) => {
    return api.get(`/clients/${id}`);
  },

  create: (clientData) => {
    return api.post('/clients', clientData);
  },

  update: (id, clientData) => {
    return api.put(`/clients/${id}`, clientData);
  },

  delete: (id) => {
    return api.delete(`/clients/${id}`);
  },
};
