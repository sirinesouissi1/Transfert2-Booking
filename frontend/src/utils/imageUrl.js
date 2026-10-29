const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const getImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('data:image/')) return path;
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return `${API}${path.startsWith('/') ? '' : '/'}${path}`;
};