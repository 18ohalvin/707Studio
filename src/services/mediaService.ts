import { apiFetch } from './apiClient.ts';

export interface MediaItem {
  id: string;
  title: string;
  category: 'Photos' | 'Logo' | 'Product Catalog' | 'Editorial Photos';
  url: string;
}

/**
 * This account's media library: the assets its brand team uploaded (the
 * superadmin sees every brand's). Empty is a real answer — there are no demo
 * pictures to fall back to.
 */
export async function fetchServerMedia(): Promise<MediaItem[]> {
  try {
    const res = await apiFetch('/api/media');
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) return data.data;
    }
  } catch (err) {
    console.warn('[Media Service] Could not load the media library:', err);
  }
  return [];
}

/** The brand an upload belongs to: the brand of the project being edited. */
async function currentBrandSlug(): Promise<string> {
  try {
    const { useEditorStore } = await import('../stores/editorStore.ts');
    const store = useEditorStore();
    const project = store.projects.find(p => p.id === store.currentProjectId);
    return project?.brand_slug || store.currentPage?.brand_slug || '';
  } catch {
    return '';
  }
}

export async function uploadMediaDirectly(params: {
  dataUrl: string;
  title?: string;
  category?: 'Photos' | 'Logo' | 'Product Catalog' | 'Editorial Photos';
  filename?: string;
}): Promise<MediaItem> {
  // Send the file's bytes, not base64 inside JSON: a photoshoot original is
  // a third smaller on the wire this way, which is most of an upload's time.
  // The server makes the screen-sized versions pages actually load.
  const brandSlug = await currentBrandSlug();
  const send = async (): Promise<Response | null> => {
    let blob: Blob | null = null;
    try {
      blob = params.dataUrl.startsWith('data:image/') ? await (await fetch(params.dataUrl)).blob() : null;
    } catch {
      blob = null;
    }
    if (blob && blob.type.startsWith('image/')) {
      const query = new URLSearchParams();
      if (params.title) query.set('title', params.title);
      if (params.category) query.set('category', params.category);
      if (params.filename) query.set('filename', params.filename);
      if (brandSlug) query.set('brand_slug', brandSlug);
      return apiFetch(`/api/media/upload?${query.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': blob.type },
        body: blob
      }).catch(() => null);
    }
    return apiFetch('/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, brand_slug: brandSlug })
    }).catch(() => null);
  };

  try {
    // Uploads are the longest request the app makes, so they are the most
    // exposed to the packet loss on this link. One retry turns most dropped
    // uploads into a short pause instead of a missing image.
    let res = await send();

    if (!res || (!res.ok && res.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      res = await send();
    }

    if (res && res.ok) {
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

/**
 * Removes several assets. Files a project still uses are kept on the server
 * (only the library entry goes), so campaigns never lose an image this way.
 */
export async function bulkDeleteServerMedia(ids: string[]): Promise<{ removed: string[]; keptInUse: string[] }> {
  const res = await apiFetch('/api/media/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
  return { removed: json.removed || [], keptInUse: json.keptInUse || [] };
}

/** Ids of this account's assets that some project currently shows. */
export async function fetchMediaUsage(): Promise<Set<string>> {
  try {
    const res = await apiFetch('/api/media/usage');
    const json = await res.json();
    return new Set(Array.isArray(json?.data) ? json.data : []);
  } catch {
    return new Set();
  }
}

/** Superadmin: empty the whole media library, files included. */
export async function purgeServerMedia(): Promise<number> {
  const res = await apiFetch('/api/media/purge', { method: 'POST' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
  return Number(json.removed || 0);
}
