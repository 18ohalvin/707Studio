// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { withProbeFix } from '../components/editor/ticket/ticketPdf.ts';

/** The probe html2canvas adds to the page to find a font's baseline, as it builds it. */
function addProbe(): HTMLImageElement {
  const container = document.createElement('div');
  container.style.visibility = 'hidden';
  container.style.fontSize = '11px';
  container.style.whiteSpace = 'nowrap';
  const span = document.createElement('span');
  span.textContent = 'Hidden Text';
  const img = document.createElement('img');
  container.append(span, img);
  document.body.appendChild(container);
  return img;
}

describe('ticket PDF text position', () => {
  beforeEach(() => {
    document.head.innerHTML = '<style>img { display: block; vertical-align: middle; }</style>'; // Tailwind preflight
    document.body.innerHTML = '';
  });

  it('keeps html2canvas\'s baseline probe inline while capturing, despite Tailwind making every <img> a block', async () => {
    const probe = addProbe();
    expect(getComputedStyle(probe).display).toBe('block'); // the bug: the probe falls below the text

    await withProbeFix(async () => {
      expect(getComputedStyle(probe).display).toBe('inline');
      expect(getComputedStyle(probe).verticalAlign).toBe('baseline');
    });
  });

  it('leaves ordinary images alone', async () => {
    const photo = document.createElement('img');
    document.body.appendChild(photo);
    await withProbeFix(async () => {
      expect(getComputedStyle(photo).display).toBe('block');
    });
  });

  it('puts the page back as it found it, also when the capture fails', async () => {
    await expect(withProbeFix(async () => { throw new Error('capture failed'); })).rejects.toThrow('capture failed');
    expect(document.head.querySelector('style[data-html2canvas-probe-fix]')).toBeNull();
    const probe = addProbe();
    expect(getComputedStyle(probe).display).toBe('block');
  });
});
