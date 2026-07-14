import { describe, expect, it } from "vitest";
import {
  AVATAR_EDGE_LAYER_ORDER,
  AVATAR_EDGE_RENDERING,
  AVATAR_EYE_REFLECTION,
  AVATAR_LIGHT_RENDERING,
  AVATAR_NOSE_INTERACTION,
  AVATAR_NOSE_SWING_KEYFRAMES,
  AVATAR_IDLE_WHISTLE_KEYFRAMES,
  AVATAR_UNIFIED_EDGE_LAYERS,
  AVATAR_TIMELINE_REPEAT,
  getAvatarLightingState,
  getAvatarInteractionBounds,
  getAvatarLightIntensity,
  getEyeReflectionState,
  canTriggerNoseCollision,
  isPointerNearNose,
  getSurpriseReaction,
  nextAvatarMotionPhase,
  shouldAvatarBlink,
  shouldShowFirefly,
  type AvatarMotionPhase,
} from "@/components/legacy-avatar/motion-state";

describe("avatar motion state", () => {
  it("moves from entrance to idle and then to pointer tracking", () => {
    let phase: AvatarMotionPhase = "entering";

    phase = nextAvatarMotionPhase(phase, "ENTER_COMPLETE");
    expect(phase).toBe("idle");

    phase = nextAvatarMotionPhase(phase, "POINTER_MOVE");
    expect(phase).toBe("tracking");
  });

  it("gives pointer tracking priority over idle and surprise", () => {
    expect(nextAvatarMotionPhase("idle", "POINTER_MOVE")).toBe("tracking");
    expect(nextAvatarMotionPhase("surprise", "POINTER_MOVE")).toBe("tracking");
  });

  it("runs surprise only after tracking and returns to idle", () => {
    expect(nextAvatarMotionPhase("tracking", "POINTER_LEAVE")).toBe("surprise");
    expect(nextAvatarMotionPhase("surprise", "SURPRISE_COMPLETE")).toBe("idle");
  });

  it("keeps idle looping and surprise one-shot", () => {
    expect(AVATAR_TIMELINE_REPEAT.idle).toBe(-1);
    expect(AVATAR_TIMELINE_REPEAT.surprise).toBe(0);
  });

  it("keeps the original movement that makes the idle pose whistle", () => {
    expect(AVATAR_IDLE_WHISTLE_KEYFRAMES.head.map((frame) => frame.rotate)).toEqual([
      2,
      5,
      2,
      0,
    ]);
    expect(
      AVATAR_IDLE_WHISTLE_KEYFRAMES.mouth.map(({ x, y, scaleX, scaleY }) => [
        x,
        y,
        scaleX,
        scaleY,
      ]),
    ).toEqual([
      [-110, 40, 0.22, 0.55],
      [-110, 35, 0.2, 0.5],
      [-113, 38, 0.22, 0.55],
      [-113, 32, 0.2, 0.5],
    ]);
    expect(AVATAR_IDLE_WHISTLE_KEYFRAMES.jaw).toHaveLength(4);
  });

  it("reacts in the direction of the final pointer gaze", () => {
    expect(getSurpriseReaction({ dx: -20, dy: -12 })).toEqual({
      headX: -6.4,
      headY: -6,
      neckRotate: -4,
      neckY: -8,
    });
    expect(getSurpriseReaction({ dx: 20, dy: 12 })).toEqual({
      headX: 6.4,
      headY: 6,
      neckRotate: 4,
      neckY: 8,
    });
  });

  it("keeps blinking in every animated phase except surprise", () => {
    expect(shouldAvatarBlink("entering")).toBe(true);
    expect(shouldAvatarBlink("idle")).toBe(true);
    expect(shouldAvatarBlink("tracking")).toBe(true);
    expect(shouldAvatarBlink("surprise")).toBe(false);
    expect(shouldAvatarBlink("reduced")).toBe(false);
  });

  it("increases the firefly light as it approaches the avatar", () => {
    const avatarBounds = { left: 100, right: 300, top: 100, bottom: 400 };

    expect(getAvatarLightIntensity({ x: 200, y: 200 }, avatarBounds)).toBe(1);
    expect(getAvatarLightIntensity({ x: 390, y: 200 }, avatarBounds)).toBe(0.5);
    expect(getAvatarLightIntensity({ x: 500, y: 200 }, avatarBounds)).toBe(0);
  });

  it("extends the interaction area up to the bottom of the navigation", () => {
    const boxBounds = { left: 100, right: 900, top: 380, bottom: 1000 };

    expect(getAvatarInteractionBounds(boxBounds, 72)).toEqual({
      left: 100,
      right: 900,
      top: 72,
      bottom: 1000,
    });
    expect(getAvatarInteractionBounds(boxBounds)).toEqual(boxBounds);
  });

  it("keeps the avatar dark and lights volume and vector edges locally", () => {
    expect(getAvatarLightingState(0)).toMatchObject({
      shadowOpacity: 0.82,
      overlayOpacity: 0,
      luminosityOpacity: 0,
      exposureOpacity: 0,
      featureEdgeOpacity: 0,
    });

    expect(getAvatarLightingState(1)).toMatchObject({
      shadowOpacity: 0.82,
      overlayOpacity: 0.98,
      luminosityOpacity: 0.86,
      exposureOpacity: 0.22,
      featureEdgeOpacity: 1,
    });
  });

  it("keeps body, head, glasses and nose in the intended light stack", () => {
    expect(AVATAR_EDGE_LAYER_ORDER).toEqual([
      "body",
      "head",
      "glasses",
      "nose",
    ]);
  });

  it("uses one merged silhouette for head and body", () => {
    expect(AVATAR_UNIFIED_EDGE_LAYERS).toEqual(["body", "head"]);
  });

  it("keeps silhouette light inside and the body behind the head", () => {
    expect(AVATAR_EDGE_RENDERING).toEqual({
      alignment: "inside",
      bodyPlacement: "behind-head",
      glassesPlacement: "behind-nose",
      noseAlignment: "inside",
    });
  });

  it("softens only the firefly aura and keeps a small lighting lag", () => {
    expect(AVATAR_LIGHT_RENDERING).toEqual({
      followDuration: 0.65,
      intensityDuration: 0.22,
      ease: "power3.out",
      auraBlur: 12,
      auraSpread: 22,
      radiusMin: 250,
      radiusBoost: 65,
    });
    expect(getAvatarLightingState(0).radius).toBe(250);
    expect(getAvatarLightingState(1).radius).toBe(315);
  });

  it("reflects the nearby firefly inside each eye", () => {
    expect(AVATAR_EYE_REFLECTION).toEqual({
      activationRadius: 125,
      maxOffset: 12,
      followDuration: 0.16,
      maxOpacity: 0.95,
      left: { x: 206.5, y: 198.695 },
      right: { x: 294.5, y: 198.695 },
    });

    expect(
      getEyeReflectionState(AVATAR_EYE_REFLECTION.left, AVATAR_EYE_REFLECTION.left),
    ).toEqual({ offsetX: 0, offsetY: 0, opacity: 0.95 });

    const nearby = getEyeReflectionState(
      { x: AVATAR_EYE_REFLECTION.left.x + 30, y: AVATAR_EYE_REFLECTION.left.y },
      AVATAR_EYE_REFLECTION.left,
    );
    expect(nearby.offsetX).toBeCloseTo(9, 4);
    expect(nearby.offsetY).toBe(0);
    expect(nearby.opacity).toBeGreaterThan(0.6);

    expect(
      getEyeReflectionState(
        { x: AVATAR_EYE_REFLECTION.left.x + 130, y: AVATAR_EYE_REFLECTION.left.y },
        AVATAR_EYE_REFLECTION.left,
      ),
    ).toEqual({ offsetX: 0, offsetY: 0, opacity: 0 });
  });

  it("detects the firefly touching the nose and rearms after leaving", () => {
    const nose = { left: 120, right: 180, top: 140, bottom: 236 };

    expect(isPointerNearNose({ x: 150, y: 180 }, nose)).toBe(true);
    expect(isPointerNearNose({ x: 111, y: 180 }, nose)).toBe(true);
    expect(isPointerNearNose({ x: 90, y: 180 }, nose)).toBe(false);
    expect(canTriggerNoseCollision({ now: 1_000, lastHitAt: 0, armed: true })).toBe(true);
    expect(canTriggerNoseCollision({ now: 1_100, lastHitAt: 1_000, armed: true })).toBe(false);
    expect(canTriggerNoseCollision({ now: 2_000, lastHitAt: 1_000, armed: false })).toBe(false);
  });

  it("uses a short damped swing for the nose", () => {
    expect(AVATAR_NOSE_INTERACTION).toEqual({
      collisionPadding: 10,
      rearmPadding: 22,
      cooldownMs: 450,
    });
    expect(AVATAR_NOSE_SWING_KEYFRAMES.map(({ rotation }) => rotation)).toEqual([9, -6, 3, -1.5, 0]);
  });

  it("shows the firefly only inside the area and outside surprise", () => {
    expect(shouldShowFirefly("tracking", true)).toBe(true);
    expect(shouldShowFirefly("idle", true)).toBe(true);
    expect(shouldShowFirefly("tracking", false)).toBe(false);
    expect(shouldShowFirefly("surprise", true)).toBe(false);
    expect(shouldShowFirefly("reduced", true)).toBe(false);
  });

  it("keeps reduced-motion mode static", () => {
    const events = [
      "ENTER_COMPLETE",
      "POINTER_MOVE",
      "POINTER_LEAVE",
      "SURPRISE_COMPLETE",
    ] as const;

    for (const event of events) {
      expect(nextAvatarMotionPhase("reduced", event)).toBe("reduced");
    }
  });
});
