import { describe, it, expect } from 'vitest';
import { responsiveImgAttrs, sizedUrl, placeholderUrl, isOptimisable } from '../services/responsiveImage.ts';

describe('responsive images for uploads', () => {
  it('serves screen-sized versions of uploads', () => {
    const attrs = responsiveImgAttrs('/uploads/upload_1_abc.jpeg', { priority: true });
    expect(attrs.src).toBe('/uploads/upload_1_abc.jpeg?w=1080');
    expect(attrs.srcset).toContain('/uploads/upload_1_abc.jpeg?w=640 640w');
    expect(attrs.srcset).toContain('/uploads/upload_1_abc.jpeg?w=2400 2400w');
    expect(attrs.sizes).toContain('440px');
    expect(attrs.loading).toBe('eager');
    expect(attrs.fetchpriority).toBe('high');
    expect(placeholderUrl('/uploads/upload_1_abc.jpeg')).toBe('/uploads/upload_1_abc.jpeg?w=32');
  });

  it('lazy-loads images below the first banner', () => {
    expect(responsiveImgAttrs('/uploads/a.png').loading).toBe('lazy');
  });

  it('leaves everything that is not an upload untouched', () => {
    const external = 'https://images.unsplash.com/photo-1?w=800';
    expect(sizedUrl(external, 320)).toBe(external);
    expect(responsiveImgAttrs(external).src).toBe(external);
    expect(responsiveImgAttrs(external).srcset).toBeUndefined();
    expect(isOptimisable('data:image/png;base64,AAAA')).toBe(false);
    expect(isOptimisable('/uploads/logo.svg')).toBe(false);
    expect(isOptimisable('/uploads/../etc/passwd.jpg')).toBe(false);
    expect(sizedUrl(undefined, 320)).toBe('');
  });
});
