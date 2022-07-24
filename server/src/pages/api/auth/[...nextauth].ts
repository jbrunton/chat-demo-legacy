import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sendVerificationRequest } from "@app/email/verification-request";
import { dependencies } from "@app/dependencies";

const { adapter, nameGenerator } = dependencies;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "database",
  },
  events: {
    async createUser({ user }) {
      if (!user.name) {
        const name = nameGenerator.getAnimalName();
        await adapter.updateUser({ id: user.id, name });
      }
    },
  },
  callbacks: {
    session: async (sessionInfo) => {
      const { session, user } = sessionInfo;
      if (session?.user) {
        session.user.id = user.id;
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
