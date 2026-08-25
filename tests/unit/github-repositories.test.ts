import { describe, expect, it, vi } from "vitest";
import { isUnauthorized, listOwnerRepositories, type RepositoryClient } from "@/lib/github-repositories";

function createClient(responses: Array<unknown>) {
  const paginate = vi.fn();
  for (const response of responses) {
    if (response instanceof Error) paginate.mockRejectedValueOnce(response);
    else paginate.mockResolvedValueOnce(response);
  }
  return {
    paginate,
    repos: { listForAuthenticatedUser: "authenticated", listForUser: "public" },
  } as unknown as RepositoryClient<{ name: string }>;
}

describe("consulta de repositórios", () => {
  it("usa a consulta autenticada quando o token funciona", async () => {
    const client = createClient([[{ name: "privado" }]]);
    await expect(listOwnerRepositories(client, "davidHSCruz", true)).resolves.toEqual([{ name: "privado" }]);
    expect(client.paginate).toHaveBeenCalledOnce();
  });

  it("cai para repositórios públicos quando o token retorna 401", async () => {
    const unauthorized = Object.assign(new Error("Bad credentials"), { status: 401 });
    const client = createClient([unauthorized, [{ name: "publico" }]]);
    await expect(listOwnerRepositories(client, "davidHSCruz", true)).resolves.toEqual([{ name: "publico" }]);
    expect(client.paginate).toHaveBeenNthCalledWith(2, "public", expect.objectContaining({ username: "davidHSCruz" }));
  });

  it("não mascara outros erros da API", async () => {
    const unavailable = Object.assign(new Error("Unavailable"), { status: 503 });
    const client = createClient([unavailable]);
    await expect(listOwnerRepositories(client, "davidHSCruz", true)).rejects.toThrow("Unavailable");
  });

  it("reconhece somente erros 401", () => {
    expect(isUnauthorized({ status: 401 })).toBe(true);
    expect(isUnauthorized({ status: 403 })).toBe(false);
  });
});
