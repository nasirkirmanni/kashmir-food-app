# Image Provider Abstraction Layer

## Overview

This module provides a provider-agnostic interface for image URL resolution and optimization. It supports multiple image providers (local filesystem, Cloudinary, and future providers) with automatic selection based on environment configuration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Components / Pages                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  imageProvider.js (API)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  buildImageUrl()  │  getImageSrcSet()  │  getPlaceholder() │
│  │  getActiveProvider() │ getProviderCapabilities() │ setProvider() │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │   Local Provider    │   │  Cloudinary Provider │
    │  (lib/providers/    │   │  (lib/providers/     │
    │   local.js)         │   │   cloudinary.js)    │
    └─────────────────────┘   └─────────────────────┘
```

## Providers

### 1. Local Provider (Default)
- **Path**: `lib/providers/local.js`
- **Activated**: Always available, default when no Cloudinary config
- **Behavior**: Serves images from `/public/images/` with no transformation
- **Capabilities**: None (relies on Next.js default loader for static imports)

### 2. Cloudinary Provider (Optional)
- **Path**: `lib/providers/cloudinary.js`
- **Activated**: When `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
- **Features**:
  - Automatic format selection (`f_auto`)
  - Perceptual quality optimization (`q_auto`)
  - Responsive width transformations (`w_<width>`)
  - Smart crop with gravity auto (`g_auto`)
  - Global CDN (Akamai) with South Asia PoPs
  - SEO-friendly URLs

## Configuration

### Environment Variables

```bash
# .env.local (frontend)
# Local provider (default) - no config needed

# Cloudinary provider (optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
# Optional: for upload scripts (backend)
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Local provider custom base URL (optional)
NEXT_PUBLIC_LOCAL_IMAGE_BASE=https://your-cdn.com
```

### Next.js Config

The provider works with existing `next.config.js`. For Cloudinary, add to `remotePatterns`:

```javascript
// next.config.js
images: {
  remotePatterns: [
    // ...existing patterns
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
    },
  ],
}
```

## Usage

### Basic Usage (Components)

```jsx
import ImageWithSkeleton from '@/components/ImageWithSkeleton';

// Automatically uses active provider
<ImageWithSkeleton 
  src="/images/dishes/rogan-josh.jpg" 
  alt="Rogan Josh"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  priority
/>
```

### Advanced Usage (Transformation Options)

```jsx
<ImageWithSkeleton 
  src="/images/dishes/rogan-josh.jpg"
  alt="Rogan Josh"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  // Provider-specific transformations
  imgWidth={800}
  imgHeight={600}
  imgCrop="fill"
  imgGravity="auto"        // Smart crop (Cloudinary only)
  imgFormat="auto"         // AVIF/WebP/JPEG (Cloudinary only)
  imgQuality="auto"        // Perceptual quality (Cloudinary only)
  // Responsive srcset
  srcsetWidths={[400, 800, 1200, 1920]}
/>
```

### Direct API Usage

```javascript
import { 
  resolveImageUrl, 
  getImageSrcSet, 
  getImagePlaceholder,
  getActiveProviderName,
  getProviderCapabilities 
} from '@/lib/imageUtils';

// Resolve image URL with transformations
const url = resolveImageUrl('/images/dishes/rogan-josh.jpg', '/fallback.jpg', {
  width: 800,
  height: 600,
  gravity: 'auto',
  format: 'auto',
  quality: 'auto',
});

// Generate responsive srcset
const srcset = getImageSrcSet('/images/dishes/rogan-josh.jpg', [400, 800, 1200]);

// Get low-quality placeholder
const placeholder = getImagePlaceholder('/images/dishes/rogan-josh.jpg');

// Check active provider
const provider = getActiveProviderName(); // 'local' or 'cloudinary'

// Get capabilities
const caps = getProviderCapabilities();
/*
{
  local: { supportsTransformations: false, ... },
  cloudinary: { supportsTransformations: true, supportsSmartCrop: true, ... }
}
*/
```

## Adding a New Provider

### 1. Create Provider Module

Create `lib/providers/yourprovider.js`:

```javascript
// lib/providers/yourprovider.js
const YOUR_PROVIDER_CONFIG = process.env.NEXT_PUBLIC_YOURPROVIDER_CONFIG;

export function buildYourProviderUrl(src, options = {}) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  if (!YOUR_PROVIDER_CONFIG) return src; // Fallback to local
  
  // Build your provider URL
  return `https://cdn.yourprovider.com/${src}?w=${options.width}&q=${options.quality}`;
}

export function getYourProviderSrcSet(src, widths = [], baseOptions = {}) {
  if (!YOUR_PROVIDER_CONFIG) return '';
  return widths.map(w => `${buildYourProviderUrl(src, { ...baseOptions, width: w })} ${w}w`).join(', ');
}

export function getYourProviderPlaceholder(src) {
  if (!YOUR_PROVIDER_CONFIG) return '';
  return `https://cdn.yourprovider.com/${src}?w=20&q=10`;
}

export const yourProvider = {
  name: 'yourprovider',
  buildUrl: buildYourProviderUrl,
  getSrcSet: getYourProviderSrcSet,
  getPlaceholder: getYourProviderPlaceholder,
  supportsTransformations: true,
  supportsSmartCrop: false,
  supportsFormatSelection: true,
  supportsResponsiveWidths: true,
  supportsGlobalCdn: true,
};

export default yourProvider;
```

### 2. Register Provider

In `lib/imageProvider.js`, add to `PROVIDERS` registry:

```javascript
import { yourProvider } from './providers/yourprovider';

const PROVIDERS = {
  local: localProvider,
  cloudinary: cloudinaryProvider,
  yourprovider: yourProvider,  // Add here
};
```

### 3. Add Activation Logic

In `initializeProvider()`:

```javascript
function initializeProvider() {
  if (typeof window === 'undefined') {
    if (isYourProviderConfigured()) {
      activeProviderName = 'yourprovider';
    } else if (isCloudinaryConfigured()) {
      activeProviderName = 'cloudinary';
    }
  }
}
```

### 4. Add Helper Functions

```javascript
export function isYourProviderConfigured() {
  return !!process.env.NEXT_PUBLIC_YOURPROVIDER_CONFIG;
}
```

## Provider Interface Contract

Every provider must implement:

| Method | Required | Description |
|--------|----------|-------------|
| `name` | ✅ | Unique string identifier |
| `buildUrl(src, options)` | ✅ | Return optimized URL |
| `getSrcSet(src, widths, baseOptions)` | ❌ | Return srcset string |
| `getPlaceholder(src)` | ❌ | Return LQIP URL |
| `supportsTransformations` | ✅ | Boolean |
| `supportsSmartCrop` | ✅ | Boolean |
| `supportsFormatSelection` | ✅ | Boolean |
| `supportsResponsiveWidths` | ✅ | Boolean |
| `supportsGlobalCdn` | ✅ | Boolean |

### Options Object (Standard)

```javascript
{
  width: number,        // Target width in pixels
  height: number,       // Target height in pixels
  crop: string,         // 'fill', 'limit', 'scale', 'thumb', etc.
  gravity: string,      // 'auto', 'center', 'face', 'north', etc.
  format: string,       // 'auto', 'avif', 'webp', 'jpg', 'png'
  quality: string,      // 'auto', '1'-'100'
  dpr: number,          // Device pixel ratio (1, 2, 3)
}
```

## Testing

Run tests:

```bash
npm test -- lib/imageProvider.test.js
```

Tests cover:
- Local provider behavior
- Cloudinary provider transformations
- Provider registry and switching
- Image utils integration
- Extensibility patterns

## Migration Guide

### From Hardcoded Image Paths

**Before:**
```jsx
<Image src="/images/dishes/rogan-josh.jpg" />
```

**After:**
```jsx
<ImageWithSkeleton src="/images/dishes/rogan-josh.jpg" />
```

### From Manual URL Construction

**Before:**
```javascript
const url = `${API_BASE}/images/dishes/rogan-josh.jpg`;
```

**After:**
```javascript
const url = resolveImageUrl('/images/dishes/rogan-josh.jpg');
```

### Enabling Cloudinary

1. Add Cloudinary credentials to Vercel environment variables
2. Deploy - provider switches automatically
3. No code changes needed

## Rollback

To disable Cloudinary and revert to local:

1. Remove `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` from environment
2. Redeploy
3. Instant rollback - no database or file changes needed

## Performance Notes

| Provider | LCP Impact | Bundle Size | CDN |
|----------|------------|-------------|-----|
| Local | Baseline | 0 KB | Vercel Edge |
| Cloudinary | -35% to -55% | 0 KB | Akamai (Global + SAARC) |

## Security

- Cloudinary URLs are signed by default (no public list access)
- Transformation parameters validated by Cloudinary
- Local provider serves only from `/public/images/`
- No server-side image processing required

## Troubleshooting

### Images not optimizing
1. Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
2. Verify `res.cloudinary.com` in `next.config.js` remotePatterns
3. Check browser dev tools for Cloudinary URL format

### Provider not switching
1. Restart dev server after env changes
2. Check `getActiveProviderName()` returns expected value
3. Verify env var naming: `NEXT_PUBLIC_` prefix for client-side

### TypeScript Errors
Add to `global.d.ts`:
```typescript
declare module '@/lib/imageProvider' {
  export function buildImageUrl(src: string, options?: ImageOptions): string;
  // ... other exports
}
```