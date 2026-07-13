import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("avatar colored exposure layer", () => {
  it("renders the firefly color over the avatar through the moving light mask", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/legacy-avatar/index.tsx"),
      "utf8",
    );
    const controller = readFileSync(
      join(process.cwd(), "src/components/legacy-avatar/avatar-controller.ts"),
      "utf8",
    );

    expect(source).toContain('id="firefly_exposure_color"');
    expect(source).toContain('floodColor="#82ffc5"');
    expect(source).toContain("data-avatar-light-exposure");
    expect(source).toContain('mask="url(#firefly_light_mask)"');
    expect(source).toContain('filter: "url(#firefly_exposure_color)"');
    expect(source).toContain('mixBlendMode: "screen"');
    expect(controller).toContain('"[data-avatar-light-exposure]"');
    expect(controller).toContain("opacity: lighting.exposureOpacity");

    expect(source.indexOf('id="body"')).toBeLessThan(
      source.indexOf("data-avatar-light-exposure"),
    );
  });
});
