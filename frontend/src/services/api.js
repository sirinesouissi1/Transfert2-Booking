import axios from 'axios';

// URL absolue vers le backend.
// En prod : https://go-taxi-api.onrender.com/api
// En dev  : http://localhost:5002/api (via .env.development)
// On peut override via la variable d'env VITE_API_URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://go-taxi-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // NE PAS définir 'Content-Type' ici :
  // axios choisit automatiquement application/json ou multipart/form-data
});

// Attacher automatiquement le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumina_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']; // le navigateur met multipart + boundary
  }
  return config;
});

// Gérer les erreurs 401 globalement
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isLoginRequest =
      url.includes('/auth/login') || url.includes('/auth/admin/login');

    // On ne redirige pas si c'est un simple échec de connexion :
    // le formulaire affiche déjà le toast d'erreur
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('lumina_token');
      localStorage.removeItem('lumina_user');
      const isAdminPage = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPage ? '/admin/login' : '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Authentification ─────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  adminLogin:     (data) => api.post('/auth/admin/login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateMe:       (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Excursions (réservations d'excursions) ───────────────────────────────────
export const excursionBookingAPI = {
  getAll:       ()         => api.get('/excursion-bookings'),
  getOne:       (id)       => api.get(`/excursion-bookings/${id}`),
  create:       (data)     => api.post('/excursion-bookings', data),
  updateStatus: (id, data) => api.put(`/excursion-bookings/${id}/status`, data),
};

// ─── Excursions (catalogue) ───────────────────────────────────────────────────
export const excursionAPI = {
  getAll: (params)   => api.get('/excursions', { params }),
  getOne: (id)       => api.get(`/excursions/${id}`),
  create: (data)     => api.post('/excursions', data),
  update: (id, data) => api.put(`/excursions/${id}`, data),
  delete: (id)       => api.delete(`/excursions/${id}`),
  remove: (id)       => api.delete(`/excursions/${id}`),
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
  getAll: ()   => api.get('/vehicles'),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (payload)     => api.post('/vehicles', payload),
  update: (id, payload) => api.put(`/vehicles/${id}`, payload),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ─── Réservations (transferts et excursions) ──────────────────────────────────
export const bookingAPI = {
  create:       (data)     => api.post('/bookings', data),
  getMy:        ()         => api.get('/bookings'),
  getOne:       (id)       => api.get(`/bookings/${id}`),
  cancel:       (id)       => api.put(`/bookings/${id}/cancel`),
  getAll:       (params)   => api.get('/bookings', { params }),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
};

// ─── Avis ─────────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getForExcursion: (id)   => api.get(`/reviews/excursion/${id}`),
  create:          (data) => api.post('/reviews', data),
  approve:         (id)   => api.put(`/reviews/${id}/approve`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/users'),
};


export const contactAPI = {
  send: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  markRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};
export default api;