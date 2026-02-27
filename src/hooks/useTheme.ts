import { useState, useEffect, useRef, useCallback } from 'react';
import type { Theme } from '../types';
import { saveTheme, loadTheme } from '../utils/localStorage';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return loadTheme() ?? 'light';
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
      return 'light';
    }
  });
  const hasMounted = useRef(false);

  // Apply theme to document and persist changes (skip initial save)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    try {
      saveTheme(theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
