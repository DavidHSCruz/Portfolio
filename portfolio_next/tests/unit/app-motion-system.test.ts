import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("app motion system", () => {
  it("uses scoped GSAP timelines with accessible responsive fallbacks", () => {
    const motion = source("src/components/motion-shell.tsx");

    expect(motion).toContain("gsap.registerPlugin(ScrollTrigger, useGSAP)");
    expect(motion).toContain("useAnimationReady");
    expect(motion).toContain('document.readyState === "complete"');
    expect(motion.match(/requestAnimationFrame/g)?.length).toBeGreaterThanOrEqual(2);
    expect(motion).toContain("if (!isHydrated) return");
    expect(motion).toContain("gsap.matchMedia()");
    expect(motion).toContain("prefers-reduced-motion: reduce");
    expect(motion).toContain('toggleActions: "play none none none"');
    expect(motion).toContain("data-motion-section");
  });

  it("connects editorial reveals, project cards and the process timeline", () => {
    const heading = source("src/components/section-heading.tsx");
    const services = source("src/components/services.tsx");
    const showcase = source("src/components/projects-showcase.tsx");
    const process = source("src/components/process.tsx");
    const cta = source("src/components/contact-cta.tsx");

    expect(heading).toContain("data-motion-title");
    expect(services).toContain("data-motion-section");
    expect(services).toContain("data-motion-item");
    expect(showcase).toContain("data-motion-section");
    expect(cta).toContain("data-motion-section");
    expect(process).toContain("data-motion-process");
    expect(process).toContain("data-process-progress");
    expect(process).toContain("data-process-step");
  });

  it("keeps GSAP scopes inside route segments instead of the root layout", () => {
    const layout = source("src/app/layout.tsx");
    const pages = [
      "src/app/page.tsx",
      "src/app/projetos/page.tsx",
      "src/app/projetos/[slug]/page.tsx",
      "src/app/sobremim/page.tsx",
      "src/app/contato/page.tsx",
    ].map(source);

    expect(layout).not.toContain("MotionShell");
    pages.forEach((page) => expect(page).toContain("MotionShell"));
  });

  it("keeps the project transition alive across App Router navigation", () => {
    const provider = source("src/components/project-transition.tsx");
    const card = source("src/components/project-card.tsx");
    const detail = source("src/app/projetos/[slug]/page.tsx");
    const layout = source("src/app/layout.tsx");

    expect(provider).toContain("router.push");
    expect(provider).toContain("data-project-transition-overlay");
    expect(provider).toContain("contextSafe");
    expect(provider).toContain("prefers-reduced-motion: reduce");
    expect(card).toContain("startProjectTransition");
    expect(card).toContain("data-project-image");
    expect(detail).toContain("data-project-hero");
    expect(layout).toContain("ProjectTransitionProvider");
  });

  it("propagates theme changes with a GSAP transition layer", () => {
    const theme = source("src/components/site-theme.tsx");

    expect(theme).toContain("data-theme-transition-layer");
    expect(theme).toContain(".timeline({");
    expect(theme).toContain("clipPath");
  });
});
