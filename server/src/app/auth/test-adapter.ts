import {
  Adapter,
  AdapterUser,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters";
import { Account } from "next-auth";
import { JsonDB } from "node-json-db";
import { DataError } from "node-json-db/dist/lib/Errors";
import { randomString } from "./random";

export function TestAdapter(db: JsonDB): Adapter {
  db.push("/users", {});
  db.push("/sessions", {});
  db.push("/verification-tokens", {});

  return {
    async createUser(user): Promise<AdapterUser> {
      const id = randomString(2);
      const newUser = {
        id,
        ...user,
      };
      db.push(`/users/${id}`, newUser);
      return newUser as AdapterUser;
    },

    async getUser(id): Promise<AdapterUser | null> {
      try {
        const user = db.getObject<AdapterUser | null>(`/users/${id}`);
        return user;
      } catch (DataError) {
        return null;
      }
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      const users = db.getObject<AdapterUser[]>("/users");
      const user = Object.values(users).find((user) => user.email === email);
      return user || null;
    },

    async getUserByAccount(providerAccountId): Promise<AdapterUser | null> {
      throw new Error("Function not implemented.");
    },

    async updateUser(user): Promise<AdapterUser> {
      throw new Error("Function not implemented.");
    },

    async linkAccount(account): Promise<Account | null | undefined> {
      throw new Error("Function not implemented.");
    },

    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<AdapterSession> {
      const id = session.sessionToken;
      const newSession = {
        id,
        ...session,
      };
      db.push(`/sessions/${id}`, newSession);
      return Promise.resolve(newSession);
    },

    async getSessionAndUser(
      sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      const session = db.getObject<AdapterSession>(`/sessions/${sessionToken}`);
      const user = db.getObject<AdapterUser>(`/users/${session.userId}`);
      return { session, user };
    },

    async updateSession(session): Promise<AdapterSession | null | undefined> {
      throw new Error("Function not implemented.");
    },

    async deleteSession(
      sessionToken: string
    ): Promise<AdapterSession | null | undefined> {
      db.delete(`/sessions/${sessionToken}`);
      return Promise.resolve(null);
    },

    async createVerificationToken(
      verificationToken
    ): Promise<VerificationToken | null | undefined> {
      db.push(
        `/verification-tokens/${verificationToken.identifier}`,
        verificationToken
      );
      return verificationToken;
    },

    async useVerificationToken({
      identifier,
    }): Promise<VerificationToken | null> {
      const verificationToken = db.getObject<VerificationToken>(
        `/verification-tokens/${identifier}`
      );
      return verificationToken;
    },
  };
}
