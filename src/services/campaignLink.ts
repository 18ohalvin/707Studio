import { ref } from 'vue';

/**
 * The public link of a published campaign, and copying it.
 * Only live campaigns have a link worth sharing: a draft answers 404 to
 * everyone but its owner and the superadmin.
 */
export interface LinkableProject {
  brand_slug?: string;
  slug?: string;
  status?: string;
  live_version?: number;
}

export function isProjectLive(p?: LinkableProject | null): boolean {
  return Boolean(p) && (Number(p!.live_version || 0) > 0 || p!.status === 'approved' || p!.status === 'published');
}

export function campaignPath(brandSlug?: string, slug?: string): string {
  return `/${encodeURIComponent(String(brandSlug || '').toLowerCase())}/${encodeURIComponent(String(slug || ''))}`;
}

export function liveLinkFor(p: LinkableProject): string {
  return `${window.location.origin}${campaignPath(p.brand_slug, p.slug)}`;
}

/** Absolute URL from a path such as "/atmos/drop". */
export function absoluteLink(path: string): string {
  return `${window.location.origin}${path}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / non-secure contexts
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Which item was just copied, for a brief "Copied" state on its button. */
export function useCopiedFlag(durationMs = 1600) {
  const copiedKey = ref<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy(key: string, text: string): Promise<boolean> {
    const ok = await copyText(text);
    if (ok) {
      copiedKey.value = key;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => (copiedKey.value = null), durationMs);
    }
    return ok;
  }

  return { copiedKey, copy };
}
