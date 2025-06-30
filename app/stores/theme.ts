import { create } from 'zustand';
import { getCookie, setCookie } from '~/lib/cookie';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_COOKIE_NAME = 'theme';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light', // Default theme, will be overridden by cookie or system preference

  setTheme: (theme: Theme) => {
    set({ theme });
    setCookie(THEME_COOKIE_NAME, theme, 365); // Save theme preference for 365 days
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
}));

// Initialize theme from cookie or system preference
// This should be called once when the application loads
if (typeof window !== 'undefined') {
  const savedTheme = getCookie(THEME_COOKIE_NAME);
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;

  let initialTheme: Theme;
  if (savedTheme === 'light' || savedTheme === 'dark') {
    initialTheme = savedTheme;
  } else {
    initialTheme = systemPrefersDark ? 'dark' : 'light';
  }

  useThemeStore.getState().setTheme(initialTheme);
}
