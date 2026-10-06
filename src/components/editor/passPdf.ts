/**
 * The downloadable e-pass: an A6 PDF that carries the same content as the
 * on-screen Ticket Summary, so there is one place to design it — the Ticket
 * Summary setup — and the PDF follows. Generated in the browser from data the
 * page already has; jsPDF and the QR encoder load only when a guest taps
 * "Download E-Pass".
 */

export interface PassPdfData {
  headline: string;
  guestName: string;
  venue: string;
  accessId: string;
  guestType: string;
  email: string;
  sessions: { label: string; sublabel?: string; description?: string }[];
  logoUrl?: string;
  campaignTitle?: string;
  pageUrl?: string;
  showQr: boolean;
  /** Editor preview: watermark it so a sample is never mistaken for a pass. */
  isSample?: boolean;
}

const PAGE_W = 105; // A6 portrait, mm
const PAGE_H = 148;
const MARGIN = 9;

async function loadImageAsDataUrl(url: string): Promise<{ dataUrl: string; ratio: number } | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const ratio = await new Promise<number>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth / Math.max(1, img.naturalHeight));
      img.onerror = () => resolve(3);
      img.src = dataUrl;
    });
    return { dataUrl, ratio };
  } catch {
    // A logo on another domain without CORS cannot be embedded; the pass still works without it.
    return null;
  }
}

function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase() || 'e-pass';
}

export async function buildPassPdf(data: PassPdfData) {
  const [{ jsPDF }, QRCode] = await Promise.all([import('jspdf'), import('qrcode')]);
  const doc = new jsPDF({ unit: 'mm', format: 'a6', orientation: 'portrait', compress: true });
  const contentW = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  // Logo, or the campaign title when there is no logo to embed.
  const logo = data.logoUrl && !data.logoUrl.startsWith('data:image/svg') ? await loadImageAsDataUrl(data.logoUrl) : null;
  if (logo && !logo.dataUrl.startsWith('data:image/svg')) {
    const h = 7;
    const w = Math.min(contentW * 0.6, h * logo.ratio);
    try {
      doc.addImage(logo.dataUrl, MARGIN, y, w, h);
      y += h + 5;
    } catch {
      /* unsupported image format — skip the logo */
    }
  } else if (data.campaignTitle) {
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(120);
    doc.text(data.campaignTitle.toUpperCase(), MARGIN, y + 3);
    y += 7;
  }

  // Headline (multi-line, as designed in the Ticket Summary).
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0);
  const headlineLines = doc.splitTextToSize(data.headline.toUpperCase(), contentW) as string[];
  doc.text(headlineLines, MARGIN, y + 4.2, { lineHeightFactor: 1.15 });
  y += headlineLines.length * 5.2 + 3.5;

  // QR of the Access ID — what the door scanner reads.
  if (data.showQr && data.accessId) {
    const qr = await QRCode.toDataURL(data.accessId, { margin: 0, width: 240, errorCorrectionLevel: 'M' });
    const size = 26;
    doc.setDrawColor(0).setLineWidth(0.2).roundedRect(MARGIN, y, size + 6, size + 6, 1.5, 1.5);
    doc.addImage(qr, 'PNG', MARGIN + 3, y + 3, size, size);
    y += size + 6 + 5;
  }

  // Pass fields, two columns.
  const field = (label: string, value: string, x: number, top: number, width: number, lower = false) => {
    doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(120);
    doc.text(label, x, top);
    doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(0);
    const lines = doc.splitTextToSize(lower ? value : value.toUpperCase(), width) as string[];
    doc.text(lines.slice(0, 2), x, top + 4);
    return 4 + Math.min(lines.length, 2) * 3.6;
  };
  const colW = (contentW - 6) / 2;
  const col2 = MARGIN + colW + 6;
  let rowH = Math.max(field('GUEST NAME', data.guestName || '—', MARGIN, y, colW), field('VENUE', data.venue || '—', col2, y, colW));
  y += rowH + 3;
  rowH = Math.max(field('ACCESS ID', data.accessId || '—', MARGIN, y, colW), field('GUEST TYPE', data.guestType || '—', col2, y, colW));
  y += rowH + 3;
  if (data.email) {
    y += field('EMAIL', data.email, MARGIN, y, contentW, true) + 3;
  }

  // Sessions the pass is valid for.
  if (data.sessions.length) {
    doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(0);
    doc.text('ACCESS VALID FOR:', MARGIN, y + 1);
    y += 3.5;
    for (const session of data.sessions.slice(0, 4)) {
      if (y + 8 > PAGE_H - 16) break; // keep clear of the footer
      doc.setDrawColor(212).setLineWidth(0.2).rect(MARGIN, y, contentW, 8);
      doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(0);
      doc.text(doc.splitTextToSize(session.label, contentW * 0.6)[0], MARGIN + 2.5, y + 5.2);
      if (session.sublabel) {
        doc.setFont('helvetica', 'normal').setTextColor(110);
        doc.text(session.sublabel, PAGE_W - MARGIN - 2.5, y + 5.2, { align: 'right' });
      }
      y += 9.5;
    }
  }

  // Footer.
  doc.setDrawColor(230).setLineWidth(0.2).line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
  doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(110);
  doc.text('Present this pass at the entrance. One pass admits one guest.', MARGIN, PAGE_H - 10);
  if (data.pageUrl) doc.text(data.pageUrl.replace(/^https?:\/\//, ''), MARGIN, PAGE_H - 6.5);

  if (data.isSample) {
    doc.setFont('helvetica', 'bold').setFontSize(40).setTextColor(235);
    doc.text('SAMPLE', PAGE_W / 2, PAGE_H / 2, { align: 'center', angle: 35 });
  }

  return doc;
}

export async function downloadPassPdf(data: PassPdfData): Promise<void> {
  const doc = await buildPassPdf(data);
  doc.save(`${safeFileName(`${data.campaignTitle || 'e-pass'}-${data.accessId || 'sample'}`)}.pdf`);
}
