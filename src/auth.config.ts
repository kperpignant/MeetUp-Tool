import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

function organizerEmails(): string[] {
  return (process.env.ORGANIZER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isOrganizerEmail(
  email: string | null | undefined,
): email is string {
  if (!email) return false;
  return organizerEmails().includes(email.toLowerCase());
}

// Edge-safe Auth.js config used by middleware. MUST NOT import anything that
// pulls in `node:*` modules (e.g. mongoose, the connectDB helper).
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.email) {
        token.role = isOrganizerEmail(user.email) ? "organizer" : "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role =
          (token.role as "organizer" | "user" | undefined) ?? "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
