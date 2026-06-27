/**
 * @file Image Provider Unit Tests
 * @description Tests for the image provider abstraction layer
 * Run with: npm test -- lib/imageProvider.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables
const originalEnv = process.env;

// Test utilities
const mockEnv = (env) => {
  process.env = { ...originalEnv, ...env };
};

const resetEnv = () => {
  process.env = originalEnv;
};

// Import after mocking env
let localProvider, cloudinaryProvider, imageProvider;

describe('Image Provider Abstraction Layer', () => {
  beforeEach(async () => {
    resetEnv();
    vi.resetModules();
    
    // Import fresh modules
    const localModule = await import('../lib/providers/local.js');
    const cloudinaryModule = await import('../lib/providers/cloudinary.js');
    const providerModule = await import('../lib/imageProvider.js');
    
    localProvider = localModule.default;
    cloudinaryProvider = cloudinaryModule.default;
    imageProvider = providerModule;
  });

  describe('Local Provider', () => {
    it('should return absolute URLs as-is', () => {
      const url = 'https://cdn.example.com/image.jpg';
      expect(localProvider.buildUrl(url)).toBe(url);
    });

    it('should prepend base path for relative URLs', async () => {
      mockEnv({ NEXT_PUBLIC_LOCAL_IMAGE_BASE: 'https://assets.example.com' });
      vi.resetModules();
      
      const freshLocal = (await import('../lib/providers/local.js')).default;
      expect(freshLocal.buildUrl('/images/dishes/test.jpg'))
        .toBe('https://assets.example.com/images/dishes/test.jpg');
    });

    it('should prepend images/ to relative paths without it', async () => {
      mockEnv({ NEXT_PUBLIC_LOCAL_IMAGE_BASE: '' });
      vi.resetModules();
      
      const freshLocal = (await import('../lib/providers/local.js')).default;
      expect(freshLocal.buildUrl('dishes/test.jpg'))
        .toBe('/images/dishes/test.jpg');
    });

    it('should not add duplicate images/ prefix', async () => {
      mockEnv({ NEXT_PUBLIC_LOCAL_IMAGE_BASE: '' });
      vi.resetModules();
      
      const freshLocal = (await import('../lib/providers/local.js')).default;
      expect(freshLocal.buildUrl('images/dishes/test.jpg'))
        .toBe('/images/dishes/test.jpg');
    });

    it('should report no transformation support', () => {
      expect(localProvider.supportsTransformations).toBe(false);
      expect(localProvider.supportsSmartCrop).toBe(false);
      expect(localProvider.supportsFormatSelection).toBe(false);
    });

    it('should return empty srcset and placeholder', () => {
      expect(localProvider.getSrcSet('/images/test.jpg')).toBe('');
      expect(localProvider.getPlaceholder('/images/test.jpg')).toBe('');
    });

    it('should have correct metadata', () => {
      expect(localProvider.name).toBe('local');
    });
  });

  describe('Cloudinary Provider', () => {
    const TEST_CLOUD_NAME = 'test-cloud';

    beforeEach(async () => {
      mockEnv({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: TEST_CLOUD_NAME });
      vi.resetModules();
      const freshCloudinary = await import('../lib/providers/cloudinary.js');
      cloudinaryProvider = freshCloudinary.default;
    });

    it('should be configured when cloud name is set', async () => {
      vi.resetModules();
      const freshCloudinary = (await import('../lib/providers/cloudinary.js')).default;
      expect(freshCloudinary.isConfigured()).toBe(true);
    });

    it('should return absolute URLs as-is', () => {
      const url = 'https://cdn.example.com/image.jpg';
      expect(cloudinaryProvider.buildUrl(url)).toBe(url);
    });

    it('should build Cloudinary URL for local paths', async () => {
      vi.resetModules();
      const freshCloudinary = (await import('../lib/providers/cloudinary.js')).default;
      
      const url = freshCloudinary.buildUrl('/images/dishes/rogan-josh.jpg');
      expect(url).toContain(`res.cloudinary.com/${TEST_CLOUD_NAME}`);
      expect(url).toContain('wazwan-way/dishes/rogan-josh');
      expect(url).toContain('f_auto,q_auto');
    });

    it('should apply width transformation', () => {
      const url = cloudinaryProvider.buildUrl('/images/dishes/test.jpg', { width: 800 });
      expect(url).toContain('w_800');
      expect(url).toContain('c_limit');
    });

    it('should apply height transformation', () => {
      const url = cloudinaryProvider.buildUrl('/images/dishes/test.jpg', { height: 600 });
      expect(url).toContain('h_600');
      expect(url).toContain('c_limit');
    });

    it('should apply smart crop (g_auto)', () => {
      const url = cloudinaryProvider.buildUrl('/images/dishes/test.jpg', { 
        width: 800, 
        gravity: 'auto' 
      });
      expect(url).toContain('g_auto');
    });

    it('should apply custom crop mode', () => {
      const url = cloudinaryProvider.buildUrl('/images/dishes/test.jpg', { 
        crop: 'fill',
        gravity: 'center'
      });
      expect(url).toContain('c_fill');
      expect(url).toContain('g_center');
    });

    it('should apply custom format', () => {
      const url = cloudinaryProvider.buildUrl('/images/dishes/test.jpg', { 
        format: 'webp' 
      });
      expect(url).toContain('f_webp');
    });

    it('should apply custom quality', () => {
      const url = cloudinaryProvider.buildUrl('/images/dishes/test.jpg', { 
        quality: 90 
      });
      expect(url).toContain('q_90');
    });

    it('should generate responsive srcset', () => {
      const srcset = cloudinaryProvider.getSrcSet('/images/dishes/test.jpg', [400, 800, 1200]);
      expect(srcset).toContain('w_400');
      expect(srcset).toContain('w_800');
      expect(srcset).toContain('w_1200');
      expect(srcset).toContain('400w');
      expect(srcset).toContain('800w');
      expect(srcset).toContain('1200w');
    });

    it('should return empty srcset for absolute URLs', () => {
      const srcset = cloudinaryProvider.getSrcSet('https://cdn.example.com/image.jpg');
      expect(srcset).toBe('');
    });

    it('should generate placeholder URL', () => {
      const placeholder = cloudinaryProvider.getPlaceholder('/images/dishes/test.jpg');
      expect(placeholder).toContain('w_20');
      expect(placeholder).toContain('q_10');
      expect(placeholder).toContain('fl_blur:200');
    });

    it('should report full transformation support', () => {
      expect(cloudinaryProvider.supportsTransformations).toBe(true);
      expect(cloudinaryProvider.supportsSmartCrop).toBe(true);
      expect(cloudinaryProvider.supportsFormatSelection).toBe(true);
      expect(cloudinaryProvider.supportsResponsiveWidths).toBe(true);
      expect(cloudinaryProvider.supportsGlobalCdn).toBe(true);
    });

    it('should have correct metadata', () => {
      expect(cloudinaryProvider.name).toBe('cloudinary');
    });
  });

  describe('Provider Registry', () => {
    beforeEach(() => {
      resetEnv();
    });

    it('should return local provider by default', async () => {
      vi.resetModules();
      const provider = (await import('../lib/imageProvider.js')).getProvider();
      expect(provider.name).toBe('local');
    });

    it('should return cloudinary provider when configured', async () => {
      // Re-initialize with cloudinary config
      mockEnv({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud' });
      vi.resetModules();
      const provider = (await import('../lib/imageProvider.js')).getProvider();
      expect(provider.name).toBe('cloudinary');
    });

    it('should allow manual provider switching', async () => {
      const imageProviderModule = await import('../lib/imageProvider.js');
      
      expect(imageProviderModule.setProvider('local')).toBe(true);
      expect(imageProviderModule.getActiveProviderName()).toBe('local');
      expect(imageProviderModule.getProvider().name).toBe('local');
      
      expect(imageProviderModule.setProvider('cloudinary')).toBe(true);
      expect(imageProviderModule.getActiveProviderName()).toBe('cloudinary');
      expect(imageProviderModule.getProvider().name).toBe('cloudinary');
      
      expect(imageProviderModule.setProvider('nonexistent')).toBe(false);
    });

    it('should return provider by name', async () => {
      const imageProviderModule = await import('../lib/imageProvider.js');
      
      expect(imageProviderModule.getProviderByName('local').name).toBe('local');
      expect(imageProviderModule.getProviderByName('cloudinary').name).toBe('cloudinary');
      expect(imageProviderModule.getProviderByName('nonexistent')).toBeNull();
    });

    it('should return provider capabilities', async () => {
      const caps = (await import('../lib/imageProvider.js')).getProviderCapabilities();
      
      expect(caps.local).toBeDefined();
      expect(caps.cloudinary).toBeDefined();
      expect(caps.local.supportsTransformations).toBe(false);
      expect(caps.cloudinary.supportsTransformations).toBe(true);
    });
  });

  describe('Image Utils Integration', () => {
    beforeEach(() => {
      resetEnv();
      vi.resetModules();
    });

    it('should resolve local URLs correctly', async () => {
      const { resolveImageUrl } = await import('../lib/imageUtils.js');
      
      expect(resolveImageUrl('')).toBe('/wazwan-hero.jpg');
      expect(resolveImageUrl(null)).toBe('/wazwan-hero.jpg');
      expect(resolveImageUrl('https://external.com/img.jpg')).toBe('https://external.com/img.jpg');
      expect(resolveImageUrl('/images/dishes/test.jpg')).toContain('/images/dishes/test.jpg');
    });

    it('should pass transformation options to provider', async () => {
      mockEnv({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud' });
      vi.resetModules();
      
      const { resolveImageUrl } = await import('../lib/imageUtils.js');
      const url = resolveImageUrl('/images/dishes/test.jpg', '/fallback.jpg', { width: 800 });
      
      expect(url).toContain('w_800');
    });

    it('should generate srcset for non-absolute URLs', async () => {
      mockEnv({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud' });
      vi.resetModules();
      
      const { getImageSrcSet } = await import('../lib/imageUtils.js');
      const srcset = getImageSrcSet('/images/dishes/test.jpg', [400, 800]);
      
      expect(srcset).toContain('w_400');
      expect(srcset).toContain('w_800');
    });

    it('should return empty srcset for absolute URLs', async () => {
      const { getImageSrcSet } = await import('../lib/imageUtils.js');
      const srcset = getImageSrcSet('https://cdn.example.com/img.jpg');
      expect(srcset).toBe('');
    });

    it('should generate placeholder for non-absolute URLs', async () => {
      mockEnv({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud' });
      vi.resetModules();
      
      const { getImagePlaceholder } = await import('../lib/imageUtils.js');
      const placeholder = getImagePlaceholder('/images/dishes/test.jpg');
      
      expect(placeholder).toContain('w_20');
    });

    it('should return empty placeholder for absolute URLs', async () => {
      const { getImagePlaceholder } = await import('../lib/imageUtils.js');
      const placeholder = getImagePlaceholder('https://cdn.example.com/img.jpg');
      expect(placeholder).toBe('');
    });

    it('should report active provider name', async () => {
      const { getActiveProvider } = await import('../lib/imageUtils.js');
      expect(typeof getActiveProvider()).toBe('string');
    });

    it('should report provider capabilities', async () => {
      const { getImageProviderCapabilities } = await import('../lib/imageUtils.js');
      const caps = getImageProviderCapabilities();
      
      expect(caps.local).toBeDefined();
      expect(caps.cloudinary).toBeDefined();
    });
  });
});

describe('Provider Extensibility', () => {
  it('should document how to add a new provider', () => {
    // This test serves as documentation for future providers
    const newProviderTemplate = {
      name: 'newprovider',
      buildUrl: (src, options) => `https://newprovider.com/${src}`,
      getSrcSet: (src, widths, options) => '',
      getPlaceholder: (src) => '',
      supportsTransformations: true,
      supportsSmartCrop: false,
      supportsFormatSelection: true,
      supportsResponsiveWidths: true,
      supportsGlobalCdn: true,
    };
    
    expect(newProviderTemplate.name).toBe('newprovider');
    expect(typeof newProviderTemplate.buildUrl).toBe('function');
    expect(typeof newProviderTemplate.getSrcSet).toBe('function');
    expect(typeof newProviderTemplate.getPlaceholder).toBe('function');
  });
});