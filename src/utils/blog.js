import { randomBytes } from 'crypto';

// Categorías válidas — fuente única de verdad
export const VALID_CATEGORIES = ['moda', 'tecnologia', 'sostenibilitat', 'tutorials', 'noticies'];

export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + randomBytes(4).toString('hex'); // 8 hex chars = 4.3 billones combinaciones
}

export function calculateReadingTime(content) {
  if (!content) return 0;
  
  const plainText = content.replace(/<[^>]*>?/gm, '');
  const words = plainText.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  
  return Math.ceil(words / wordsPerMinute);
}
