export type AvatarMotionPhase =
  | "entering"
  | "idle"
  | "tracking"
  | "surprise"
  | "reduced";

export type AvatarMotionEvent =
  | "ENTER_COMPLETE"
  | "POINTER_MOVE"
  | "POINTER_LEAVE"
  | "SURPRISE_COMPLETE";

export const AVATAR_TIMELINE_REPEAT = {
  idle: -1,
  surprise: 0,
} as const;

export const AVATAR_IDLE_WHISTLE_KEYFRAMES = {
  head: [
    { rotate: 2, x: -3, duration: 0.5, ease: "back.out(1.4)" },
    { rotate: 5, x: -6, duration: 0.5, ease: "back.out(1.4)" },
    { rotate: 2, x: -3, duration: 0.5, ease: "back.out(1.4)" },
    { rotate: 0, x: 0, duration: 0.2, ease: "power2.inOut" },
  ],
  mouth: [
    { y: 40, x: -110, scaleX: 0.22, scaleY: 0.55, duration: 0.5, ease: "back.out(1.4)" },
    { y: 35, x: -110, scaleX: 0.2, scaleY: 0.5, duration: 0.5, ease: "back.out(1.4)" },
    { y: 38, x: -113, scaleX: 0.22, scaleY: 0.55, duration: 0.2, ease: "back.out(1.4)" },
    { y: 32, x: -113, scaleX: 0.2, scaleY: 0.5, duration: 0.5, ease: "power2.inOut" },
  ],
  jaw: [
    { y: 50, x: -100, scaleX: 0.42, scaleY: 0.75, duration: 0.5, ease: "back.out(1.4)" },
    { y: 45, x: -100, scaleX: 0.4, scaleY: 0.7, duration: 0.5, ease: "back.out(1.4)" },
    { y: 48, x: -105, scaleX: 0.42, scaleY: 0.75, duration: 0.2, ease: "back.out(1.4)" },
    { y: 42, x: -105, scaleX: 0.4, scaleY: 0.7, duration: 0.5, ease: "back.out(1.4)" },
  ],
};

export const AVATAR_EDGE_LAYER_ORDER = [
  "body",
  "head",
  "glasses",
  "nose",
] as const;

export const AVATAR_UNIFIED_EDGE_LAYERS = ["body", "head"] as const;

export const AVATAR_EDGE_RENDERING = {
  alignment: "inside",
  bodyPlacement: "behind-head",
  glassesPlacement: "behind-nose",
  noseAlignment: "inside",
} as const;

export const AVATAR_LIGHT_RENDERING = {
  followDuration: 0.65,
  intensityDuration: 0.22,
  ease: "power3.out",
  auraBlur: 12,
  auraSpread: 22,
  radiusMin: 250,
  radiusBoost: 65,
} as const;

export const AVATAR_EYE_REFLECTION = {
  activationRadius: 125,
  maxOffset: 12,
  followDuration: 0.16,
  maxOpacity: 0.95,
  left: { x: 206.5, y: 198.695 },
  right: { x: 294.5, y: 198.695 },
} as const;

const transitions: Record<
  Exclude<AvatarMotionPhase, "reduced">,
  Partial<Record<AvatarMotionEvent, AvatarMotionPhase>>
> = {
  entering: {
    ENTER_COMPLETE: "idle",
    POINTER_MOVE: "tracking",
  },
  idle: {
    POINTER_MOVE: "tracking",
  },
  tracking: {
    POINTER_MOVE: "tracking",
    POINTER_LEAVE: "surprise",
  },
  surprise: {
    POINTER_MOVE: "tracking",
    SURPRISE_COMPLETE: "idle",
  },
};

export function getAvatarLightIntensity(
  point: { x: number; y: number },
  bounds: { left: number; right: number; top: number; bottom: number },
  range = 180,
): number {
  const horizontalDistance = Math.max(bounds.left - point.x, 0, point.x - bounds.right);
  const verticalDistance = Math.max(bounds.top - point.y, 0, point.y - bounds.bottom);
  const distance = Math.hypot(horizontalDistance, verticalDistance);

  return Math.max(0, Math.min(1, 1 - distance / range));
}

export function getAvatarInteractionBounds(
  boxBounds: { left: number; right: number; top: number; bottom: number },
  navigationBottom?: number,
) {
  const top = navigationBottom === undefined
    ? boxBounds.top
    : Math.min(boxBounds.bottom, Math.max(0, navigationBottom));

  return {
    left: boxBounds.left,
    right: boxBounds.right,
    top,
    bottom: boxBounds.bottom,
  };
}

export function getAvatarLightingState(rawIntensity: number) {
  const intensity = Math.max(0, Math.min(1, rawIntensity));

  return {
    shadowOpacity: 0.82,
    overlayOpacity: intensity * 0.98,
    luminosityOpacity: intensity * 0.86,
    exposureOpacity: intensity * 0.22,
    featureEdgeOpacity: intensity,
    auraOpacity: 0.28 + intensity * 0.58,
    auraScale: 0.8 + intensity * 0.78,
    radius: AVATAR_LIGHT_RENDERING.radiusMin + intensity * AVATAR_LIGHT_RENDERING.radiusBoost,
  };
}

export function getEyeReflectionState(
  point: { x: number; y: number },
  eyeCenter: { x: number; y: number },
) {
  const dx = point.x - eyeCenter.x;
  const dy = point.y - eyeCenter.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= AVATAR_EYE_REFLECTION.activationRadius) {
    return { offsetX: 0, offsetY: 0, opacity: 0 };
  }

  const proximity = 1 - distance / AVATAR_EYE_REFLECTION.activationRadius;
  const opacity = AVATAR_EYE_REFLECTION.maxOpacity * proximity ** 1.35;

  if (distance === 0) {
    return { offsetX: 0, offsetY: 0, opacity };
  }

  const offset = AVATAR_EYE_REFLECTION.maxOffset * Math.min(1, distance / 40);

  return {
    offsetX: (dx / distance) * offset,
    offsetY: (dy / distance) * offset,
    opacity,
  };
}

export function getSurpriseReaction({ dx, dy }: { dx: number; dy: number }) {
  const safeDx = Math.max(-20, Math.min(20, dx));
  const safeDy = Math.max(-20, Math.min(20, dy));

  return {
    headX: safeDx * 0.32,
    headY: safeDy / 2,
    neckRotate: safeDx / 5,
    neckY: safeDy / 1.5,
  };
}

export function shouldShowFirefly(
  phase: AvatarMotionPhase,
  pointerInside: boolean,
): boolean {
  return pointerInside && phase !== "surprise" && phase !== "reduced";
}

export function shouldAvatarBlink(phase: AvatarMotionPhase): boolean {
  return phase !== "surprise" && phase !== "reduced";
}

export function nextAvatarMotionPhase(
  phase: AvatarMotionPhase,
  event: AvatarMotionEvent,
): AvatarMotionPhase {
  if (phase === "reduced") return phase;

  return transitions[phase][event] ?? phase;
}
