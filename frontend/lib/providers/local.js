/**
 * Local Image Provider
 * 
 * Default provider that serves images from the local filesystem/public directory.
 * This is the fallback when no Cloudinary credentials are configured.
 * 
 * Images are served as-is from /public/images/... with no transformation.
 * Next.js handles optimization only for statically imported images.
 */

const LOCAL_IMAGE_BASE = process.env.NEXT_PUBLIC_LOCAL_IMAGE_BASE || '';

/**
 * Build a local image URL
 * @param {string} src - Source path (e.g., "/images/dishes/rogan-josh.jpg")
 * @param {Object} options - Transformation options (ignored for local)
 * @returns {string} Absolute or relative URL
 */
export function buildLocalUrl(src, options = {}) {
  if (!src) return '';
  
  // Already absolute URL (external CDN, etc.)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Already absolute path
  if (src.startsWith('/')) {
    return `${LOCAL_IMAGE_BASE}${src}`;
  }
  
  // Relative path - prepend /images/ if not already present
  const prefix = src.startsWith('images/') ? '' : 'images/';
  return `${LOCAL_IMAGE_BASE}/${prefix}${src}`;
}

/**
 * Get responsive srcset for local images
 * Next.js handles this automatically via the default loader
 * @param {string} src - Source path
 * @param {number[]} widths - Width breakpoints
 * @returns {string} srcset string (empty - let Next.js handle)
 */
export function getLocalSrcSet(src, widths = []) {
  // Let Next.js default loader handle srcset generation
  return '';
}

/**
 * Get placeholder blur data URL
 * Not available for dynamic local images without build-time import
 * @returns {string} Empty string
 */
export function getLocalPlaceholder(src) {
  return '';
}

/**
 * Provider metadata
 */
export const localProvider = {
  name: 'local',
  buildUrl: buildLocalUrl,
  getSrcSet: getLocalSrcSet,
  getPlaceholder: getLocalPlaceholder,
  supportsTransformations: false,
  supportsSmartCrop: false,
  supportsFormatSelection: false,
  supportsResponsiveWidths: false,
  supportsGlobalCdn: false,
};

export default localProvider;