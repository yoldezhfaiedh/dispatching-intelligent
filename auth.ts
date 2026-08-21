import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3004';

/**
 * Rafraichit l'access_token en passant par NestJS (POST /auth/refresh),
 * qui relaie vers Keycloak. Le frontend ne parle jamais a Keycloak.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const data = await res.json();
    if (!res.ok) throw data;

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expiresIn ?? 900),
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: { signIn: '/login', error: '/login' },

  providers: [
    Credentials({
      name: 'Keycloak',
      credentials: {
        username: { label: 'Identifiant', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? 'Identifiants incorrects');
        }

        const data = await res.json();

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          roles: data.user.roles ?? [],
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Premier passage : on stocke les tokens renvoyes par NestJS
      if (user) {
        const u = user as any;
        token.sub = u.id;
        token.name = u.name;
        token.email = u.email;
        token.roles = u.roles;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.expiresAt = Math.floor(Date.now() / 1000) + (u.expiresIn ?? 900);
        return token;
      }

      // Token encore valide (marge de 60s)
      const expiresAt = (token.expiresAt as number) ?? 0;
      if (Date.now() < expiresAt * 1000 - 60_000) return token;

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.roles = (token.roles as string[]) ?? [];
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },

  events: {
    // Revoque le refresh_token cote Keycloak a la deconnexion
    async signOut(message) {
      const token = (message as any)?.token;
      if (!token?.refreshToken) return;

      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: token.refreshToken }),
      }).catch(() => undefined);
    },
  },
});
