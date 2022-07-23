import { chain, ExpChain } from "lodash";
import { JSONFileSync, LowSync, MemorySync, SyncAdapter } from "lowdb";
import { Account } from "next-auth";
import {
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

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

  static createFileSystemDB() {
    return new AuthDB(new JSONFileSync("db/auth.json"));
  }

  static createMemoryDB() {
    return new AuthDB(new MemorySync());
  }

  constructor(adapter: SyncAdapter<Data>) {
    super(adapter);

    this.read();
    if (!this.data) {
      this.data = {
        users: [],
        sessions: [],
        verificationTokens: [],
        accounts: [],
      };
      this.write();
    }
  }

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
