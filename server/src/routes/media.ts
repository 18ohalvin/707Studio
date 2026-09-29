import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { resolveUploadDir } from '../uploads.js';

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
}

// In-memory / persistent seed of media assets
let mediaAssets: ServerMediaItem[] = [
  {
    id: 'm1',
    title: 'atmos x ASICS Gel Kayano 14 Hero',
    category: 'Photos',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm2',
    title: 'Pandan Green Side Profile',
    category: 'Product Catalog',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm3',
    title: '707 Official Monogram Logo',
    category: 'Logo',
    url: '/assets/4167315cdf415e01405730dfafaea3aaf13ea2e9.png',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm4',
    title: 'Urban Streetwear Lifestyle',
    category: 'Editorial Photos',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm5',
    title: 'Sole & Gel Cushioning Detail',
    category: 'Product Catalog',
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm6',
    title: 'Lookbook Editorial Studio',
    category: 'Editorial Photos',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm7',
    title: 'Sneaker Packaging Box Set',
    category: 'Product Catalog',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm8',
    title: 'Night Street Editorial',
    category: 'Photos',
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  }
];

// 1. GET /api/media - Get all media assets
mediaRouter.get('/', (req: Request, res: Response) => {
  ensureHydrated();
  res.json({
    success: true,
    data: mediaAssets
  });
});

// 2. POST /api/media/upload - Store uploaded/dropped image to server directly
mediaRouter.post('/upload', (req: Request, res: Response) => {
  ensureHydrated();
  try {
    const { dataUrl, title, category, filename } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ success: false, message: 'dataUrl is required' });
    }

    let fileUrl = dataUrl;
    let savedFilename: string | undefined;

    // If it is a base64 data URL, save it to the public/uploads directory
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'svg+xml' ? 'svg' : matches[1];
        const base64Data = matches[2];
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        savedFilename = `upload_${uniqueId}.${ext}`;
        const filePath = path.join(rootUploadDir, savedFilename);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        fileUrl = `/uploads/${savedFilename}`;
      }
    }

    const newItem: ServerMediaItem = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title || filename?.replace(/\.[^/.]+$/, '') || `Campaign Asset ${mediaAssets.length + 1}`,
      category: category || (title?.toLowerCase().includes('logo') ? 'Logo' : 'Photos'),
      url: fileUrl,
      filename: savedFilename,
      createdAt: new Date().toISOString()
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

// 3. DELETE /api/media/:id - Remove media asset
mediaRouter.delete('/:id', (req: Request, res: Response) => {
  ensureHydrated();
  const { id } = req.params;
  const index = mediaAssets.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Media asset not found' });
  }

  const [removedItem] = mediaAssets.splice(index, 1);
  persistMedia();

  // If local file exists, remove it
  if (removedItem?.filename) {
    const filePath = path.join(rootUploadDir, removedItem.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete physical file:', err);
      }
    }
  }

  return res.json({
    success: true,
    message: 'Media asset deleted successfully',
    data: removedItem
  });
});
