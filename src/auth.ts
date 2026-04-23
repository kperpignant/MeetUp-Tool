import NextAuth from "next-auth";
import { authConfig, isOrganizerEmail } from "@/auth.config";

export { isOrganizerEmail };

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const { connectDB } = await import("@/lib/mongodb");
        const { User } = await import("@/models/User");
        await connectDB();
        const role = isOrganizerEmail(user.email) ? "organizer" : "user";
        await User.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          {
            $set: {
              name: user.name,
              image: user.image,
              role,
            },
          },
          { upsert: true, new: true },
        );
      } catch {
        return false;
      }
      return true;
    },
  },
});
