import { debug } from "@app/debug";
import {
  AuditLogEntry,
  AuditLogRepository,
  AuditLogType,
} from "@domain/entities/audit-log";
import { AuditLogDB } from "./audit-log-db";

export class LowAuditLogRepository implements AuditLogRepository {
  private readonly db: AuditLogDB;

  constructor(db: AuditLogDB) {
    this.db = db;
  }

  async recordEntry(entry: AuditLogEntry): Promise<AuditLogEntry> {
    this.db.createEntry(entry);
    debug.audit("Created audit log entry: %O", entry);
    return entry;
  }

  async getRecentEntry(
    type: AuditLogType,
    userId?: string
  ): Promise<AuditLogEntry | null> {
    this.db.read();
    const entry = this.db.auditLog
      .filter({ type })
      .filter((entry) => !userId || entry.userId === userId)
      .sortBy((entry) => new Date(entry.time))
      .reverse()
      .value()[0];
    debug.audit("Found entry: %O", entry);
    return entry ?? null;
  }
}
