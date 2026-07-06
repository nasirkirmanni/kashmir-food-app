/**
 * Image Utilities - Provider-agnostic image URL resolution
 * 
 * This module provides a unified API for image URL resolution that works with
 * multiple providers (local, Cloudinary) without changing component code.
 * 
 * Provider is selected via environment variables:
 * - Default: local (serves from /public/images/)
 * - Cloudinary: Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 * 
 * Backward compatible with existing resolveImageUrl() usage.
 */

import { 
  buildImageUrl, 
  getImageSrcSet as providerGetSrcSet, 
  getImagePlaceholder as providerGetPlaceholder, 
  getActiveProviderName,
  getProviderCapabilities 
} from './imageProvider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/+$/, '')
  || 'https://api.wazwanway.com';

/**
 * Check if a string is an absolute URL
 * @param {string} src 
 * @returns {boolean}
 */
function isAbsoluteUrl(src) {
  return src && (src.startsWith('http://') || src.startsWith('https://'));
}

/**
 * Resolve an image URL using the active provider
 * 
 * This is the main entry point - replaces the old resolveImageUrl()
 * with provider-aware optimization.
 * 
 * @param {string} src - Source path (e.g., "/images/dishes/rogan-josh.jpg")
 * @param {string} fallback - Fallback image path
 * @param {Object} options - Provider transformation options
 * @returns {string} Resolved image URL
 */
export function resolveImageUrl(src, fallback = '/wazwan-hero.jpg', options = {}) {
  if (!src) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[imageUtils] Missing image field in data response. Falling back to default image.', { fallback });
    }
    return fallback;
  }
  
  // Already absolute URL (external CDN, Cloudinary, etc.) - pass through
  if (isAbsoluteUrl(src)) {
    // If it's a Cloudinary URL and we have transformation options, apply them
    if (src.includes('res.cloudinary.com') && Object.keys(options).length > 0) {
      return buildImageUrl(src, options);
    }
    return src;
  }
  
  // Local/relative path - use provider to build optimized URL
  return buildImageUrl(src, options);
}

/**
 * Generate responsive srcset for an image
 * 
 * @param {string} src - Source path
 * @param {number[]} widths - Width breakpoints (defaults to provider-specific)
 * @param {Object} options - Base transformation options
 * @returns {string} srcset attribute value
 */
export function getImageSrcSet(src, widths, options = {}) {
  if (!src || isAbsoluteUrl(src)) return '';
  return providerGetSrcSet(src, widths, options);
}

/**
 * Get low-quality placeholder for an image
 * 
 * @param {string} src - Source path
 * @returns {string} Placeholder URL or empty string
 */
export function getImagePlaceholder(src) {
  if (!src || isAbsoluteUrl(src)) return '';
  return providerGetPlaceholder(src);
}

/**
 * Get the currently active provider name
 * 
 * @returns {string} Provider name ('local' or 'cloudinary')
 */
export function getActiveProvider() {
  return getActiveProviderName();
}

/**
 * Get capabilities of the active provider
 * 
 * @returns {Object} Capability flags
 */
export function getImageProviderCapabilities() {
  return getProviderCapabilities();
}

/**
 * Build a fully qualified backend URL for API resources
 * (Non-image resources, or when provider optimization not desired)
 * 
 * @param {string} path - Relative path
 * @returns {string} Absolute backend URL
 */
export function buildBackendUrl(path) {
  if (!path) return '';
  if (isAbsoluteUrl(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use resolveImageUrl() instead
 */
export const getImageUrl = resolveImageUrl;

/**
 * Environment info for debugging
 */
export function getImageEnvironmentInfo() {
  return {
    provider: getActiveProviderName(),
    capabilities: getProviderCapabilities(),
    apiBase: API_BASE,
    cloudinaryConfigured: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
}

export default {
  resolveImageUrl,
  getImageSrcSet,
  getImagePlaceholder,
  getActiveProvider,
  getImageProviderCapabilities,
  buildBackendUrl,
  getImageEnvironmentInfo,
};