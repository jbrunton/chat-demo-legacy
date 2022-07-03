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
import { debug } from "debug";

const authLogger = debug("auth");

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
      authLogger("createUser: created user:", newUser);
      return newUser as AdapterUser;
    },

    async getUser(id): Promise<AdapterUser | null> {
      try {
        const user = db.getObject<AdapterUser | null>(`/users/${id}`);
        authLogger(`getUser: found user (id=${id}):`, user);
        return user;
      } catch (DataError) {
        authLogger(`getUser: could not find user (id=${id})`);
        return null;
      }
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      const users = db.getObject<AdapterUser[]>("/users");
      const user = Object.values(users).find((user) => user.email === email);
      if (user) {
        authLogger(`getUserByEmail: found user (email=${email}):`, user);
        return user;
      }
      return null;
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
      authLogger("createSession: created session:", newSession);
      return Promise.resolve(newSession);
    },

    async getSessionAndUser(
      sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      try {
        const session = db.getObject<AdapterSession>(
          `/sessions/${sessionToken}`
        );
        const user = db.getObject<AdapterUser>(`/users/${session.userId}`);
        authLogger(`getSessionAndUser: found:`, { session, user });
        return { session, user };
      } catch (DataError) {
        authLogger(
          `getSessionAndUser: could not find session for ${sessionToken}`
        );
        return null;
      }
    },

    async updateSession(session): Promise<AdapterSession | null | undefined> {
      throw new Error("Function not implemented.");
    },

    async deleteSession(
      sessionToken: string
    ): Promise<AdapterSession | null | undefined> {
      db.delete(`/sessions/${sessionToken}`);
      authLogger("deleteSession: deleted session:", sessionToken);
      return Promise.resolve(null);
    },

    async createVerificationToken(
      verificationToken
    ): Promise<VerificationToken | null | undefined> {
      db.push(
        `/verification-tokens/${verificationToken.identifier}`,
        verificationToken
      );
      authLogger("createVerificationToken: created token:", verificationToken);
      return verificationToken;
    },

    async useVerificationToken({
      identifier,
    }): Promise<VerificationToken | null> {
      const verificationToken = db.getObject<VerificationToken>(
        `/verification-tokens/${identifier}`
      );
      db.delete(`/verification-tokens/${identifier}`);
      authLogger("useVerificationToken: used token:", verificationToken);
      return verificationToken;
    },
  };
}
