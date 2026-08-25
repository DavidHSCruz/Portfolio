import { createHash } from "node:crypto";
export function shouldUseProjectCache(environment: string | undefined) {
  return environment === "production";
}

export function getProjectCacheVariant(token: string | undefined) {
  const normalized = token?.trim();
  if (!normalized) return "anonymous";

  const digest = createHash("sha256").update(normalized).digest("hex").slice(0, 16);
  return `token-${digest}`;
}
