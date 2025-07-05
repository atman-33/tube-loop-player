import { Moon, Sun } from 'lucide-react';
import { Toggle } from '~/components/ui/toggle';
import { useThemeStore } from '~/stores/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Toggle
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="transition-all duration-300 transform hover:scale-105 cursor-pointer"
    >
      {theme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Toggle>
  );
}
