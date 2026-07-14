"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LAMP_INTERACTION } from "./legacy-avatar/lamp-motion-state";

export type SiteTheme = "dark" | "light";

interface SiteThemeContextValue {
  theme: SiteTheme;
  activateDarkTheme: () => void;
  activateLightTheme: () => void;
}

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

const THEME_COLORS: Record<SiteTheme, string> = {
  dark: "#060a0c",
  light: "#f4eddf",
};

function applyTheme(theme: SiteTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute("content", THEME_COLORS[theme]);
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>("dark");
  const transitionTimer = useRef<number | null>(null);

  const activateTheme = useCallback((nextTheme: SiteTheme) => {
    document.documentElement.classList.add("theme-transitioning");
    setTheme((current) => (current === nextTheme ? current : nextTheme));

    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
    }

    transitionTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
      transitionTimer.current = null;
    }, LAMP_INTERACTION.themeTransitionMs);
  }, []);

  const activateLightTheme = useCallback(() => activateTheme("light"), [activateTheme]);
  const activateDarkTheme = useCallback(() => activateTheme("dark"), [activateTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }

      document.documentElement.classList.remove("theme-transitioning");
      applyTheme("dark");
    };
  }, []);

  const value = useMemo(
    () => ({ theme, activateDarkTheme, activateLightTheme }),
    [activateDarkTheme, activateLightTheme, theme],
  );

  return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>;
}

export function useSiteTheme() {
  const context = useContext(SiteThemeContext);

  if (!context) {
    throw new Error("useSiteTheme must be used inside SiteThemeProvider");
  }

  return context;
}
