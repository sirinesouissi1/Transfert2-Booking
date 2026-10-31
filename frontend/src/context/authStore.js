// src/context/authStore.js
import { create } from 'zustand';
import { authAPI } from '../services/api';

// ⏱️ Configuration du timeout — modifiez ici uniquement
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;     // 30 min d'inactivité
const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8h max, même actif

const readLS = (key, fallback = null) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('lumina_user') || 'null'),
  token: localStorage.getItem('lumina_token') || null,
  loading: false,
  error: null,

  // 🔐 Session
  lastActivityAt: readLS('lumina_last_activity', null),
  sessionStartedAt: readLS('lumina_session_start', null),
  sessionTimeoutMs: SESSION_TIMEOUT_MS,
  absoluteTimeoutMs: ABSOLUTE_TIMEOUT_MS,

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',

  _persistSession: (data) => {
    localStorage.setItem('lumina_token', data.token);
    localStorage.setItem('lumina_user', JSON.stringify(data.user));
    const now = Date.now();
    localStorage.setItem('lumina_last_activity', JSON.stringify(now));
    localStorage.setItem('lumina_session_start', JSON.stringify(now));
    set({
      user: data.user,
      token: data.token,
      lastActivityAt: now,
      sessionStartedAt: now,
      loading: false,
      error: null,
    });
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      get()._persistSession(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  adminLogin: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.adminLogin(credentials);
      get()._persistSession(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Identifiants admin incorrects';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      get()._persistSession(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur d'inscription";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');
    localStorage.removeItem('lumina_last_activity');
    localStorage.removeItem('lumina_session_start');
    set({
      user: null,
      token: null,
      lastActivityAt: null,
      sessionStartedAt: null,
    });
  },

  updateUser: (user) => {
    localStorage.setItem('lumina_user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),

  // ⏱️ Session helpers
  touchActivity: () => {
    if (!get().user) return;
    const now = Date.now();
    localStorage.setItem('lumina_last_activity', JSON.stringify(now));
    set({ lastActivityAt: now });
  },

  extendSession: () => {
    if (!get().user) return;
    const now = Date.now();
    localStorage.setItem('lumina_last_activity', JSON.stringify(now));
    set({ lastActivityAt: now });
  },

  isSessionExpired: () => {
    const { user, lastActivityAt, sessionStartedAt, sessionTimeoutMs, absoluteTimeoutMs } = get();
    if (!user || !get().token) return true;
    const now = Date.now();

    // Timeout absolu (8h max)
    if (sessionStartedAt && now - sessionStartedAt > absoluteTimeoutMs) return true;

    // Timeout d'inactivité (30 min)
    if (lastActivityAt && now - lastActivityAt > sessionTimeoutMs) return true;

    return false;
  },

  // Combien de ms restants avant expiration (pour l'avertissement)
  getRemainingMs: () => {
    const { lastActivityAt, sessionStartedAt, sessionTimeoutMs, absoluteTimeoutMs } = get();
    if (!lastActivityAt) return sessionTimeoutMs;
    const now = Date.now();
    const inactivityLeft = sessionTimeoutMs - (now - lastActivityAt);
    const absoluteLeft = sessionStartedAt
      ? absoluteTimeoutMs - (now - sessionStartedAt)
      : Infinity;
    return Math.max(0, Math.min(inactivityLeft, absoluteLeft));
  },
}));

export default useAuthStore;