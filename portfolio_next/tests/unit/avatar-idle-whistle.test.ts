import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("avatar idle whistle", () => {
  it("coordinates face, mouth, teeth, tongue and head pulses", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/legacy-avatar/avatar-controller.ts"),
      "utf8",
    );

    expect(source).toContain("AVATAR_IDLE_WHISTLE_KEYFRAMES.head");
    expect(source).toContain("AVATAR_IDLE_WHISTLE_KEYFRAMES.mouth");
    expect(source).toContain("AVATAR_IDLE_WHISTLE_KEYFRAMES.jaw");
    expect(source).toContain('targets(".teethBottom")');
    expect(source).toContain('targets(".tongue")');
    expect(source).toContain('targets(".hairTopPosition")');
    expect(source).toContain('targets(".neckRotate")');
  });
});
