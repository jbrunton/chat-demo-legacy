import {
  Adapter,
  AdapterUser,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters";
import crypto from "crypto";
import { Account } from "next-auth";
import { JSONFileSync, LowSync } from "lowdb";
import { chain, ExpChain } from "lodash";
import { debug } from "@app/debug";

type Data = {
  users: AdapterUser[];
  accounts: Account[];
  sessions: AdapterSession[];
  verificationTokens: VerificationToken[];
};

export class AuthDB extends LowSync<Data> {
  chain: ExpChain<this["data"]> = chain(this).get("data");

  users: ExpChain<Data["users"]> = this.chain.get("users");
  accounts: ExpChain<Data["accounts"]> = this.chain.get("accounts");
  sessions: ExpChain<Data["sessions"]> = this.chain.get("sessions");
  verificationTokens: ExpChain<Data["verificationTokens"]> =
    this.chain.get("verificationTokens");

  createUser(user: AdapterUser) {
    this.data?.users.push(user);
    this.write();
  }

  createAccount(account: Account) {
    this.data?.accounts.push(account);
    this.write();
  }

  createSession(session: AdapterSession) {
    this.data?.sessions.push(session);
    this.write();
  }

  createToken(token: VerificationToken) {
    this.data?.verificationTokens.push(token);
    this.write();
  }
}

export function FsAdapter(db: AuthDB): Adapter {
  db.read();

  if (!db.data) {
    db.data = {
      users: [],
      sessions: [],
      verificationTokens: [],
      accounts: [],
    };
    db.write();
  }

  return {
    async createUser(user): Promise<AdapterUser> {
      db.read();
      const id = crypto.randomUUID();
      const newUser = {
        id,
        ...user,
      } as AdapterUser;
      db.createUser(newUser);
      debug.auth("createUser: created user: %O", newUser);
      return newUser;
    },

    async getUser(id): Promise<AdapterUser | null> {
      db.read();
      const user = db.users.find({ id }).value();
      if (user) {
        debug.auth(`getUser: found user (id=${id}): %O`, user);
        return user;
      }
      return null;
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      db.read();
      const user = db.users.find({ email }).value();
      if (user) {
        debug.auth(`getUserByEmail: found user (email=${email}): %O`, user);
        return user;
      }
      return null;
    },

    async getUserByAccount({
      provider,
      providerAccountId,
    }): Promise<AdapterUser | null> {
      db.read();
      const account = db.accounts.find({ provider, providerAccountId }).value();
      if (!account) return null;
      const user = db.users.find({ id: account.userId }).value();
      if (!user) return null;
      debug.auth(`getUserByAccount: found: %O`, { account, user });
      return user;
    },

    async updateUser(user): Promise<AdapterUser> {
      db.read();
      const updatedUser = db.users.find({ id: user.id }).assign(user).value();
      db.write();
      debug.auth(`updateUser: updated user: %O`, updatedUser);
      return updatedUser;
    },

    async linkAccount(account: Account): Promise<Account | null | undefined> {
      db.read();
      db.createAccount(account);
      debug.auth(`linkAccount: linked account: %O`, account);
      return account;
    },

    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<AdapterSession> {
      db.read();
      const id = crypto.randomUUID();
      const newSession = {
        id,
        ...session,
      };
      db.createSession(newSession);

      debug.auth("createSession: created session: %O", newSession);
      return Promise.resolve(newSession);
    },

    async getSessionAndUser(
      sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      db.read();
      const session = db.sessions.find({ sessionToken }).value();
      if (!session) return null;
      session.expires = new Date(session.expires);
      const user = db.users.find({ id: session.userId }).value();
      if (!user) return null;
      debug.auth("getSessionAndUser: found: %O", { session, user });
      return { session, user };
    },

    async updateSession(session): Promise<AdapterSession | null | undefined> {
      db.read();
      const updatedSession = db.sessions
        .find({ sessionToken: session.sessionToken })
        .assign(session)
        .value();
      db.write();
      debug.auth("updateSession: updated session: %O", updatedSession);
      return updatedSession;
    },

    async deleteSession(
      sessionToken: string
    ): Promise<AdapterSession | null | undefined> {
      db.read();
      db.sessions.remove({ sessionToken });
      db.write();

      debug.auth("deleteSession: deleted session: %O", sessionToken);
      return Promise.resolve(null);
    },

    async createVerificationToken(
      verificationToken
    ): Promise<VerificationToken | null | undefined> {
      db.read();
      db.createToken(verificationToken);

      debug.auth(
        "createVerificationToken: created token: %O",
        verificationToken
      );
      return verificationToken;
    },

    async useVerificationToken({
      identifier,
    }): Promise<VerificationToken | null> {
      db.read();
      const token = db.verificationTokens.remove({ identifier }).value()[0];
      db.write();
      debug.auth("useVerificationToken: used token: %O", token);
      return token;
    },
  };
}

export const adapter = FsAdapter(new AuthDB(new JSONFileSync("db/auth.json")));
