import { apiFetch } from './apiClient.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';

export interface MediaItem {
  id: string;
  title: string;
  category: 'Photos' | 'Logo' | 'Product Catalog' | 'Editorial Photos';
  url: string;
}

export const INITIAL_CAMPAIGN_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    title: 'atmos x ASICS Gel Kayano 14 Hero',
    category: 'Photos',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm2',
    title: 'Pandan Green Side Profile',
    category: 'Product Catalog',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm3',
    title: '707 Official Monogram Logo',
    category: 'Logo',
    url: FIGMA_ASSETS.logo707
  },
  {
    id: 'm4',
    title: 'Urban Streetwear Lifestyle',
    category: 'Editorial Photos',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm5',
    title: 'Sole & Gel Cushioning Detail',
    category: 'Product Catalog',
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm6',
    title: 'Lookbook Editorial Studio',
    category: 'Editorial Photos',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm7',
    title: 'Sneaker Packaging Box Set',
    category: 'Product Catalog',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm8',
    title: 'Night Street Editorial',
    category: 'Photos',
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80'
  }
];

export async function fetchServerMedia(): Promise<MediaItem[]> {
  try {
    const res = await apiFetch('/api/media');
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[Media Service] Server fetch failed, using local campaign media fallback:', err);
  }
  return INITIAL_CAMPAIGN_MEDIA;
}

export async function uploadMediaDirectly(params: {
  dataUrl: string;
  title?: string;
  category?: 'Photos' | 'Logo' | 'Product Catalog' | 'Editorial Photos';
  filename?: string;
}): Promise<MediaItem> {
  try {
    const res = await apiFetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[Media Service] Server upload failed, using in-memory dataUrl fallback:', err);
  }

  // Fallback if offline
  return {
    id: `local_${Date.now()}`,
    title: params.title || params.filename || 'Uploaded Asset',
    category: params.category || (params.title?.toLowerCase().includes('logo') ? 'Logo' : 'Photos'),
    url: params.dataUrl
  };
}

export async function deleteServerMedia(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/media/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[Media Service] Server delete failed:', err);
    return false;
  }
}
