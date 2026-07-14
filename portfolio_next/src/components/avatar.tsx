"use client";

import { Avatar as LegacyAvatar } from "./legacy-avatar";

export function Avatar() {
  return (
    <div
      className="relative aspect-square w-full max-w-[620px] [filter:drop-shadow(0_35px_70px_rgb(101_242_183_/_0.13))]"
      aria-label="Avatar interativo de David Cruz"
    >
      <LegacyAvatar />
    </div>
  );
}
