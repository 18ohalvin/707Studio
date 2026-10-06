import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiFetch } from '../services/apiClient.ts';

describe('apiFetch keepalive', () => {
  let calls: RequestInit[] = [];

  beforeEach(() => {
    calls = [];
    (globalThis as any).localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      calls.push(init);
      return new Response('{}', { status: 200 });
    }));
  });

  it('keeps keepalive on small mutations so a save survives a tab close', async () => {
    await apiFetch('/api/pages', { method: 'POST', body: JSON.stringify({ id: 'p1' }) });
    expect(calls[0].keepalive).toBe(true);
  });

  it('drops keepalive for bodies over the browser 64 KB cap (image uploads, projects with pictures)', async () => {
    const bigImage = 'data:image/png;base64,' + 'A'.repeat(200 * 1024);
    await apiFetch('/api/media/upload', { method: 'POST', body: JSON.stringify({ dataUrl: bigImage }) });
    await apiFetch('/api/pages', { method: 'POST', body: JSON.stringify({ widget_tree: [{ imageUrl: bigImage }] }), keepalive: true });
    expect(calls[0].keepalive).toBe(false);
    expect(calls[1].keepalive).toBe(false);
  });
});
