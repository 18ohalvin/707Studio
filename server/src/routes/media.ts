import express, { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { resolveUploadDir } from '../uploads.js';
import { warmVariants, removeVariants } from '../imageVariants.js';
import { getClaims, isSuperAdminClaims, type SessionClaims } from '../auth.js';
import { pool, getDbStatus } from '../db.js';
import { readDataFile } from '../fileStorage.js';

export const mediaRouter = Router();

const rootUploadDir = resolveUploadDir();

if (!fs.existsSync(rootUploadDir)) {
  fs.mkdirSync(rootUploadDir, { recursive: true });
}

/**
 * The media list lives in a plain array, so without this it resets to the seed
 * items on every restart and previously uploaded images become orphaned files
 * nobody can see. Persist the index next to the files it describes.
 */
const mediaIndexPath = path.join(rootUploadDir, 'media-index.json');
let hydrated = false;

function ensureHydrated() {
  if (hydrated) return;
  hydrated = true;

  try {
    if (fs.existsSync(mediaIndexPath)) {
      const stored = JSON.parse(fs.readFileSync(mediaIndexPath, 'utf-8'));
      if (Array.isArray(stored)) {
        mediaAssets = stored;
      }
    }
  } catch (err) {
    console.warn('[Media] Could not read stored media index, keeping seed list:', err);
  }
}

function persistMedia() {
  try {
    fs.writeFileSync(mediaIndexPath, JSON.stringify(mediaAssets, null, 2));
  } catch (err) {
    console.warn('[Media] Could not persist media index:', err);
  }
}

export interface ServerMediaItem {
  id: string;
  title: string;
  category: 'Photos' | 'Logo' | 'Product Catalog' | 'Editorial Photos';
  url: string;
  filename?: string;
  createdAt: string;
  /** Brand whose team shares this asset. */
  brand_slug?: string;
  owner_id?: string;
  owner_email?: string;
}

// Loaded from media-index.json; no demo items — a new brand starts with an empty library.
let mediaAssets: ServerMediaItem[] = [];

const normalizeBrand = (v: string) => String(v || '').toLowerCase().replace(/_/g, '-').trim();

/**
 * Media belongs to a brand: its team shares it, other brands never see it.
 * Items from before ownership was recorded have no brand and are visible to
 * the superadmin only.
 */
function canSeeMedia(claims: SessionClaims, item: ServerMediaItem): boolean {
  if (isSuperAdminClaims(claims)) return true;
  if (item.owner_id && item.owner_id === claims.sub) return true;
  if (item.owner_email && claims.email && item.owner_email.toLowerCase() === claims.email.toLowerCase()) return true;
  const brand = normalizeBrand(item.brand_slug || '');
  if (!brand) return false;
  const brands = claims.brands.map(normalizeBrand);
  return brands.includes('all') || brands.includes(brand);
}

/** The brand a new upload belongs to: the one asked for, if this account works for it. */
function brandForUpload(claims: SessionClaims, requested: string): string {
  const wanted = normalizeBrand(requested);
  const brands = claims.brands.map(normalizeBrand).filter(b => b && b !== 'all');
  if (isSuperAdminClaims(claims) || claims.brands.map(normalizeBrand).includes('all')) return wanted || brands[0] || '';
  if (wanted && brands.includes(wanted)) return wanted;
  return brands[0] || '';
}

// 1. GET /api/media - Get all media assets
mediaRouter.get('/', (req: Request, res: Response) => {
  ensureHydrated();
  const claims = getClaims(res);
  res.json({
    success: true,
    data: mediaAssets.filter(item => canSeeMedia(claims, item))
  });
});

// 2. POST /api/media/upload - Store an uploaded/dropped image on the server.
// The editor sends the file itself (Content-Type: image/*, details in the
// query string). The older JSON body with a base64 dataUrl is still accepted;
// it is a third larger on the wire, which matters for photoshoot-size files.
const IMAGE_EXT: Record<string, string> = {
  'image/jpeg': 'jpeg', 'image/jpg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp',
  'image/avif': 'avif', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/heic': 'heic', 'image/heif': 'heif'
};

mediaRouter.post('/upload', express.raw({ type: 'image/*', limit: '200mb' }), (req: Request, res: Response) => {
  ensureHydrated();
  try {
    const isBinary = Buffer.isBuffer(req.body);
    const meta = isBinary ? req.query : (req.body || {});
    const title = meta.title ? String(meta.title) : undefined;
    const category = meta.category ? String(meta.category) : undefined;
    const filename = meta.filename ? String(meta.filename) : undefined;
    const claims = getClaims(res);
    const brandSlug = brandForUpload(claims, String(meta.brand_slug || ''));

    let fileUrl: string;
    let savedFilename: string | undefined;
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (isBinary) {
      const ext = IMAGE_EXT[String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase()];
      if (!ext || !(req.body as Buffer).length) {
        return res.status(400).json({ success: false, message: 'Unsupported or empty image.' });
      }
      savedFilename = `upload_${uniqueId}.${ext}`;
      fs.writeFileSync(path.join(rootUploadDir, savedFilename), req.body as Buffer);
      fileUrl = `/uploads/${savedFilename}`;
    } else {
      const { dataUrl } = req.body || {};
      if (!dataUrl) {
        return res.status(400).json({ success: false, message: 'dataUrl is required' });
      }
      fileUrl = dataUrl;
      // If it is a base64 data URL, save it to the uploads directory
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
        const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'svg+xml' ? 'svg' : matches[1];
          savedFilename = `upload_${uniqueId}.${ext}`;
          fs.writeFileSync(path.join(rootUploadDir, savedFilename), Buffer.from(matches[2], 'base64'));
          fileUrl = `/uploads/${savedFilename}`;
        }
      }
    }

    // Make the sizes a page loads first, so the first visitor gets them instantly.
    if (savedFilename) warmVariants(rootUploadDir, savedFilename);

    const newItem: ServerMediaItem = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title || filename?.replace(/\.[^/.]+$/, '') || `Campaign Asset ${mediaAssets.length + 1}`,
      category: (category || (title?.toLowerCase().includes('logo') ? 'Logo' : 'Photos')) as ServerMediaItem['category'],
      url: fileUrl,
      filename: savedFilename,
      createdAt: new Date().toISOString(),
      brand_slug: brandSlug,
      owner_id: claims.sub,
      owner_email: claims.email
    };

    // Prepend to top of assets list
    mediaAssets.unshift(newItem);
    persistMedia();

    return res.status(201).json({
      success: true,
      message: 'Media uploaded and stored on server successfully',
      data: newItem
    });
  } catch (error: any) {
    console.error('[Media Upload Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to save media' });
  }
});

/* ---------- Removal ---------- */

/**
 * Whether any project — the working copy or its live version — still shows
 * this upload. Such a file is kept when its library entry is removed, so a
 * campaign never loses its banner because someone tidied the library.
 */
async function isUploadInUse(filename: string): Promise<boolean> {
  if (!filename) return false;
  if (getDbStatus().isConnected) {
    try {
      const r = await pool.query(
        `SELECT 1 FROM pages
          WHERE widget_tree::text LIKE $1 OR pages::text LIKE $1 OR page_settings::text LIKE $1
             OR COALESCE(live_snapshot::text, '') LIKE $1
          LIMIT 1`,
        [`%${filename}%`]
      );
      return r.rows.length > 0;
    } catch (err: any) {
      // When unsure, keep the file: a stray file costs disk, a missing one breaks a campaign.
      console.warn('[Media] Could not check whether an upload is in use:', err.message);
      return true;
    }
  }
  return JSON.stringify(readDataFile<any[]>('pages.json', [])).includes(filename);
}

function deleteFile(filename: string) {
  const filePath = path.join(rootUploadDir, filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    removeVariants(rootUploadDir, filename);
  } catch (err) {
    console.warn('[Media] Could not delete file:', err);
  }
}

/**
 * Removes library entries. Files go too, except those a project still uses
 * (unless force: the superadmin's "delete everything").
 */
async function removeMedia(items: ServerMediaItem[], force = false) {
  const ids = new Set(items.map(i => i.id));
  mediaAssets = mediaAssets.filter(m => !ids.has(m.id));
  persistMedia();

  const keptInUse: string[] = [];
  for (const item of items) {
    if (!item.filename) continue;
    // Another library entry pointing at the same file keeps it alive.
    if (mediaAssets.some(m => m.filename === item.filename)) continue;
    if (!force && await isUploadInUse(item.filename)) {
      keptInUse.push(item.id);
      continue;
    }
    deleteFile(item.filename);
  }
  return { removed: [...ids], keptInUse };
}

// GET /api/media/usage - Which of this account's assets are used in a project
mediaRouter.get('/usage', async (_req: Request, res: Response) => {
  ensureHydrated();
  const claims = getClaims(res);
  const inUse: string[] = [];
  for (const item of mediaAssets.filter(m => canSeeMedia(claims, m))) {
    if (item.filename && await isUploadInUse(item.filename)) inUse.push(item.id);
  }
  res.json({ success: true, data: inUse });
});

// POST /api/media/bulk-delete - Remove several assets at once ({ ids })
mediaRouter.post('/bulk-delete', async (req: Request, res: Response) => {
  ensureHydrated();
  const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
  if (!ids.length) return res.status(400).json({ success: false, message: 'ids must be a non-empty array.' });
  const claims = getClaims(res);
  const items = mediaAssets.filter(m => ids.includes(m.id) && canSeeMedia(claims, m));
  const result = await removeMedia(items);
  return res.json({ success: true, ...result });
});

// POST /api/media/purge - Superadmin: empty the whole library, files included,
// even those campaigns still show (they lose those images).
mediaRouter.post('/purge', async (_req: Request, res: Response) => {
  ensureHydrated();
  if (!isSuperAdminClaims(getClaims(res))) {
    return res.status(403).json({ success: false, message: 'Only the superadmin can empty the media library.' });
  }
  const items = [...mediaAssets];
  const result = await removeMedia(items, true);
  return res.json({ success: true, removed: result.removed.length });
});

// 3. DELETE /api/media/:id - Remove one asset (file kept if a project uses it)
mediaRouter.delete('/:id', async (req: Request, res: Response) => {
  ensureHydrated();
  const { id } = req.params;
  const item = mediaAssets.find(m => m.id === id);

  // Another brand's asset is reported as missing, not as forbidden.
  if (!item || !canSeeMedia(getClaims(res), item)) {
    return res.status(404).json({ success: false, message: 'Media asset not found' });
  }

  const result = await removeMedia([item]);
  return res.json({
    success: true,
    message: 'Media asset deleted successfully',
    data: item,
    fileKept: result.keptInUse.length > 0
  });
});
