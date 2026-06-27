/**
 * Image Provider Abstraction Layer
 * 
 * Central module for image URL resolution with provider-agnostic API.
 * Supports multiple providers (local, Cloudinary) with automatic selection
 * based on environment configuration.
 * 
 * Usage:
 *   import { buildImageUrl, getImageSrcSet, getImagePlaceholder } from '@/lib/imageProvider';
 *   
 *   const url = buildImageUrl('/images/dishes/rogan-josh.jpg', { width: 800 });
 *   const srcset = getImageSrcSet('/images/dishes/rogan-josh.jpg');
 *   const placeholder = getImagePlaceholder('/images/dishes/rogan-josh.jpg');
 * 
 * Provider Selection (via env):
 *   - Default: local (no config needed)
 *   - Cloudinary: Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   - Future: Add provider, register in getProvider()
 */

import { localProvider } from './providers/local';
import { cloudinaryProvider, isCloudinaryConfigured } from './providers/cloudinary';

/**
 * Available providers registry
 * Add new providers here and in getProvider()
 */
const PROVIDERS = {
  local: localProvider,
  cloudinary: cloudinaryProvider,
};

/**
 * Current active provider name
 * @type {string}
 */
let activeProviderName = 'local';

/**
 * Initialize provider based on environment
 * Called once at module load
 */
function initializeProvider() {
  if (typeof window === 'undefined') {
    // Server-side: check env
    if (isCloudinaryConfigured()) {
      activeProviderName = 'cloudinary';
    }
  } else {
    // Client-side: check if Cloudinary was enabled at build time
    // This is set via NEXT_PUBLIC_* env vars at build
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      activeProviderName = 'cloudinary';
    }
  }
}

/**
 * Get the active provider instance
 * @returns {Object} Provider implementation
 */
export function getProvider() {
  return PROVIDERS[activeProviderName] || PROVIDERS.local;
}

/**
 * Get provider by name
 * @param {string} name - Provider name
 * @returns {Object|null} Provider or null if not found
 */
export function getProviderByName(name) {
  return PROVIDERS[name] || null;
}

/**
 * Set active provider (for testing or runtime switching)
 * @param {string} name - Provider name
 * @returns {boolean} Success
 */
export function setProvider(name) {
  if (PROVIDERS[name]) {
    activeProviderName = name;
    return true;
  }
  return false;
}

/**
 * Get active provider name
 * @returns {string}
 */
export function getActiveProviderName() {
  return activeProviderName;
}

/**
 * Build optimized image URL
 * @param {string} src - Source path (e.g., "/images/dishes/rogan-josh.jpg")
 * @param {Object} options - Transformation options
 * @param {number} [options.width] - Target width in pixels
 * @param {number} [options.height] - Target height in pixels
 * @param {string} [options.crop] - Crop mode (fill, limit, scale, etc.)
 * @param {string} [options.gravity] - Gravity for smart crop (auto, face, center, etc.)
 * @param {string} [options.format] - Output format (auto, avif, webp, jpg, png)
 * @param {string} [options.quality] - Quality (auto, 1-100)
 * @param {number} [options.dpr] - Device pixel ratio
 * @returns {string} Optimized image URL
 */
export function buildImageUrl(src, options = {}) {
  if (!src) return '';
  
  const provider = getProvider();
  return provider.buildUrl(src, options);
}

/**
 * Generate responsive srcset
 * @param {string} src - Source path
 * @param {number[]} [widths] - Width breakpoints (provider-specific defaults if omitted)
 * @param {Object} [baseOptions] - Base transformation options
 * @returns {string} srcset string (empty if not supported)
 */
export function getImageSrcSet(src, widths, baseOptions = {}) {
  if (!src) return '';
  
  const provider = getProvider();
  if (!provider.getSrcSet) return '';
  
  return provider.getSrcSet(src, widths, baseOptions);
}

/**
 * Get low-quality placeholder URL
 * @param {string} src - Source path
 * @returns {string} Placeholder URL or empty string
 */
export function getImagePlaceholder(src) {
  if (!src) return '';
  
  const provider = getProvider();
  if (!provider.getPlaceholder) return '';
  
  return provider.getPlaceholder(src);
}

/**
 * Check if current provider supports a feature
 * @param {string} feature - Feature name (transformations, smartCrop, formatSelection, responsiveWidths, globalCdn)
 * @returns {boolean}
 */
export function supportsFeature(feature) {
  const provider = getProvider();
  return !!provider[`supports${feature.charAt(0).toUpperCase() + feature.slice(1)}`];
}

/**
 * Get capabilities for all registered providers
 * @returns {Object} Capability flags keyed by provider name
 */
export function getProviderCapabilities() {
  const result = {};
  for (const [name, provider] of Object.entries(PROVIDERS)) {
    result[name] = {
      name: provider.name,
      supportsTransformations: provider.supportsTransformations || false,
      supportsSmartCrop: provider.supportsSmartCrop || false,
      supportsFormatSelection: provider.supportsFormatSelection || false,
      supportsResponsiveWidths: provider.supportsResponsiveWidths || false,
      supportsGlobalCdn: provider.supportsGlobalCdn || false,
    };
  }
  return result;
}

/**
 * List all registered providers
 * @returns {string[]} Provider names
 */
export function listProviders() {
  return Object.keys(PROVIDERS);
}

/**
 * Register a new provider (for extensibility)
 * @param {string} name - Provider name
 * @param {Object} provider - Provider implementation
 * @returns {boolean} Success
 */
export function registerProvider(name, provider) {
  if (PROVIDERS[name]) {
    console.warn(`Provider "${name}" already registered, overwriting`);
  }
  
  // Validate required methods
  const requiredMethods = ['buildUrl', 'name'];
  for (const method of requiredMethods) {
    if (typeof provider[method] !== 'function' && method !== 'name') {
      throw new Error(`Provider "${name}" missing required method: ${method}`);
    }
  }
  
  PROVIDERS[name] = provider;
  return true;
}

// Initialize on module load
initializeProvider();

/**
 * Export default provider functions for convenience
 */
export const imageProvider = {
  buildUrl: buildImageUrl,
  getSrcSet: getImageSrcSet,
  getPlaceholder: getImagePlaceholder,
  getActiveProvider: getActiveProviderName,
  setProvider,
  getCapabilities: getProviderCapabilities,
  listProviders,
  registerProvider,
};

export default imageProvider;