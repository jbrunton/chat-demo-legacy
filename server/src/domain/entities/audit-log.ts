export type AuditLogType = "verification-request";

export interface AuditLogEntry {
  description: string;
  userId?: string;
  type: AuditLogType;
  time: string;
  meta?: string;
}

export interface AuditLogRepository {
  recordEntry(entry: AuditLogEntry): Promise<AuditLogEntry>;
  getRecentEntry(
    type: AuditLogType,
    userId?: string
  ): Promise<AuditLogEntry | null>;
}
