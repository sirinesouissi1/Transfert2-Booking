import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user:    JSON.parse(localStorage.getItem('lumina_user') || 'null'),
  token:   localStorage.getItem('lumina_token') || null,
  loading: false,
  error:   null,

  isAuthenticated: () => !!get().token,
  isAdmin:         () => get().user?.role === 'admin',

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('lumina_token', data.token);
      localStorage.setItem('lumina_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('lumina_token', data.token);
      localStorage.setItem('lumina_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur d\'inscription';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');
    set({ user: null, token: null });
  },

  updateUser: (user) => {
    localStorage.setItem('lumina_user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
