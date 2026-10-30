import { ref, watch, onUnmounted, nextTick, type Ref } from 'vue';

export interface ModalPopoverOptions {
  matchWidth?: boolean;      // If true, menu width equals anchor trigger width
  align?: 'left' | 'right';  // Alignment relative to anchor ('left' or 'right')
  minWidth?: number;         // Minimum width in pixels
  width?: number;            // Fixed width in pixels (e.g. 240)
  gap?: number;              // Gap between anchor and menu in pixels (default 6)
  maxHeight?: number;        // Maximum height of menu in pixels (default 260)
}

/**
 * Universal popover positioning and outside-click engine for dropdowns/select menus
 * inside setup sidebars and modals.
 * 
 * Works together with `<Teleport to="body">` so menus escape the parent modal's
 * `overflow-y-auto` container, preventing them from being clipped or bleeding off the modal frame.
 * 
 * Automatically flips upward when nearing the bottom of the viewport, matches trigger widths,
 * tracks scrolling inside the modal, and manages outside clicks & escape key dismissals.
 */
export function useModalPopover(
  anchor: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  options?: ModalPopoverOptions
) {
  const menuRef = ref<HTMLElement | null>(null);
  const style = ref<Record<string, string>>({});
  const isUpward = ref(false);

  function place() {
    const el = anchor.value;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;

    const gap = options?.gap ?? 6;
    const maxH = options?.maxHeight ?? 260;
    const spaceBelow = window.innerHeight - r.bottom - gap - 16;
    const spaceAbove = r.top - gap - 16;

    // Auto-flip upward if bottom space is cramped and top space is larger
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    isUpward.value = openUp;

    const availableHeight = openUp ? Math.min(maxH, spaceAbove) : Math.min(maxH, spaceBelow);

    const s: Record<string, string> = {
      position: 'fixed',
      zIndex: '99999',
      maxHeight: `${Math.max(100, Math.round(availableHeight))}px`,
    };

    if (options?.width) {
      s.width = `${options.width}px`;
    } else if (options?.matchWidth) {
      s.width = `${Math.round(r.width)}px`;
    }

    if (options?.minWidth) {
      s.minWidth = `${options.minWidth}px`;
    }

    if (options?.align === 'right') {
      const right = Math.max(12, Math.round(window.innerWidth - r.right));
      s.right = `${right}px`;
    } else if (options?.matchWidth) {
      s.left = `${Math.round(r.left)}px`;
    } else {
      const w = options?.width || options?.minWidth || Math.round(r.width) || 240;
      const left = Math.max(12, Math.min(Math.round(r.left), window.innerWidth - w - 12));
      s.left = `${left}px`;
    }

    if (openUp) {
      s.bottom = `${Math.round(window.innerHeight - r.top + gap)}px`;
    } else {
      s.top = `${Math.round(r.bottom + gap)}px`;
    }

    style.value = s;
  }

  function onPointerDown(e: PointerEvent | MouseEvent) {
    if (!isOpen.value) return;
    const target = e.target as Node;
    if (!target) return;
    // Clicks on or inside the anchor trigger or inside the teleported menu do not close
    if (anchor.value?.contains(target)) return;
    if (menuRef.value?.contains(target)) return;
    isOpen.value = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
      isOpen.value = false;
    }
  }

  function attachListeners() {
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
  }

  function detachListeners() {
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('keydown', onKeyDown);
  }

  watch(
    isOpen,
    async (val) => {
      if (val) {
        await nextTick();
        place();
        attachListeners();
      } else {
        detachListeners();
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    detachListeners();
  });

  return {
    style,
    menuRef,
    isUpward,
    place,
    close: () => {
      isOpen.value = false;
    },
  };
}
