import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: "organizer" | "user";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "organizer" | "user";
  }
}
