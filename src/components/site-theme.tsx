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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LAMP_INTERACTION } from "./legacy-avatar/lamp-motion-state";

gsap.registerPlugin(useGSAP);

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

const THEME_WASH_COLORS: Record<SiteTheme, string> = {
  dark: "rgb(6 10 12 / .5)",
  light: "rgb(255 242 197 / .48)",
};

function applyTheme(theme: SiteTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  themeColor?.setAttribute("content", THEME_COLORS[theme]);
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>("dark");
  const themeRef = useRef<SiteTheme>("dark");
  const transitionLayerRef = useRef<HTMLDivElement>(null);
  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const activateThemeRef = useRef<(theme: SiteTheme) => void>(() => undefined);

  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe) return;

      activateThemeRef.current = contextSafe((nextTheme: SiteTheme) => {
        if (themeRef.current === nextTheme) return;

        const root = document.documentElement;
        const layer = transitionLayerRef.current;
        const reduceMotion =
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

        themeRef.current = nextTheme;
        root.classList.add("theme-transitioning");
        setTheme(nextTheme);

        transitionTimelineRef.current?.kill();

        if (!layer || reduceMotion) {
          if (layer) gsap.set(layer, { autoAlpha: 0 });
          root.classList.remove("theme-transitioning");
          return;
        }

        const duration = LAMP_INTERACTION.themeTransitionMs / 1_000;
        gsap.set(layer, {
          display: "block",
          autoAlpha: 1,
          backgroundColor: THEME_WASH_COLORS[nextTheme],
          clipPath: "inset(0 0 100% 0)",
        });

        transitionTimelineRef.current = gsap
          .timeline({
            onComplete: () => {
              gsap.set(layer, { display: "none", autoAlpha: 0 });
              root.classList.remove("theme-transitioning");
              transitionTimelineRef.current = null;
            },
          })
          .to(layer, {
            clipPath: "inset(0 0 0% 0)",
            duration: duration * 0.7,
            ease: "power2.inOut",
          })
          .to(layer, {
            autoAlpha: 0,
            duration: duration * 0.3,
            ease: "power1.out",
          });
      });

      return () => {
        transitionTimelineRef.current?.kill();
        transitionTimelineRef.current = null;
      };
    },
    { scope: transitionLayerRef },
  );

  const activateTheme = useCallback((nextTheme: SiteTheme) => {
    activateThemeRef.current(nextTheme);
  }, []);

  const activateLightTheme = useCallback(
    () => activateTheme("light"),
    [activateTheme],
  );
  const activateDarkTheme = useCallback(
    () => activateTheme("dark"),
    [activateTheme],
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      transitionTimelineRef.current?.kill();
      document.documentElement.classList.remove("theme-transitioning");
      themeRef.current = "dark";
      applyTheme("dark");
    };
  }, []);

  const value = useMemo(
    () => ({ theme, activateDarkTheme, activateLightTheme }),
    [activateDarkTheme, activateLightTheme, theme],
  );

  return (
    <SiteThemeContext.Provider value={value}>
      <div
        ref={transitionLayerRef}
        aria-hidden="true"
        data-theme-transition-layer
        className="theme-transition-layer"
      />
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const context = useContext(SiteThemeContext);

  if (!context) {
    throw new Error("useSiteTheme must be used inside SiteThemeProvider");
  }

  return context;
}
