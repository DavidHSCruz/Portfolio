import { describe, expect, it, vi } from "vitest";
import { listOwnerRepositories, type RepositoryClient } from "@/lib/github-repositories";

function client(method: string, result: unknown, reject = false) {
  const paginate = reject ? vi.fn().mockRejectedValue(result) : vi.fn().mockResolvedValue(result);
  return {
    paginate,
    repos: { listForAuthenticatedUser: `${method}-auth`, listForUser: `${method}-public` },
  } as unknown as RepositoryClient<{ name: string }>;
}

describe("fallback anônimo do GitHub", () => {
  it("usa uma instância sem token depois de um 401", async () => {
    const unauthorized = Object.assign(new Error("Bad credentials"), { status: 401 });
    const authenticated = client("token", unauthorized, true);
    const anonymous = client("anonymous", [{ name: "publico" }]);

    await expect(
      listOwnerRepositories(authenticated, "davidHSCruz", true, anonymous),
    ).resolves.toEqual([{ name: "publico" }]);

    expect(authenticated.paginate).toHaveBeenCalledOnce();
    expect(anonymous.paginate).toHaveBeenCalledWith(
      "anonymous-public",
      expect.objectContaining({ username: "davidHSCruz" }),
    );
  });
});
