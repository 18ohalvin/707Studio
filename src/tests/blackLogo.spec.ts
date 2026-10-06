import { describe, it, expect } from 'vitest';
import { blackenPixels } from '../components/editor/ticket/blackLogo.ts';

/** width × height RGBA image from [r,g,b,a] pixels. */
function image(pixels: number[][]): Uint8ClampedArray {
  return new Uint8ClampedArray(pixels.flat());
}
const px = (data: Uint8ClampedArray, i: number) => Array.from(data.slice(i * 4, i * 4 + 4));

describe('black brand logo for the ticket', () => {
  it('keeps the shape of a transparent logo and makes every colour black', () => {
    const data = image([[255, 0, 0, 255], [0, 200, 80, 128], [10, 10, 10, 0], [255, 255, 255, 255]]);
    blackenPixels(data, 2, 2);
    expect(px(data, 0)).toEqual([0, 0, 0, 255]); // opaque red → opaque black
    expect(px(data, 1)).toEqual([0, 0, 0, 128]); // half-transparent stays half-transparent
    expect(px(data, 2)).toEqual([0, 0, 0, 0]);   // transparent stays invisible
    expect(px(data, 3)).toEqual([0, 0, 0, 255]);
  });

  it('turns a dark mark on a white opaque background into a black mark, not a black box', () => {
    const white = [255, 255, 255, 255];
    const ink = [20, 20, 20, 255];
    const data = image([white, white, white, ink, white, white, white, white, white]);
    blackenPixels(data, 3, 3);
    expect(px(data, 0)[3]).toBe(0);            // background disappears
    expect(px(data, 3)[3]).toBeGreaterThan(220); // the mark stays solid
    expect(px(data, 3).slice(0, 3)).toEqual([0, 0, 0]);
  });

  it('treats a light mark on a dark opaque background as the mark', () => {
    const black = [0, 0, 0, 255];
    const light = [240, 240, 240, 255];
    const data = image([black, black, black, light, black, black, black, black, black]);
    blackenPixels(data, 3, 3);
    expect(px(data, 0)[3]).toBe(0);
    expect(px(data, 3)[3]).toBeGreaterThan(220);
  });
});
