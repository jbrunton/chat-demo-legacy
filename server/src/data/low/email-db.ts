import { chain, ExpChain } from "lodash";
import { JSONFileSync, LowSync, MemorySync, SyncAdapter } from "lowdb";

export type AuthEmail = {
  date: string;
  to: string;
  subject: string;
  verificationUrl: string;
  previewUrl?: string;
};

type Data = {
  emails: AuthEmail[];
};

export class EmailDB extends LowSync<Data> {
  chain: ExpChain<this["data"]> = chain(this).get("data");
  emails: ExpChain<Data["emails"]> = this.chain.get("emails");

  static createFileSystemDB() {
    return new EmailDB(new JSONFileSync("db/emails.json"));
  }

  static createMemoryDB() {
    return new EmailDB(new MemorySync());
  }

  constructor(adapter: SyncAdapter<Data>) {
    super(adapter);

    this.read();
    if (!this.data) {
      this.data = {
        emails: [],
      };
      this.write();
    }
  }

  createEmail(email: AuthEmail) {
    this.read();
    this.data?.emails.push(email);
    this.write();
  }
}
