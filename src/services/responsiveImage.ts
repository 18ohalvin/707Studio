/**
 * Responsive images for uploads.
 *
 * The server returns /uploads/<file>?w=<width> as a resized AVIF/WebP of the
 * original (see server/src/imageVariants.ts). These helpers build the
 * src / srcset / sizes so the browser downloads the version that fits the
 * screen — around 150–300 KB instead of a multi-MB photoshoot original —
 * with a tiny blurred preview showing while it loads. Anything that is not
 * an upload (external URLs, data: URLs, bundled assets) passes through as is.
 */

const WIDTHS = [640, 1080, 1600, 2400];
const OPTIMISABLE = /^\/uploads\/[A-Za-z0-9._-]+\.(jpe?g|png|webp|avif|tiff?|heic|heif)$/i;

/** Same-origin upload path (absolute URLs to this site are reduced to their path). */
function uploadPath(url?: string | null): string | null {
  if (!url) return null;
  let path = url;
  if (/^https?:\/\//i.test(url) && typeof window !== 'undefined') {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== window.location.origin) return null;
      path = parsed.pathname;
    } catch {
      return null;
    }
  }
  return OPTIMISABLE.test(path) ? path : null;
}

export function isOptimisable(url?: string | null): boolean {
  return uploadPath(url) !== null;
}

/** One fixed width (e.g. a logo, a thumbnail, or the ticket capture). */
export function sizedUrl(url: string | undefined | null, width: number): string {
  const path = uploadPath(url);
  return path ? `${path}?w=${width}` : (url || '');
}

/** ~1 KB blurred stand-in shown while the real image loads. */
export function placeholderUrl(url?: string | null): string | null {
  const path = uploadPath(url);
  return path ? `${path}?w=32` : null;
}

export interface ResponsiveImageOptions {
  /** CSS width the image is shown at, for the browser to pick a file. */
  sizes?: string;
  /** Above the fold (e.g. the first banner): fetched first, not lazily. */
  priority?: boolean;
}

/** Attributes for an <img>: src, srcset, sizes, loading, fetchpriority, decoding. */
export function responsiveImgAttrs(url: string | undefined | null, opts: ResponsiveImageOptions = {}): Record<string, string> {
  const path = uploadPath(url);
  const loading = opts.priority ? 'eager' : 'lazy';
  const fetchpriority = opts.priority ? 'high' : 'auto';
  if (!path) return { src: url || '', loading, decoding: 'async', fetchpriority };
  return {
    src: `${path}?w=1080`,
    srcset: WIDTHS.map(w => `${path}?w=${w} ${w}w`).join(', '),
    // Campaign pages are at most 440 CSS px wide.
    sizes: opts.sizes || '(max-width: 440px) 100vw, 440px',
    loading,
    decoding: 'async',
    fetchpriority
  };
}

/** Inline style that puts the blurred placeholder behind an image until it has loaded. */
export function placeholderStyle(url?: string | null): Record<string, string> {
  const preview = placeholderUrl(url);
  if (!preview) return {};
  return {
    backgroundImage: `url('${preview}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
}
