import { createApp, h, nextTick } from 'vue';
import { getActivePinia } from 'pinia';
import type { ActivationPage } from '../../../types/editor.ts';
import { LIVE_PASS_KEY, type LivePassState } from '../livePass.ts';
import { TICKET_CONTEXT_KEY, TICKET_CANVAS, TICKET_PAPER, type TicketContext } from './ticketFields.ts';

/**
 * Turns the campaign's Ticket page into the guest's PDF.
 *
 * The page is rendered off screen by the same artboard the editor uses — with
 * this guest's data — then captured and placed on a sheet as tall as the
 * design (90 mm wide). What the
 * designer laid out is what the guest gets. The capture is an image, so text
 * in the PDF is not selectable; the QR is captured at 3× and stays scannable.
 */
export interface TicketPdfOptions {
  page: ActivationPage;
  context: TicketContext;
  /** The guest's issued pass on a live page; absent in the editor (sample data). */
  livePass?: LivePassState | null;
  fileName: string;
  isSample?: boolean;
}

async function waitForImages(root: HTMLElement, timeoutMs: number): Promise<void> {
  const start = Date.now();
  // The QR is produced asynchronously after mount; give it a moment to appear.
  await new Promise(resolve => setTimeout(resolve, 150));
  while (Date.now() - start < timeoutMs) {
    const images = Array.from(root.querySelectorAll('img'));
    if (images.every(img => img.complete)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function renderTicketPdf(opts: TicketPdfOptions): Promise<void> {
  const [{ default: MobileArtboard }, { default: html2canvas }, { jsPDF }] = await Promise.all([
    import('../MobileArtboard.vue'),
    import('html2canvas'),
    import('jspdf')
  ]);

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${TICKET_CANVAS.width}px;pointer-events:none;`;
  document.body.appendChild(host);

  const app = createApp({
    render: () => h(MobileArtboard, {
      page: opts.page,
      pageIndex: 0,
      isSelected: false,
      isPreviewModal: true,
      isLivePage: Boolean(opts.livePass)
    })
  });
  const pinia = getActivePinia();
  if (pinia) app.use(pinia);
  app.provide(TICKET_CONTEXT_KEY, opts.context);
  if (opts.livePass) app.provide(LIVE_PASS_KEY, opts.livePass);

  try {
    app.mount(host);
    await nextTick();
    await waitForImages(host, 5000);

    const frame = (host.querySelector('[data-artboard-frame]') as HTMLElement) || host;
    // The design decides the height; the sheet keeps its proportions.
    const heightPx = Math.max(1, Math.ceil(frame.scrollHeight));
    const canvas = await html2canvas(frame, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: TICKET_CANVAS.width,
      height: heightPx,
      windowHeight: heightPx
    });

    const paperW = TICKET_PAPER.width;
    const paperH = Math.round((paperW * heightPx / TICKET_CANVAS.width) * 10) / 10;
    const doc = new jsPDF({ unit: 'mm', format: [paperW, paperH], orientation: paperH >= paperW ? 'portrait' : 'landscape', compress: true });
    doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, paperW, paperH);
    if (opts.isSample) {
      doc.setFont('helvetica', 'bold').setFontSize(40).setTextColor(225);
      doc.text('SAMPLE', paperW / 2, paperH / 2, { align: 'center', angle: 35 });
    }
    doc.save(opts.fileName);
  } finally {
    app.unmount();
    host.remove();
  }
}
