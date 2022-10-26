import { QuickDbFileAdapter } from "@data/quickdb/adapters/file-adapter";
import { QuickDbMemoryAdapter } from "@data/quickdb/adapters/memory-adapter";
import { QuickDb } from "@data/quickdb/quick-db";
import { QuickDbAdapter, QuickDbStore } from "@data/quickdb/types";
import { ExpChain } from "lodash";
import { Account } from "next-auth";
import {
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

type AuthSchema = {
  users: AdapterUser;
  accounts: Account;
  sessions: AdapterSession;
  verificationTokens: VerificationToken;
};

type AuthStore = QuickDbStore<AuthSchema>;

export class AuthDB extends QuickDb<AuthSchema> {
  get users(): ExpChain<AuthStore["users"]> {
    return this.get("users");
  }

  get accounts(): ExpChain<AuthStore["accounts"]> {
    return this.get("accounts");
  }

  get sessions(): ExpChain<AuthStore["sessions"]> {
    return this.get("sessions");
  }

  get verificationTokens(): ExpChain<AuthStore["verificationTokens"]> {
    return this.get("verificationTokens");
  }

  static createFileSystemDB() {
    return new AuthDB(new QuickDbFileAdapter("db/auth.json"));
  }

  static createMemoryDB() {
    return new AuthDB(new QuickDbMemoryAdapter());
  }

  constructor(adapter: QuickDbAdapter<AuthSchema>) {
    super({
      adapter,
      initStore() {
        return {
          users: [],
          sessions: [],
          verificationTokens: [],
          accounts: [],
        };
      },
    });
  }

  createUser(user: AdapterUser) {
    this.users.push(user).commit();
    this.write();
  }

  createAccount(account: Account) {
    this.accounts.push(account).commit();
    this.write();
  }

  createSession(session: AdapterSession) {
    this.sessions.push(session).commit();
    this.write();
  }

  createToken(token: VerificationToken) {
    this.verificationTokens.push(token).commit();
    this.write();
  }
}
