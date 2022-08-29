import { AppDependencies } from "@app/dependencies";
import { AuditLogEntry, AuditLogType } from "@domain/entities/audit-log";
import { ReaderTask } from "fp-ts/lib/ReaderTask";
import { pick } from "lodash";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  auditLogType: AuditLogType;
  auditLogMeta?: Record<string, string>;
}

export const sendEmail =
  (
    params: EmailParams
  ): ReaderTask<AppDependencies, SMTPTransport.SentMessageInfo> =>
  ({ mailer, auditLogRepository }) =>
  async () => {
    const info = await mailer.sendMail(params);
    const meta = {
      to: params.to,
      ...pick(info, ["messageId", "previewUrl"]),
      ...params.auditLogMeta,
    };
    const entry: AuditLogEntry = {
      description: `Email of type ${params.auditLogType} sent to ${params.to}`,
      type: params.auditLogType,
      time: new Date().toISOString(),
      meta: JSON.stringify(meta),
    };
    await auditLogRepository.recordEntry(entry);
    return info;
  };
