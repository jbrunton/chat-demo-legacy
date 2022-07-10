import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sendVerificationRequest } from "@app/email/verification-request";
import { adapter } from "@app/auth/fs-adapter";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "database",
  },
  callbacks: {
    session: async (sessionInfo) => {
      const { session, user } = sessionInfo;
      if (session?.user) {
        session.user.id = user.id;
        const displayName = user.name || user.email;
        if (displayName) {
          session.user.name = displayName;
        }
      }
      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      from: "noreply@jbrunton.com",
      sendVerificationRequest: sendVerificationRequest,
    }),
  ],
  adapter,
};

export default NextAuth(authOptions);
