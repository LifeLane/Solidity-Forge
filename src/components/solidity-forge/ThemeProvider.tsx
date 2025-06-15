
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system', // Default to system preference
  storageKey = 'solidity-forge-theme',
}: ThemeProviderProps) {
  const [theme, setThemeInternal] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      return storedTheme || defaultTheme;
    } catch (e) {
      console.error("Error reading theme from localStorage", e);
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
        // For SSR, if default is system, we might not know. Defaulting to 'dark' as the app was initially dark.
        // Or, we could avoid setting a class on SSR and let client handle it to prevent mismatch.
        // For now, assume dark if system is default during SSR.
        return defaultTheme === 'system' ? 'dark' : defaultTheme;
    }
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && stored !== 'system') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const applyTheme = useCallback((currentTheme: Theme) => {
    const root = window.document.documentElement;
    let newResolvedTheme: 'light' | 'dark';

    if (currentTheme === 'system') {
      newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      newResolvedTheme = currentTheme;
    }
    
    setResolvedTheme(newResolvedTheme);
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      applyTheme(theme);
    }
  }, [theme, applyTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(storageKey, newTheme);
        } catch (e) {
            console.error("Error saving theme to localStorage", e);
        }
    }
    setThemeInternal(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
