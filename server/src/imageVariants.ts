import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import type { Request, Response, NextFunction } from 'express';

/**
 * Responsive versions of uploaded images.
 *
 * Brands upload production photoshoot files — several MB, thousands of pixels
 * wide — but a campaign page is at most 440 CSS px wide; even on a 3× phone
 * screen ~1320 px is indistinguishable from the original. So
 * GET /uploads/<file>?w=<width> returns that file resized (never enlarged)
 * and re-encoded as AVIF or WebP, whichever the browser accepts, cached on
 * disk after the first request. The original stays untouched at
 * /uploads/<file> for anyone who needs the full file.
 *
 * Variants are made on demand, so every image uploaded before this existed is
 * optimised too; the common widths are also made right after an upload so
 * the first visitor does not wait for them.
 */

/** Only these widths exist, so a request cannot make the server render arbitrary sizes. */
export const VARIANT_WIDTHS = [32, 320, 640, 1080, 1600, 2400] as const;
const WARM_WIDTHS = [32, 640, 1080, 1600];

const RASTER = /\.(jpe?g|png|webp|avif|tiff?|heic|heif)$/i;
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;
const YEAR = 'public, max-age=31536000, immutable';

type Format = 'avif' | 'webp' | 'jpeg';

const QUALITY: Record<Format, number> = { avif: 55, webp: 80, jpeg: 82 };
// The 32 px version is the blurred placeholder shown while the real image loads.
const PLACEHOLDER_QUALITY = 40;

function pickFormat(req: Request): Format {
  const forced = String(req.query.f || '');
  if (forced === 'avif' || forced === 'webp' || forced === 'jpeg') return forced;
  const accept = String(req.headers.accept || '');
  if (accept.includes('image/avif')) return 'avif';
  if (accept.includes('image/webp')) return 'webp';
  return 'jpeg';
}

function nearestWidth(requested: number): number {
  return VARIANT_WIDTHS.find(w => w >= requested) ?? VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
}

const inFlight = new Map<string, Promise<void>>();

// AVIF encoding of a large photo is CPU-heavy; two at a time keeps the API
// responsive while a page full of new images is being requested.
const MAX_PARALLEL = 2;
let running = 0;
const waiting: Array<() => void> = [];

async function withSlot<T>(work: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) await new Promise<void>(resolve => waiting.push(resolve));
  running++;
  try {
    return await work();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

async function renderVariant(source: string, target: string, width: number, format: Format): Promise<void> {
  const key = target;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const job = withSlot(async () => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    const quality = width <= 32 ? PLACEHOLDER_QUALITY : QUALITY[format];
    let pipeline = sharp(source, { failOn: 'none' })
      .rotate() // honour camera orientation before the EXIF is dropped
      .resize({ width, withoutEnlargement: true });
    pipeline = format === 'avif'
      ? pipeline.avif({ quality, effort: 4 })
      : format === 'webp'
        ? pipeline.webp({ quality, effort: 4 })
        : pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
    await pipeline.toFile(tmp);
    fs.renameSync(tmp, target); // atomic: a half-written file is never served
  }).finally(() => inFlight.delete(key));

  inFlight.set(key, job);
  return job;
}

function variantPath(uploadDir: string, file: string, width: number, format: Format): string {
  return path.join(uploadDir, '.variants', `${file}.w${width}.${format}`);
}

/** Express handler for /uploads/:file?w=… — falls through to the static original otherwise. */
export function imageVariantMiddleware(uploadDir: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const requested = Number(req.query.w);
    const file = decodeURIComponent(req.path.replace(/^\//, ''));
    if (!requested || !SAFE_NAME.test(file) || !RASTER.test(file)) return next();

    const source = path.join(uploadDir, file);
    if (!fs.existsSync(source)) return next();

    const width = nearestWidth(requested);
    const format = pickFormat(req);
    const target = variantPath(uploadDir, file, width, format);

    try {
      if (!fs.existsSync(target)) await renderVariant(source, target, width, format);
      res.setHeader('Cache-Control', YEAR);
      // Same URL, different bytes per browser: caches must key on Accept.
      res.setHeader('Vary', 'Accept');
      res.type(format === 'jpeg' ? 'image/jpeg' : `image/${format}`);
      return res.sendFile(target);
    } catch (err: any) {
      // A file sharp cannot read is still a file: serve the original.
      console.warn(`[Images] Could not make a ${width}px ${format} of ${file}:`, err?.message);
      return next();
    }
  };
}

/** Make the widths a page asks for first, in the background, right after an upload. */
export function warmVariants(uploadDir: string, file: string): void {
  if (!SAFE_NAME.test(file) || !RASTER.test(file)) return;
  const source = path.join(uploadDir, file);
  (async () => {
    for (const format of ['avif', 'webp'] as Format[]) {
      for (const width of WARM_WIDTHS) {
        const target = variantPath(uploadDir, file, width, format);
        if (!fs.existsSync(target)) await renderVariant(source, target, width, format);
      }
    }
  })().catch(err => console.warn(`[Images] Warm-up failed for ${file}:`, err?.message));
}

/** Remove every cached version of a deleted upload. */
export function removeVariants(uploadDir: string, file: string): void {
  const dir = path.join(uploadDir, '.variants');
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(`${file}.w`)) {
      try { fs.unlinkSync(path.join(dir, name)); } catch { /* already gone */ }
    }
  }
}
