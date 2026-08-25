import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("avatar eye reflection layer", () => {
  it("keeps eye clips and reflections behind glasses and nose", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/legacy-avatar/index.tsx"),
      "utf8",
    );

    expect(source).toContain('id="firefly_eye_left_clip"');
    expect(source).toContain('id="firefly_eye_right_clip"');
    expect(source).toContain("data-avatar-eye-reflections");
    expect(source).toContain('data-avatar-eye-reflection="left"');
    expect(source).toContain('data-avatar-eye-reflection="right"');

    const reflectionLayer = source.indexOf("data-avatar-eye-reflections");
    const glassesLayer = source.indexOf('data-avatar-edge-layer="glasses"');
    const noseLayer = source.indexOf('data-avatar-edge-layer="nose"');

    expect(reflectionLayer).toBeLessThan(glassesLayer);
    expect(glassesLayer).toBeLessThan(noseLayer);
  });
});
