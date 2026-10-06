import { reactive } from 'vue';

/**
 * In-app replacement for window.confirm / window.prompt. The browser's own
 * dialogs ignore the studio's look entirely; these render as the same Apple
 * glass modal as the rest of the editor (see GlassDialog.vue, mounted once in
 * App.vue).
 */
export interface GlassDialogRequest {
  kind: 'confirm' | 'prompt';
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for irreversible actions. */
  danger?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

interface ActiveDialog extends GlassDialogRequest {
  resolve: (value: boolean | string | null) => void;
}

export const glassDialogState = reactive<{ active: ActiveDialog | null }>({ active: null });

function open(request: GlassDialogRequest): Promise<boolean | string | null> {
  // Only one at a time: a second request cancels the first.
  glassDialogState.active?.resolve(request.kind === 'confirm' ? false : null);
  return new Promise(resolve => {
    glassDialogState.active = { ...request, resolve };
  });
}

export function glassConfirm(opts: Omit<GlassDialogRequest, 'kind'>): Promise<boolean> {
  return open({ ...opts, kind: 'confirm' }) as Promise<boolean>;
}

/** Resolves to the entered text, or null when cancelled. */
export function glassPrompt(opts: Omit<GlassDialogRequest, 'kind'>): Promise<string | null> {
  return open({ ...opts, kind: 'prompt' }) as Promise<string | null>;
}

export function settleGlassDialog(value: boolean | string | null) {
  const active = glassDialogState.active;
  glassDialogState.active = null;
  active?.resolve(value);
}
