import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PendantLamp } from "@/components/pendant-lamp";

describe("PendantLamp", () => {
  it("renderiza uma luminaria conica interativa completa", () => {
    const onActivate = vi.fn();
    const { container, rerender } = render(<PendantLamp phase="off" onActivate={onActivate} />);
    const lamp = container.querySelector("[data-avatar-pendant-lamp]");

    expect(lamp?.getAttribute("data-lamp-phase")).toBe("off");
    expect(lamp?.querySelector('[data-part="cable"]')).not.toBeNull();
    expect(lamp?.querySelector('[data-part="socket"]')).not.toBeNull();
    expect(lamp?.querySelector('[data-part="shade"]')).not.toBeNull();
    expect(lamp?.querySelector('[data-part="bulb"]')).not.toBeNull();
    expect(lamp?.querySelector('[data-part="beam"]')).not.toBeNull();

    const shade = lamp?.querySelector('[data-part="shade"]');
    const bulb = lamp?.querySelector('[data-part="bulb"]');
    const bulbGlass = lamp?.querySelector('[data-part="bulb-glass"]');
    const bulbGlow = lamp?.querySelector('[data-lamp-bulb-glow]');
    const beam = lamp?.querySelector('[data-part="beam-shape"]');

    expect(shade?.getAttribute("data-shade-form")).toBe("trapezoid");
    expect(bulb?.getAttribute("data-bulb-form")).toBe("half-circle");
    expect(bulbGlass?.getAttribute("fill")).toBe("#18241f");
    expect(bulbGlow?.getAttribute("opacity")).toBe("0.02");
    expect(beam?.getAttribute("fill")).toBe("#ffffff");
    expect(beam?.getAttribute("fill-opacity")).toBe("0.15");
    expect(beam?.hasAttribute("stroke")).toBe(false);
    expect(beam?.parentElement?.getAttribute("class")).not.toContain("transition-opacity");

    rerender(<PendantLamp phase="near" onActivate={onActivate} />);
    expect(container.querySelector('[data-part="bulb-glass"]')?.getAttribute("fill")).toBe("url(#pendant-bulb)");

    rerender(<PendantLamp phase="off" onActivate={onActivate} />);

    const button = screen.getByRole("button", { name: /Acender lumin/ });
    expect(button.getBoundingClientRect).toBeTypeOf("function");
    fireEvent.click(button);
    expect(onActivate).toHaveBeenCalledOnce();

    rerender(<PendantLamp phase="on" onActivate={onActivate} />);
    expect(container.querySelector('[data-part="bulb-glass"]')?.getAttribute("fill")).toBe("url(#pendant-bulb)");
    fireEvent.click(screen.getByRole("button", { name: /Apagar lumin/ }));
    expect(onActivate).toHaveBeenCalledTimes(2);
  });
});
