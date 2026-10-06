import { createApp, h, nextTick } from 'vue';
import { getActivePinia } from 'pinia';
import type { ActivationPage } from '../../../types/editor.ts';
import { LIVE_PASS_KEY, type LivePassState } from '../livePass.ts';
import { TICKET_CONTEXT_KEY, TICKET_CANVAS, TICKET_PAPER, type TicketContext } from './ticketFields.ts';

/**
 * Turns the campaign's Ticket page into the guest's PDF.
 *
 * The page is rendered off screen by the same artboard the editor uses — with
 * this guest's data — then captured and placed on a 9:16 sheet. What the
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
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${TICKET_CANVAS.width}px;height:${TICKET_CANVAS.height}px;pointer-events:none;`;
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
    const canvas = await html2canvas(frame, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: TICKET_CANVAS.width,
      height: TICKET_CANVAS.height
    });

    const doc = new jsPDF({ unit: 'mm', format: [TICKET_PAPER.width, TICKET_PAPER.height], orientation: 'portrait', compress: true });
    doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, TICKET_PAPER.width, TICKET_PAPER.height);
    if (opts.isSample) {
      doc.setFont('helvetica', 'bold').setFontSize(40).setTextColor(225);
      doc.text('SAMPLE', TICKET_PAPER.width / 2, TICKET_PAPER.height / 2, { align: 'center', angle: 35 });
    }
    doc.save(opts.fileName);
  } finally {
    app.unmount();
    host.remove();
  }
}
