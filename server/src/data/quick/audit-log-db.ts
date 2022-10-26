import { QuickDbFileAdapter } from "@data/quickdb/adapters/file-adapter";
import { QuickDbMemoryAdapter } from "@data/quickdb/adapters/memory-adapter";
import { QuickDb } from "@data/quickdb/quick-db";
import { QuickDbAdapter, QuickDbStore } from "@data/quickdb/types";
import { AuditLogEntry } from "@domain/entities/audit-log";
import { ExpChain } from "lodash";

type AuditLogSchema = {
  auditLog: AuditLogEntry;
};

type AuditLogStore = QuickDbStore<AuditLogSchema>;

export class AuditLogDB extends QuickDb<AuditLogSchema> {
  get auditLog(): ExpChain<AuditLogStore["auditLog"]> {
    return this.get("auditLog");
  }

  static createFileSystemDB() {
    return new AuditLogDB(new QuickDbFileAdapter("db/audit_log.json"));
  }

  static createMemoryDB() {
    return new AuditLogDB(new QuickDbMemoryAdapter());
  }

  constructor(adapter: QuickDbAdapter<AuditLogSchema>) {
    super({
      adapter,
      initStore() {
        return {
          auditLog: [],
        };
      },
    });
  }

  createEntry(entry: AuditLogEntry) {
    this.read();
    this.auditLog.push(entry).commit();
    this.write();
  }
}
