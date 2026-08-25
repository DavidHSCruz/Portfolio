export type LampPhase = "off" | "near" | "activating" | "on";
export type CreatureMode = "firefly" | "fly";
export type LampCollisionSide = "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const LAMP_INTERACTION = {
  collisionBand: 22,
  collisionCooldownMs: 450,
  proximityRadius: 64,
  activationDelayMs: 2_000,
  themeTransitionMs: 600,
} as const;

const SWING_FRAMES = [
  { rotation: -12, duration: 0.16, ease: "power2.out" },
  { rotation: 8, duration: 0.28, ease: "power1.inOut" },
  { rotation: -5, duration: 0.34, ease: "power1.inOut" },
  { rotation: 2, duration: 0.4, ease: "power1.inOut" },
  { rotation: -0, duration: 0.52, ease: "power2.out" },
] as const;

export function getLampCollisionSide(
  point: Point,
  bounds: Bounds,
  band = LAMP_INTERACTION.collisionBand,
): LampCollisionSide | null {
  if (point.y < bounds.top || point.y > bounds.bottom) return null;
  if (point.x >= bounds.left - band && point.x <= bounds.left + band) return "left";
  if (point.x >= bounds.right - band && point.x <= bounds.right + band) return "right";
  return null;
}

export function getLampSwingKeyframes(side: LampCollisionSide) {
  const direction = side === "left" ? 1 : -1;

  return SWING_FRAMES.map((frame) => ({
    ...frame,
    rotation: frame.rotation === 0 ? 0 : frame.rotation * direction,
  }));
}

export function canTriggerLampCollision({
  now,
  lastHitAt,
  armed,
}: {
  now: number;
  lastHitAt: number;
  armed: boolean;
}) {
  return armed && now - lastHitAt >= LAMP_INTERACTION.collisionCooldownMs;
}

export function isNearLampBulb(
  point: Point,
  bulbCenter: Point,
  radius = LAMP_INTERACTION.proximityRadius,
) {
  return Math.hypot(point.x - bulbCenter.x, point.y - bulbCenter.y) <= radius;
}

export type LampEvent = "NEAR_ENTER" | "NEAR_LEAVE" | "ACTIVATE" | "ACTIVATION_COMPLETE" | "DEACTIVATE";

export function nextLampPhase(phase: LampPhase, event: LampEvent): LampPhase {
  if (event === "DEACTIVATE") return "off";
  if (phase === "on") return "on";
  if (phase === "activating") {
    return event === "ACTIVATION_COMPLETE" ? "on" : "activating";
  }

  if (event === "ACTIVATE") return "activating";
  if (event === "NEAR_ENTER") return "near";
  if (event === "NEAR_LEAVE") return "off";
  return phase;
}

export function getCreatureMode(phase: LampPhase): CreatureMode {
  return phase === "on" ? "fly" : "firefly";
}
