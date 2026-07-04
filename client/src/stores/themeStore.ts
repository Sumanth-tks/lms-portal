import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('lms-theme') as Theme) || 'system';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  return resolved;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initial = getStoredTheme();

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const state = useThemeStore.getState();
      if (state.theme === 'system') {
        const resolved = applyTheme('system');
        set({ resolvedTheme: resolved });
      }
    });
  }

  return {
    theme: initial,
    resolvedTheme: typeof window !== 'undefined' ? applyTheme(initial) : 'light',
    setTheme: (theme: Theme) => {
      localStorage.setItem('lms-theme', theme);
      const resolved = applyTheme(theme);
      set({ theme, resolvedTheme: resolved });
    },
  };
});
