import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("avatar lamp interaction wiring", () => {
  it("connects collision, flicker, activation delay, theme and fly mode", () => {
    const controller = readFileSync(
      join(process.cwd(), "src/components/legacy-avatar/avatar-controller.ts"),
      "utf8",
    );
    const scene = readFileSync(
      join(process.cwd(), "src/components/legacy-avatar/index.tsx"),
      "utf8",
    );
    const styles = readFileSync(
      join(process.cwd(), "src/components/legacy-avatar/Avatar.stage.module.css"),
      "utf8",
    );

    expect(controller).toContain("getLampCollisionSide");
    expect(controller).toContain("canTriggerLampCollision");
    expect(controller).toContain("startLampFlicker");
    expect(controller).toContain("[data-lamp-bulb-glass]");
    expect(controller).toContain("lampFlickerTargets");
    expect(controller).toContain("[data-avatar-lamp-edges]");
    expect(controller).toContain("gsap.set(lampBeam, { opacity: 1 })");
    expect(controller).toContain("getLampSwingKeyframes");
    expect(controller).toContain("startNoseSwing");
    expect(controller).toContain("isPointerNearNose");
    expect(controller).toContain("LAMP_INTERACTION.activationDelayMs");
    expect(controller).toContain("activateLightTheme()");
    expect(controller).toContain('setCreatureMode(creatureMode)');
    expect(controller).toContain('if (reduceMotion)');
    expect(scene).toContain("<PendantLamp");
    expect(scene).toContain('id="lamp_light_mask"');
    expect(scene).toContain("data-avatar-lamp-edges");
    expect(scene).toContain("sceneControllerRef.current?.activateLamp()");
    expect(styles).toContain("--fly-body-color: #07110d");
    expect(styles).toContain("background: var(--fly-body-color)");
  });
});
