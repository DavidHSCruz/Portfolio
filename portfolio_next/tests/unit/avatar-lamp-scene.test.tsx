import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Avatar } from "@/components/legacy-avatar";
import { SiteThemeProvider } from "@/components/site-theme";

describe("interactive avatar lamp scene", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    Object.defineProperty(SVGSVGElement.prototype, "createSVGPoint", {
      configurable: true,
      value: () => ({ x: 0, y: 0, matrixTransform: () => ({ x: 0, y: 0 }) }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.dataset.theme = "dark";
  });

  it("transforma o vagalume em mosca no clique e troca o tema depois de dois segundos", async () => {
    const { container } = render(
      <SiteThemeProvider>
        <Avatar />
      </SiteThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Acender lumin/ }));
    expect(container.querySelector("[data-avatar-pendant-lamp]")?.getAttribute("data-lamp-phase")).toBe("activating");
    expect(container.querySelector("[data-creature-mode=fly]")).not.toBeNull();
    expect(container.querySelector("[data-creature-control=autonomous]")).not.toBeNull();
    expect(document.documentElement.classList.contains("avatar-firefly-active")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect((container.querySelector('[data-part="beam"]') as SVGElement).style.opacity).toBe("1");
    const lampEdgeOpacity = Number.parseFloat(
      (container.querySelector("[data-avatar-lamp-edges]") as SVGElement).style.opacity,
    );
    expect(lampEdgeOpacity).toBeGreaterThan(0.35);
    expect(lampEdgeOpacity).toBeLessThan(0.6);

    await act(async () => {
      vi.advanceTimersByTime(2_000);
    });

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(
      Number.parseFloat((container.querySelector("[data-avatar-lamp-edges]") as SVGElement).style.opacity),
    ).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: /Apagar lumin/ }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(container.querySelector("[data-creature-mode=firefly]")).not.toBeNull();
    expect(container.querySelector("[data-creature-control=pointer]")).not.toBeNull();
    expect(container.querySelector("[data-avatar-pendant-lamp]")?.getAttribute("data-lamp-phase")).toBe("off");
  });
});
