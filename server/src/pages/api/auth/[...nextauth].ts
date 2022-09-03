import NextAuth from "next-auth";
import { authOptions } from "@app/auth/next/auth-options";

export default NextAuth(authOptions);
