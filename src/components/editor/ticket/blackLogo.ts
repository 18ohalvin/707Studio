/**
 * Solid-black version of a brand logo, as the Ticket Summary shows it.
 *
 * The summary gets there with the CSS filter `brightness(0)`, but the PDF is a
 * capture of the page and the capture ignores CSS filters — the logo came out
 * in its own colours. So the logo's pixels are made black directly.
 *
 * A transparent logo keeps its shape through its alpha channel. A logo saved
 * with an opaque background (a JPEG, say) would turn into a black box, so its
 * mark is told apart from the background by brightness instead: the corners
 * give the background, and whatever differs from it becomes the black mark.
 */

const MAX_SIDE = 1200;

/** In place: RGBA → black with the logo's shape as alpha. Pure, so it can be tested without a canvas. */
export function blackenPixels(data: Uint8ClampedArray, width: number, height: number): void {
  const pixels = width * height;
  let hasTransparency = false;
  for (let i = 0; i < pixels; i++) {
    if (data[i * 4 + 3] < 250) { hasTransparency = true; break; }
  }

  if (hasTransparency) {
    for (let i = 0; i < pixels; i++) {
      data[i * 4] = 0;
      data[i * 4 + 1] = 0;
      data[i * 4 + 2] = 0;
    }
    return;
  }

  const luminance = (i: number) => 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
  const corners = [0, width - 1, (height - 1) * width, height * width - 1];
  const backgroundIsLight = corners.reduce((sum, c) => sum + luminance(c), 0) / corners.length > 128;

  for (let i = 0; i < pixels; i++) {
    const lum = luminance(i);
    // Distance from the background brightness is how much "mark" the pixel is.
    data[i * 4 + 3] = Math.round(backgroundIsLight ? 255 - lum : lum);
    data[i * 4] = 0;
    data[i * 4 + 1] = 0;
    data[i * 4 + 2] = 0;
  }
}

const cache = new Map<string, Promise<string | null>>();

/**
 * Data URL of the black logo, or null when the browser will not let a canvas
 * read it (an image from another site without CORS). Callers then fall back
 * to the CSS filter, which still works on screen.
 */
export function blackenLogo(url: string): Promise<string | null> {
  if (!url || typeof document === 'undefined') return Promise.resolve(null);
  let job = cache.get(url);
  if (!job) {
    job = new Promise<string | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight, 1));
          const width = Math.max(1, Math.round(img.naturalWidth * scale));
          const height = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, width, height);
          const frame = ctx.getImageData(0, 0, width, height); // throws on a tainted canvas
          blackenPixels(frame.data, width, height);
          ctx.putImageData(frame, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
    cache.set(url, job);
  }
  return job;
}
