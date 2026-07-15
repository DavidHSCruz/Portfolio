import { describe, expect, it } from "vitest";

import {
  AUTONOMOUS_FLY,
  getAutonomousFlyBounds,
  getAutonomousFlyPauseDuration,
  getAutonomousFlyTravelDuration,
  getAutonomousFlyWaypoint,
} from "@/components/legacy-avatar/autonomous-creature-motion";

describe("autonomous creature motion", () => {
  const container = { left: 0, right: 1_000, top: 0, bottom: 600 };
  const avatar = { left: 350, right: 650, top: 120, bottom: 520 };

  it("keeps the fly roaming around the avatar and inside the scene", () => {
    expect(getAutonomousFlyBounds(container, avatar)).toEqual({
      left: 280,
      right: 720,
      top: 72,
      bottom: 408,
    });
  });

  it("maps normalized random values to a deterministic waypoint", () => {
    const bounds = getAutonomousFlyBounds(container, avatar);

    expect(getAutonomousFlyWaypoint(bounds, { x: 0, y: 1 })).toEqual({
      x: 280,
      y: 408,
    });
    expect(getAutonomousFlyWaypoint(bounds, { x: 0.5, y: 0.5 })).toEqual({
      x: 500,
      y: 240,
    });
  });

  it("clamps travel and pause timing to natural motion limits", () => {
    expect(getAutonomousFlyTravelDuration({ x: 0, y: 0 }, { x: 260, y: 0 })).toBe(
      AUTONOMOUS_FLY.maxTravelDuration,
    );
    expect(getAutonomousFlyTravelDuration({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(
      AUTONOMOUS_FLY.minTravelDuration,
    );
    expect(getAutonomousFlyPauseDuration(0.5)).toBeCloseTo(0.435);
  });
});
