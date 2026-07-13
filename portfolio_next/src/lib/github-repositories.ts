export interface RepositoryClient<T> {
  paginate: (method: unknown, options: Record<string, unknown>) => Promise<T[]>;
  repos: {
    listForAuthenticatedUser: unknown;
    listForUser: unknown;
  };
}

export function isUnauthorized(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && error.status === 401;
}

export async function listOwnerRepositories<T>(
  client: RepositoryClient<T>,
  username: string,
  authenticated: boolean,
  publicClient: RepositoryClient<T> = client,
): Promise<T[]> {
  if (authenticated) {
    try {
      return await client.paginate(client.repos.listForAuthenticatedUser, {
        visibility: "all",
        affiliation: "owner",
        sort: "pushed",
        per_page: 100,
      });
    } catch (error) {
      if (!isUnauthorized(error)) throw error;
      console.warn("GITHUB_TOKEN inválido ou expirado; carregando somente repositórios públicos.");
    }
  }

  return publicClient.paginate(publicClient.repos.listForUser, {
    username,
    sort: "pushed",
    per_page: 100,
  });
}
