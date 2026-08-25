export function shouldUseProjectCache(environment: string | undefined) {
  return environment === "production";
}
