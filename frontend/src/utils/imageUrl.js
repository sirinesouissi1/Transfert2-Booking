const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  return `${API_BASE}/images/${image}`;
};