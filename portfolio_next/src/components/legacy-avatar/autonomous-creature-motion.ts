export interface CreaturePoint {
  x: number;
  y: number;
}

export interface CreatureBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const AUTONOMOUS_FLY = {
  horizontalFocusPadding: 70,
  topFocusPadding: 48,
  focusBottomRatio: 0.72,
  containerPadding: 18,
  speed: 130,
  minTravelDuration: 0.55,
  maxTravelDuration: 1.8,
  minPauseDuration: 0.12,
  maxPauseDuration: 0.75,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number) {
  return clamp(value, 0, 1);
}

export function getAutonomousFlyBounds(
  container: CreatureBounds,
  focus: CreatureBounds,
): CreatureBounds {
  const width = Math.max(0, container.right - container.left);
  const height = Math.max(0, container.bottom - container.top);
  const minX = AUTONOMOUS_FLY.containerPadding;
  const maxX = Math.max(minX, width - AUTONOMOUS_FLY.containerPadding);
  const minY = AUTONOMOUS_FLY.containerPadding;
  const maxY = Math.max(minY, height - AUTONOMOUS_FLY.containerPadding);
  const focusLeft = focus.left - container.left;
  const focusRight = focus.right - container.left;
  const focusTop = focus.top - container.top;
  const focusHeight = Math.max(0, focus.bottom - focus.top);

  const left = clamp(
    focusLeft - AUTONOMOUS_FLY.horizontalFocusPadding,
    minX,
    maxX,
  );
  const right = clamp(
    focusRight + AUTONOMOUS_FLY.horizontalFocusPadding,
    left,
    maxX,
  );
  const top = clamp(
    focusTop - AUTONOMOUS_FLY.topFocusPadding,
    minY,
    maxY,
  );
  const bottom = clamp(
    focusTop + focusHeight * AUTONOMOUS_FLY.focusBottomRatio,
    top,
    maxY,
  );

  return { left, right, top, bottom };
}

export function getAutonomousFlyWaypoint(
  bounds: CreatureBounds,
  random: CreaturePoint,
): CreaturePoint {
  return {
    x: bounds.left + (bounds.right - bounds.left) * normalize(random.x),
    y: bounds.top + (bounds.bottom - bounds.top) * normalize(random.y),
  };
}

export function getAutonomousFlyTravelDuration(
  from: CreaturePoint,
  to: CreaturePoint,
) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);

  return clamp(
    distance / AUTONOMOUS_FLY.speed,
    AUTONOMOUS_FLY.minTravelDuration,
    AUTONOMOUS_FLY.maxTravelDuration,
  );
}

export function getAutonomousFlyPauseDuration(randomValue: number) {
  return AUTONOMOUS_FLY.minPauseDuration
    + (AUTONOMOUS_FLY.maxPauseDuration - AUTONOMOUS_FLY.minPauseDuration)
    * normalize(randomValue);
}
