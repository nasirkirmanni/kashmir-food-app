/**
 * Resolve image URLs to absolute paths.
 * 
 * Images from the API come as relative paths like "/images/dishes/rogan-josh.jpg".
 * These need to be resolved to the full backend URL so Next.js Image Optimization
 * can fetch, resize, convert (to WebP/AVIF), and cache them on Vercel's edge CDN.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/+$/, '')
  || 'https://kashmir-food-app-api.onrender.com';

/**
 * Convert a potentially relative image path to a full absolute URL.
 * - Already absolute URLs (https://...) are returned as-is.
 * - Relative paths (/images/...) are prefixed with the API backend URL.
 * - Falsy values return the fallback image.
 */
export function resolveImageUrl(src, fallback = '/wazwan-hero.jpg') {
  if (!src) return fallback;
  
  // Already an absolute URL
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Local public folder image (e.g. /images/... or /wazwan-hero.jpg)
  return src;
}
