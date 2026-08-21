import { auth } from '@/auth';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3004';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Appel serveur vers NestJS avec l'access_token Keycloak.
 * A utiliser dans les Server Components et Server Actions.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = await auth();

  if (!session?.accessToken) {
    throw new ApiError(401, 'Session absente');
  }
  if (session.error === 'RefreshAccessTokenError') {
    throw new ApiError(401, 'Session expiree, reconnexion necessaire');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: 'no-store',
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? `Erreur API ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/** Verifie un role sans refaire d'appel reseau. */
export async function hasRole(...roles: string[]): Promise<boolean> {
  const session = await auth();
  return roles.some((r) => session?.roles?.includes(r));
}
