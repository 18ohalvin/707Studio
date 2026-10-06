import { ref, onUnmounted, type Ref } from 'vue';

/**
 * Fixed-position coordinates for a popover rendered in <body> (via Teleport),
 * placed under the element that opened it, right edges aligned.
 *
 * Why teleport at all: a backdrop-filter only blurs what lies inside its
 * nearest ancestor that also has a backdrop-filter (or filter / opacity /
 * will-change). The studio headers are frosted themselves, so a popover kept
 * inside one had nothing behind it to blur and looked fully transparent.
 */
export function useAnchoredPopover(anchor: Ref<HTMLElement | null>, gap = 10) {
  const style = ref<Record<string, string>>({});

  function place() {
    const el = anchor.value;
    if (!el) return;
    const r = el.getBoundingClientRect();
    style.value = {
      position: 'fixed',
      top: `${Math.round(r.bottom + gap)}px`,
      right: `${Math.max(8, Math.round(window.innerWidth - r.right))}px`
    };
  }

  function track(on: boolean) {
    if (on) {
      place();
      window.addEventListener('resize', place);
      window.addEventListener('scroll', place, true);
    } else {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    }
  }

  onUnmounted(() => track(false));
  return { style, place, track };
}
