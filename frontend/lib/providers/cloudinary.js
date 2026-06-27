/**
 * Cloudinary Image Provider
 * 
 * Optional provider that serves optimized images via Cloudinary CDN.
 * Activated when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set.
 * 
 * Features:
 * - Automatic format selection (f_auto)
 * - Perceptual quality optimization (q_auto)
 * - Responsive width transformations (w_<width>)
 * - Smart crop with gravity auto (g_auto)
 * - Global CDN with South Asia PoPs
 * - SEO-friendly URLs
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_BASE_URL = CLOUDINARY_CLOUD_NAME 
  ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : null;

/**
 * Default transformation options
 */
const DEFAULT_TRANSFORMS = {
  format: 'auto',      // f_auto - automatic format selection (AVIF, WebP, JPEG)
  quality: 'auto',     // q_auto - perceptual quality optimization
  // No default width - let caller specify or use responsive
};

/**
 * Build Cloudinary transformation string from options
 * @param {Object} options - Transformation options
 * @returns {string} Cloudinary transformation string (e.g., "f_auto,q_auto,w_800")
 */
function buildTransformString(options = {}) {
  const transforms = [];
  
  // Format selection
  if (options.format !== false) {
    transforms.push(`f_${options.format || DEFAULT_TRANSFORMS.format}`);
  }
  
  // Quality optimization
  if (options.quality !== false) {
    transforms.push(`q_${options.quality || DEFAULT_TRANSFORMS.quality}`);
  }
  
  // Width resize
  if (options.width) {
    transforms.push(`w_${options.width}`);
    // Add crop mode if width specified without height
    if (!options.height) {
      transforms.push('c_limit'); // Don't upscale
    }
  }
  
  // Height resize
  if (options.height) {
    transforms.push(`h_${options.height}`);
    if (!options.width) {
      transforms.push('c_limit');
    }
  }
  
  // Crop mode
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  }
  
  // Gravity (for smart crop)
  if (options.gravity) {
    transforms.push(`g_${options.gravity}`);
  }
  
  // Device pixel ratio
  if (options.dpr) {
    transforms.push(`dpr_${options.dpr}`);
  }
  
  return transforms.join(',');
}

/**
 * Extract the public ID from a local image path
 * Converts "/images/dishes/rogan-josh.jpg" → "wazwan-way/dishes/rogan-josh"
 * @param {string} src - Source path
 * @returns {string} Cloudinary public ID
 */
function extractPublicId(src) {
  if (!src) return '';
  
  // Remove leading slash and /images/ prefix
  let path = src.replace(/^\/+/, '');
  path = path.replace(/^images\//, '');
  
  // Remove file extension
  path = path.replace(/\.[^.]+$/, '');
  
  // Prefix with folder for organization
  return `wazwan-way/${path}`;
}

/**
 * Build a Cloudinary image URL
 * @param {string} src - Source path (e.g., "/images/dishes/rogan-josh.jpg")
 * @param {Object} options - Transformation options
 * @returns {string} Cloudinary URL or original src if not configured
 */
export function buildCloudinaryUrl(src, options = {}) {
  if (!src) return '';
  
  // Already absolute URL (external CDN, etc.) - pass through
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // If it's already a Cloudinary URL, optionally add transformations
    if (src.includes('res.cloudinary.com') && Object.keys(options).length > 0) {
      const transformStr = buildTransformString(options);
      if (transformStr) {
        // Insert transformations after /upload/
        return src.replace(/\/upload\//, `/upload/${transformStr}/`);
      }
    }
    return src;
  }
  
  // Cloudinary not configured - return original (will fallback to local)
  if (!CLOUDINARY_BASE_URL) {
    return src;
  }
  
  const publicId = extractPublicId(src);
  const transformStr = buildTransformString(options);
  
  // Build URL: https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<public_id>
  const url = `${CLOUDINARY_BASE_URL}/${transformStr ? `${transformStr}/` : ''}${publicId}`;
  
  return url;
}

/**
 * Generate responsive srcset for Cloudinary
 * @param {string} src - Source path
 * @param {number[]} widths - Width breakpoints (e.g., [400, 800, 1200, 1920])
 * @param {Object} baseOptions - Base transformation options
 * @returns {string} srcset string
 */
export function getCloudinarySrcSet(src, widths = [400, 800, 1200, 1920], baseOptions = {}) {
  if (!CLOUDINARY_BASE_URL || !src || src.startsWith('http')) {
    return '';
  }
  
  return widths
    .map(w => {
      const url = buildCloudinaryUrl(src, { ...baseOptions, width: w });
      return `${url} ${w}w`;
    })
    .join(', ');
}

/**
 * Generate low-quality placeholder (LQIP) for Cloudinary
 * @param {string} src - Source path
 * @returns {string} Base64 data URL or empty string
 */
export function getCloudinaryPlaceholder(src) {
  if (!CLOUDINARY_BASE_URL || !src || src.startsWith('http')) {
    return '';
  }
  
  const publicId = extractPublicId(src);
  // Tiny 20px wide, low quality, blurred placeholder
  const placeholderUrl = `${CLOUDINARY_BASE_URL}/w_20,q_10,f_auto,fl_blur:200/${publicId}`;
  
  // Return as data URL would require fetch - instead return URL for client-side fetch
  return placeholderUrl;
}

/**
 * Get Cloudinary delivery URL for a given public ID (for uploaded assets)
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Cloudinary URL
 */
export function getCloudinaryDeliveryUrl(publicId, options = {}) {
  if (!CLOUDINARY_BASE_URL) return '';
  
  const transformStr = buildTransformString(options);
  return `${CLOUDINARY_BASE_URL}/${transformStr ? `${transformStr}/` : ''}${publicId}`;
}

/**
 * Check if Cloudinary is configured
 * @returns {boolean}
 */
export function isCloudinaryConfigured() {
  return !!CLOUDINARY_CLOUD_NAME;
}

/**
 * Provider metadata
 */
export const cloudinaryProvider = {
  name: 'cloudinary',
  buildUrl: buildCloudinaryUrl,
  getSrcSet: getCloudinarySrcSet,
  getPlaceholder: getCloudinaryPlaceholder,
  getDeliveryUrl: getCloudinaryDeliveryUrl,
  isConfigured: isCloudinaryConfigured,
  supportsTransformations: true,
  supportsSmartCrop: true,
  supportsFormatSelection: true,
  supportsResponsiveWidths: true,
  supportsGlobalCdn: true,
};

export default cloudinaryProvider;