import { debug } from "@app/debug";
import {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";
import crypto from "crypto";
import { bindMethods } from "@util/bind";
import { AuthDB } from "./auth-db";

export class LowAuthAdapter implements Adapter<true> {
  private readonly db: AuthDB;

  constructor(db: AuthDB) {
    this.db = db;
    // This is required because next-auth doesn't call functions as methods
    bindMethods(this);
  }

  async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
    this.db.read();
    const id = crypto.randomUUID();
    const newUser = {
      id,
      ...user,
    } as AdapterUser;
    this.db.createUser(newUser);
    debug.auth("createUser: created user: %O", newUser);
    return newUser;
  }

  async getUser(id: string): Promise<AdapterUser | null> {
    this.db.read();
    const user = this.db.users.find({ id }).value();
    if (user) {
      debug.auth(`getUser: found user (id=${id}): %O`, user);
      return user;
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<AdapterUser | null> {
    this.db.read();
    const user = this.db.users.find({ email }).value();
    if (user) {
      debug.auth(`getUserByEmail: found user (email=${email}): %O`, user);
      return user;
    }
    return null;
  }

  async getUserByAccount({
    provider,
    providerAccountId,
  }: Pick<
    AdapterAccount,
    "provider" | "providerAccountId"
  >): Promise<AdapterUser | null> {
    this.db.read();
    const account = this.db.accounts
      .find({ provider, providerAccountId })
      .value();
    if (!account) return null;

    const user = this.db.users.find({ id: account.userId }).value();
    if (!user) return null;

    debug.auth(`getUserByAccount: found: %O`, { account, user });
    return user;
  }

  async updateUser(user: Partial<AdapterUser>): Promise<AdapterUser> {
    this.db.read();
    const updatedUser = this.db.users
      .find({ id: user.id })
      .assign(user)
      .value();
    this.db.write();
    debug.auth(`updateUser: updated user: %O`, updatedUser);
    return updatedUser;
  }

  async linkAccount(account: AdapterAccount): Promise<AdapterAccount> {
    this.db.read();
    this.db.createAccount(account);
    debug.auth(`linkAccount: linked account: %O`, account);
    return account;
  }

  async createSession(session: {
    sessionToken: string;
    userId: string;
    expires: Date;
  }): Promise<AdapterSession> {
    this.db.read();
    const id = crypto.randomUUID();
    const newSession = {
      id,
      ...session,
    };
    this.db.createSession(newSession);

    debug.auth("createSession: created session: %O", newSession);
    return newSession;
  }

  async getSessionAndUser(
    sessionToken: string
  ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
    this.db.read();
    const session = this.db.sessions.find({ sessionToken }).value();
    if (!session) return null;
    session.expires = new Date(session.expires);
    const user = this.db.users.find({ id: session.userId }).value();
    if (!user) return null;
    debug.auth("getSessionAndUser: found: %O", { session, user });
    return { session, user };
  }

  async updateSession(
    session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
  ): Promise<AdapterSession | null | undefined> {
    this.db.read();
    const updatedSession = this.db.sessions
      .find({ sessionToken: session.sessionToken })
      .assign(session)
      .value();
    this.db.write();
    debug.auth("updateSession: updated session: %O", updatedSession);
    return updatedSession;
  }

  async deleteSession(
    sessionToken: string
  ): Promise<AdapterSession | null | undefined> {
    this.db.read();
    this.db.sessions.remove({ sessionToken });
    this.db.write();

    debug.auth("deleteSession: deleted session: %O", sessionToken);
    return Promise.resolve(null);
  }

  async createVerificationToken(
    verificationToken: VerificationToken
  ): Promise<VerificationToken | null | undefined> {
    this.db.read();
    this.db.createToken(verificationToken);

    debug.auth("createVerificationToken: created token: %O", verificationToken);
    return verificationToken;
  }

  async useVerificationToken({
    identifier,
  }: {
    identifier: string;
    token: string;
  }): Promise<VerificationToken | null> {
    this.db.read();
    const token = this.db.verificationTokens.remove({ identifier }).value()[0];
    this.db.write();
    debug.auth("useVerificationToken: used token: %O", token);
    return token;
  }
}
