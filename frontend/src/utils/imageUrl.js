// src/utils/imageUrl.js
const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5002';

const FALLBACK =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';

/**
 * Retourne une URL absolue pour une image.
 * - Si `path` est déjà une URL http(s), on la retourne telle quelle.
 * - Si `path` commence par "/uploads/...", on préfixe par API_URL.
 * - Sinon on renvoie le fallback.
 */
export function getImageUrl(path) {
  if (!path) return FALLBACK;
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${clean}`;
}