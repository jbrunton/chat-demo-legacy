import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sendVerificationRequest } from "@app/email/verification-request";
import { adapter } from "@app/dependencies";
import { nameGenerator } from "@app/dependencies/name-generator";

const isDevelopment =
  process.env.NODE_ENV === "development" ||
  process.env.ENVIRONMENT_TYPE === "development";

const pages = isDevelopment
  ? {
      verifyRequest: "/auth/verify-request",
    }
  : {};

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
  pages,
};

export default NextAuth(authOptions);
