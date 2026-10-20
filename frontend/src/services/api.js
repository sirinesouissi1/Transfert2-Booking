import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attacher automatiquement le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumina_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gérer les erreurs 401 (non autorisé) globalement
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lumina_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Authentification ─────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateMe:       (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Excursions (réservations d'excursions) ───────────────────────────────────
// Dans api.js
export const excursionBookingAPI = {
  getAll: () => api.get('/excursion-bookings'),  // endpoint admin
  getOne: (id) => api.get(`/excursion-bookings/${id}`),
  create: (data) => api.post('/excursion-bookings', data),
  updateStatus: (id, data) => api.put(`/excursion-bookings/${id}/status`, data),
};

// ─── Excursions (catalogue) ───────────────────────────────────────────────────
export const excursionAPI = {
  getAll: (params) => api.get('/excursions', { params }),
  getOne: (id)     => api.get(`/excursions/${id}`),
  create: (data)   => api.post('/excursions', data),
  update: (id, data) => api.put(`/excursions/${id}`, data),
  delete: (id)     => api.delete(`/excursions/${id}`),  // alias remove
  remove: (id)     => api.delete(`/excursions/${id}`),  // pour compatibilité
};

// ─── Transfers (catalogue) ────────────────────────────────────────────────────
export const transferAPI = {
  getAll:  (params)   => api.get('/transfers', { params }),
  getOne:  (id)       => api.get(`/transfers/${id}`),
  create:  (data)     => api.post('/transfers', data),
  update:  (id, data) => api.put(`/transfers/${id}`, data),
  delete:  (id)       => api.delete(`/transfers/${id}`),
  remove:  (id)       => api.delete(`/transfers/${id}`),
};

// ─── Véhicules ────────────────────────────────────────────────────────────────
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getOne: (id) => api.get(`/vehicles/${id}`),

  // Accepte un FormData OU un objet simple
  create: (payload) => {
    const isFormData = payload instanceof FormData;
    return api.post('/vehicles', payload, {
      headers: isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
  },

  update: (id, payload) => {
    const isFormData = payload instanceof FormData;
    return api.put(`/vehicles/${id}`, payload, {
      headers: isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
  },

  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ─── Réservations (transferts et excursions) ──────────────────────────────────
export const bookingAPI = {
  create:       (data) => api.post('/bookings', data),
  getMy:        ()     => api.get('/bookings'),
  getOne:       (id)   => api.get(`/bookings/${id}`),
  cancel:       (id)   => api.put(`/bookings/${id}/cancel`),
  getAll:       (params) => api.get('/bookings', { params }),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
};

// ─── Avis ─────────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getForExcursion: (id)   => api.get(`/reviews/excursion/${id}`),
  create:          (data) => api.post('/reviews', data),
  approve:         (id)   => api.put(`/reviews/${id}/approve`),
};

// ─── Admin (statistiques, utilisateurs) ───────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/users'),
};

// Export par défaut pour utilisation directe si besoin
export default api;