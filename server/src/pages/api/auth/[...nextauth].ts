import NextAuth from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { Options as SMTPConnectionOptions } from "nodemailer/lib/smtp-transport";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { TestAdapter } from "@app/auth/test-adapter";

const smtpServer: SMTPConnectionOptions = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.ETHEREAL_USER as string,
    pass: process.env.ETHEREAL_PASSWORD as string,
  },
};

const db = new JsonDB("auth-db", false, false, "/");

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      server: smtpServer,
      from: "noreply@example.com",
    }),
  ],
  adapter: TestAdapter(db),
});
