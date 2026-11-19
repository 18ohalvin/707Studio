import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type StudioTheme = 'light' | 'dark';

const STORAGE_KEY = 'the707_theme_v1';

function readStoredTheme(): StudioTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore storage failures
  }
  return 'light';
}

export function applyDocumentTheme(theme: StudioTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<StudioTheme>(readStoredTheme());
  const isDark = computed(() => theme.value === 'dark');

  function setTheme(next: StudioTheme, persist = true) {
    theme.value = next;
    applyDocumentTheme(next);
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    theme.value = readStoredTheme();
    applyDocumentTheme(theme.value);
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    initTheme
  };
});
