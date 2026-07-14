import { describe, expect, it } from "vitest";

import {
  LAMP_INTERACTION,
  canTriggerLampCollision,
  getLampCollisionSide,
  getLampSwingKeyframes,
  isNearLampBulb,
  nextLampPhase,
  type LampPhase,
} from "@/components/legacy-avatar/lamp-motion-state";

describe("lamp motion state", () => {
  it("detecta colisoes apenas nas laterais da cupula", () => {
    const shade = { left: 100, right: 240, top: 80, bottom: 180 };

    expect(getLampCollisionSide({ x: 90, y: 120 }, shade)).toBe("left");
    expect(getLampCollisionSide({ x: 250, y: 120 }, shade)).toBe("right");
    expect(getLampCollisionSide({ x: 170, y: 120 }, shade)).toBeNull();
    expect(getLampCollisionSide({ x: 90, y: 220 }, shade)).toBeNull();
  });

  it("empurra a luminaria para o lado oposto e perde forca", () => {
    expect(getLampSwingKeyframes("left").map(({ rotation }) => rotation)).toEqual([12, -8, 5, -2, 0]);
    expect(getLampSwingKeyframes("right").map(({ rotation }) => rotation)).toEqual([-12, 8, -5, 2, 0]);
  });

  it("respeita cooldown e rearme da colisao", () => {
    expect(canTriggerLampCollision({ now: 1_000, lastHitAt: 400, armed: true })).toBe(true);
    expect(canTriggerLampCollision({ now: 700, lastHitAt: 400, armed: true })).toBe(false);
    expect(canTriggerLampCollision({ now: 1_000, lastHitAt: 400, armed: false })).toBe(false);
    expect(LAMP_INTERACTION.collisionCooldownMs).toBe(450);
  });

  it("ativa proximidade dentro de 64px do centro da lampada", () => {
    const bulb = { x: 200, y: 100 };

    expect(isNearLampBulb({ x: 264, y: 100 }, bulb)).toBe(true);
    expect(isNearLampBulb({ x: 265, y: 100 }, bulb)).toBe(false);
    expect(LAMP_INTERACTION.proximityRadius).toBe(64);
  });

  it("faz uma unica transicao ate a lampada acesa", () => {
    let phase: LampPhase = "off";
    phase = nextLampPhase(phase, "NEAR_ENTER");
    expect(phase).toBe("near");
    phase = nextLampPhase(phase, "ACTIVATE");
    expect(phase).toBe("activating");
    expect(nextLampPhase(phase, "ACTIVATE")).toBe("activating");
    phase = nextLampPhase(phase, "ACTIVATION_COMPLETE");
    expect(phase).toBe("on");
    expect(nextLampPhase(phase, "NEAR_LEAVE")).toBe("on");
    phase = nextLampPhase(phase, "DEACTIVATE");
    expect(phase).toBe("off");
    expect(LAMP_INTERACTION.activationDelayMs).toBe(2_000);
  });
});
