import NextAuth, { NextAuthOptions } from "next-auth";
import {
  uniqueNamesGenerator,
  animals,
  adjectives,
} from "unique-names-generator";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sendVerificationRequest } from "@app/email/verification-request";
import { adapter } from "@app/auth/fs-adapter";

const generateName = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: "capital",
    separator: " ",
    length: 2,
  });
  return `Anon ${randomName}`;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "database",
  },
  events: {
    async createUser({ user }) {
      if (!user.name) {
        const name = generateName();
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
