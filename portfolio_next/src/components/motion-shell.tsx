"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REVEAL_SELECTOR = [
  "[data-motion-eyebrow]",
  "[data-motion-title]",
  "[data-motion-body]",
  "[data-motion-item]",
].join(", ");

function useAnimationReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    const releaseAnimations = () => {
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setIsReady(true);
        });
      });
    };

    if (document.readyState === "complete") {
      releaseAnimations();
    } else {
      window.addEventListener("load", releaseAnimations, { once: true });
    }

    return () => {
      window.removeEventListener("load", releaseAnimations);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return isReady;
}

export function MotionShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHydrated = useAnimationReady();

  useGSAP(
    () => {
      if (!isHydrated) return;

      const root = rootRef.current;
      if (!root) return;

      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as {
            desktop: boolean;
            reduceMotion: boolean;
          };
          const sections = Array.from(
            root.querySelectorAll<HTMLElement>("[data-motion-section]"),
          );
          const process = root.querySelector<HTMLElement>("[data-motion-process]");

          if (conditions.reduceMotion) {
            gsap.set(root.querySelectorAll(REVEAL_SELECTOR), {
              autoAlpha: 1,
              clearProps: "transform,opacity,visibility",
            });
            gsap.set(root.querySelectorAll("[data-process-progress]"), {
              scaleX: 1,
              scaleY: 1,
            });
            return;
          }

          sections.forEach((section) => {
            const eyebrow = section.querySelectorAll("[data-motion-eyebrow]");
            const title = section.querySelectorAll("[data-motion-title]");
            const body = section.querySelectorAll("[data-motion-body]");
            const items = section.querySelectorAll("[data-motion-item]");
            const timeline = gsap.timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: {
                trigger: section,
                start: "top 82%",
                toggleActions: "play none none none",
                once: true,
              },
            });

            if (eyebrow.length) {
              timeline.from(eyebrow, {
                y: 14,
                autoAlpha: 0,
                duration: 0.42,
              });
            }
            if (title.length) {
              timeline.from(
                title,
                {
                  yPercent: 22,
                  autoAlpha: 0,
                  duration: 0.72,
                },
                eyebrow.length ? "-=0.22" : 0,
              );
            }
            if (body.length) {
              timeline.from(
                body,
                {
                  y: 22,
                  autoAlpha: 0,
                  duration: 0.55,
                },
                "-=0.38",
              );
            }
            if (items.length) {
              timeline.from(
                items,
                {
                  y: 38,
                  autoAlpha: 0,
                  duration: 0.62,
                  stagger: 0.09,
                },
                "-=0.25",
              );
            }
          });

          if (process) {
            const progress = process.querySelector<HTMLElement>(
              "[data-process-progress]",
            );
            const steps = Array.from(
              process.querySelectorAll<HTMLElement>("[data-process-step]"),
            );
            const dots = steps.map((step) =>
              step.querySelector<HTMLElement>("[data-process-dot]"),
            );

            if (progress && steps.length) {
              gsap.set(progress, conditions.desktop
                ? { scaleX: 0, scaleY: 1, transformOrigin: "left center" }
                : { scaleY: 0, scaleX: 1, transformOrigin: "center top" });
              gsap.set(steps, { autoAlpha: 0.38, y: 14 });
              gsap.set(dots.filter(Boolean), { scale: 0.72 });

              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: process,
                  start: "top 72%",
                  end: "bottom 56%",
                  scrub: 0.55,
                },
              });

              timeline.to(
                progress,
                conditions.desktop
                  ? { scaleX: 1, duration: 1, ease: "none" }
                  : { scaleY: 1, duration: 1, ease: "none" },
                0,
              );

              steps.forEach((step, index) => {
                const position = index / Math.max(steps.length, 1);
                timeline.to(
                  step,
                  { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" },
                  position,
                );
                if (dots[index]) {
                  timeline.to(
                    dots[index],
                    {
                      scale: 1,
                      backgroundColor: "var(--color-mint)",
                      duration: 0.15,
                    },
                    position,
                  );
                }
              });
            }
          }
        },
      );

      ScrollTrigger.refresh();

      return () => media.revert();
    },
    {
      scope: rootRef,
      dependencies: [isHydrated, pathname],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={rootRef} data-motion-root className="contents">
      {children}
    </div>
  );
}
