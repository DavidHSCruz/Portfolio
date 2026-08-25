import { describe, expect, it } from "vitest";
import { shouldRevealImmediately } from "../../src/lib/motion/reveal";

describe("motion reveal position", () => {
  it("keeps a section visible when restored inside the reveal area", () => {
    expect(shouldRevealImmediately(-171, 909)).toBe(true);
    expect(shouldRevealImmediately(700, 909)).toBe(true);
  });

  it("waits for ScrollTrigger only while the section is below the reveal area", () => {
    expect(shouldRevealImmediately(800, 909)).toBe(false);
  });
});
