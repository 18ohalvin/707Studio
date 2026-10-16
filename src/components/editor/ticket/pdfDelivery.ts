/**
 * Hands a finished PDF to the guest's browser.
 *
 * jsPDF's save() clicks a hidden `download` link. iPhone Safari ignores that
 * (and refuses anything started after the long wait of making the PDF, since
 * the tap is no longer "fresh"), so the guest got nothing. On iOS the PDF is
 * instead opened in a tab, where Safari's own viewer offers Share / Save to
 * Files. That tab has to be opened inside the tap itself, before the PDF
 * exists — hence the two steps.
 */
export function isIosBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
}

/** Call synchronously inside the tap handler. Returns null where it is not needed. */
export function openPendingPdfWindow(): Window | null {
  if (!isIosBrowser()) return null;
  try {
    const win = window.open('', '_blank');
    if (win) {
      win.document.title = 'Your ticket';
      win.document.body.style.cssText = 'margin:0;font:16px -apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#555';
      win.document.body.textContent = 'Preparing your ticket…';
    }
    return win;
  } catch {
    return null;
  }
}

export function closePendingPdfWindow(win?: Window | null) {
  try { win?.close(); } catch { /* already gone */ }
}

/** Saves the PDF (desktop, Android) or opens it for Share / Save to Files (iOS). */
export function deliverPdf(blob: Blob, fileName: string, pendingWindow?: Window | null): void {
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  if (isIosBrowser()) {
    if (pendingWindow && !pendingWindow.closed) pendingWindow.location.href = url;
    else window.location.href = url; // popup was blocked: open it in this tab instead
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
}
