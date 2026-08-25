import "server-only";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstile(token: string, remoteIp?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret && process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!secret || !token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body, cache: "no-store" },
    );
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileResponse;
    return result.success;
  } catch {
    return false;
  }
}
