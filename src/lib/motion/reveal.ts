export const MOTION_REVEAL_VIEWPORT_RATIO = 0.82;

export function shouldRevealImmediately(
  sectionTop: number,
  viewportHeight: number,
  revealRatio = MOTION_REVEAL_VIEWPORT_RATIO,
) {
  return sectionTop <= Math.max(viewportHeight, 0) * revealRatio;
}
