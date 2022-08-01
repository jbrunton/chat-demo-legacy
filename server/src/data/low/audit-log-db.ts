import { AuditLogEntry } from "@domain/entities/audit-log";
import { chain, ExpChain } from "lodash";
import { JSONFileSync, LowSync, MemorySync, SyncAdapter } from "lowdb";

type Data = {
  auditLog: AuditLogEntry[];
};

export class AuditLogDB extends LowSync<Data> {
  chain: ExpChain<this["data"]> = chain(this).get("data");
  auditLog: ExpChain<Data["auditLog"]> = this.chain.get("auditLog");

  static createFileSystemDB() {
    return new AuditLogDB(new JSONFileSync("db/audit_log.json"));
  }

  static createMemoryDB() {
    return new AuditLogDB(new MemorySync());
  }

  constructor(adapter: SyncAdapter<Data>) {
    super(adapter);

    this.read();
    if (!this.data) {
      this.data = {
        auditLog: [],
      };
      this.write();
    }
  }

  createEntry(entry: AuditLogEntry) {
    this.read();
    this.data?.auditLog.push(entry);
    this.write();
  }
}
