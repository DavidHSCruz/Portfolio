"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface TransitionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ProjectTransitionPayload {
  href: string;
  image: string | null;
  sourceRect: TransitionRect;
  source?: HTMLElement | null;
}

interface ProjectTransitionValue {
  startProjectTransition: (payload: ProjectTransitionPayload) => void;
}

const ProjectTransitionContext =
  createContext<ProjectTransitionValue | null>(null);

export function ProjectTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const destinationRef = useRef<string | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const startRef = useRef<(payload: ProjectTransitionPayload) => void>(() => undefined);
  const finishRef = useRef<() => void>(() => undefined);

  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe) return;

      const finish = contextSafe(() => {
        const overlay = overlayRef.current;
        if (!overlay || !activeRef.current) return;

        if (fallbackTimerRef.current !== null) {
          window.clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }

        const target = document.querySelector<HTMLElement>("[data-project-hero]");
        const complete = () => {
          if (target) gsap.set(target, { autoAlpha: 1 });
          gsap.set(overlay, { display: "none", autoAlpha: 0 });
          document.documentElement.classList.remove("project-transitioning");
          activeRef.current = false;
          destinationRef.current = null;
        };

        if (!target) {
          gsap.to(overlay, {
            autoAlpha: 0,
            duration: 0.24,
            ease: "power1.out",
            onComplete: complete,
          });
          return;
        }

        const rect = target.getBoundingClientRect();
        gsap.set(target, { autoAlpha: 0 });
        gsap.to(overlay, {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius: 24,
          duration: 0.38,
          ease: "power3.inOut",
          onComplete: complete,
        });
      });

      finishRef.current = finish;

      startRef.current = contextSafe((payload: ProjectTransitionPayload) => {
        const overlay = overlayRef.current;
        if (!overlay || activeRef.current) return;

        const reduceMotion =
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        if (reduceMotion) {
          router.push(payload.href);
          return;
        }

        activeRef.current = true;
        destinationRef.current = payload.href;
        document.documentElement.classList.add("project-transitioning");

        const backgroundImage = payload.image
          ? `linear-gradient(to top, rgb(6 10 12 / .35), transparent 72%), url("${encodeURI(payload.image)}")`
          : "radial-gradient(circle at 70% 20%, #274c40, #0d1518 60%)";

        gsap.killTweensOf([overlay, payload.source]);
        gsap.set(overlay, {
          display: "block",
          autoAlpha: 1,
          left: payload.sourceRect.left,
          top: payload.sourceRect.top,
          width: payload.sourceRect.width,
          height: payload.sourceRect.height,
          borderRadius: 24,
          backgroundImage,
        });

        const timeline = gsap.timeline({
          onComplete: () => {
            router.push(payload.href);
            fallbackTimerRef.current = window.setTimeout(
              () => finishRef.current(),
              2_400,
            );
          },
        });

        if (payload.source) {
          timeline.to(
            payload.source,
            {
              scale: 0.985,
              autoAlpha: 0.72,
              duration: 0.34,
              ease: "power2.out",
            },
            0,
          );
        }

        timeline.to(
          overlay,
          {
            left: 16,
            top: Math.max(76, window.innerHeight * 0.08),
            width: Math.max(0, window.innerWidth - 32),
            height: Math.max(320, window.innerHeight * 0.78),
            borderRadius: 30,
            duration: 0.56,
            ease: "power4.inOut",
          },
          0,
        );
      });

      return () => {
        if (fallbackTimerRef.current !== null) {
          window.clearTimeout(fallbackTimerRef.current);
        }
        document.documentElement.classList.remove("project-transitioning");
        activeRef.current = false;
      };
    },
    { scope: overlayRef },
  );

  useEffect(() => {
    if (
      activeRef.current &&
      destinationRef.current &&
      pathname === destinationRef.current
    ) {
      const frame = window.requestAnimationFrame(() => finishRef.current());
      return () => window.cancelAnimationFrame(frame);
    }
  }, [pathname]);

  const startProjectTransition = useCallback(
    (payload: ProjectTransitionPayload) => startRef.current(payload),
    [],
  );

  return (
    <ProjectTransitionContext.Provider value={{ startProjectTransition }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        data-project-transition-overlay
        className="fixed left-0 top-0 z-[10000] hidden bg-cover bg-center opacity-0 shadow-2xl pointer-events-none"
      />
    </ProjectTransitionContext.Provider>
  );
}

export function useProjectTransition() {
  return useContext(ProjectTransitionContext);
}
