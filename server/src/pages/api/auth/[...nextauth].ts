import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import SequelizeAdapter from "@next-auth/sequelize-adapter";
import { Sequelize } from "sequelize";
import { sendVerificationRequest } from "@app/email/verification-request";

const sequelize = new Sequelize("sqlite::memory:");
sequelize.sync();

export default NextAuth({
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
  adapter: SequelizeAdapter(sequelize),
});
